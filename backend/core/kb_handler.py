"""
Knowledge Base Handler for fetching and parsing S3 URLs.
"""
import requests
import json
import csv
import io
from typing import Dict, List, Any


def fetch_kb_content(s3_url: str) -> str:
    """
    Fetch content from an S3 URL.
    
    Args:
        s3_url: S3 URL to fetch from
    
    Returns:
        Raw content as string
    
    Raises:
        requests.HTTPError: If the request fails
    """
    response = requests.get(s3_url)
    response.raise_for_status()
    return response.text


def parse_json_content(content: str) -> str:
    """
    Parse JSON content and format it as a readable string.
    
    Args:
        content: JSON content as string
    
    Returns:
        Formatted JSON string
    """
    try:
        data = json.loads(content)
        return json.dumps(data, indent=2)
    except json.JSONDecodeError:
        return content


def parse_csv_content(content: str) -> str:
    """
    Parse CSV content and format it as a readable string.
    
    Args:
        content: CSV content as string
    
    Returns:
        Formatted CSV string (as markdown table or readable format)
    """
    try:
        csv_reader = csv.DictReader(io.StringIO(content))
        rows = list(csv_reader)
        
        if not rows:
            return content
        
        # Format as a readable string
        formatted_lines = []
        for row in rows:
            row_str = ", ".join([f"{k}: {v}" for k, v in row.items()])
            formatted_lines.append(row_str)
        
        return "\n".join(formatted_lines)
    except Exception:
        return content


def get_kb_content(s3_url: str) -> str:
    """
    Fetch and parse knowledge base content from S3 URL.
    Automatically detects JSON or CSV format.
    
    Args:
        s3_url: S3 URL to fetch from
    
    Returns:
        Parsed and formatted content as string
    """
    content = fetch_kb_content(s3_url)
    
    # Try to detect format by URL extension or content
    if s3_url.endswith('.json'):
        return parse_json_content(content)
    elif s3_url.endswith('.csv'):
        return parse_csv_content(content)
    else:
        # Try JSON first, then CSV
        try:
            return parse_json_content(content)
        except:
            return parse_csv_content(content)


def format_kbs_for_prompt(knowledge_bases: List[Dict[str, Any]]) -> str:
    """
    Format knowledge bases for inclusion in system prompt.
    Fetches content from S3 URLs on each call.
    
    Args:
        knowledge_bases: List of knowledge base dicts with 'url', 'name', 'description', 'id'
    
    Returns:
        Formatted string with KB content
    """
    kb_sections = []
    
    for kb in knowledge_bases:
        kb_id = kb.get('id')
        kb_name = kb.get('name', 'Unknown')
        kb_description = kb.get('description', '')
        kb_url = kb.get('url') or kb.get('s3_url')  # Support both 'url' and 's3_url'
        
        if not kb_url:
            continue
        
        try:
            kb_content = get_kb_content(kb_url)
            kb_section = f"""
Knowledge Base {kb_id}: {kb_name}
Description: {kb_description}
Content:
{kb_content}
"""
            kb_sections.append(kb_section)
        except Exception as e:
            # If fetching fails, include description only
            kb_section = f"""
Knowledge Base {kb_id}: {kb_name}
Description: {kb_description}
(Content unavailable: {str(e)})
"""
            kb_sections.append(kb_section)
    
    return "\n".join(kb_sections)

