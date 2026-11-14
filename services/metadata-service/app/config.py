import os
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    SERVICE_NAME: str = "metadata-service"
    PORT: int = 8003
    ENVIRONMENT: str = os.getenv("ENVIRONMENT", "development")

    # Database
    POSTGRES_USER: str = os.getenv("POSTGRES_USER", "postgres_admin")
    POSTGRES_PASSWORD: str = os.getenv("POSTGRES_PASSWORD", "academic_secure_password_2026")
    POSTGRES_HOST: str = os.getenv("POSTGRES_HOST", "localhost")
    POSTGRES_PORT: str = os.getenv("POSTGRES_PORT", "5432")
    POSTGRES_DB: str = os.getenv("POSTGRES_DB", "academic_docs_db")
    DATABASE_URL: str = os.getenv(
        "DATABASE_URL",
        f"postgresql://{POSTGRES_USER}:{POSTGRES_PASSWORD}@{POSTGRES_HOST}:{POSTGRES_PORT}/{POSTGRES_DB}"
    )

    # JWT Settings (for validating tokens locally if needed)
    JWT_SECRET_KEY: str = os.getenv("JWT_SECRET_KEY", "academic_cloud_jwt_secret_key_evaluation_2026")
    JWT_ALGORITHM: str = os.getenv("JWT_ALGORITHM", "HS256")

    # Placement Strategy Configuration
    CURRENT_STRATEGY: str = os.getenv("CURRENT_STRATEGY", "strategy-2-affinity")

    class Config:
        case_sensitive = True

settings = Settings()
