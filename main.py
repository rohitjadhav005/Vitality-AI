import os
import joblib
import pandas as pd
from fastapi import FastAPI, Depends, HTTPException, WebSocket, WebSocketDisconnect, BackgroundTasks
from typing import List, Optional
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from pydantic import BaseModel
from jose import jwt, JWTError
from dotenv import load_dotenv

load_dotenv()

import database
import models_db
from auth import verify_password, get_password_hash, create_access_token, ALGORITHM, SECRET_KEY

# Create database tables and seed initial data
try:
    models_db.Base.metadata.create_all(bind=database.engine)
    # Auto-seed database if empty
    from seed import seed_data
    seed_data()
except Exception as e:
    print(f"Warning: Could not create DB tables or seed database. {e}")

app = FastAPI(title="Human Energy & Productivity API")

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="login")

def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(database.get_db)):
    credentials_exception = HTTPException(status_code=401, detail="Could not validate credentials")
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("username")
        if username is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception
    user = db.query(models_db.User).filter(models_db.User.username == username).first()
    if user is None:
        raise credentials_exception
    return user

class UserCreate(BaseModel):
    username: str
    password: str

@app.post("/register")
def register(user: UserCreate, db: Session = Depends(database.get_db)):
    db_user = db.query(models_db.User).filter(models_db.User.username == user.username).first()
    if db_user:
        raise HTTPException(status_code=400, detail="Username already registered")
    hashed_password = get_password_hash(user.password)
    new_user = models_db.User(username=user.username, hashed_password=hashed_password)
    db.add(new_user)
    db.commit()
    return {"message": "User created successfully"}

@app.post("/login")
def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(database.get_db)):
    user = db.query(models_db.User).filter(models_db.User.username == form_data.username).first()
    if not user or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(status_code=400, detail="Incorrect username or password")
    access_token = create_access_token(data={"username": user.username})
    return {"access_token": access_token, "token_type": "bearer"}

class ConnectionManager:
    def __init__(self):
        self.active_connections: List[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)

    def disconnect(self, websocket: WebSocket):
        if websocket in self.active_connections:
            self.active_connections.remove(websocket)

    async def broadcast(self, message: str):
        for connection in self.active_connections:
            try:
                await connection.send_text(message)
            except Exception:
                pass

ws_manager = ConnectionManager()

@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await ws_manager.connect(websocket)
    try:
        while True:
            data = await websocket.receive_text()
    except WebSocketDisconnect:
        ws_manager.disconnect(websocket)


# Allow CORS for React frontend (allow_credentials=False since we use token in Authorization header)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load the Random Forest model
MODEL_PATH = os.path.join(os.path.dirname(__file__), 'models', 'rf_model.pkl')
try:
    rf_model = joblib.load(MODEL_PATH)
except Exception as e:
    rf_model = None
    print(f"Warning: Could not load model at {MODEL_PATH}. {e}")

# Pydantic schema for request validation
class PredictionRequest(BaseModel):
    Sleep_Hours: float
    Stress_Level: float
    Exercise_Duration_min: float
    Water_Intake_L: float
    Screen_Time_hr: float
    Mood_Score: float

class PredictionResponse(BaseModel):
    Energy_Score: int
    Productivity_Score: int

@app.get("/api/health")
def health_check():
    return {"status": "ok", "model_loaded": rf_model is not None}

@app.post("/predict", response_model=PredictionResponse)
def predict(request: PredictionRequest, background_tasks: BackgroundTasks, db: Session = Depends(database.get_db), current_user: models_db.User = Depends(get_current_user)):
    if rf_model is None:
        raise HTTPException(status_code=500, detail="Model is not loaded")

    # Format input for the model
    input_data = pd.DataFrame([{
        'Sleep_Hours': request.Sleep_Hours,
        'Stress_Level': request.Stress_Level,
        'Exercise_Duration_min': request.Exercise_Duration_min,
        'Water_Intake_L': request.Water_Intake_L,
        'Screen_Time_hr': request.Screen_Time_hr,
        'Mood_Score': request.Mood_Score
    }])

    # Make prediction
    prediction = rf_model.predict(input_data)
    energy_score = int(round(prediction[0][0]))
    productivity_score = int(round(prediction[0][1]))

    # Save to database
    try:
        db_record = models_db.PredictionRecord(
            user_id=current_user.id,
            sleep_hours=request.Sleep_Hours,
            stress_level=request.Stress_Level,
            exercise_duration_min=request.Exercise_Duration_min,
            water_intake_l=request.Water_Intake_L,
            screen_time_hr=request.Screen_Time_hr,
            mood_score=request.Mood_Score,
            energy_score=energy_score,
            productivity_score=productivity_score
        )
        db.add(db_record)
        db.commit()
    except Exception as e:
        print(f"Failed to save prediction to DB: {e}")

    # Notify WebSocket clients that a new prediction was made
    background_tasks.add_task(ws_manager.broadcast, "new_prediction")

    return {
        "Energy_Score": energy_score,
        "Productivity_Score": productivity_score
    }

