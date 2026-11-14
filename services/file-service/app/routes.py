import os
import io
import uuid
import logging
import requests
from typing import Optional
from fastapi import APIRouter, UploadFile, File, Form, Header, HTTPException, status
from fastapi.responses import StreamingResponse
from jose import JWTError, jwt
from app.config import settings
from app.minio_client import storage

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/files", tags=["File Storage Operations"])

def get_current_user_payload(authorization: Optional[str] = Header(None)) -> dict:
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Missing or invalid Authorization header",
            headers={"WWW-Authenticate": "Bearer"},
        )
    token = authorization.split(" ")[1]
    try:
        payload = jwt.decode(token, settings.JWT_SECRET_KEY, algorithms=[settings.JWT_ALGORITHM])
        return payload
    except JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token signature invalid or expired"
        )

@router.post("/upload", status_code=status.HTTP_201_CREATED)
async def upload_document(
    file: UploadFile = File(...),
    title: str = Form(...),
    description: Optional[str] = Form(""),
    department: str = Form("Computer Science & Engineering"),
    course_code: str = Form("CS501"),
    submission_type: str = Form("assignment"),
    is_public: bool = Form(False),
    authorization: str = Header(...)
):
    user = get_current_user_payload(authorization)
    user_id = user.get("sub")
    user_name = user.get("full_name") or user.get("username", "Student")

    # Read file buffer and check size
    file_bytes = await file.read()
    file_size = len(file_bytes)

    if file_size <= 0:
        raise HTTPException(status_code=400, detail="Cannot upload an empty file")
    if file_size > settings.MAX_FILE_SIZE_BYTES:
        raise HTTPException(status_code=413, detail=f"File exceeds maximum allowed limit of {settings.MAX_FILE_SIZE_BYTES // (1024*1024)}MB")

    # Generate isolated object key
    doc_uuid = str(uuid.uuid4())
    _, ext = os.path.splitext(file.filename or "")
    clean_ext = ext.lstrip(".").lower() or "bin"
    safe_filename = file.filename.replace(" ", "_")
    
    # Hierarchy: {department}/{course}/{submission_type}/{uuid}_{filename}
    clean_dept = department.replace(" ", "_").lower()
    clean_course = course_code.replace(" ", "_").lower()
    clean_type = submission_type.replace(" ", "_").lower()
    object_key = f"{clean_dept}/{clean_course}/{clean_type}/{doc_uuid}_{safe_filename}"

    # 1. Stream binary into MinIO / Storage
    try:
        stream = io.BytesIO(file_bytes)
        storage.upload_stream(
            object_key=object_key,
            data_stream=stream,
            length=file_size,
            content_type=file.content_type or "application/octet-stream"
        )
    except Exception as e:
        logger.error(f"MinIO storage persistence failed: {e}")
        raise HTTPException(status_code=500, detail=f"Object storage persistence failed: {str(e)}")

    # 2. Synchronous RPC to Metadata Service to persist schema record
    metadata_payload = {
        "title": title,
        "description": description,
        "original_filename": file.filename,
        "stored_filename": f"{doc_uuid}_{safe_filename}",
        "storage_bucket": settings.MINIO_BUCKET_NAME,
        "storage_key": object_key,
        "file_size_bytes": file_size,
        "mime_type": file.content_type or "application/octet-stream",
        "file_extension": clean_ext,
        "uploader_id": user_id,
        "uploader_name": user_name,
        "department": department,
        "course_code": course_code,
        "submission_type": submission_type,
        "is_public": is_public
    }

    try:
        resp = requests.post(
            f"{settings.METADATA_SERVICE_URL}/api/documents/internal",
            json=metadata_payload,
            timeout=10
        )
        if resp.status_code != 201:
            # Rollback storage if metadata failed
            storage.remove_object(object_key)
            raise HTTPException(status_code=resp.status_code, detail=f"Metadata registration failed: {resp.text}")
        doc_record = resp.json()
    except requests.RequestException as e:
        storage.remove_object(object_key)
        logger.error(f"Could not connect to metadata-service: {e}")
        raise HTTPException(status_code=503, detail=f"Metadata service unavailable: {str(e)}")

    return {
        "status": "success",
        "message": "Document uploaded and metadata indexed successfully",
        "document": doc_record
    }

@router.get("/download/{document_id}")
def download_document(
    document_id: str,
    authorization: str = Header(...)
):
    user = get_current_user_payload(authorization)
    user_id = user.get("sub")
    user_role = user.get("role")
    user_name = user.get("full_name") or user.get("username", "Student")

    # 1. Verify access via Metadata Service
    try:
        verify_resp = requests.get(
            f"{settings.METADATA_SERVICE_URL}/api/documents/{document_id}/verify-access",
            params={
                "user_id": user_id,
                "user_role": user_role,
                "user_name": user_name
            },
            timeout=10
        )
        if verify_resp.status_code != 200:
            raise HTTPException(status_code=verify_resp.status_code, detail=verify_resp.json().get("detail", "Access denied"))
        access_info = verify_resp.json()
    except requests.RequestException as e:
        raise HTTPException(status_code=503, detail=f"Failed to communicate with metadata service: {str(e)}")

    storage_key = access_info["storage_key"]
    filename = access_info["original_filename"]
    mime_type = access_info.get("mime_type", "application/octet-stream")
    file_size = access_info.get("file_size_bytes")

    # 2. Stream binary chunks from MinIO directly to client
    try:
        stream_generator = storage.get_stream(storage_key)
        headers = {
            "Content-Disposition": f'attachment; filename="{filename}"',
            "Access-Control-Expose-Headers": "Content-Disposition"
        }
        if file_size:
            headers["Content-Length"] = str(file_size)

        return StreamingResponse(
            stream_generator,
            media_type=mime_type,
            headers=headers
        )
    except FileNotFoundError:
        raise HTTPException(status_code=404, detail="File binary not found in storage")
    except Exception as e:
        logger.error(f"Error streaming object {storage_key}: {e}")
        raise HTTPException(status_code=500, detail=f"Storage streaming error: {str(e)}")

@router.delete("/{document_id}")
def delete_document(
    document_id: str,
    authorization: str = Header(...)
):
    user = get_current_user_payload(authorization)
    user_id = user.get("sub")
    user_role = user.get("role")

    # Call metadata service to delete record
    try:
        del_resp = requests.delete(
            f"{settings.METADATA_SERVICE_URL}/api/documents/{document_id}",
            params={"user_id": user_id, "user_role": user_role},
            timeout=10
        )
        if del_resp.status_code != 200:
            raise HTTPException(status_code=del_resp.status_code, detail=del_resp.json().get("detail", "Deletion failed"))
        data = del_resp.json()
        storage_key = data.get("storage_key")
        if storage_key:
            storage.remove_object(storage_key)
        return {"status": "success", "message": "Document deleted successfully"}
    except requests.RequestException as e:
        raise HTTPException(status_code=503, detail=f"Metadata service unavailable: {str(e)}")
