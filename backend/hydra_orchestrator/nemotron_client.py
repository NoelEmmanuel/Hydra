"""Nemotron client wrapper for NVIDIA API."""

import os
from typing import List, Dict, Any, Optional
from pathlib import Path
from openai import OpenAI
from dotenv import load_dotenv
from .utils import get_logger

# Hard-code .env load to backend/.env (absolute path)
_backend_dir = Path(__file__).resolve().parent.parent
_ENV_PATH = _backend_dir / ".env"
_FOUND_ENV = load_dotenv(_ENV_PATH, override=False)

# Debug: Log .env loading immediately
import logging
_temp_logger = logging.getLogger(__name__)
_temp_logger.info(f"[DEBUG] Attempting to load .env from: {_ENV_PATH}")
_temp_logger.info(f"[DEBUG] .env file exists: {_ENV_PATH.exists()}")
_temp_logger.info(f"[DEBUG] load_dotenv returned: {_FOUND_ENV}")
if _FOUND_ENV:
    _temp_logger.info(f"[DEBUG] After load_dotenv, NVIDIA_API_KEY exists: {os.getenv('NVIDIA_API_KEY') is not None}")

class NemotronClient:
    """Client for interacting with Nemotron models via NVIDIA API."""
    
    def __init__(self, api_key: Optional[str] = None):
        """
        Initialize Nemotron client.
        
        Args:
            api_key: NVIDIA API key. If None, reads from NVIDIA_API_KEY env var.
        """
        self.logger = get_logger(__name__)
        
        # Log .env loading status for debugging
        if _FOUND_ENV:
            self.logger.info(f"Loaded .env from: {_ENV_PATH}")
        else:
            self.logger.warning(f"Could not load .env from: {_ENV_PATH}. Trying environment variables directly.")
        
        # Only check for NVIDIA_API_KEY from backend/.env
        nvidia_key = os.getenv("NVIDIA_API_KEY")
        
        self.logger.info(f"[DEBUG] NVIDIA_API_KEY from env: {'SET' if nvidia_key else 'NOT SET'}")
        
        if nvidia_key:
            self.logger.info(f"[DEBUG] NVIDIA_API_KEY length: {len(nvidia_key)}, prefix: {nvidia_key[:7] if len(nvidia_key) >= 7 else 'N/A'}")
        
        # Use NVIDIA_API_KEY exclusively
        self.api_key = api_key or nvidia_key
        
        # Debug: Log API key details
        if self.api_key:
            key_length = len(self.api_key)
            key_prefix = self.api_key[:10] if key_length >= 10 else self.api_key
            key_suffix = self.api_key[-4:] if key_length >= 4 else ""
            masked_key = f"{key_prefix[:6]}...{key_suffix}" if key_length > 10 else "***"
            self.logger.info(f"[DEBUG] API key found - Length: {key_length}, Masked: {masked_key}, Is whitespace: {self.api_key.strip() == ''}")
        else:
            self.logger.error("[DEBUG] API key is None or empty!")
        
        if not self.api_key or (isinstance(self.api_key, str) and self.api_key.strip() == ""):
            error_msg = (
                f"NVIDIA API key not provided. Set NVIDIA_API_KEY in backend/.env file.\n"
                f"Expected .env file at: {_ENV_PATH}\n"
                f".env file exists: {_ENV_PATH.exists()}\n"
                f"NVIDIA_API_KEY env var: {'SET' if nvidia_key else 'NOT SET'}"
            )
            self.logger.error(error_msg)
            raise ValueError(error_msg)
        
        # Strip whitespace from API key
        self.api_key = self.api_key.strip()
        
        # Log API key type detection
        if self.api_key.startswith("nvapi-"):
            self.logger.info("[DEBUG] Detected NVIDIA API key format (nvapi-...)")
        else:
            self.logger.info(f"[DEBUG] API key format: {self.api_key[:7]}...")
        
        # NVIDIA API configuration
        # Model is hard-coded to nvidia/nvidia-nemotron-nano-9b-v2 (exclusive model)
        self.model = "nvidia/nvidia-nemotron-nano-9b-v2"
        self.logger.info(f"[DEBUG] Using model: {self.model}")
        
        # NVIDIA API base URL (OpenAI-compatible endpoint)
        # OpenAI client adds /chat/completions to base_url, so base_url should include /v1
        # Full URL will be: https://integrate.api.nvidia.com/v1/chat/completions
        self.base_url = "https://integrate.api.nvidia.com/v1"

        default_headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json",
        }
        
        # Masked key logging for diagnostics
        key_type = "NVIDIA (nvapi-****)" if self.api_key.startswith("nvapi-") else "API key"
        self.logger.info(f"NVIDIA API key detected: {key_type}; env file loaded: {_FOUND_ENV}")
        self.logger.info(f"[DEBUG] Using NVIDIA API endpoint: {self.base_url}")
        self.logger.info(f"[DEBUG] Model: {self.model}")
        self.logger.info(f"[DEBUG] Authorization header set: Bearer {self.api_key[:10]}...")
        
        self.client = OpenAI(
            api_key=self.api_key,
            base_url=self.base_url,
            default_headers=default_headers,
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
        Send chat completion request to Nemotron via NVIDIA API.
        
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
            # Debug: Log request details
            self.logger.info(f"[DEBUG] Making API call to: {self.base_url}")
            self.logger.info(f"[DEBUG] Model: {self.model}")
            self.logger.info(f"[DEBUG] API key present: {bool(self.api_key)}")
            self.logger.info(f"[DEBUG] API key length: {len(self.api_key) if self.api_key else 0}")
            
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
            
            self.logger.info(f"[DEBUG] Request kwargs keys: {list(kwargs.keys())}")
            
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
            # Enhanced error logging
            error_type = type(e).__name__
            error_msg = str(e)
            
            # Extract URL from exception if available
            full_url = f"{self.base_url}/chat/completions"
            if hasattr(e, 'response') and hasattr(e.response, 'url'):
                full_url = str(e.response.url)
            elif hasattr(e, 'request') and hasattr(e.request, 'url'):
                full_url = str(e.request.url)
            
            self.logger.error(f"[DEBUG] API call failed - Type: {error_type}, Message: {error_msg}")
            self.logger.error(f"[DEBUG] Full URL attempted: {full_url}")
            self.logger.error(f"[DEBUG] Base URL: {self.base_url}")
            self.logger.error(f"[DEBUG] Model: {self.model}")
            
            # Check for 404 errors specifically
            if "404" in error_msg or "not found" in error_msg.lower() or "page not found" in error_msg.lower():
                self.logger.error(f"[DEBUG] 404 Not Found error detected!")
                self.logger.error(f"[DEBUG] This usually means:")
                self.logger.error(f"[DEBUG]   1. The endpoint URL is incorrect: {full_url}")
                self.logger.error(f"[DEBUG]   2. The model name '{self.model}' doesn't exist on NVIDIA API")
                self.logger.error(f"[DEBUG]   3. The API endpoint structure has changed")
                self.logger.error(f"[DEBUG] Try checking NVIDIA API documentation for correct endpoint and available models")
            
            # Check if it's an authentication error
            if "401" in error_msg or "auth" in error_msg.lower() or "unauthorized" in error_msg.lower():
                self.logger.error(f"[DEBUG] Authentication error detected!")
                self.logger.error(f"[DEBUG] API key present: {bool(self.api_key)}")
                self.logger.error(f"[DEBUG] API key length: {len(self.api_key) if self.api_key else 0}")
                self.logger.error(f"[DEBUG] API key prefix: {self.api_key[:7] if self.api_key and len(self.api_key) >= 7 else 'N/A'}")
                self.logger.error(f"[DEBUG] Client API key attribute: {hasattr(self.client, 'api_key')}")
                if hasattr(self.client, 'api_key'):
                    self.logger.error(f"[DEBUG] Client API key: {'SET' if self.client.api_key else 'NOT SET'}")
                self.logger.error(f"[DEBUG] Make sure your NVIDIA_API_KEY is valid and has access to the model: {self.model}")
            
            # Log full exception details
            import traceback
            self.logger.error(f"[DEBUG] Full traceback:\n{traceback.format_exc()}")
            
            raise Exception(f"NVIDIA API call failed: {str(e)}") from e

