"""
LLM Client wrapper for vLLM endpoints.
"""
import requests
from typing import Optional
from .config import API_KEY, MODEL_NAME, DEFAULT_MAX_TOKENS, get_base_url


def chat(
    prompt: str,
    endpoint: str,
    system_prompt: Optional[str] = None,
    max_tokens: int = DEFAULT_MAX_TOKENS,
    model: str = MODEL_NAME,
) -> str:
    """
    Send a chat completion request to the vLLM endpoint.
    
    Args:
        prompt: User prompt/message
        endpoint: Endpoint value (CORE, EVEN, ODD, or numeric value)
        system_prompt: Optional system prompt
        max_tokens: Maximum tokens to generate
        model: Model name to use
    
    Returns:
        Response content from the LLM
    
    Raises:
        requests.HTTPError: If the API request fails
    """
    base_url = get_base_url(endpoint)
    
    # Ensure base_url doesn't have trailing slash before appending path
    base_url = base_url.rstrip('/')
    
    messages = []
    if system_prompt:
        messages.append({"role": "system", "content": system_prompt})
    messages.append({"role": "user", "content": prompt})
    
    resp = requests.post(
        f"{base_url}/chat/completions",
        headers={
            "Content-Type": "application/json",
            "Authorization": f"Bearer {API_KEY}",
        },
        json={
            "model": model,
            "messages": messages,
            "max_tokens": max_tokens,
        },
    )
    resp.raise_for_status()
    return resp.json()["choices"][0]["message"]["content"]

