from typing import Optional, List
from datetime import datetime
from pydantic import BaseModel, Field, ConfigDict


class ReviewRecordResponse(BaseModel):
    id: str
    observation_id: str
    original_value: str
    corrected_value: str
    original_status: str
    corrected_status: str
    action: str
    notes: Optional[str] = None
    reviewer: str
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class ObservationBase(BaseModel):
    test_name: str
    value_text: str
    numeric_value: Optional[float] = None
    unit: Optional[str] = None
    original_reference_range: Optional[str] = None
    normalized_reference_range: Optional[str] = None
    status: str = "UNKNOWN" # LOW, NORMAL, HIGH, UNKNOWN, NOT_AVAILABLE
    status_reason: Optional[str] = None
    abnormal_flag: Optional[str] = None
    source_page: Optional[int] = None
    original_text: Optional[str] = None
    provenance: str = "REPORT_EXTRACTED"
    confidence: str = "HIGH" # HIGH, MEDIUM, LOW
    observation_date: Optional[str] = None


class ObservationCreate(ObservationBase):
    patient_id: str
    report_id: Optional[str] = None


class ObservationReviewRequest(BaseModel):
    action: str = Field(..., description="Action taken: CONFIRM, EDIT, REJECT")
    corrected_value: Optional[str] = Field(None, description="Corrected value if edited")
    corrected_status: Optional[str] = Field(None, description="Corrected status: LOW, NORMAL, HIGH, UNKNOWN")
    notes: Optional[str] = Field(None, description="Reviewer justification or notes")
    reviewer: Optional[str] = Field("Clinician Reviewer", description="Name/Role of reviewer")


class ObservationResponse(ObservationBase):
    id: str
    patient_id: str
    report_id: Optional[str] = None
    is_reviewed: bool
    review_status: str
    corrected_value: Optional[str] = None
    corrected_status: Optional[str] = None
    reviewer_notes: Optional[str] = None
    reviewed_at: Optional[datetime] = None
    created_at: datetime
    review_records: List[ReviewRecordResponse] = []

    model_config = ConfigDict(from_attributes=True)

