# SafeShe

## AI-Powered Women Safety & Prevention Platform

> **"Safety shouldn't begin after something happens."**

SafeShe is a smart safety platform designed to help users assess risks, find safer routes, and access emergency-response features. Built to protect women across all three critical phases of personal safety: **BEFORE AN INCIDENT → DURING AN INCIDENT → AFTER AN INCIDENT**.

🚀 **Live Demo:** [https://safe-she-6mvb.vercel.app/](https://safe-she-6mvb.vercel.app/)

---

## 🌟 Key Features

### 1. BEFORE AN INCIDENT (Prevention & Risk Intelligence)
- **AI Safety Risk Map (`/safety-map`):** Multi-factor analysis assessing lighting, crowd levels, proximity to emergency services, and historical reports.
- **Safer Route Comparison:** Evaluates multiple paths (Route A: Fastest vs Route B: Safer Alternative vs Route C: Shortcut) with explicit explanatory risk reasons.
- **Aggregated Safety Heatmap:** Visualizes crowdsourced unsafe area report density with category & time filters.
- **Unsafe Area Reporting (`/report`):** Categorized incident reporting (Harassment, Poor lighting, Stalking, Isolated area, Unsafe transport) with optional photos and anonymous reporting.
- **Verified Volunteer Helpers Directory:** Network of approved responders with availability tracking.

### 2. DURING AN INCIDENT (Real-Time Monitoring & SOS)
- **Safe Journey Tracker (`/journey`):** Real-time GPS path tracking with expected arrival countdown timers.
- **Automated Anomaly Detection:** Detects unexpected route deviations, prolonged stationary stops, and journey delay timeouts.
- **Interactive Safety Check Prompt:** Prompts user *"Your journey appears delayed. Are you okay?"* with a 30-second countdown before automatic emergency contact escalation.
- **Emergency SOS Command Center (`/emergency`):**
  - **Hold 3 Seconds to Activate:** Radial progress ring with tactile feedback.
  - **Silent SOS:** Triggered via hidden button or `Alt+Shift+S` keyboard shortcut.
  - **Voice SOS:** Local Web Speech API recognition for trigger phrases (*"Help"*, *"Emergency"*, *"Bachao"*, *"Madad"*).
  - **Real Emergency Guardian Calling:** Initiates automated voice phone calls and status tracking to verified emergency contacts.
- **Tokenized Real-Time Location Sharing (`/share/journey/[token]`):** Secure temporary tracking links for trusted contacts without requiring user login.

### 3. AFTER AN INCIDENT (Evidence & Legal Support)
- **Secure Evidence Vault (`/evidence`):** Encrypted storage for photos, video clips, audio recordings, and legal PDFs.
- **SHA-256 Cryptographic Hash Verification:** Every file generates an immutable digital signature stamp for legal audit integrity.
- **AI Incident Assistant (`/incidents/new`):** Converts unstructured user narratives into structured fields (Incident type, Time, Location, Suspects, Sequence of events, Action taken).
- **Emergency Resource Directory (`/resources`):** Location-aware 24/7 helplines, police cells, trauma hospitals, and legal aid across India.
- **Privacy Center (`/privacy`):** Full user control to stop location tracking, revoke shared tokens, export data JSON, and clear history.

---

## 🏗️ Architecture & Tech Stack

- **Frontend:** Next.js (App Router), TypeScript, Tailwind CSS, Lucide Icons
- **Database & ORM:** Prisma ORM with SQLite database for out-of-the-box execution
- **Authentication & Roles:** Session JWT authentication supporting 3 roles (`USER`, `VERIFIED_HELPER`, `ADMIN`) + instant Demo Role Switcher
- **Map Service Abstraction:** Interactive Leaflet canvas supporting dark vector tiles, heatmaps, custom markers, and real OSRM road geometry route polylines
- **Telephony & Emergency Calling:** Twilio Voice REST API integration for real-time automated guardian calling and status webhooks
- **AI Service Abstraction:** Google Gemini API with fallback NLP rule-based parser
- **Notification Service Abstraction:** Multi-channel notification pipeline (`EmailProvider`, `SMSProvider`, `WhatsAppProvider`, `MockNotificationProvider`)
- **Storage Service:** Private vault storage simulator with cryptographic SHA-256 integrity generation

---

## ⚡ Quick Start Guide

### 1. Installation

```bash
git clone https://github.com/vidhi992/SafeShe.git
cd safeshe
npm install
```

### 2. Environment Variables

Create a `.env` file in the root directory:

```env
DATABASE_URL="file:./dev.db"
JWT_SECRET="safeshe-super-secret-jwt-key-2026-development-mode"
NEXT_PUBLIC_APP_URL="http://localhost:3000"

# Optional API Keys (Falls back cleanly if omitted)
GEMINI_API_KEY=""
NEXT_PUBLIC_MAPBOX_TOKEN=""
TWILIO_ACCOUNT_SID=""
TWILIO_AUTH_TOKEN=""
TWILIO_PHONE_NUMBER=""
```

### 3. Database Setup & Seeding

```bash
# Push Prisma schema and seed database
npx prisma db push
npm run db:seed
```

### 4. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🎭 Demo Mode & Quick Roles

SafeShe includes an integrated **DEMO MODE** banner at the top of every page. You can instantly switch between test roles:

1. **User Role (Sophia Sharma):** Access dashboard, start journey, trigger SOS, upload evidence.
2. **Helper Role (Priya Patel):** Access `/helpers` portal, toggle on-duty status, accept nearby requests.
3. **Admin Role (Elena Vance):** Access `/admin` dashboard, verify helpers, moderate safety reports.

---

## 🔒 Security & Privacy Features

- **No Public Location Endpoints:** User exact coordinates are never exposed publicly without a valid secure token.
- **Signed Temporary Access Tokens:** Shared journey URLs expire automatically.
- **Tamper-Proof Evidence:** SHA-256 hash checks prevent silent file alteration.
- **Server-Side Authorization:** Admin and helper routes enforce server-side session checks.
