from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from core.api.systems import router as systems_router
from api.auth import router as auth_router
from api.projects import router as projects_router
from api.stats import router as stats_router

app = FastAPI()

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],  # Next.js default port
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(systems_router)
app.include_router(auth_router)
app.include_router(projects_router)
app.include_router(stats_router)

@app.get("/")
async def read_root():
    return {"message": "Hydra API", "version": "0.1.0"}

@app.get("/items/{item_id}")
async def read_item(item_id: int):
    return {"item_id": item_id}


