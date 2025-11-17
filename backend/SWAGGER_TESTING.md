# Swagger UI Testing Guide

## Accessing Swagger UI

1. Make sure your server is running:
   ```powershell
   cd backend
   python -m uvicorn main:app --reload
   ```

2. Open your browser and go to:
   ```
   http://localhost:8000/docs
   ```

   Or for alternative docs:
   ```
   http://localhost:8000/redoc
   ```

## Step 1: Create a System

1. In Swagger UI, find the **POST /api/systems/create** endpoint
2. Click "Try it out"
3. Replace the example JSON with the following (complete with all required fields):

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
      "url": "https://s3.amazonaws.com/fraud-detection-knowledge-base.csv",
      "description": "A knowledge base to detect fraud"
    },
    {
      "id": 2,
      "name": "Messenger Knowledge Base",
      "url": "https://s3.amazonaws.com/messenger-knowledge-base.csv",
      "description": "A knowledge base to send alerts of fraud detection"
    },
    {
      "id": 3,
      "name": "Contact Knowledge Base",
      "url": "https://s3.amazonaws.com/contact-knowledge-base.csv",
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

4. Click "Execute"
5. **Copy the `system_id` from the response** - you'll need it for the next step!

Expected response:
```json
{
  "system_id": "550e8400-e29b-41d4-a716-446655440000",
  "endpoint": "/api/systems/550e8400-e29b-41d4-a716-446655440000/chat"
}
```

## Step 2: Query the System

1. Find the **POST /api/systems/{system_id}/chat** endpoint
2. Click "Try it out"
3. In the `system_id` parameter field, paste the `system_id` you got from Step 1
4. In the Request body, use:
```json
{
  "query": "Check if transaction #12345 is fraudulent"
}
```

5. Click "Execute"
6. View the response in the "Response body" section

Expected response:
```json
{
  "response": "Based on the fraud detection knowledge base..."
}
```

## Tips for Swagger UI

- **Expand/Collapse**: Click on any endpoint to see details
- **Schema**: Click "Schema" to see the expected request/response structure
- **Copy**: Use the "Copy" button to copy curl commands
- **Clear**: Use "Clear" to reset the form

## Troubleshooting

- **400 Bad Request**: Check that your JSON is valid and includes all required fields
- **404 Not Found**: Make sure you're using the correct `system_id` from Step 1
- **500 Internal Server Error**: Check server logs for details

