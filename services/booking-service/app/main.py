import logging
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from prometheus_client import make_asgi_app
from app.config import settings
from app.routes import router as bms_router

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(name)s: %(message)s")
logger = logging.getLogger("booking-service")

app = FastAPI(
    title="BookMyShow High-Concurrency Flash Sale Ticket Engine",
    description="Distributed Locking, Anti-Double-Booking, and Kubernetes Pod Affinity/Anti-Affinity Placement",
    version="2.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

metrics_app = make_asgi_app()
app.mount("/metrics", metrics_app)

app.include_router(bms_router)

@app.get("/health")
def health_check():
    return {
        "status": "healthy",
        "service": settings.SERVICE_NAME,
        "node": settings.NODE_NAME,
        "pod": settings.POD_NAME,
        "environment": settings.ENVIRONMENT
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=settings.PORT, reload=True)
