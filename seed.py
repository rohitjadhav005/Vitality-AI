import os
from datetime import datetime, timedelta
import random

import database
import models_db
from auth import get_password_hash

def seed_data():
    print("Seeding database with 7 days of historical data...")
    
    # Ensure tables exist
    models_db.Base.metadata.create_all(bind=database.engine)
    
    db = database.SessionLocal()
    
    try:
        # Ensure demo user exists
        demo_user = db.query(models_db.User).filter(models_db.User.username == "demo").first()
        if not demo_user:
            print("Creating default demo user...")
            hashed_password = get_password_hash("password123")
            demo_user = models_db.User(username="demo", hashed_password=hashed_password)
            db.add(demo_user)
            db.commit()
            db.refresh(demo_user)
            print("Demo user created successfully: username 'demo', password 'password123'")
            
        # Check if we already have data for the demo user
        count = db.query(models_db.PredictionRecord).filter(models_db.PredictionRecord.user_id == demo_user.id).count()
        if count >= 7:
            print(f"Database already has {count} records for demo user. No need to seed.")
            return

        # Delete existing records for demo user to start fresh for a clean demo
        db.query(models_db.PredictionRecord).filter(models_db.PredictionRecord.user_id == demo_user.id).delete()
        db.commit()
        
        today = datetime.utcnow()
        
        # Generate 7 days of data (going backwards)
        records = []
        for i in range(6, -1, -1):
            record_date = today - timedelta(days=i)
            
            # Add some random variations to make the chart look nice
            base_energy = 70 + random.randint(-15, 20)
            base_prod = base_energy + random.randint(-10, 15)
            
            record = models_db.PredictionRecord(
                user_id=demo_user.id,
                timestamp=record_date,
                sleep_hours=round(random.uniform(5.5, 9.0), 1),
                stress_level=random.randint(1, 8),
                exercise_duration_min=random.randint(0, 90),
                water_intake_l=round(random.uniform(1.0, 4.0), 1),
                screen_time_hr=round(random.uniform(2.0, 10.0), 1),
                mood_score=random.randint(4, 9),
                energy_score=min(100, max(0, base_energy)),
                productivity_score=min(100, max(0, base_prod))
            )
            records.append(record)
            
        db.add_all(records)
        db.commit()
        print(f"Successfully seeded 7 records for demo user (ID: {demo_user.id}) into the database.")
    except Exception as e:
        print(f"Error during seeding: {e}")
        db.rollback()
    finally:
        db.close()
    
    print("Successfully seeded 7 records into the database.")

if __name__ == "__main__":
    seed_data()
