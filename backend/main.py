from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
import joblib
import numpy as np
import os

app = FastAPI(title="Loan Risk Prediction API", version="1.0.0")

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
    raise RuntimeError("❌ Model files not found.")

# ── District-wise land rate per sq ft (₹) ────────────────────────
DISTRICT_RATES = {
    # Telangana
    "Hyderabad": 8000, "Warangal": 3500, "Nizamabad": 2800, "Karimnagar": 3000,
    "Khammam": 2500, "Mahbubnagar": 2200, "Nalgonda": 2400, "Adilabad": 1800,
    "Suryapet": 2000, "Siddipet": 2600, "Mancherial": 1900, "Jagtial": 2000,
    "Vikarabad": 2200, "Medak": 2300, "Sangareddy": 3200,
    # Andhra Pradesh
    "Visakhapatnam": 6000, "Vijayawada": 5500, "Guntur": 4000, "Nellore": 3500,
    "Kurnool": 3000, "Kadapa": 2800, "Tirupati": 5000, "Anantapur": 2500,
    "Eluru": 3200, "Ongole": 2900, "Srikakulam": 2200, "Vizianagaram": 2400,
    "Rajahmundry": 4500, "Kakinada": 4000, "Bhimavaram": 3000,
    # Karnataka
    "Bangalore": 9000, "Mysore": 5500, "Hubli": 4000, "Mangalore": 5000,
    "Belgaum": 3500, "Gulbarga": 2800, "Davanagere": 3000, "Bellary": 2900,
    "Bijapur": 2700, "Shimoga": 3200, "Tumkur": 3800, "Raichur": 2500,
    "Bidar": 2400, "Hassan": 3000, "Udupi": 4500,
    # Tamil Nadu
    "Chennai": 10000, "Coimbatore": 6000, "Madurai": 5000, "Tiruchirappalli": 4500,
    "Salem": 4000, "Tirunelveli": 3500, "Tiruppur": 4200, "Vellore": 3800,
    "Erode": 3900, "Thoothukkudi": 3200, "Dindigul": 3000, "Thanjavur": 3500,
    "Ranipet": 3400, "Sivakasi": 3100, "Kanchipuram": 5500,
    # Maharashtra
    "Mumbai": 15000, "Pune": 9000, "Nagpur": 5500, "Nashik": 5000,
    "Aurangabad": 4000, "Solapur": 3500, "Amravati": 3200, "Kolhapur": 4500,
    "Sangli": 3800, "Malegaon": 2900, "Jalgaon": 3000, "Akola": 2800,
    "Latur": 2700, "Dhule": 2800, "Ahmednagar": 3500,
    # Gujarat
    "Ahmedabad": 7000, "Surat": 7500, "Vadodara": 6000, "Rajkot": 5500,
    "Bhavnagar": 4000, "Jamnagar": 4500, "Junagadh": 3500, "Gandhinagar": 6500,
    "Anand": 4000, "Morbi": 3500, "Nadiad": 3800, "Mehsana": 3500,
    "Bharuch": 4200, "Valsad": 3800, "Navsari": 3600,
    # Rajasthan
    "Jaipur": 6500, "Jodhpur": 4500, "Kota": 4000, "Bikaner": 3500,
    "Ajmer": 4000, "Udaipur": 5000, "Bhilwara": 3000, "Alwar": 3500,
    "Bharatpur": 3200, "Sikar": 2800, "Pali": 2700, "Sri Ganganagar": 2900,
    "Tonk": 2600, "Chittorgarh": 2800, "Barmer": 2000,
    # Uttar Pradesh
    "Lucknow": 6000, "Kanpur": 4500, "Agra": 5000, "Varanasi": 5500,
    "Meerut": 4800, "Allahabad": 4200, "Ghaziabad": 6500, "Noida": 8000,
    "Bareilly": 3500, "Aligarh": 3200, "Moradabad": 3000, "Saharanpur": 3000,
    "Gorakhpur": 3500, "Firozabad": 2800, "Jhansi": 3000,
    # West Bengal
    "Kolkata": 8000, "Howrah": 6000, "Durgapur": 4000, "Asansol": 3500,
    "Siliguri": 4500, "Malda": 2500, "Bardhaman": 3000, "Kharagpur": 3200,
    "Haldia": 3500, "Jalpaiguri": 2800, "Krishnanagar": 2700, "Raiganj": 2400,
    "Midnapore": 2600, "Bankura": 2200, "Purulia": 2000,
    # Delhi
    "New Delhi": 12000, "North Delhi": 9000, "South Delhi": 13000,
    "East Delhi": 8500, "West Delhi": 9500, "Central Delhi": 14000,
    "North East Delhi": 7500, "North West Delhi": 8000, "South East Delhi": 10000,
    "South West Delhi": 11000, "Shahdara": 7000, "Dwarka": 10000,
    "Rohini": 8500, "Pitampura": 9000, "Vasant Kunj": 12000,
    # Madhya Pradesh
    "Bhopal": 5500, "Indore": 6000, "Jabalpur": 4000, "Gwalior": 4500,
    "Ujjain": 3500, "Sagar": 2800, "Dewas": 3200, "Satna": 2700,
    "Ratlam": 3000, "Rewa": 2600, "Murwara": 2500, "Singrauli": 2400,
    "Burhanpur": 2800, "Khandwa": 2700, "Bhind": 2300,
    # Kerala
    "Thiruvananthapuram": 6500, "Kochi": 8000, "Kozhikode": 5500, "Thrissur": 5000,
    "Kollam": 4500, "Palakkad": 4000, "Alappuzha": 5500, "Malappuram": 4200,
    "Kannur": 4500, "Kasaragod": 4000, "Kottayam": 5000, "Idukki": 3500,
    "Pathanamthitta": 4200, "Wayanad": 3800, "Ernakulam": 7500,
    # Punjab
    "Ludhiana": 5500, "Amritsar": 5000, "Jalandhar": 4500, "Patiala": 4000,
    "Bathinda": 3500, "Mohali": 6000, "Pathankot": 3500, "Hoshiarpur": 3200,
    "Batala": 2900, "Moga": 3000, "Firozpur": 2800, "Muktsar": 2700,
    "Sangrur": 3000, "Fatehgarh Sahib": 3500, "Rupnagar": 3800,
    # Haryana
    "Faridabad": 7000, "Gurgaon": 10000, "Panipat": 4500, "Ambala": 4000,
    "Yamunanagar": 3800, "Rohtak": 4500, "Hisar": 4000, "Karnal": 4200,
    "Sonipat": 5000, "Panchkula": 6000, "Bhiwani": 3200, "Sirsa": 3000,
    "Bahadurgarh": 5500, "Jind": 3000, "Thanesar": 3500,
    # Bihar
    "Patna": 5000, "Gaya": 3000, "Bhagalpur": 2800, "Muzaffarpur": 2900,
    "Purnia": 2500, "Darbhanga": 2600, "Bihar Sharif": 2400, "Arrah": 2300,
    "Begusarai": 2500, "Katihar": 2200, "Munger": 2400, "Chapra": 2200,
    "Hajipur": 2800, "Siwan": 2100, "Motihari": 2200,
    # Others default to 2500
}

