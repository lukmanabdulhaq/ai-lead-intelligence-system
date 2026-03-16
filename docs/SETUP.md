# Setup Guide — AI Lead Intelligence System

Follow these steps in order. Total setup time: ~45 minutes.

---

## Step 1 — Create the GitHub repo

```bash
# On your Manjaro machine
git init ai-lead-intelligence-system
cd ai-lead-intelligence-system
git remote add origin https://github.com/lukmanabdulhaq/ai-lead-intelligence-system.git
```

Copy all the project files into this folder, then:

```bash
git add .
git commit -m "feat: initial project scaffold"
git push -u origin main
```

---

## Step 2 — Set up Supabase

1. Go to [supabase.com](https://supabase.com) → **New project**
2. Give it a name: `ai-lead-intelligence`
3. Once created, go to **SQL Editor** → paste the contents of `backend/src/lib/schema.sql` → **Run**
4. Go to **Settings → API** and copy:
   - **Project URL** → `SUPABASE_URL`
   - **service_role** key → `SUPABASE_SERVICE_KEY`
   - **anon** key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`

---

## Step 3 — Get your API keys

### OpenAI
1. Go to [platform.openai.com](https://platform.openai.com) → API Keys → Create new key
2. Copy it → `OPENAI_API_KEY`

### Telegram Bot
1. Open Telegram → search **@BotFather** → `/newbot`
2. Follow prompts, copy the token → `TELEGRAM_BOT_TOKEN`
3. Add the bot to a group, then visit:
   `https://api.telegram.org/bot<TOKEN>/getUpdates`
   Find the `chat.id` of your group → `TELEGRAM_CHAT_ID`

### WhatsApp (Meta Cloud API)
1. Go to [developers.facebook.com](https://developers.facebook.com) → Create app → Business
2. Add **WhatsApp** product
3. Go to WhatsApp → API Setup → copy:
   - **Temporary access token** → `WHATSAPP_TOKEN`
   - **Phone number ID** → `WHATSAPP_PHONE_NUMBER_ID`
4. Your sales phone (e.g. 233244123456) → `WHATSAPP_SALES_PHONE`

---

## Step 4 — Run the backend

```bash
cd backend
cp .env.example .env
# Fill in all values in .env

npm install
npm run dev
# → Running on http://localhost:3001
# → Test: http://localhost:3001/health
```

---

## Step 5 — Run the frontend

```bash
cd frontend
cp .env.local.example .env.local
# Fill in Supabase URL and anon key

npm install
npm run dev
# → Running on http://localhost:3000
```

---

## Step 6 — Set up n8n Cloud

1. Go to [app.n8n.cloud](https://app.n8n.cloud) → sign up (free tier)
2. Create a new workflow → **Import** → upload `automation/workflows/lead-pipeline.json`
3. Add credentials inside n8n:
   - **OpenAI API** → paste your key
   - **Telegram Bot** → paste your bot token
4. Set environment variables in n8n (Settings → Variables):
   - `BACKEND_URL` = your backend URL (use ngrok for local dev — see below)
   - `WEBHOOK_SECRET` = same value as in your backend `.env`
   - `TELEGRAM_CHAT_ID` = your group chat ID
5. **Activate** the workflow (toggle top-right)
6. Copy the **webhook URL** from the Webhook node

---

## Step 7 — Test the full pipeline

```bash
curl -X POST YOUR_N8N_WEBHOOK_URL \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Lead",
    "email": "test@example.com",
    "message": "I want to buy a 3-bedroom apartment in Accra, budget $80k, need it by next month",
    "source": "web_form"
  }'
```

**Expected result:**
- Lead appears in your Supabase `leads` table scored HIGH
- Telegram message received in your group
- Dashboard at `localhost:3000` shows the new lead

---

## Step 8 — Local tunneling with ngrok (for n8n to reach your local backend)

While developing locally, n8n can't reach `localhost:3001`. Use ngrok:

```bash
# Install ngrok on Manjaro
yay -S ngrok
# OR: download from https://ngrok.com/download

# Expose your backend
ngrok http 3001
# → Forwarding: https://abc123.ngrok.io → localhost:3001

# Set BACKEND_URL in n8n to: https://abc123.ngrok.io
```

---

## Step 9 — Deploy to production

### Frontend → Vercel
```bash
cd frontend
npx vercel
# Follow prompts — set env vars when asked
```

### Backend → Railway
1. Go to [railway.app](https://railway.app) → New Project → Deploy from GitHub
2. Select the `backend` folder
3. Add all `.env` variables in Railway's dashboard
4. Copy the public URL → update `BACKEND_URL` in n8n

---

## Step 10 — Add the n8n webhook URL to your web form

In your website's contact form, POST to the n8n webhook:

```javascript
await fetch('YOUR_N8N_WEBHOOK_URL', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    name:    formData.name,
    email:   formData.email,
    message: formData.message,
    source:  'web_form',
  }),
});
```

---

## Troubleshooting

| Issue | Fix |
|---|---|
| n8n can't reach backend | Use ngrok locally, or deploy backend first |
| No Telegram message | Check `TELEGRAM_CHAT_ID` — must be a negative number for groups |
| WhatsApp not sending | Verify token hasn't expired (Meta tokens expire in 24h — use permanent token in production) |
| AI scoring returns empty | Check `OPENAI_API_KEY` is set in both backend `.env` and n8n credentials |
| Supabase insert fails | Run the schema SQL again, check RLS policies |
