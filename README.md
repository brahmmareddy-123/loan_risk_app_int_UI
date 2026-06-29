# 💳 Loan Risk Prediction System

An AI-powered web application that predicts loan approval risk for customers based on their financial and personal details.

---

## 📌 Overview

The system takes customer information as input and classifies the loan applicant into one of three risk categories:

- ✅ **Low Risk** — Loan likely to be approved
- ⚠️ **Medium Risk** — Borderline case, needs review
- ❌ **High Risk** — Loan likely to be rejected

It also supports **Land Collateral Assessment** where the system calculates land market value district-wise and determines the maximum loan eligible based on a 70% LTV ratio.

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Machine Learning | Random Forest Classifier (scikit-learn) |
| Data Processing | Pandas, NumPy |
| Backend API | FastAPI + Uvicorn |
| Frontend UI | React 18 + Vite |
| HTTP Client | Axios |
| Version Control | Git + GitHub |

---

## ✨ Features

- 🔍 **Loan Risk Prediction** — Predicts Low / Medium / High risk instantly
- 📊 **Approval Probability** — Shows % chance of approval and rejection
- ⚠️ **Risk Factors** — Lists key factors affecting the applicant's risk
- 🏠 **Land Collateral Support** — Enter land details to calculate market value and max eligible loan
- 🗺️ **Indian States & Districts** — All 22 major states with 15 districts each
- 💰 **District-wise Land Rates** — Each district has its own land rate per sq ft
- 📋 **Prediction History** — Tracks all past predictions in a table
- ₹ **Indian Rupee (INR)** — All amounts in Indian currency
- 📱 **Responsive UI** — Works on mobile and desktop

---

## 📁 Project Structure

```
loan-risk-app/
├── ml_model/               ← ML model training
│   ├── train_model.py
│   ├── loan_risk_prediction_dataset.csv
│   └── *.pkl               (generated after training)
├── backend/                ← FastAPI REST API
│   ├── main.py
│   └── requirements.txt
├── frontend/               ← React UI
│   ├── src/
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── index.html
│   └── package.json
└── README.md
```

---

## 🚀 How to Run

### Step 1 — Train the Model (once)
```bash
cd ml_model
pip install pandas scikit-learn joblib
python train_model.py
```

### Step 2 — Start Backend
```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload
```

### Step 3 — Start Frontend
```bash
cd frontend
npm install
npm run dev
```

Open `http://localhost:5173` in your browser.

---

## 📊 Input Fields

| Field | Description |
|-------|-------------|
| Age | Applicant age (18–69) |
| Gender | Male / Female |
| Education | High School / Bachelors / Masters / PhD |
| Employment Type | Salaried / Self-Employed / Unemployed |
| Annual Income (₹) | Yearly income in Indian Rupees |
| Loan Amount (₹) | Requested loan amount in Indian Rupees |
| Work Experience | Years of work experience (0–39) |
| Credit Score | Score between 300–849 (slider) |

### 🏠 Land Collateral (Optional)
| Field | Description |
|-------|-------------|
| State | Select from 22 Indian states |
| District | Select district (auto-loads based on state) |
| Land Area | Area in square feet |

---

## 🔢 Risk Scoring Logic

| Factor | Max Points |
|--------|-----------|
| Credit Score | 35 pts |
| Employment Type | 20 pts |
| Loan-to-Income Ratio | 20 pts |
| Work Experience | 15 pts |
| Education | 10 pts |

- Score ≥ 60 → **Low Risk**
- Score 35–59 → **Medium Risk**
- Score < 35 → **High Risk**

---

## 🏠 Land Valuation Formula

```
Land Market Value = Land Area (sq ft) × District Rate (₹/sq ft)
Maximum Eligible Loan = Land Market Value × 70% (LTV Ratio)
```

---

## 📂 Dataset

- Source: Kaggle
- Records: 5,000
- Target: LoanApproved (0 = Rejected, 1 = Approved)
