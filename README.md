# DIGITAL DARK SPOT
## AI-Assisted Information Gap Detection Platform
### Shinchan Online Hackathon 2026 – Official Project Submission

[![Hackathon: Shinchan 2026](https://img.shields.io/badge/Hackathon-Shinchan_Online_2026-blue.svg)](https://unista.hackathons)
[![Tech: React 19 + Express + Gemini 3.8 Flash](https://img.shields.io/badge/Tech-React_19_|_Express_|_Gemini_3.8_Flash-cyan.svg)]()
[![Security: SSRF Protected](https://img.shields.io/badge/Security-SSRF_Defended-emerald.svg)]()

> **"Ordinary search engines summarize what is written. Digital Dark Spot reveals what is missing, contradictory, or outdated before high-stakes decisions are made."**

---

## 1. Problem Statement 

In high-stakes academic, career, and civic processes—such as applying for competitive scholarships, college admissions, internships, or government schemes—users routinely consult multiple websites, notifications, and advisories.

However, standard search engines and modern LLM chatbots only answer: **"What does this document say?"**

They suffer from severe **omission blindness**:
1. **Hidden Information Gaps (Digital Dark Spots):** If three documents all omit the academic renewal criteria or the disqualification clause, summarizers remain silent.
2. **Unflagged Cross-Source Contradictions:** One advisory mandates original hardcopies by post, while the latest university portal dictates paperless PDF uploads only.
3. **Obsolete Application Cycles:** Outdated 2024–25 circulars with lower income ceilings rank on search engines alongside active 2026–27 guidelines without explicit cycle demarcation.

**Digital Dark Spot** is an evidence-based intelligence platform designed to systematically identify what is absent, conflicting, or stale across a corpus of research sources.

---

## 2. Key Features

- **Information Gap Detection (Dark Spots):** Evaluates provided sources against domain-specific requirement checklists (Eligibility, Documents, Deadlines, Renewal Rules, Limitations, Contact Helpdesks). Clearly states that information was *not found in reviewed sources*, avoiding universal negative fallacies.
- **Cross-Source Contradiction Spotter:** Compares extracted parameters (CGPA cutoffs, monetary limits, submission modes) across distinct sources. Distinguishes genuine contradictions from changes caused by different application cycles (e.g. 2024–25 vs 2026–27).
- **Outdated Information Sentinel:** Categorizes sources into `Current`, `Potentially Outdated`, `Undated`, or `Date Unavailable` based on publication timestamps and academic cycle tokens.
- **Verifiable Evidence Trail:** Zero hallucinated citations. Every extracted claim is anchored to exact quotations, source URLs, and publication dates.
- **Explainable Completeness Score:** Mathematically calculated as:
  $$\text{Completeness} = \left(\frac{\text{Answered Questions} + 0.5 \times \text{Partially Answered}}{\text{Total Domain Benchmark Questions}}\right) \times 100$$
  Accompanied by a transparent disclaimer that it measures benchmark coverage rather than omniscience.
- **Priority-Based Verification Checklist:** Generates an actionable task list ranked into `High`, `Medium`, and `Low` priority with interactive completion checkboxes and persistence.
- **Exportable Reports:** One-click Print/Save as PDF, Markdown report download, and raw JSON export.
- **SSRF Defense:** Prevents Server-Side Request Forgery by rejecting localhost, loopbacks, RFC 1918 private subnets, cloud metadata endpoints (`169.254.169.254`), and non-HTTP protocols during live URL ingestion.

---

## 3. Technology Stack

- **Frontend:** React 19, Tailwind CSS v4, Lucide Icons, Fetch API.
- **Backend:** Node.js, Express.js 4 (full-stack server with Vite middleware integration).
- **AI Integration:** `@google/genai` TypeScript SDK (Gemini 3.8 Flash model) with strict JSON output schemas, complemented by a deterministic heuristic NLP engine for offline resilience.
- **Security:** Strict URL sanitization and SSRF IP blacklisting.

---

## 4. Architecture Diagram

```
┌────────────────────────────────────────────────────────┐
│                   User Interface                       │
│    Landing Page • Dashboard • New Research • Reports   │
└───────────────────────────┬────────────────────────────┘
                            │ Fetch API (JSON)
┌───────────────────────────▼────────────────────────────┐
│              Express.js Backend (server.ts)            │
├────────────────────────────────────────────────────────┤
│  /api/sources/fetch   ──► SSRF Guard & Readability     │
│  /api/research        ──► In-Memory Project Store      │
│  /api/analyze         ──► Multi-Stage AI Pipeline      │
└─────────────┬────────────────────────────┬─────────────┘
              │                            │
   ┌──────────▼───────────┐     ┌──────────▼───────────┐
   │  Gemini 3.8 Flash    │     │ Deterministic NLP    │
   │  Structured GenAI    │     │ Heuristic Analyzer   │
   │  (Google GenAI SDK)  │     │ (Zero-Downtime Guard)│
   └──────────────────────┘     └──────────────────────┘
```

---

## 5. Local Setup & Windows Terminal Commands

### Prerequisites
- Node.js (version 18 or higher recommended)
- npm (version 9 or higher)

### Step 1: Clone or Open Project
```powershell
git clone https://github.com/your-username/digital-dark-spot.git
cd digital-dark-spot
```

### Step 2: Install Dependencies
```powershell
npm install
```

### Step 3: Configure Environment Variables
Create a `.env` file in the root directory (based on `.env.example`):
```powershell
copy .env.example .env
```
Open `.env` and add your Gemini API Key:
```env
GEMINI_API_KEY="AIzaSy..."
PORT=3000
```
*(Note: If no API key is provided, the platform automatically activates its built-in rule-based NLP engine, ensuring 100% demo functionality!)*

### Step 4: Run the Development Server
```powershell
npm run dev
```
Open your browser and navigate to: `http://localhost:3000`

### Step 5: Build for Production
```powershell
npm run build
npm start
```
## 8. License

Apache-2.0 License. Built for the Shinchan Online Hackathon 2026.
