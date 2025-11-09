from fastapi import APIRouter, HTTPException, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel
from typing import Optional, List, Dict, Any
from trainer_head.config import supabase
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

class ProjectResponse(BaseModel):
    id: str
    user_id: str
    name: str
    description: Optional[str]
    status: str
    canvas_data: Optional[Dict[str, Any]] = None
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
        response = supabase.table("projects").select("*").eq("id", project_id).eq("user_id", user_id).single().execute()
        if not response.data:
            raise HTTPException(status_code=404, detail="Project not found")
        return ProjectResponse(**response.data)
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
        # Verify project belongs to user
        check_response = supabase.table("projects").select("id").eq("id", project_id).eq("user_id", user_id).single().execute()
        if not check_response.data:
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
        
        # Update project
        response = supabase.table("projects").update(update_data).eq("id", project_id).execute()
        
        if not response.data or len(response.data) == 0:
            raise HTTPException(status_code=400, detail="Failed to update project")
        
        return ProjectResponse(**response.data[0])
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to update project: {str(e)}")

@router.delete("/{project_id}")
async def delete_project(
    project_id: str,
    user_id: str = Depends(get_current_user_id)
):
    """Delete a project"""
    try:
        # Verify project belongs to user
        check_response = supabase.table("projects").select("id").eq("id", project_id).eq("user_id", user_id).single().execute()
        if not check_response.data:
            raise HTTPException(status_code=404, detail="Project not found")
        
        # Delete project
        supabase.table("projects").delete().eq("id", project_id).execute()
        return {"message": "Project deleted successfully"}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to delete project: {str(e)}")

