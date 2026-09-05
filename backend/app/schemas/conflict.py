from typing import Optional
from datetime import datetime
from pydantic import BaseModel, ConfigDict


class ConflictBase(BaseModel):
    conflict_type: str # ALLERGY_MEDICATION, TEMPORAL_INCONSISTENCY, CONTRADICTORY_RECORDS
    severity: str = "MEDIUM" # HIGH, MEDIUM, LOW
    title: str
    description: str
    entity_a: Optional[str] = None
    entity_b: Optional[str] = None
    provenance: str = "SYSTEM_DERIVED"
    status: str = "ACTIVE" # ACTIVE, RESOLVED, DISMISSED


class ConflictCreate(ConflictBase):
    patient_id: str


class ConflictResolveRequest(BaseModel):
    status: str = "RESOLVED" # RESOLVED or DISMISSED
    resolution_notes: Optional[str] = None


class ConflictResponse(ConflictBase):
    id: str
    patient_id: str
    resolution_notes: Optional[str] = None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)

