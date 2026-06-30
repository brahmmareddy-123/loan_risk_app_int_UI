import sqlite3
import os

DB_PATH = os.path.join(os.path.dirname(os.path.abspath(__file__)), "finance.db")

def get_connection():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    conn = get_connection()
    cur = conn.cursor()

    # ── Expenses Table ──
    cur.execute("""
        CREATE TABLE IF NOT EXISTS expenses (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_session TEXT NOT NULL,
            category TEXT NOT NULL,
            amount REAL NOT NULL,
            month TEXT NOT NULL,
            note TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    """)

    # ── Monthly Income Table ──
    cur.execute("""
        CREATE TABLE IF NOT EXISTS monthly_income (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_session TEXT NOT NULL,
            month TEXT NOT NULL,
            income REAL NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            UNIQUE(user_session, month)
        )
    """)

    conn.commit()
    conn.close()
    print("✅ Database initialized — finance.db ready")

if __name__ == "__main__":
    init_db()
