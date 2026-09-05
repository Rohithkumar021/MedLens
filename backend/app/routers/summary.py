from typing import Optional
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from backend.app.database import get_db
from backend.app.models.summary import AISummary
from backend.app.schemas.summary import AISummaryResponse, GenerateSummaryRequest
from backend.app.services.ai_summary import AISummaryService
from backend.app.services.timeline_service import TimelineService

router = APIRouter(tags=["AI Summary"])


@router.get("/patients/{patient_id}/summary", response_model=Optional[AISummaryResponse])
def get_latest_summary(patient_id: str, db: Session = Depends(get_db)):
    summary = db.query(AISummary).filter(
        AISummary.patient_id == patient_id
    ).order_by(AISummary.created_at.desc()).first()
    return summary


@router.post("/patients/{patient_id}/summary", response_model=AISummaryResponse)
def generate_summary(
    patient_id: str,
    req: GenerateSummaryRequest = GenerateSummaryRequest(),
    db: Session = Depends(get_db)
):
    try:
        summary = AISummaryService.generate_summary(db, patient_id)
        
        # Record Timeline Event
        TimelineService.record_event(
            db=db,
            patient_id=patient_id,
            event_type="AI_SUMMARY_GENERATED",
            title="Clinical AI Summary Generated",
            description=f"Generated using {summary.model_name}. Explains {len(summary.key_observations)} structured findings.",
            provenance=summary.provenance,
            reference_id=summary.id
        )
        return summary
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to generate summary: {str(e)}")

