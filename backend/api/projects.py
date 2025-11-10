from fastapi import APIRouter, HTTPException, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel
from typing import Optional, List, Dict, Any
from .config import supabase
from .canvas_converter import convert_canvas_to_system_config
from core.api.systems import system_manager
from datetime import datetime

router = APIRouter(prefix="/api/projects", tags=["projects"])
security = HTTPBearer()

# Request/Response models
class ProjectCreate(BaseModel):
    name: str
    description: Optional[str] = None

class ProjectUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    status: Optional[str] = None
    canvas_data: Optional[Dict[str, Any]] = None
    endpoint: Optional[str] = None
    system_id: Optional[str] = None

class ProjectResponse(BaseModel):
    id: str
    user_id: str
    name: str
    description: Optional[str]
    status: str
    canvas_data: Optional[Dict[str, Any]] = None
    endpoint: Optional[str] = None
    system_id: Optional[str] = None
    created_at: str
    updated_at: str

def get_current_user_id(credentials: HTTPAuthorizationCredentials = Depends(security)) -> str:
    """Helper function to get current user ID from token"""
    try:
        token = credentials.credentials
        user_response = supabase.auth.get_user(token)
        if user_response.user is None:
            raise HTTPException(status_code=401, detail="Invalid token")
        return user_response.user.id
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=401, detail="Invalid token")

@router.post("", response_model=ProjectResponse)
async def create_project(
    project: ProjectCreate,
    user_id: str = Depends(get_current_user_id)
):
    """Create a new project"""
    try:
        # Count existing untitled projects for this user
        untitled_response = supabase.table("projects").select("id").eq("user_id", user_id).ilike("name", "Untitled%").execute()
        untitled_count = len(untitled_response.data) if untitled_response.data else 0
        
        # If name is empty or "Untitled", generate numbered name
        if not project.name or project.name.strip() == "" or project.name.strip().lower() == "untitled":
            project_name = f"Untitled ({untitled_count + 1})"
        else:
            project_name = project.name.strip()
        
        # Create project with default canvas_data including core node
        default_core_node = {
            "id": "core",
            "type": "core",
            "position": {"x": 0, "y": 0},
            "data": {},
            "style": {"cursor": "pointer"},
            "draggable": False,
            "deletable": False
        }
        response = supabase.table("projects").insert({
            "user_id": user_id,
            "name": project_name,
            "description": project.description,
            "status": "draft",
            "canvas_data": {"nodes": [default_core_node], "edges": []}
        }).execute()
        
        if not response.data or len(response.data) == 0:
            raise HTTPException(status_code=400, detail="Failed to create project")
        
        return ProjectResponse(**response.data[0])
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to create project: {str(e)}")

@router.get("", response_model=List[ProjectResponse])
async def get_projects(user_id: str = Depends(get_current_user_id)):
    """Get all projects for the current user"""
    try:
        response = supabase.table("projects").select("*").eq("user_id", user_id).order("updated_at", desc=True).execute()
        return [ProjectResponse(**project) for project in response.data]
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to fetch projects: {str(e)}")

@router.get("/{project_id}", response_model=ProjectResponse)
async def get_project(
    project_id: str,
    user_id: str = Depends(get_current_user_id)
):
    """Get a specific project"""
    try:
        # Use regular query instead of .single() to avoid PGRST116 error
        response = supabase.table("projects").select("*").eq("id", project_id).eq("user_id", user_id).execute()
        
        if not response.data or len(response.data) == 0:
            raise HTTPException(status_code=404, detail="Project not found")
        
        return ProjectResponse(**response.data[0])
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=404, detail="Project not found")

@router.patch("/{project_id}", response_model=ProjectResponse)
async def update_project(
    project_id: str,
    project_update: ProjectUpdate,
    user_id: str = Depends(get_current_user_id)
):
    """Update a project"""
    try:
        # Verify project belongs to user (use regular query instead of .single() to avoid PGRST116)
        check_response = supabase.table("projects").select("id").eq("id", project_id).eq("user_id", user_id).execute()
        
        if not check_response.data or len(check_response.data) == 0:
            raise HTTPException(status_code=404, detail="Project not found")
        
        # Build update dict
        update_data = {}
        if project_update.name is not None:
            update_data["name"] = project_update.name.strip()
        if project_update.description is not None:
            update_data["description"] = project_update.description
        if project_update.status is not None:
            update_data["status"] = project_update.status
        if project_update.canvas_data is not None:
            update_data["canvas_data"] = project_update.canvas_data
        if project_update.endpoint is not None:
            update_data["endpoint"] = project_update.endpoint
        if project_update.system_id is not None:
            update_data["system_id"] = project_update.system_id
        
        # Update project (include user_id filter for RLS compliance)
        response = supabase.table("projects").update(update_data).eq("id", project_id).eq("user_id", user_id).execute()
        
        if not response.data or len(response.data) == 0:
            raise HTTPException(status_code=400, detail="Failed to update project: Project may have been deleted or you don't have permission")
        
        return ProjectResponse(**response.data[0])
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to update project: {str(e)}")

