from typing import Optional, List, Dict, Any
from datetime import datetime
from pydantic import BaseModel, ConfigDict
from backend.app.schemas.observation import ObservationResponse


class PageMetadata(BaseModel):
    page_num: int
    text: str


class MedicalReportResponse(BaseModel):
    id: str
    patient_id: str
    title: str
    report_type: str
    report_date: Optional[str] = None
    laboratory_name: Optional[str] = None
    file_name: str
    original_file_name: str
    file_size_bytes: int
    file_type: str
    raw_text: str
    pages_metadata: List[PageMetadata] = []
    status: str
    provenance: str
    created_at: datetime
    observations: List[ObservationResponse] = []

    model_config = ConfigDict(from_attributes=True)

