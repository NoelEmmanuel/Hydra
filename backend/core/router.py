"""
Router for routing queries from core agent to sub-agents.
"""
from typing import Dict, List, Any, Optional
from .llm_client import chat
from .config import ENDPOINT_EVEN, ENDPOINT_ODD
from .kb_handler import format_kbs_for_prompt
from .tool_handler import format_tools_for_prompt, handle_mcp_tool_call


class Router:
    """Router that routes queries to appropriate sub-agents based on model_id."""
    
    def __init__(self, models: List[Dict[str, Any]], knowledge_bases: List[Dict[str, Any]], tools: List[Dict[str, Any]]):
        """
        Initialize the router.
        
        Args:
            models: List of model configurations
            knowledge_bases: List of knowledge base configurations
            tools: List of tool configurations
        """
        self.models = models
        self.knowledge_bases = knowledge_bases
        self.tools = tools
    
    def _get_model_by_id(self, model_id: int) -> Optional[Dict[str, Any]]:
        """Get model configuration by ID."""
        return next((m for m in self.models if m.get('id') == model_id), None)
    
    def _get_endpoint_for_model_id(self, model_id: int) -> str:
        """
        Determine endpoint based on model_id.
        Even IDs use ENDPOINT_EVEN, odd IDs use ENDPOINT_ODD.
        """
        if model_id % 2 == 0:
            return ENDPOINT_EVEN
        else:
            return ENDPOINT_ODD
    
    def _get_kbs_for_model(self, model: Dict[str, Any]) -> List[Dict[str, Any]]:
        """Get knowledge bases assigned to a model."""
        kb_ids = model.get('knowledge_bases', [])
        return [kb for kb in self.knowledge_bases if kb.get('id') in kb_ids]
    
    def _get_tools_for_model(self, model: Dict[str, Any]) -> List[Dict[str, Any]]:
        """Get tools assigned to a model."""
        tool_ids = model.get('tools', [])
        return [tool for tool in self.tools if tool.get('id') in tool_ids]
    
    def route_to_sub_agent(
        self,
        model_id: int,
        prompt: str,
        max_iterations: int = 3
    ) -> str:
        """
        Route a query to a sub-agent and return the result.
        
        Args:
            model_id: ID of the model to route to
            prompt: Prompt from core agent
            max_iterations: Maximum number of tool call iterations
        
        Returns:
            Text response from sub-agent
        """
        # Get model configuration
        model = self._get_model_by_id(model_id)
        if not model:
            return f"Error: Model with ID {model_id} not found"
        
        # Determine endpoint
        endpoint = self._get_endpoint_for_model_id(model_id)
        
        # Get KBs and tools for this model
        model_kbs = self._get_kbs_for_model(model)
        model_tools = self._get_tools_for_model(model)
        
        # Fetch KB content (on each query)
        kb_content = format_kbs_for_prompt(model_kbs)
        
        # Format tools for MCP
        tool_content = format_tools_for_prompt(model_tools)
        
        # Build system prompt
        system_prompt = f"""You are a specialized AI agent with access to the following knowledge bases and tools.

Knowledge Bases:
{kb_content}

Available Tools:
{tool_content}

You can use tools by requesting them through MCP (Model Context Protocol) capabilities. When you need to use a tool, indicate it in your response.

Your task: {prompt}"""
        
        # Call sub-agent LLM
        response = chat(
            prompt=prompt,
            endpoint=endpoint,
            system_prompt=system_prompt,
            max_tokens=1024
        )
        
        # TODO: Handle tool calls if sub-agent requests them
        # For now, return the response directly
        # In a full implementation, we would parse the response for tool calls,
        # execute them, and potentially make follow-up LLM calls
        
        return response

