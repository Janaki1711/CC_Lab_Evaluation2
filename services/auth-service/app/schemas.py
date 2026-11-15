from datetime import datetime
from typing import Optional
from pydantic import BaseModel, Field, field_validator

class UserRegister(BaseModel):
    username: str = Field(..., min_length=3, max_length=50)
    email: str = Field(..., min_length=5, max_length=255)
    password: str = Field(..., min_length=6)
    full_name: str = Field(..., min_length=2, max_length=100)
    role: str = Field(default="engineer", pattern="^(engineer|auditor|executive|admin|student|teacher)$")
    department: Optional[str] = "Cloud & Infrastructure Engineering"

class UserLogin(BaseModel):
    username: str
    password: str

class UserResponse(BaseModel):
    id: str
    username: str
    email: str
    full_name: str
    role: str
    department: Optional[str]
    created_at: datetime

    @field_validator('id', mode='before')
    @classmethod
    def coerce_id_to_str(cls, v):
        return str(v) if v is not None else None

    class Config:
        from_attributes = True

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse

class TokenData(BaseModel):
    sub: str
    username: str
    role: str
    full_name: str
