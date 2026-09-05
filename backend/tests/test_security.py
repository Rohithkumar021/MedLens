import io
import pytest
from fastapi import HTTPException, UploadFile
from backend.app.services.security import SecurityService


def test_sanitize_filename():
    assert SecurityService.sanitize_filename("../../etc/passwd") == "passwd"
    assert SecurityService.sanitize_filename("..\\windows\\system32\\cmd.exe") == "cmd.exe"
    assert SecurityService.sanitize_filename("valid_report.pdf") == "valid_report.pdf"


def test_generate_safe_storage_name():
    safe_name, ext = SecurityService.generate_safe_storage_name("my_medical_file.pdf")
    assert ext == "pdf"
    assert safe_name.endswith(".pdf")
    assert len(safe_name) > 30 # UUID string length


def test_unsupported_file_extension_rejection():
    file = UploadFile(filename="malicious.exe", file=io.BytesIO(b"binary_code"))
    with pytest.raises(HTTPException) as exc_info:
        SecurityService.validate_file(file, max_size_bytes=10 * 1024 * 1024)
    assert exc_info.value.status_code == 400
    assert "Unsupported file format" in exc_info.value.detail