@app.get("/api/dashboard/summary")
def get_dashboard_summary(db: Session = Depends(database.get_db), current_user: models_db.User = Depends(get_current_user)):
    # Get the most recent prediction
    latest = db.query(models_db.PredictionRecord).filter(models_db.PredictionRecord.user_id == current_user.id).order_by(models_db.PredictionRecord.timestamp.desc()).first()
    
    if not latest:
        # Return default zeroed if empty
        return {
            "Energy_Score": 0, "Productivity_Score": 0,
            "Sleep_Quality": 0, "Stress_Level": 0, "Overall_Health": "No Data"
        }
        
    overall_health = "Excellent"
    avg_score = (latest.energy_score + latest.productivity_score) / 2
    if avg_score < 50: overall_health = "Needs Attention"
    elif avg_score < 75: overall_health = "Good"

    return {
        "Energy_Score": latest.energy_score,
        "Productivity_Score": latest.productivity_score,
        "Sleep_Quality": latest.sleep_hours,
        "Stress_Level": latest.stress_level,
        "Overall_Health": overall_health
    }

@app.get("/api/dashboard/trends")
def get_dashboard_trends(db: Session = Depends(database.get_db), current_user: models_db.User = Depends(get_current_user)):
    # Get last 7 records for simplicity (assuming 1 per day for demo)
    records = db.query(models_db.PredictionRecord).filter(models_db.PredictionRecord.user_id == current_user.id).order_by(models_db.PredictionRecord.timestamp.desc()).limit(7).all()
    
    if not records:
        return []
        
    # Reverse to chronological order
    records.reverse()
    
    # Format for recharts
    trends = []
    days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
    for record in records:
        trends.append({
            "name": days[record.timestamp.weekday()],
            "energy": record.energy_score,
            "productivity": record.productivity_score
        })
    return trends

@app.get("/api/dashboard/insights")
def get_dashboard_insights(db: Session = Depends(database.get_db), current_user: models_db.User = Depends(get_current_user)):
    latest = db.query(models_db.PredictionRecord).filter(models_db.PredictionRecord.user_id == current_user.id).order_by(models_db.PredictionRecord.timestamp.desc()).first()
    insights = []
    
    if not latest:
        return [{"type": "warning", "message": "No data available to generate insights."}]
        
    if latest.sleep_hours >= 7:
        insights.append({"type": "positive", "message": f"Your sleep schedule is optimal. Maintaining {latest.sleep_hours} hours boosts your productivity."})
    else:
        insights.append({"type": "warning", "message": "You had less than 7 hours of sleep. Consider resting early tonight to improve tomorrow's energy."})
        
    if latest.screen_time_hr > 6:
        insights.append({"type": "warning", "message": f"Screen time reached {latest.screen_time_hr} hours today. Take 15-minute breaks to reduce eye strain."})
        
    if latest.stress_level < 4:
        insights.append({"type": "positive", "message": "Stress levels are remarkably low! Your current routine is showing clear mental health benefits."})
    elif latest.stress_level >= 7:
        insights.append({"type": "warning", "message": "Stress levels are high. Consider doing a 10-minute meditation or light exercise."})
        
    if not insights:
        insights.append({"type": "positive", "message": "You're maintaining a perfectly balanced lifestyle. Keep it up!"})
        
    return insights

