import re
from typing import Tuple, Optional


class StatusEngine:
    """
    Deterministic rule-based reference-range evaluator.
    MedLens NEVER invents a reference range or guesses standard medical values.
    If the report has no reference range, status MUST be UNKNOWN or NOT_AVAILABLE.
    """

    # Regex patterns for numeric ranges
    # Matches: "12 - 16", "12.0 – 16.0", "12.0-16.0", "12 to 16"
    RANGE_PATTERN = re.compile(
        r"^\s*([0-9]+(?:\.[0-9]+)?)\s*(?:-|–|—|to)\s*([0-9]+(?:\.[0-9]+)?)\s*$",
        re.IGNORECASE
    )

    # Matches: "< 10", "<= 10", "<10.5", "=< 10"
    LESS_THAN_PATTERN = re.compile(
        r"^\s*(?:<|<=|=<)\s*([0-9]+(?:\.[0-9]+)?)\s*$"
    )

    # Matches: "> 10", ">= 10", ">10.5", "=> 10"
    GREATER_THAN_PATTERN = re.compile(
        r"^\s*(?:>|>=|=>)\s*([0-9]+(?:\.[0-9]+)?)\s*$"
    )

    # Matches qualitative ranges
    QUALITATIVE_NORMAL = {"negative", "non-reactive", "nonreactive", "normal", "nil", "not detected", "absent"}
    QUALITATIVE_ABNORMAL = {"positive", "reactive", "detected", "present", "abnormal"}

    @classmethod
    def evaluate(
        cls,
        value_text: str,
        numeric_value: Optional[float],
        reference_range: Optional[str]
    ) -> Tuple[str, Optional[str], str]:
        """
        Evaluates the status of a laboratory value given its supplied reference range.
        
        Returns:
            (status, normalized_reference_range, reasoning)
            status: LOW, NORMAL, HIGH, UNKNOWN, NOT_AVAILABLE
        """
        # Rule 1: Missing reference range
        if not reference_range or not reference_range.strip():
            return (
                "NOT_AVAILABLE",
                None,
                "No reference range was supplied in the source report. MedLens does not invent or substitute default reference ranges."
            )

        ref = reference_range.strip()
        val_str = (value_text or "").strip()

        # Try evaluating numeric value with numeric reference range
        if numeric_value is not None:
            # 1. Interval format: "12.0 - 16.0"
            match_range = cls.RANGE_PATTERN.match(ref)
            if match_range:
                low = float(match_range.group(1))
                high = float(match_range.group(2))
                norm_range = f"{low} - {high}"
                
                if numeric_value < low:
                    return (
                        "LOW",
                        norm_range,
                        f"{numeric_value} falls below the supplied lower bound {low}."
                    )
                elif numeric_value > high:
                    return (
                        "HIGH",
                        norm_range,
                        f"{numeric_value} falls above the supplied upper bound {high}."
                    )
                else:
                    return (
                        "NORMAL",
                        norm_range,
                        f"{numeric_value} falls within the supplied reference interval [{low}, {high}]."
                    )

            # 2. Upper bound format: "< 10" or "<= 10"
            match_less = cls.LESS_THAN_PATTERN.match(ref)
            if match_less:
                upper = float(match_less.group(1))
                norm_range = f"< {upper}"
                if numeric_value <= upper:
                    return (
                        "NORMAL",
                        norm_range,
                        f"{numeric_value} is within the acceptable upper limit {upper}."
                    )
                else:
                    return (
                        "HIGH",
                        norm_range,
                        f"{numeric_value} exceeds the supplied upper limit {upper}."
                    )

            # 3. Lower bound format: "> 10" or ">= 10"
            match_greater = cls.GREATER_THAN_PATTERN.match(ref)
            if match_greater:
                lower = float(match_greater.group(1))
                norm_range = f"> {lower}"
                if numeric_value >= lower:
                    return (
                        "NORMAL",
                        norm_range,
                        f"{numeric_value} meets or exceeds the supplied threshold {lower}."
                    )
                else:
                    return (
                        "LOW",
                        norm_range,
                        f"{numeric_value} falls below the supplied minimum threshold {lower}."
                    )

        # Try evaluating textual / qualitative values
        ref_lower = ref.lower()
        val_lower = val_str.lower()

        # If reference range specifies "Negative" / "Non-reactive"
        if ref_lower in cls.QUALITATIVE_NORMAL:
            if val_lower in cls.QUALITATIVE_NORMAL:
                return (
                    "NORMAL",
                    ref.title(),
                    f"Result '{val_str}' matches expected normal status '{ref}'."
                )
            elif val_lower in cls.QUALITATIVE_ABNORMAL:
                return (
                    "HIGH",
                    ref.title(),
                    f"Result '{val_str}' differs from expected normal status '{ref}'."
                )

        # If reference range specifies "Positive" / "Reactive"
        if ref_lower in cls.QUALITATIVE_ABNORMAL:
            if val_lower in cls.QUALITATIVE_ABNORMAL:
                return (
                    "NORMAL",
                    ref.title(),
                    f"Result '{val_str}' matches expected reference target '{ref}'."
                )
            elif val_lower in cls.QUALITATIVE_NORMAL:
                return (
                    "LOW",
                    ref.title(),
                    f"Result '{val_str}' differs from reference target '{ref}'."
                )

        # Check if value itself explicitly equals the reference string
        if val_lower == ref_lower:
            return (
                "NORMAL",
                ref,
                f"Result '{val_str}' exactly matches the supplied reference '{ref}'."
            )

        # Fallback for complex, unparsed textual ranges
        return (
            "UNKNOWN",
            ref,
            f"Reference range '{ref}' is non-standard or textual. Manual clinical review recommended."
        )

