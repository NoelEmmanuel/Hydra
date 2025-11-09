"""
GitHub Tool for reading file contents from GitHub repositories.
"""
import requests
import base64
from typing import Dict, Any, Optional


def get_file_contents(owner: str, repo: str, path: str, api_key: str) -> Dict[str, Any]:
    """
    Get file contents from a GitHub repository.
    
    Args:
        owner: Repository owner (username or organization)
        repo: Repository name
        path: File path in the repository
        api_key: GitHub Personal Access Token
    
    Returns:
        Dict with file contents and metadata:
        {
            "content": "<decoded file content>",
            "sha": "<file SHA>",
            "size": <file size>,
            "encoding": "base64",
            "path": "<file path>"
        }
    
    Raises:
        requests.HTTPError: If the API request fails
        ValueError: If file is not found or is a directory
    """
    base_url = "https://api.github.com"
    endpoint = f"/repos/{owner}/{repo}/contents/{path}"
    
    headers = {
        "Accept": "application/vnd.github.v3+json",
        "Authorization": f"Bearer {api_key}",
    }
    
    response = requests.get(f"{base_url}{endpoint}", headers=headers)
    
    # Handle rate limiting
    if response.status_code == 403:
        rate_limit_remaining = response.headers.get("X-RateLimit-Remaining", "unknown")
        rate_limit_reset = response.headers.get("X-RateLimit-Reset", "unknown")
        raise requests.HTTPError(
            f"GitHub API rate limit exceeded. Remaining: {rate_limit_remaining}, "
            f"Resets at: {rate_limit_reset}"
        )
    
    response.raise_for_status()
    data = response.json()
    
    # Check if it's a directory (GitHub returns array for directories)
    if isinstance(data, list):
        raise ValueError(f"Path '{path}' is a directory, not a file")
    
    # Check if content exists
    if "content" not in data:
        raise ValueError(f"File '{path}' not found or is not a file")
    
    # Decode base64 content
    try:
        # GitHub API returns base64-encoded content with newlines, need to remove them
        encoded_content = data["content"].replace("\n", "")
        decoded_content = base64.b64decode(encoded_content).decode("utf-8")
    except Exception as e:
        raise ValueError(f"Failed to decode file content: {str(e)}")
    
    return {
        "content": decoded_content,
        "sha": data.get("sha", ""),
        "size": data.get("size", 0),
        "encoding": data.get("encoding", "base64"),
        "path": data.get("path", path),
        "name": data.get("name", path.split("/")[-1]),
        "type": data.get("type", "file"),
    }

