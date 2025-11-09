from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import Dict, Any, List, Optional
from core.system_manager import SystemManager

app = FastAPI()
system_manager = SystemManager()


class SystemConfig(BaseModel):
    """System configuration model."""
    mission: Optional[str] = ""
    models: List[Dict[str, Any]]
    knowledge_bases: List[Dict[str, Any]]
    tools: List[Dict[str, Any]]


class ChatRequest(BaseModel):
    """Chat request model."""
    query: str


class SystemResponse(BaseModel):
    """System creation response model."""
    system_id: str
    endpoint: str


@app.get("/")
async def read_root():
    return {"Hello": "World"}


@app.post("/api/systems/create", response_model=SystemResponse)
async def create_system(config: SystemConfig):
    """
    Create a new multi-agent system from JSON configuration.
    
    Args:
        config: System configuration with models, knowledge_bases, and tools
    
    Returns:
        System ID and endpoint URL
    """
    try:
        # Use model_dump() for Pydantic v2, fallback to dict() for v1
        try:
            config_dict = config.model_dump()
        except AttributeError:
            config_dict = config.dict()
        system_id = system_manager.create_system(config_dict)
        endpoint = f"/api/systems/{system_id}/chat"
        
        return SystemResponse(
            system_id=system_id,
            endpoint=endpoint
        )
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to create system: {str(e)}")


@app.post("/api/systems/{system_id}/chat")
async def chat_with_system(system_id: str, request: ChatRequest):
    """
    Query a multi-agent system.
    
    Args:
        system_id: System ID
        request: Chat request with query
    
    Returns:
        Text response from the system
    """
    try:
        result = system_manager.process_query(system_id, request.query)
        return {"response": result}
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to process query: {str(e)}")


