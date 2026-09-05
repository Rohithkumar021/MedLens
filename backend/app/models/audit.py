import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, DateTime, Text, JSON
from backend.app.database import Base


class AuditEvent(Base):
    __tablename__ = "audit_events"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    patient_id = Column(String(36), nullable=True, index=True)
    action = Column(String(100), nullable=False) # CREATE_PATIENT, UPLOAD_REPORT, REVIEW_OBSERVATION, GENERATE_SUMMARY, RESOLVE_CONFLICT
    actor = Column(String(100), default="User", nullable=False)
    details = Column(JSON, default=dict)
    ip_address = Column(String(50), nullable=True)
    
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)

