import os
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    SERVICE_NAME: str = "file-service"
    PORT: int = 8002
    ENVIRONMENT: str = os.getenv("ENVIRONMENT", "development")

    # MinIO
    MINIO_ENDPOINT: str = os.getenv("MINIO_ENDPOINT", "localhost:9000")
    MINIO_ROOT_USER: str = os.getenv("MINIO_ROOT_USER", "minio_admin")
    MINIO_ROOT_PASSWORD: str = os.getenv("MINIO_ROOT_PASSWORD", "minio_secure_password_2026")
    MINIO_BUCKET_NAME: str = os.getenv("MINIO_BUCKET_NAME", "academic-documents")
    MINIO_USE_SSL: bool = os.getenv("MINIO_USE_SSL", "false").lower() == "true"

    # Upstream Microservice URLs
    METADATA_SERVICE_URL: str = os.getenv("METADATA_SERVICE_URL", "http://localhost:8003")
    AUTH_SERVICE_URL: str = os.getenv("AUTH_SERVICE_URL", "http://localhost:8001")

    # Security
    JWT_SECRET_KEY: str = os.getenv("JWT_SECRET_KEY", "academic_cloud_jwt_secret_key_evaluation_2026")
    JWT_ALGORITHM: str = os.getenv("JWT_ALGORITHM", "HS256")

    # Limits: 50MB max upload
    MAX_FILE_SIZE_BYTES: int = 50 * 1024 * 1024

    class Config:
        case_sensitive = True

settings = Settings()
