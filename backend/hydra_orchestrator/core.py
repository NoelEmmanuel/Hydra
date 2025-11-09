"""Main Hydra Orchestrator class."""

from typing import Dict, Any, Optional, Callable
from .state import WorkflowInput, WorkflowState
from .nemotron_client import NemotronClient
from .utils import (
    get_logger,
    validate_workflow_input,
    create_initial_state,
    identify_supervisor_model,
    add_error_to_state
)


class HydraOrchestrator:
    """Main orchestrator that coordinates Trainer, Deployer, and Monitor Head agents."""
    
    def __init__(self, api_key: str = None):
        """
        Initialize Hydra Orchestrator.
        
        Args:
            api_key: NVIDIA API key (optional, reads from NVIDIA_API_KEY env var if not provided)
        """
        self.logger = get_logger(__name__)
        self.nemotron_client = NemotronClient(api_key=api_key)
        
        # Initialize Head agents
        from trainer_head.agent.trainer_agent import TrainerAgent
        from deployment_head.agent.deployer_agent import DeployerAgent
        from monitor_head.agent.monitor_agent import MonitorAgent
        
        self.trainer_agent = TrainerAgent(self.nemotron_client)
        self.deployer_agent = DeployerAgent(self.nemotron_client)
        self.monitor_agent = MonitorAgent(self.nemotron_client)
        
        self.logger.info("Hydra Orchestrator initialized with all Head agents")
    
    def parse_input(self, input_json: Dict[str, Any]) -> WorkflowInput:
        """
        Parse and validate input JSON.
        
        Args:
            input_json: Raw input JSON dict
            
        Returns:
            Validated WorkflowInput
            
        Raises:
            ValueError: If input is invalid
        """
        self.logger.info("Parsing and validating input JSON")
        
        try:
            workflow_input = validate_workflow_input(input_json)
            supervisor = identify_supervisor_model(workflow_input["models"])
            
            if supervisor:
                self.logger.info(f"Identified supervisor model: {supervisor['model_id']}")
                self.logger.info(f"Found {len(workflow_input['models']) - 1} sub-agent models")
            
            return workflow_input
        except Exception as e:
            self.logger.error(f"Input validation failed: {str(e)}")
            raise
    
    async def execute_workflow(
        self, 
        input_json: Dict[str, Any], 
        state_update_callback: Optional[Callable[[WorkflowState], None]] = None
    ) -> WorkflowState:
        """
        Execute the complete workflow: Trainer → Deployer → Monitor.
        
        Args:
            input_json: Input JSON with models, knowledge_bases, tools, prompt
            state_update_callback: Optional callback function(state) to update external state storage
            
        Returns:
            Final WorkflowState with all outputs
        """
        self.logger.info("Starting workflow execution")
        
        try:
            # Parse input
            workflow_input = self.parse_input(input_json)
            state = create_initial_state(workflow_input)
            state["orchestration_metadata"]["current_stage"] = "trainer"
            
            # Update state if callback provided
            if state_update_callback:
                state_update_callback(state.copy())
            
            # Phase 1: Trainer Head
            self.logger.info("Executing Trainer Head...")
            state = await self.trainer_agent.execute(state)
            
            # Update state after trainer phase
            if state_update_callback:
                state_update_callback(state.copy())
            
            if state["orchestration_metadata"]["current_stage"] == "error":
                self.logger.error("Trainer Head failed")
                return state
            
            # Phase 2: Deployer Head
            self.logger.info("Executing Deployer Head...")
            state["orchestration_metadata"]["current_stage"] = "deployer"
            
            # Update state before deployer phase
            if state_update_callback:
                state_update_callback(state.copy())
            
            state = await self.deployer_agent.execute(state)
            
            # Update state after deployer phase
            if state_update_callback:
                state_update_callback(state.copy())
            
            if state["orchestration_metadata"]["current_stage"] == "error":
                self.logger.error("Deployer Head failed")
                return state
            
            # Phase 3: Monitor Head
            self.logger.info("Executing Monitor Head...")
            state["orchestration_metadata"]["current_stage"] = "monitor"
            
            # Update state before monitor phase
            if state_update_callback:
                state_update_callback(state.copy())
            
            state = await self.monitor_agent.execute(state)
            
            # Update state after monitor phase
            if state_update_callback:
                state_update_callback(state.copy())
            
            if state["orchestration_metadata"]["current_stage"] == "error":
                self.logger.error("Monitor Head failed")
                return state
            
            # Workflow completed successfully
            state["orchestration_metadata"]["current_stage"] = "completed"
            self.logger.info("Workflow execution completed successfully")
            
            # Final state update
            if state_update_callback:
                state_update_callback(state.copy())
            
            return state
            
        except Exception as e:
            self.logger.error(f"Workflow execution failed: {str(e)}")
            if 'state' in locals():
                error_state = add_error_to_state(state, str(e))
                if state_update_callback:
                    state_update_callback(error_state.copy())
                return error_state
            else:
                # Create minimal error state
                error_state = WorkflowState(
                    input_config=workflow_input if 'workflow_input' in locals() else {},
                    trainer_outputs={},
                    deployer_outputs={},
                    core_endpoint="",
                    monitor_outputs={},
                    orchestration_metadata={
                        "current_stage": "error",
                        "errors": [str(e)],
                        "conversation_history": []
                    }
                )
                if state_update_callback:
                    state_update_callback(error_state.copy())
                return error_state

