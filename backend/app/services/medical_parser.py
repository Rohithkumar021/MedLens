import re
from typing import List, Dict, Any, Optional, Tuple
from backend.app.services.status_engine import StatusEngine


class MedicalParser:
    """
    Parses unstructured and semi-structured clinical text into structured laboratory observations,
    preserving exact source provenance, page numbers, and reference ranges.
    """

    # Common units regex
    UNITS_REGEX = r"(?:g/dL|mg/dL|mmol/L|µmol/L|umol/L|mEq/L|IU/L|U/L|x10\^3/uL|x10\^3/µL|x10\^6/uL|x10\^6/µL|%|ng/mL|pg/mL|mcg/dL|ug/dL|mIU/L|uIU/mL|mL/min|FL|fL|pg|cells/uL|/uL|/hpf|copies/mL)?"

    # Tabular pattern with delimiters (pipe, colon, tab, multiple spaces)
    # Examples:
    # Hemoglobin | 13.2 | g/dL | 12.0 - 16.0
    # Glucose: 115 mg/dL (Ref: 70 - 99)
    # Platelets  250  x10^3/uL  150 - 450
    ROW_PATTERN = re.compile(
        r"^(?P<test>[A-Za-z0-9\s\(\)\-\/\+\.\'\,\#]{2,40}?)\s*(?:[:|\|]|\s{2,}|\t)\s*"
        r"(?P<val>[><=]?\s*[0-9]+(?:\.[0-9]+)?|[A-Za-z]+)\s*"
        r"(?P<unit>[A-Za-z0-9\^\/\%µ\.\-]{1,15})?\s*"
        r"(?:[:|\|\(\[\{]|\s{1,}|\t)*(?:(?:Ref|Range|Reference|Ref Range|Reference Interval)[\s:]*)?"
        r"(?P<ref>(?:[0-9]+(?:\.[0-9]+)?\s*(?:-|–|—|to)\s*[0-9]+(?:\.[0-9]+)?|[><=]\s*[0-9]+(?:\.[0-9]+)?|Negative|Positive|Normal|Non-reactive|Reactive|Nil|Absent|Detected|Not Detected))?"
        r"(?:[\)\]\}]|\s)*"
        r"(?P<flag>HIGH|LOW|NORMAL|ABNORMAL|CRITICAL|H|L|\*)?$",
        re.IGNORECASE
    )

    # Header extractors for laboratory name & report date
    LAB_NAME_PATTERNS = [
        re.compile(r"(?:Laboratory|Hospital|Medical Center|Diagnostics|Clinic|Health Services|Pathology):\s*([A-Za-z0-9\s\,\.\-]+)", re.IGNORECASE),
        re.compile(r"^([A-Za-z0-9\s\,\.\-]+(?:Hospital|Diagnostics|Laboratory|Clinic|Medical Center|Pathology Labs?))", re.IGNORECASE)
    ]
    
    DATE_PATTERNS = [
        re.compile(r"(?:Report Date|Collection Date|Date of Test|Date|Specimen Date):\s*([0-9]{4}-[0-9]{2}-[0-9]{2}|[0-9]{2}/[0-9]{2}/[0-9]{4}|[A-Za-z]{3}\s+[0-9]{1,2},\s+[0-9]{4})", re.IGNORECASE),
        re.compile(r"\b([0-9]{4}-[0-9]{2}-[0-9]{2})\b")
    ]

    @classmethod
    def parse_report_content(
        cls,
        raw_text: str,
        pages_metadata: List[Dict[str, Any]]
    ) -> Tuple[List[Dict[str, Any]], Dict[str, Optional[str]]]:
        """
        Parses full report text and page metadata into observations and report-level metadata.
        
        Returns:
            (observations_list, report_metadata)
        """
        observations: List[Dict[str, Any]] = []
        report_meta = {
            "laboratory_name": cls._extract_lab_name(raw_text),
            "report_date": cls._extract_report_date(raw_text)
        }

        # Process each page
        for page_data in pages_metadata:
            page_num = page_data.get("page_num", 1)
            page_text = page_data.get("text", "")
            lines = [line.strip() for line in page_text.splitlines() if line.strip()]

            # 1. First attempt sequential cell-stream parsing (common in PDF table extraction)
            cell_obs = cls._parse_cell_stream(lines, page_num)
            for obs in cell_obs:
                if not any(o["test_name"].lower() == obs["test_name"].lower() for o in observations):
                    observations.append(obs)

            # 2. Also attempt single-line format parsing
            for line in lines:
                obs = cls._parse_line(line, page_num)
                if obs:
                    if not any(o["test_name"].lower() == obs["test_name"].lower() for o in observations):
                        observations.append(obs)

        return observations, report_meta

    @classmethod
    def _parse_cell_stream(cls, lines: List[str], page_num: int) -> List[Dict[str, Any]]:
        """
        Extracts observations when PDF text extracts table cells as consecutive lines.
        """
        results = []
        i = 0
        n = len(lines)
        
        # Look for table starting after header keywords
        while i < n:
            curr = lines[i]
            # Check if this line looks like a known test name or title
            # and the next line is a numeric or qualitative result value
            if i + 1 < n and cls._is_potential_test_name(curr):
                val_candidate = lines[i + 1]
                if cls._is_potential_value(val_candidate):
                    # We have test_name and value!
                    test_name = curr
                    val_str = val_candidate
                    unit = None
                    ref_range = None
                    flag = None
                    
                    offset = 2
                    # Check if next is unit
                    if i + offset < n and cls._is_unit(lines[i + offset]):
                        unit = lines[i + offset]
                        offset += 1
                    
                    # Check if next is reference range
                    if i + offset < n and cls._is_reference_range(lines[i + offset]):
                        ref_range = lines[i + offset]
                        offset += 1
                        
                    # Check if next is flag
                    if i + offset < n and cls._is_flag(lines[i + offset]):
                        flag = lines[i + offset]
                        offset += 1

                    obs = cls._build_observation(
                        test_name=test_name,
                        value_text=val_str,
                        unit=unit,
                        reference_range=ref_range,
                        abnormal_flag=flag,
                        page_num=page_num,
                        original_line=f"{test_name} | {val_str} | {unit or ''} | {ref_range or ''}".strip(),
                        confidence="HIGH"
                    )
                    if obs:
                        results.append(obs)
                        i += offset
                        continue

            i += 1
        return results

    @staticmethod
    def _is_potential_test_name(s: str) -> bool:
        lower = s.lower().strip()
        if len(lower) < 2 or len(lower) > 50:
            return False
        if any(skip in lower for skip in ["test name", "result", "units", "reference interval", "flag", "page", "mrn:", "patient name", "status:", "ordering physician", "end of laboratory"]):
            return False
        # Must start with letter
        return lower[0].isalpha()

    @staticmethod
    def _is_potential_value(s: str) -> bool:
        s_clean = s.strip()
        # Numeric check
        num_clean = s_clean.replace("<", "").replace(">", "").replace("=", "").strip()
        try:
            float(num_clean)
            return True
        except ValueError:
            pass
        return s_clean.lower() in ("negative", "positive", "non-reactive", "reactive", "normal", "abnormal")

    @staticmethod
    def _is_unit(s: str) -> bool:
        s_clean = s.strip().lower()
        units = {"g/dl", "mg/dl", "mmol/l", "µmol/l", "umol/l", "meq/l", "iu/l", "u/l", "x10^3/ul", "x10^6/ul", "%", "ng/ml", "pg/ml", "mcg/dl", "ug/dl", "miu/l", "uiu/ml", "ml/min", "fl", "pg", "ratio"}
        return s_clean in units

    @staticmethod
    def _is_reference_range(s: str) -> bool:
        s_clean = s.strip()
        if StatusEngine.RANGE_PATTERN.match(s_clean) or StatusEngine.LESS_THAN_PATTERN.match(s_clean) or StatusEngine.GREATER_THAN_PATTERN.match(s_clean):
            return True
        return s_clean.lower() in ("negative", "positive", "normal", "non-reactive")

    @staticmethod
    def _is_flag(s: str) -> bool:
        return s.strip().upper() in ("NORMAL", "HIGH", "LOW", "ABNORMAL", "CRITICAL", "H", "L", "*")

    @classmethod
    def _parse_line(cls, line: str, page_num: int) -> Optional[Dict[str, Any]]:
        # Skip header/footer noise
        lower_line = line.lower()
        if any(keyword in lower_line for keyword in ["page ", "report date", "doctor:", "patient name:", "specimen:", "mrn:", "printed on"]):
            return None

        # Try pipe/table parsing
        if "|" in line:
            parts = [p.strip() for p in line.split("|") if p.strip()]
            if len(parts) >= 2:
                test_name = parts[0]
                val_str = parts[1]
                unit = parts[2] if len(parts) > 2 and not any(char.isdigit() for char in parts[2][:2]) else None
                ref_range = parts[3] if len(parts) > 3 else (parts[2] if len(parts) > 2 and any(char.isdigit() for char in parts[2][:2]) else None)
                flag = parts[4] if len(parts) > 4 else None
                
                return cls._build_observation(
                    test_name=test_name,
                    value_text=val_str,
                    unit=unit,
                    reference_range=ref_range,
                    abnormal_flag=flag,
                    page_num=page_num,
                    original_line=line,
                    confidence="HIGH"
                )

        # Try regex pattern
        match = cls.ROW_PATTERN.match(line)
        if match:
            test_name = match.group("test").strip()
            val_str = match.group("val").strip()
            unit = match.group("unit")
            ref_range = match.group("ref")
            flag = match.group("flag")

            # Avoid false positives on common words
            if len(test_name) < 2 or test_name.lower() in ["note", "comment", "signature", "interpretation", "result", "test name"]:
                return None

            return cls._build_observation(
                test_name=test_name,
                value_text=val_str,
                unit=unit,
                reference_range=ref_range,
                abnormal_flag=flag,
                page_num=page_num,
                original_line=line,
                confidence="HIGH" if ref_range else "MEDIUM"
            )

        # Pattern for "TestName: Value Unit (Ref: Range)"
        inline_match = re.search(
            r"([A-Za-z0-9\s\-\/\+]{2,30}?)\s*:\s*([><=]?\s*[0-9]+(?:\.[0-9]+)?|[A-Za-z]+)\s*([A-Za-z0-9\^\/\%µ\.\-]+)?\s*(?:\((?:ref|range)?\s*[:\-]?\s*([^\)]+)\))?",
            line,
            re.IGNORECASE
        )
        if inline_match:
            test_name = inline_match.group(1).strip()
            val_str = inline_match.group(2).strip()
            unit = inline_match.group(3)
            ref_range = inline_match.group(4)
            
            if test_name.lower() not in ["note", "page", "date", "dr", "doctor", "phone", "address"]:
                return cls._build_observation(
                    test_name=test_name,
                    value_text=val_str,
                    unit=unit,
                    reference_range=ref_range,
                    abnormal_flag=None,
                    page_num=page_num,
                    original_line=line,
                    confidence="MEDIUM"
                )

        return None

    @classmethod
    def _build_observation(
        cls,
        test_name: str,
        value_text: str,
        unit: Optional[str],
        reference_range: Optional[str],
        abnormal_flag: Optional[str],
        page_num: int,
        original_line: str,
        confidence: str
    ) -> Optional[Dict[str, Any]]:
        # Clean test name
        test_name = re.sub(r"^[0-9\.\-\s]+", "", test_name).strip()
        if not test_name:
            return None

        # Clean numeric value
        num_val = None
        clean_val_str = value_text.replace("<", "").replace(">", "").replace("=", "").strip()
        try:
            num_val = float(clean_val_str)
        except ValueError:
            num_val = None

        # Deterministic status evaluation using StatusEngine
        status, norm_ref, reason = StatusEngine.evaluate(
            value_text=value_text,
            numeric_value=num_val,
            reference_range=reference_range
        )

        return {
            "test_name": test_name,
            "value_text": value_text,
            "numeric_value": num_val,
            "unit": unit.strip() if unit else None,
            "original_reference_range": reference_range.strip() if reference_range else None,
            "normalized_reference_range": norm_ref,
            "status": status,
            "status_reason": reason,
            "abnormal_flag": abnormal_flag.strip() if abnormal_flag else None,
            "source_page": page_num,
            "original_text": original_line,
            "provenance": "REPORT_EXTRACTED",
            "confidence": confidence,
            "is_reviewed": False,
            "review_status": "UNREVIEWED"
        }

    @classmethod
    def _extract_lab_name(cls, text: str) -> Optional[str]:
        for pattern in cls.LAB_NAME_PATTERNS:
            m = pattern.search(text)
            if m:
                return m.group(1).strip()
        return "Clinical Pathology Services"

    @classmethod
    def _extract_report_date(cls, text: str) -> Optional[str]:
        for pattern in cls.DATE_PATTERNS:
            m = pattern.search(text)
            if m:
                return m.group(1).strip()
        return None
