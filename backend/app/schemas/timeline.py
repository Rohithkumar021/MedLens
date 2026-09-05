from typing import Optional, Dict, Any
from datetime import datetime
from pydantic import BaseModel, ConfigDict


class TimelineEventBase(BaseModel):
    event_type: str
    event_date: Optional[str] = None
    title: str
    description: Optional[str] = None
    provenance: str
    reference_id: Optional[str] = None
    event_metadata: Dict[str, Any] = {}


class TimelineEventCreate(TimelineEventBase):
    patient_id: str


class TimelineEventResponse(TimelineEventBase):
    id: str
    patient_id: str
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)

