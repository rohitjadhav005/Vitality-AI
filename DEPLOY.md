# Deploy Vitality AI (frontend + API)

## Architecture

| Part | Platform | URL |
|------|----------|-----|
| React app | [Vercel](https://vitality-ai-kappa.vercel.app/) | `vitality-ai-kappa.vercel.app` |
| FastAPI API | [Render](https://render.com) (free) | `https://vitality-api.onrender.com` |

The frontend calls the API via `VITE_API_URL` / `src/config/api.js` (no more `localhost` in production).

## 1. Deploy the API on Render (one time)

1. Open [Render Dashboard](https://dashboard.render.com/) → **New** → **Blueprint**.
2. Connect GitHub repo: `rohitjadhav005/Vitality-AI`.
3. Render reads `render.yaml` and creates service **`vitality-api`**.
4. Wait until deploy is **Live** and open `https://vitality-api.onrender.com/api/health` — you should see `{"status":"ok",...}`.

> Free Render services sleep after ~15 min idle; the first request after sleep may take ~30s (cold start).

## 2. Redeploy frontend on Vercel

Push this repo to `main`. Vercel rebuilds automatically.

`vercel.json` sets `VITE_API_URL=https://vitality-api.onrender.com`. You can also add the same variable in Vercel → Project → Settings → Environment Variables.

## 3. Verify login

1. Open https://vitality-ai-kappa.vercel.app/
2. **Sign Up** → **Sign In**
3. If it fails, check browser DevTools → Network: requests should go to `vitality-api.onrender.com`, not `localhost`.

## Local development

```bash
# Terminal 1 – API
pip install -r requirements.txt
python scripts/build_model.py
uvicorn main:app --reload --port 8000

# Terminal 2 – UI
npm run dev
```

No `VITE_API_URL` needed locally (defaults to `http://localhost:8000`).
