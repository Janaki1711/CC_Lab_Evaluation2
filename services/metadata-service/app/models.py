import uuid
from datetime import datetime
from sqlalchemy import Column, String, Text, BigInteger, Boolean, DateTime
from app.database import Base

class Document(Base):
    __tablename__ = "documents"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()), index=True)
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    original_filename = Column(String(255), nullable=False)
    stored_filename = Column(String(255), nullable=False)
    storage_bucket = Column(String(100), nullable=False, default="academic-documents")
    storage_key = Column(String(255), unique=True, nullable=False, index=True)
    file_size_bytes = Column(BigInteger, nullable=False)
    mime_type = Column(String(100), nullable=False)
    file_extension = Column(String(20), nullable=False)
    uploader_id = Column(String(36), nullable=False, index=True)
    uploader_name = Column(String(100), nullable=False)
    department = Column(String(100), nullable=False, default="Computer Science & Engineering")
    course_code = Column(String(50), nullable=False, default="CS501", index=True)
    submission_type = Column(String(50), nullable=False, default="assignment", index=True)
    is_public = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow, index=True)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

class DocumentAccessLog(Base):
    __tablename__ = "document_access_logs"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()), index=True)
    document_id = Column(String(36), nullable=True, index=True)
    user_id = Column(String(36), nullable=True, index=True)
    user_name = Column(String(100), nullable=True)
    action = Column(String(20), nullable=False)  # 'upload', 'download', 'view', 'delete'
    status = Column(String(20), nullable=False)  # 'success', 'failure', 'unauthorized'
    ip_address = Column(String(45), nullable=True)
    details = Column(Text, nullable=True)
    timestamp = Column(DateTime, default=datetime.utcnow, index=True)
