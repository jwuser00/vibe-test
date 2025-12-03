from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

class LapBase(BaseModel):
    lap_number: int
    distance: float
    time: float
    pace: float
    avg_hr: Optional[float] = None
    max_hr: Optional[float] = None
    avg_cadence: Optional[float] = None

class Lap(LapBase):
    id: int
    activity_id: int

    class Config:
        from_attributes = True

class ActivityBase(BaseModel):
    start_time: datetime
    total_distance: float
    total_time: float
    avg_pace: float
    avg_hr: Optional[float] = None
    avg_cadence: Optional[float] = None

class ActivityCreate(ActivityBase):
    pass

class Activity(ActivityBase):
    id: int
    user_id: int
    laps: List[Lap] = []

    class Config:
        from_attributes = True

class UserBase(BaseModel):
    email: str

class UserCreate(UserBase):
    password: str

class User(UserBase):
    id: int
    activities: List[Activity] = []

    class Config:
        orm_mode = True

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    email: Optional[str] = None
