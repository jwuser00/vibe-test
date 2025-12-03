from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True)
    hashed_password = Column(String)

    activities = relationship("Activity", back_populates="owner")

class Activity(Base):
    __tablename__ = "activities"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    start_time = Column(DateTime)
    total_distance = Column(Float) # meters
    total_time = Column(Float) # seconds
    avg_pace = Column(Float) # seconds per km
    avg_hr = Column(Float)
    avg_cadence = Column(Float)

    owner = relationship("User", back_populates="activities")
    laps = relationship("Lap", back_populates="activity")

class Lap(Base):
    __tablename__ = "laps"

    id = Column(Integer, primary_key=True, index=True)
    activity_id = Column(Integer, ForeignKey("activities.id"))
    lap_number = Column(Integer)
    distance = Column(Float) # meters
    time = Column(Float) # seconds
    pace = Column(Float) # seconds per km
    avg_hr = Column(Float)
    max_hr = Column(Float)
    avg_cadence = Column(Float)

    activity = relationship("Activity", back_populates="laps")
