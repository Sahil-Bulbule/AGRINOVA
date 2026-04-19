## AgriNova - Smart Agriculture Website

AgriNova is a clean, multi-section smart agriculture website with powerful Weather, Mandi, Schemes, Advisory, Feedback, and optional Auth-based preferences.

## Folder Structure

- `frontend/`
  - `index.html`, `index.css`, `main.js`
- `backend/`
  - `app.py`
  - `routes/` (`weather.py`, `mandi.py`, `prediction.py`, `insights.py`, `recommendation.py`)
  - `models/user.py`
  - `requirements.txt`
  - `data/` (`mandi_data.json`, `mandi.json`, `schemes.json`, `trends.json`)
  - `database/agrinova.db` (auto-created SQLite database)
- `api/`
  - `README.md` (endpoint reference and payload examples)
- `assets/`
  - `README.md` (reserved for icons, map SVGs, and report assets)

## Backend APIs

1. `GET /weather?city=` (secure backend weather API integration)
2. `GET /mandi?state=&city=&crop=` (historical data + prediction + insights)
3. `GET /price-prediction?state=&city=&crop=`
4. `GET /insights?state=&city=&crop=`
5. `POST /recommend` (month + temperature + soil type)
6. `POST /signup`, `POST /login` (optional auth)
7. `GET/POST /preferences` (save user state/crop)

## Step-by-Step Setup Instructions

1. Open terminal at project root:
   - `cd "c:\Users\sahil\OneDrive\Desktop\POLY PROJECT"`

2. Install backend dependencies:
   - `python -m pip install -r "backend/requirements.txt"`

3. Start backend server:
   - `python "backend/app.py"`

4. Open frontend:
   - Open `frontend/index.html` in browser (or Live Server).

5. Open website sections directly from homepage navigation:
   - Weather and Mandi now use backend APIs only.
   - Advisory includes smart crop recommendation form.

## API Base URL

- `http://localhost:5000`

See `api/README.md` for all endpoint details.