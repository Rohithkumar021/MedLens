from typing import List, Dict, Any, Optional
from datetime import datetime
from pydantic import BaseModel, ConfigDict


class KeyObservationSummary(BaseModel):
    test_name: str
    value: str
    status: str
    reference_range: Optional[str] = None
    provenance: str = "REPORT_EXTRACTED"
    clinical_context: str


class AISummaryResponse(BaseModel):
    id: str
    patient_id: str
    summary_text: str
    key_observations: List[KeyObservationSummary] = []
    limitations: List[str] = []
    structured_payload: Dict[str, Any] = {}
    provenance: str = "AI_GENERATED"
    model_name: str
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class GenerateSummaryRequest(BaseModel):
    focus_areas: Optional[List[str]] = None
    include_timeline: bool = True

