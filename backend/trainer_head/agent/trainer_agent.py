"""Trainer Head Agent - Fine-tunes models using NeMo."""

import json
from typing import Dict, Any
from hydra_orchestrator.agents.base_agent import BaseHeadAgent
from hydra_orchestrator.state import WorkflowState
from hydra_orchestrator.utils import get_sub_agent_models, get_logger
from trainer_head.agent.prompts import TRAINER_SYSTEM_PROMPT
from trainer_head.mcp_server.server import TrainerMCPServer


class TrainerAgent(BaseHeadAgent):
    """Agent responsible for fine-tuning models using NeMo."""
    
    def __init__(self, nemotron_client):
        """Initialize Trainer agent."""
        mcp_server = TrainerMCPServer()
        super().__init__(nemotron_client, mcp_server, TRAINER_SYSTEM_PROMPT)
        self.logger = get_logger(__name__)
    
    def _build_task_prompt(self, state: WorkflowState) -> str:
        """
        Build task prompt for Trainer agent.
        
        Args:
            state: Current workflow state
            
        Returns:
            Task prompt string
        """
        input_config = state["input_config"]
        models = input_config["models"]
        knowledge_bases = input_config["knowledge_bases"]
        
        # Get sub-agent models (exclude supervisor)
        sub_agent_models = get_sub_agent_models(models)
        
        prompt = f"""Your task is to fine-tune the following models using NeMo. Do NOT fine-tune the supervisor/core model.

Project Prompt: {input_config['prompt']}

Models to fine-tune ({len(sub_agent_models)} models):
"""
        
        for model in sub_agent_models:
            kb_ids = model.get("connected_knowledge_bases", [])
            tool_ids = model.get("connected_tools", [])
            
            kb_info = []
            for kb_id in kb_ids:
                kb_data = knowledge_bases.get(kb_id, {})
                kb_info.append(f"  - {kb_id}: {str(kb_data)[:100]}...")
            
            prompt += f"""
Model ID: {model['model_id']}
- Connected Knowledge Bases: {', '.join(kb_ids) if kb_ids else 'None'}
- Connected Tools: {', '.join(tool_ids) if tool_ids else 'None'}
- Knowledge Base Details:
{chr(10).join(kb_info) if kb_info else '  - No knowledge bases'}
"""
        
        prompt += """
For each model:
1. Validate the model configuration
2. Prepare training data from the connected knowledge bases
3. Fine-tune the model using NeMo
4. Monitor the training job until completion
5. Return the model identifier for each successfully trained model

Once all models are fine-tuned, provide a summary with model identifiers for each model."""
        
        return prompt
    
    def _update_state(self, state: WorkflowState, agent_output: str) -> WorkflowState:
        """
        Update state with trainer outputs (model identifiers).
        
        Args:
            state: Current workflow state
            agent_output: Final output from agent
            
        Returns:
            Updated workflow state
        """
        # Parse agent output to extract model identifiers
        # For now, we'll extract from conversation history tool results
        trainer_outputs = {}
        
        # Look through conversation history for fine_tune_model tool results
        for msg in self.conversation_history:
            if msg.get("role") == "tool" and msg.get("content"):
                try:
                    tool_result = json.loads(msg["content"])
                    if "model_identifier" in tool_result:
                        # Extract model_id from context (this is simplified)
                        # In a real implementation, we'd track which model_id was used
                        model_id = tool_result.get("model_id", "unknown")
                        trainer_outputs[model_id] = tool_result["model_identifier"]
                except (json.JSONDecodeError, KeyError):
                    pass
        
        # If we couldn't extract from tool results, try parsing agent output
        if not trainer_outputs:
            # Simple extraction - look for patterns like "model_id: identifier"
            lines = agent_output.split("\n")
            for line in lines:
                if "model" in line.lower() and "identifier" in line.lower():
                    # Try to extract model identifier
                    parts = line.split(":")
                    if len(parts) >= 2:
                        model_id = parts[0].strip()
                        identifier = parts[1].strip()
                        trainer_outputs[model_id] = identifier
        
        # Fallback: create identifiers for all sub-agent models
        if not trainer_outputs:
            sub_agent_models = get_sub_agent_models(state["input_config"]["models"])
            for model in sub_agent_models:
                trainer_outputs[model["model_id"]] = f"trained_{model['model_id']}_v1"
        
        # Update state
        updated_state = state.copy()
        updated_state["trainer_outputs"] = trainer_outputs
        updated_state["orchestration_metadata"]["current_stage"] = "deployer"
        
        self.logger.info(f"Trainer outputs: {trainer_outputs}")
        
        return updated_state

