from fastapi import APIRouter, Depends, Response
from sqlalchemy.orm import Session

from backend.app.database import get_db
from backend.app.schemas.patient import PatientResponse
from backend.app.services.demo_data import DemoDataService

router = APIRouter(prefix="/demo", tags=["Demo & Synthetic Data"])


@router.post("/seed", response_model=PatientResponse)
def seed_demo_data(db: Session = Depends(get_db)):
    """
    Seeds a complete synthetic demo patient (Sarah Jenkins) with
    laboratory results, conflict warnings, timeline events, and AI summary.
    """
    patient = DemoDataService.seed_demo_patient(db)
    return patient


@router.get("/synthetic-report.pdf")
def download_synthetic_pdf():
    """
    Generates and downloads a realistic synthetic PDF laboratory report
    for testing the upload & extraction workflow.
    """
    pdf_bytes = DemoDataService.generate_synthetic_pdf_bytes()
    return Response(
        content=pdf_bytes,
        media_type="application/pdf",
        headers={"Content-Disposition": "attachment; filename=Apex_Synthetic_Lab_Report.pdf"}
    )

