from typing import List
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, status
from sqlalchemy.orm import Session

from backend.app.config import settings
from backend.app.database import get_db
from backend.app.models.patient import Patient
from backend.app.models.report import MedicalReport
from backend.app.models.observation import Observation
from backend.app.schemas.report import MedicalReportResponse
from backend.app.schemas.observation import ObservationResponse
from backend.app.services.security import SecurityService
from backend.app.services.pdf_extractor import PDFExtractor
from backend.app.services.medical_parser import MedicalParser
from backend.app.services.conflict_engine import ConflictEngine
from backend.app.services.timeline_service import TimelineService

router = APIRouter(tags=["Medical Reports"])


@router.post("/patients/{patient_id}/reports", response_model=MedicalReportResponse, status_code=status.HTTP_201_CREATED)
async def upload_patient_report(
    patient_id: str,
    file: UploadFile = File(...),
    title: str = Form(None),
    report_type: str = Form("LABORATORY"),
    db: Session = Depends(get_db)
):
    patient = db.query(Patient).filter(Patient.id == patient_id).first()
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found.")

    # 1. Validate file format and size
    max_size_bytes = settings.MAX_UPLOAD_SIZE_MB * 1024 * 1024
    ext = SecurityService.validate_file(file, max_size_bytes)
    
    file_bytes = await file.read()
    if len(file_bytes) > max_size_bytes:
        raise HTTPException(
            status_code=413,
            detail=f"File size exceeds maximum limit of {settings.MAX_UPLOAD_SIZE_MB}MB."
        )

    if len(file_bytes) == 0:
        raise HTTPException(status_code=400, detail="Uploaded file is empty.")

    # 2. Generate safe internal name
    safe_name, _ = SecurityService.generate_safe_storage_name(file.filename)
    report_title = title.strip() if title and title.strip() else (file.filename or "Clinical Report")

    # 3. Extract text from PDF / Document
    raw_text, pages_meta = PDFExtractor.extract_from_bytes(file_bytes, ext)

    # 4. Parse medical observations & metadata
    parsed_obs, report_meta = MedicalParser.parse_report_content(raw_text, pages_meta)

    # 5. Save MedicalReport record
    report = MedicalReport(
        patient_id=patient_id,
        title=report_title,
        report_type=report_type,
        report_date=report_meta.get("report_date"),
        laboratory_name=report_meta.get("laboratory_name"),
        file_name=safe_name,
        original_file_name=file.filename or "uploaded_report",
        file_size_bytes=len(file_bytes),
        file_type=ext,
        raw_text=raw_text,
        pages_metadata=pages_meta,
        status="PROCESSED",
        provenance="REPORT_EXTRACTED"
    )
    db.add(report)
    db.commit()
    db.refresh(report)

    # 6. Save extracted observations
    for o in parsed_obs:
        obs_record = Observation(
            patient_id=patient_id,
            report_id=report.id,
            test_name=o["test_name"],
            value_text=o["value_text"],
            numeric_value=o["numeric_value"],
            unit=o["unit"],
            original_reference_range=o["original_reference_range"],
            normalized_reference_range=o["normalized_reference_range"],
            status=o["status"],
            status_reason=o["status_reason"],
            abnormal_flag=o["abnormal_flag"],
            source_page=o["source_page"],
            original_text=o["original_text"],
            provenance=o["provenance"],
            confidence=o["confidence"],
            is_reviewed=False,
            review_status="UNREVIEWED",
            observation_date=report_meta.get("report_date")
        )
        db.add(obs_record)

    db.commit()

    # 7. Record Timeline Event
    TimelineService.record_event(
        db=db,
        patient_id=patient_id,
        event_type="REPORT_UPLOADED",
        title=f"Report Processed: {report.title}",
        description=f"Extracted {len(parsed_obs)} observations from {report.original_file_name}.",
        provenance="REPORT_EXTRACTED",
        event_date=report_meta.get("report_date") or "Date Not Stated",
        reference_id=report.id
    )

    # 8. Re-scan for clinical conflicts
    ConflictEngine.scan_and_update_conflicts(db, patient_id)

    db.refresh(report)
    return report


@router.get("/patients/{patient_id}/reports", response_model=List[MedicalReportResponse])
def get_patient_reports(patient_id: str, db: Session = Depends(get_db)):
    reports = db.query(MedicalReport).filter(MedicalReport.patient_id == patient_id).order_by(MedicalReport.created_at.desc()).all()
    return reports


@router.get("/reports/{report_id}", response_model=MedicalReportResponse)
def get_report_detail(report_id: str, db: Session = Depends(get_db)):
    report = db.query(MedicalReport).filter(MedicalReport.id == report_id).first()
    if not report:
        raise HTTPException(status_code=404, detail="Medical report not found.")
    return report


@router.get("/reports/{report_id}/results", response_model=List[ObservationResponse])
def get_report_results(report_id: str, db: Session = Depends(get_db)):
    observations = db.query(Observation).filter(Observation.report_id == report_id).all()
    return observations

