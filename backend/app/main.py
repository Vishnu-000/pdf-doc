from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.jobs import router as jobs_router
import os

app = FastAPI(
    title="PDF-Doc Backend",
    version="2.0.0",
    description="Backend service and asynchronous worker API for PDF-Doc toolkit."
)

# Allow CORS for development frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(jobs_router)

@app.get("/")
def read_root():
    return {
        "service": "PDF-Doc API",
        "status": "online",
        "version": "2.0.0",
        "mode": "Phase 2: Hybrid Client & Server Worker Suite Ready"
    }

@app.get("/api/health")
def health_check():
    redis_url = os.getenv("REDIS_URL", "redis://redis:6379/0")
    return {
        "status": "healthy",
        "redis_configured": bool(redis_url),
        "queue_ready": True
    }
