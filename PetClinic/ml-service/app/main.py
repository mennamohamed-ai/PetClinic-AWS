from datetime import datetime
from pathlib import Path
from typing import Any

import joblib
import pandas as pd
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel


BASE_DIR = Path(__file__).resolve().parent.parent
MODEL_PATH = BASE_DIR / "model.pkl"
COLUMNS_PATH = BASE_DIR / "columns.pkl"

if not MODEL_PATH.exists() or not COLUMNS_PATH.exists():
    raise RuntimeError(
        "model.pkl or columns.pkl not found in ml-service root. "
        "Place both files beside requirements.txt and Dockerfile."
    )

model = joblib.load(MODEL_PATH)
trained_columns = list(joblib.load(COLUMNS_PATH))

app = FastAPI(title="Pet Clinic ML Service", version="1.0.0")


@app.get("/health")
def health_check() -> dict[str, str]:
    """Health check endpoint for ALB and Eureka"""
    return {"status": "healthy", "service": "ml-service"}


class PredictRequest(BaseModel):
    payload: dict[str, Any]


def _parse_date(value: Any, field_name: str) -> datetime:
    if value is None:
        raise HTTPException(status_code=400, detail=f"Missing required date field: {field_name}")
    try:
        return datetime.strptime(str(value), "%Y-%m-%d")
    except ValueError as exc:
        raise HTTPException(
            status_code=400, detail=f"Invalid date format for {field_name}. Expected YYYY-MM-DD."
        ) from exc


def _build_features(raw: dict[str, Any]) -> pd.DataFrame:
    # Start with all model columns as 0 to avoid missing-column failures.
    features: dict[str, Any] = {col: 0 for col in trained_columns}

    scheduled = _parse_date(raw.get("scheduled_day"), "scheduled_day")
    appointment_raw = raw.get("Appointment_day", raw.get("appointment_day"))
    appointment = _parse_date(appointment_raw, "Appointment_day")

    waiting_time = (appointment - scheduled).days
    if waiting_time < 0:
        raise HTTPException(status_code=400, detail="Appointment_day must be after scheduled_day.")

    if "waiting_time" in features:
        features["waiting_time"] = waiting_time
    if "appointment_month" in features:
        features["appointment_month"] = appointment.month

    weekday_col = f"appointment_weekday_{appointment.strftime('%A')}"
    if weekday_col in features:
        features[weekday_col] = 1

    # Numeric/direct mapped fields (if sent and present in model columns).
    for key, value in raw.items():
        if key in ("scheduled_day", "Appointment_day", "appointment_day"):
            continue
        if key in features and not isinstance(value, str):
            features[key] = value

    # Categorical encoding against trained columns (e.g. pet_type_Dog).
    for key, value in raw.items():
        if isinstance(value, str):
            encoded_col = f"{key}_{value}"
            if encoded_col in features:
                features[encoded_col] = 1

    # Ensure strict column order matches training.
    row = [features[col] for col in trained_columns]
    return pd.DataFrame([row], columns=trained_columns)


@app.post("/predict")
def predict(request: PredictRequest) -> dict[str, Any]:
    try:
        frame = _build_features(request.payload)
        prediction = int(model.predict(frame)[0])

        probability = None
        if hasattr(model, "predict_proba"):
            probability = float(model.predict_proba(frame)[0][1])

        label = "No-Show" if prediction == 1 else "Will Attend"
        return {"prediction": prediction, "label": label, "probability_no_show": probability}
    except HTTPException:
        raise
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Inference error: {str(exc)}") from exc
