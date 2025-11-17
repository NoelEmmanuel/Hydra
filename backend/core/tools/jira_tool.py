"""
Jira Tool for creating issues in Jira.
"""
import requests
import base64
from typing import Dict, Any, Optional


def create_issue(
    jira_url: str,
    email: str,
    api_token: str,
    project_key: str,
    summary: str,
    issuetype: str,
    description: Optional[str] = None
) -> Dict[str, Any]:
    """
    Create a Jira issue.
    
    Args:
        jira_url: Jira instance URL (e.g., "https://your-domain.atlassian.net")
        email: Email address for authentication
        api_token: Jira API token
        project_key: Jira project key (e.g., "PROJ")
        summary: Issue summary/title
        issuetype: Issue type name (e.g., "Task", "Bug", "Story")
        description: Optional issue description
    
    Returns:
        Dict with issue details:
        {
            "key": "<issue-key>",
            "id": "<issue-id>",
            "self": "<issue-url>",
            "summary": "<summary>",
            "success": True
        }
    
    Raises:
        requests.HTTPError: If the API request fails
        ValueError: If required fields are missing or invalid
    """
    # Ensure jira_url doesn't have trailing slash
    jira_url = jira_url.rstrip('/')
    endpoint = f"{jira_url}/rest/api/2/issue/"
    
    # Create Basic Auth header
    credentials = f"{email}:{api_token}"
    encoded_credentials = base64.b64encode(credentials.encode()).decode()
    
    headers = {
        "Authorization": f"Basic {encoded_credentials}",
        "Content-Type": "application/json",
        "Accept": "application/json",
    }
    
    # Build request body
    payload = {
        "fields": {
            "project": {
                "key": project_key
            },
            "summary": summary,
            "issuetype": {
                "name": issuetype
            }
        }
    }
    
    # Add description if provided
    if description:
        payload["fields"]["description"] = description
    
    response = requests.post(endpoint, headers=headers, json=payload)
    
    # Handle authentication errors
    if response.status_code == 401:
        raise requests.HTTPError("Jira authentication failed. Check email and API token.")
    
    # Handle validation errors
    if response.status_code == 400:
        error_data = response.json()
        error_messages = error_data.get("errors", {})
        if error_messages:
            error_msg = "; ".join([f"{k}: {v}" for k, v in error_messages.items()])
            raise ValueError(f"Jira validation error: {error_msg}")
        raise ValueError(f"Jira validation error: {response.text}")
    
    response.raise_for_status()
    data = response.json()
    
    return {
        "key": data.get("key", ""),
        "id": data.get("id", ""),
        "self": data.get("self", ""),
        "summary": summary,
        "success": True,
        "url": f"{jira_url}/browse/{data.get('key', '')}"
    }

