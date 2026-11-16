import uuid
from datetime import datetime
from sqlalchemy import Column, String, Integer, Numeric, DateTime, ForeignKey, Text, CHAR
from app.database import Base

class Show(Base):
    __tablename__ = "shows"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    movie_title = Column(String(255), nullable=False)
    poster_url = Column(String(500), nullable=True)
    cinema_hall = Column(String(255), nullable=False)
    screen_name = Column(String(50), nullable=False, default="IMAX 3D Laser - Screen 1")
    show_time = Column(DateTime, nullable=False)
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
    tier = Column(String(20), nullable=False) # 'VIP', 'PREMIUM', 'CLASSIC'
    price = Column(Numeric(10, 2), nullable=False)
    status = Column(String(20), default="AVAILABLE") # 'AVAILABLE', 'LOCKED', 'BOOKED'
    locked_by = Column(String(100), nullable=True)
    lock_expires_at = Column(DateTime, nullable=True)
    booked_by = Column(String(100), nullable=True)
    version = Column(Integer, default=0) # Optimistic concurrency
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
    action = Column(String(50), nullable=False)
    outcome = Column(String(30), nullable=False)
    latency_ms = Column(Numeric(8, 2), default=0.0)
    worker_node = Column(String(100), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
