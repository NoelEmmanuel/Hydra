"""
Tool Handler for formatting tools for MCP and executing API calls.
"""
import requests
import json
from typing import Dict, List, Any, Optional
from .tools.github_tool import get_file_contents


def is_github_tool(tool: Dict[str, Any]) -> bool:
    """
    Check if a tool is a GitHub tool.
    
    Args:
        tool: Tool dict
    
    Returns:
        True if tool is GitHub, False otherwise
    """
    api_url = tool.get('api_url', '').lower()
    tool_name = tool.get('name', '').lower()
    return 'github.com' in api_url or 'github' in tool_name


def format_tool_for_mcp(tool: Dict[str, Any]) -> Dict[str, Any]:
    """
    Format a tool for MCP (Model Context Protocol) capabilities.
    
    Args:
        tool: Tool dict with 'id', 'name', 'description', 'api_url', 'api_key'
    
    Returns:
        MCP-formatted tool definition
    """
    # GitHub tools have special schema
    if is_github_tool(tool):
        return {
            "name": tool.get("name", f"tool_{tool.get('id')}"),
            "description": tool.get("description", ""),
            "inputSchema": {
                "type": "object",
                "properties": {
                    "action": {
                        "type": "string",
                        "enum": ["get_file_contents"],
                        "default": "get_file_contents",
                        "description": "GitHub action to perform"
                    },
                    "owner": {
                        "type": "string",
                        "description": "Repository owner (username or organization)"
                    },
                    "repo": {
                        "type": "string",
                        "description": "Repository name"
                    },
                    "path": {
                        "type": "string",
                        "description": "File path in the repository (e.g., 'src/main.py' or 'README.md')"
                    }
                },
                "required": ["action", "owner", "repo", "path"]
            },
            "metadata": {
                "api_url": tool.get("api_url", ""),
                "api_key": tool.get("api_key", ""),
                "tool_id": tool.get("id"),
                "tool_type": "github"
            }
        }
    
    # Generic tool schema
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


def execute_github_file_contents(
    tool: Dict[str, Any],
    owner: str,
    repo: str,
    path: str
) -> Dict[str, Any]:
    """
    Execute GitHub file contents API call.
    
    Args:
        tool: Tool dict with 'api_key'
        owner: Repository owner
        repo: Repository name
        path: File path
    
    Returns:
        Dict with file contents and metadata
    """
    api_key = tool.get('api_key', '')
    if not api_key:
        raise ValueError("GitHub tool requires api_key")
    
    try:
        result = get_file_contents(owner, repo, path, api_key)
        return {
            "success": True,
            "result": result
        }
    except requests.HTTPError as e:
        # Handle rate limiting specifically
        if e.response and e.response.status_code == 403:
            return {
                "success": False,
                "error": f"GitHub API rate limit exceeded: {str(e)}"
            }
        return {
            "success": False,
            "error": f"GitHub API error: {str(e)}"
        }
    except Exception as e:
        return {
            "success": False,
            "error": f"Error getting file contents: {str(e)}"
        }


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
        mcp_call: MCP call parameters (varies by tool type)
    
    Returns:
        Result of tool execution
    """
    # Find the tool by ID
    tool = next((t for t in tools if t.get('id') == tool_id), None)
    
    if not tool:
        return {"error": f"Tool with ID {tool_id} not found"}
    
    # Handle GitHub tools
    if is_github_tool(tool):
        action = mcp_call.get('action', 'get_file_contents')
        if action == 'get_file_contents':
            owner = mcp_call.get('owner')
            repo = mcp_call.get('repo')
            path = mcp_call.get('path')
            
            if not owner or not repo or not path:
                return {
                    "success": False,
                    "error": "GitHub get_file_contents requires 'owner', 'repo', and 'path' parameters"
                }
            
            return execute_github_file_contents(tool, owner, repo, path)
        else:
            return {
                "success": False,
                "error": f"Unknown GitHub action: {action}"
            }
    
    # Handle generic tools
    method = mcp_call.get('method', 'POST')
    body = mcp_call.get('body')
    params = mcp_call.get('params')
    
    try:
        result = execute_tool(tool, method=method, body=body, params=params)
        return {"success": True, "result": result}
    except Exception as e:
        return {"success": False, "error": str(e)}

