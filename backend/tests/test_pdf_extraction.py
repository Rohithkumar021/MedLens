import pytest
from fastapi import HTTPException
from backend.app.services.demo_data import DemoDataService
from backend.app.services.pdf_extractor import PDFExtractor


def test_pdf_extraction_from_synthetic_pdf():
    pdf_bytes = DemoDataService.generate_synthetic_pdf_bytes()
    assert len(pdf_bytes) > 0

    full_text, pages_meta = PDFExtractor.extract_from_bytes(pdf_bytes, "pdf")
    assert "APEX HEALTH DIAGNOSTICS" in full_text
    assert "Hemoglobin" in full_text
    assert len(pages_meta) >= 1
    assert pages_meta[0]["page_num"] == 1


def test_text_extraction():
    text_content = b"Hemoglobin | 14.0 | g/dL | 12.0 - 16.0 | Normal"
    full_text, pages_meta = PDFExtractor.extract_from_bytes(text_content, "txt")
    assert "Hemoglobin" in full_text
    assert len(pages_meta) == 1


def test_corrupted_pdf_handling():
    corrupted_bytes = b"NOT_A_VALID_PDF_HEADER"
    with pytest.raises(HTTPException) as exc_info:
        PDFExtractor.extract_from_bytes(corrupted_bytes, "pdf")
    assert exc_info.value.status_code == 400