@app.get("/api/history")
def get_history(db: Session = Depends(database.get_db), current_user: models_db.User = Depends(get_current_user)):
    records = db.query(models_db.PredictionRecord).filter(models_db.PredictionRecord.user_id == current_user.id).order_by(models_db.PredictionRecord.timestamp.desc()).limit(20).all()
    history = []
    for r in records:
        history.append({
            "id": r.id,
            "date": r.timestamp.strftime("%Y-%m-%d %H:%M"),
            "sleep_hours": r.sleep_hours,
            "stress_level": r.stress_level,
            "energy_score": r.energy_score,
            "productivity_score": r.productivity_score
        })
    return history

@app.get("/api/analytics")
def get_analytics(db: Session = Depends(database.get_db), current_user: models_db.User = Depends(get_current_user)):
    records = db.query(models_db.PredictionRecord).filter(models_db.PredictionRecord.user_id == current_user.id).order_by(models_db.PredictionRecord.timestamp.asc()).limit(30).all()
    
    scatter_data = []
    bar_data = []
    
    for r in records:
        scatter_data.append({
            "sleep": r.sleep_hours,
            "energy": r.energy_score,
            "stress": r.stress_level
        })
        bar_data.append({
            "name": r.timestamp.strftime("%m/%d"),
            "productivity": r.productivity_score,
            "mood": r.mood_score * 10 # scale to 100 for comparison
        })
        
    return {
        "scatter": scatter_data,
        "bar": bar_data
    }

@app.get("/api/insights/all")
def get_all_insights(db: Session = Depends(database.get_db), current_user: models_db.User = Depends(get_current_user)):
    records = db.query(models_db.PredictionRecord).filter(models_db.PredictionRecord.user_id == current_user.id).order_by(models_db.PredictionRecord.timestamp.desc()).limit(7).all()
    if not records:
        return {"health": [], "productivity": [], "sleep": []}
    
    avg_sleep = sum(r.sleep_hours for r in records) / len(records)
    avg_prod = sum(r.productivity_score for r in records) / len(records)
    avg_stress = sum(r.stress_level for r in records) / len(records)
    
    health_insights = [
        {"title": "Stress Management", "desc": f"Your 7-day stress average is {avg_stress:.1f}/10.", "type": "positive" if avg_stress < 5 else "warning"}
    ]
    prod_insights = [
        {"title": "Productivity Flow", "desc": f"You are operating at an average {avg_prod:.1f}% productivity this week.", "type": "positive" if avg_prod > 70 else "warning"}
    ]
    sleep_insights = [
        {"title": "Sleep Consistency", "desc": f"You're averaging {avg_sleep:.1f} hours of sleep.", "type": "positive" if avg_sleep >= 7 else "warning"}
    ]
    
    return {
        "health": health_insights,
        "productivity": prod_insights,
        "sleep": sleep_insights
    }

@app.get("/api/profile")
def get_profile(db: Session = Depends(database.get_db), current_user: models_db.User = Depends(get_current_user)):
    records = db.query(models_db.PredictionRecord).filter(models_db.PredictionRecord.user_id == current_user.id).order_by(models_db.PredictionRecord.timestamp.asc()).all()
    
    predictions_count = len(records)
    avg_energy = sum(r.energy_score for r in records) / predictions_count if predictions_count > 0 else 0
    
    unique_days = len(set(r.timestamp.date() for r in records))
    streak = unique_days
    goals = min(predictions_count, 8)
    
    return {
        "user": {
            "name": current_user.username.capitalize(),
            "role": "Member",
            "email": f"{current_user.username.lower()}@vitalityai.com",
            "phone": "Not provided",
            "location": "Earth",
            "joined": "2026",
            "bio": "Health & productivity enthusiast leveraging AI to optimize daily human performance.",
            "avatar": f"https://ui-avatars.com/api/?name={current_user.username}&background=EF4444&color=fff&size=200&bold=true",
            "stats": {
                "predictions": predictions_count,
                "goals": goals,
                "streak": streak,
                "avgEnergy": int(avg_energy)
            },
            "badges": [
                { "icon": '🔥', "label": 'Active User', "color": '#EF4444' },
                { "icon": '⚡', "label": 'High Performer', "color": '#FFFFFF' }
            ],
            "recentActivity": [
                { "action": "Account created", "time": "Recently", "icon": "Star", "color": "#EF4444" }
            ]
        }
    }


