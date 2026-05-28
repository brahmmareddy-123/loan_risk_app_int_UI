# frontend/

React + Vite frontend for Loan Risk Prediction.

## Files
| File | Purpose |
|------|---------|
| `index.html` | HTML entry point |
| `vite.config.js` | Vite config with API proxy |
| `package.json` | Node dependencies |
| `src/main.jsx` | React root |
| `src/App.jsx` | Main UI component |
| `src/index.css` | Global styles |

## Setup & Run

```bash
cd frontend

# Install dependencies
npm install

# Start dev server
npm run dev
```

App will run at: http://localhost:5173

## Build for Production
```bash
npm run build
```
Output goes to `dist/` folder — deploy this to any static host (Netlify, Vercel, etc.)

## Important
Backend (FastAPI) must be running on port 8000 before using the app.
