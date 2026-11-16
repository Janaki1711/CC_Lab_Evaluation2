import os
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    SERVICE_NAME: str = "booking-service"
    PORT: int = 8004
    ENVIRONMENT: str = os.getenv("ENVIRONMENT", "production")

    # PostgreSQL
    POSTGRES_USER: str = os.getenv("POSTGRES_USER", "postgres_admin")
    POSTGRES_PASSWORD: str = os.getenv("POSTGRES_PASSWORD", "academic_secure_password_2026")
    POSTGRES_HOST: str = os.getenv("POSTGRES_HOST", "postgres-service")
    POSTGRES_PORT: str = os.getenv("POSTGRES_PORT", "5432")
    POSTGRES_DB: str = os.getenv("POSTGRES_DB", "academic_docs_db")

    @property
    def DATABASE_URL(self) -> str:
        return f"postgresql://{self.POSTGRES_USER}:{self.POSTGRES_PASSWORD}@{self.POSTGRES_HOST}:{self.POSTGRES_PORT}/{self.POSTGRES_DB}"

    # Redis Distributed Lock Cache
    REDIS_HOST: str = os.getenv("REDIS_HOST", "redis-service")
    REDIS_PORT: int = int(os.getenv("REDIS_PORT", "6379"))
    LOCK_TTL_SECONDS: int = int(os.getenv("LOCK_TTL_SECONDS", "60"))

    # Node Topology Identity
    NODE_NAME: str = os.getenv("MY_NODE_NAME", "kind-worker-node")
    POD_NAME: str = os.getenv("MY_POD_NAME", "booking-service-instance")

    class Config:
        case_sensitive = True

settings = Settings()
