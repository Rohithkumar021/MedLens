from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import func
from sqlalchemy.orm import Session

from backend.app.database import get_db
from backend.app.models.patient import Patient
from backend.app.models.report import MedicalReport
from backend.app.models.observation import Observation
from backend.app.models.conflict import Conflict
from backend.app.schemas.patient import PatientCreate, PatientUpdate, PatientResponse
from backend.app.services.timeline_service import TimelineService
from backend.app.services.conflict_engine import ConflictEngine

router = APIRouter(prefix="/patients", tags=["Patients"])


@router.get("", response_model=List[PatientResponse])
def list_patients(db: Session = Depends(get_db)):
    patients = db.query(Patient).order_by(Patient.created_at.desc()).all()
    if not patients:
        return []

    # Batch compute counts in single aggregated queries to prevent N+1 query overhead
    rep_counts = dict(
        db.query(MedicalReport.patient_id, func.count(MedicalReport.id))
        .group_by(MedicalReport.patient_id)
        .all()
    )
    obs_counts = dict(
        db.query(Observation.patient_id, func.count(Observation.id))
        .group_by(Observation.patient_id)
        .all()
    )
    conf_counts = dict(
        db.query(Conflict.patient_id, func.count(Conflict.id))
        .filter(Conflict.status == "ACTIVE")
        .group_by(Conflict.patient_id)
        .all()
    )

    results = []
    for p in patients:
        p_dict = {
            "id": p.id,
            "name": p.name,
            "age": p.age,
            "date_of_birth": p.date_of_birth,
            "sex": p.sex,
            "symptoms": p.symptoms or [],
            "existing_conditions": p.existing_conditions or [],
            "allergies": p.allergies or [],
            "medications": p.medications or [],
            "notes": p.notes,
            "source": p.source,
            "created_at": p.created_at,
            "updated_at": p.updated_at,
            "reports_count": rep_counts.get(p.id, 0),
            "observations_count": obs_counts.get(p.id, 0),
            "conflicts_count": conf_counts.get(p.id, 0)
        }
        results.append(p_dict)
    return results


@router.post("", response_model=PatientResponse, status_code=status.HTTP_201_CREATED)
def create_patient(patient_in: PatientCreate, db: Session = Depends(get_db)):
    patient = Patient(
        name=patient_in.name,
        age=patient_in.age,
        date_of_birth=patient_in.date_of_birth,
        sex=patient_in.sex,
        symptoms=patient_in.symptoms,
        existing_conditions=patient_in.existing_conditions,
        allergies=patient_in.allergies,
        medications=patient_in.medications,
        notes=patient_in.notes,
        source="USER_PROVIDED"
    )
    db.add(patient)
    db.commit()
    db.refresh(patient)

    # Record Timeline Event
    TimelineService.record_event(
        db=db,
        patient_id=patient.id,
        event_type="PROFILE_CREATED",
        title="Patient Record Created",
        description="Patient demographics, conditions, allergies, and medications entered.",
        provenance="USER_PROVIDED"
    )

    # Scan for potential conflicts immediately
    ConflictEngine.scan_and_update_conflicts(db, patient.id)

    return patient


@router.get("/{patient_id}", response_model=PatientResponse)
def get_patient(patient_id: str, db: Session = Depends(get_db)):
    patient = db.query(Patient).filter(Patient.id == patient_id).first()
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found.")
    
    rep_count = db.query(MedicalReport).filter(MedicalReport.patient_id == patient.id).count()
    obs_count = db.query(Observation).filter(Observation.patient_id == patient.id).count()
    conf_count = db.query(Conflict).filter(Conflict.patient_id == patient.id, Conflict.status == "ACTIVE").count()

    p_dict = {
        "id": patient.id,
        "name": patient.name,
        "age": patient.age,
        "date_of_birth": patient.date_of_birth,
        "sex": patient.sex,
        "symptoms": patient.symptoms or [],
        "existing_conditions": patient.existing_conditions or [],
        "allergies": patient.allergies or [],
        "medications": patient.medications or [],
        "notes": patient.notes,
        "source": patient.source,
        "created_at": patient.created_at,
        "updated_at": patient.updated_at,
        "reports_count": rep_count,
        "observations_count": obs_count,
        "conflicts_count": conf_count
    }
    return p_dict


@router.put("/{patient_id}", response_model=PatientResponse)
def update_patient(patient_id: str, patient_in: PatientUpdate, db: Session = Depends(get_db)):
    patient = db.query(Patient).filter(Patient.id == patient_id).first()
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found.")

    update_data = patient_in.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(patient, field, value)

    db.commit()
    db.refresh(patient)

    # Re-scan conflicts
    ConflictEngine.scan_and_update_conflicts(db, patient.id)

    return patient


@router.delete("/{patient_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_patient(patient_id: str, db: Session = Depends(get_db)):
    patient = db.query(Patient).filter(Patient.id == patient_id).first()
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found.")
    db.delete(patient)
    db.commit()
    return None

