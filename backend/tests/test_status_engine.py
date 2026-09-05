import pytest
from backend.app.services.status_engine import StatusEngine


def test_missing_reference_range_returns_not_available():
    # MedLens MUST NEVER invent a reference range
    status, norm_ref, reason = StatusEngine.evaluate("13.2", 13.2, "")
    assert status == "NOT_AVAILABLE"
    assert norm_ref is None
    assert "No reference range was supplied" in reason

    status2, norm_ref2, _ = StatusEngine.evaluate("13.2", 13.2, None)
    assert status2 == "NOT_AVAILABLE"
    assert norm_ref2 is None


def test_numeric_interval_reference_range():
    # Normal in range 12.0 - 16.0
    status, norm_ref, reason = StatusEngine.evaluate("13.2", 13.2, "12.0 - 16.0")
    assert status == "NORMAL"
    assert norm_ref == "12.0 - 16.0"
    assert "falls within the supplied reference interval" in reason

    # Low below range
    status_low, _, reason_low = StatusEngine.evaluate("9.5", 9.5, "12.0 - 16.0")
    assert status_low == "LOW"
    assert "falls below the supplied lower bound" in reason_low

    # High above range
    status_high, _, reason_high = StatusEngine.evaluate("17.8", 17.8, "12.0 - 16.0")
    assert status_high == "HIGH"
    assert "falls above the supplied upper bound" in reason_high


def test_less_than_reference_range():
    # <= 10
    status, norm_ref, _ = StatusEngine.evaluate("4.2", 4.2, "< 10")
    assert status == "NORMAL"
    assert norm_ref == "< 10.0"

    status_high, _, reason = StatusEngine.evaluate("12.5", 12.5, "<= 10")
    assert status_high == "HIGH"
    assert "exceeds the supplied upper limit" in reason


def test_greater_than_reference_range():
    # >= 30
    status_norm, norm_ref, _ = StatusEngine.evaluate("45.0", 45.0, "> 30")
    assert status_norm == "NORMAL"
    assert norm_ref == "> 30.0"

    status_low, _, reason = StatusEngine.evaluate("18.2", 18.2, ">= 30")
    assert status_low == "LOW"
    assert "falls below the supplied minimum threshold" in reason


def test_qualitative_reference_range():
    # Negative vs Negative
    status, norm_ref, reason = StatusEngine.evaluate("Negative", None, "Negative")
    assert status == "NORMAL"
    assert norm_ref == "Negative"

    # Positive vs Negative (Abnormal/High)
    status_pos, norm_ref_pos, reason_pos = StatusEngine.evaluate("Positive", None, "Negative")
    assert status_pos == "HIGH"
    assert "differs from expected normal status" in reason_pos

    # Non-reactive vs Non-reactive
    status_nr, _, _ = StatusEngine.evaluate("Non-reactive", None, "Non-reactive")
    assert status_nr == "NORMAL"


def test_complex_unsupported_reference_range():
    status, norm_ref, reason = StatusEngine.evaluate("Normal", None, "Consult Physician for Nomogram")
    assert status == "UNKNOWN"
    assert "non-standard or textual" in reason

