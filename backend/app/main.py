import os
import logging
from pathlib import Path
from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse, FileResponse
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from backend.app.config import settings
from backend.app.database import engine, Base
import backend.app.models # Register all ORM models
from backend.app.routers import (
    health_router,
    patients_router,
    reports_router,
    observations_router,
    timeline_router,
    summary_router,
    conflicts_router,
    demo_router,
)

# Setup logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
)
logger = logging.getLogger("medlens")

# Create database tables automatically
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="MedLens API",
    description="AI-Powered Clinical Information Intelligence & Provenance Tracking",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list or ["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global Safe Exception Handler (prevents leaking stack traces or internal paths)
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logger.error(f"Unhandled error processing request {request.url.path}: {exc}", exc_info=True)
    return JSONResponse(
        status_code=500,
        content={"detail": "An internal server error occurred. Please consult system logs."}
    )

# Include API Routers
app.include_router(health_router)
app.include_router(patients_router)
app.include_router(reports_router)
app.include_router(observations_router)
app.include_router(timeline_router)
app.include_router(summary_router)
app.include_router(conflicts_router)
app.include_router(demo_router)

# Mount Frontend static files if dist directory exists (for unified Cloud Run deployment)
frontend_dist_path = Path(__file__).resolve().parent.parent.parent / "frontend" / "dist"
if frontend_dist_path.exists() and frontend_dist_path.is_dir():
    # Mount assets folder
    assets_path = frontend_dist_path / "assets"
    if assets_path.exists():
        app.mount("/assets", StaticFiles(directory=str(assets_path)), name="assets")

    # SPA catch-all for remaining routes
    @app.get("/{full_path:path}")
    async def serve_spa(full_path: str):
        # Do not intercept API routes or documentation
        if full_path.startswith(("docs", "redoc", "openapi.json", "health", "patients", "reports", "observations", "demo", "conflicts")):
            return JSONResponse(status_code=404, content={"detail": "Not found"})
        
        file_path = frontend_dist_path / full_path
        if file_path.is_file():
            return FileResponse(file_path)
        
        index_file = frontend_dist_path / "index.html"
        if index_file.exists():
            return FileResponse(index_file)
        return JSONResponse(status_code=404, content={"detail": "Frontend index.html not found"})
else:
    @app.get("/")
    def root_info():
        return {
            "name": "MedLens API",
            "tagline": "AI-Powered Clinical Information Intelligence",
            "version": "1.0.0",
            "status": "online",
            "docs": "/docs",
            "health": "/health"
        }

