import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Integer, DateTime, Text, ForeignKey, JSON
from sqlalchemy.orm import relationship
from backend.app.database import Base


class MedicalReport(Base):
    __tablename__ = "medical_reports"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    patient_id = Column(String(36), ForeignKey("patients.id", ondelete="CASCADE"), nullable=False, index=True)
    
    title = Column(String(255), nullable=False)
    report_type = Column(String(100), default="LABORATORY", nullable=False)
    report_date = Column(String(50), nullable=True)     # Date stated on the report
    laboratory_name = Column(String(255), nullable=True) # Lab/Hospital name if present
    
    # File metadata
    file_name = Column(String(255), nullable=False)     # Safe storage identifier
    original_file_name = Column(String(255), nullable=False)
    file_size_bytes = Column(Integer, nullable=False)
    file_type = Column(String(50), nullable=False)      # pdf, txt, json
    
    # Raw extracted text content & page metadata
    raw_text = Column(Text, nullable=False)
    pages_metadata = Column(JSON, default=list)        # list of {page_num: int, text: str}
    
    # Processing status
    status = Column(String(50), default="PROCESSED", nullable=False) # PROCESSED, FAILED, PENDING
    provenance = Column(String(50), default="REPORT_EXTRACTED", nullable=False)
    
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)
    
    # Relationships
    patient = relationship("Patient", back_populates="reports")
    observations = relationship("Observation", back_populates="report", cascade="all, delete-orphan")

