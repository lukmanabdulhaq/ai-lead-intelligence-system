# 🤖 AI Lead Intelligence System

> **Automated lead capture, AI scoring, and instant sales notifications — built for real startup workflows.**

[![Next.js](https://img.shields.io/badge/Next.js-15-black?logo=next.js)](https://nextjs.org)
[![Node.js](https://img.shields.io/badge/Node.js-20-green?logo=node.js)](https://nodejs.org)
[![n8n](https://img.shields.io/badge/n8n-automation-orange?logo=n8n)](https://n8n.io)
[![Supabase](https://img.shields.io/badge/Supabase-database-green?logo=supabase)](https://supabase.com)
[![OpenAI](https://img.shields.io/badge/OpenAI-GPT--4o-blue?logo=openai)](https://openai.com)
[![Vercel](https://img.shields.io/badge/Deployed-Vercel-black?logo=vercel)](https://vercel.com)

---

## What This System Does

Businesses receive leads from many channels simultaneously — website forms, emails, Telegram, WhatsApp, and CRM entries. This system **automatically captures, scores, and routes every lead** using AI, so sales teams respond to the right people faster.

```
Lead arrives (web / email / Telegram / WhatsApp)
        ↓
  Webhook trigger (n8n)
        ↓
  AI analysis (OpenAI GPT-4o / Google Gemini)
        ↓
  Lead scoring: HIGH / MEDIUM / LOW
        ↓
  Save to Supabase database
        ↓
  Instant notification → Telegram + WhatsApp
        ↓
  Dashboard updated in real time (Next.js)
```

---

## Live Demo

> 📸 _Screenshot / GIF of dashboard coming here_

**Example AI output for an incoming lead:**

```json
{
  "input": "I'm looking for a 3-bedroom house in Dubai, budget around $500k, want to move by March",
  "output": {
    "intent": "BUY",
    "budget": "$500,000",
    "location": "Dubai",
    "timeline": "March",
    "priority": "HIGH",
    "confidence": 0.94,
    "summary": "Motivated buyer with clear budget and timeline. Immediate follow-up recommended."
  }
}
```

---

## System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        LEAD SOURCES                         │
│   Web Form  │  Email  │  Telegram  │  WhatsApp  │  CRM      │
└──────────────────────────┬──────────────────────────────────┘
                           │
                    ┌──────▼──────┐
                    │    n8n      │  ← Automation engine
                    │  Webhook    │     (self-hosted / cloud)
                    └──────┬──────┘
                           │
                    ┌──────▼──────────────┐
                    │   AI Processing     │  ← OpenAI GPT-4o
                    │  Score + Extract    │     or Google Gemini
                    └──────┬──────────────┘
                           │
            ┌──────────────┼──────────────┐
            │              │              │
     ┌──────▼──────┐ ┌─────▼─────┐ ┌─────▼──────┐
     │  Supabase   │ │ Telegram  │ │  WhatsApp  │
     │  Database   │ │   Alert   │ │    Alert   │
     └──────┬──────┘ └───────────┘ └────────────┘
            │
     ┌──────▼──────────────────┐
     │   Next.js Dashboard     │  ← Deployed on Vercel
     │  Leads · Scores · Stats │
     └─────────────────────────┘
```

---

## Tech Stack

| Layer | Technology | Purpose |
|---|---|---|
| **Frontend** | Next.js 15, React, Tailwind CSS | Lead dashboard UI |
| **Backend** | Node.js, Express, REST API | Lead storage & auth |
| **AI** | OpenAI GPT-4o / Google Gemini | Lead analysis & scoring |
| **Automation** | n8n (Cloud) | Workflow orchestration |
| **Database** | Supabase (PostgreSQL) | Lead storage |
| **Notifications** | Telegram Bot API, WhatsApp (Meta API) | Sales alerts |
| **Deployment** | Vercel (frontend), Railway (backend) | Production hosting |

---

## Features

### ✅ Multi-channel Lead Capture
Webhooks from website forms, email parsing, Telegram bot, WhatsApp Business API, and direct CRM entries.

### ✅ AI Lead Scoring
Every lead is automatically classified with extracted data:
- **Intent** — BUY / RENT / INQUIRE / CONSULT
- **Budget** — extracted from natural language
- **Location** — parsed from message
- **Priority** — HIGH / MEDIUM / LOW with confidence score
- **Summary** — human-readable AI recommendation

### ✅ Instant Notifications
When a HIGH priority lead arrives, the sales team receives an instant formatted message on both Telegram and WhatsApp within seconds.

### ✅ Real-time Dashboard
Next.js dashboard showing:
- Live lead feed with AI scores
- Filter by priority, channel, date
- Lead detail view with full AI analysis
- Basic analytics (leads per day, conversion rate by channel)

### ✅ n8n Automation Workflow
Visual workflow showing the complete lead pipeline — easy to extend, demo-friendly, and recruiter-impressive.

---

## Project Structure

```
ai-lead-intelligence-system/
│
├── frontend/                  # Next.js 15 dashboard
│   └── src/
│       ├── app/               # App router pages
│       │   ├── page.tsx       # Dashboard home
│       │   └── leads/         # Lead detail pages
│       ├── components/        # React components
│       │   ├── ui/            # Base UI components
│       │   └── leads/         # Lead-specific components
│       ├── lib/               # Supabase client, utils
│       └── types/             # TypeScript types
│
├── backend/                   # Node.js REST API
│   └── src/
│       ├── routes/            # API endpoints
│       ├── middleware/        # Auth, validation
│       └── lib/               # Supabase, AI helpers
│
├── automation/                # n8n workflow exports
│   ├── workflows/
│   │   └── lead-pipeline.json # Importable n8n workflow
│   └── docs/                  # Workflow screenshots
│
├── docs/                      # Architecture & setup docs
│   └── screenshots/           # Dashboard screenshots
│
└── README.md
```

---

## Getting Started

### Prerequisites

- Node.js 20+
- A [Supabase](https://supabase.com) account (free tier)
- An [n8n Cloud](https://n8n.io) account (free tier)
- OpenAI API key or Google Gemini API key
- Telegram Bot token (from [@BotFather](https://t.me/BotFather))
- WhatsApp Business API access (Meta Developer account)

### 1. Clone the repo

```bash
git clone https://github.com/lukmanabdulhaq/ai-lead-intelligence-system.git
cd ai-lead-intelligence-system
```

### 2. Set up the database

Run the SQL in `backend/src/lib/schema.sql` in your Supabase SQL editor.

### 3. Configure environment variables

```bash
# backend/.env
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_KEY=your_service_key
OPENAI_API_KEY=your_openai_key
TELEGRAM_BOT_TOKEN=your_telegram_token
WHATSAPP_TOKEN=your_whatsapp_token
WHATSAPP_PHONE_NUMBER_ID=your_phone_id
PORT=3001

# frontend/.env.local
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
NEXT_PUBLIC_API_URL=http://localhost:3001
```

### 4. Run locally

```bash
# Backend
cd backend && npm install && npm run dev

# Frontend (new terminal)
cd frontend && npm install && npm run dev
```

### 5. Import n8n workflow

1. Open your n8n Cloud instance
2. Go to **Workflows → Import**
3. Upload `automation/workflows/lead-pipeline.json`
4. Add your credentials in n8n (OpenAI, Telegram, WhatsApp, Supabase)
5. Activate the workflow

### 6. Test it

Send a POST request to your n8n webhook URL:

```bash
curl -X POST https://your-n8n-instance.app.n8n.cloud/webhook/lead-intake \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Ahmed Al-Rashid",
    "message": "Looking for a 3-bedroom villa in Dubai Marina, budget $600k, need to move in 2 months",
    "email": "ahmed@example.com",
    "source": "web_form"
  }'
```

---

## n8n Workflow Overview

> 📸 _Workflow screenshot coming here_

The workflow consists of 6 nodes:

1. **Webhook** — receives incoming lead data from all sources
2. **AI Agent** — sends message to OpenAI/Gemini with scoring prompt
3. **Set fields** — maps AI output to structured lead object
4. **Supabase** — inserts scored lead into database
5. **IF node** — routes HIGH priority leads to notification branch
6. **Telegram + WhatsApp** — sends formatted alert to sales team

---

## Database Schema

```sql
-- leads table
create table leads (
  id          uuid primary key default gen_random_uuid(),
  name        text,
  email       text,
  phone       text,
  message     text not null,
  source      text not null,        -- web_form | telegram | whatsapp | email | crm
  intent      text,                 -- BUY | RENT | INQUIRE | CONSULT
  budget      text,
  location    text,
  timeline    text,
  priority    text not null,        -- HIGH | MEDIUM | LOW
  confidence  float,
  ai_summary  text,
  status      text default 'new',   -- new | contacted | qualified | closed
  created_at  timestamptz default now()
);
```

---

## Why This Project

This system demonstrates skills that startups and agencies are actively hiring for:

- **AI integration** — real prompt engineering with structured outputs
- **Automation engineering** — n8n workflow design with branching logic
- **Full-stack development** — Next.js frontend + Node.js API + database
- **API architecture** — webhook handling, REST endpoints, third-party integrations
- **Business thinking** — solves a real problem companies pay for

---

## Roadmap

- [ ] WhatsApp Business API integration (Meta Cloud API)
- [ ] Email parsing via n8n Gmail node
- [ ] Lead status tracking (new → contacted → qualified → closed)
- [ ] Analytics dashboard (conversion rates, source breakdown)
- [ ] Multi-tenant support (multiple businesses)
- [ ] CRM export (HubSpot / Airtable integration)

---

## Author

**Lukman Abdul Haq** — AI Automation & Full-Stack Engineer  
📍 Accra, Ghana · Remote-Ready · GMT+0  
📧 lukmanabdulhaq1@gmail.com  
🐙 [github.com/lukmanabdulhaq](https://github.com/lukmanabdulhaq)

---

_Built to demonstrate real-world AI automation engineering. Every component reflects production patterns used in live startup environments._
