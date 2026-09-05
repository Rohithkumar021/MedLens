import pytest
from backend.app.models.patient import Patient
from backend.app.models.observation import Observation
from backend.app.services.conflict_engine import ConflictEngine


def test_allergy_medication_conflict_detection(db_session):
    patient = Patient(
        name="John Doe",
        allergies=["Penicillin"],
        medications=["Amoxicillin 500mg"],
        source="USER_PROVIDED"
    )
    db_session.add(patient)
    db_session.commit()

    conflicts = ConflictEngine.scan_and_update_conflicts(db_session, patient.id)
    assert len(conflicts) >= 1
    c = conflicts[0]
    assert c.conflict_type == "ALLERGY_MEDICATION"
    assert c.severity == "HIGH"
    assert "Penicillin" in c.description
    assert "Amoxicillin" in c.description


def test_no_conflict_when_safe(db_session):
    patient = Patient(
        name="Jane Safe",
        allergies=["Latex"],
        medications=["Metformin 500mg"],
        source="USER_PROVIDED"
    )
    db_session.add(patient)
    db_session.commit()

    conflicts = ConflictEngine.scan_and_update_conflicts(db_session, patient.id)
    assert len(conflicts) == 0


def test_temporal_shift_detection(db_session):
    patient = Patient(name="Temporal Patient", source="USER_PROVIDED")
    db_session.add(patient)
    db_session.commit()

    obs1 = Observation(
        patient_id=patient.id,
        test_name="Hemoglobin",
        value_text="14.0",
        numeric_value=14.0,
        observation_date="2026-01-01",
        status="NORMAL"
    )
    obs2 = Observation(
        patient_id=patient.id,
        test_name="Hemoglobin",
        value_text="10.5",
        numeric_value=10.5,
        observation_date="2026-06-01",
        status="LOW"
    )
    db_session.add_all([obs1, obs2])
    db_session.commit()

    conflicts = ConflictEngine.scan_and_update_conflicts(db_session, patient.id)
    assert len(conflicts) == 1
    assert conflicts[0].conflict_type == "TEMPORAL_INCONSISTENCY"

