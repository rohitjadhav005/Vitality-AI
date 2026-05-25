"""Train ML model at deploy time if models/rf_model.pkl is missing."""
import os
import sys

import joblib
import pandas as pd
from sklearn.ensemble import RandomForestRegressor

ROOT = os.path.dirname(os.path.dirname(__file__))
MODEL_DIR = os.path.join(ROOT, "models")
MODEL_PATH = os.path.join(MODEL_DIR, "rf_model.pkl")
DATA_PATH = os.path.join(ROOT, "data", "processed", "processed_merged_dataset.csv")

FEATURES = [
    "Sleep_Hours",
    "Stress_Level",
    "Exercise_Duration_min",
    "Water_Intake_L",
    "Screen_Time_hr",
    "Mood_Score",
]


def main():
    if os.path.isfile(MODEL_PATH):
        print(f"Model already exists at {MODEL_PATH}")
        return 0

    if not os.path.isfile(DATA_PATH):
        print(f"ERROR: Dataset not found at {DATA_PATH}", file=sys.stderr)
        return 1

    os.makedirs(MODEL_DIR, exist_ok=True)
    df = pd.read_csv(DATA_PATH)
    X = df[FEATURES]
    y = df[["Energy_Score", "Productivity_Score"]]

    model = RandomForestRegressor(n_estimators=100, random_state=42)
    model.fit(X, y)
    joblib.dump(model, MODEL_PATH)
    print(f"Saved model to {MODEL_PATH}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
