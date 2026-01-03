# American Iron Portal

A production-ready Sales & Customer Portal built for the edge.

## Tech Stack
- **Frontend:** React + TypeScript + Tailwind (Vite)
- **Backend:** Cloudflare Pages Functions
- **Database:** Postgres (Neon/Supabase) via Drizzle ORM
- **AI:** Google Gemini (Server-side)
- **Storage:** Cloudflare R2 (PDFs/Docs)

## Project Structure
- `/src`: Frontend React application.
- `/functions`: Backend API routes (Cloudflare Workers runtime).
- `/db`: Database schema and migrations.

## Getting Started

### 1. Installation
```bash
npm install
```

### 2. Local Development
```bash
# Starts Vite frontend + Wrangler pages proxy for functions
npm run dev
```

### 3. Database Setup (Drizzle)
1. Set `DATABASE_URL` in `.env`
2. Run migrations: `npx drizzle-kit push:pg`
3. Seed data: `npm run seed` (See `scripts/seed.ts` - create this based on types)

## Deployment (Cloudflare Pages)

1. **Connect Repo:** Link this GitHub repo to Cloudflare Pages.
2. **Build Settings:**
   - Framework: `Vite`
   - Command: `npm run build`
   - Output directory: `dist`
3. **Environment Variables (Settings -> Environment):**
   - `DATABASE_URL`: Connection string for Neon/Supabase (Pool mode recommended).
   - `GEMINI_API_KEY`: Your Google AI Studio key.
   - `STRIPE_SECRET_KEY`: For payment processing.
   - `TWILIO_ACCOUNT_SID`: For SMS.
4. **Functions:** Cloudflare automatically deploys the `/functions` directory as routing.

## Phasing Plan

### Phase 1: MVP (2 Weeks)
*Goal: Digitalize the quoting process and replace manual PDF creation.*

**Scope:**
- **Auth:** Admin/Sales/Customer roles.
- **CRM:** Basic Customer/Contact management.
- **Quoting:** Create, Edit, PDF View (Print), Send (Email trigger).
- **Invoicing:** Convert Quote to Invoice, Stripe Payment Link.
- **AI:** Basic "Next Action" suggestion based on mock history.

**Day-by-Day:**
- **Days 1-3:** Repo setup, DB Schema, Auth (Cookies).
- **Days 4-7:** Quote Builder UI, PDF Print CSS, Email integration.
- **Days 8-10:** Customer Portal (View Quote, Accept button).
- **Days 11-14:** Testing, Stripe Webhook, Deploy.

### Phase 2: Enhancements
- **Logistics:** Shipping calculator integration.
- **Advanced AI:** Weekly automated campaign generation + approval workflow.
- **WhatsApp:** Twilio integration for instant messaging.
- **QuickBooks:** CSV export or API integration.
- **Mobile App:** PWA improvements.

## Testing
Run critical flow tests:
```bash
npm test
```
Tests cover: Quote calculations, Auth guards, API response formats.
