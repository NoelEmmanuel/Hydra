"""Nemotron client wrapper for OpenRouter API."""

import os
from typing import List, Dict, Any, Optional
from openai import OpenAI
from dotenv import load_dotenv

load_dotenv()


class NemotronClient:
    """Client for interacting with Nemotron-nano-9b-v2 via OpenRouter API."""
    
    def __init__(self, api_key: Optional[str] = None):
        """
        Initialize Nemotron client.
        
        Args:
            api_key: OpenRouter API key. If None, reads from OPENROUTER_API_KEY env var.
        """
        self.api_key = api_key or os.getenv("OPENROUTER_API_KEY")
        if not self.api_key:
            raise ValueError("OpenRouter API key not provided. Set OPENROUTER_API_KEY environment variable.")
        
        self.model = "nemotron-nano-9b-v2"
        self.base_url = "https://openrouter.ai/api/v1"
        
        self.client = OpenAI(
            api_key=self.api_key,
            base_url=self.base_url
        )
    
    def chat(
        self,
        messages: List[Dict[str, str]],
        tools: Optional[List[Dict[str, Any]]] = None,
        tool_choice: Optional[str] = None,
        temperature: float = 0.7,
        max_tokens: Optional[int] = None
    ) -> Dict[str, Any]:
        """
        Send chat completion request to Nemotron.
        
        Args:
            messages: List of message dicts with 'role' and 'content' keys
            tools: Optional list of tool definitions for function calling
            tool_choice: Optional tool choice mode ("auto", "none", or tool name)
            temperature: Sampling temperature
            max_tokens: Maximum tokens to generate
            
        Returns:
            Response dict with 'choices', 'usage', etc.
            
        Raises:
            Exception: If API call fails
        """
        try:
            kwargs = {
                "model": self.model,
                "messages": messages,
                "temperature": temperature,
            }
            
            if tools:
                kwargs["tools"] = tools
            if tool_choice:
                kwargs["tool_choice"] = tool_choice
            if max_tokens:
                kwargs["max_tokens"] = max_tokens
            
            response = self.client.chat.completions.create(**kwargs)
            
            return {
                "id": response.id,
                "choices": [
                    {
                        "index": choice.index,
                        "message": {
                            "role": choice.message.role,
                            "content": choice.message.content,
                            "tool_calls": [
                                {
                                    "id": tc.id,
                                    "type": tc.type,
                                    "function": {
                                        "name": tc.function.name,
                                        "arguments": tc.function.arguments
                                    }
                                }
                                for tc in (choice.message.tool_calls or [])
                            ]
                        },
                        "finish_reason": choice.finish_reason
                    }
                    for choice in response.choices
                ],
                "usage": {
                    "prompt_tokens": response.usage.prompt_tokens,
                    "completion_tokens": response.usage.completion_tokens,
                    "total_tokens": response.usage.total_tokens
                }
            }
        except Exception as e:
            raise Exception(f"Nemotron API call failed: {str(e)}") from e

