# Endpoint Configuration Guide

## .env File Format

Your `backend/.env` file should contain:

```env
ENDPOINT_CORE=your-endpoint-ip-or-hostname
ENDPOINT_EVEN=your-endpoint-ip-or-hostname
ENDPOINT_ODD=your-endpoint-ip-or-hostname
API_KEY=your-api-key
MODEL_NAME=nvidia/NVIDIA-Nemotron-Nano-9B-v2
DEFAULT_MAX_TOKENS=256
```

**Note:** Replace the placeholder values with your actual endpoint IP addresses/hostnames and API key.

## How Endpoints Are Used

Endpoints are now configured and used as plain hostnames or IP addresses. There is no `http://`, port, or `/v1` automatically prepended or appended when storing or reading from the environment variables.

- **Core Agent** uses `ENDPOINT_CORE`
- **Even Model IDs** use `ENDPOINT_EVEN`
- **Odd Model IDs** use `ENDPOINT_ODD`

## Code Structure Example

Your client code now directly receives the endpoint value from the environment variable:

```python
# Get the endpoint value (just the IP or hostname)
endpoint = os.getenv("ENDPOINT_CORE", "")
if not endpoint:
    raise ValueError("ENDPOINT_CORE must be set")
# Use as needed (e.g., pass into another function or build your URL elsewhere)
```

No protocol, port, or path is added at this layer. If needed elsewhere, format it there; the environment variable only holds the bare value.

Both the request structure and response parsing remain unchanged:
- Headers: `Content-Type` and `Authorization: Bearer {API_KEY}`
- JSON body with `model`, `messages`, `max_tokens`
- Response parsing: `resp.json()["choices"][0]["message"]["content"]`

