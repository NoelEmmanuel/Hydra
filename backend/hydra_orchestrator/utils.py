"""Utility functions for Hydra Orchestrator."""

import logging
from typing import Dict, Any, Optional, List
from .state import WorkflowInput, ModelConfig, WorkflowState


def setup_logging(level: str = "INFO") -> None:
    """Set up logging configuration."""
    logging.basicConfig(
        level=getattr(logging, level.upper()),
        format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
        datefmt="%Y-%m-%d %H:%M:%S"
    )


def get_logger(name: str) -> logging.Logger:
    """Get a logger instance."""
    return logging.getLogger(name)


def identify_supervisor_model(models: List[ModelConfig]) -> Optional[ModelConfig]:
    """
    Identify the supervisor model from the list of models.
    
    Supervisor is identified as:
    - Model with is_supervisor=True, OR
    - Model with empty connected_knowledge_bases and empty connected_tools
    
    Args:
        models: List of model configurations
        
    Returns:
        Supervisor model config, or None if not found
    """
    for model in models:
        if model.get("is_supervisor", False):
            return model
        
        # Check if model has no KBs and no tools (implicit supervisor)
        if (not model.get("connected_knowledge_bases") and 
            not model.get("connected_tools")):
            return model
    
    return None


def get_sub_agent_models(models: List[ModelConfig]) -> List[ModelConfig]:
    """
    Get all models that are NOT the supervisor.
    
    Args:
        models: List of model configurations
        
    Returns:
        List of sub-agent model configs
    """
    supervisor = identify_supervisor_model(models)
    if supervisor is None:
        return models
    
    return [model for model in models if model["model_id"] != supervisor["model_id"]]


def validate_workflow_input(input_data: Dict[str, Any]) -> WorkflowInput:
    """
    Validate and normalize workflow input JSON.
    
    Args:
        input_data: Raw input JSON dict
        
    Returns:
        Validated WorkflowInput
        
    Raises:
        ValueError: If input is invalid
    """
    # Check required fields
    required_fields = ["models", "knowledge_bases", "tools", "prompt"]
    for field in required_fields:
        if field not in input_data:
            raise ValueError(f"Missing required field: {field}")
    
    # Validate models
    if not isinstance(input_data["models"], list) or len(input_data["models"]) == 0:
        raise ValueError("models must be a non-empty list")
    
    # Ensure at least one model has is_supervisor flag or can be identified as supervisor
    models = input_data["models"]
    supervisor = identify_supervisor_model(models)
    if supervisor is None:
        raise ValueError("No supervisor model found. At least one model must have is_supervisor=True or no connected KBs/tools")
    
    # Validate knowledge bases
    if not isinstance(input_data["knowledge_bases"], dict):
        raise ValueError("knowledge_bases must be a dict")
    
    # Validate tools
    if not isinstance(input_data["tools"], list):
        raise ValueError("tools must be a list")
    
    # Validate prompt
    if not isinstance(input_data["prompt"], str) or not input_data["prompt"].strip():
        raise ValueError("prompt must be a non-empty string")
    
    return WorkflowInput(
        models=models,
        knowledge_bases=input_data["knowledge_bases"],
        tools=input_data["tools"],
        prompt=input_data["prompt"]
    )


def create_initial_state(input_config: WorkflowInput) -> WorkflowState:
    """
    Create initial workflow state from input config.
    
    Args:
        input_config: Validated workflow input
        
    Returns:
        Initial WorkflowState
    """
    return WorkflowState(
        input_config=input_config,
        trainer_outputs={},
        deployer_outputs={},
        core_endpoint="",
        monitor_outputs={},
        orchestration_metadata={
            "current_stage": "initialized",
            "errors": [],
            "conversation_history": []
        }
    )


def add_error_to_state(state: WorkflowState, error: str) -> WorkflowState:
    """
    Add an error to the workflow state.
    
    Args:
        state: Current workflow state
        error: Error message to add
        
    Returns:
        Updated workflow state
    """
    errors = state["orchestration_metadata"]["errors"].copy()
    errors.append(error)
    
    new_metadata = state["orchestration_metadata"].copy()
    new_metadata["errors"] = errors
    new_metadata["current_stage"] = "error"
    
    new_state = state.copy()
    new_state["orchestration_metadata"] = new_metadata
    
    return new_state

