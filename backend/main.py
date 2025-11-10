from fastapi import FastAPI
from core.api.systems import router as systems_router

app = FastAPI()

# Include routers
app.include_router(systems_router)

@app.get("/")
async def read_root():
    return {"message": "Hydra API", "version": "0.1.0"}

@app.get("/items/{item_id}")
async def read_item(item_id: int):
    return {"item_id": item_id}


