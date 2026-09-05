from fastapi import APIRouter
from backend.app.config import settings

router = APIRouter(tags=["Health"])


@router.get("/health")
def health_check():
    """
    Lightweight health check for Cloud Run and monitoring.
    Does not require external AI services.
    """
    return {
        "status": "healthy",
        "app": settings.APP_NAME,
        "environment": settings.APP_ENV,
        "ai_provider": settings.AI_PROVIDER,
        "gemini_configured": bool(settings.GEMINI_API_KEY)
    }

