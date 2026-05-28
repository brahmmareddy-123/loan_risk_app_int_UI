import pandas as pd
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder
from sklearn.metrics import accuracy_score, classification_report
import joblib
import os

# ── Load Dataset ──────────────────────────────────────────────────
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
df = pd.read_csv(os.path.join(BASE_DIR, "loan_risk_prediction_dataset.csv"))

# ── Clean ─────────────────────────────────────────────────────────
df = df.dropna()

# ── Encode Categorical Columns ────────────────────────────────────
le_gender = LabelEncoder()
le_edu    = LabelEncoder()
le_emp    = LabelEncoder()

df["Gender"]         = le_gender.fit_transform(df["Gender"])
df["Education"]      = le_edu.fit_transform(df["Education"])
df["EmploymentType"] = le_emp.fit_transform(df["EmploymentType"])

# ── Features & Target ─────────────────────────────────────────────
FEATURES = ["Age", "Income", "LoanAmount", "CreditScore",
            "YearsExperience", "Gender", "Education", "EmploymentType"]

X = df[FEATURES]
y = df["LoanApproved"]

X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42
)

# ── Train ─────────────────────────────────────────────────────────
model = RandomForestClassifier(n_estimators=100, random_state=42)
model.fit(X_train, y_train)

# ── Evaluate ──────────────────────────────────────────────────────
y_pred = model.predict(X_test)
acc = accuracy_score(y_test, y_pred)
print(f"\n✅ Model Accuracy: {acc * 100:.2f}%\n")
print(classification_report(y_test, y_pred))

# ── Save Model + Encoders ─────────────────────────────────────────
joblib.dump(model,     os.path.join(BASE_DIR, "model.pkl"))
joblib.dump(le_gender, os.path.join(BASE_DIR, "le_gender.pkl"))
joblib.dump(le_edu,    os.path.join(BASE_DIR, "le_edu.pkl"))
joblib.dump(le_emp,    os.path.join(BASE_DIR, "le_emp.pkl"))

print("✅ model.pkl, le_gender.pkl, le_edu.pkl, le_emp.pkl saved in ml_model/")
