# Gemini Journal & Reflections (ReflectAI)

A secure, production-grade personal journaling and cognitive AI reflection platform built with React 18, TypeScript, Tailwind CSS, Express, Google Cloud Firestore, Firebase Authentication, and the Google Gemini API (`@google/genai`).

---

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Environment Variables](#environment-variables)
- [Development](#development)
- [Linting and Type Checking](#linting-and-type-checking)
- [Testing & Functional Walkthrough](#testing--functional-walkthrough)
- [Production Build](#production-build)
- [Deployment](#deployment)
- [API & Backend Configuration](#api--backend-configuration)
- [Database & Security Rules](#database--security-rules)
- [Threat Model & Security](#threat-model--security)
- [Troubleshooting](#troubleshooting)
- [Git Workflow](#git-workflow)
- [Deployment Checklist](#deployment-checklist)

---

## Overview

**Gemini Journal & Reflections** (ReflectAI) provides a private, structured sanctuary for self-reflection and emotional clarity. Users maintain personal journal entries backed by tenant-isolated Cloud Firestore storage and engage in guided multi-turn dialogues with specialized AI personas powered by Google Gemini. The platform transforms raw thoughts into structured executive summaries, emotional theme metrics, and actionable micro-steps.

```text
┌─────────────────┐      ┌─────────────────────────┐      ┌─────────────────────────┐      ┌─────────────────────────┐
│   1. Reflect    │ ───► │  2. Cognitive Dialogue  │ ───► │  3. Executive Insights  │ ───► │   4. Meaningful Action  │
│ Distraction-free│      │  4 Guided AI Personas   │      │  Themes & Patterns      │      │  Tracked Micro-Steps    │
└─────────────────┘      └─────────────────────────┘      └─────────────────────────┘      └─────────────────────────┘
```

---

## Features

- **Distraction-Free Journal Editor**: Clean, responsive rich-text editor with mood indicators, category categorization, tag management, and real-time word counting.
- **Cognitive AI Dialogue with 4 Personas**:
  - *Socratic Explorer*: Uncovers assumptions and blind spots through thoughtful inquiries.
  - *Empathetic Listener*: Validates emotions and fosters self-compassion without premature judgment.
  - *Pattern Finder*: Identifies recurring cognitive, behavioral, or emotional habits.
  - *Practical Coach*: Deconstructs overwhelm into low-friction, high-leverage micro-actions.
- **Executive Synthesis & Emotional Analysis**: Synthesizes reflections into executive summaries, emotional distribution scores (0–100%), observed patterns, and deep philosophical questions.
- **Action Step Manager**: Converts AI suggestions and user intentions into trackable action items with priority flags (High, Medium, Low) and completion status.
- **Dynamic Prompt Generator ("Inspire Me")**: Generates context-aware, psychologically safe reflection questions based on the user's current mood and focus.
- **Analytics & Habit Tracking**: Tracks reflection streaks, weekly logging volume, word count analytics, and emotional balance distributions.
- **Data Export & Privacy Controls**: Full data portability with 1-click export to Markdown (`.md`) and JSON (`.json`), plus complete user data purge capabilities.
- **Dark & Light Mode**: Seamless theme switching with high-contrast accessibility across desktop and mobile devices.

---

## Tech Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend Framework** | React 18, TypeScript, Vite 6 |
| **Styling & UI** | Tailwind CSS v4, Lucide React Icons, Motion (Animations) |
| **Backend & Server** | Node.js (v20+), Express 4, tsx (dev), esbuild (production bundling) |
| **Database & Auth** | Google Cloud Firestore, Firebase Authentication (Google Federated Sign-In) |
| **AI & LLM** | Google Gemini API (`@google/genai`) with resilient model fallback ladder |
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
        ├── auth/
        │   └── AuthScreen.tsx    # Landing page and Google authentication gateway
        ├── common/
        │   ├── DeleteConfirmModal.tsx    # Destructive action confirmation dialog
        │   ├── ThreatModelModal.tsx      # Interactive 5-zone threat model viewer
        │   ├── Toast.tsx                 # Toast notification system
        │   └── WalkthroughGuideModal.tsx # Interactive test walkthrough guide
        ├── dashboard/
        │   └── DashboardView.tsx # Overview statistics, streak counter & recent entries
        ├── insights/
        │   └── InsightsView.tsx  # Executive summaries, theme metrics & action items
        ├── inspire/
        │   └── InspireMeView.tsx # Dynamic reflective prompt generator
        ├── journal/
        │   ├── JournalEditor.tsx # Reflection editor with mood selector & AI triggers
        │   └── JournalView.tsx   # Filterable list of all user journal entries
        ├── layout/
        │   └── AppShell.tsx      # Navigation sidebar, top bar, search & mobile drawer
        ├── reflections/
        │   └── AIReflectionView.tsx # Multi-turn conversational AI reflection interface
        └── settings/
            └── SettingsView.tsx  # User preferences, data export & account controls
```

---

## Prerequisites

Before setting up or running the project, ensure you have the following installed:

- **Node.js**: `v20.0.0` or higher (LTS recommended)
- **npm**: `v9.0.0` or higher
- **Google Cloud SDK (`gcloud` CLI)**: Installed and authenticated (`gcloud auth login`)
- **Google Cloud Project**: With billing enabled
- **Gemini API Key**: From [Google AI Studio](https://aistudio.google.com/)

---

## Installation

Follow these step-by-step instructions to set up the project from a fresh clone:

```bash
# 1. Clone the repository
git clone https://github.com/YOUR_USERNAME/gemini-journal-reflections.git

# 2. Enter the project directory
cd gemini-journal-reflections

# 3. Install dependencies
npm install

# 4. Create your local environment file
cp .env.example .env

# 5. Open .env and add your GEMINI_API_KEY
```

---

## Environment Variables

Configure your `.env` file based on `.env.example`:

| Variable | Required | Description | Example / Source |
| :--- | :--- | :--- | :--- |
| `GEMINI_API_KEY` | **Yes** | API key used for Gemini generation and fallback ladder | Generated in [Google AI Studio](https://aistudio.google.com/) |
| `APP_URL` | No | Base URL where the application is hosted | Automatically set by Cloud Run runtime |
| `PORT` | No | Server port (defaults to `3000`) | `3000` |
| `NODE_ENV` | No | Node environment mode (`development` or `production`) | `production` |

> **Security Note**: Never commit actual `.env` files or API keys to source control. Secret keys are managed dynamically in production via Google Cloud Secret Manager.

---

## Development

To start the full-stack development server with live reload and Vite middleware:

```bash
npm run dev
```

The application will be accessible at `http://localhost:3000`.

---

## Linting and Type Checking

Run the TypeScript type-checker to ensure zero syntax or compilation errors:

```bash
npm run lint
```

*(Executes `tsc --noEmit`)*

---

## Testing & Functional Walkthrough

To verify application stability across all user flows:

| Test ID | Area | Action | Expected Outcome |
| :--- | :--- | :--- | :--- |
| **TC-01** | Backend Health | `GET /api/health` | HTTP 200 OK: `{ "success": true, "data": { "status": "healthy" } }` |
| **TC-02** | Authentication | Click **Continue with Google** | Authenticates user via Google popup; isolated user document collection initialized. |
| **TC-03** | Entry Creation | Click **+ New Reflection**, enter title and content, select mood, click **Save** | Entry persisted to `/users/{userId}/entries/{entryId}` in Firestore and synced to Dashboard. |
| **TC-04** | AI Dialogue | Choose persona (e.g., **Socratic Explorer**) and send a message | Backend proxies prompt through Gemini fallback ladder; renders structured observation and question. |
| **TC-05** | Executive Insights | Click **Generate Insights** on a reflection | Produces 2–3 sentence executive summary, emotional theme bars, and suggested action items. |
| **TC-06** | Action Items | Click checkbox on an action item | Toggles completed state in Firestore and updates pending action counters. |
| **TC-07** | Prompt Generator | Click **Inspire Me** -> **Refresh Prompts** | Fetches 4 customized reflective prompts with direct reflection starting shortcuts. |
| **TC-08** | Data Export | In Settings, click **Export as Markdown** or **Export as JSON** | Triggers browser download of complete formatted journal archive. |
| **TC-09** | Deletion | Click **Delete** on an entry and confirm | Removes document from `/users/{userId}/entries/{entryId}`. |

---

## Production Build

To build the client SPA and bundle the Express server into a standalone CommonJS package:

```bash
npm run build
```

This compiles:
1. Client assets into `dist/` via `vite build`
2. Server backend into `dist/server.cjs` via `esbuild`

To launch the production server:

```bash
npm start
```

---

## Deployment

### Step 1: Enable Google Cloud Services

```bash
gcloud services enable \
  run.googleapis.com \
  artifactregistry.googleapis.com \
  secretmanager.googleapis.com \
  firestore.googleapis.com
```

### Step 2: Configure Secret Manager (Zero-Hardcoding)

```bash
# 1. Create the secret
gcloud secrets create GEMINI_API_KEY --replication-policy="automatic"

# 2. Add your secret payload
echo -n "YOUR_GEMINI_API_KEY" | gcloud secrets versions add GEMINI_API_KEY --data-file=-

# 3. Grant the Cloud Run runtime service account access
PROJECT_NUMBER=$(gcloud projects describe $(gcloud config get-value project) --format="value(projectNumber)")

gcloud secrets add-iam-policy-binding GEMINI_API_KEY \
  --member="serviceAccount:${PROJECT_NUMBER}-compute@developer.gserviceaccount.com" \
  --role="roles/secretmanager.secretAccessor"
```

### Step 3: Deploy Firestore Security Rules

Deploy the owner-isolated rules in `firestore.rules`:

```bash
firebase deploy --only firestore:rules
```

### Step 4: Deploy to Google Cloud Run

Deploy directly from source using Google Cloud Buildpacks:

```bash
gcloud run deploy reflect-ai-app \
  --source . \
  --region us-central1 \
  --allow-unauthenticated \
  --port 3000 \
  --set-secrets GEMINI_API_KEY=GEMINI_API_KEY:latest \
  --set-env-vars NODE_ENV=production
```

### Step 5: Apply Campaign Verification Label

```bash
gcloud run services update reflect-ai-app \
  --update-labels=dev-tutorial=cloud-run-ai-challenge \
  --region=us-central1
```

---

## API & Backend Configuration

The Express backend routes are declared in `server.ts` and handle Gemini inference and health checks:

- `GET /api/health` — Returns server health and timestamp.
- `POST /api/gemini/reflect` — Multi-turn cognitive dialogue with persona instructions.
- `POST /api/gemini/summarize` — Executive insight extraction and action suggestions.
- `POST /api/gemini/prompts` — Dynamic reflective question generation.

### Resilient Model Fallback Ladder

To guarantee uninterrupted service, all Gemini calls use `generateContentWithFallback` traversing:
1. `gemini-2.5-flash` (Primary fast model)
2. `gemini-2.5-flash-lite` (High-availability fallback)
3. `gemini-flash-latest` (Dynamic alias)
4. `gemini-2.5-pro` (Deep reasoning fallback)

---

## Database & Security Rules

Cloud Firestore is configured with strict user-level tenancy under `/users/{userId}`.

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if false;
    }

    function isSignedIn() {
      return request.auth != null;
    }

    function isOwner(userId) {
      return isSignedIn() && request.auth.uid == userId;
    }

    function isValidId(id) {
      return id is string && id.size() <= 128 && id.matches('^[a-zA-Z0-9_\\-]+$');
    }

    match /users/{userId} {
      allow get: if isOwner(userId) && isValidId(userId);
      allow create, update, delete: if isOwner(userId) && isValidId(userId);

      match /entries/{entryId} {
        allow list: if isOwner(userId);
        allow get: if isOwner(userId) && isValidId(entryId);
        allow create, update, delete: if isOwner(userId) && isValidId(entryId);
      }

      match /actions/{actionId} {
        allow list: if isOwner(userId);
        allow get: if isOwner(userId) && isValidId(actionId);
        allow create, update, delete: if isOwner(userId) && isValidId(actionId);
      }

      match /preferences/{prefId} {
        allow list: if isOwner(userId);
        allow get: if isOwner(userId) && isValidId(prefId);
        allow create, update, delete: if isOwner(userId) && isValidId(prefId);
      }

      match /insights/{insightId} {
        allow list: if isOwner(userId);
        allow get: if isOwner(userId) && isValidId(insightId);
        allow create, update, delete: if isOwner(userId) && isValidId(insightId);
      }
    }
  }
}
```

---

## Threat Model & Security

| Zone | Vulnerability Risk | Mitigating Countermeasure |
| :--- | :--- | :--- |
| **1. Input Surfaces** | Prompt injection, payload buffer overflow | Request body size limits (10MB), defensive destructuring, client-side escaping. |
| **2. Planning & Reasoning** | Persona hijacking, system override | Explicit system boundaries, validated JSON schema parsing for insights. |
| **3. Tool Execution** | SSRF, privilege escalation | Zero dynamic code evaluation (`eval`); all outputs rendered as safe text/markdown. |
| **4. Memory & State** | Cross-tenant data leakage | Firestore rules enforcing `request.auth.uid == userId` across all subcollections. |
| **5. Inter-System Comm** | API key leaks | Secret Manager injection, server-side-only Gemini calls (`GEMINI_API_KEY`). |

---

## Troubleshooting

- **Firestore Permission Errors (`Missing or insufficient permissions`)**:
  - Ensure the user is signed in.
  - Verify that `firestore.rules` is deployed and uses separate `allow list` and `allow get` clauses.
- **Gemini API Error (`GEMINI_API_KEY is not set`)**:
  - Check that `GEMINI_API_KEY` is present in your `.env` file locally or injected from Secret Manager in Cloud Run.
- **Build Failure (`vite: not found` or `esbuild error`)**:
  - Run `npm install` to ensure all build dependencies are present.
- **Port Binding Issues in Container**:
  - The server binds to host `0.0.0.0` and respects `process.env.PORT` (defaulting to `3000`).

---

## Git Workflow

```bash
# 1. Create a feature branch
git checkout -b feature/your-feature-name

# 2. Make changes and verify
npm run lint
npm run build

# 3. Commit changes
git add .
git commit -m "feat: description of your change"

# 4. Push to remote
git push -u origin feature/your-feature-name

# 5. Open a Pull Request on GitHub
```

---

## Deployment Checklist

- [x] Dependencies installed and locked
- [x] Environment variables documented in `.env.example`
- [x] TypeScript linting and type-check passes (`npm run lint`)
- [x] Production build compiles cleanly (`npm run build`)
- [x] Firestore security rules deployed and tenant-isolated
- [x] Resilient Gemini model fallback ladder configured
- [x] Zero hardcoded credentials in codebase
- [x] Automated challenge label applied (`dev-tutorial=cloud-run-ai-challenge`)
- [x] README.md updated with accurate configuration and commands
