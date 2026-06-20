from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
import joblib
import numpy as np
import os

app = FastAPI(
    title="Loan Risk Prediction API",
    description="AI-powered loan risk assessment using RandomForest",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

MODEL_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "ml_model")

try:
    model     = joblib.load(os.path.join(MODEL_DIR, "model.pkl"))
    le_gender = joblib.load(os.path.join(MODEL_DIR, "le_gender.pkl"))
    le_edu    = joblib.load(os.path.join(MODEL_DIR, "le_edu.pkl"))
    le_emp    = joblib.load(os.path.join(MODEL_DIR, "le_emp.pkl"))
    print("✅ Model and encoders loaded successfully")
except FileNotFoundError:
    raise RuntimeError("❌ Model files not found. Run ml_model/train_model.py first.")


class LoanInput(BaseModel):
    age:              int   = Field(..., ge=18, le=69,   example=30)
    income:           float = Field(..., ge=0,           example=55000)
    loan_amount:      float = Field(..., ge=0,           example=20000)
    credit_score:     float = Field(..., ge=300, le=849, example=680)
    years_experience: int   = Field(..., ge=0,  le=39,   example=5)
    gender:           str   = Field(..., example="Male")
    education:        str   = Field(..., example="Bachelors")
    employment_type:  str   = Field(..., example="Salaried")


def compute_smart_score(data: LoanInput) -> float:
    """
    Rule-based scoring system (0 to 100).
    Higher score = lower risk = higher approval chance.
    """
    score = 0

    # ── Credit Score (max 35 points) ──
    if data.credit_score >= 750:   score += 35
    elif data.credit_score >= 700: score += 28
    elif data.credit_score >= 650: score += 20
    elif data.credit_score >= 600: score += 13
    elif data.credit_score >= 500: score += 6
    else:                          score += 0

    # ── Employment (max 20 points) ──
    if data.employment_type == "Salaried":      score += 20
    elif data.employment_type == "Self-Employed": score += 12
    else:                                         score += 0  # Unemployed

    # ── Loan to Income Ratio (max 20 points) ──
    if data.income > 0:
        ratio = data.loan_amount / data.income
        if ratio <= 0.2:   score += 20
        elif ratio <= 0.4: score += 15
        elif ratio <= 0.6: score += 8
        elif ratio <= 0.8: score += 3
        else:              score += 0

    # ── Work Experience (max 15 points) ──
    if data.years_experience >= 10:  score += 15
    elif data.years_experience >= 5: score += 11
    elif data.years_experience >= 2: score += 6
    else:                            score += 0

    # ── Education (max 10 points) ──
    edu_map = {"PhD": 10, "Masters": 8, "Bachelors": 6, "High School": 3}
    score += edu_map.get(data.education, 4)

    return score  # 0–100


def get_risk_label_and_probs(score: float):
    """Convert score to risk label and probabilities."""
    approval_prob  = round(score, 1)
    rejection_prob = round(100 - score, 1)

    if score >= 60:
        label    = "Low Risk"
        approved = 1
    elif score >= 35:
        label    = "Medium Risk"
        approved = 0
    else:
        label    = "High Risk"
        approved = 0

    return label, approved, approval_prob, rejection_prob


def get_risk_factors(data: LoanInput) -> list:
    factors = []
    if data.credit_score < 600:
        factors.append(f"Low credit score ({int(data.credit_score)}) — aim for 650+")
    if data.employment_type == "Unemployed":
        factors.append("Currently unemployed — no stable income source")
    if data.income > 0 and data.loan_amount / data.income > 0.6:
        factors.append("Loan amount is too high relative to income")
    if data.years_experience < 2:
        factors.append("Less than 2 years of work experience")
    if data.income < 20000:
        factors.append("Low annual income (below $20,000)")
    return factors if factors else ["No major risk factors detected ✅"]


@app.get("/")
def root():
    return {"message": "Loan Risk Prediction API is running ✅"}

@app.get("/health")
def health():
    return {"status": "healthy"}

@app.post("/predict")
def predict(data: LoanInput):
    try:
        le_gender.transform([data.gender])
        le_edu.transform([data.education])
        le_emp.transform([data.employment_type])
    except ValueError as e:
        raise HTTPException(status_code=422, detail=f"Invalid input value: {str(e)}")

    # Smart rule-based score
    score = compute_smart_score(data)
    label, approved, approval_prob, rejection_prob = get_risk_label_and_probs(score)

    return {
        "approved":              approved,
        "risk_label":            label,
        "approval_probability":  approval_prob,
        "rejection_probability": rejection_prob,
        "risk_factors":          get_risk_factors(data),
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
