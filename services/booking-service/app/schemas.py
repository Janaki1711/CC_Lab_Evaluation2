import json
from datetime import datetime
from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field, field_validator

class SeatLockRequest(BaseModel):
    show_id: str
    seat_numbers: List[str]
    user_id: str
    user_name: Optional[str] = "MovieGoer"

class SeatReleaseRequest(BaseModel):
    show_id: str
    seat_numbers: List[str]
    user_id: str

class BookingConfirmRequest(BaseModel):
    show_id: str
    seat_numbers: List[str]
    user_id: str
    user_name: str
    user_email: Optional[str] = "user@bookmyshow.com"

class FlashSaleRushRequest(BaseModel):
    concurrency: int = Field(default=500, ge=10, le=2000)
    target_tier: Optional[str] = "ALL"  # 'VIP', 'PREMIUM', 'CLASSIC', 'ALL'
    show_id: Optional[str] = None

class SeatResponse(BaseModel):
    id: str
    show_id: str
    seat_number: str
    row_char: str
    col_num: int
    tier: str
    price: float
    status: str
    locked_by: Optional[str] = None
    ttl_remaining: int = 0
    booked_by: Optional[str] = None

    @field_validator('id', 'show_id', mode='before')
    @classmethod
    def coerce_uuid(cls, v):
        return str(v) if v is not None else None

    class Config:
        from_attributes = True

class ShowResponse(BaseModel):
    id: str
    movie_title: str
    poster_url: Optional[str] = None
    banner_url: Optional[str] = None
    cinema_hall: str
    screen_name: str
    genre: Optional[str] = "Action • Sci-Fi"
    rating: Optional[str] = "9.1"
    duration: Optional[str] = "2h 8m"
    language: Optional[str] = "English • 3D"
    certification: Optional[str] = "UA"
    show_time: datetime
    show_times_json: Optional[str] = None
    total_seats: int
    available_seats: int
    price_vip: float
    price_premium: float
    price_classic: float

    @field_validator('id', mode='before')
    @classmethod
    def coerce_uuid(cls, v):
        return str(v) if v is not None else None

    class Config:
        from_attributes = True

class BookingResponse(BaseModel):
    id: str
    booking_ref: str
    show_id: str
    user_id: str
    user_name: str
    seat_numbers: str
    seats_count: int
    total_amount: float
    status: str
    payment_ref: Optional[str] = None
    created_at: datetime
    movie_title: Optional[str] = None
    cinema_hall: Optional[str] = None

    @field_validator('id', 'show_id', mode='before')
    @classmethod
    def coerce_uuid(cls, v):
        return str(v) if v is not None else None

    class Config:
        from_attributes = True
