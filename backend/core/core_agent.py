"""
Core Agent for routing queries to appropriate sub-agents.
"""
import json
from typing import Dict, List, Any, Optional
from .llm_client import chat
from .config import ENDPOINT_CORE


CORE_SYSTEM_PROMPT = """Your task is to select the best possible model to accomplish the task you are assigned. Select the appropriate model to use from the following list of models based on their capabilities. Output the id of the model you select as well as a prompt for the model to execute.

You must respond in JSON format with the following structure:
{
    "model_id": <integer id of the selected model>,
    "prompt": "<refined prompt for the selected model>"
}"""


class CoreAgent:
    """Core agent that routes queries to appropriate sub-agents."""
    
    def __init__(self, models: List[Dict[str, Any]], knowledge_bases: List[Dict[str, Any]], tools: List[Dict[str, Any]]):
        """
        Initialize the core agent.
        
        Args:
            models: List of model configurations
            knowledge_bases: List of knowledge base configurations
            tools: List of tool configurations
        """
        self.models = models
        self.knowledge_bases = knowledge_bases
        self.tools = tools
        self.endpoint = ENDPOINT_CORE
    
    def _format_models_context(self) -> str:
        """Format models, knowledge bases, and tools for the system prompt."""
        models_info = []
        for model in self.models:
            model_id = model.get('id')
            model_name = model.get('name', 'Unknown')
            kb_ids = model.get('knowledge_bases', [])
            tool_ids = model.get('tools', [])
            
            # Get KB names
            kb_names = [
                kb.get('name', f'KB {kb_id}') 
                for kb in self.knowledge_bases 
                if kb.get('id') in kb_ids
            ]
            
            # Get tool names
            tool_names = [
                tool.get('name', f'Tool {tool_id}') 
                for tool in self.tools 
                if tool.get('id') in tool_ids
            ]
            
            model_info = f"""
Model ID: {model_id}
Name: {model_name}
Knowledge Bases: {', '.join(kb_names) if kb_names else 'None'}
Tools: {', '.join(tool_names) if tool_names else 'None'}
"""
            models_info.append(model_info)
        
        return "\n".join(models_info)
    
    def route_query(self, user_query: str) -> Dict[str, Any]:
        """
        Route a user query to the appropriate sub-agent.
        
        Args:
            user_query: The user's query
        
        Returns:
            Dict with 'model_id' and 'prompt'
        
        Raises:
            ValueError: If the response cannot be parsed
        """
        # Build system prompt with models context
        models_context = self._format_models_context()
        full_system_prompt = f"{CORE_SYSTEM_PROMPT}\n\nAvailable Models:\n{models_context}"
        
        # Call LLM
        response = chat(
            prompt=user_query,
            endpoint=self.endpoint,
            system_prompt=full_system_prompt,
            max_tokens=512  # More tokens for structured output
        )
        
        # Parse JSON response
        try:
            # Try to extract JSON from response (might have extra text)
            response = response.strip()
            if response.startswith("```json"):
                response = response[7:]
            if response.startswith("```"):
                response = response[3:]
            if response.endswith("```"):
                response = response[:-3]
            response = response.strip()
            
            result = json.loads(response)
            
            # Validate structure
            if "model_id" not in result or "prompt" not in result:
                raise ValueError("Response missing required fields: model_id or prompt")
            
            return result
        except json.JSONDecodeError as e:
            raise ValueError(f"Failed to parse JSON response: {e}\nResponse: {response}")