@router.post("/{project_id}/deploy", response_model=ProjectResponse)
async def deploy_project(
    project_id: str,
    user_id: str = Depends(get_current_user_id)
):
    """Deploy a project and create a multi-agent system"""
    try:
        # Get full project with canvas_data (use regular query instead of .single() to avoid PGRST116)
        project_response = supabase.table("projects").select("*").eq("id", project_id).eq("user_id", user_id).execute()
        
        if not project_response.data or len(project_response.data) == 0:
            raise HTTPException(status_code=404, detail="Project not found or you don't have permission to access it")
        
        project = project_response.data[0]
        
        # Validate canvas_data exists
        canvas_data = project.get("canvas_data")
        if not canvas_data:
            raise HTTPException(status_code=400, detail="Project must have canvas_data to deploy")
        
        # Validate canvas_data has nodes
        nodes = canvas_data.get("nodes", [])
        if not nodes or not isinstance(nodes, list):
            raise HTTPException(status_code=400, detail="Canvas data must contain nodes")
        
        # Convert canvas_data to SystemConfig
        try:
            system_config = convert_canvas_to_system_config(canvas_data)
        except ValueError as e:
            raise HTTPException(status_code=400, detail=f"Invalid canvas configuration: {str(e)}")
        
        # Create the multi-agent system
        try:
            system_id = system_manager.create_system(system_config)
        except ValueError as e:
            raise HTTPException(status_code=400, detail=f"Failed to create system: {str(e)}")
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Failed to create system: {str(e)}")
        
        # Generate endpoint URL with full URL
        endpoint = f"http://127.0.0.1:8000/api/systems/{system_id}/chat"
        
        # Update project with system_id, endpoint, and set status to deployed
        update_response = supabase.table("projects").update({
            "system_id": system_id,
            "endpoint": endpoint,
            "status": "deployed"
        }).eq("id", project_id).eq("user_id", user_id).execute()
        
        if not update_response.data or len(update_response.data) == 0:
            raise HTTPException(status_code=400, detail="Failed to update project: Project may have been deleted or you don't have permission")
        
        return ProjectResponse(**update_response.data[0])
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to deploy project: {str(e)}")

@router.delete("/{project_id}")
async def delete_project(
    project_id: str,
    user_id: str = Depends(get_current_user_id)
):
    """Delete a project"""
    try:
        # Verify project belongs to user (use regular query instead of .single() to avoid PGRST116)
        check_response = supabase.table("projects").select("id").eq("id", project_id).eq("user_id", user_id).execute()
        if not check_response.data or len(check_response.data) == 0:
            raise HTTPException(status_code=404, detail="Project not found")
        
        # Delete project (include user_id filter for RLS compliance)
        # Wrap in try-except to handle Supabase exceptions
        try:
            delete_response = supabase.table("projects").delete().eq("id", project_id).eq("user_id", user_id).execute()
            
            # Check if deletion succeeded by verifying deleted rows
            if not delete_response.data or len(delete_response.data) == 0:
                raise HTTPException(status_code=400, detail="Failed to delete project: No rows were deleted")
        except Exception as delete_error:
            # Handle Supabase errors (like PGRST116 when 0 rows returned)
            error_str = str(delete_error)
            error_dict = delete_error.__dict__ if hasattr(delete_error, '__dict__') else {}
            
            # Check for PGRST116 error (0 rows)
            if "PGRST116" in error_str or (isinstance(error_dict, dict) and error_dict.get("code") == "PGRST116"):
                raise HTTPException(status_code=400, detail="Failed to delete project: Project not found or already deleted")
            
            # Re-raise if it's an HTTPException
            if isinstance(delete_error, HTTPException):
                raise
            
            # Otherwise, wrap in HTTPException
            raise HTTPException(status_code=400, detail=f"Failed to delete project: {error_str}")
        
        return {"message": "Project deleted successfully"}
    except HTTPException:
        raise
    except Exception as e:
        error_msg = str(e)
        # Log the full error for debugging
        print(f"Delete project error: {error_msg}")
        raise HTTPException(status_code=400, detail=f"Failed to delete project: {error_msg}")

