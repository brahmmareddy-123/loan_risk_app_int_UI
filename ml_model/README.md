# ml_model/

This folder contains the machine learning model training pipeline.

## Files
| File | Purpose |
|------|---------|
| `loan_risk_prediction_dataset.csv` | Raw Kaggle dataset |
| `train_model.py` | Trains RandomForest and saves model + encoders |
| `model.pkl` | Saved trained model (generated after running train_model.py) |
| `le_gender.pkl` | LabelEncoder for Gender |
| `le_edu.pkl` | LabelEncoder for Education |
| `le_emp.pkl` | LabelEncoder for EmploymentType |

## How to run
```bash
cd ml_model
python train_model.py
```
After running, `.pkl` files will appear in this folder.
