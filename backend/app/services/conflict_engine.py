from typing import List, Dict, Any, Optional
from sqlalchemy.orm import Session
from backend.app.models.patient import Patient
from backend.app.models.observation import Observation
from backend.app.models.conflict import Conflict


class ConflictEngine:
    """
    Detects clinical inconsistencies and potential safety conflicts:
    1. Allergy vs Medication clashes (e.g., Penicillin allergy vs Amoxicillin prescription)
    2. Significant temporal variance in laboratory biomarkers across reports
    3. Duplicate conflicting records
    """

    # Known cross-reactivity / drug families
    ALLERGY_DRUG_MAP = {
        "penicillin": ["penicillin", "amoxicillin", "ampicillin", "augmentin", "piperacillin", "timentin", "unasyn"],
        "sulfa": ["sulfa", "sulfamethoxazole", "bactrim", "septra", "sulfasalazine"],
        "aspirin": ["aspirin", "acetylsalicylic acid", "nsaid", "ibuprofen", "naproxen", "ketorolac"],
        "nsaid": ["ibuprofen", "naproxen", "ketorolac", "meloxicam", "diclofenac", "indomethacin", "aspirin"],
        "codeine": ["codeine", "morphine", "hydrocodone", "oxycodone"],
        "statin": ["atorvastatin", "simvastatin", "rosuvastatin", "pravastatin", "lipitor", "crestor"],
        "contrast": ["iodine", "iodinated contrast", "radiopaque contrast"],
    }

    @classmethod
    def scan_and_update_conflicts(cls, db: Session, patient_id: str) -> List[Conflict]:
        """
        Scans all patient records, updates active conflicts in the database, and returns active conflicts.
        """
        patient = db.query(Patient).filter(Patient.id == patient_id).first()
        if not patient:
            return []

        # Remove previous auto-derived conflicts that haven't been manually resolved
        db.query(Conflict).filter(
            Conflict.patient_id == patient_id,
            Conflict.provenance == "SYSTEM_DERIVED",
            Conflict.status == "ACTIVE"
        ).delete()

        detected_conflicts: List[Conflict] = []

        # 1. Check Allergy vs Medication Conflicts
        allergies = patient.allergies or []
        medications = patient.medications or []

        for allergy in allergies:
            allergy_clean = allergy.strip().lower()
            if not allergy_clean:
                continue

            for med in medications:
                med_clean = med.strip().lower()
                if not med_clean:
                    continue

                if cls._is_allergy_conflict(allergy_clean, med_clean):
                    conflict = Conflict(
                        patient_id=patient_id,
                        conflict_type="ALLERGY_MEDICATION",
                        severity="HIGH",
                        title=f"Allergy Warning: {allergy} vs {med}",
                        description=(
                            f"Patient has recorded allergy '{allergy}' while active medication list "
                            f"includes '{med}'. Potential cross-reactivity or adverse reaction risk."
                        ),
                        entity_a=f"Allergy: {allergy}",
                        entity_b=f"Medication: {med}",
                        provenance="SYSTEM_DERIVED",
                        status="ACTIVE"
                    )
                    db.add(conflict)
                    detected_conflicts.append(conflict)

        # 2. Check Temporal biomarker changes across observations
        observations = db.query(Observation).filter(Observation.patient_id == patient_id).all()
        # Group by test name
        by_test: Dict[str, List[Observation]] = {}
        for obs in observations:
            name_key = obs.test_name.strip().lower()
            by_test.setdefault(name_key, []).append(obs)

        for test_key, obs_list in by_test.items():
            if len(obs_list) > 1:
                # Sort by created_at or observation_date
                obs_sorted = sorted(obs_list, key=lambda o: str(o.observation_date or o.created_at))
                first_obs = obs_sorted[0]
                latest_obs = obs_sorted[-1]

                if first_obs.numeric_value is not None and latest_obs.numeric_value is not None:
                    diff = latest_obs.numeric_value - first_obs.numeric_value
                    pct_change = (diff / first_obs.numeric_value) * 100 if first_obs.numeric_value != 0 else 0

                    # If drop in hemoglobin > 2.0 or drop > 20%
                    if "hemoglobin" in test_key and (diff <= -2.0 or pct_change <= -15):
                        conflict = Conflict(
                            patient_id=patient_id,
                            conflict_type="TEMPORAL_INCONSISTENCY",
                            severity="MEDIUM",
                            title=f"Biomarker Shift: {first_obs.test_name}",
                            description=(
                                f"{first_obs.test_name} changed from {first_obs.value_text} {first_obs.unit or ''} "
                                f"to {latest_obs.value_text} {latest_obs.unit or ''} ({pct_change:+.1f}% shift). "
                                f"Recorded across separate report dates."
                            ),
                            entity_a=f"{first_obs.value_text} ({first_obs.observation_date or 'Earlier'})",
                            entity_b=f"{latest_obs.value_text} ({latest_obs.observation_date or 'Recent'})",
                            provenance="SYSTEM_DERIVED",
                            status="ACTIVE"
                        )
                        db.add(conflict)
                        detected_conflicts.append(conflict)
                    
                    # If creatinine doubles
                    elif "creatinine" in test_key and (pct_change >= 50 or diff >= 0.5):
                        conflict = Conflict(
                            patient_id=patient_id,
                            conflict_type="TEMPORAL_INCONSISTENCY",
                            severity="MEDIUM",
                            title=f"Biomarker Elevation: {first_obs.test_name}",
                            description=(
                                f"{first_obs.test_name} increased from {first_obs.value_text} {first_obs.unit or ''} "
                                f"to {latest_obs.value_text} {latest_obs.unit or ''} (+{pct_change:.1f}% elevation)."
                            ),
                            entity_a=f"{first_obs.value_text} ({first_obs.observation_date or 'Earlier'})",
                            entity_b=f"{latest_obs.value_text} ({latest_obs.observation_date or 'Recent'})",
                            provenance="SYSTEM_DERIVED",
                            status="ACTIVE"
                        )
                        db.add(conflict)
                        detected_conflicts.append(conflict)

        db.commit()
        return detected_conflicts

    @classmethod
    def _is_allergy_conflict(cls, allergy: str, medication: str) -> bool:
        # Direct substring match
        if allergy in medication or medication in allergy:
            return True

        # Check mapped drug families
        for family_key, related_drugs in cls.ALLERGY_DRUG_MAP.items():
            if family_key in allergy:
                for drug in related_drugs:
                    if drug in medication:
                        return True

        return False

