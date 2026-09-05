from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from backend.app.database import get_db
from backend.app.models.conflict import Conflict
from backend.app.schemas.conflict import ConflictResponse, ConflictResolveRequest
from backend.app.services.conflict_engine import ConflictEngine

router = APIRouter(tags=["Clinical Inconsistencies & Conflicts"])


@router.get("/patients/{patient_id}/conflicts", response_model=List[ConflictResponse])
def get_patient_conflicts(
    patient_id: str,
    active_only: bool = True,
    db: Session = Depends(get_db)
):
    # Automatically ensure up-to-date scan
    ConflictEngine.scan_and_update_conflicts(db, patient_id)
    
    query = db.query(Conflict).filter(Conflict.patient_id == patient_id)
    if active_only:
        query = query.filter(Conflict.status == "ACTIVE")
    
    return query.order_by(Conflict.created_at.desc()).all()


@router.post("/conflicts/{conflict_id}/resolve", response_model=ConflictResponse)
def resolve_conflict(
    conflict_id: str,
    req: ConflictResolveRequest,
    db: Session = Depends(get_db)
):
    conflict = db.query(Conflict).filter(Conflict.id == conflict_id).first()
    if not conflict:
        raise HTTPException(status_code=404, detail="Conflict record not found.")

    conflict.status = req.status
    conflict.resolution_notes = req.resolution_notes
    db.commit()
    db.refresh(conflict)
    return conflict

