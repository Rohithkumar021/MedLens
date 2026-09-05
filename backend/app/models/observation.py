import uuid
from datetime import datetime
from sqlalchemy import Column, String, Float, Integer, Boolean, DateTime, Text, ForeignKey
from sqlalchemy.orm import relationship
from backend.app.database import Base


class Observation(Base):
    __tablename__ = "observations"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    report_id = Column(String(36), ForeignKey("medical_reports.id", ondelete="CASCADE"), nullable=True, index=True)
    patient_id = Column(String(36), ForeignKey("patients.id", ondelete="CASCADE"), nullable=False, index=True)

    test_name = Column(String(255), nullable=False, index=True)
    value_text = Column(String(255), nullable=False)
    numeric_value = Column(Float, nullable=True)
    unit = Column(String(50), nullable=True)
    
    # Reference range tracking
    original_reference_range = Column(String(255), nullable=True)   # Exactly as found in report
    normalized_reference_range = Column(String(255), nullable=True) # Deterministically parsed range
    
    # Deterministic status & reasoning
    status = Column(String(50), nullable=False, default="UNKNOWN")  # LOW, NORMAL, HIGH, UNKNOWN, NOT_AVAILABLE
    status_reason = Column(Text, nullable=True)                    # e.g., "17.0 falls between lower bound 10 and upper bound 20"
    abnormal_flag = Column(String(50), nullable=True)              # Flag from report (e.g. 'H', 'L', 'CRITICAL')
    
    # Provenance and extraction fidelity
    source_page = Column(Integer, nullable=True)
    original_text = Column(Text, nullable=True)                    # Exact raw line/snippet from document
    provenance = Column(String(50), default="REPORT_EXTRACTED", nullable=False) # REPORT_EXTRACTED, USER_PROVIDED, SYSTEM_DERIVED
    confidence = Column(String(50), default="HIGH", nullable=False) # HIGH, MEDIUM, LOW (extraction certainty)
    
    # Human Review Workflow
    is_reviewed = Column(Boolean, default=False, nullable=False)
    review_status = Column(String(50), default="UNREVIEWED", nullable=False) # UNREVIEWED, REVIEWED, CONFIRMED, CORRECTED
    corrected_value = Column(String(255), nullable=True)
    corrected_status = Column(String(50), nullable=True)
    reviewer_notes = Column(Text, nullable=True)
    reviewed_at = Column(DateTime, nullable=True)
    
    observation_date = Column(String(50), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    
    # Relationships
    patient = relationship("Patient", back_populates="observations")
    report = relationship("MedicalReport", back_populates="observations")
    review_records = relationship("ReviewRecord", back_populates="observation", cascade="all, delete-orphan")


class ReviewRecord(Base):
    __tablename__ = "review_records"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    observation_id = Column(String(36), ForeignKey("observations.id", ondelete="CASCADE"), nullable=False, index=True)
    
    original_value = Column(String(255), nullable=False)
    corrected_value = Column(String(255), nullable=False)
    original_status = Column(String(50), nullable=False)
    corrected_status = Column(String(50), nullable=False)
    action = Column(String(50), nullable=False) # CONFIRM, EDIT, REJECT
    notes = Column(Text, nullable=True)
    reviewer = Column(String(100), default="Clinician / Reviewer", nullable=False)
    
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    
    # Relationships
    observation = relationship("Observation", back_populates="review_records")