DEFAULT_RATE = 2500  # ₹ per sq ft fallback

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
    score = 0
    if data.credit_score >= 750:   score += 35
    elif data.credit_score >= 700: score += 28
    elif data.credit_score >= 650: score += 20
    elif data.credit_score >= 600: score += 13
    elif data.credit_score >= 500: score += 6
    else:                          score -= 20  # ✅ penalty for very low score

    if data.employment_type == "Salaried":        score += 20
    elif data.employment_type == "Self-Employed": score += 12

    if data.income > 0:
        ratio = data.loan_amount / data.income
        if ratio <= 0.2:   score += 20
        elif ratio <= 0.4: score += 15
        elif ratio <= 0.6: score += 8
        elif ratio <= 0.8: score += 3

    if data.years_experience >= 10:  score += 15
    elif data.years_experience >= 5: score += 11
    elif data.years_experience >= 2: score += 6

    edu_map = {"PhD": 10, "Masters": 8, "Bachelors": 6, "High School": 3}
    score += edu_map.get(data.education, 4)

    return score

def get_risk_label(score):
    if score >= 65: return "Low Risk", 1
    if score >= 40: return "Medium Risk", 0
    return "High Risk", 0

def get_risk_factors(data: LoanInput) -> list:
    INR_INCOME = data.income * 83
    factors = []
    if data.credit_score < 600:
        factors.append(f"Low credit score ({int(data.credit_score)}) — aim for 650+")
    if data.employment_type == "Unemployed":
        factors.append("Currently unemployed — no stable income source")
    if data.income > 0 and data.loan_amount / data.income > 0.6:
        factors.append("Loan amount is too high relative to income")
    if data.years_experience < 2:
        factors.append("Less than 2 years of work experience")
    if INR_INCOME < 1660000:  # ₹16,60,000 = $20,000
        factors.append("Low annual income (below ₹16,60,000)")
    return factors if factors else ["No major risk factors detected ✅"]

@app.get("/")
def root():
    return {"message": "Loan Risk Prediction API is running ✅"}

@app.get("/health")
def health():
    return {"status": "healthy"}

@app.get("/land-rate/{district}")
def get_land_rate(district: str):
    rate = DISTRICT_RATES.get(district, DEFAULT_RATE)
    return {"district": district, "rate_per_sqft": rate}

@app.post("/predict")
def predict(data: LoanInput):
    try:
        le_gender.transform([data.gender])
        le_edu.transform([data.education])
        le_emp.transform([data.employment_type])
    except ValueError as e:
        raise HTTPException(status_code=422, detail=f"Invalid input: {str(e)}")

    score = compute_smart_score(data)
    label, approved = get_risk_label(score)

    return {
        "approved":              approved,
        "risk_label":            label,
        "approval_probability":  round(score, 1),
        "rejection_probability": round(100 - score, 1),
        "risk_factors":          get_risk_factors(data),
    }
