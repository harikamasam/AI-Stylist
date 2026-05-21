# AI Stylist

**AI Stylist** is a production-ready AI fashion intelligence platform for real-time styling, product recommendations, outfit scoring, and saved wardrobe workflows.

Production targets:

- Frontend: [https://aistylist.in](https://aistylist.in)
- Backend API: [https://api.aistylist.in](https://api.aistylist.in)

## Problem Statement

Online fashion shopping often lacks confidence: users cannot easily understand whether a product fits their style, body posture, color palette, or occasion. AI Stylist solves this by combining computer vision, recommendation logic, and a guided styling workspace that helps users see and evaluate style before they buy.

## Resume-Ready Summary

Built a full-stack AI fashion SaaS platform using React, Tailwind CSS, FastAPI, MediaPipe, Firebase Authentication, and a modular recommendation/outfit intelligence engine. The system supports AI mirror tracking, product extraction, personalized recommendations, analytics, saved outfits, a before/after comparison flow, and a rule-based assistant named Aura Stylist.

## Features

- Premium landing experience for `AI Stylist`
- AI Mirror with MediaPipe pose, face, segmentation, and category-aware tracking modes
- Product extraction from pasted fashion URLs
- Category-specific product recommendations
- Rule-based outfit intelligence engine
- AI analytics scoring panel
- Before/After comparison slider
- Aura Stylist chat assistant
- Voice assistant controls
- Firebase Google sign-in
- Saved outfits and favorites
- Responsive desktop/mobile workspace
- Production-ready environment configuration

## Architecture

```text
AI Stylist
├── frontend-react
│   ├── src/components       Reusable UI panels and controls
│   ├── src/context          Auth provider and saved outfit state
│   ├── src/hooks            API-backed React hooks
│   ├── src/pages            Product landing + workspace composition
│   ├── src/services/api.js  Central API client
│   └── src/utils            Product/catalog constants
├── backend
│   ├── app.py               FastAPI routes and CORS setup
│   ├── services             Outfit intelligence logic
│   └── requirements.txt     Backend dependencies
├── render.yaml              Render backend deployment blueprint
└── README.md
```

## Tech Stack

- React
- Tailwind CSS
- FastAPI
- Uvicorn
- Pydantic
- MediaPipe
- Firebase Authentication
- React Compare Image
- Lucide React
- python-dotenv

## Environment Variables

Frontend `.env`:

```text
REACT_APP_API_URL=https://api.aistylist.in
REACT_APP_FIREBASE_API_KEY=
REACT_APP_FIREBASE_AUTH_DOMAIN=
REACT_APP_FIREBASE_PROJECT_ID=
REACT_APP_FIREBASE_STORAGE_BUCKET=
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=
REACT_APP_FIREBASE_APP_ID=
```

Backend `.env`:

```text
BACKEND_CORS_ORIGINS=https://aistylist.in,https://www.aistylist.in
GEMINI_API_KEY=
GEMINI_MODEL=gemini-2.5-flash
```

## Setup

### Backend

```bash
cd backend
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
uvicorn app:app --reload
```

### Frontend

```bash
cd frontend-react
npm install
npm start
```

For development, set `REACT_APP_API_URL` to your active backend URL.

## Deployment

### Frontend on Vercel

1. Create a Vercel project from `frontend-react`.
2. Add custom domain `aistylist.in`.
3. Set `REACT_APP_API_URL=https://api.aistylist.in`.
4. Add Firebase environment variables.
5. Build command: `npm run build`.
6. Output directory: `build`.

### Backend on Render

1. Use `render.yaml` from the repository root.
2. Add custom domain `api.aistylist.in`.
3. Set `BACKEND_CORS_ORIGINS=https://aistylist.in`.
4. Health check path: `/health`.
5. Start command: `uvicorn app:app --host 0.0.0.0 --port $PORT`.

## API Endpoints

- `GET /health`
- `POST /recommend`
- `POST /analyze`
- `POST /product`
- `POST /outfit-analysis`

## Screenshots

Add production screenshots after deployment:

- Landing hero
- Try-On workspace
- Recommendations grid
- Analytics and outfit intelligence
- Before/After comparison
- Aura Stylist assistant
- Saved outfits

## Future Scope

- Real ecommerce product scraping integrations
- User-uploaded garment try-on assets
- ML-based body type and color season detection
- Personalized recommendation ranking
- Persistent Firestore wardrobe history
- Stripe-powered premium styling plans
- Admin analytics dashboard

## Status

Portfolio release candidate prepared for:

- `https://aistylist.in`
- `https://api.aistylist.in`
