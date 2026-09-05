import io
from typing import List, Dict, Any, Tuple
import pypdf
from fastapi import HTTPException


class PDFExtractor:
    """
    Dedicated PDF and text document extraction service.
    Preserves original text, page numbers, line provenance and section context.
    """

    @classmethod
    def extract_from_bytes(cls, file_bytes: bytes, file_type: str) -> Tuple[str, List[Dict[str, Any]]]:
        """
        Extracts structured page text from binary content.
        
        Returns:
            (full_text, pages_metadata)
            pages_metadata: [{"page_num": int, "text": str}]
        """
        file_type = file_type.lower().lstrip(".")

        if file_type == "pdf":
            return cls._extract_pdf(file_bytes)
        elif file_type in ("txt", "json", "csv"):
            return cls._extract_text(file_bytes)
        else:
            raise HTTPException(
                status_code=400,
                detail=f"Unsupported file type '{file_type}' for text extraction."
            )

    @classmethod
    def _extract_pdf(cls, pdf_bytes: bytes) -> Tuple[str, List[Dict[str, Any]]]:
        try:
            reader = pypdf.PdfReader(io.BytesIO(pdf_bytes))
            pages_meta = []
            full_text_chunks = []

            for i, page in enumerate(reader.pages):
                page_text = page.extract_text() or ""
                # Normalize line breaks
                page_text = "\n".join([line.strip() for line in page_text.splitlines() if line.strip()])
                pages_meta.append({
                    "page_num": i + 1,
                    "text": page_text
                })
                if page_text:
                    full_text_chunks.append(f"--- PAGE {i + 1} ---\n{page_text}")

            full_text = "\n\n".join(full_text_chunks)
            if not full_text.strip():
                # Provide clear error for scanned image PDFs or blank PDFs
                raise HTTPException(
                    status_code=422,
                    detail="The uploaded PDF does not contain extractable digital text (it may be a scanned image or blank document)."
                )

            return full_text, pages_meta

        except pypdf.errors.PdfReadError as e:
            raise HTTPException(
                status_code=400,
                detail=f"Malformed or corrupted PDF file: {str(e)}"
            )
        except Exception as e:
            if isinstance(e, HTTPException):
                raise e
            raise HTTPException(
                status_code=500,
                detail=f"An unexpected error occurred during PDF text extraction: {str(e)}"
            )

    @classmethod
    def _extract_text(cls, text_bytes: bytes) -> Tuple[str, List[Dict[str, Any]]]:
        try:
            decoded = text_bytes.decode("utf-8", errors="replace")
            pages_meta = [{"page_num": 1, "text": decoded}]
            return decoded, pages_meta
        except Exception as e:
            raise HTTPException(status_code=400, detail=f"Failed to read text file: {str(e)}")

