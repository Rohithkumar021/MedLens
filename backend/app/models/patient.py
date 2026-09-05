import uuid
from datetime import datetime
from sqlalchemy import Column, String, Integer, DateTime, Text, JSON
from sqlalchemy.orm import relationship
from backend.app.database import Base


class Patient(Base):
    __tablename__ = "patients"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    name = Column(String(255), nullable=False, index=True)
    age = Column(Integer, nullable=True)
    date_of_birth = Column(String(50), nullable=True)
    sex = Column(String(50), nullable=True)
    
    # User-provided medical context
    symptoms = Column(JSON, default=list)              # list of strings
    existing_conditions = Column(JSON, default=list)   # list of strings
    allergies = Column(JSON, default=list)             # list of strings
    medications = Column(JSON, default=list)           # list of strings
    notes = Column(Text, nullable=True)
    
    # Provenance tag for patient info
    source = Column(String(50), default="USER_PROVIDED", nullable=False)
    
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    # Relationships
    reports = relationship("MedicalReport", back_populates="patient", cascade="all, delete-orphan")
    observations = relationship("Observation", back_populates="patient", cascade="all, delete-orphan")
    timeline_events = relationship("TimelineEvent", back_populates="patient", cascade="all, delete-orphan")
    summaries = relationship("AISummary", back_populates="patient", cascade="all, delete-orphan")
    conflicts = relationship("Conflict", back_populates="patient", cascade="all, delete-orphan")

