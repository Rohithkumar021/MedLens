from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from backend.app.database import get_db
from backend.app.schemas.timeline import TimelineEventResponse
from backend.app.services.timeline_service import TimelineService

router = APIRouter(tags=["Patient Timeline"])


@router.get("/patients/{patient_id}/timeline", response_model=List[TimelineEventResponse])
def get_patient_timeline(patient_id: str, db: Session = Depends(get_db)):
    events = TimelineService.get_patient_timeline(db, patient_id)
    return events

