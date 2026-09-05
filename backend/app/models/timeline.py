import uuid
from datetime import datetime
from sqlalchemy import Column, String, DateTime, Text, ForeignKey, JSON
from sqlalchemy.orm import relationship
from backend.app.database import Base


class TimelineEvent(Base):
    __tablename__ = "timeline_events"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    patient_id = Column(String(36), ForeignKey("patients.id", ondelete="CASCADE"), nullable=False, index=True)

    event_type = Column(String(100), nullable=False) # PROFILE_CREATED, REPORT_UPLOADED, LAB_RESULT, MEDICATION_RECORDED, ALLERGY_RECORDED, REVIEW_UPDATED, AI_SUMMARY_GENERATED
    event_date = Column(String(50), nullable=True)   # Date of event (e.g. YYYY-MM-DD or Unknown)
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    
    provenance = Column(String(50), nullable=False)  # USER_PROVIDED, REPORT_EXTRACTED, AI_GENERATED, SYSTEM_DERIVED
    reference_id = Column(String(100), nullable=True) # ID of linked report, observation, etc.
    event_metadata = Column(JSON, default=dict)
    
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    # Relationships
    patient = relationship("Patient", back_populates="timeline_events")

