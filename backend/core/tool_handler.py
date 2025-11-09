"""
Tool Handler for formatting tools for MCP and executing API calls.
"""
import requests
import json
from typing import Dict, List, Any, Optional


def format_tool_for_mcp(tool: Dict[str, Any]) -> Dict[str, Any]:
    """
    Format a tool for MCP (Model Context Protocol) capabilities.
    
    Args:
        tool: Tool dict with 'id', 'name', 'description', 'api_url', 'api_key'
    
    Returns:
        MCP-formatted tool definition
    """
    return {
        "name": tool.get("name", f"tool_{tool.get('id')}"),
        "description": tool.get("description", ""),
        "inputSchema": {
            "type": "object",
            "properties": {
                "endpoint": {
                    "type": "string",
                    "description": f"API endpoint: {tool.get('api_url', '')}"
                },
                "method": {
                    "type": "string",
                    "enum": ["GET", "POST", "PUT", "DELETE"],
                    "default": "POST",
                    "description": "HTTP method to use"
                },
                "body": {
                    "type": "object",
                    "description": "Request body (for POST/PUT)"
                }
            },
            "required": ["endpoint"]
        },
        "metadata": {
            "api_url": tool.get("api_url", ""),
            "api_key": tool.get("api_key", ""),
            "tool_id": tool.get("id")
        }
    }


def format_tools_for_prompt(tools: List[Dict[str, Any]]) -> str:
    """
    Format tools for inclusion in system prompt with MCP capabilities.
    
    Args:
        tools: List of tool dicts with 'id', 'name', 'description', 'api_url', 'api_key'
    
    Returns:
        Formatted string with tool descriptions and MCP capabilities
    """
    tool_sections = []
    
    for tool in tools:
        tool_id = tool.get('id')
        tool_name = tool.get('name', 'Unknown')
        tool_description = tool.get('description', '')
        api_url = tool.get('api_url', '')
        
        mcp_tool = format_tool_for_mcp(tool)
        
        tool_section = f"""
Tool {tool_id}: {tool_name}
Description: {tool_description}
API URL: {api_url}
MCP Capability: Available
You can call this tool using the MCP protocol with the following schema:
{json.dumps(mcp_tool['inputSchema'], indent=2)}
"""
        tool_sections.append(tool_section)
    
    return "\n".join(tool_sections)


def execute_tool(
    tool: Dict[str, Any],
    method: str = "POST",
    body: Optional[Dict[str, Any]] = None,
    params: Optional[Dict[str, Any]] = None
) -> Dict[str, Any]:
    """
    Execute a tool API call with authentication.
    
    Args:
        tool: Tool dict with 'api_url' and 'api_key'
        method: HTTP method (GET, POST, PUT, DELETE)
        body: Request body for POST/PUT requests
        params: Query parameters for GET requests
    
    Returns:
        Response from the API call
    
    Raises:
        requests.HTTPError: If the API request fails
    """
    api_url = tool.get('api_url', '')
    api_key = tool.get('api_key', '')
    
    headers = {
        "Content-Type": "application/json",
    }
    
    if api_key:
        headers["Authorization"] = f"Bearer {api_key}"
    
    if method.upper() == "GET":
        response = requests.get(api_url, headers=headers, params=params)
    elif method.upper() == "POST":
        response = requests.post(api_url, headers=headers, json=body, params=params)
    elif method.upper() == "PUT":
        response = requests.put(api_url, headers=headers, json=body, params=params)
    elif method.upper() == "DELETE":
        response = requests.delete(api_url, headers=headers, params=params)
    else:
        raise ValueError(f"Unsupported HTTP method: {method}")
    
    response.raise_for_status()
    
    try:
        return response.json()
    except:
        return {"content": response.text, "status_code": response.status_code}


def handle_mcp_tool_call(
    tool_id: int,
    tools: List[Dict[str, Any]],
    mcp_call: Dict[str, Any]
) -> Dict[str, Any]:
    """
    Handle an MCP tool call request from a sub-agent.
    
    Args:
        tool_id: ID of the tool to execute
        tools: List of available tools
        mcp_call: MCP call parameters with 'method', 'body', 'params'
    
    Returns:
        Result of tool execution
    """
    # Find the tool by ID
    tool = next((t for t in tools if t.get('id') == tool_id), None)
    
    if not tool:
        return {"error": f"Tool with ID {tool_id} not found"}
    
    method = mcp_call.get('method', 'POST')
    body = mcp_call.get('body')
    params = mcp_call.get('params')
    
    try:
        result = execute_tool(tool, method=method, body=body, params=params)
        return {"success": True, "result": result}
    except Exception as e:
        return {"success": False, "error": str(e)}

