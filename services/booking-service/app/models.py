import uuid
from datetime import datetime
from sqlalchemy import Column, String, Integer, Numeric, DateTime, ForeignKey, Text, CHAR
from app.database import Base

class Show(Base):
    __tablename__ = "shows"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    movie_title = Column(String(255), nullable=False)
    poster_url = Column(String(500), nullable=True)
    banner_url = Column(String(500), nullable=True)
    cinema_hall = Column(String(255), nullable=False)
    screen_name = Column(String(100), nullable=False, default="IMAX 3D Laser - Audi 4")
    genre = Column(String(100), default="Action • Sci-Fi")
    rating = Column(String(10), default="9.1")
    duration = Column(String(50), default="2h 8m")
    language = Column(String(50), default="English • 3D")
    certification = Column(String(20), default="UA")
    show_time = Column(DateTime, nullable=False, default=datetime.utcnow)
    show_times_json = Column(Text, default='["10:30 AM", "02:15 PM", "06:45 PM", "09:30 PM", "11:45 PM"]')
    total_seats = Column(Integer, default=60)
    available_seats = Column(Integer, default=60)
    price_vip = Column(Numeric(10, 2), default=800.00)
    price_premium = Column(Numeric(10, 2), default=500.00)
    price_classic = Column(Numeric(10, 2), default=350.00)
    created_at = Column(DateTime, default=datetime.utcnow)

class Seat(Base):
    __tablename__ = "seats"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    show_id = Column(String(36), ForeignKey("shows.id"), nullable=False)
    seat_number = Column(String(10), nullable=False)
    row_char = Column(CHAR(1), nullable=False)
    col_num = Column(Integer, nullable=False)
    tier = Column(String(20), nullable=False)  # 'VIP', 'PREMIUM', 'CLASSIC'
    price = Column(Numeric(10, 2), nullable=False)
    status = Column(String(20), default="AVAILABLE")  # 'AVAILABLE', 'LOCKED', 'BOOKED'
    locked_by = Column(String(100), nullable=True)
    lock_expires_at = Column(DateTime, nullable=True)
    booked_by = Column(String(100), nullable=True)
    version = Column(Integer, default=0)  # Optimistic concurrency
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

class Booking(Base):
    __tablename__ = "bookings"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    booking_ref = Column(String(20), unique=True, nullable=False)
    show_id = Column(String(36), ForeignKey("shows.id"), nullable=False)
    user_id = Column(String(100), nullable=False)
    user_name = Column(String(100), nullable=False)
    seat_numbers = Column(Text, nullable=False)
    seats_count = Column(Integer, default=1)
    total_amount = Column(Numeric(10, 2), nullable=False)
    status = Column(String(20), default="CONFIRMED")
    payment_ref = Column(String(100), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

class FlashSaleAudit(Base):
    __tablename__ = "flash_sale_audit"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    show_id = Column(String(36), nullable=True)
    seat_number = Column(String(10), nullable=False)
    user_id = Column(String(100), nullable=False)
    action = Column(String(50), nullable=False)  # 'LOCK_ACQUIRED', 'COLLISION', 'BOOKED'
    outcome = Column(String(50), nullable=False)  # 'SUCCESS', 'COLLISION', 'EXPIRED'
    latency_ms = Column(Numeric(8, 2), default=0.0)
    worker_node = Column(String(100), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    timestamp = Column(DateTime, default=datetime.utcnow)
