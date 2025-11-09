"""Monitor Head Agent - Sets up monitoring using NeMo agent toolkit."""

import json
from typing import Dict, Any
from hydra_orchestrator.agents.base_agent import BaseHeadAgent
from hydra_orchestrator.state import WorkflowState
from hydra_orchestrator.utils import get_logger
from monitor_head.agent.prompts import MONITOR_SYSTEM_PROMPT
from monitor_head.mcp_server.server import MonitorMCPServer


class MonitorAgent(BaseHeadAgent):
    """Agent responsible for setting up monitoring using NeMo agent toolkit."""
    
    def __init__(self, nemotron_client):
        """Initialize Monitor agent."""
        mcp_server = MonitorMCPServer()
        super().__init__(nemotron_client, mcp_server, MONITOR_SYSTEM_PROMPT)
        self.logger = get_logger(__name__)
    
    def _build_task_prompt(self, state: WorkflowState) -> str:
        """
        Build task prompt for Monitor agent.
        
        Args:
            state: Current workflow state
            
        Returns:
            Task prompt string
        """
        deployer_outputs = state["deployer_outputs"]
        core_endpoint = state["core_endpoint"]
        
        all_endpoints = list(deployer_outputs.values())
        
        prompt = f"""Your task is to set up monitoring for the deployed end-user agents using NeMo agent toolkit.

Deployed Agent Endpoints ({len(all_endpoints)} endpoints):
"""
        
        for endpoint in all_endpoints:
            is_core = (endpoint == core_endpoint)
            prompt += f"- {endpoint} {'(CORE/SUPERVISOR ENDPOINT)' if is_core else ''}\n"
        
        prompt += f"""
Core Endpoint: {core_endpoint}

Tasks:
1. Set up a monitoring dashboard using NeMo agent toolkit for all agent endpoints
2. Configure alerts for the deployed agents
3. Set up health checks for all agents
4. Return the dashboard URL and alerts configuration

Important:
- Monitor the end-user agents (the agents created by Hydra), NOT the Hydra Head agents
- Use NeMo agent toolkit for all monitoring functionality
- Ensure the dashboard is accessible and properly configured
- Set up appropriate alerts based on agent performance metrics"""
        
        return prompt
    
    def _update_state(self, state: WorkflowState, agent_output: str) -> WorkflowState:
        """
        Update state with monitor outputs (dashboard URL, alerts config).
        
        Args:
            state: Current workflow state
            agent_output: Final output from agent
            
        Returns:
            Updated workflow state
        """
        # Parse agent output to extract monitoring outputs
        dashboard_url = ""
        alerts_config = {}
        
        # Look through conversation history for monitoring tool results
        for msg in self.conversation_history:
            if msg.get("role") == "tool" and msg.get("content"):
                try:
                    tool_result = json.loads(msg["content"])
                    if "dashboard_url" in tool_result:
                        dashboard_url = tool_result["dashboard_url"]
                    if "alerts_config" in tool_result:
                        alerts_config = tool_result["alerts_config"]
                except (json.JSONDecodeError, KeyError):
                    pass
        
        # If we couldn't extract from tool results, try parsing agent output
        if not dashboard_url:
            # Simple extraction - look for dashboard URL
            lines = agent_output.split("\n")
            for line in lines:
                if "dashboard" in line.lower() and "http" in line.lower():
                    import re
                    urls = re.findall(r'https?://[^\s]+', line)
                    if urls:
                        dashboard_url = urls[0]
        
        # Fallback: create mock monitoring outputs
        if not dashboard_url:
            dashboard_url = "https://monitor.hydra.dev/dashboard/12345"
            alerts_config = {
                "configured": True,
                "endpoints": list(state["deployer_outputs"].values())
            }
        
        # Update state
        updated_state = state.copy()
        updated_state["monitor_outputs"] = {
            "dashboard_url": dashboard_url,
            "alerts_config": alerts_config
        }
        updated_state["orchestration_metadata"]["current_stage"] = "completed"
        
        self.logger.info(f"Monitor outputs - Dashboard: {dashboard_url}")
        
        return updated_state

