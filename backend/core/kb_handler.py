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
        s3_url: S3 URL to fetch from (HTTP/HTTPS URL)
    
    Returns:
        Raw content as string
    
    Raises:
        requests.HTTPError: If the request fails
        ValueError: If URL format is invalid
    """
    # Validate URL format
    if not s3_url.startswith("http://") and not s3_url.startswith("https://"):
        raise ValueError(f"Invalid URL format: {s3_url}. Must be a valid HTTP/HTTPS URL")
    
    print(f"DEBUG: Fetching KB content from: {s3_url}")
    try:
        response = requests.get(s3_url, timeout=30)
        response.raise_for_status()
        content = response.text
        print(f"DEBUG: Successfully fetched {len(content)} characters from {s3_url}")
        return content
    except requests.exceptions.RequestException as e:
        print(f"ERROR: Failed to fetch KB content from {s3_url}: {e}")
        raise


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
    
    if not content or not content.strip():
        print(f"WARNING: Fetched content from {s3_url} is empty")
        return "[Empty content]"
    
    # Try to detect format by URL extension or content
    if s3_url.endswith('.json'):
        parsed = parse_json_content(content)
        if not parsed or not parsed.strip():
            print(f"WARNING: Parsed JSON content from {s3_url} is empty")
            return content  # Return raw content if parsing results in empty
        return parsed
    elif s3_url.endswith('.csv'):
        parsed = parse_csv_content(content)
        if not parsed or not parsed.strip():
            print(f"WARNING: Parsed CSV content from {s3_url} is empty")
            return content  # Return raw content if parsing results in empty
        return parsed
    else:
        # Try JSON first, then CSV
        try:
            parsed = parse_json_content(content)
            if parsed and parsed.strip():
                return parsed
        except Exception as e:
            print(f"DEBUG: JSON parsing failed for {s3_url}: {e}")
        
        try:
            parsed = parse_csv_content(content)
            if parsed and parsed.strip():
                return parsed
        except Exception as e:
            print(f"DEBUG: CSV parsing failed for {s3_url}: {e}")
        
        # If both parsing attempts fail or return empty, return raw content
        print(f"WARNING: Both JSON and CSV parsing failed or returned empty for {s3_url}, returning raw content")
        return content


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
    
    if not knowledge_bases:
        print("DEBUG: format_kbs_for_prompt called with empty knowledge_bases list")
        return ""
    
    print(f"DEBUG: format_kbs_for_prompt processing {len(knowledge_bases)} KB(s)")
    
    for kb in knowledge_bases:
        kb_id = kb.get('id')
        kb_name = kb.get('name', 'Unknown')
        kb_description = kb.get('description', '')
        kb_url = kb.get('url') or kb.get('s3_url')  # Support both 'url' and 's3_url'
        
        print(f"DEBUG: Processing KB {kb_id} ({kb_name}), URL: {kb_url}")
        
        if not kb_url:
            print(f"WARNING: KB {kb_id} ({kb_name}) has no URL, skipping")
            continue
        
        try:
            print(f"DEBUG: Fetching KB content from {kb_url}")
            kb_content = get_kb_content(kb_url)
            print(f"DEBUG: Successfully fetched KB content, length: {len(kb_content)} chars")
            
            if not kb_content or not kb_content.strip():
                print(f"WARNING: KB {kb_id} content is empty after fetch")
                kb_section = f"""
=== KNOWLEDGE BASE {kb_id}: {kb_name} ===
Description: {kb_description}
Source URL: {kb_url}
STATUS: Content is empty or could not be parsed from the URL above.
---
"""
            else:
                # Format KB content clearly - make it obvious this is the actual data
                kb_section = f"""
=== KNOWLEDGE BASE {kb_id}: {kb_name} ===
Description: {kb_description}
Source URL: {kb_url}

ACTUAL DATA CONTENT (already loaded, use this directly):
{kb_content}

END OF KNOWLEDGE BASE {kb_id} CONTENT
---
"""
            kb_sections.append(kb_section)
        except Exception as e:
            # If fetching fails, include description only
            print(f"ERROR: Failed to fetch KB {kb_id} ({kb_name}) from {kb_url}: {str(e)}")
            kb_section = f"""
Knowledge Base {kb_id}: {kb_name}
Description: {kb_description}
S3 URL: {kb_url}
(Content unavailable: {str(e)})
"""
            kb_sections.append(kb_section)
    
    result = "\n".join(kb_sections)
    print(f"DEBUG: format_kbs_for_prompt returning {len(result)} chars")
    return result

