import pytest
from backend.app.models.patient import Patient
from backend.app.services.timeline_service import TimelineService


def test_timeline_recording_and_ordering(db_session):
    patient = Patient(name="Timeline User", source="USER_PROVIDED")
    db_session.add(patient)
    db_session.commit()

    ev1 = TimelineService.record_event(
        db=db_session,
        patient_id=patient.id,
        event_type="PROFILE_CREATED",
        title="Profile Created",
        description="User registered",
        provenance="USER_PROVIDED",
        event_date="2026-08-01"
    )

    ev2 = TimelineService.record_event(
        db=db_session,
        patient_id=patient.id,
        event_type="REPORT_UPLOADED",
        title="Lab Report",
        description="Uploaded PDF",
        provenance="REPORT_EXTRACTED",
        event_date="2026-08-05"
    )

    timeline = TimelineService.get_patient_timeline(db_session, patient.id)
    assert len(timeline) == 2
    assert timeline[0].title == "Lab Report"
    assert timeline[1].title == "Profile Created"

