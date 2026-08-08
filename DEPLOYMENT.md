# Deploying to Vercel

Vercel is built for frontends and stateless serverless functions. It is **not** a natural fit for a persistent Express + MongoDB backend with long-running transactions (this project uses Mongoose sessions/transactions for FIFO stock and voucher posting), so the two halves are deployed differently:

- **Frontend (React/Vite)** → deploy directly to Vercel (ideal fit).
- **Backend (Express/MongoDB)** → deploy to a platform built for persistent Node servers (Render, Railway, Fly.io, or a small VPS). You *can* force it onto Vercel as serverless functions, but expect friction with transactions and cold starts — instructions for both paths are below.
- **Database** → MongoDB Atlas (free tier is enough to start).

## 1. Database — MongoDB Atlas
1. Create a free cluster at https://www.mongodb.com/cloud/atlas
2. Create a database user (username/password) and note it.
3. Under Network Access, allow access from anywhere (`0.0.0.0/0`) for now, or your backend host's IP once known.
4. Copy the connection string — this is your `MONGO_URI`.

## 2. Backend deployment

### Recommended: Render (or Railway/Fly.io) — simplest for an Express app
1. Push the `backend/` folder to a GitHub repo (or the whole project, with Render's root directory set to `backend`).
2. On Render: New → Web Service → connect the repo.
   - Root Directory: `backend`
   - Build Command: `npm install`
   - Start Command: `npm start`
3. Add environment variables in Render's dashboard (from `backend/.env.example`):
   - `MONGO_URI`, `JWT_SECRET`, `JWT_EXPIRES_IN`, `CLIENT_URL` (your Vercel frontend URL), `WA_PHONE_NUMBER_ID`, `WA_ACCESS_TOKEN`
4. Deploy. Once live, run the seed script once via Render's shell (or locally against the Atlas URI):
   ```
   npm run seed
   ```
5. Note the backend's public URL (e.g. `https://your-app.onrender.com`) — the frontend needs this.

### Alternative: Vercel serverless (if you want everything on Vercel)
1. `backend/vercel.json` is already included, routing all requests to `server.js` as a serverless function.
2. Import the `backend/` folder as its own Vercel project.
3. Set the same environment variables in Vercel's Project Settings → Environment Variables.
4. Known limitations on this path:
   - Each request runs a fresh function instance — Mongoose connections should be cached across invocations (add connection caching in `config/db.js` for production use) to avoid exhausting Atlas connections.
   - Multi-document transactions (used for FIFO stock posting, voucher balancing, fiscal period closing) require a MongoDB **replica set** — Atlas provides this by default, so this part works, but function execution time limits (10s on Hobby plan) can be tight for the period-closing endpoint on large datasets.
   - Run the seed script locally (pointed at your Atlas `MONGO_URI`) rather than through a serverless function, since it's a one-time setup task.

## 3. Frontend deployment (Vercel)
1. Push `frontend/` to a GitHub repo (or the whole project, with Vercel's root directory set to `frontend`).
2. On Vercel: New Project → import the repo.
   - Root Directory: `frontend`
   - Framework Preset: Vite (auto-detected)
   - Build Command: `npm run build`
   - Output Directory: `dist`
3. Add environment variable:
   - `VITE_API_URL` = your backend's public URL + `/api` (e.g. `https://your-app.onrender.com/api`)
4. Deploy. `frontend/vercel.json` already handles SPA client-side routing rewrites.

## 4. Post-deployment checklist
- Log in with `admin@example.com / ChangeMe123!` and change the password immediately.
- In the backend `.env`/host env vars, set `CLIENT_URL` to your live Vercel frontend URL so CORS allows it.
- Set up your Meta WhatsApp Cloud API credentials (`WA_PHONE_NUMBER_ID`, `WA_ACCESS_TOKEN`) — without these, credit-invoice WhatsApp confirmations will fail silently (invoice still saves, `whatsappStatus.sent` will be `false`) per the design.
- Create your actual Chart of Accounts levels 2–4 (the seed only creates Level 1 groups + a Retained Earnings ledger needed for period closing) before recording real transactions.
- Create Godowns, Items, and Parties before your first Sale/Purchase.

## 5. Ongoing
- Never commit `.env` files — `.gitignore` already excludes them in `backend/`.
- Rotate `JWT_SECRET` and the WhatsApp access token periodically.
- Atlas free tier is fine for development/small deployments; move to a paid tier before real transaction volume.
