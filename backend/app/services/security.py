import os
import uuid
import re
from typing import Tuple
from pathlib import Path
from fastapi import HTTPException, UploadFile
from backend.app.config import settings


class SecurityService:
    @staticmethod
    def sanitize_filename(filename: str) -> str:
        """
        Strips path traversal sequences and unsafe characters from original filename.
        """
        # Remove directories / backslashes
        clean = os.path.basename(filename)
        # Keep only alphanumeric, dots, hyphens, underscores
        clean = re.sub(r"[^\w\.-]", "_", clean)
        return clean or "uploaded_document"

    @staticmethod
    def generate_safe_storage_name(original_filename: str) -> Tuple[str, str]:
        """
        Generates a secure UUID-based internal filename with preserved extension.
        Returns: (safe_internal_name, extension)
        """
        clean = SecurityService.sanitize_filename(original_filename)
        parts = clean.rsplit(".", 1)
        ext = parts[1].lower() if len(parts) > 1 else "dat"
        safe_name = f"{uuid.uuid4().hex}.{ext}"
        return safe_name, ext

    @staticmethod
    def validate_file(file: UploadFile, max_size_bytes: int) -> str:
        """
        Validates uploaded file against extension, MIME-type and size rules.
        """
        if not file.filename:
            raise HTTPException(status_code=400, detail="Missing filename in uploaded request.")

        # Validate extension
        clean_name = SecurityService.sanitize_filename(file.filename)
        ext = clean_name.rsplit(".", 1)[-1].lower() if "." in clean_name else ""
        
        allowed_exts = settings.allowed_extensions_set
        if ext not in allowed_exts:
            raise HTTPException(
                status_code=400,
                detail=f"Unsupported file format '.{ext}'. Supported formats: {', '.join(sorted(allowed_exts))}."
            )
        
        return ext

    @staticmethod
    def get_upload_dir() -> Path:
        """
        Ensures upload directory exists and returns safe Path.
        """
        upload_path = Path(settings.UPLOAD_DIR).resolve()
        upload_path.mkdir(parents=True, exist_ok=True)
        return upload_path
