from fastapi import FastAPI, HTTPException
from typing import Dict, Any
import logging
from hydra_orchestrator import HydraOrchestrator

app = FastAPI(title="Hydra Orchestrator API")
logger = logging.getLogger(__name__)

# Initialize orchestrator
orchestrator = HydraOrchestrator()

# Store workflow states (in production, use a proper database)
workflow_states: Dict[str, Dict[str, Any]] = {}


@app.get("/")
async def read_root():
    """Root endpoint."""
    return {
        "name": "Hydra Orchestrator",
        "version": "0.1.0",
        "description": "Meta-agent system for coordinating Head agents"
    }


@app.post("/workflow/execute")
async def execute_workflow(input_json: Dict[str, Any]) -> Dict[str, Any]:
    """
    Execute a workflow with the provided input JSON.
    
    Input JSON should contain:
    - models: List of model configs
    - knowledge_bases: Dict of knowledge base data
    - tools: List of tool configs
    - prompt: Project prompt string
    """
    try:
        logger.info("Received workflow execution request")
        
        # Execute workflow
        state = await orchestrator.execute_workflow(input_json)
        
        # Generate workflow ID (simple implementation)
        import uuid
        workflow_id = str(uuid.uuid4())
        workflow_states[workflow_id] = state
        
        # Return response
        return {
            "workflow_id": workflow_id,
            "status": state["orchestration_metadata"]["current_stage"],
            "core_endpoint": state.get("core_endpoint", ""),
            "dashboard_url": state.get("monitor_outputs", {}).get("dashboard_url", ""),
            "errors": state["orchestration_metadata"]["errors"]
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
    
    Args:
        workflow_id: ID of the workflow to check
    """
    if workflow_id not in workflow_states:
        raise HTTPException(status_code=404, detail="Workflow not found")
    
    state = workflow_states[workflow_id]
    
    return {
        "workflow_id": workflow_id,
        "status": state["orchestration_metadata"]["current_stage"],
        "trainer_outputs": state.get("trainer_outputs", {}),
        "deployer_outputs": state.get("deployer_outputs", {}),
        "core_endpoint": state.get("core_endpoint", ""),
        "monitor_outputs": state.get("monitor_outputs", {}),
        "errors": state["orchestration_metadata"]["errors"]
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


