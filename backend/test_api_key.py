"""Test script to verify API key loading independently."""

import os
import sys
from pathlib import Path
from dotenv import load_dotenv

# Test .env loading - use relative path from backend directory
_backend_dir = Path(__file__).resolve().parent
_ENV_PATH = _backend_dir / ".env"

print("=" * 60)
print("API Key Loading Test")
print("=" * 60)

# Check if file exists
env_file = Path(_ENV_PATH)
print(f"\n1. Checking .env file:")
print(f"   Path: {_ENV_PATH}")
print(f"   Exists: {env_file.exists()}")

if env_file.exists():
    print(f"   Size: {env_file.stat().st_size} bytes")
    # Read raw content
    with open(env_file, 'rb') as f:
        raw_content = f.read()
    print(f"   Encoding: Checking...")
    
    # Try to read as text
    try:
        with open(env_file, 'r', encoding='utf-8') as f:
            content = f.read()
        print(f"   Read as UTF-8: Success")
        print(f"   Content preview:")
        for line in content.split('\n'):
            if line.strip() and not line.strip().startswith('#'):
                print(f"     {repr(line)}")
    except Exception as e:
        print(f"   Read as UTF-8: Failed - {e}")
        try:
            with open(env_file, 'r', encoding='utf-8-sig') as f:
                content = f.read()
            print(f"   Read as UTF-8-BOM: Success")
        except Exception as e2:
            print(f"   Read as UTF-8-BOM: Failed - {e2}")

# Test load_dotenv
print(f"\n2. Testing load_dotenv:")
found = load_dotenv(_ENV_PATH, override=False)
print(f"   load_dotenv returned: {found}")

# Check environment variables
print(f"\n3. Checking environment variables:")
nvidia_key = os.getenv("NVIDIA_API_KEY")

print(f"   NVIDIA_API_KEY: {'SET' if nvidia_key else 'NOT SET'}")
if nvidia_key:
    print(f"     Length: {len(nvidia_key)}")
    print(f"     Value (first 20 chars): {nvidia_key[:20]}...")
    print(f"     Value (masked): {nvidia_key[:6]}...{nvidia_key[-4:] if len(nvidia_key) >= 4 else ''}")
    print(f"     Has whitespace: {nvidia_key != nvidia_key.strip()}")
    print(f"     Starts with 'nvapi-': {nvidia_key.startswith('nvapi-')}")

# Test OpenAI client initialization
print(f"\n4. Testing OpenAI client initialization:")
api_key = nvidia_key
if api_key:
    try:
        from openai import OpenAI
        client = OpenAI(
            api_key=api_key.strip(),
            base_url="https://integrate.api.nvidia.com/v1"
        )
        print(f"   Client created: Success")
        print(f"   Client API key set: {hasattr(client, 'api_key')}")
        
        # Try a simple test call
        print(f"\n5. Testing API call:")
        try:
            response = client.chat.completions.create(
                model="nvidia/nvidia-nemotron-nano-9b-v2",
                messages=[{"role": "user", "content": "test"}],
                max_tokens=5
            )
            print(f"   API call: SUCCESS")
            print(f"   Response ID: {response.id}")
        except Exception as e:
            print(f"   API call: FAILED")
            print(f"   Error: {type(e).__name__}: {str(e)}")
            if "401" in str(e) or "auth" in str(e).lower():
                print(f"   -> Authentication error detected!")
    except Exception as e:
        print(f"   Client creation: FAILED - {type(e).__name__}: {str(e)}")
else:
    print(f"   Skipped: No API key found")

print("\n" + "=" * 60)
print("Test Complete")
print("=" * 60)

