import logging
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from prometheus_client import make_asgi_app, Counter, Histogram
from app.config import settings
from app.routes import router as files_router

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(name)s: %(message)s")
logger = logging.getLogger("file-service")

app = FastAPI(
    title="Academic Document System - File Service",
    description="MinIO-backed streaming document upload and download microservice",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Prometheus metrics
UPLOAD_COUNT = Counter("file_uploads_total", "Total file uploads", ["status"])
DOWNLOAD_COUNT = Counter("file_downloads_total", "Total file downloads", ["status"])
FILE_SIZE_BYTES = Histogram("file_transfer_bytes", "Transferred file sizes in bytes")

metrics_app = make_asgi_app()
app.mount("/metrics", metrics_app)

app.include_router(files_router)

@app.on_event("startup")
def startup_event():
    logger.info(f"File Service initialized on port 8002. MinIO target: {settings.MINIO_ENDPOINT}")

@app.get("/health")
def health_check():
    return {
        "status": "healthy",
        "service": settings.SERVICE_NAME,
        "environment": settings.ENVIRONMENT,
        "bucket": settings.MINIO_BUCKET_NAME
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=settings.PORT, reload=True)
