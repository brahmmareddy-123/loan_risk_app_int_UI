# backend/

FastAPI backend for Loan Risk Prediction.

## Files
| File | Purpose |
|------|---------|
| `main.py` | FastAPI app with `/predict` endpoint |
| `requirements.txt` | Python dependencies |

## Setup & Run

```bash
cd backend

# Install dependencies
pip install -r requirements.txt

# Start server
uvicorn main:app --reload
```

API will run at: http://127.0.0.1:8000

## Endpoints
| Method | Route | Description |
|--------|-------|-------------|
| GET | `/` | Health check |
| GET | `/health` | Status check |
| POST | `/predict` | Predict loan risk |

## Test in browser
Visit: http://127.0.0.1:8000/docs  (Swagger UI auto-generated)

## Important
Run `ml_model/train_model.py` BEFORE starting the backend.
