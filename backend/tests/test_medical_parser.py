import pytest
from backend.app.services.medical_parser import MedicalParser


def test_parse_tabular_report_content():
    raw_text = (
        "APEX DIAGNOSTICS\n"
        "Report Date: 2026-08-15\n\n"
        "Hemoglobin | 13.5 | g/dL | 12.0 - 16.0 | NORMAL\n"
        "Fasting Glucose | 145 | mg/dL | 70 - 99 | HIGH\n"
        "Total Protein Ratio | 1.8 | ratio | | \n"
    )
    pages_meta = [{"page_num": 1, "text": raw_text}]

    observations, meta = MedicalParser.parse_report_content(raw_text, pages_meta)

    assert meta["report_date"] == "2026-08-15"
    assert len(observations) >= 3

    # Check Hemoglobin
    hb = next((o for o in observations if o["test_name"] == "Hemoglobin"), None)
    assert hb is not None
    assert hb["numeric_value"] == 13.5
    assert hb["unit"] == "g/dL"
    assert hb["status"] == "NORMAL"
    assert hb["provenance"] == "REPORT_EXTRACTED"
    assert hb["confidence"] == "HIGH"

    # Check Fasting Glucose
    glu = next((o for o in observations if o["test_name"] == "Fasting Glucose"), None)
    assert glu is not None
    assert glu["numeric_value"] == 145.0
    assert glu["status"] == "HIGH"

    # Check missing reference range
    prot = next((o for o in observations if o["test_name"] == "Total Protein Ratio"), None)
    assert prot is not None
    assert prot["status"] == "NOT_AVAILABLE"


def test_parse_inline_colon_format():
    raw_text = "Serum Creatinine: 1.4 mg/dL (Ref: 0.5 - 1.1)"
    pages_meta = [{"page_num": 1, "text": raw_text}]

    observations, _ = MedicalParser.parse_report_content(raw_text, pages_meta)
    assert len(observations) == 1
    assert observations[0]["test_name"] == "Serum Creatinine"
    assert observations[0]["numeric_value"] == 1.4
    assert observations[0]["status"] == "HIGH"

