import json
import logging
from typing import Dict, Any, List, Optional
from sqlalchemy.orm import Session

from backend.app.config import settings
from backend.app.models.patient import Patient
from backend.app.models.report import MedicalReport
from backend.app.models.observation import Observation
from backend.app.models.summary import AISummary

logger = logging.getLogger("medlens.ai_summary")


class AISummaryService:
    """
    Produces structured clinical information summaries.
    Adheres to strict Responsible AI principles:
    - Never prescribes medication or recommends dosages
    - Never fabricates medical findings or diagnoses diseases
    - Uses ONLY structured database observations and stated report reference intervals
    - Provides a zero-downtime deterministic fallback engine if Gemini is unavailable
    """

    SYSTEM_INSTRUCTION = (
        "You are MedLens AI, a clinical information organization and explanation assistant. "
        "Your task is to summarize patient-provided context and extracted laboratory results "
        "into clear, patient-friendly information for review by patients and clinicians.\n\n"
        "MANDATORY SAFETY & ACCURACY RULES:\n"
        "1. DO NOT diagnose diseases or state that the patient has a medical condition.\n"
        "2. DO NOT recommend treatments, medications, or dosage modifications.\n"
        "3. DO NOT fabricate or guess missing values, reference ranges, or tests.\n"
        "4. Base every observation strictly on the provided structured data.\n"
        "5. If a test has no stated reference range, state that its reference range is not available in the source report.\n"
        "6. Clearly identify what was user-provided vs extracted from laboratory reports.\n"
        "7. Return output strictly adhering to the JSON schema provided."
    )

    @classmethod
    def generate_summary(cls, db: Session, patient_id: str) -> AISummary:
        patient = db.query(Patient).filter(Patient.id == patient_id).first()
        if not patient:
            raise ValueError("Patient not found.")

        reports = db.query(MedicalReport).filter(MedicalReport.patient_id == patient_id).all()
        observations = db.query(Observation).filter(Observation.patient_id == patient_id).all()

        # Build structured context payload
        context = cls._build_context_payload(patient, reports, observations)

        # Attempt generation via Gemini API if key is available
        summary_data = None
        model_used = "Deterministic Medical Summary Engine"

        if settings.GEMINI_API_KEY:
            try:
                summary_data = cls._call_gemini(context)
                model_used = settings.GEMINI_MODEL
            except Exception as e:
                logger.warning(f"Gemini AI call failed: {e}. Falling back to deterministic summary engine.")
                summary_data = None

        # Fallback to deterministic structured summary
        if not summary_data:
            summary_data = cls._generate_deterministic_summary(patient, reports, observations)

        # Persist summary
        ai_summary = AISummary(
            patient_id=patient_id,
            summary_text=summary_data["summary_text"],
            key_observations=summary_data.get("key_observations", []),
            limitations=summary_data.get("limitations", []),
            structured_payload=summary_data,
            provenance="AI_GENERATED" if settings.GEMINI_API_KEY else "SYSTEM_DERIVED",
            model_name=model_used
        )
        db.add(ai_summary)
        db.commit()
        db.refresh(ai_summary)

        return ai_summary

    @classmethod
    def _build_context_payload(
        cls,
        patient: Patient,
        reports: List[MedicalReport],
        observations: List[Observation]
    ) -> Dict[str, Any]:
        return {
            "patient_info": {
                "name": patient.name,
                "age": patient.age,
                "sex": patient.sex,
                "symptoms": patient.symptoms or [],
                "existing_conditions": patient.existing_conditions or [],
                "allergies": patient.allergies or [],
                "medications": patient.medications or [],
                "provenance": "USER_PROVIDED"
            },
            "reports_count": len(reports),
            "observations": [
                {
                    "test_name": obs.test_name,
                    "value": obs.value_text,
                    "unit": obs.unit,
                    "reference_range": obs.original_reference_range or "Not supplied in report",
                    "status": obs.status,
                    "reasoning": obs.status_reason,
                    "provenance": obs.provenance,
                    "is_reviewed": obs.is_reviewed,
                    "corrected_value": obs.corrected_value if obs.is_reviewed else None
                }
                for obs in observations
            ]
        }

    @classmethod
    def _call_gemini(cls, context: Dict[str, Any]) -> Dict[str, Any]:
        from google import genai
        from google.genai import types

        client = genai.Client(api_key=settings.GEMINI_API_KEY)
        
        prompt = (
            f"Analyze the following structured patient and laboratory data:\n\n"
            f"{json.dumps(context, indent=2)}\n\n"
            f"Return a JSON object with:\n"
            f"- 'summary_text': A 2-3 paragraph objective, patient-friendly summary explaining the reported results, mentioning the report-supplied reference ranges and user-provided context without diagnosing or prescribing.\n"
            f"- 'key_observations': List of objects with [test_name, value, status, reference_range, provenance, clinical_context].\n"
            f"- 'limitations': List of explicit data limitations (e.g. missing reference ranges, unverified user notes).\n"
        )

        response = client.models.generate_content(
            model=settings.GEMINI_MODEL,
            contents=prompt,
            config=types.GenerateContentConfig(
                system_instruction=cls.SYSTEM_INSTRUCTION,
                response_mime_type="application/json",
                temperature=0.2,
            )
        )

        data = json.loads(response.text)
        return data

    @classmethod
    def _generate_deterministic_summary(
        cls,
        patient: Patient,
        reports: List[MedicalReport],
        observations: List[Observation]
    ) -> Dict[str, Any]:
        """
        Guaranteed deterministic medical summary generator when Gemini is not configured.
        """
        high_obs = [o for o in observations if o.status == "HIGH"]
        low_obs = [o for o in observations if o.status == "LOW"]
        normal_obs = [o for o in observations if o.status == "NORMAL"]
        unknown_obs = [o for o in observations if o.status in ("UNKNOWN", "NOT_AVAILABLE")]

        # Paragraph 1: Patient Context
        user_context_parts = []
        if patient.symptoms:
            user_context_parts.append(f"reported symptoms ({', '.join(patient.symptoms)})")
        if patient.existing_conditions:
            user_context_parts.append(f"existing conditions ({', '.join(patient.existing_conditions)})")
        if patient.medications:
            user_context_parts.append(f"current medications ({', '.join(patient.medications)})")
        
        context_str = (
            f"Record for {patient.name} ({patient.sex or 'Unspecified sex'}, age {patient.age or 'unspecified'}). "
            f"User-provided background includes " + (", and ".join(user_context_parts) if user_context_parts else "no additional symptoms or conditions recorded.")
        )

        # Paragraph 2: Report & Lab Observations
        lab_summary_parts = []
        if reports:
            lab_summary_parts.append(f"{len(reports)} medical report(s) containing {len(observations)} structured laboratory observation(s) have been processed.")
        else:
            lab_summary_parts.append("No medical reports have been uploaded yet.")

        if normal_obs:
            normal_names = ", ".join([o.test_name for o in normal_obs[:4]])
            lab_summary_parts.append(f"{len(normal_obs)} test(s) ({normal_names}) fall within the reference intervals supplied by the laboratory.")
        
        if high_obs:
            high_details = ", ".join([f"{o.test_name} ({o.value_text} {o.unit or ''}, Ref: {o.original_reference_range or 'N/A'})" for o in high_obs])
            lab_summary_parts.append(f"Tests recorded above the supplied reference range: {high_details}.")

        if low_obs:
            low_details = ", ".join([f"{o.test_name} ({o.value_text} {o.unit or ''}, Ref: {o.original_reference_range or 'N/A'})" for o in low_obs])
            lab_summary_parts.append(f"Tests recorded below the supplied reference range: {low_details}.")

        if unknown_obs:
            unknown_names = ", ".join([o.test_name for o in unknown_obs])
            lab_summary_parts.append(f"{len(unknown_obs)} test(s) ({unknown_names}) have unknown or unsupplied reference ranges from the source document.")

        # Paragraph 3: Concluding Disclaimer
        disclaimer = (
            "This summary organizes and explains facts from provided records. It does not constitute a medical diagnosis, clinical evaluation, or treatment plan. Consult a licensed healthcare provider for interpretation."
        )

        summary_text = f"{context_str}\n\n{' '.join(lab_summary_parts)}\n\n{disclaimer}"

        key_observations = []
        for o in observations:
            ref_str = o.original_reference_range or "Not supplied in report"
            if o.status == "NORMAL":
                ctx = f"Result of {o.value_text} {o.unit or ''} is within the report's stated range [{ref_str}]."
            elif o.status == "HIGH":
                ctx = f"Result of {o.value_text} {o.unit or ''} exceeds the report's stated upper range [{ref_str}]."
            elif o.status == "LOW":
                ctx = f"Result of {o.value_text} {o.unit or ''} is below the report's stated lower range [{ref_str}]."
            else:
                ctx = f"Result of {o.value_text} {o.unit or ''} has no standard reference range in the source document."

            key_observations.append({
                "test_name": o.test_name,
                "value": f"{o.value_text} {o.unit or ''}".strip(),
                "status": o.status,
                "reference_range": ref_str,
                "provenance": o.provenance,
                "clinical_context": ctx
            })

        limitations = [
            "MedLens does not invent missing laboratory reference ranges.",
            "All statuses reflect report-supplied intervals, not universal medical guidelines.",
            "User-provided symptoms and medications have not been independently clinically verified."
        ]

        return {
            "summary_text": summary_text,
            "key_observations": key_observations,
            "limitations": limitations
        }

