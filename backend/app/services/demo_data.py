import io
from datetime import datetime
from sqlalchemy.orm import Session
from reportlab.lib.pagesizes import letter
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib import colors

from backend.app.models.patient import Patient
from backend.app.models.report import MedicalReport
from backend.app.models.observation import Observation
from backend.app.services.status_engine import StatusEngine
from backend.app.services.conflict_engine import ConflictEngine
from backend.app.services.timeline_service import TimelineService
from backend.app.services.ai_summary import AISummaryService


class DemoDataService:
    """
    Generates synthetic demo data for seamless hackathon demonstration.
    Includes synthetic PDF generation via ReportLab with real extracted values,
    provenance, reference ranges, conflicts, timeline, and summaries.
    """

    @classmethod
    def generate_synthetic_pdf_bytes(cls) -> bytes:
        """
        Builds a multi-observation synthetic PDF laboratory report.
        """
        buffer = io.BytesIO()
        doc = SimpleDocTemplate(buffer, pagesize=letter, rightMargin=36, leftMargin=36, topMargin=36, bottomMargin=36)
        styles = getSampleStyleSheet()

        title_style = ParagraphStyle(
            "ReportTitle",
            parent=styles["Heading1"],
            fontSize=15,
            leading=18,
            textColor=colors.HexColor("#0f172a")
        )
        meta_style = ParagraphStyle(
            "ReportMeta",
            parent=styles["Normal"],
            fontSize=9,
            leading=12,
            textColor=colors.HexColor("#475569")
        )

        elements = []

        # Header
        elements.append(Paragraph("APEX HEALTH DIAGNOSTICS &amp; PATHOLOGY", title_style))
        elements.append(Paragraph("SYNTHETIC CLINICAL LABORATORY REPORT — METABOLIC &amp; HEMATOLOGY PANEL", meta_style))
        elements.append(Spacer(1, 10))

        # Metadata table
        meta_data = [
            ["Patient Name: Sarah Jenkins", "MRN: SYN-89421", "Report Date: 2026-08-15"],
            ["Age/Sex: 42 / Female", "Ordering Physician: Dr. R. Vance, MD", "Status: Final Verified"]
        ]
        meta_table = Table(meta_data, colWidths=[200, 180, 160])
        meta_table.setStyle(TableStyle([
            ("TEXTCOLOR", (0, 0), (-1, -1), colors.HexColor("#334155")),
            ("FONTSIZE", (0, 0), (-1, -1), 9),
            ("BOTTOMPADDING", (0, 0), (-1, -1), 4),
        ]))
        elements.append(meta_table)
        elements.append(Spacer(1, 15))

        # Laboratory Results Table
        table_data = [
            ["Test Name", "Result", "Units", "Reference Interval", "Flag"],
            ["Hemoglobin", "13.5", "g/dL", "12.0 - 16.0", "NORMAL"],
            ["Fasting Glucose", "138", "mg/dL", "70 - 99", "HIGH"],
            ["Vitamin D (25-OH)", "18.2", "ng/mL", "30.0 - 100.0", "LOW"],
            ["Serum Creatinine", "1.4", "mg/dL", "0.5 - 1.1", "HIGH"],
            ["Platelet Count", "265", "x10^3/uL", "150 - 450", "NORMAL"],
            ["Total Protein Ratio", "1.8", "ratio", "", ""],  # Intentional missing reference range
            ["Urine Leukocytes", "Negative", "", "Negative", "NORMAL"],
        ]

        lab_table = Table(table_data, colWidths=[160, 80, 80, 140, 80])
        lab_table.setStyle(TableStyle([
            ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#f1f5f9")),
            ("TEXTCOLOR", (0, 0), (-1, 0), colors.HexColor("#0f172a")),
            ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
            ("FONTSIZE", (0, 0), (-1, 0), 9),
            ("BOTTOMPADDING", (0, 0), (-1, 0), 6),
            ("GRID", (0, 0), (-1, -1), 0.5, colors.HexColor("#cbd5e1")),
            ("ALIGN", (1, 1), (-1, -1), "CENTER"),
            ("FONTSIZE", (0, 1), (-1, -1), 9),
        ]))
        elements.append(lab_table)
        elements.append(Spacer(1, 20))

        # Footer notes
        elements.append(Paragraph("<b>End of Laboratory Report.</b> Reference intervals established by Apex Diagnostics.", meta_style))

        doc.build(elements)
        pdf_bytes = buffer.getvalue()
        buffer.close()
        return pdf_bytes

    @classmethod
    def seed_demo_patient(cls, db: Session) -> Patient:
        """
        Seeds a full synthetic patient with realistic multi-report data, observations,
        provenance, reference ranges, conflict, timeline, and summary.
        """
        # 1. Create Patient Profile
        patient = Patient(
            name="Sarah Jenkins (Synthetic Demo)",
            age=42,
            date_of_birth="1984-04-12",
            sex="Female",
            symptoms=["Persistent Fatigue", "Increased Thirst (Polydipsia)", "Mild Joint Stiffness"],
            existing_conditions=["Type 2 Diabetes Mellitus", "Essential Hypertension"],
            allergies=["Penicillin"],
            medications=["Amoxicillin 500mg PO BID", "Metformin 1000mg PO Daily", "Lisinopril 10mg PO Daily"],
            notes="Synthetic demo patient for MedLens clinical verification. Demonstrates allergy-medication inconsistency and reference range parsing.",
            source="USER_PROVIDED"
        )
        db.add(patient)
        db.commit()
        db.refresh(patient)

        # 2. Record Timeline Event for profile creation
        TimelineService.record_event(
            db=db,
            patient_id=patient.id,
            event_type="PROFILE_CREATED",
            title="Patient Clinical Profile Recorded",
            description="Patient demographics, conditions, allergies, and active medications entered during clinical intake.",
            provenance="USER_PROVIDED",
            event_date="2026-08-10"
        )

        # 3. Create Report 1: Baseline Comprehensive Panel
        raw_report_text_1 = (
            "APEX HEALTH DIAGNOSTICS & PATHOLOGY\n"
            "Report Date: 2026-08-15\n"
            "Patient Name: Sarah Jenkins | MRN: SYN-89421\n\n"
            "Hemoglobin | 13.5 | g/dL | 12.0 - 16.0 | NORMAL\n"
            "Fasting Glucose | 138 | mg/dL | 70 - 99 | HIGH\n"
            "Vitamin D (25-OH) | 18.2 | ng/mL | 30.0 - 100.0 | LOW\n"
            "Serum Creatinine | 1.4 | mg/dL | 0.5 - 1.1 | HIGH\n"
            "Platelet Count | 265 | x10^3/uL | 150 - 450 | NORMAL\n"
            "Total Protein Ratio | 1.8 | ratio | | \n"
            "Urine Leukocytes | Negative | | Negative | NORMAL\n"
        )

        report1 = MedicalReport(
            patient_id=patient.id,
            title="Comprehensive Metabolic & Hematology Panel",
            report_type="LABORATORY",
            report_date="2026-08-15",
            laboratory_name="Apex Health Diagnostics",
            file_name="demo_report_1.pdf",
            original_file_name="Apex_Lab_Report_Sarah_Jenkins_Baseline.pdf",
            file_size_bytes=14200,
            file_type="pdf",
            raw_text=raw_report_text_1,
            pages_metadata=[{"page_num": 1, "text": raw_report_text_1}],
            status="PROCESSED",
            provenance="REPORT_EXTRACTED"
        )
        db.add(report1)
        db.commit()
        db.refresh(report1)

        TimelineService.record_event(
            db=db,
            patient_id=patient.id,
            event_type="REPORT_UPLOADED",
            title="Baseline Lab Report Processed",
            description=f"Extracted 7 observations from '{report1.original_file_name}'.",
            provenance="REPORT_EXTRACTED",
            event_date="2026-08-15",
            reference_id=report1.id
        )

        # Observations for Report 1
        demo_obs_data_1 = [
            ("Hemoglobin", "13.5", 13.5, "g/dL", "12.0 - 16.0", None, "Hemoglobin | 13.5 | g/dL | 12.0 - 16.0", "HIGH"),
            ("Fasting Glucose", "138", 138.0, "mg/dL", "70 - 99", "H", "Fasting Glucose | 138 | mg/dL | 70 - 99 | HIGH", "HIGH"),
            ("Vitamin D (25-OH)", "18.2", 18.2, "ng/mL", "30.0 - 100.0", "L", "Vitamin D (25-OH) | 18.2 | ng/mL | 30.0 - 100.0 | LOW", "HIGH"),
            ("Serum Creatinine", "1.4", 1.4, "mg/dL", "0.5 - 1.1", "H", "Serum Creatinine | 1.4 | mg/dL | 0.5 - 1.1 | HIGH", "HIGH"),
            ("Platelet Count", "265", 265.0, "x10^3/uL", "150 - 450", None, "Platelet Count | 265 | x10^3/uL | 150 - 450", "HIGH"),
            ("Total Protein Ratio", "1.8", 1.8, "ratio", None, None, "Total Protein Ratio | 1.8 | ratio", "MEDIUM"), # Missing ref range
            ("Urine Leukocytes", "Negative", None, None, "Negative", None, "Urine Leukocytes | Negative | | Negative", "HIGH"),
        ]

        for test, val_str, num_val, unit, ref_range, flag, orig_text, conf in demo_obs_data_1:
            status, norm_ref, reason = StatusEngine.evaluate(val_str, num_val, ref_range)
            obs = Observation(
                patient_id=patient.id,
                report_id=report1.id,
                test_name=test,
                value_text=val_str,
                numeric_value=num_val,
                unit=unit,
                original_reference_range=ref_range,
                normalized_reference_range=norm_ref,
                status=status,
                status_reason=reason,
                abnormal_flag=flag,
                source_page=1,
                original_text=orig_text,
                provenance="REPORT_EXTRACTED",
                confidence=conf,
                is_reviewed=False,
                review_status="UNREVIEWED",
                observation_date="2026-08-15"
            )
            db.add(obs)

        # 4. Create Report 2: Follow-up Glycemic Check (Sep 01, 2026)
        raw_report_text_2 = (
            "METRO HEALTHCARE CLINICAL LABS\n"
            "Report Date: 2026-09-01\n"
            "Patient Name: Sarah Jenkins | MRN: SYN-89421\n\n"
            "Fasting Glucose | 148 | mg/dL | 70 - 99 | HIGH\n"
            "Serum Potassium | 4.5 | mEq/L | 3.5 - 5.0 | NORMAL\n"
            "Serum Sodium | 139 | mEq/L | 135 - 145 | NORMAL\n"
        )

        report2 = MedicalReport(
            patient_id=patient.id,
            title="Follow-up Glycemic & Electrolyte Panel",
            report_type="LABORATORY",
            report_date="2026-09-01",
            laboratory_name="Metro Healthcare Clinical Labs",
            file_name="demo_report_2.pdf",
            original_file_name="Metro_Lab_Followup_Sarah_Jenkins.pdf",
            file_size_bytes=9800,
            file_type="pdf",
            raw_text=raw_report_text_2,
            pages_metadata=[{"page_num": 1, "text": raw_report_text_2}],
            status="PROCESSED",
            provenance="REPORT_EXTRACTED"
        )
        db.add(report2)
        db.commit()
        db.refresh(report2)

        TimelineService.record_event(
            db=db,
            patient_id=patient.id,
            event_type="REPORT_UPLOADED",
            title="Follow-up Lab Report Processed",
            description=f"Extracted 3 observations from '{report2.original_file_name}'.",
            provenance="REPORT_EXTRACTED",
            event_date="2026-09-01",
            reference_id=report2.id
        )

        demo_obs_data_2 = [
            ("Fasting Glucose", "148", 148.0, "mg/dL", "70 - 99", "H", "Fasting Glucose | 148 | mg/dL | 70 - 99 | HIGH", "HIGH"),
            ("Serum Potassium", "4.5", 4.5, "mEq/L", "3.5 - 5.0", None, "Serum Potassium | 4.5 | mEq/L | 3.5 - 5.0", "HIGH"),
            ("Serum Sodium", "139", 139.0, "mEq/L", "135 - 145", None, "Serum Sodium | 139 | mEq/L | 135 - 145", "HIGH"),
        ]

        for test, val_str, num_val, unit, ref_range, flag, orig_text, conf in demo_obs_data_2:
            status, norm_ref, reason = StatusEngine.evaluate(val_str, num_val, ref_range)
            obs = Observation(
                patient_id=patient.id,
                report_id=report2.id,
                test_name=test,
                value_text=val_str,
                numeric_value=num_val,
                unit=unit,
                original_reference_range=ref_range,
                normalized_reference_range=norm_ref,
                status=status,
                status_reason=reason,
                abnormal_flag=flag,
                source_page=1,
                original_text=orig_text,
                provenance="REPORT_EXTRACTED",
                confidence=conf,
                is_reviewed=False,
                review_status="UNREVIEWED",
                observation_date="2026-09-01"
            )
            db.add(obs)

        db.commit()

        # 5. Scan & detect conflicts (Allergy: Penicillin vs Medication: Amoxicillin)
        ConflictEngine.scan_and_update_conflicts(db, patient.id)

        # 6. Generate initial AI summary
        AISummaryService.generate_summary(db, patient.id)

        return patient
