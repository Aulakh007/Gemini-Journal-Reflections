# 🌟 ReflectAI — Gemini Journal & Reflections Dashboard

A secure, full-stack journaling and multi-turn AI cognitive reflection web application powered by **Firebase Authentication (Google Sign-In)**, **Cloud Firestore** with owner-isolated security rules, and the **Gemini 3.6 Flash API** with automated fallback resilience.

---

## 📐 System Architecture

```text
┌──────────────────────────────────────────────────────────────────────────┐
│                             Client Browser                               │
│  React 18 + Vite + Tailwind CSS + Lucide Icons + Firebase Client SDK     │
└──────────────┬───────────────────────────────────────────┬───────────────┘
               │                                           │
  (Auth & Isolated CRUD)                      (AI Inference & Insights)
               │                                           │
               ▼                                           ▼
┌───────────────────────────────┐           ┌───────────────────────────────┐
│     Google Cloud Firestore    │           │      Google Cloud Run         │
│  Owner-Isolated Security Rules│           │  Express REST API + SSR Serv  │
│  /users/{userId}/entries/...  │           │  Binds 0.0.0.0:${PORT:-3000}  │
└───────────────────────────────┘           └──────────────┬────────────────┘
                                                           │
                                             (GCP Secret Manager Injected)
                                                           │
                                                           ▼
                                            ┌───────────────────────────────┐
                                            │      Google Gemini API        │
                                            │  gemini-3.6-flash (Primary)   │
                                            │  gemini-3.1-flash-lite (HA)   │
                                            │  gemini-flash-latest (Alias)  │
                                            │  gemini-3.7-flash (Reasoning) │
                                            └───────────────────────────────┘
```

---

## 🛡️ Agentic Threat Modeling & Security Posture

| Threat Zone | Risk Description | Applied Countermeasure |
| :--- | :--- | :--- |
| **Input Surfaces** | Malformed JSON payloads or prompt injection | Schema validation, length caps, defensive null-safe destructuring, and isolated system instructions. |
| **Planning & Reasoning** | System prompt bypass / jailbreaks | Distinct cognitive system persona isolation with strict output guardrails. |
| **Tool Execution** | Unauthorized administrative actions / SSRF | No dynamic code execution; all AI actions are bounded to read-only text analysis. |
| **Memory & State** | Cross-tenant data leaks and unauthorized database access | Firestore rules enforcing `request.auth.uid == userId` under `/users/{userId}/...`. |
| **Inter-System Comm** | API key leaks or single-point-of-failure outages | Zero-hardcoding via Google Cloud Secret Manager and 4-tier model fallback ladder. |

---

## 📋 Prerequisites

- **Google Cloud Platform (GCP) Account** with an active project and billing enabled.
- **Google Cloud SDK (`gcloud` CLI)** installed and authenticated (`gcloud auth login`).
- **Node.js (v20+) & npm** for local development.
- **Git** installed.

---

## 🛠️ Step-by-Step Deployment & Configuration

### Step 1: Enable Google Cloud APIs
```bash
gcloud services enable \
  run.googleapis.com \
  artifactregistry.googleapis.com \
  secretmanager.googleapis.com \
  firestore.googleapis.com
```

---

### Step 2: Configure Secret Manager (Zero Hardcoding)
```bash
# 1. Create the GEMINI_API_KEY secret in Google Cloud Secret Manager
gcloud secrets create GEMINI_API_KEY --replication-policy="automatic"

# 2. Add your secret payload
echo -n "YOUR_GEMINI_API_KEY" | gcloud secrets versions add GEMINI_API_KEY --data-file=-

# 3. Grant Cloud Run runtime service account access to read the secret
PROJECT_NUMBER=$(gcloud projects describe $(gcloud config get-value project) --format="value(projectNumber)")

gcloud secrets add-iam-policy-binding GEMINI_API_KEY \
  --member="serviceAccount:${PROJECT_NUMBER}-compute@developer.gserviceaccount.com" \
  --role="roles/secretmanager.secretAccessor"
```

---

### Step 3: Configure Cloud Firestore Security Rules

Deploy the tenant-isolated security rules to Firestore:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId}/interactions/{interactionId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    match /users/{userId}/{document=**} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

---

### Step 4: Deploy Container to Google Cloud Run

Deploy the application source directly using Google Cloud Buildpacks:

```bash
gcloud run deploy reflect-ai-app \
  --source . \
  --region us-central1 \
  --allow-unauthenticated \
  --port 3000 \
  --set-secrets GEMINI_API_KEY=GEMINI_API_KEY:latest \
  --set-env-vars NODE_ENV=production
```

---

### Step 5: Apply Required Campaign Verification Label

Register the service for automated challenge verification:

```bash
gcloud run services update reflect-ai-app \
  --update-labels=dev-tutorial=cloud-run-ai-challenge \
  --region=us-central1
```

---

## 🐙 Sharing on GitHub

To push this repository to GitHub:

```bash
# 1. Initialize git (if not already initialized)
git init

# 2. Stage all files (sensitive keys are safely excluded by .gitignore)
git add .

# 3. Commit the code
git commit -m "feat: complete ReflectAI full-stack journaling and reflections app"

# 4. Link your remote GitHub repository
git remote add origin https://github.com/YOUR_USERNAME/reflect-ai-app.git

# 5. Push to GitHub
git branch -M main
git push -u origin main
```

---

## 🧪 Functional Verification & Walkthrough

| Test Case | Feature | User Action | Expected Result |
| :--- | :--- | :--- | :--- |
| **TC-01** | Health Check | `GET /api/health` | HTTP 200 OK: `{ status: "ok" }` |
| **TC-02** | Google Sign-In | Click **Sign In with Google** | Authenticates user; isolated user document collection initialized. |
| **TC-03** | Journal Entry Creation | Click **New Entry**, write reflection, click **Save Reflection** | Saves to `/users/{userId}/entries/{entryId}` in Firestore with real-time UI sync. |
| **TC-04** | AI Multi-Turn Dialogue | Select **Socratic Explorer** persona and send a message | Backend proxies prompt to Gemini 3.6 Flash fallback ladder and renders reply. |
| **TC-05** | Executive Synthesis | Click **Generate Summary & Insights** | Returns Executive Summary, emotional themes, and action items. |
| **TC-06** | Prompt Generator | Click **Inspire Me** | Generates 4 mood-tailored reflective questions. |
| **TC-07** | Deletion & Privacy | Click **Delete** on an entry and confirm | Removes entry from Firestore and UI. |

---

## 💻 Local Development

```bash
# Install dependencies
npm install

# Start the full-stack development server
npm run dev

# Build production bundle
npm run build

# Start the production server
npm start
```

