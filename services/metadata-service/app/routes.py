import logging
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from sqlalchemy import or_, func
from app.database import get_db
from app.models import Document, DocumentAccessLog
from app.schemas import (
    DocumentCreate, DocumentResponse, AccessLogCreate, AccessLogResponse,
    ClusterTopologyResponse
)
from app.config import settings
from app.k8s_client import get_live_cluster_topology

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/documents", tags=["Documents & Metadata"])
cluster_router = APIRouter(prefix="/api/cluster", tags=["Cluster Telemetry"])

# --- Document APIs ---

@router.post("/internal", response_model=DocumentResponse, status_code=status.HTTP_201_CREATED)
def create_document_internal(payload: DocumentCreate, db: Session = Depends(get_db)):
    """Called synchronously by File Service after persisting binary to MinIO"""
    new_doc = Document(
        title=payload.title,
        description=payload.description,
        original_filename=payload.original_filename,
        stored_filename=payload.stored_filename,
        storage_bucket=payload.storage_bucket,
        storage_key=payload.storage_key,
        file_size_bytes=payload.file_size_bytes,
        mime_type=payload.mime_type,
        file_extension=payload.file_extension,
        uploader_id=payload.uploader_id,
        uploader_name=payload.uploader_name,
        department=payload.department,
        course_code=payload.course_code,
        submission_type=payload.submission_type,
        is_public=payload.is_public
    )
    db.add(new_doc)
    db.commit()
    db.refresh(new_doc)

    # Log access
    log = DocumentAccessLog(
        document_id=new_doc.id,
        user_id=payload.uploader_id,
        user_name=payload.uploader_name,
        action="upload",
        status="success",
        details=f"Uploaded {payload.original_filename} ({payload.file_size_bytes} bytes)"
    )
    db.add(log)
    db.commit()

    return DocumentResponse.model_validate(new_doc)

@router.get("", response_model=List[DocumentResponse])
@router.get("/", response_model=List[DocumentResponse])
def list_documents(
    search: Optional[str] = Query(None, description="Search by title or filename"),
    course_code: Optional[str] = None,
    department: Optional[str] = None,
    submission_type: Optional[str] = None,
    uploader_id: Optional[str] = None,
    db: Session = Depends(get_db)
):
    query = db.query(Document)
    if search:
        s = f"%{search}%"
        query = query.filter(or_(Document.title.ilike(s), Document.original_filename.ilike(s)))
    if course_code:
        query = query.filter(Document.course_code == course_code)
    if department:
        query = query.filter(Document.department == department)
    if submission_type:
        query = query.filter(Document.submission_type == submission_type)
    if uploader_id:
        query = query.filter(Document.uploader_id == uploader_id)

    query = query.order_by(Document.created_at.desc())
    return [DocumentResponse.model_validate(d) for d in query.all()]

@router.get("/stats/overview")
def get_stats_overview(db: Session = Depends(get_db)):
    total_docs = db.query(Document).count()
    total_bytes = db.query(func.sum(Document.file_size_bytes)).scalar() or 0
    unique_uploaders = db.query(func.count(func.distinct(Document.uploader_id))).scalar() or 0

    # Group by course
    by_course = db.query(Document.course_code, func.count(Document.id)).group_by(Document.course_code).all()
    # Group by type
    by_type = db.query(Document.submission_type, func.count(Document.id)).group_by(Document.submission_type).all()

    return {
        "total_documents": total_docs,
        "total_storage_bytes": total_bytes,
        "total_storage_mb": round(total_bytes / (1024 * 1024), 2),
        "unique_students": unique_uploaders,
        "submissions_by_course": {c: count for c, count in by_course},
        "submissions_by_type": {t: count for t, count in by_type}
    }

@router.get("/{document_id}", response_model=DocumentResponse)
def get_document_details(document_id: str, db: Session = Depends(get_db)):
    doc = db.query(Document).filter(Document.id == document_id).first()
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")
    return DocumentResponse.model_validate(doc)

@router.get("/{document_id}/verify-access")
def verify_document_access(
    document_id: str,
    user_id: str,
    user_role: str,
    user_name: Optional[str] = "Student",
    db: Session = Depends(get_db)
):
    """Called by File Service before returning streaming binary download to client"""
    doc = db.query(Document).filter(Document.id == document_id).first()
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")

    # Access rule: Auditors, Executives and Admins can access everything across departments.
    # Engineers/Contributors can access own department documents or public documents.
    is_privileged = user_role in ["auditor", "executive", "admin", "teacher"]
    has_permission = is_privileged or (str(doc.uploader_id) == str(user_id)) or (doc.is_public is True) or (doc.department == user_role)

    status_str = "success" if has_permission else "unauthorized"
    log = DocumentAccessLog(
        document_id=doc.id,
        user_id=user_id,
        user_name=user_name,
        action="download",
        status=status_str,
        details=f"User role={user_role} attempted download of {doc.original_filename}"
    )
    db.add(log)
    db.commit()

    if not has_permission:
        raise HTTPException(status_code=403, detail="Forbidden: You do not have permission to download this document")

    return {
        "access_granted": True,
        "storage_bucket": doc.storage_bucket,
        "storage_key": doc.storage_key,
        "original_filename": doc.original_filename,
        "mime_type": doc.mime_type,
        "file_size_bytes": doc.file_size_bytes
    }

@router.delete("/{document_id}")
def delete_document(
    document_id: str,
    user_id: str,
    user_role: str,
    db: Session = Depends(get_db)
):
    doc = db.query(Document).filter(Document.id == document_id).first()
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")

    if user_role not in ["teacher", "admin"] and str(doc.uploader_id) != str(user_id):
        raise HTTPException(status_code=403, detail="Cannot delete document uploaded by another student")

    storage_key = doc.storage_key
    storage_bucket = doc.storage_bucket

    db.delete(doc)
    db.commit()

    return {
        "status": "deleted",
        "storage_bucket": storage_bucket,
        "storage_key": storage_key
    }

