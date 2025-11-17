"""
Canvas to SystemConfig converter.

Converts frontend canvas_data (nodes and edges) into backend SystemConfig format.
"""
from typing import Dict, Any, List
from collections import defaultdict


def convert_canvas_to_system_config(canvas_data: Dict[str, Any]) -> Dict[str, Any]:
    """
    Convert canvas_data (nodes and edges) to SystemConfig format.
    
    Args:
        canvas_data: Dictionary with 'nodes' and 'edges' keys
        
    Returns:
        SystemConfig dictionary with 'mission', 'models', 'knowledge_bases', 'tools'
        
    Raises:
        ValueError: If canvas_data is invalid or missing required components
    """
    # Validate canvas_data structure
    if not isinstance(canvas_data, dict):
        raise ValueError("canvas_data must be a dictionary")
    
    nodes = canvas_data.get("nodes", [])
    edges = canvas_data.get("edges", [])
    
    if not isinstance(nodes, list):
        raise ValueError("canvas_data.nodes must be a list")
    if not isinstance(edges, list):
        raise ValueError("canvas_data.edges must be a list")
    
    # Find CoreNode to extract mission
    core_nodes = [node for node in nodes if node.get("type") == "core"]
    if not core_nodes:
        raise ValueError("Canvas must contain at least one CoreNode")
    
    # Extract mission from CoreNode's goal field
    mission = core_nodes[0].get("data", {}).get("goal", "")
    if not mission:
        mission = ""  # Allow empty mission
    
    # Separate nodes by type
    model_nodes = [node for node in nodes if node.get("type") == "model"]
    kb_nodes = [node for node in nodes if node.get("type") == "kb"]
    tool_nodes = [node for node in nodes if node.get("type") == "tool"]
    
    # Create mapping from node IDs to sequential integer IDs
    # We'll use sequential IDs starting from 1 for each type
    kb_id_map = {kb_node["id"]: idx + 1 for idx, kb_node in enumerate(kb_nodes)}
    tool_id_map = {tool_node["id"]: idx + 1 for idx, tool_node in enumerate(tool_nodes)}
    model_id_map = {model_node["id"]: idx + 1 for idx, model_node in enumerate(model_nodes)}
    
    # Build knowledge_bases list
    knowledge_bases = []
    for kb_node in kb_nodes:
        kb_data = kb_node.get("data", {})
        kb_name = kb_data.get("name", "Unnamed Knowledge Base")
        kb_url = kb_data.get("link", "")  # URL comes from 'link' field
        kb_description = kb_data.get("description", kb_name)  # Use name as fallback
        
        # Validate KB has required fields
        if not kb_url or not kb_url.strip():
            raise ValueError(f"Knowledge Base '{kb_name}' requires a URL (link field)")
        
        knowledge_bases.append({
            "id": kb_id_map[kb_node["id"]],
            "name": kb_name,
            "url": kb_url.strip(),  # Strip whitespace
            "description": kb_description
        })
    
    # Build tools list
    tools = []
    for tool_node in tool_nodes:
        tool_data = tool_node.get("data", {})
        tool_name = tool_data.get("name", "Unnamed Tool")
        tool_source = tool_data.get("source", "")
        tool_email = None  # Initialize email for all tools
        
        # Set API details for GitHub and Jira based on source
        if tool_source == "github":
            tool_description = "Read file contents from GitHub repositories"
            tool_api_url = "https://api.github.com/"
            tool_api_key = tool_data.get("api_key", "")  # Get from tool_data, empty if not provided
        elif tool_source == "jira":
            tool_description = "Create issues in Jira"
            tool_api_url = tool_data.get("api_url", "")  # Get from tool_data, empty if not provided
            tool_api_key = tool_data.get("api_key", "")  # Get from tool_data, empty if not provided
            tool_email = tool_data.get("email", None)  # Get from tool_data, None if not provided
        else:
            # For other tools, use provided values or fallbacks
            tool_description = tool_data.get("description", tool_name)  # Use name as fallback
            tool_api_key = tool_data.get("api_key", "")  # Empty string if not provided
            tool_api_url = tool_data.get("api_url", "")  # Empty string if not provided
            
            # If api_url is missing, try to derive from source (optional fallback)
            if not tool_api_url:
                # Map common sources to default API URLs (optional fallback)
                source_to_url = {
                    "gmail": "https://gmail.googleapis.com",
                    "slack": "https://slack.com/api",
                    "google-drive": "https://www.googleapis.com/drive/v3"
                }
                tool_api_url = source_to_url.get(tool_source, "")
        
        # Build tool dict - include email only for Jira tools
        tool_dict = {
            "id": tool_id_map[tool_node["id"]],
            "name": tool_name,
            "description": tool_description,
            "api_key": tool_api_key,
            "api_url": tool_api_url
        }
        
        # Add email field for Jira tools
        if tool_email:
            tool_dict["email"] = tool_email
        
        tools.append(tool_dict)
    
    # Build models list with knowledge_bases and tools from edges
    # Create adjacency lists: which KBs/Tools are connected to each model
    # Handle edges in BOTH directions (model->KB and KB->model both mean model has access to KB)
    model_to_kbs = defaultdict(list)
    model_to_tools = defaultdict(list)
    
    print(f"DEBUG: Processing {len(edges)} edges")
    
    for edge in edges:
        source_id = edge.get("source")
        target_id = edge.get("target")
        
        # Find source and target nodes
        source_node = next((n for n in nodes if n.get("id") == source_id), None)
        target_node = next((n for n in nodes if n.get("id") == target_id), None)
        
        if not source_node or not target_node:
            print(f"DEBUG: Skipping edge with invalid nodes: source={source_id}, target={target_id}")
            continue  # Skip invalid edges
        
        source_type = source_node.get("type")
        target_type = target_node.get("type")
        
        # Handle Model <-> KB connections (both directions)
        if source_type == "model" and target_type == "kb":
            # Model -> KB: Model has access to KB
            if target_id not in model_to_kbs[source_id]:
                model_to_kbs[source_id].append(target_id)
                print(f"DEBUG: Connected Model {source_id} -> KB {target_id}")
        elif source_type == "kb" and target_type == "model":
            # KB -> Model: Model has access to KB (reverse direction)
            if source_id not in model_to_kbs[target_id]:
                model_to_kbs[target_id].append(source_id)
                print(f"DEBUG: Connected KB {source_id} -> Model {target_id} (reverse)")
        
        # Handle Model <-> Tool connections (both directions)
        if source_type == "model" and target_type == "tool":
            # Model -> Tool: Model has access to Tool
            if target_id not in model_to_tools[source_id]:
                model_to_tools[source_id].append(target_id)
                print(f"DEBUG: Connected Model {source_id} -> Tool {target_id}")
        elif source_type == "tool" and target_type == "model":
            # Tool -> Model: Model has access to Tool (reverse direction)
            if source_id not in model_to_tools[target_id]:
                model_to_tools[target_id].append(source_id)
                print(f"DEBUG: Connected Tool {source_id} -> Model {target_id} (reverse)")
    
    models = []
    for model_node in model_nodes:
        model_data = model_node.get("data", {})
        model_name = model_data.get("name", "Unnamed Model")
        model_id = model_node["id"]
        
        # Get connected KB IDs (convert from node IDs to sequential IDs)
        connected_kb_node_ids = model_to_kbs.get(model_id, [])
        print(f"DEBUG: Model {model_id} ({model_name}) has KB node IDs: {connected_kb_node_ids}")
        
        connected_kb_ids = [
            kb_id_map[kb_node_id] 
            for kb_node_id in connected_kb_node_ids
            if kb_node_id in kb_id_map
        ]
        print(f"DEBUG: Model {model_id} ({model_name}) mapped to KB IDs: {connected_kb_ids}")
        
        # Get connected tool IDs (convert from node IDs to sequential IDs)
        connected_tool_node_ids = model_to_tools.get(model_id, [])
        connected_tool_ids = [
            tool_id_map[tool_node_id]
            for tool_node_id in connected_tool_node_ids
            if tool_node_id in tool_id_map
        ]
        
        models.append({
            "id": model_id_map[model_id],
            "name": model_name,
            "knowledge_bases": connected_kb_ids,
            "tools": connected_tool_ids
        })
    
    return {
        "mission": mission,
        "models": models,
        "knowledge_bases": knowledge_bases,
        "tools": tools
    }

