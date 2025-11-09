"""
Router for routing queries from core agent to sub-agents.
"""
import json
import re
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
        
        # Call sub-agent LLM and handle tool calls iteratively
        current_prompt = prompt
        conversation_history = []
        
        for iteration in range(max_iterations):
            # Call sub-agent LLM
            response = chat(
                prompt=current_prompt,
                endpoint=endpoint,
                system_prompt=system_prompt,
                max_tokens=2048  # Increased for tool call responses
            )
            
            # Check if response contains a tool call
            tool_call = self._parse_tool_call_from_response(response)
            
            if tool_call:
                # Execute tool call
                tool_result = self._execute_tool_and_format_result(tool_call)
                
                # Add to conversation history
                conversation_history.append(f"Agent: {response}")
                conversation_history.append(f"Tool Result: {tool_result}")
                
                # Create follow-up prompt with tool result
                current_prompt = f"""Previous response: {response}

Tool execution result:
{tool_result}

Please process the tool result and provide your final answer."""
            else:
                # No tool call, return the response
                if conversation_history:
                    # Include conversation history in final response
                    return "\n\n".join(conversation_history) + f"\n\nFinal Answer: {response}"
                return response
        
        # Max iterations reached
        if conversation_history:
            return "\n\n".join(conversation_history) + f"\n\nFinal Response: {response}"
        return response
    
    def _parse_tool_call_from_response(self, response: str) -> Optional[Dict[str, Any]]:
        """
        Parse tool call request from sub-agent response.
        Looks for MCP tool call format in the response.
        
        Args:
            response: Sub-agent response text
        
        Returns:
            Dict with tool call info or None if no tool call detected
        """
        # Try to find JSON tool call in response
        # Pattern: tool call might be in JSON format like:
        # {"tool_id": 1, "action": "get_file_contents", "owner": "...", "repo": "...", "path": "..."}
        # or similar formats
        
        # Look for JSON objects in the response
        json_pattern = r'\{[^{}]*"tool_id"[^{}]*\}'
        matches = re.findall(json_pattern, response, re.DOTALL)
        
        for match in matches:
            try:
                tool_call = json.loads(match)
                if "tool_id" in tool_call:
                    return tool_call
            except:
                continue
        
        # Also check for simpler patterns like "use tool 1" or "call tool with..."
        # For now, we'll rely on JSON format
        
        return None
    
    def _execute_tool_and_format_result(self, tool_call: Dict[str, Any]) -> str:
        """
        Execute a tool call and format the result for inclusion in agent context.
        
        Args:
            tool_call: Tool call dict with tool_id and parameters
        
        Returns:
            Formatted string with tool execution result
        """
        tool_id = tool_call.get('tool_id')
        if not tool_id:
            return "Error: Tool call missing tool_id"
        
        # Execute tool call
        result = handle_mcp_tool_call(tool_id, self.tools, tool_call)
        
        if result.get('success'):
            tool_result = result.get('result', {})
            # Format result nicely for agent
            if isinstance(tool_result, dict):
                if 'content' in tool_result:
                    # GitHub file contents
                    return f"Tool execution successful:\nFile: {tool_result.get('path', 'unknown')}\nContent:\n{tool_result['content']}"
                else:
                    return f"Tool execution successful: {json.dumps(tool_result, indent=2)}"
            else:
                return f"Tool execution successful: {str(tool_result)}"
        else:
            error = result.get('error', 'Unknown error')
            return f"Tool execution failed: {error}"

