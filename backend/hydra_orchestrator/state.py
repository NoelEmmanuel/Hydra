"""State schema definitions for Hydra Orchestrator workflow."""

from typing import TypedDict, List, Dict, Any, Optional


class ModelConfig(TypedDict):
    """Configuration for a model in the user's agent system."""
    model_id: str
    connected_tools: List[str]  # List of tool IDs
    connected_knowledge_bases: List[str]  # List of KB IDs
    is_supervisor: bool  # True if this is the supervisor/core model


class ToolConfig(TypedDict):
    """Configuration for a tool."""
    tool_id: str
    tool_config: Dict[str, Any]  # Tool-specific configuration


class WorkflowInput(TypedDict):
    """Input JSON structure received by Hydra Orchestrator."""
    models: List[ModelConfig]
    knowledge_bases: Dict[str, Any]  # kb_id -> data
    tools: List[ToolConfig]
    prompt: str  # Main project prompt


class OrchestrationMetadata(TypedDict):
    """Metadata about the orchestration process."""
    current_stage: str  # "trainer", "deployer", "monitor", "completed", "error"
    errors: List[str]  # List of error messages
    conversation_history: List[Dict[str, Any]]  # Conversation history for debugging


class WorkflowState(TypedDict):
    """Complete workflow state passed between agents."""
    input_config: WorkflowInput
    trainer_outputs: Dict[str, str]  # model_id -> trained_model_identifier
    deployer_outputs: Dict[str, str]  # model_id -> endpoint
    core_endpoint: str  # Supervisor model's endpoint
    monitor_outputs: Dict[str, Any]  # dashboard_url, alerts_config
    orchestration_metadata: OrchestrationMetadata

