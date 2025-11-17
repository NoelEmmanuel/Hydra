"""
System Manager for processing JSON configuration and managing multi-agent systems.
"""
import uuid
from typing import Dict, List, Any, Optional
from .core_agent import CoreAgent
from .router import Router


class SystemManager:
    """Manages multi-agent system configurations."""
    
    def __init__(self):
        """Initialize the system manager."""
        self.systems: Dict[str, Dict[str, Any]] = {}
    
    def create_system(self, config: Dict[str, Any]) -> str:
        """
        Create a new multi-agent system from JSON configuration.
        
        Args:
            config: JSON configuration with 'mission', 'models', 'knowledge_bases', 'tools'
        
        Returns:
            System ID
        """
        # Validate configuration
        if 'models' not in config:
            raise ValueError("Configuration must include 'models'")
        if 'knowledge_bases' not in config:
            raise ValueError("Configuration must include 'knowledge_bases'")
        if 'tools' not in config:
            raise ValueError("Configuration must include 'tools'")
        
        # Assign IDs to models if not present
        models = config['models']
        for idx, model in enumerate(models):
            if 'id' not in model:
                # Auto-assign ID based on index (starting from 1)
                model['id'] = idx + 1
        
        # Create system ID
        system_id = str(uuid.uuid4())
        
        # Create core agent
        core_agent = CoreAgent(
            models=models,
            knowledge_bases=config['knowledge_bases'],
            tools=config['tools']
        )
        
        # Create router
        router = Router(
            models=models,
            knowledge_bases=config['knowledge_bases'],
            tools=config['tools']
        )
        
        # Store system configuration
        self.systems[system_id] = {
            'id': system_id,
            'mission': config.get('mission', ''),
            'models': models,
            'knowledge_bases': config['knowledge_bases'],
            'tools': config['tools'],
            'core_agent': core_agent,
            'router': router
        }
        
        return system_id
    
    def get_system(self, system_id: str) -> Optional[Dict[str, Any]]:
        """
        Get system configuration by ID.
        
        Args:
            system_id: System ID
        
        Returns:
            System configuration or None if not found
        """
        return self.systems.get(system_id)
    
    def process_query(self, system_id: str, query: str) -> str:
        """
        Process a query through the multi-agent system.
        
        Args:
            system_id: System ID
            query: User query
        
        Returns:
            Text response
        
        Raises:
            ValueError: If system not found
        """
        system = self.get_system(system_id)
        if not system:
            raise ValueError(f"System with ID {system_id} not found")
        
        core_agent = system['core_agent']
        router = system['router']
        
        # Core agent routes the query
        routing_result = core_agent.route_query(query)
        model_id = routing_result['model_id']
        prompt = routing_result['prompt']
        
        # Router routes to sub-agent
        sub_agent_result = router.route_to_sub_agent(model_id, prompt)
        
        # Core agent refines the response to clean up verbose output
        try:
            refined_result = core_agent.refine_response(sub_agent_result, query)
            return refined_result
        except Exception as e:
            # If refinement fails, return original response with simple cleanup
            print(f"Response refinement failed: {e}, returning original response")
            # Apply simple cleanup as fallback
            try:
                cleaned_result = core_agent._clean_response_simple(sub_agent_result)
                # Enforce max length even in fallback
                from .config import MAX_RESPONSE_LENGTH
                if len(cleaned_result) > MAX_RESPONSE_LENGTH:
                    truncated = cleaned_result[:MAX_RESPONSE_LENGTH]
                    last_space = truncated.rfind(' ')
                    if last_space > MAX_RESPONSE_LENGTH * 0.8:
                        cleaned_result = truncated[:last_space] + "..."
                    else:
                        cleaned_result = truncated + "..."
                return cleaned_result
            except Exception:
                # Last resort: return original response (truncated if too long)
                from .config import MAX_RESPONSE_LENGTH
                if len(sub_agent_result) > MAX_RESPONSE_LENGTH:
                    truncated = sub_agent_result[:MAX_RESPONSE_LENGTH]
                    last_space = truncated.rfind(' ')
                    if last_space > MAX_RESPONSE_LENGTH * 0.8:
                        return truncated[:last_space] + "..."
                    return truncated + "..."
                return sub_agent_result
    
    def delete_system(self, system_id: str) -> bool:
        """
        Delete a system.
        
        Args:
            system_id: System ID
        
        Returns:
            True if deleted, False if not found
        """
        if system_id in self.systems:
            del self.systems[system_id]
            return True
        return False