@router.get("/access-logs/all", response_model=List[AccessLogResponse])
def get_all_access_logs(limit: int = 50, db: Session = Depends(get_db)):
    logs = db.query(DocumentAccessLog).order_by(DocumentAccessLog.timestamp.desc()).limit(limit).all()
    return [AccessLogResponse.model_validate(l) for l in logs]

@router.post("/seed-enterprise-data")
def seed_enterprise_data(db: Session = Depends(get_db)):
    existing = db.query(Document).count()
    if existing > 0:
        return {"status": "already_seeded", "count": existing}

    demo_docs = [
        {
            "title": "Master Services Agreement (MSA) - Enterprise Tier",
            "description": "Standard multi-year service level agreement and data protection addendum",
            "original_filename": "MSA_Enterprise_AcmeCorp_2026.pdf",
            "stored_filename": "msa_enterprise_acmecorp_2026.pdf",
            "storage_bucket": "enterprise-vault-documents",
            "storage_key": "legal/contracts/msa/msa_enterprise_acmecorp_2026.pdf",
            "file_size_bytes": 2450000,
            "mime_type": "application/pdf",
            "file_extension": "pdf",
            "uploader_id": "usr-sarah-chen",
            "uploader_name": "Sarah Chen, Esq.",
            "department": "Legal & Corporate Compliance",
            "course_code": "LEGAL-01",
            "submission_type": "contract",
            "is_public": False
        },
        {
            "title": "Kubernetes Multi-Cluster Placement Architecture Specification",
            "description": "Production design for Pod Affinity, Anti-Affinity, and cross-zone node fault tolerance",
            "original_filename": "K8s_Placement_Architecture_Spec_v3.pdf",
            "stored_filename": "k8s_placement_architecture_spec_v3.pdf",
            "storage_bucket": "enterprise-vault-documents",
            "storage_key": "engineering/blueprints/k8s_placement_architecture_spec_v3.pdf",
            "file_size_bytes": 5820000,
            "mime_type": "application/pdf",
            "file_extension": "pdf",
            "uploader_id": "usr-alex-kumar",
            "uploader_name": "Alex Kumar",
            "department": "Cloud & Infrastructure Engineering",
            "course_code": "ENG-402",
            "submission_type": "blueprint",
            "is_public": True
        },
        {
            "title": "FY2026 Q3 Consolidated Financial Audit & SOC-2 Report",
            "description": "Audited balance sheet, cash flows, and external compliance control matrix",
            "original_filename": "FY26_Q3_Financial_Audit_Report.pdf",
            "stored_filename": "fy26_q3_financial_audit_report.pdf",
            "storage_bucket": "enterprise-vault-documents",
            "storage_key": "finance/audits/fy26_q3_financial_audit_report.pdf",
            "file_size_bytes": 8190000,
            "mime_type": "application/pdf",
            "file_extension": "pdf",
            "uploader_id": "usr-elena-rostova",
            "uploader_name": "Elena Rostova",
            "department": "Global Finance & Operations",
            "course_code": "FIN-201",
            "submission_type": "financial_report",
            "is_public": False
        },
        {
            "title": "Global Employee Data Privacy & Cryptographic Handling Policy",
            "description": "Mandatory GDPR and CCPA operational protocols for company workforce",
            "original_filename": "Employee_Privacy_Protocol_2026.docx",
            "stored_filename": "employee_privacy_protocol_2026.docx",
            "storage_bucket": "enterprise-vault-documents",
            "storage_key": "hr/policies/employee_privacy_protocol_2026.docx",
            "file_size_bytes": 1120000,
            "mime_type": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            "file_extension": "docx",
            "uploader_id": "usr-sarah-chen",
            "uploader_name": "Sarah Chen, Esq.",
            "department": "Legal & Corporate Compliance",
            "course_code": "HR-101",
            "submission_type": "policy",
            "is_public": True
        }
    ]

    for d in demo_docs:
        doc = Document(**d)
        db.add(doc)
    db.commit()

    # Add audit entries
    logs = [
        DocumentAccessLog(user_name="Sarah Chen, Esq.", action="upload", status="success", details="Encrypted & stored MSA_Enterprise_AcmeCorp_2026.pdf (2.45MB) in MinIO vault"),
        DocumentAccessLog(user_name="Alex Kumar", action="upload", status="success", details="Published K8s_Placement_Architecture_Spec_v3.pdf to Engineering repository"),
        DocumentAccessLog(user_name="Elena Rostova", action="download", status="success", details="Downloaded financial audit report via high-speed cluster proxy")
    ]
    for l in logs:
        db.add(l)
    db.commit()

    return {"status": "seeded", "count": len(demo_docs)}


# --- Cluster Topology APIs ---

@cluster_router.get("/topology", response_model=ClusterTopologyResponse)
def get_cluster_topology():
    """Returns real-time node & pod distribution for the interactive infrastructure map"""
    return get_live_cluster_topology()

@cluster_router.post("/strategy")
def set_placement_strategy(strategy: str):
    """Allows testing different strategies in live dashboard"""
    valid = [
        "strategy-1-default",
        "strategy-2a-locality",
        "strategy-2-affinity",
        "strategy-2b-spread",
        "strategy-3-autoscaling",
        "strategy-4-combined"
    ]
    if strategy not in valid:
        raise HTTPException(status_code=400, detail=f"Strategy must be one of {valid}")
    settings.CURRENT_STRATEGY = strategy
    return {"status": "updated", "current_strategy": settings.CURRENT_STRATEGY}
