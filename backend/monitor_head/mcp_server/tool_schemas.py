"""Monitor Head MCP Server - Tool schemas for monitoring agents."""

# Tool definitions for Monitor Head agent
# These tools will be exposed via MCP and called by the Monitor agent

MONITOR_TOOLS = [
    {
        "name": "setup_monitoring_dashboard",
        "description": "Set up NeMo agent toolkit monitoring dashboard for deployed agents.",
        "input_schema": {
            "type": "object",
            "properties": {
                "agent_endpoints": {
                    "type": "array",
                    "items": {"type": "string"},
                    "description": "List of endpoint URLs for agents to monitor"
                },
                "core_endpoint": {
                    "type": "string",
                    "description": "Endpoint URL for the core/supervisor agent"
                }
            },
            "required": ["agent_endpoints", "core_endpoint"]
        },
        "output_schema": {
            "type": "object",
            "properties": {
                "dashboard_url": {
                    "type": "string",
                    "description": "URL of the monitoring dashboard"
                },
                "dashboard_id": {
                    "type": "string",
                    "description": "Unique dashboard identifier"
                }
            },
            "required": ["dashboard_url", "dashboard_id"]
        }
    },
    {
        "name": "configure_agent_alerts",
        "description": "Configure alerts for end-user agents using NeMo agent toolkit.",
        "input_schema": {
            "type": "object",
            "properties": {
                "agent_endpoints": {
                    "type": "array",
                    "items": {"type": "string"},
                    "description": "List of agent endpoints to configure alerts for"
                },
                "alert_rules": {
                    "type": "object",
                    "description": "Alert configuration rules"
                }
            },
            "required": ["agent_endpoints"]
        },
        "output_schema": {
            "type": "object",
            "properties": {
                "alerts_config": {
                    "type": "object",
                    "description": "Configured alerts configuration"
                },
                "alert_count": {
                    "type": "integer",
                    "description": "Number of alerts configured"
                }
            },
            "required": ["alerts_config", "alert_count"]
        }
    },
    {
        "name": "get_agent_metrics",
        "description": "Retrieve metrics for deployed agents using NeMo agent toolkit.",
        "input_schema": {
            "type": "object",
            "properties": {
                "agent_endpoint": {
                    "type": "string",
                    "description": "Endpoint URL of the agent to get metrics for"
                },
                "metric_types": {
                    "type": "array",
                    "items": {"type": "string"},
                    "description": "Types of metrics to retrieve"
                }
            },
            "required": ["agent_endpoint"]
        },
        "output_schema": {
            "type": "object",
            "properties": {
                "metrics": {
                    "type": "object",
                    "description": "Agent metrics data"
                },
                "timestamp": {
                    "type": "string",
                    "description": "Timestamp of the metrics"
                }
            },
            "required": ["metrics", "timestamp"]
        }
    },
    {
        "name": "setup_health_checks",
        "description": "Set up health checks for deployed agents.",
        "input_schema": {
            "type": "object",
            "properties": {
                "agent_endpoints": {
                    "type": "array",
                    "items": {"type": "string"},
                    "description": "List of agent endpoints to set up health checks for"
                },
                "check_interval": {
                    "type": "integer",
                    "description": "Health check interval in seconds"
                }
            },
            "required": ["agent_endpoints"]
        },
        "output_schema": {
            "type": "object",
            "properties": {
                "health_check_config": {
                    "type": "object",
                    "description": "Health check configuration"
                },
                "health_check_ids": {
                    "type": "array",
                    "items": {"type": "string"},
                    "description": "List of health check IDs created"
                }
            },
            "required": ["health_check_config", "health_check_ids"]
        }
    }
]

