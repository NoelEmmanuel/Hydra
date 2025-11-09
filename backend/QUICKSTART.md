# Steps to Run Hydra Orchestrator

## 1. Install Dependencies

If you're using `uv` (recommended):
```bash
cd backend
uv sync
```

Or using `pip`:
```bash
cd backend
pip install -e .
```

## 2. Set Up Environment Variables

Make sure your `.env` file exists in the `backend/` directory with:
```
NVIDIA_API_KEY=your_actual_nvidia_api_key_here
```

**Note:** The system exclusively uses `NVIDIA_API_KEY` from `backend/.env`. The model is hard-coded to `nvidia/nvidia-nemotron-nano-9b-v2`.

## 3. Run the FastAPI Server

```bash
cd backend
uvicorn main:app --reload
```

Or with Python directly:
```bash
cd backend
python -m uvicorn main:app --reload
```

The server will start at: `http://localhost:8000`

## 4. Test the API

### Option A: Using the Interactive API Docs
Visit: `http://localhost:8000/docs`
- This provides a Swagger UI where you can test endpoints interactively

### Option B: Using curl

Test the root endpoint:
```bash
curl http://localhost:8000/
```

Execute a workflow (example):
```bash
curl -X POST "http://localhost:8000/workflow/execute" \
  -H "Content-Type: application/json" \
  -d @test_input.json
```

### Option C: Using Python

Create a test script `test_workflow.py`:
```python
import requests
import json

# Example input JSON
input_data = {
    "models": [
        {
            "model_id": "supervisor",
            "connected_tools": [],
            "connected_knowledge_bases": [],
            "is_supervisor": True
        },
        {
            "model_id": "agent1",
            "connected_tools": ["tool1"],
            "connected_knowledge_bases": ["kb1"],
            "is_supervisor": False
        }
    ],
    "knowledge_bases": {
        "kb1": {"data": "Sample knowledge base data"}
    },
    "tools": [
        {
            "tool_id": "tool1",
            "tool_config": {}
        }
    ],
    "prompt": "Create a fraud detection system"
}

response = requests.post(
    "http://localhost:8000/workflow/execute",
    json=input_data
)
print(json.dumps(response.json(), indent=2))
```

## 5. Check Workflow Status

After executing a workflow, you'll get a `workflow_id`. Use it to check status:
```bash
curl http://localhost:8000/workflow/status/{workflow_id}
```

## Example Input JSON Structure

```json
{
  "models": [
    {
      "model_id": "supervisor",
      "connected_tools": [],
      "connected_knowledge_bases": [],
      "is_supervisor": true
    },
    {
      "model_id": "sub_agent_1",
      "connected_tools": ["tool_1"],
      "connected_knowledge_bases": ["kb_1"],
      "is_supervisor": false
    }
  ],
  "knowledge_bases": {
    "kb_1": {
      "content": "Your knowledge base data here"
    }
  },
  "tools": [
    {
      "tool_id": "tool_1",
      "tool_config": {}
    }
  ],
  "prompt": "Your project prompt here"
}
```

