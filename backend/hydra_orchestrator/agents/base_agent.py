"""Base Head Agent - Shared logic for all Head agents."""

import json
from typing import Dict, Any, List, Optional
from ..nemotron_client import NemotronClient
from ..state import WorkflowState
from ..utils import get_logger


class BaseHeadAgent:
    """Base class for all Head agents with shared ReAct loop and tool calling logic."""
    
    def __init__(self, nemotron_client: NemotronClient, mcp_server: Any, system_prompt: str):
        """
        Initialize base agent.
        
        Args:
            nemotron_client: Nemotron client instance
            mcp_server: MCP server instance for this Head
            system_prompt: System prompt for this agent
        """
        self.nemotron_client = nemotron_client
        self.mcp_server = mcp_server
        self.system_prompt = system_prompt
        self.logger = get_logger(self.__class__.__name__)
        self.conversation_history: List[Dict[str, str]] = []
    
    async def execute(self, state: WorkflowState) -> WorkflowState:
        """
        Execute the agent's task using ReAct loop.
        
        Args:
            state: Current workflow state
            
        Returns:
            Updated workflow state
        """
        self.logger.info(f"{self.__class__.__name__} starting execution")
        
        try:
            # Build task prompt from state
            task_prompt = self._build_task_prompt(state)
            
            # Initialize conversation
            self.conversation_history = [
                {"role": "system", "content": self.system_prompt},
                {"role": "user", "content": task_prompt}
            ]
            
            # Get tool definitions from MCP server
            tools = self.mcp_server.get_tool_definitions()
            tool_definitions = self._format_tools_for_nemotron(tools)
            
            # ReAct loop
            max_iterations = 10
            iteration = 0
            
            while iteration < max_iterations:
                iteration += 1
                self.logger.info(f"ReAct iteration {iteration}")
                
                # Reason: Get response from Nemotron
                response = self.nemotron_client.chat(
                    messages=self.conversation_history,
                    tools=tool_definitions if tool_definitions else None,
                    tool_choice="auto" if tool_definitions else None
                )
                
                # Extract message and tool calls
                message = response["choices"][0]["message"]
                self.conversation_history.append({
                    "role": message["role"],
                    "content": message.get("content", ""),
                    "tool_calls": message.get("tool_calls", [])
                })
                
                # Check if agent is done (no tool calls)
                if not message.get("tool_calls"):
                    # Agent has finished reasoning, update state
                    final_response = message.get("content", "")
                    updated_state = self._update_state(state, final_response)
                    self.logger.info(f"{self.__class__.__name__} completed successfully")
                    return updated_state
                
                # Act: Execute tool calls
                for tool_call in message.get("tool_calls", []):
                    tool_name = tool_call["function"]["name"]
                    try:
                        arguments = json.loads(tool_call["function"]["arguments"])
                    except json.JSONDecodeError:
                        arguments = {}
                    
                    self.logger.info(f"Executing tool: {tool_name} with args: {arguments}")
                    
                    # Execute tool via MCP server
                    tool_result = self._execute_tool(tool_name, arguments)
                    
                    # Observe: Add tool result to conversation
                    self.conversation_history.append({
                        "role": "tool",
                        "content": json.dumps(tool_result),
                        "tool_call_id": tool_call.get("id")
                    })
            
            # Max iterations reached
            self.logger.warning(f"{self.__class__.__name__} reached max iterations")
            error_state = state.copy()
            error_state["orchestration_metadata"]["current_stage"] = "error"
            error_state["orchestration_metadata"]["errors"].append(
                f"{self.__class__.__name__} exceeded max iterations"
            )
            return error_state
            
        except Exception as e:
            self.logger.error(f"{self.__class__.__name__} execution failed: {str(e)}")
            error_state = state.copy()
            error_state["orchestration_metadata"]["current_stage"] = "error"
            error_state["orchestration_metadata"]["errors"].append(
                f"{self.__class__.__name__} error: {str(e)}"
            )
            return error_state
    
    def _format_tools_for_nemotron(self, tools: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """
        Format MCP tool definitions for Nemotron/OpenAI API.
        
        Args:
            tools: List of tool definitions from MCP server
            
        Returns:
            Formatted tool definitions for OpenAI API
        """
        formatted_tools = []
        for tool in tools:
            formatted_tool = {
                "type": "function",
                "function": {
                    "name": tool["name"],
                    "description": tool["description"],
                    "parameters": tool["input_schema"]
                }
            }
            formatted_tools.append(formatted_tool)
        return formatted_tools
    
    def _execute_tool(self, tool_name: str, arguments: Dict[str, Any]) -> Dict[str, Any]:
        """
        Execute a tool via MCP server.
        
        Args:
            tool_name: Name of the tool to execute
            arguments: Tool arguments
            
        Returns:
            Tool execution result
        """
        try:
            return self.mcp_server.execute_tool(tool_name, arguments)
        except Exception as e:
            self.logger.error(f"Tool execution failed: {tool_name} - {str(e)}")
            return {"error": str(e)}
    
    def _build_task_prompt(self, state: WorkflowState) -> str:
        """
        Build task prompt from workflow state.
        
        Must be implemented by subclasses.
        
        Args:
            state: Current workflow state
            
        Returns:
            Task prompt string
        """
        raise NotImplementedError("Subclasses must implement _build_task_prompt")
    
    def _update_state(self, state: WorkflowState, agent_output: str) -> WorkflowState:
        """
        Update workflow state based on agent output.
        
        Must be implemented by subclasses.
        
        Args:
            state: Current workflow state
            agent_output: Final output from agent
            
        Returns:
            Updated workflow state
        """
        raise NotImplementedError("Subclasses must implement _update_state")

