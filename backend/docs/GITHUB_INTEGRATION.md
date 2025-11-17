# GitHub Tool Integration Guide

## Overview

The GitHub tool allows models to read file contents from GitHub repositories. When a model is configured with the GitHub tool, it can retrieve and analyze code files from any GitHub repository.

## Setup

### 1. Create GitHub Personal Access Token (PAT)

1. Go to GitHub → Settings → Developer settings → Personal access tokens → Tokens (classic)
2. Click "Generate new token (classic)"
3. Give it a descriptive name (e.g., "Hydra Multi-Agent System")
4. Select scopes:
   - **For public repositories**: `public_repo` scope
   - **For private repositories**: `repo` scope (includes public_repo)
5. Click "Generate token"
6. **Copy the token immediately** - you won't be able to see it again!

### 2. Add GitHub Tool to JSON Configuration

Add the GitHub tool to your system configuration JSON:

```json
{
  "id": 1,
  "name": "GitHub Tool",
  "description": "Read file contents from GitHub repositories",
  "api_url": "https://api.github.com",
  "api_key": "ghp_your_personal_access_token_here"
}
```

### 3. Attach Tool to Model

Reference the tool in your model configuration:

```json
{
  "id": 1,
  "name": "Code Analysis Model",
  "knowledge_bases": [1],
  "tools": [1]
}
```

## Usage

### Complete Example Configuration

```json
{
  "mission": "To analyze code from GitHub repositories",
  "models": [
    {
      "id": 1,
      "name": "Code Analysis Model",
      "knowledge_bases": [],
      "tools": [1]
    }
  ],
  "knowledge_bases": [],
  "tools": [
    {
      "id": 1,
      "name": "GitHub Tool",
      "description": "Read file contents from GitHub repositories",
      "api_url": "https://api.github.com",
      "api_key": "ghp_your_personal_access_token_here"
    }
  ]
}
```

### How Models Use the Tool

When a model has access to the GitHub tool, it can request file contents by including a JSON tool call in its response:

```json
{
  "tool_id": 1,
  "action": "get_file_contents",
  "owner": "octocat",
  "repo": "Hello-World",
  "path": "README.md"
}
```

The router will:
1. Parse the tool call from the model's response
2. Execute the GitHub API call
3. Return the file contents to the model
4. Allow the model to process the results and provide a final answer

### Example Query

**User Query:**
```
"Read the README.md file from the octocat/Hello-World repository and summarize it"
```

**What Happens:**
1. Core agent routes to appropriate model (e.g., Code Analysis Model)
2. Model receives query and tool information
3. Model requests GitHub tool: `{"tool_id": 1, "action": "get_file_contents", "owner": "octocat", "repo": "Hello-World", "path": "README.md"}`
4. Router executes tool call and retrieves file contents
5. Model receives file contents and provides summary

## GitHub API Endpoint

The tool uses the GitHub Contents API:
- **Endpoint**: `GET /repos/{owner}/{repo}/contents/{path}`
- **Base URL**: `https://api.github.com`
- **Authentication**: Bearer token (Personal Access Token)

## Rate Limiting

- **Authenticated requests**: 5,000 requests/hour
- Rate limit errors are automatically detected and returned to the model
- Check rate limit headers: `X-RateLimit-Remaining`, `X-RateLimit-Reset`

## Error Handling

The tool handles common errors:
- **404**: File not found → Returns error message to model
- **403**: Rate limit exceeded → Returns rate limit information
- **Directory**: If path is a directory → Returns error (only files supported)
- **Base64 decode errors**: Handled gracefully

## Security Notes

- **Never commit your GitHub PAT to version control**
- Store tokens securely (use environment variables or secure storage)
- Use minimal required scopes (public_repo for public repos only)
- Rotate tokens regularly
- Consider using GitHub Apps for production (more secure than PATs)

## Troubleshooting

### "Tool execution failed: GitHub API rate limit exceeded"
- Wait for rate limit to reset (check `X-RateLimit-Reset` header)
- Use authenticated requests (you're already doing this)
- Consider caching frequently accessed files

### "File not found" errors
- Verify the repository exists and is accessible
- Check file path is correct (case-sensitive)
- Ensure token has appropriate scopes for private repos

### "Path is a directory" errors
- The tool only supports reading files, not directories
- Specify the full path to a file (e.g., `src/main.py` not `src/`)

## Example Use Cases

1. **Code Review**: Analyze pull request files
2. **Documentation**: Read and summarize README files
3. **Code Analysis**: Review implementation details
4. **Learning**: Study code patterns from repositories

