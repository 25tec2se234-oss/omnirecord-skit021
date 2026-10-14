# OmniRecord | Centralized Student Participation, Verification & Management Platform
**Project ID:** SKIT021  
**Category:** Enterprise EdTech / Institutional Governance Platform

OmniRecord is a centralized, digital student participation and achievement management platform designed for universities, colleges, and educational institutions. It unifies scattered departmental spreadsheets, verifies student extracurricular credentials through structured faculty review queues, and generates accreditation-ready reports (NAAC Criteria 5 / NBA).

---

## 🌟 Key Features

- **Public Landing Page:** Institutional presentation showcasing the problem vs. solution, feature suite, 4-step workflow, and live dashboard mockup.
- **Interactive First-Time Onboarding:** 6-step guided walkthrough explaining relational architecture, participation recording, verification workflows, and accreditation insights.
- **Institutional Command Dashboard:** Real-time KPI summary cards, monthly participation trends, verification ring chart, category progress breakdown, and department engagement analytics.
- **Students Directory:** Student profiles across engineering and management departments, tracking participation counts, verified merits, and academic cohorts.
- **Participation Records Ledger:** Multi-filtered database tracking student events, competition levels (Winner, Runner-up, Finalist, Participant), and attached evidence metadata.
- **Faculty Verification Center:** Structured queue for department convenors to inspect claims, review evidence proofs, approve with verifiable seals, or request corrections with notes.
- **Digital Student Achievement Profile:** Chronological achievement timeline, category filters, printable achievement transcripts (`window.print()`), and verifiable digital certificates.
- **Institutional Analytics & Reporting:** Dynamic multi-filter analytics with **one-click CSV data export** and formal accreditation audit report preview.
- **Department Management:** Directory of departments (CSE, IT, ECE, ME, CE, BT, MBA) with dynamic student and activity statistics.
- **In-App Notification Center:** Actionable alerts routing directly to review queues and student records.
- **Institutional Settings & Demo Controls:** Full browser-isolated state with one-click "Reset Demo Data" capability.

---

## 🎨 Design System & Brand Identity

The interface follows a tailored, clean SaaS design system:
- **Primary Orange:** `#F97316` (Signature brand accent)
- **Primary Orange Hover:** `#EA580C`
- **Soft Orange:** `#FFF1E7`
- **Surface White:** `#FFFFFF`
- **Application Background:** `#F5F6F8` (Main) & `#F9FAFB` (Secondary)
- **Typography:** Modern `Inter` font with strict typographical hierarchy
- **Icons:** Consistent `lucide-react` iconography (no emojis used as UI icons)

---

## 🚀 Local Development Setup

### Prerequisites
- Node.js (v18 or higher recommended)
- npm or yarn

### Installation & Run

1. Clone or download the repository:
   ```bash
   git clone <YOUR_REPOSITORY_URL>
   cd <REPOSITORY_FOLDER>
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Launch development server:
   ```bash
   npm run dev
   ```

4. Build for production:
   ```bash
   npm run build
   ```

---

## 🌐 Deployment on Render (Static Site)

This repository includes pre-configured Render deployment settings (`render.yaml` and `public/_redirects`).

### Steps to Deploy on Render:

1. **Push your code to a new GitHub repository:**
   ```bash
   git init -b main
   git add .
   git commit -m "Initial commit: SKIT021 Centralized Platform"
   git remote add origin https://github.com/<YOUR_GITHUB_USERNAME>/<YOUR_NEW_REPO_NAME>.git
   git push -u origin main
   ```

2. **Deploy on Render:**
   - Log in to your [Render Dashboard](https://dashboard.render.com/).
   - Click **New +** and select **Static Site**.
   - Connect your GitHub account and select your newly created repository.
   - Configure the build settings:
     - **Name:** `skit021-student-platform` (or your preferred name)
     - **Branch:** `main`
     - **Build Command:** `npm run build`
     - **Publish Directory:** `dist`
   - Click **Create Static Site**.

Render will automatically install dependencies, run the build command, and deploy your frontend to a live global CDN URL (e.g., `https://skit021-student-platform.onrender.com`).

---

## 🔒 Security & Prototype Scope Notice

- **Frontend Scope:** This phase represents the complete frontend prototype with simulated evidence verification and browser-local data storage (`localStorage`).
- **Backend Roadmap:** Future production phases will connect institutional OAuth2 / SAML SSO, cloud object storage (S3) with SHA-256 evidence integrity hashing, and PostgreSQL persistence.

---

## 📄 License & Credits
Developed for Hackathon Problem Statement **SKIT021** (Centralized Student Participation, Verification & Management Platform).
