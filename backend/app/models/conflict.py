import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, DateTime, Text, ForeignKey, JSON
from sqlalchemy.orm import relationship
from backend.app.database import Base


class Conflict(Base):
    __tablename__ = "conflicts"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    patient_id = Column(String(36), ForeignKey("patients.id", ondelete="CASCADE"), nullable=False, index=True)

    conflict_type = Column(String(100), nullable=False) # ALLERGY_MEDICATION, TEMPORAL_INCONSISTENCY, CONTRADICTORY_RECORDS
    severity = Column(String(50), default="MEDIUM", nullable=False) # HIGH, MEDIUM, LOW
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=False)
    
    entity_a = Column(String(255), nullable=True) # e.g. Allergy: Penicillin
    entity_b = Column(String(255), nullable=True) # e.g. Medication: Amoxicillin
    
    provenance = Column(String(50), default="SYSTEM_DERIVED", nullable=False)
    status = Column(String(50), default="ACTIVE", nullable=False) # ACTIVE, RESOLVED, DISMISSED
    resolution_notes = Column(Text, nullable=True)
    
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)

    # Relationships
    patient = relationship("Patient", back_populates="conflicts")

