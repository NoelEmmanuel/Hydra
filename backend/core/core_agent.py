"""
Core Agent for routing queries to appropriate sub-agents.
"""
import json
from typing import Dict, List, Any, Optional
from .llm_client import chat
from .config import ENDPOINT_CORE


CORE_SYSTEM_PROMPT = """Your task is to select the best possible model to accomplish the task you are assigned. Select the appropriate model to use from the following list of models based on their capabilities. Output the id of the model you select as well as a prompt for the model to execute.

IMPORTANT: You MUST respond with ONLY valid JSON. Do not include any reasoning text or explanations outside the JSON object.

You must respond in JSON format with the following structure:
{
    "model_id": <integer id of the selected model>,
    "prompt": "<refined prompt for the selected model>"
}

Example response:
{
    "model_id": 1,
    "prompt": "Analyze this transaction for fraud patterns"
}"""


class CoreAgent:
    """Core agent that routes queries to appropriate sub-agents."""
    
    def __init__(self, models: List[Dict[str, Any]], knowledge_bases: List[Dict[str, Any]], tools: List[Dict[str, Any]]):
        """
        Initialize the core agent.
        
        Args:
            models: List of model configurations
            knowledge_bases: List of knowledge base configurations
            tools: List of tool configurations
        """
        self.models = models
        self.knowledge_bases = knowledge_bases
        self.tools = tools
        self.endpoint = ENDPOINT_CORE
    
    def _format_models_context(self) -> str:
        """Format models, knowledge bases, and tools for the system prompt."""
        models_info = []
        for model in self.models:
            model_id = model.get('id')
            model_name = model.get('name', 'Unknown')
            kb_ids = model.get('knowledge_bases', [])
            tool_ids = model.get('tools', [])
            
            # Get KB names
            kb_names = [
                kb.get('name', f'KB {kb.get("id")}') 
                for kb in self.knowledge_bases 
                if kb.get('id') in kb_ids
            ]
            
            # Get tool names
            tool_names = [
                tool.get('name', f'Tool {tool.get("id")}') 
                for tool in self.tools 
                if tool.get('id') in tool_ids
            ]
            
            model_info = f"""
Model ID: {model_id}
Name: {model_name}
Knowledge Bases: {', '.join(kb_names) if kb_names else 'None'}
Tools: {', '.join(tool_names) if tool_names else 'None'}
"""
            models_info.append(model_info)
        
        return "\n".join(models_info)
    
    def route_query(self, user_query: str) -> Dict[str, Any]:
        """
        Route a user query to the appropriate sub-agent.
        
        Args:
            user_query: The user's query
        
        Returns:
            Dict with 'model_id' and 'prompt'
        
        Raises:
            ValueError: If the response cannot be parsed
        """
        # Build system prompt with models context
        models_context = self._format_models_context()
        full_system_prompt = f"{CORE_SYSTEM_PROMPT}\n\nAvailable Models:\n{models_context}"
        
        # Call LLM
        response = chat(
            prompt=user_query,
            endpoint=self.endpoint,
            system_prompt=full_system_prompt,
            max_tokens=1024  # Increased to handle reasoning + JSON
        )
        
        # Parse JSON response
        try:
            # Extract JSON from response (might have reasoning text before/after)
            json_text = self._extract_json_from_response(response)
            result = json.loads(json_text)
            
            # Validate structure
            if "model_id" not in result or "prompt" not in result:
                raise ValueError("Response missing required fields: model_id or prompt")
            
            return result
        except json.JSONDecodeError as e:
            # Show more context in error message
            error_msg = f"Failed to parse JSON response: {e}\n"
            error_msg += f"Extracted JSON text (first 500 chars): {json_text[:500]}\n"
            error_msg += f"Full response (first 1000 chars): {response[:1000]}"
            raise ValueError(error_msg)
    
    def _extract_json_from_response(self, response: str) -> str:
        """
        Extract JSON from response that may contain reasoning text.
        
        Args:
            response: Full response text that may contain reasoning + JSON
        
        Returns:
            Extracted JSON string
        """
        response = response.strip()
        
        # Remove markdown code blocks if present
        if response.startswith("```json"):
            response = response[7:]
        elif response.startswith("```"):
            response = response[3:]
        if response.endswith("```"):
            response = response[:-3]
        response = response.strip()
        
        # Try multiple strategies to find JSON
        
        # Strategy 1: Look for JSON object pattern with model_id
        import re
        json_pattern = r'\{[^{}]*"model_id"[^{}]*\}'
        matches = re.findall(json_pattern, response, re.DOTALL)
        if matches:
            # Try to find the most complete match (longest)
            for match in sorted(matches, key=len, reverse=True):
                try:
                    json.loads(match)
                    return match
                except:
                    continue
        
        # Strategy 2: Find the last complete JSON object
        start_idx = response.rfind('{')
        if start_idx != -1:
            # Find matching closing brace
            brace_count = 0
            end_idx = start_idx
            for i in range(start_idx, len(response)):
                if response[i] == '{':
                    brace_count += 1
                elif response[i] == '}':
                    brace_count -= 1
                    if brace_count == 0:
                        end_idx = i + 1
                        json_text = response[start_idx:end_idx]
                        try:
                            json.loads(json_text)
                            return json_text.strip()
                        except:
                            continue
            
            # If we found opening brace but no closing, try to find it backwards
            # Sometimes the JSON might be incomplete, try to find the last }
            last_closing = response.rfind('}')
            if last_closing > start_idx:
                json_text = response[start_idx:last_closing + 1]
                try:
                    json.loads(json_text)
                    return json_text.strip()
                except:
                    pass
        
        # Strategy 3: Look for JSON after common markers
        markers = ['</think>', '</reasoning>', '```json', '```', 'JSON:', 'Response:']
        for marker in markers:
            idx = response.find(marker)
            if idx != -1:
                after_marker = response[idx + len(marker):].strip()
                # Try to find JSON in the part after marker
                json_start = after_marker.find('{')
                if json_start != -1:
                    json_candidate = after_marker[json_start:]
                    # Try to extract complete JSON
                    brace_count = 0
                    end_idx = 0
                    for i, char in enumerate(json_candidate):
                        if char == '{':
                            brace_count += 1
                        elif char == '}':
                            brace_count -= 1
                            if brace_count == 0:
                                end_idx = i + 1
                                try:
                                    json_text = json_candidate[:end_idx]
                                    json.loads(json_text)
                                    return json_text.strip()
                                except:
                                    continue
        
        # Fallback: return the whole response and let the caller handle the error
        return response

