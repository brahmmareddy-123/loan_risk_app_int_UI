from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
import joblib
import numpy as np
import os

# ── App Setup ─────────────────────────────────────────────────────
app = FastAPI(
    title="Loan Risk Prediction API",
    description="AI-powered loan risk assessment using RandomForest",
    version="1.0.0"
)

# ✅ Fixed CORS — allow all origins
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Load Model & Encoders ─────────────────────────────────────────
MODEL_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "ml_model")

try:
    model     = joblib.load(os.path.join(MODEL_DIR, "model.pkl"))
    le_gender = joblib.load(os.path.join(MODEL_DIR, "le_gender.pkl"))
    le_edu    = joblib.load(os.path.join(MODEL_DIR, "le_edu.pkl"))
    le_emp    = joblib.load(os.path.join(MODEL_DIR, "le_emp.pkl"))
    print("✅ Model and encoders loaded successfully")
except FileNotFoundError:
    raise RuntimeError("❌ Model files not found. Run ml_model/train_model.py first.")


# ── Request Schema ────────────────────────────────────────────────
class LoanInput(BaseModel):
    age:              int   = Field(..., ge=18, le=69,      example=30)
    income:           float = Field(..., ge=0,              example=55000)
    loan_amount:      float = Field(..., ge=0,              example=20000)
    credit_score:     float = Field(..., ge=300, le=849,    example=680)
    years_experience: int   = Field(..., ge=0,  le=39,      example=5)
    gender:           str   = Field(..., example="Male")
    education:        str   = Field(..., example="Bachelors")
    employment_type:  str   = Field(..., example="Salaried")


# ── Helpers ───────────────────────────────────────────────────────
def get_risk_level(prob: float) -> str:
    if prob >= 0.60: return "Low Risk"
    if prob >= 0.35: return "Medium Risk"
    return "High Risk"

def get_risk_factors(data: LoanInput, prob: float) -> list:
    factors = []
    if data.credit_score < 500:
        factors.append("Very low credit score (below 500)")
    elif data.credit_score < 600:
        factors.append("Low credit score (below 600)")
    if data.employment_type == "Unemployed":
        factors.append("Currently unemployed")
    if data.loan_amount > data.income * 0.6:
        factors.append("Loan amount is high relative to income")
    if data.years_experience < 2:
        factors.append("Less than 2 years of work experience")
    if data.income < 20000:
        factors.append("Low annual income")
    return factors if factors else ["No major risk factors detected"]


# ── Routes ────────────────────────────────────────────────────────
@app.get("/")
def root():
    return {"message": "Loan Risk Prediction API is running ✅"}

@app.get("/health")
def health():
    return {"status": "healthy"}

@app.post("/predict")
def predict(data: LoanInput):
    try:
        gender_enc = le_gender.transform([data.gender])[0]
        edu_enc    = le_edu.transform([data.education])[0]
        emp_enc    = le_emp.transform([data.employment_type])[0]
    except ValueError as e:
        raise HTTPException(status_code=422, detail=f"Invalid input value: {str(e)}")

    features = np.array([[
        data.age, data.income, data.loan_amount, data.credit_score,
        data.years_experience, gender_enc, edu_enc, emp_enc
    ]])

    prediction  = model.predict(features)[0]
    probability = model.predict_proba(features)[0]
    approval_prob  = round(float(probability[1]) * 100, 1)
    rejection_prob = round(float(probability[0]) * 100, 1)

    return {
        "approved":              int(prediction),
        "risk_label":            get_risk_level(float(probability[1])),
        "approval_probability":  approval_prob,
        "rejection_probability": rejection_prob,
        "risk_factors":          get_risk_factors(data, float(probability[1])),
        "input_summary": {
            "age":              data.age,
            "income":           data.income,
            "loan_amount":      data.loan_amount,
            "credit_score":     data.credit_score,
            "years_experience": data.years_experience,
            "employment_type":  data.employment_type,
            "education":        data.education,
            "gender":           data.gender,
        }
    }
