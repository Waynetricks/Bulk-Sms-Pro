# Bulk SMS Pro — Developer Handoff Guide
> Branch: `Bulk-API` | Briq integration completed and tested ✅

## What Was Done
This branch contains a complete integration of the **Briq SMS API** (Tanzania) into the existing Bulk SMS Pro platform. All changes are backward-compatible — other providers (Twilio, Vonage, Africa's Talking) still work.

### Key Changes Made
| File | What Changed |
|---|---|
| `server/src/gateway/providers.ts` | Added `BriqProvider` class + `FallbackProvider` wrapper |
| `server/src/routes/api.ts` | Webhook endpoint now parses Briq events + HMAC signature verification |
| `server/src/index.ts` | Connected PostgreSQL on startup; captures raw body for signature verification |
| `server/src/services/index.ts` | Added `libphonenumber-js` E.164 phone validation before DB write |
| `run-backend.bat` / `run-frontend.bat` | Fixed hardcoded paths → now use dynamic `%~dp0` |
| `server/.env.example` | Added Briq environment variable documentation |

---

## Local Development Setup

### Prerequisites
- Node.js 18+
- Docker Desktop (running)
- Git

### 1. Clone & Install
```bash
git clone https://github.com/Waynetricks/Bulk-Sms-Pro.git
cd Bulk-Sms-Pro
git checkout Bulk-API
npm install
cd server && npm install
cd ../client && npm install
```

### 2. Configure Environment
```bash
cp server/.env.example server/.env
```
Open `server/.env` and fill in your values:

```env
DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@127.0.0.1:5432/bulk_sms
# Note: If your password has @ in it, encode it as %40
# e.g. password "p@ss" → DATABASE_URL=...postgres:p%40ss@127.0.0.1...

BRIQ_API_KEY=your_briq_api_key
BRIQ_APP_ID=your_briq_app_key
BRIQ_SENDER_ID=BRIQ
SMS_PROVIDER=briq

WEBHOOK_SECRET=your_webhook_signing_secret_from_briq_dashboard
```

### 3. Start Services
```bash
# Start Docker containers (PostgreSQL + Redis)
docker-compose up -d postgres redis

# Start backend (auto-creates all tables on first run)
run-backend.bat

# Start frontend (new terminal)
run-frontend.bat
```

Frontend: http://localhost:5173  
Backend: http://localhost:3001

---

## Briq Webhook Setup (Required for Delivery Reports)

When deploying to production, you need to register your public webhook URL in Briq's dashboard.

**Webhook URL format:**
```
https://your-domain.com/api/webhooks/delivery-report
```

**Steps:**
1. Log in at https://briq.tz
2. Go to **Developer Apps** → select your app
3. Go to **Webhooks** → create a new webhook
4. Paste your URL and set events: `sms.sent`, `sms.delivered`, `sms.failed`
5. Copy the **Webhook Signing Secret** → paste into `WEBHOOK_SECRET` in your `.env`

> ⚠️ For local development, use [ngrok](https://ngrok.com) to expose port 3001:
> ```bash
> npx ngrok config add-authtoken YOUR_NGROK_TOKEN
> npx ngrok http 3001
> ```
> Then use the ngrok `https://...` URL as your webhook URL in Briq.

---

## Sending SMS — Phone Number Format

Recipients **must** be in full international E.164 format with the `+` prefix:

✅ `+255713617060`  
❌ `0713617060` (will be rejected)

---

## SMS Provider Architecture

The app supports multiple providers via a pluggable interface. Switch providers by changing `SMS_PROVIDER` in `.env`:

```env
SMS_PROVIDER=briq        # Tanzania (active)
SMS_PROVIDER=twilio      # Global
SMS_PROVIDER=africas_talking
SMS_PROVIDER=vonage
```

You can also configure a **fallback provider** that activates automatically if the primary fails:
```env
SMS_PROVIDER=briq
FALLBACK_SMS_PROVIDER=twilio
```

---

## Deploying to Production

### Things to do before going live:

1. **Switch to a production PostgreSQL instance** (e.g. Railway, Supabase, AWS RDS) — update `DATABASE_URL`.
2. **Switch Redis** to a managed instance (e.g. Upstash, Redis Cloud) — update `REDIS_URL`.
3. **Set a strong `JWT_SECRET`** — never use the default.
4. **Register your real domain webhook URL** in the Briq dashboard (replace your ngrok URL).
5. **Set `NODE_ENV=production`** and use a process manager like `pm2`.
6. **Configure CORS** in `server/src/index.ts` to only allow your frontend domain.
7. **Consider adding authentication** to protect the campaign/contact API routes.

### Recommended Stack for Hosting
| Layer | Recommendation |
|---|---|
| Frontend | Vercel / Netlify |
| Backend | Railway / Render / DigitalOcean App Platform |
| Database | Supabase / Railway PostgreSQL |
| Redis | Upstash (free tier available) |

---

## API Endpoints Quick Reference

| Method | Route | Description |
|---|---|---|
| `POST` | `/api/campaigns` | Create a campaign with recipients |
| `GET` | `/api/campaigns` | List all campaigns |
| `GET` | `/api/campaigns/:id` | Get campaign + message stats |
| `POST` | `/api/campaigns/:id/send` | Queue campaign for sending |
| `POST` | `/api/contacts` | Add contacts (optionally to a group) |
| `GET` | `/api/contacts` | List contacts |
| `DELETE` | `/api/contacts/:id` | Delete a contact |
| `POST` | `/api/groups` | Create a contact group |
| `GET` | `/api/groups` | List all groups |
| `POST` | `/api/webhooks/delivery-report` | Receives delivery status from Briq |

---

## Known Limitations / Future Work
- [ ] No authentication on API routes — add JWT middleware before going live
- [ ] No automated tests — unit/integration tests recommended before production
- [ ] Briq `X-App-ID` header currently omitted (causes 403 until API key is linked to Developer App in Briq dashboard — optional feature for webhook correlation)
- [ ] Contacts do not currently validate E.164 format on creation (only campaign recipients are validated)
