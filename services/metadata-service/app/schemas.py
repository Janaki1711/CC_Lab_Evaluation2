from datetime import datetime
from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field

class DocumentCreate(BaseModel):
    title: str = Field(..., min_length=1, max_length=255)
    description: Optional[str] = None
    original_filename: str
    stored_filename: str
    storage_bucket: str = "academic-documents"
    storage_key: str
    file_size_bytes: int = Field(..., gt=0)
    mime_type: str
    file_extension: str
    uploader_id: str
    uploader_name: str
    department: str = "Computer Science & Engineering"
    course_code: str = "CS501"
    submission_type: str = "assignment"
    is_public: bool = False

class DocumentResponse(BaseModel):
    id: str
    title: str
    description: Optional[str]
    original_filename: str
    stored_filename: str
    storage_bucket: str
    storage_key: str
    file_size_bytes: int
    mime_type: str
    file_extension: str
    uploader_id: str
    uploader_name: str
    department: str
    course_code: str
    submission_type: str
    is_public: bool
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class AccessLogCreate(BaseModel):
    document_id: Optional[str] = None
    user_id: Optional[str] = None
    user_name: Optional[str] = None
    action: str
    status: str
    ip_address: Optional[str] = None
    details: Optional[str] = None

class AccessLogResponse(BaseModel):
    id: str
    document_id: Optional[str]
    user_id: Optional[str]
    user_name: Optional[str]
    action: str
    status: str
    ip_address: Optional[str]
    details: Optional[str]
    timestamp: datetime

    class Config:
        from_attributes = True

class PodTopology(BaseModel):
    name: str
    service: str
    node: str
    status: str
    ip: str
    restarts: int
    cpu_usage_m: int
    memory_usage_mb: int
    affinity_rule: str

class NodeTopology(BaseModel):
    name: str
    role: str
    status: str
    ip: str
    cpu_capacity_cores: float
    cpu_used_cores: float
    cpu_percent: float
    memory_capacity_gb: float
    memory_used_gb: float
    memory_percent: float
    pods_count: int

class ClusterTopologyResponse(BaseModel):
    timestamp: datetime
    active_strategy: str
    nodes: List[NodeTopology]
    pods: List[PodTopology]
    summary: Dict[str, Any]
