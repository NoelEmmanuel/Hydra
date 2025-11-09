from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from trainer_head.api.routes import router as auth_router

app = FastAPI(title="Hydra API", version="0.1.0")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:5173"],  # Add your frontend URLs
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth_router)

@app.get("/")
async def read_root():
    return {"message": "Hydra API", "version": "0.1.0"}

@app.get("/health")
async def health_check():
    return {"status": "healthy"}

