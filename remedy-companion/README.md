# Remedy Companion

BHMS study PWA: remedy flashcards, quiz, repertory search, compare remedies, and AI tools from your uploaded PDF/PPTX notes (Google Gemini).

## Local development

1. Install dependencies:

   ```bash
   cd remedy-companion
   npm install
   ```

2. Copy environment file and add your Gemini API key:

   ```bash
   copy .env.example .env
   ```

   Get a key at [Google AI Studio](https://aistudio.google.com/apikey).

3. Run the app:

   ```bash
   npm run dev:full
   ```

   - Frontend: Vite (default `http://localhost:5173`)
   - API: Express on `http://localhost:3001` (proxied as `/api/*`)

   Core modules (cards, quiz, search) work without the API. Notes features need `GEMINI_API_KEY`.

## Deploy to Vercel (iOS & Android PWA)

1. Push this repo to GitHub.

2. In [Vercel](https://vercel.com), **Import Project** and set:

   | Setting | Value |
   |---------|--------|
   | **Root Directory** | `remedy-companion` |
   | **Framework Preset** | Vite |
   | **Build Command** | `npm run build` |
   | **Output Directory** | `dist` |

3. **Environment variables** (Project → Settings → Environment Variables):

   | Name | Value |
   |------|--------|
   | `GEMINI_API_KEY` | Your key from AI Studio |

   Optional: `GEMINI_MODEL` (default `gemini-2.0-flash`).

4. Deploy. Vercel serves:

   - Static PWA from `dist/`
   - Serverless API routes in `/api/*` (same URLs the app already uses)

5. **Install on phone**

   - **Android (Chrome):** Open your Vercel URL → menu → *Install app* / *Add to Home screen*.
   - **iOS (Safari):** Open the URL → Share → *Add to Home Screen*.

   The app uses `HashRouter`, so routing works on static hosting. Icons and `manifest.json` are included at build time (`npm run icons` runs before build).

## Health check

After deploy: `https://your-app.vercel.app/api/health` should return `{ "status": "ok", "provider": "gemini", "apiKeySet": true }`.

## Scripts

| Command | Purpose |
|---------|---------|
| `npm run dev` | Frontend only |
| `npm run dev:full` | Frontend + local API |
| `npm run icons` | Generate PNG PWA icons from `public/favicon.svg` |
| `npm run build` | Production build (icons + Vite) |

## Project layout

- `src/` — React app
- `api/` — Vercel serverless handlers (production)
- `server/server.js` — Local Express API (development)
- `lib/ai/gemini.js` — Shared Gemini prompts and JSON parsing
- `public/` — PWA manifest, service worker, icons
