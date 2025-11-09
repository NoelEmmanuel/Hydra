"""Trainer Head MCP Server - Tool schemas for fine-tuning models."""

# Tool definitions for Trainer Head agent
# These tools will be exposed via MCP and called by the Trainer agent

TRAINER_TOOLS = [
    {
        "name": "fine_tune_model",
        "description": "Fine-tune a model using NeMo with the specified knowledge bases. Returns a model identifier for the trained model.",
        "input_schema": {
            "type": "object",
            "properties": {
                "model_id": {
                    "type": "string",
                    "description": "ID of the model to fine-tune"
                },
                "knowledge_base_ids": {
                    "type": "array",
                    "items": {"type": "string"},
                    "description": "List of knowledge base IDs to use for fine-tuning"
                },
                "model_config": {
                    "type": "object",
                    "description": "Model-specific configuration"
                }
            },
            "required": ["model_id", "knowledge_base_ids"]
        },
        "output_schema": {
            "type": "object",
            "properties": {
                "model_identifier": {
                    "type": "string",
                    "description": "Unique identifier for the trained model"
                },
                "training_job_id": {
                    "type": "string",
                    "description": "ID of the training job"
                },
                "status": {
                    "type": "string",
                    "description": "Training status"
                }
            },
            "required": ["model_identifier", "training_job_id", "status"]
        }
    },
    {
        "name": "prepare_training_data",
        "description": "Prepare training data from knowledge bases for fine-tuning.",
        "input_schema": {
            "type": "object",
            "properties": {
                "knowledge_base_ids": {
                    "type": "array",
                    "items": {"type": "string"},
                    "description": "List of knowledge base IDs to prepare"
                },
                "output_format": {
                    "type": "string",
                    "description": "Desired output format for training data"
                }
            },
            "required": ["knowledge_base_ids"]
        },
        "output_schema": {
            "type": "object",
            "properties": {
                "data_path": {
                    "type": "string",
                    "description": "Path to prepared training data"
                },
                "data_size": {
                    "type": "integer",
                    "description": "Size of the training dataset"
                }
            },
            "required": ["data_path", "data_size"]
        }
    },
    {
        "name": "validate_model_config",
        "description": "Validate that a model configuration is correct before fine-tuning.",
        "input_schema": {
            "type": "object",
            "properties": {
                "model_id": {
                    "type": "string",
                    "description": "ID of the model to validate"
                },
                "knowledge_base_ids": {
                    "type": "array",
                    "items": {"type": "string"},
                    "description": "List of knowledge base IDs"
                }
            },
            "required": ["model_id", "knowledge_base_ids"]
        },
        "output_schema": {
            "type": "object",
            "properties": {
                "is_valid": {
                    "type": "boolean",
                    "description": "Whether the configuration is valid"
                },
                "errors": {
                    "type": "array",
                    "items": {"type": "string"},
                    "description": "List of validation errors if any"
                }
            },
            "required": ["is_valid"]
        }
    },
    {
        "name": "get_training_status",
        "description": "Check the status of a training job.",
        "input_schema": {
            "type": "object",
            "properties": {
                "training_job_id": {
                    "type": "string",
                    "description": "ID of the training job to check"
                }
            },
            "required": ["training_job_id"]
        },
        "output_schema": {
            "type": "object",
            "properties": {
                "status": {
                    "type": "string",
                    "description": "Current status: 'pending', 'running', 'completed', 'failed'"
                },
                "progress": {
                    "type": "number",
                    "description": "Training progress percentage (0-100)"
                },
                "estimated_completion": {
                    "type": "string",
                    "description": "Estimated completion time"
                }
            },
            "required": ["status"]
        }
    }
]

