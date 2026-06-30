from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from database import get_connection, init_db
from datetime import datetime

router = APIRouter(prefix="/expenses", tags=["Expense Tracker"])

# Initialize DB on import
init_db()

EXPENSE_CATEGORIES = [
    "Rent", "Food", "Transport", "EMI", "Entertainment",
    "Utilities", "Healthcare", "Education", "Shopping", "Other"
]

# ── Schemas ───────────────────────────────────────────────────────
class ExpenseInput(BaseModel):
    user_session: str = Field(..., example="guest-123")
    category:     str = Field(..., example="Food")
    amount:       float = Field(..., ge=0, example=2500)
    month:        str = Field(..., example="2026-06")  # YYYY-MM
    note:         str = Field(default="", example="Groceries")

class IncomeInput(BaseModel):
    user_session: str = Field(..., example="guest-123")
    month:        str = Field(..., example="2026-06")
    income:       float = Field(..., ge=0, example=60000)


# ── Routes ────────────────────────────────────────────────────────
@router.post("/add")
def add_expense(data: ExpenseInput):
    if data.category not in EXPENSE_CATEGORIES:
        raise HTTPException(status_code=422, detail=f"Category must be one of {EXPENSE_CATEGORIES}")

    conn = get_connection()
    cur = conn.cursor()
    cur.execute(
        "INSERT INTO expenses (user_session, category, amount, month, note) VALUES (?, ?, ?, ?, ?)",
        (data.user_session, data.category, data.amount, data.month, data.note)
    )
    conn.commit()
    expense_id = cur.lastrowid
    conn.close()
    return {"id": expense_id, "message": "Expense added ✅"}


@router.delete("/{expense_id}")
def delete_expense(expense_id: int):
    conn = get_connection()
    cur = conn.cursor()
    cur.execute("DELETE FROM expenses WHERE id = ?", (expense_id,))
    conn.commit()
    deleted = cur.rowcount
    conn.close()
    if deleted == 0:
        raise HTTPException(status_code=404, detail="Expense not found")
    return {"message": "Expense deleted ✅"}


@router.get("/list/{user_session}/{month}")
def list_expenses(user_session: str, month: str):
    conn = get_connection()
    cur = conn.cursor()
    cur.execute(
        "SELECT id, category, amount, month, note, created_at FROM expenses WHERE user_session = ? AND month = ? ORDER BY created_at DESC",
        (user_session, month)
    )
    rows = cur.fetchall()
    conn.close()
    return {"expenses": [dict(r) for r in rows]}


@router.post("/income")
def set_income(data: IncomeInput):
    conn = get_connection()
    cur = conn.cursor()
    cur.execute(
        """INSERT INTO monthly_income (user_session, month, income)
           VALUES (?, ?, ?)
           ON CONFLICT(user_session, month) DO UPDATE SET income = excluded.income""",
        (data.user_session, data.month, data.income)
    )
    conn.commit()
    conn.close()
    return {"message": "Income saved ✅"}


@router.get("/summary/{user_session}/{month}")
def get_summary(user_session: str, month: str):
    conn = get_connection()
    cur = conn.cursor()

    # Get income
    cur.execute("SELECT income FROM monthly_income WHERE user_session = ? AND month = ?", (user_session, month))
    income_row = cur.fetchone()
    income = income_row["income"] if income_row else 0

    # Get expenses grouped by category
    cur.execute(
        "SELECT category, SUM(amount) as total FROM expenses WHERE user_session = ? AND month = ? GROUP BY category",
        (user_session, month)
    )
    category_totals = {r["category"]: r["total"] for r in cur.fetchall()}
    total_expenses = sum(category_totals.values())

    conn.close()

    disposable_income = income - total_expenses
    savings_rate = round((disposable_income / income) * 100, 1) if income > 0 else 0

    return {
        "month": month,
        "income": income,
        "total_expenses": total_expenses,
        "disposable_income": disposable_income,
        "savings_rate": savings_rate,
        "category_breakdown": category_totals,
        "categories_available": EXPENSE_CATEGORIES,
    }


@router.get("/categories")
def get_categories():
    return {"categories": EXPENSE_CATEGORIES}
