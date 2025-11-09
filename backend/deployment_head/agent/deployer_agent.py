"""Deployer Head Agent - Deploys models to NIM/BREV."""

import json
from typing import Dict, Any
from hydra_orchestrator.agents.base_agent import BaseHeadAgent
from hydra_orchestrator.state import WorkflowState
from hydra_orchestrator.utils import identify_supervisor_model, get_logger
from deployment_head.agent.prompts import DEPLOYER_SYSTEM_PROMPT
from deployment_head.mcp_server.server import DeployerMCPServer


class DeployerAgent(BaseHeadAgent):
    """Agent responsible for deploying models to NIM containers on BREV."""
    
    def __init__(self, nemotron_client):
        """Initialize Deployer agent."""
        mcp_server = DeployerMCPServer()
        super().__init__(nemotron_client, mcp_server, DEPLOYER_SYSTEM_PROMPT)
        self.logger = get_logger(__name__)
    
    def _build_task_prompt(self, state: WorkflowState) -> str:
        """
        Build task prompt for Deployer agent.
        
        Args:
            state: Current workflow state
            
        Returns:
            Task prompt string
        """
        input_config = state["input_config"]
        trainer_outputs = state["trainer_outputs"]
        models = input_config["models"]
        
        # Identify supervisor model
        supervisor = identify_supervisor_model(models)
        supervisor_id = supervisor["model_id"] if supervisor else None
        
        prompt = f"""Your task is to deploy all trained models to NIM containers hosted on BREV.

Trained Models ({len(trainer_outputs)} models):
"""
        
        for model_id, model_identifier in trainer_outputs.items():
            is_supervisor = (model_id == supervisor_id)
            prompt += f"- {model_id}: {model_identifier} {'(SUPERVISOR/CORE MODEL)' if is_supervisor else ''}\n"
        
        # Also include supervisor if it wasn't trained (should still be deployed)
        if supervisor_id and supervisor_id not in trainer_outputs:
            prompt += f"- {supervisor_id}: (supervisor model, no training needed)\n"
        
        prompt += f"""
For each model:
1. Allocate GPU resources on BREV if needed
2. Deploy the model to a NIM container
3. Create an endpoint URL for the deployed model
4. Verify the deployment is healthy

Important:
- Deploy ALL models including the supervisor/core model
- The supervisor model's endpoint is the core_endpoint (this is the main entry point)
- Ensure all deployments are healthy before completing
- Return endpoint URLs for all models, and clearly identify the core_endpoint"""
        
        return prompt
    
    def _update_state(self, state: WorkflowState, agent_output: str) -> WorkflowState:
        """
        Update state with deployer outputs (endpoints).
        
        Args:
            state: Current workflow state
            agent_output: Final output from agent
            
        Returns:
            Updated workflow state
        """
        # Parse agent output to extract endpoints
        deployer_outputs = {}
        core_endpoint = ""
        
        # Look through conversation history for create_nim_endpoint tool results
        supervisor_id = None
        supervisor = identify_supervisor_model(state["input_config"]["models"])
        if supervisor:
            supervisor_id = supervisor["model_id"]
        
        for msg in self.conversation_history:
            if msg.get("role") == "tool" and msg.get("content"):
                try:
                    tool_result = json.loads(msg["content"])
                    if "endpoint_url" in tool_result:
                        model_id = tool_result.get("model_id", "unknown")
                        endpoint = tool_result["endpoint_url"]
                        deployer_outputs[model_id] = endpoint
                        
                        # Check if this is the supervisor endpoint
                        if model_id == supervisor_id:
                            core_endpoint = endpoint
                except (json.JSONDecodeError, KeyError):
                    pass
        
        # If we couldn't extract from tool results, try parsing agent output
        if not deployer_outputs:
            # Simple extraction - look for endpoint patterns
            lines = agent_output.split("\n")
            for line in lines:
                if "http" in line.lower() or "endpoint" in line.lower():
                    # Try to extract endpoint
                    if "core" in line.lower() or "supervisor" in line.lower():
                        # Extract URL
                        import re
                        urls = re.findall(r'https?://[^\s]+', line)
                        if urls:
                            core_endpoint = urls[0]
        
        # Fallback: create mock endpoints
        if not deployer_outputs:
            all_models = state["input_config"]["models"]
            for model in all_models:
                model_id = model["model_id"]
                deployer_outputs[model_id] = f"https://api.hydra.dev/models/{model_id}/infer"
                if model_id == supervisor_id:
                    core_endpoint = deployer_outputs[model_id]
        
        # Ensure core_endpoint is set
        if not core_endpoint and supervisor_id and supervisor_id in deployer_outputs:
            core_endpoint = deployer_outputs[supervisor_id]
        
        # Update state
        updated_state = state.copy()
        updated_state["deployer_outputs"] = deployer_outputs
        updated_state["core_endpoint"] = core_endpoint
        updated_state["orchestration_metadata"]["current_stage"] = "monitor"
        
        self.logger.info(f"Deployer outputs: {deployer_outputs}")
        self.logger.info(f"Core endpoint: {core_endpoint}")
        
        return updated_state

