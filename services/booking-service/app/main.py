import json
import logging
from datetime import datetime, timedelta
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
try:
    from prometheus_client import make_asgi_app
    has_prometheus = True
except ImportError:
    has_prometheus = False
from app.config import settings
from app.database import engine, Base, SessionLocal
from app.models import Show, Seat
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

if has_prometheus:
    metrics_app = make_asgi_app()
    app.mount("/metrics", metrics_app)

app.include_router(bms_router)

def seed_database():
    """Auto-seeds database tables, 4 blockbuster movies, and 60 seats per show"""
    try:
        logger.info("Initializing database schemas via Base.metadata.create_all...")
        Base.metadata.create_all(bind=engine)
        db = SessionLocal()

        shows_to_seed = [
            {
                "id": "d5824153-5f59-4ede-bd6c-b0e321d2be56",
                "movie_title": "Deadpool & Wolverine (IMAX 3D)",
                "poster_url": "https://image.tmdb.org/t/p/w500/8cdWjvZQUExUUTzyp4t6EDMubfO.jpg",
                "banner_url": "https://image.tmdb.org/t/p/original/yDHYTjA3R0neXjRI5r9W6qV7h48.jpg",
                "cinema_hall": "PVR Director's Cut - Audi 4 (Dolby Atmos)",
                "screen_name": "IMAX 3D Laser",
                "genre": "Action • Comedy • Sci-Fi",
                "rating": "9.1",
                "duration": "2h 8m",
                "language": "English • 3D",
                "certification": "UA",
                "price_vip": 800.0,
                "price_premium": 500.0,
                "price_classic": 350.0,
            },
            {
                "id": "e6935264-6a6a-4fdf-ce7d-c1f432e3cf67",
                "movie_title": "Oppenheimer (IMAX 70mm Special)",
                "poster_url": "https://image.tmdb.org/t/p/w500/8Gxv8gSFCU0XGDykEGv7zR1n2ua.jpg",
                "banner_url": "https://image.tmdb.org/t/p/original/fm6KqXpk3M2HVveHwCrBSSBaO0V.jpg",
                "cinema_hall": "PVR Superplex - Audi 1 (IMAX 70mm)",
                "screen_name": "70mm Ultra Large Screen",
                "genre": "Biography • Drama • History",
                "rating": "9.3",
                "duration": "3h 0m",
                "language": "English • 70mm",
                "certification": "A",
                "price_vip": 950.0,
                "price_premium": 650.0,
                "price_classic": 400.0,
            },
            {
                "id": "f7046375-7b7b-5geg-df8e-d2g543f4dg78",
                "movie_title": "Interstellar: 10th Anniversary (IMAX)",
                "poster_url": "https://image.tmdb.org/t/p/w500/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg",
                "banner_url": "https://image.tmdb.org/t/p/original/xJHokMbljvjADYdit5fK5VQsXEG.jpg",
                "cinema_hall": "PVR Director's Cut - Audi 2 (Dolby Atmos)",
                "screen_name": "IMAX Laser 4K",
                "genre": "Sci-Fi • Adventure • Drama",
                "rating": "9.5",
                "duration": "2h 49m",
                "language": "English • 2D",
                "certification": "UA",
                "price_vip": 850.0,
                "price_premium": 550.0,
                "price_classic": 350.0,
            },
            {
                "id": "a1234567-8c8c-6hfh-eg9f-e3h654g5eh89",
                "movie_title": "Avatar: The Way of Water (IMAX 3D HFR)",
                "poster_url": "https://image.tmdb.org/t/p/w500/t6HIqrRAclMCA60NsSmeqe9RmNV.jpg",
                "banner_url": "https://image.tmdb.org/t/p/original/s16H6tpK2utvwDtzZ8Qy4qm5Emw.jpg",
                "cinema_hall": "PVR P[XL] - Audi 3 (Dolby 7.1)",
                "screen_name": "48 FPS HFR 3D",
                "genre": "Sci-Fi • Action • Fantasy",
                "rating": "8.8",
                "duration": "3h 12m",
                "language": "English • 3D",
                "certification": "UA",
                "price_vip": 750.0,
                "price_premium": 450.0,
                "price_classic": 300.0,
            }
        ]

        for s_data in shows_to_seed:
            existing = db.query(Show).filter(Show.id == s_data["id"]).first()
            if not existing:
                show = Show(
                    id=s_data["id"],
                    movie_title=s_data["movie_title"],
                    poster_url=s_data["poster_url"],
                    banner_url=s_data["banner_url"],
                    cinema_hall=s_data["cinema_hall"],
                    screen_name=s_data["screen_name"],
                    genre=s_data["genre"],
                    rating=s_data["rating"],
                    duration=s_data["duration"],
                    language=s_data["language"],
                    certification=s_data["certification"],
                    show_time=datetime.utcnow() + timedelta(hours=2),
                    show_times_json='["10:30 AM", "02:15 PM", "06:45 PM", "09:30 PM", "11:45 PM"]',
                    total_seats=60,
                    available_seats=60,
                    price_vip=s_data["price_vip"],
                    price_premium=s_data["price_premium"],
                    price_classic=s_data["price_classic"],
                )
                db.add(show)
                db.commit()
                logger.info(f"Seeded movie show: {s_data['movie_title']}")

            # Seed 60 seats for this show if not present
            seat_count = db.query(Seat).filter(Seat.show_id == s_data["id"]).count()
            if seat_count < 60:
                rows_cfg = [
                    ('A', 'VIP', s_data["price_vip"]),
                    ('B', 'PREMIUM', s_data["price_premium"]),
                    ('C', 'PREMIUM', s_data["price_premium"]),
                    ('D', 'CLASSIC', s_data["price_classic"]),
                    ('E', 'CLASSIC', s_data["price_classic"]),
                    ('F', 'CLASSIC', s_data["price_classic"]),
                ]
                for r_char, tier, price in rows_cfg:
                    for col in range(1, 11):
                        s_num = f"{r_char}{col}"
                        existing_seat = db.query(Seat).filter(Seat.show_id == s_data["id"], Seat.seat_number == s_num).first()
                        if not existing_seat:
                            db.add(Seat(
                                show_id=s_data["id"],
                                seat_number=s_num,
                                row_char=r_char,
                                col_num=col,
                                tier=tier,
                                price=price,
                                status="AVAILABLE"
                            ))
                db.commit()
                logger.info(f"Seeded 60 seats for show {s_data['movie_title']}")

        db.close()
    except Exception as e:
        logger.error(f"Error during database startup seeding: {e}")

@app.on_event("startup")
def on_startup():
    logger.info("Booking Service starting up...")
    seed_database()

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
