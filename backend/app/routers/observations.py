from datetime import datetime
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from backend.app.database import get_db
from backend.app.models.observation import Observation, ReviewRecord
from backend.app.schemas.observation import ObservationResponse, ObservationReviewRequest
from backend.app.services.timeline_service import TimelineService
from backend.app.services.status_engine import StatusEngine

router = APIRouter(tags=["Observations & Review"])


@router.get("/patients/{patient_id}/observations", response_model=List[ObservationResponse])
def get_patient_observations(
    patient_id: str,
    status_filter: Optional[str] = None,
    unreviewed_only: bool = False,
    db: Session = Depends(get_db)
):
    query = db.query(Observation).filter(Observation.patient_id == patient_id)
    if status_filter:
        query = query.filter(Observation.status == status_filter.upper())
    if unreviewed_only:
        query = query.filter(Observation.is_reviewed == False)
    
    return query.order_by(Observation.created_at.desc()).all()


@router.get("/observations/{observation_id}", response_model=ObservationResponse)
def get_observation(observation_id: str, db: Session = Depends(get_db)):
    obs = db.query(Observation).filter(Observation.id == observation_id).first()
    if not obs:
        raise HTTPException(status_code=404, detail="Observation not found.")
    return obs


@router.post("/observations/{observation_id}/review", response_model=ObservationResponse)
def review_observation(
    observation_id: str,
    review_in: ObservationReviewRequest,
    db: Session = Depends(get_db)
):
    obs = db.query(Observation).filter(Observation.id == observation_id).first()
    if not obs:
        raise HTTPException(status_code=404, detail="Observation not found.")

    original_val = obs.corrected_value or obs.value_text
    original_st = obs.corrected_status or obs.status
    
    action = review_in.action.upper()
    if action not in ("CONFIRM", "EDIT", "REJECT"):
        raise HTTPException(status_code=400, detail="Action must be CONFIRM, EDIT, or REJECT.")

    new_val = review_in.corrected_value.strip() if review_in.corrected_value else original_val
    new_st = review_in.corrected_status.upper() if review_in.corrected_status else original_st

    if action == "CONFIRM":
        obs.review_status = "CONFIRMED"
        new_val = original_val
        new_st = original_st
    elif action == "EDIT":
        obs.review_status = "CORRECTED"
        obs.corrected_value = new_val
        obs.corrected_status = new_st
    elif action == "REJECT":
        obs.review_status = "REJECTED"

    obs.is_reviewed = True
    obs.reviewer_notes = review_in.notes
    obs.reviewed_at = datetime.utcnow()

    # Record Review Audit Log
    review_record = ReviewRecord(
        observation_id=obs.id,
        original_value=original_val,
        corrected_value=new_val,
        original_status=original_st,
        corrected_status=new_st,
        action=action,
        notes=review_in.notes,
        reviewer=review_in.reviewer or "Clinician Reviewer"
    )
    db.add(review_record)
    db.commit()

    # Record Timeline Event
    TimelineService.record_event(
        db=db,
        patient_id=obs.patient_id,
        event_type="REVIEW_UPDATED",
        title=f"Observation Reviewed: {obs.test_name}",
        description=f"Action: {action}. Value: '{new_val}' (Status: {new_st}). Notes: {review_in.notes or 'None'}",
        provenance="USER_PROVIDED",
        reference_id=obs.id
    )

    db.refresh(obs)
    return obs

