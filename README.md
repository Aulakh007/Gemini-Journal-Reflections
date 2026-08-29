# Gemini Journal & Reflections (ReflectAI)

A secure, production-grade personal journaling and cognitive reflection intelligence platform built with React 18, TypeScript, Tailwind CSS, Express, Google Cloud Firestore, Firebase Authentication, Google Maps Platform Places search, and the Google Gemini API (`@google/genai`).

---

## Table of Contents

- [Overview](#overview)
- [Architecture & Key Capabilities](#architecture--key-capabilities)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Prerequisites](#prerequisites)
- [Installation & Local Setup](#installation--local-setup)
- [Environment Variables](#environment-variables)
- [Development Workflow](#development-workflow)
- [Verification & Quality Assurance](#verification--quality-assurance)
- [Testing & Functional Walkthrough](#testing--functional-walkthrough)
- [Production Build](#production-build)
- [Google Cloud Run Deployment](#google-cloud-run-deployment)
- [Database Architecture & Firestore Security Rules](#database-architecture--firestore-security-rules)
- [Agentic Threat Model & OWASP Mitigations](#threat-model--owasp-mitigations)
- [Troubleshooting](#troubleshooting)

---

## Overview

**ReflectAI** transforms unstructured self-reflection into actionable cognitive clarity. It serves as a personal reflection intelligence sanctuary where users record private reflections, anchor environmental context (via Google Places search), engage in multi-turn dialogues with specialized philosophical and coaching personas, synthesize longitudinal patterns across entries over time, and export actionable micro-steps.

```text
┌─────────────────┐      ┌─────────────────────────┐      ┌─────────────────────────┐      ┌─────────────────────────┐
│   1. Reflect    │ ───► │  2. Cognitive Dialogue  │ ───► │  3. Pattern Discovery   │ ───► │   4. Meaningful Action  │
│  Location Context│     │  6 Guided AI Personas   │      │  Longitudinal Trends    │      │  Tracked Micro-Steps    │
└─────────────────┘      └─────────────────────────┘      └─────────────────────────┘      └─────────────────────────┘
```

---

## Architecture & Key Capabilities

1. **Distraction-Free Journaling with Optional Location Anchoring**:
   - Clean, high-contrast writing environment with mood indicators and tag manager.
   - Privacy-conscious location selection (Cafe, Park, Studio, Home) via Google Maps Platform Places search without background GPS snooping.
2. **Interactive Temporal & Environmental Timeline**:
   - Chronological reflection stream grouped by date.
   - Filter by mood, search query, or entries with attached location environments.
3. **6 Guided Cognitive AI Personas**:
   - *Socratic Explorer*: Uncovers underlying assumptions and questions blind spots.
   - *Empathetic Listener*: Validates emotions and fosters self-compassion.
   - *Pattern Finder*: Highlights recurring triggers and behavioral habits.
   - *Practical Coach*: Deconstructs thoughts into immediate, grounded micro-steps.
   - *Perspective Shifter*: Reframes situations from outside stakeholder and inverted lenses.
   - *Future Self*: Provides long-term horizon clarity from 5–10 years in the future.
4. **Longitudinal Pattern Discovery**:
   - Synthesizes recurring cognitive cycles, emotional trajectories, and environmental habits.
   - Grounded in concrete evidence with reflection counts, date ranges, and 1-click micro-actions.
5. **Executive Synthesis & Emotional Balance Analysis**:
   - Generates structured executive summaries and emotional theme distribution scores (0–100%).
6. **External Webhook Notifications (Slack / Discord / Custom)**:
   - Configurable webhook dispatch with privacy mode options (Minimal Metadata vs Full Summary).
7. **Platform Observability & System Health**:
   - Real-time uptime telemetry, Gemini API latency tracker, model fallback ladder, and RBAC isolation validator.
8. **Data Portability & Zero-Leakage Privacy**:
   - 1-click full export to Markdown (`.md`) and JSON (`.json`), plus secure single-click data wipe.

---

## Tech Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend Framework** | React 18, TypeScript, Vite 6 |
| **Styling & UI** | Tailwind CSS v4, Lucide React Icons, Motion |
| **Backend & Server** | Node.js (v20+), Express 4, tsx (dev), esbuild (production bundling) |
| **Database & Auth** | Google Cloud Firestore, Firebase Authentication (Google Federated Sign-In) |
| **AI & LLM** | Google Gemini API (`@google/genai`) with 4-tier resilient model fallback ladder |
| **Maps & Places** | Google Maps Platform Places Text Search API |
| **Cloud Runtime** | Google Cloud Run, Google Cloud Secret Manager, Cloud Buildpacks |

---

## Project Structure

```text
├── .env.example                  # Environment variable reference template
├── firebase-applet-config.json   # Firebase project configuration
├── firebase-blueprint.json       # Database schema and security blueprint
├── firestore.rules               # Production Firestore owner-bound security rules
├── index.html                    # Single-page entry HTML with OpenGraph metadata
├── metadata.json                 # AI Studio application manifest & capabilities
├── package.json                  # NPM dependencies and build scripts
├── server.ts                     # Express server, Gemini proxy & Vite SSR middleware
├── tsconfig.json                 # TypeScript compiler configuration
├── vite.config.ts                # Vite build and Tailwind plugin configuration
└── src/
    ├── main.tsx                  # React DOM root entry point
    ├── App.tsx                   # Main state orchestrator, auth listener & tab router
    ├── types.ts                  # Shared TypeScript interfaces, types, and enums
    ├── index.css                 # Global CSS and Tailwind directives
    ├── lib/
    │   └── firebase.ts           # Firebase SDK initialization & error handlers
    ├── services/
    │   └── firestoreService.ts   # Firestore CRUD, real-time subscriptions & payload sanitizers
    └── components/
        ├── admin/
        │   └── AdminView.tsx     # Platform observability & security metrics
        ├── auth/
        │   └── AuthScreen.tsx    # Landing page and Google authentication gateway
        ├── common/
        │   ├── DeleteConfirmModal.tsx    # Destructive action confirmation dialog
        │   ├── ThreatModelModal.tsx      # Interactive 5-zone threat model viewer
        │   ├── Toast.tsx                 # Toast notification system
        │   └── WalkthroughGuideModal.tsx # End-to-end user verification guide
        ├── dashboard/
        │   └── DashboardView.tsx # Overview statistics, streaks, and recent activity
        ├── insights/
        │   └── InsightsView.tsx  # Executive summaries & action item tracker
        ├── inspire/
        │   └── InspireMeView.tsx # Dynamic reflection prompt generator
        ├── journal/
        │   ├── JournalEditor.tsx # Rich distraction-free journal writer
        │   ├── JournalView.tsx   # Filterable journal archives & search
        │   └── LocationPickerModal.tsx # Google Places location selector
        ├── layout/
        │   └── AppShell.tsx      # Sidebar, top navigation bar, mobile drawer
        ├── patterns/
        │   └── PatternsView.tsx  # Longitudinal AI pattern discovery
        ├── reflections/
        │   └── AIReflectionView.tsx # 6-Persona multi-turn cognitive dialogue
        ├── settings/
        │   └── SettingsView.tsx  # Theme, preferences, webhooks & data export
        └── timeline/
            └── TimelineView.tsx  # Chronological & location reflection timeline
```

---

## Environment Variables

Copy `.env.example` to `.env` or configure runtime environment secrets:

```bash
# Server-side Gemini API key (Required for AI features)
GEMINI_API_KEY=your_gemini_api_key_here

# Client-side Google Maps API key (For location search)
VITE_GOOGLE_MAPS_API_KEY=your_google_maps_api_key_here

# Firebase Configuration
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

---

## Development Workflow

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Start unified dev server**:
   ```bash
   npm run dev
   ```
   The dev server binds to `0.0.0.0:3000` with Express backend API routes and Vite frontend integration.

---

## Verification & Quality Assurance

Run type check and build verification:

```bash
npm run build
```

---

## Testing & Functional Walkthrough

To verify all system features end-to-end:

1. **Authentication**:
   - Click "Sign In with Google" to authenticate into your isolated tenant partition.
2. **Distraction-Free Journal & Location**:
   - Click "+ New Reflection", type title/body, pick a mood (e.g., "Inspired"), and click "Add Location" to select a place (e.g., "Central Park Library").
   - Click "Save Reflection" and verify the toast confirmation.
3. **Temporal Timeline**:
   - Navigate to "Timeline". Filter by mood and verify that the location badge is visible.
4. **Cognitive AI Dialogue (6 Personas)**:
   - Go to "AI Explorer", select "Perspective Shifter" or "Future Self", and click "Reflect on this entry".
   - Notice the structured Observation, Question, and Next Step format.
5. **Pattern Discovery**:
   - Go to "Pattern Discovery" and click "Discover Patterns".
   - Inspect synthesized themes and click "Add to Actions" on any recommended micro-step.
6. **Executive Insights & Actions**:
   - Navigate to "Insights & Actions", check off completed steps, and observe the streak score.
7. **Webhooks & Observability**:
   - Visit "Platform & Admin" to inspect live latency.
   - Go to "Settings", enable Webhook Notifications, input a webhook URL, and click "Test Ping".

---

## Production Build

Compile the client SPA and bundled CommonJS server:

```bash
npm run build
```

Outputs:
- `dist/` containing optimized static client assets.
- `dist/server.cjs` containing the bundled standalone Node.js server.

---

## Google Cloud Run Deployment

Deploy ReflectAI directly to Google Cloud Run with the required campaign verification label:

### 1. Enable Required Cloud APIs

```bash
gcloud services enable \
  run.googleapis.com \
  secretmanager.googleapis.com \
  firestore.googleapis.com \
  cloudbuild.googleapis.com
```

### 2. Configure Secret Manager for Gemini API Key

```bash
# Create and populate secret
gcloud secrets create GEMINI_API_KEY --replication-policy="automatic"
echo -n "YOUR_GEMINI_API_KEY" | gcloud secrets versions add GEMINI_API_KEY --data-file=-

# Grant Cloud Run service account access to read the secret
gcloud secrets add-iam-policy-binding GEMINI_API_KEY \
  --member="serviceAccount:YOUR_PROJECT_NUMBER-compute@developer.gserviceaccount.com" \
  --role="roles/secretmanager.secretAccessor"
```

### 3. Deploy to Cloud Run

```bash
gcloud run deploy reflectai \
  --source . \
  --region us-central1 \
  --allow-unauthenticated \
  --port 3000 \
  --set-secrets GEMINI_API_KEY=GEMINI_API_KEY:latest \
  --update-labels dev-tutorial=cloud-run-ai-challenge
```

### 4. Verify Campaign Label

```bash
gcloud run services describe reflectai \
  --region us-central1 \
  --format="value(metadata.labels)"
```

---

## Database Architecture & Firestore Security Rules

All Firestore documents enforce user-bound path isolation. Deploy the following security rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // User Profile Document
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
      
      // Journal Entries Subcollection
      match /entries/{entryId} {
        allow read, write: if request.auth != null && request.auth.uid == userId;
      }
      
      // Action Items Subcollection
      match /actions/{actionId} {
        allow read, write: if request.auth != null && request.auth.uid == userId;
      }
      
      // Reflection Patterns Subcollection
      match /patterns/{patternId} {
        allow read, write: if request.auth != null && request.auth.uid == userId;
      }
      
      // External Integrations / Webhooks Subcollection
      match /integrations/{integrationId} {
        allow read, write: if request.auth != null && request.auth.uid == userId;
      }
      
      // User Preferences Subcollection
      match /preferences/{prefId} {
        allow read, write: if request.auth != null && request.auth.uid == userId;
      }
    }
  }
}
```

---

## Agentic Threat Model & OWASP Mitigations

| Threat Zone | Identified Risks | Countermeasures & Defenses |
| :--- | :--- | :--- |
| **1. Input Surfaces** | Malicious prompt injection, oversized request bodies, XSS. | Top-level body parsing (10MB limit), strict schema validation, input sanitization, React DOM escaping. |
| **2. Planning & Reasoning** | System instruction overrides, persona hijacking. | Strict system guardrails, schema enforcement, structured output parsing. |
| **3. Tool Execution** | SSRF, privilege escalation, unverified API calls. | Strict webhook destination validation (HTTPS only), parameterized endpoints, no dynamic eval. |
| **4. Memory & State** | Cross-tenant data snooping, unauthorized document reads. | Owner-bound security rules (`request.auth.uid == userId`) on all subcollections; zero wildcard defaults. |
| **5. Inter-System Communication** | Gemini API key leakage, token exposure. | Secret Manager injection, server-side API proxying, zero hardcoded credentials in client bundles. |

---

## Troubleshooting

- **Firestore Permission Denied**: Ensure `firestore.rules` is deployed and that the user is authenticated via Google Firebase Auth.
- **Gemini API Errors**: The backend automatically falls back across `gemini-3.6-flash` ➔ `gemini-3.1-flash-lite` ➔ `gemini-flash-latest` ➔ `gemini-3.7-flash`. Ensure `GEMINI_API_KEY` is configured in your environment or Secret Manager.
- **Port Ingress**: Ensure the server binds to `0.0.0.0:3000`.
