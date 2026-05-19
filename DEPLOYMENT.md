# AI Stylist Deployment Guide

Production domains:

- Frontend: https://aistylist.in
- Backend API: https://api.aistylist.in

## 1. Preflight

Frontend:

```bash
cd frontend-react
npm install
npm run build
```

Backend:

```bash
cd backend
pip install -r requirements.txt
uvicorn app:app --host 0.0.0.0 --port 8000
```

Expected health check:

```bash
curl https://api.aistylist.in/health
```

Expected response:

```json
{"status":"ok"}
```

## 2. Vercel Frontend

Use `frontend-react` as the Vercel root directory.

Settings:

- Framework preset: Create React App
- Build command: `npm run build`
- Output directory: `build`
- Install command: `npm install`

Production environment variables:

```env
REACT_APP_API_URL=https://api.aistylist.in
```

After deployment, add the custom domain:

- `aistylist.in`
- optional redirect/helper domain: `www.aistylist.in`

## 3. Render Backend

Use the root repository and deploy from `render.yaml`.

Render blueprint settings are defined in `render.yaml`:

```yaml
services:
  - type: web
    name: aistylist-api
    env: python
    rootDir: backend
    buildCommand: pip install -r requirements.txt
    startCommand: uvicorn app:app --host 0.0.0.0 --port $PORT
    healthCheckPath: /health
```

Production environment variables:

```env
BACKEND_CORS_ORIGINS=https://aistylist.in,https://www.aistylist.in
```

After deployment, add the custom backend domain:

- `api.aistylist.in`

## 4. DNS

Typical records:

| Host | Type | Target |
| --- | --- | --- |
| `@` | A | Vercel apex IP shown in Vercel, commonly `76.76.21.21` |
| `www` | CNAME | Vercel CNAME target shown in Vercel |
| `api` | CNAME | Render `onrender.com` service hostname shown in Render |

Always copy the exact DNS values shown by Vercel and Render for your project.

## 5. Production Verification

Run after DNS and TLS are active:

```bash
curl https://api.aistylist.in/health
curl -X POST https://api.aistylist.in/recommend -H "Content-Type: application/json" -d "{\"category\":\"Shirts\",\"style\":\"Formal\"}"
curl -X POST https://api.aistylist.in/analyze -H "Content-Type: application/json" -d "{\"category\":\"Shoes\",\"style\":\"Streetwear\"}"
curl -X POST https://api.aistylist.in/product -H "Content-Type: application/json" -d "{\"url\":\"https://example.com/shirt\"}"
curl -X POST https://api.aistylist.in/outfit-analysis -H "Content-Type: application/json" -d "{\"category\":\"Shirts\",\"style\":\"Formal\",\"pose\":\"upright\",\"colors\":[\"black\",\"white\"]}"
```

Browser checks:

- Open https://aistylist.in
- Confirm the landing hero loads.
- Click Start Styling.
- Open Try-On, Recommendations, Analytics, Wardrobe, and Assistant.
- Confirm the browser console has no errors.
- Test mobile width in browser devtools and confirm no horizontal overflow.

