# AI Stylist Frontend

React + Tailwind frontend for the AI Stylist fashion intelligence platform.

## Production

- Public app: https://aistylist.in
- Production API: https://api.aistylist.in

## Environment

Create `.env` from `.env.example` and set:

```env
REACT_APP_API_URL=https://api.aistylist.in
```

Firebase keys are optional until authentication is configured in the deployment environment.

## Commands

```bash
npm install
npm run build
npm start
```

## Vercel

Use `frontend-react` as the Vercel root directory.

- Build command: `npm run build`
- Output directory: `build`
- Environment variable: `REACT_APP_API_URL=https://api.aistylist.in`
