"""Document upload and management endpoints."""

import os
import re
import uuid
from fastapi import APIRouter, UploadFile, File, Form, HTTPException
from fastapi.responses import Response
from app.models.schemas import UploadResponse
from app.models.session_store import store, DocumentData
from app.services.pdf_parser import parse_pdf
from app.config import settings

router = APIRouter(prefix="/api/documents", tags=["documents"])


@router.post("/upload", response_model=UploadResponse)
async def upload_document(
    file: UploadFile = File(...),
    session_id: str = Form(...),
):
    """Upload a PDF document for analysis."""
    session = store.get_session(session_id)
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")

    clean_filename = re.sub(r'[^a-zA-Z0-9_.-]', '_', os.path.basename(file.filename or "document.pdf"))
    if not clean_filename.lower().endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF files are supported")

    file_bytes = await file.read()
    max_size = settings.MAX_FILE_SIZE_MB * 1024 * 1024
    if len(file_bytes) > max_size:
        raise HTTPException(
            status_code=400,
            detail=f"File exceeds maximum size of {settings.MAX_FILE_SIZE_MB}MB",
        )

    # Magic-byte validation to reject disguised non-PDF binary files
    if not file_bytes.startswith(b"%PDF-"):
        raise HTTPException(status_code=400, detail="Invalid PDF file: Missing %PDF- file header")

    try:
        parsed = parse_pdf(file_bytes, clean_filename)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

    document_id = str(uuid.uuid4())
    doc_data = DocumentData(
        document_id=document_id,
        filename=clean_filename,
        pdf_bytes=file_bytes,
        parsed=parsed,
    )
    store.add_document(session_id, doc_data)
    store.clear_conversation(session_id)

    return UploadResponse(
        document_id=document_id,
        filename=clean_filename,
        total_pages=parsed.total_pages,
    )


@router.get("/{document_id}/pdf")
async def get_document_pdf(document_id: str, session_id: str):
    """Retrieve the raw PDF for rendering in the viewer."""
    doc = store.get_document(session_id, document_id)
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")

    safe_name = re.sub(r'[\r\n"\\\x00-\x1f]', '', doc.filename)
    return Response(
        content=doc.pdf_bytes,
        media_type="application/pdf",
        headers={"Content-Disposition": f'inline; filename="{safe_name}"'},
    )


@router.get("/{document_id}")
async def get_document_info(document_id: str, session_id: str):
    """Get document metadata."""
    doc = store.get_document(session_id, document_id)
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")
    return {
        "document_id": doc.document_id,
        "filename": doc.filename,
        "total_pages": doc.parsed.total_pages,
        "uploaded_at": doc.uploaded_at.isoformat(),
    }
