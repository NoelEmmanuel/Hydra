from fastapi import APIRouter, HTTPException, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel, EmailStr
from typing import Optional
from trainer_head.config import supabase

router = APIRouter(prefix="/api/auth", tags=["auth"])
security = HTTPBearer()

# Request/Response models
class SignUpRequest(BaseModel):
    email: EmailStr
    password: str
    full_name: Optional[str] = None

class SignInRequest(BaseModel):
    email: EmailStr
    password: str

class AuthResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: dict

class UserResponse(BaseModel):
    id: str
    email: str
    full_name: Optional[str] = None

@router.post("/signup", response_model=AuthResponse)
async def signup(request: SignUpRequest):
    """Create a new user account"""
    try:
        # Sign up user with Supabase Auth
        response = supabase.auth.sign_up({
            "email": request.email,
            "password": request.password,
            "options": {
                "data": {
                    "full_name": request.full_name
                }
            }
        })
        
        if response.user is None:
            raise HTTPException(status_code=400, detail="Failed to create user")
        
        return {
            "access_token": response.session.access_token if response.session else "",
            "token_type": "bearer",
            "user": {
                "id": response.user.id,
                "email": response.user.email,
                "full_name": request.full_name
            }
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/signin", response_model=AuthResponse)
async def signin(request: SignInRequest):
    """Sign in an existing user"""
    try:
        # Sign in user with Supabase Auth
        response = supabase.auth.sign_in_with_password({
            "email": request.email,
            "password": request.password
        })
        
        # Supabase client returns a response object with user and session
        # If authentication fails, it will raise an exception
        if not response:
            raise HTTPException(status_code=401, detail="Invalid email or password")
        
        # Access user and session from response
        user = response.user
        session = response.session
        
        if not user or not session:
            raise HTTPException(status_code=401, detail="Invalid email or password")
        
        # Get user profile
        try:
            profile_response = supabase.table("profiles").select("*").eq("id", user.id).single().execute()
            profile = profile_response.data if profile_response.data else {}
        except:
            profile = {}
        
        return {
            "access_token": session.access_token,
            "token_type": "bearer",
            "user": {
                "id": user.id,
                "email": user.email,
                "full_name": profile.get("full_name")
            }
        }
    except HTTPException:
        raise
    except Exception as e:
        # Supabase auth errors are typically AuthApiError
        error_msg = str(e).lower()
        if "invalid" in error_msg or "credentials" in error_msg or "password" in error_msg:
            raise HTTPException(status_code=401, detail="Invalid email or password")
        # Log unexpected errors
        print(f"Unexpected auth error: {e}")
        raise HTTPException(status_code=401, detail="Invalid email or password")

@router.get("/me", response_model=UserResponse)
async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    """Get current authenticated user"""
    try:
        # Verify token and get user
        token = credentials.credentials
        user_response = supabase.auth.get_user(token)
        
        if user_response.user is None:
            raise HTTPException(status_code=401, detail="Invalid token")
        
        # Get user profile
        profile_response = supabase.table("profiles").select("*").eq("id", user_response.user.id).single().execute()
        profile = profile_response.data if profile_response.data else {}
        
        return {
            "id": user_response.user.id,
            "email": user_response.user.email,
            "full_name": profile.get("full_name")
        }
    except Exception as e:
        raise HTTPException(status_code=401, detail="Invalid token")

@router.post("/signout")
async def signout(credentials: HTTPAuthorizationCredentials = Depends(security)):
    """Sign out the current user"""
    try:
        token = credentials.credentials
        supabase.auth.sign_out(token)
        return {"message": "Signed out successfully"}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

