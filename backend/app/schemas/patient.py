from typing import Optional, List
from datetime import datetime
from pydantic import BaseModel, Field, ConfigDict


class PatientBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=255, description="Full patient name")
    age: Optional[int] = Field(None, ge=0, le=150, description="Age in years")
    date_of_birth: Optional[str] = Field(None, description="Date of birth (YYYY-MM-DD)")
    sex: Optional[str] = Field(None, description="Biological sex or gender identity")
    symptoms: List[str] = Field(default_factory=list, description="Reported symptoms")
    existing_conditions: List[str] = Field(default_factory=list, description="Diagnosed medical conditions")
    allergies: List[str] = Field(default_factory=list, description="Known allergies")
    medications: List[str] = Field(default_factory=list, description="Current medications")
    notes: Optional[str] = Field(None, description="Additional clinician or user notes")


class PatientCreate(PatientBase):
    pass


class PatientUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=255)
    age: Optional[int] = Field(None, ge=0, le=150)
    date_of_birth: Optional[str] = None
    sex: Optional[str] = None
    symptoms: Optional[List[str]] = None
    existing_conditions: Optional[List[str]] = None
    allergies: Optional[List[str]] = None
    medications: Optional[List[str]] = None
    notes: Optional[str] = None


class PatientResponse(PatientBase):
    id: str
    source: str = "USER_PROVIDED"
    created_at: datetime
    updated_at: datetime
    
    # Counts
    reports_count: Optional[int] = 0
    observations_count: Optional[int] = 0
    conflicts_count: Optional[int] = 0

    model_config = ConfigDict(from_attributes=True)

