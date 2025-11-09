from fastapi import FastAPI, HTTPException, Body, BackgroundTasks
from typing import Dict, Any
import logging
import uuid
from hydra_orchestrator import HydraOrchestrator
from pydantic import BaseModel
from typing import List, Dict, Any, Optional
from fastapi import Body

# Note: .env loading is handled in hydra_orchestrator.nemotron_client
# No need to load here to avoid conflicts

app = FastAPI(title="Hydra Orchestrator API")
logger = logging.getLogger(__name__)

# Initialize orchestrator
orchestrator = HydraOrchestrator()

# Store workflow states (in production, use a proper database)
workflow_states: Dict[str, Dict[str, Any]] = {}

class ModelConfigIn(BaseModel):
    model_id: str
    connected_tools: List[str]
    connected_knowledge_bases: List[str]
    is_supervisor: bool

class ToolConfigIn(BaseModel):
    tool_id: str
    tool_config: Dict[str, Any]

class WorkflowInputIn(BaseModel):
    models: List[ModelConfigIn]
    knowledge_bases: Dict[str, Any]
    tools: List[ToolConfigIn]
    prompt: str


@app.get("/")
async def read_root():
    """Root endpoint."""
    return {
        "name": "Hydra Orchestrator",
        "version": "0.1.0",
        "description": "Meta-agent system for coordinating Head agents"
    }


async def run_workflow_background(workflow_id: str, input_dict: Dict[str, Any]):
    """
    Background task to execute workflow and update state as it progresses.
    
    Args:
        workflow_id: Unique workflow ID
        input_dict: Workflow input dictionary
    """
    try:
        logger.info(f"Starting background workflow execution for {workflow_id}")
        
        # Create initial state
        from hydra_orchestrator.utils import validate_workflow_input, create_initial_state
        workflow_input = validate_workflow_input(input_dict)
        initial_state = create_initial_state(workflow_input)
        initial_state["orchestration_metadata"]["current_stage"] = "initializing"
        workflow_states[workflow_id] = initial_state
        
        # Create callback to update workflow state
        def update_state(new_state: Dict[str, Any]):
            workflow_states[workflow_id] = new_state
        
        # Execute workflow with state update callback
        state = await orchestrator.execute_workflow(input_dict, state_update_callback=update_state)
        
        # Final state update
        workflow_states[workflow_id] = state
        logger.info(f"Workflow {workflow_id} completed with status: {state['orchestration_metadata']['current_stage']}")
        
    except Exception as e:
        logger.error(f"Background workflow execution failed for {workflow_id}: {str(e)}")
        if workflow_id in workflow_states:
            workflow_states[workflow_id]["orchestration_metadata"]["current_stage"] = "error"
            workflow_states[workflow_id]["orchestration_metadata"]["errors"].append(str(e))
        else:
            # Create error state if it doesn't exist
            workflow_states[workflow_id] = {
                "orchestration_metadata": {
                    "current_stage": "error",
                    "errors": [str(e)],
                    "conversation_history": []
                }
            }


@app.post("/workflow/execute")
async def execute_workflow(
    input_json: WorkflowInputIn = Body(...),
    background_tasks: BackgroundTasks = BackgroundTasks()
) -> Dict[str, Any]:
    """
    Execute a workflow with the provided input JSON.
    
    Returns immediately with a workflow_id. Use /workflow/status/{workflow_id} to check progress.
    
    Input JSON should contain:
    - models: List of model configs
    - knowledge_bases: Dict of knowledge base data
    - tools: List of tool configs
    - prompt: Project prompt string
    """
    try:
        logger.info("Received workflow execution request")
        logger.info(f"Input JSON received: {input_json}")
        
        # Convert Pydantic model to dict for orchestrator
        input_dict = input_json.model_dump()
        
        # Generate workflow ID immediately
        workflow_id = str(uuid.uuid4())
        
        # Start workflow execution in background
        background_tasks.add_task(run_workflow_background, workflow_id, input_dict)
        
        # Return immediately with workflow_id
        return {
            "workflow_id": workflow_id,
            "status": "initializing",
            "message": "Workflow execution started. Use /workflow/status/{workflow_id} to check progress."
        }
    except ValueError as e:
        logger.error(f"Input validation error: {str(e)}")
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error(f"Workflow execution error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Workflow execution failed: {str(e)}")


@app.get("/workflow/status/{workflow_id}")
async def get_workflow_status(workflow_id: str) -> Dict[str, Any]:
    """
    Get the status of a workflow.
    
    Status can be: initializing, trainer, deployer, monitor, completed, error
    
    Args:
        workflow_id: ID of the workflow to check
    """
    if workflow_id not in workflow_states:
        raise HTTPException(status_code=404, detail="Workflow not found")
    
    state = workflow_states[workflow_id]
    current_stage = state["orchestration_metadata"]["current_stage"]
    
    # Calculate progress percentage based on stage
    stage_progress = {
        "initializing": 0,
        "trainer": 33,
        "deployer": 66,
        "monitor": 90,
        "completed": 100,
        "error": 0
    }
    progress = stage_progress.get(current_stage, 0)
    
    return {
        "workflow_id": workflow_id,
        "status": current_stage,
        "progress": progress,
        "trainer_outputs": state.get("trainer_outputs", {}),
        "deployer_outputs": state.get("deployer_outputs", {}),
        "core_endpoint": state.get("core_endpoint", ""),
        "monitor_outputs": state.get("monitor_outputs", {}),
        "errors": state["orchestration_metadata"]["errors"],
        "conversation_history": state["orchestration_metadata"].get("conversation_history", [])
    }


@app.get("/workflow/state/{workflow_id}")
async def get_workflow_state(workflow_id: str) -> Dict[str, Any]:
    """
    Get the complete workflow state.
    
    Args:
        workflow_id: ID of the workflow
    """
    if workflow_id not in workflow_states:
        raise HTTPException(status_code=404, detail="Workflow not found")
    
    return workflow_states[workflow_id]


