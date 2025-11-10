"""
Systems API router for multi-agent system endpoints.
"""
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Dict, Any
from ..system_manager import SystemManager

router = APIRouter(prefix="/api/systems", tags=["systems"])

# Global system manager instance
system_manager = SystemManager()


class SystemConfig(BaseModel):
    """System configuration model."""
    mission: str = ""
    models: list[Dict[str, Any]]
    knowledge_bases: list[Dict[str, Any]]
    tools: list[Dict[str, Any]]


class SystemCreateResponse(BaseModel):
    """Response model for system creation."""
    system_id: str
    endpoint: str


class ChatRequest(BaseModel):
    """Request model for chat endpoint."""
    query: str


class ChatResponse(BaseModel):
    """Response model for chat endpoint."""
    response: str


@router.post("/create", response_model=SystemCreateResponse)
async def create_system(config: SystemConfig):
    """
    Create a new multi-agent system from JSON configuration.
    
    Args:
        config: System configuration with mission, models, knowledge_bases, and tools
    
    Returns:
        System ID and chat endpoint URL
    """
    try:
        config_dict = config.model_dump()
        system_id = system_manager.create_system(config_dict)
        endpoint = f"/api/systems/{system_id}/chat"
        
        return {
            "system_id": system_id,
            "endpoint": endpoint
        }
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to create system: {str(e)}")


@router.post("/{system_id}/chat", response_model=ChatResponse)
async def chat_with_system(system_id: str, request: ChatRequest):
    """
    Process a query through a multi-agent system.
    
    Args:
        system_id: System ID
        request: Chat request with query
    
    Returns:
        Response from the multi-agent system
    """
    try:
        response = system_manager.process_query(system_id, request.query)
        return {"response": response}
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to process query: {str(e)}")

