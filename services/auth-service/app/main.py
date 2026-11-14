import logging
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from prometheus_client import make_asgi_app, Counter, Histogram
from app.config import settings
from app.database import Base, engine, SessionLocal
from app.routes import router as auth_router, seed_demo_users

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(name)s: %(message)s")
logger = logging.getLogger("auth-service")

# Auto-create tables on startup
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Academic Document System - Auth Service",
    description="JWT-based authentication and role management microservice",
    version="1.0.0"
)

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Prometheus metrics setup
REQUEST_COUNT = Counter("auth_requests_total", "Total requests to auth service", ["method", "endpoint", "status"])
REQUEST_LATENCY = Histogram("auth_request_duration_seconds", "Request duration in seconds", ["endpoint"])

metrics_app = make_asgi_app()
app.mount("/metrics", metrics_app)

app.include_router(auth_router)

@app.on_event("startup")
def startup_event():
    logger.info("Initializing database and seeding default demo users...")
    db = SessionLocal()
    try:
        seed_demo_users(db)
    except Exception as e:
        logger.warning(f"Could not auto-seed demo users on startup: {e}")
    finally:
        db.close()
    logger.info("Auth Service initialized successfully on port 8001.")

@app.get("/health")
def health_check():
    return {
        "status": "healthy",
        "service": settings.SERVICE_NAME,
        "environment": settings.ENVIRONMENT
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=settings.PORT, reload=True)
