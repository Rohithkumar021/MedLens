from backend.app.routers.health import router as health_router
from backend.app.routers.patients import router as patients_router
from backend.app.routers.reports import router as reports_router
from backend.app.routers.observations import router as observations_router
from backend.app.routers.timeline import router as timeline_router
from backend.app.routers.summary import router as summary_router
from backend.app.routers.conflicts import router as conflicts_router
from backend.app.routers.demo import router as demo_router

__all__ = [
    "health_router",
    "patients_router",
    "reports_router",
    "observations_router",
    "timeline_router",
    "summary_router",
    "conflicts_router",
    "demo_router",
]

