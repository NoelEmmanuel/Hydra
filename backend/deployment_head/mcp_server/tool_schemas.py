"""Deployment Head MCP Server - Tool schemas for deploying models."""

# Tool definitions for Deployer Head agent
# These tools will be exposed via MCP and called by the Deployer agent

DEPLOYER_TOOLS = [
    {
        "name": "deploy_to_nim",
        "description": "Deploy a trained model to a NIM (NVIDIA Inference Microservice) container.",
        "input_schema": {
            "type": "object",
            "properties": {
                "model_identifier": {
                    "type": "string",
                    "description": "Identifier of the trained model to deploy"
                },
                "model_id": {
                    "type": "string",
                    "description": "Original model ID"
                },
                "nim_config": {
                    "type": "object",
                    "description": "NIM-specific configuration"
                }
            },
            "required": ["model_identifier", "model_id"]
        },
        "output_schema": {
            "type": "object",
            "properties": {
                "nim_container_id": {
                    "type": "string",
                    "description": "ID of the created NIM container"
                },
                "deployment_status": {
                    "type": "string",
                    "description": "Deployment status"
                }
            },
            "required": ["nim_container_id", "deployment_status"]
        }
    },
    {
        "name": "allocate_brev_gpu",
        "description": "Allocate GPU resources on BREV for model deployment.",
        "input_schema": {
            "type": "object",
            "properties": {
                "gpu_type": {
                    "type": "string",
                    "description": "Type of GPU required"
                },
                "gpu_count": {
                    "type": "integer",
                    "description": "Number of GPUs needed"
                }
            },
            "required": ["gpu_type", "gpu_count"]
        },
        "output_schema": {
            "type": "object",
            "properties": {
                "gpu_allocation_id": {
                    "type": "string",
                    "description": "ID of the GPU allocation"
                },
                "gpu_endpoints": {
                    "type": "array",
                    "items": {"type": "string"},
                    "description": "List of GPU endpoint URLs"
                }
            },
            "required": ["gpu_allocation_id", "gpu_endpoints"]
        }
    },
    {
        "name": "create_nim_endpoint",
        "description": "Create an endpoint URL for accessing a deployed NIM container.",
        "input_schema": {
            "type": "object",
            "properties": {
                "nim_container_id": {
                    "type": "string",
                    "description": "ID of the NIM container"
                },
                "model_id": {
                    "type": "string",
                    "description": "Model ID for endpoint naming"
                }
            },
            "required": ["nim_container_id", "model_id"]
        },
        "output_schema": {
            "type": "object",
            "properties": {
                "endpoint_url": {
                    "type": "string",
                    "description": "Endpoint URL for accessing the model"
                },
                "endpoint_id": {
                    "type": "string",
                    "description": "Unique endpoint identifier"
                }
            },
            "required": ["endpoint_url", "endpoint_id"]
        }
    },
    {
        "name": "get_deployment_status",
        "description": "Check the status of a model deployment.",
        "input_schema": {
            "type": "object",
            "properties": {
                "nim_container_id": {
                    "type": "string",
                    "description": "ID of the NIM container to check"
                }
            },
            "required": ["nim_container_id"]
        },
        "output_schema": {
            "type": "object",
            "properties": {
                "status": {
                    "type": "string",
                    "description": "Deployment status: 'pending', 'deploying', 'ready', 'failed'"
                },
                "health_check": {
                    "type": "string",
                    "description": "Health check result"
                }
            },
            "required": ["status"]
        }
    }
]

