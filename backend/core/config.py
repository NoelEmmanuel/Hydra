"""
Configuration module for loading environment variables and constructing BASE_URLs.
"""
import os
from dotenv import load_dotenv

load_dotenv()

# Load endpoint values from environment variables
ENDPOINT_CORE = os.getenv("ENDPOINT_CORE", "1")
ENDPOINT_EVEN = os.getenv("ENDPOINT_EVEN", "2")
ENDPOINT_ODD = os.getenv("ENDPOINT_ODD", "3")

# API Key for vLLM (dummy-key as mentioned)
API_KEY = os.getenv("API_KEY", "dummy-key")

# Model name
MODEL_NAME = os.getenv("MODEL_NAME", "nvidia/NVIDIA-Nemotron-Nano-9B-v2")

# Default max tokens
DEFAULT_MAX_TOKENS = int(os.getenv("DEFAULT_MAX_TOKENS", "256"))


def get_base_url(endpoint: str) -> str:
    """
    Construct BASE_URL from endpoint value.
    
    Args:
        endpoint: The endpoint value (CORE, EVEN, ODD, or numeric value)
    
    Returns:
        BASE_URL in format: http://{endpoint}:8000/v1
    """
    return f"http://{endpoint}:8000/v1"


def get_core_url() -> str:
    """Get BASE_URL for core agent."""
    return get_base_url(ENDPOINT_CORE)


def get_even_url() -> str:
    """Get BASE_URL for even model IDs."""
    return get_base_url(ENDPOINT_EVEN)


def get_odd_url() -> str:
    """Get BASE_URL for odd model IDs."""
    return get_base_url(ENDPOINT_ODD)

