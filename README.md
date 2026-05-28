# 💳 Loan Risk Prediction System

AI-powered loan risk assessment using RandomForest, FastAPI, and React.

---

## Folder Structure

```
loan-risk-app/
├── ml_model/                        ← Train & save the ML model
│   ├── loan_risk_prediction_dataset.csv
│   ├── train_model.py
│   ├── model.pkl                    (generated)
│   ├── le_gender.pkl                (generated)
│   ├── le_edu.pkl                   (generated)
│   └── le_emp.pkl                   (generated)
│
├── backend/                         ← FastAPI REST API
│   ├── main.py
│   └── requirements.txt
│
├── frontend/                        ← React + Vite UI
│   ├── src/
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── index.html
│   ├── vite.config.js
│   └── package.json
│
└── README.md
```

---

## How to Run (Step by Step)

### Step 1 — Train the Model (run ONCE)
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
→ API runs at http://127.0.0.1:8000

### Step 3 — Start Frontend
```bash
cd frontend
npm install
npm run dev
```
→ UI runs at http://localhost:5173

---

## Tech Stack
| Layer | Technology |
|-------|-----------|
| ML Model | RandomForest (scikit-learn) |
| Backend | FastAPI + Uvicorn |
| Frontend | React 18 + Vite |
| Styling | Pure CSS-in-JS |
| HTTP | Axios |

## Dataset
- Source: Kaggle
- Rows: 5000
- Target: `LoanApproved` (0 = Rejected, 1 = Approved)
- Features: Age, Income, LoanAmount, CreditScore, YearsExperience, Gender, Education, EmploymentType
