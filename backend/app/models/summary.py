import uuid
from datetime import datetime
from sqlalchemy import Column, String, DateTime, Text, ForeignKey, JSON
from sqlalchemy.orm import relationship
from backend.app.database import Base


class AISummary(Base):
    __tablename__ = "ai_summaries"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    patient_id = Column(String(36), ForeignKey("patients.id", ondelete="CASCADE"), nullable=False, index=True)

    summary_text = Column(Text, nullable=False)
    key_observations = Column(JSON, default=list) # List of key structured findings
    limitations = Column(JSON, default=list)      # Explicit list of unavailable data / disclaimers
    structured_payload = Column(JSON, default=dict)
    
    provenance = Column(String(50), default="AI_GENERATED", nullable=False)
    model_name = Column(String(100), default="gemini-2.5-flash", nullable=False)
    
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    # Relationships
    patient = relationship("Patient", back_populates="summaries")

