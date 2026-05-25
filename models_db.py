from sqlalchemy import Column, Integer, Float, DateTime, String, ForeignKey
from sqlalchemy.orm import relationship
import datetime
from database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    predictions = relationship("PredictionRecord", back_populates="owner")

class PredictionRecord(Base):
    __tablename__ = "predictions"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    timestamp = Column(DateTime, default=datetime.datetime.utcnow)
    
    # Input features
    sleep_hours = Column(Float)
    stress_level = Column(Float)
    exercise_duration_min = Column(Float)
    water_intake_l = Column(Float)
    screen_time_hr = Column(Float)
    mood_score = Column(Float)
    
    # Output predictions
    energy_score = Column(Float)
    productivity_score = Column(Float)

    owner = relationship("User", back_populates="predictions")
