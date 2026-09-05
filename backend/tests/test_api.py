import io
import pytest
from backend.app.services.demo_data import DemoDataService


def test_health_endpoint(client):
    res = client.get("/health")
    assert res.status_code == 200
    data = res.json()
    assert data["status"] == "healthy"
    assert data["app"] == "MedLens"


def test_create_and_get_patient(client):
    payload = {
        "name": "Alice Smith",
        "age": 34,
        "date_of_birth": "1990-05-12",
        "sex": "Female",
        "symptoms": ["Migraine", "Nausea"],
        "allergies": ["Sulfa"],
        "medications": ["Sumatriptan 50mg"]
    }
    res = client.post("/patients", json=payload)
    assert res.status_code == 201
    patient = res.json()
    assert patient["name"] == "Alice Smith"
    assert patient["source"] == "USER_PROVIDED"
    patient_id = patient["id"]

    # Retrieve patient
    res2 = client.get(f"/patients/{patient_id}")
    assert res2.status_code == 200
    assert res2.json()["name"] == "Alice Smith"


def test_upload_report_and_extract_results(client):
    # Create patient
    p_res = client.post("/patients", json={"name": "Bob Miller", "age": 45, "sex": "Male"})
    patient_id = p_res.json()["id"]

    # Generate synthetic PDF
    pdf_bytes = DemoDataService.generate_synthetic_pdf_bytes()

    res = client.post(
        f"/patients/{patient_id}/reports",
        files={"file": ("test_report.pdf", pdf_bytes, "application/pdf")},
        data={"title": "Apex Lab Panel"}
    )
    assert res.status_code == 201
    report = res.json()
    assert report["patient_id"] == patient_id
    assert report["file_type"] == "pdf"
    assert len(report["raw_text"]) > 0

    # Get observations
    obs_res = client.get(f"/reports/{report['id']}/results")
    assert obs_res.status_code == 200
    observations = obs_res.json()
    assert len(observations) > 0

    # Find Fasting Glucose
    glu = next((o for o in observations if "Glucose" in o["test_name"]), None)
    assert glu is not None
    assert glu["status"] == "HIGH"
    assert glu["provenance"] == "REPORT_EXTRACTED"


def test_human_review_workflow(client):
    # Seed demo patient
    seed_res = client.post("/demo/seed")
    assert seed_res.status_code == 200
    patient = seed_res.json()
    patient_id = patient["id"]

    # Get observations
    obs_res = client.get(f"/patients/{patient_id}/observations")
    assert obs_res.status_code == 200
    obs_list = obs_res.json()
    assert len(obs_list) > 0
    first_obs = obs_list[0]

    # Perform review
    review_res = client.post(
        f"/observations/{first_obs['id']}/review",
        json={
            "action": "EDIT",
            "corrected_value": "13.6",
            "corrected_status": "NORMAL",
            "notes": "Verified against physical paper log by Dr. Lee",
            "reviewer": "Dr. Lee, MD"
        }
    )
    assert review_res.status_code == 200
    reviewed_obs = review_res.json()
    assert reviewed_obs["is_reviewed"] is True
    assert reviewed_obs["review_status"] == "CORRECTED"
    assert reviewed_obs["corrected_value"] == "13.6"
    assert len(reviewed_obs["review_records"]) >= 1


def test_ai_summary_generation_endpoint(client):
    seed_res = client.post("/demo/seed")
    patient_id = seed_res.json()["id"]

    res = client.post(f"/patients/{patient_id}/summary")
    assert res.status_code == 200
    summary = res.json()
    assert summary["patient_id"] == patient_id
    assert len(summary["summary_text"]) > 50
    assert len(summary["limitations"]) > 0


def test_patient_conflicts_endpoint(client):
    seed_res = client.post("/demo/seed")
    patient_id = seed_res.json()["id"]

    res = client.get(f"/patients/{patient_id}/conflicts")
    assert res.status_code == 200
    conflicts = res.json()
    # Sarah Jenkins has Penicillin allergy vs Amoxicillin medication
    assert any(c["conflict_type"] == "ALLERGY_MEDICATION" for c in conflicts)

