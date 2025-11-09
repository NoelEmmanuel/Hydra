# Jira Tool Integration Guide

## Overview

The Jira tool allows models to create issues in Jira. When a model is configured with the Jira tool, it can create new issues in any Jira project you have access to.

## Setup

### 1. Generate Jira API Token

1. Go to [Atlassian Account Settings](https://id.atlassian.com/manage-profile/security/api-tokens)
2. Click "Create API token"
3. Give it a label (e.g., "Hydra Multi-Agent System")
4. Click "Create"
5. **Copy the token immediately** - you won't be able to see it again!

### 2. Find Your Jira Domain URL

Your Jira domain URL is typically in the format:
- `https://your-domain.atlassian.net`

You can find this in your Jira URL when you're logged in.

### 3. Add Jira Tool to JSON Configuration

Add the Jira tool to your system configuration JSON:

```json
{
  "id": 1,
  "name": "Jira Tool",
  "description": "Create issues in Jira",
  "api_url": "https://your-domain.atlassian.net",
  "api_key": "your-api-token-here",
  "email": "your-email@example.com"
}
```

**Important**: Jira requires both `api_key` (API token) and `email` (your Atlassian account email) for authentication.

### 4. Attach Tool to Model

Reference the tool in your model configuration:

```json
{
  "id": 1,
  "name": "Issue Management Model",
  "knowledge_bases": [],
  "tools": [1]
}
```

## Usage

### Complete Example Configuration

```json
{
  "mission": "To create and manage Jira issues",
  "models": [
    {
      "id": 1,
      "name": "Issue Management Model",
      "knowledge_bases": [],
      "tools": [1]
    }
  ],
  "knowledge_bases": [],
  "tools": [
    {
      "id": 1,
      "name": "Jira Tool",
      "description": "Create issues in Jira",
      "api_url": "https://your-domain.atlassian.net",
      "api_key": "your-api-token-here",
      "email": "your-email@example.com"
    }
  ]
}
```

### How Models Use the Tool

When a model has access to the Jira tool, it can create issues by including a JSON tool call in its response:

```json
{
  "tool_id": 1,
  "action": "create_issue",
  "project_key": "PROJ",
  "summary": "Fix bug in authentication",
  "issuetype": "Task",
  "description": "Detailed description of the issue"
}
```

The router will:
1. Parse the tool call from the model's response
2. Execute the Jira API call to create the issue
3. Return the issue details (key, URL) to the model
4. Allow the model to process the results and provide a final answer

### Example Query

**User Query:**
```
"Create a Jira task in project PROJ with summary 'Fix authentication bug' and description 'The login page is not validating credentials correctly'"
```

**What Happens:**
1. Core agent routes to appropriate model (e.g., Issue Management Model)
2. Model receives query and tool information
3. Model requests Jira tool: `{"tool_id": 1, "action": "create_issue", "project_key": "PROJ", "summary": "Fix authentication bug", "issuetype": "Task", "description": "The login page is not validating credentials correctly"}`
4. Router executes tool call and creates the Jira issue
5. Model receives issue details (key, URL) and confirms creation

## Jira API Endpoint

The tool uses the Jira REST API:
- **Endpoint**: `POST https://{domain}.atlassian.net/rest/api/2/issue/`
- **Authentication**: Basic Auth with `email:api_token` (base64 encoded)
- **Content-Type**: `application/json`

## Required Fields

- `project_key` - Jira project key (e.g., "PROJ", "TEST")
- `summary` - Issue summary/title
- `issuetype` - Issue type name (e.g., "Task", "Bug", "Story", "Epic")

## Optional Fields

- `description` - Detailed issue description

## Common Issue Types

- **Task** - General work item
- **Bug** - A problem that needs to be fixed
- **Story** - User story or feature
- **Epic** - Large body of work
- **Subtask** - Sub-task of a parent issue

Note: Available issue types depend on your Jira project configuration.

## Error Handling

The tool handles common errors:
- **401**: Authentication failed → Check email and API token
- **400**: Validation error → Check project key, issue type, or required fields
- **404**: Project not found → Verify project key exists
- **403**: Permission denied → Ensure your account has permission to create issues in the project

## Security Notes

- **Never commit your Jira API token to version control**
- Store tokens securely (use environment variables or secure storage)
- Use minimal required permissions
- Rotate tokens regularly
- Consider using service accounts for production

## Troubleshooting

### "Jira authentication failed"
- Verify your email matches your Atlassian account email
- Check that the API token is correct and hasn't been revoked
- Ensure the token was copied completely (no extra spaces)

### "Jira validation error: project"
- Verify the project key exists in your Jira instance
- Check that you have access to the project
- Project keys are case-sensitive

### "Jira validation error: issuetype"
- Verify the issue type name is correct (e.g., "Task", not "task")
- Check what issue types are available in your project
- Common issue types: Task, Bug, Story, Epic

### "Jira tool requires email"
- Make sure you've added the `email` field to your tool configuration
- The email should match your Atlassian account email

## Example Use Cases

1. **Bug Tracking**: Automatically create bugs from error reports
2. **Task Management**: Create tasks from user requests
3. **Feature Requests**: Convert feature requests into Jira stories
4. **Project Management**: Generate issues from project planning discussions