# ──────────────────────────────────────────────
# AI CHATBOT ENDPOINT (Google Gemini)
# ──────────────────────────────────────────────

class ChatMessage(BaseModel):
    role: str   # "user" or "model"
    text: str

class ChatRequest(BaseModel):
    messages: List[ChatMessage]

@app.post("/api/chat")
def chat_with_ai(
    request: ChatRequest,
    db: Session = Depends(database.get_db),
    current_user: models_db.User = Depends(get_current_user)
):
    gemini_key = os.environ.get("GEMINI_API_KEY", "")
    if not gemini_key:
        return {"reply": "⚠️ AI chatbot is not configured yet. Please set GEMINI_API_KEY in your environment."}

    # Fetch user's latest health data for context
    latest = db.query(models_db.PredictionRecord) \
        .filter(models_db.PredictionRecord.user_id == current_user.id) \
        .order_by(models_db.PredictionRecord.timestamp.desc()) \
        .first()

    health_context = ""
    if latest:
        health_context = f"""
User's latest health data:
- Energy Score: {latest.energy_score}/100
- Productivity Score: {latest.productivity_score}/100
- Sleep Hours: {latest.sleep_hours} hrs
- Stress Level: {latest.stress_level}/10
- Exercise Duration: {latest.exercise_duration_min} minutes
- Water Intake: {latest.water_intake_l} litres
- Screen Time: {latest.screen_time_hr} hours
- Mood Score: {latest.mood_score}/10
"""
    else:
        health_context = "The user has no prediction data yet. Encourage them to make their first prediction."

    system_prompt = f"""You are Vitality AI — a warm, expert, and encouraging personal health coach embedded in a health & productivity tracking app.

Your role:
- Answer health, energy, sleep, stress, productivity and wellness questions.
- Give personalized, actionable advice based on the user's health data below.
- Be concise and conversational. Use bullet points for tips. Keep responses under 200 words.
- Use occasional health emojis to make responses feel friendly (💤 🧠 ⚡ 💧 🏃 😊).
- Never give medical diagnoses. Always encourage professional consultation for medical concerns.
- Address the user by name: {current_user.username.capitalize()}.

{health_context}

If the question is unrelated to health/wellness/productivity, politely redirect: \"I'm best at answering health and wellness questions! Ask me about your energy, sleep, stress, or productivity.\"
"""

    try:
        import google.generativeai as genai
        genai.configure(api_key=gemini_key)
        model = genai.GenerativeModel(
            model_name="gemini-2.0-flash",
            system_instruction=system_prompt
        )

        # Build conversation history for Gemini
        history = []
        messages = request.messages
        # All messages except the last (which is the new user input)
        for msg in messages[:-1]:
            history.append({
                "role": msg.role,
                "parts": [msg.text]
            })

        chat = model.start_chat(history=history)
        last_msg = messages[-1].text if messages else ""
        response = chat.send_message(last_msg)
        return {"reply": response.text}

    except Exception as e:
        error_msg = str(e)
        print(f"Gemini chat error: {error_msg}")
        # Return actual error in development so we can debug
        return {"reply": f"⚠️ AI Error: {error_msg[:200]}"}


# Mount static files for the frontend
frontend_path = os.path.join(os.path.dirname(__file__), "dist")

if os.path.exists(frontend_path):
    # Mount assets directory directly
    assets_path = os.path.join(frontend_path, "assets")
    if os.path.exists(assets_path):
        app.mount("/assets", StaticFiles(directory=assets_path), name="assets")

    # Catch-all route to serve the React app (index.html) or specific static files
    @app.get("/{full_path:path}")
    def serve_frontend(full_path: str):
        # Don't intercept API calls
        if full_path.startswith("api/") or full_path == "predict":
            raise HTTPException(status_code=404, detail="Not Found")
            
        file_path = os.path.join(frontend_path, full_path)
        if os.path.isfile(file_path):
            return FileResponse(file_path)
            
        index_file = os.path.join(frontend_path, "index.html")
        if os.path.exists(index_file):
            return FileResponse(index_file)
            
        raise HTTPException(status_code=404, detail="Frontend build not found")

