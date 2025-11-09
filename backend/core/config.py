"""
Configuration module for loading environment variables and constructing BASE_URLs.
"""
import os
from dotenv import load_dotenv

# Hardcoded path to .env file
ENV_FILE_PATH = r"C:\Users\ramgu\OneDrive\Desktop\Hydra\backend\.env"

# Load environment variables with error handling
try:
    result = load_dotenv(ENV_FILE_PATH)
    if not result:
        print(f"Warning: .env file not found or empty at {ENV_FILE_PATH}")
except Exception as e:
    print(f"Error loading .env file: {e}")

# Load endpoint values from environment variables
# These can be full URLs or IP addresses/hostnames
# The URL format will be: http://{endpoint}:8000/v1
ENDPOINT_CORE = os.getenv("ENDPOINT_CORE", "154.54.100.00") # Default is broken for them all intentionally.
ENDPOINT_EVEN = os.getenv("ENDPOINT_EVEN", "154.54.100.00")
ENDPOINT_ODD = os.getenv("ENDPOINT_ODD", "154.54.100.00")

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
            - Full URL: "http://154.54.100.76:8000/v1"
            - IP/hostname: "154.54.100.76"
    
    Returns:
        BASE_URL in format: http://{endpoint}:8000/v1
        If endpoint is already a full URL, returns it as-is (stripped of whitespace)
    """
    # Strip whitespace from endpoint
    endpoint = endpoint.strip()
    
    # Check if endpoint is already a full URL
    if endpoint.startswith("http://") or endpoint.startswith("https://"):
        return endpoint
    
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

