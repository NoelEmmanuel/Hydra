"""
Configuration module for loading environment variables and constructing BASE_URLs.
"""
import os
from dotenv import load_dotenv

# Path to .env file - use relative path from this file's location
import pathlib
ENV_FILE_PATH = pathlib.Path(__file__).parent.parent / ".env"

# Load environment variables with error handling
# First try to load from explicit path, then fall back to default behavior
try:
    result = load_dotenv(ENV_FILE_PATH)
    if not result:
        # Fall back to default .env loading behavior (current directory)
        load_dotenv()
except Exception as e:
    print(f"Error loading .env file: {e}")
    # Fall back to default .env loading behavior
    load_dotenv()

# Load endpoint values from environment variables
# These can be full URLs or IP addresses/hostnames
# The URL format will be: http://{endpoint}:8000/v1
# These must be set via environment variables
ENDPOINT_CORE = os.getenv("ENDPOINT_CORE", "")
ENDPOINT_EVEN = os.getenv("ENDPOINT_EVEN", "")
ENDPOINT_ODD = os.getenv("ENDPOINT_ODD", "")

# Debug: Print loaded values (remove in production)
if os.getenv("DEBUG_ENDPOINTS", "false").lower() == "true":
    print(f"DEBUG - ENDPOINT_CORE: {ENDPOINT_CORE}")
    print(f"DEBUG - ENDPOINT_EVEN: {ENDPOINT_EVEN}")
    print(f"DEBUG - ENDPOINT_ODD: {ENDPOINT_ODD}")

# API Key for vLLM (dummy-key as mentioned)
API_KEY = os.getenv("API_KEY", "dummy-key")

# Model name
MODEL_NAME = os.getenv("MODEL_NAME", "nvidia/NVIDIA-Nemotron-Nano-9B-v2")

# Default max tokens
DEFAULT_MAX_TOKENS = int(os.getenv("DEFAULT_MAX_TOKENS", "256"))

# Maximum response length (in characters) for refined responses
MAX_RESPONSE_LENGTH = int(os.getenv("MAX_RESPONSE_LENGTH", "2000"))


def get_base_url(endpoint: str) -> str:
    """
    Construct BASE_URL from endpoint value.
    Handles both full URLs and IP addresses/hostnames.
    
    Args:
        endpoint: The endpoint value - can be:
            - Full URL: "http://example.com:8000/v1"
            - IP/hostname: "example.com"
    
    Returns:
        BASE_URL in format: http://{endpoint}:8000/v1
        If endpoint is already a full URL, returns it as-is (stripped of whitespace)
    """
    # Strip whitespace from endpoint
    endpoint = endpoint.strip()
    
    # Check if endpoint is already a full URL
    if endpoint.startswith("http://") or endpoint.startswith("https://"):
        return endpoint
    
    # Validate endpoint is not empty
    if not endpoint:
        raise ValueError("Endpoint must be set via environment variable")
    
    # Otherwise, construct the URL from IP/hostname
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

