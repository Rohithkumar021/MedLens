from typing import List, Dict, Any, Optional
from sqlalchemy.orm import Session
from backend.app.models.patient import Patient
from backend.app.models.report import MedicalReport
from backend.app.models.observation import Observation
from backend.app.models.timeline import TimelineEvent
from backend.app.models.summary import AISummary


class TimelineService:
    """
    Consolidates structured clinical events, user inputs, laboratory observations,
    audit corrections, and AI summaries into a unified chronological patient timeline.
    """

    @classmethod
    def get_patient_timeline(cls, db: Session, patient_id: str) -> List[TimelineEvent]:
        # Return all persisted timeline events ordered chronologically
        events = db.query(TimelineEvent).filter(
            TimelineEvent.patient_id == patient_id
        ).order_by(TimelineEvent.created_at.desc()).all()
        return events

    @classmethod
    def record_event(
        cls,
        db: Session,
        patient_id: str,
        event_type: str,
        title: str,
        description: Optional[str],
        provenance: str,
        event_date: Optional[str] = None,
        reference_id: Optional[str] = None,
        event_metadata: Optional[Dict[str, Any]] = None
    ) -> TimelineEvent:
        event = TimelineEvent(
            patient_id=patient_id,
            event_type=event_type,
            title=title,
            description=description,
            provenance=provenance,
            event_date=event_date or "Date Not Stated",
            reference_id=reference_id,
            event_metadata=event_metadata or {}
        )
        db.add(event)
        db.commit()
        db.refresh(event)
        return event

