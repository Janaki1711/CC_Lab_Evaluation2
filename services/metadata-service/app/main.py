import logging
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from prometheus_client import make_asgi_app, Counter, Histogram
from app.config import settings
from app.database import Base, engine, SessionLocal
from app.routes import router as documents_router, cluster_router, seed_enterprise_data

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(name)s: %(message)s")
logger = logging.getLogger("metadata-service")

# Auto-create tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="VaultCloud Enterprise - Metadata Service",
    description="Enterprise document metadata persistence and Kubernetes cluster telemetry microservice",
    version="2.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Prometheus metrics
METADATA_OPS = Counter("metadata_operations_total", "Total metadata operations", ["operation", "status"])
REQUEST_LATENCY = Histogram("metadata_request_duration_seconds", "Duration in seconds", ["endpoint"])

metrics_app = make_asgi_app()
app.mount("/metrics", metrics_app)

app.include_router(documents_router)
app.include_router(cluster_router)

@app.on_event("startup")
def startup_event():
    logger.info("Metadata Service started on port 8003. Tables verified.")
    db = SessionLocal()
    try:
        seed_enterprise_data(db)
        logger.info("Enterprise documents seeded successfully.")
    except Exception as e:
        logger.warning(f"Could not auto-seed enterprise data: {e}")
    finally:
        db.close()

@app.get("/health")
def health_check():
    return {
        "status": "healthy",
        "service": settings.SERVICE_NAME,
        "environment": settings.ENVIRONMENT,
        "strategy": settings.CURRENT_STRATEGY
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=settings.PORT, reload=True)
