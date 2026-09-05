import pytest
from backend.app.models.patient import Patient
from backend.app.models.observation import Observation
from backend.app.services.ai_summary import AISummaryService


def test_deterministic_summary_generation_and_rules(db_session):
    patient = Patient(
        name="Robert Taylor",
        age=55,
        sex="Male",
        symptoms=["Fatigue"],
        existing_conditions=["Hypertension"],
        source="USER_PROVIDED"
    )
    db_session.add(patient)
    db_session.commit()

    obs = Observation(
        patient_id=patient.id,
        test_name="Fasting Glucose",
        value_text="125",
        numeric_value=125.0,
        unit="mg/dL",
        original_reference_range="70 - 99",
        status="HIGH",
        status_reason="125.0 falls above the supplied upper bound 99.0.",
        provenance="REPORT_EXTRACTED"
    )
    db_session.add(obs)
    db_session.commit()

    summary = AISummaryService.generate_summary(db_session, patient.id)
    assert summary is not None
    assert summary.patient_id == patient.id
    assert "Robert Taylor" in summary.summary_text
    assert "Fasting Glucose" in summary.summary_text
    assert "HIGH" in str(summary.key_observations)
    # Ensure disclaimer is included
    assert "does not constitute a medical diagnosis" in summary.summary_text

