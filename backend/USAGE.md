# Multi-Agent System Usage Guide

## Setup

### 1. Install Dependencies

```bash
cd backend
pip install -e .
# or
uv pip install -e .
```

### 2. Configure Environment Variables (Optional)

Create a `.env` file in the `backend/` directory:

```env
ENDPOINT_CORE=1
ENDPOINT_EVEN=2
ENDPOINT_ODD=3
API_KEY=dummy-key
MODEL_NAME=nvidia/NVIDIA-Nemotron-Nano-9B-v2
DEFAULT_MAX_TOKENS=256
```

**Note:** If you don't create `.env`, the system will use defaults (1, 2, 3 for endpoints).

### 3. Start the Server

```bash
cd backend
uvicorn main:app --reload
```

The server will start on `http://localhost:8000` (default FastAPI port).

## How It Works

### System Architecture Flow

```
User Query
    ↓
POST /api/systems/{system_id}/chat
    ↓
System Manager
    ↓
Core Agent (ENDPOINT_CORE)
    ├─ Receives: User query + list of models/KBs/tools
    ├─ Uses: Fixed routing prompt
    └─ Returns: {"model_id": X, "prompt": "..."}
    ↓
Router
    ├─ Determines endpoint: EVEN (if model_id even) or ODD (if model_id odd)
    ├─ Fetches KB content from S3 URLs (on each query)
    ├─ Formats tools for MCP
    └─ Calls sub-agent LLM
    ↓
Sub-Agent (ENDPOINT_EVEN or ENDPOINT_ODD)
    ├─ Receives: Refined prompt + KB content + tool descriptions
    └─ Returns: Text response
    ↓
User receives response
```

## API Usage

### Step 1: Create a Multi-Agent System

**Endpoint:** `POST /api/systems/create`

**Request Body:**
```json
{
    "mission": "To manage a multi-agent system to handle fraud detection",
    "models": [
        {
            "id": 1,
            "name": "Fraud Detection Model",
            "knowledge_bases": [1, 2, 3],
            "tools": [1]
        },
        {
            "id": 2,
            "name": "Messenger Model",
            "knowledge_bases": [1, 2, 3],
            "tools": [2]
        }
    ],
    "knowledge_bases": [
        {
            "id": 1,
            "name": "Fraud Detection Knowledge Base",
            "url": "https://s3.amazonaws.com/your-bucket/fraud-kb.csv",
            "description": "A knowledge base to detect fraud"
        },
        {
            "id": 2,
            "name": "Messenger Knowledge Base",
            "url": "https://s3.amazonaws.com/your-bucket/messenger-kb.json",
            "description": "A knowledge base to send alerts"
        },
        {
            "id": 3,
            "name": "Contact Knowledge Base",
            "url": "https://s3.amazonaws.com/your-bucket/contacts.csv",
            "description": "A knowledge base to store contact information"
        }
    ],
    "tools": [
        {
            "id": 1,
            "name": "Fraud Detection Tool",
            "description": "A tool to detect fraud patterns",
            "api_url": "https://api.example.com/fraud/detect",
            "api_key": "your-api-key-here"
        },
        {
            "id": 2,
            "name": "Messenger Tool",
            "description": "A tool to send alerts",
            "api_url": "https://api.example.com/messenger/send",
            "api_key": "your-api-key-here"
        }
    ]
}
```

**Response:**
```json
{
    "system_id": "550e8400-e29b-41d4-a716-446655440000",
    "endpoint": "/api/systems/550e8400-e29b-41d4-a716-446655440000/chat"
}
```

**Example using curl:**
```bash
curl -X POST "http://localhost:8000/api/systems/create" \
  -H "Content-Type: application/json" \
  -d @sampleData.json
```

### Step 2: Query the System

**Endpoint:** `POST /api/systems/{system_id}/chat`

**Request Body:**
```json
{
    "query": "Check if transaction #12345 is fraudulent"
}
```

**Response:**
```json
{
    "response": "Based on the fraud detection knowledge base, transaction #12345 shows suspicious patterns..."
}
```

**Example using curl:**
```bash
curl -X POST "http://localhost:8000/api/systems/550e8400-e29b-41d4-a716-446655440000/chat" \
  -H "Content-Type: application/json" \
  -d '{"query": "Check if transaction #12345 is fraudulent"}'
```

## Important Notes

### Model ID Routing
- **Even model IDs** (2, 4, 6, ...) → Route to `ENDPOINT_EVEN` (`http://2:8000/v1`)
- **Odd model IDs** (1, 3, 5, ...) → Route to `ENDPOINT_ODD` (`http://3:8000/v1`)
- **Core Agent** always uses `ENDPOINT_CORE` (`http://1:8000/v1`)

### Knowledge Bases
- Must be accessible S3 URLs (or any publicly accessible URL)
- Supports JSON and CSV formats
- Content is fetched **on each query** (not cached)
- Format: `{"id": X, "name": "...", "url": "https://...", "description": "..."}`

### Tools
- Must include `api_url` and `api_key` in the JSON
- Tools are formatted for MCP (Model Context Protocol) capabilities
- Sub-agents can request tool execution through MCP
- Format: `{"id": X, "name": "...", "description": "...", "api_url": "https://...", "api_key": "..."}`

### Model IDs
- Model IDs should be provided in the JSON configuration
- If not provided, they will be auto-assigned (1, 2, 3, ...)
- The core agent uses these IDs to route queries

## Example: Complete Workflow

1. **Create system:**
   ```bash
   curl -X POST "http://localhost:8000/api/systems/create" \
     -H "Content-Type: application/json" \
     -d @sampleData.json
   ```
   
   Save the `system_id` from the response.

2. **Query the system:**
   ```bash
   curl -X POST "http://localhost:8000/api/systems/YOUR_SYSTEM_ID/chat" \
     -H "Content-Type: application/json" \
     -d '{"query": "Your question here"}'
   ```

3. **What happens internally:**
   - Core agent receives your query
   - Core agent analyzes available models and selects one (e.g., model_id=1)
   - Router determines endpoint: model_id=1 (odd) → ENDPOINT_ODD
   - Router fetches KB content from S3 URLs
   - Router formats tools for MCP
   - Sub-agent processes query with KB content and tool access
   - Response is returned to you

## Testing with Python

```python
import requests

# Create system
with open('sampleData.json', 'r') as f:
    config = json.load(f)

response = requests.post(
    'http://localhost:8000/api/systems/create',
    json=config
)
system_data = response.json()
system_id = system_data['system_id']
print(f"Created system: {system_id}")

# Query system
chat_response = requests.post(
    f'http://localhost:8000/api/systems/{system_id}/chat',
    json={"query": "Check if transaction #12345 is fraudulent"}
)
result = chat_response.json()
print(f"Response: {result['response']}")
```

## Troubleshooting

1. **Server won't start:** Make sure all dependencies are installed
2. **Import errors:** Ensure you're running from the `backend/` directory
3. **LLM endpoint errors:** Verify your ENDPOINT_CORE, ENDPOINT_EVEN, ENDPOINT_ODD values point to valid vLLM servers
4. **KB fetch errors:** Ensure S3 URLs are publicly accessible or use presigned URLs
5. **Tool execution errors:** Verify API URLs and keys are correct

