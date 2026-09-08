<div align="center">

# 🧬 GenomeGuard

### Pharmacogenomic Risk Analysis Platform

[![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js)](https://nextjs.org/)
[![Flask](https://img.shields.io/badge/Flask-3.0-green?logo=flask)](https://flask.palletsprojects.com/)
[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react)](https://react.dev/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47A248?logo=mongodb)](https://www.mongodb.com/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?logo=tailwindcss)](https://tailwindcss.com/)
[![Python](https://img.shields.io/badge/Python-3.14+-3776AB?logo=python)](https://www.python.org/)

**Live Demo:** [https://genomeguard.tech](https://genomeguard.tech)

**Upload patient genetic data (VCF) → Select medications → Receive personalized drug-safety assessments aligned with [CPIC](https://cpicpgx.org/) clinical guidelines.**

*Built for doctors and genetic counselors to make informed, evidence-based prescribing decisions.*

</div>

---

## 📋 Table of Contents

- [Overview](#-overview)
- [Key Features](#-key-features)
- [Architecture](#-architecture)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Prerequisites](#-prerequisites)
- [Getting Started](#-getting-started)
- [Environment Variables](#-environment-variables)
- [API Reference](#-api-reference)
- [Supported Genes & Drugs](#-supported-genes--drugs)
- [Sample Data](#-sample-data)
- [Screenshots](#-screenshots)
- [Contributing](#-contributing)
- [License](#-license)

---

## 🔬 Overview

**GenomeGuard** is a full-stack pharmacogenomics platform that bridges the gap between raw genetic data and actionable clinical insights. It empowers healthcare professionals to:

- **Predict drug responses** by mapping patient VCF (Variant Call Format) genotype data to clinically validated star-allele diplotypes
- **Assess medication safety** using a CPIC-aligned knowledge base covering major pharmacogenes
- **Screen for IVF genetic compatibility** through Punnett-square inheritance analysis of two parent profiles
- **Identify pills in real-time** using camera-based OCR and cross-referencing detected drug names against a patient's genetic risk profile

The platform combines a **Next.js 16** frontend with a **Flask 3** backend and a **CPIC-aligned pharmacogenomic knowledge base** for clinically validated risk assessments.

---

## ✨ Key Features

### 🧪 Drug Risk Analysis
Upload a patient's VCF file and select one or more medications. GenomeGuard parses the genetic variants, maps them to star-allele diplotypes, determines the metabolizer phenotype for each relevant gene, and returns per-drug risk verdicts:

| Verdict | Meaning |
|---------|---------|
| ✅ **Safe** | Standard dosing is appropriate for this genotype |
| ⚠️ **Adjust Dosage** | Consider dose modification based on metabolizer status |
| 🔴 **Toxic** | High risk of adverse reaction — avoid or use alternative |
| ⚪ **Ineffective** | Drug is unlikely to provide therapeutic benefit |

Each result includes CPIC guideline references and links for clinical validation.

### 👶 Genetic Compatibility (IVF Analysis)
Upload two parents' VCF files to receive a comprehensive inheritance analysis. The system performs Punnett-square calculations across all screened pharmacogenes to predict the probability distribution of a child's metabolizer phenotypes, helping couples understand potential medication-response risks before conception.


### 🏥 ABHA Patient Lookup
A mock integration with India's **Ayushman Bharat Health Account (ABHA)** system. Doctors enter a 14-digit ABHA ID to retrieve a patient profile with deterministically generated genetic markers, blood group, and medical history. The profile links directly to the pharmacogenomic analysis pipeline for instant drug-safety screening.

### 🗺️ Genome Map
An interactive chromosome visualization built on the GRCh38 (hg38) reference assembly. Pharmacogenomic variant locations are plotted across all 22 autosomes + X/Y with:
- UCSC cytoband rendering
- Color-coded functional impact indicators
- Click-to-inspect variant details

### 💊 Pill Scanner
A camera-based real-time drug identification tool:
1. Captures a frame from the device camera
2. Runs OCR (server-side Tesseract with image preprocessing, or client-side tesseract.js fallback)
3. Cross-references the detected drug name against the patient's genetic profile
4. Returns an instant safety assessment

### 🛡️ Safety Matrix
A searchable, color-coded phenotype × gene grid that displays drug safety levels across all metabolizer phenotypes. Provides a quick-reference lookup for clinicians to assess drug safety based on genetic profile without running a full analysis.

### 📄 PDF Report Export
Download a complete, styled risk analysis report as a PDF document using jsPDF with auto-table formatting, suitable for adding to patient medical records.

### 🔐 Doctor Authentication
Multi-provider authentication system designed for healthcare professionals:
- **Email & Password**: Secure signup and login with password hashing (Werkzeug)
- **Google Sign-In**: OAuth 2.0 integration via Google Identity Services for one-click authentication

Protected routes ensure only authenticated users can access analysis tools, pill scanner, and ABHA lookup.

### 👥 Predefined Patient Library
A built-in library of 10 predefined Indian-named sample patients with pre-generated VCF data, allowing doctors to quickly demo and explore the platform without uploading real patient data.

### 📊 Vercel Analytics
Integrated Vercel Analytics for production traffic and performance monitoring.

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        CLIENT (Next.js 16)                  │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌───────────────┐  │
│  │ Analysis │ │  Genome  │ │   Pill   │ │  IVF Compat.  │  │
│  │   Tool   │ │   Map    │ │ Scanner  │ │    Report     │  │
│  └────┬─────┘ └────┬─────┘ └────┬─────┘ └──────┬────────┘  │
│       │             │            │               │           │
│  ┌────┴─────────────┴────────────┴───────────────┴────────┐  │
│  │              AuthContext · React 19 · Motion            │  │
│  │           Tailwind CSS 4 · Radix UI · shadcn/ui         │  │
│  └─────────────────────┬───────────────────────────────────┘  │
└────────────────────────┼─────────────────────────────────────┘
                         │  REST API (JSON)
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                     SERVER (Flask 3 / Python)               │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌───────────────┐  │
│  │  Parser  │ │ Matcher  │ │ Analyzer │ │ Compatibility │  │
│  │  (VCF)   │ │ (Stars)  │ │  (Risk)  │ │    (IVF)      │  │
│  └────┬─────┘ └────┬─────┘ └────┬─────┘ └──────┬────────┘  │
│       │             │            │               │           │
│  ┌────┴─────────────┴────────────┴───────────────┴────────┐  │
│  │   PGx Knowledgebase · CPIC Tables · OCR Engine           │  │
│  └─────────────────────┬───────────────────────────────────┘  │
│                        │                                      │
│              ┌─────────▼──────────┐                          │
│              │   MongoDB (Atlas)   │                          │
│              │  Users · Profiles   │                          │
│              └────────────────────┘                           │
└─────────────────────────────────────────────────────────────┘
```

---

## 🛠️ Tech Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Frontend** | Next.js 16, React 19 | Server-side rendering, App Router, component architecture |
| **Styling** | Tailwind CSS 4, Radix UI, shadcn/ui | Utility-first CSS, accessible primitives, pre-built components |
| **Animation** | Motion (Framer Motion) | Smooth page transitions and micro-interactions |
| **Icons** | Lucide React, Tabler Icons | Consistent iconography |
| **Fonts** | Mulish, Oxanium (Google Fonts) | Modern typography |
| **Backend** | Flask 3, Python 3.14+ | REST API server, pharmacogenomic analysis engine |
| **Database** | MongoDB (PyMongo) | User accounts, genetic profiles |
| **OCR** | Pytesseract (server) / tesseract.js (client) | Pill label text recognition |
| **PDF** | jsPDF + jspdf-autotable | Downloadable clinical reports |
| **Auth** | Email/Password (Werkzeug) + Google OAuth 2.0 | Multi-provider doctor authentication |
| **Analytics** | Vercel Analytics | Production traffic and performance monitoring |

---

## 📁 Project Structure

```
GenomeGuard/
│
├── client/                          # ── Next.js 16 Frontend ──
│   ├── public/                      # Static assets & sample VCF files
│   │   ├── sample_patient.vcf       # Demo VCF for quick testing
│   │   └── samples/                 # IVF partner VCF samples
│   │       ├── partner_carrier.vcf
│   │       ├── partner_high_risk.vcf
│   │       └── partner_normal.vcf
│   │
│   ├── src/
│   │   ├── app/                     # Pages (Next.js App Router)
│   │   │   ├── layout.js            # Root layout (fonts, metadata, providers, analytics)
│   │   │   ├── page.js              # Homepage (hero, analysis, features)
│   │   │   ├── globals.css          # Global styles & Tailwind directives
│   │   │   ├── Providers.jsx        # Client-side context providers
│   │   │   ├── abha/                # ABHA patient lookup page
│   │   │   ├── chat/                # Chat interface page
│   │   │   ├── genome-map/          # Interactive chromosome visualization
│   │   │   ├── ivf/                 # IVF compatibility analysis page
│   │   │   ├── login/               # Doctor login page (email + Google OAuth)
│   │   │   ├── signup/              # Doctor registration page (email + Google OAuth)
│   │   │   ├── pill-scanner/        # Camera-based pill identification
│   │   │   ├── profile/             # User profile page
│   │   │   ├── results/             # Analysis results display
│   │   │   └── safety-matrix/       # Drug safety reference grid
│   │   │
│   │   ├── components/              # React components
│   │   │   ├── AnalysisTool.jsx     # VCF upload + drug selection + analysis
│   │   │   ├── CompatibilityReport.jsx # IVF results display
│   │   │   ├── ContactSection.jsx   # Contact form
│   │   │   ├── DrugInput.jsx        # Drug multi-select input
│   │   │   ├── FeaturesSection.jsx  # Feature cards showcase
│   │   │   ├── FileUpload.jsx       # Drag-and-drop VCF uploader
│   │   │   ├── Footer.jsx           # Site footer
│   │   │   ├── HeroSection.jsx      # Landing page hero banner
│   │   │   ├── HowItWorks.jsx       # Step-by-step workflow guide
│   │   │   ├── IVFSection.jsx       # IVF feature section
│   │   │   ├── NavBar.jsx           # Navigation bar with auth state
│   │   │   ├── PageLoader.jsx       # Full-screen loading animation
│   │   │   ├── ProtectedRoute.jsx   # Auth guard — redirects unauthenticated users
│   │   │   ├── PunnettSquare.jsx    # Genetic inheritance grid
│   │   │   ├── SafetyMatrix.jsx     # Gene-drug safety matrix grid
│   │   │   ├── SupportedGenesDrugs.jsx # Supported genes/drugs table
│   │   │   ├── camera/              # Camera capture components
│   │   │   ├── genome-map/          # Chromosome visualization components
│   │   │   ├── results/             # Result display sub-components
│   │   │   └── ui/                  # shadcn/ui primitives
│   │   │
│   │   ├── context/
│   │   │   └── AuthContext.jsx      # Authentication state management (email + Google)
│   │   │
│   │   ├── lib/
│   │   │   ├── cytoBand_hg38.json   # GRCh38 cytoband reference data
│   │   │   └── utils.js             # Utility functions (cn helper)
│   │   │
│   │   └── utils/
│   │       ├── OcrHandler.js        # Client-side OCR wrapper
│   │       ├── pillScannerUtils.js  # Pill detection & drug matching logic
│   │       └── vcfValidator.js      # VCF file format validation
│   │
│   ├── package.json
│   ├── next.config.mjs
│   ├── postcss.config.mjs
│   └── components.json              # shadcn/ui configuration
│
├── py-backend/                      # ── Flask API Server ──
│   ├── app.py                       # Main server — all API routes
│   ├── analyzer.py                  # Core pharmacogenomic analysis engine
│   ├── parser.py                    # VCF file parser (plain + compressed)
│   ├── matcher.py                   # Variant ↔ star-allele diplotype matcher
│   ├── compatibility.py             # IVF / Punnett-square inheritance calculator
│   ├── pgx_knowledgebase.py         # Gene & drug reference data (CPIC-aligned)
│   ├── cpic_tables.py               # CPIC Excel table loader & parser
│   ├── sample_patients.py           # Predefined sample patient data generator
│   ├── database.py                  # MongoDB connection & initialization
│   ├── models.py                    # Data models
│   ├── seed_db.py                   # Database seeding script (test data)
│   ├── fetch_cytoband.py            # Cytoband data fetcher (GRCh38)
│   ├── fetch_cytoband_v2.py         # Cytoband fetcher v2
│   ├── schema.sql                   # Database schema reference
│   ├── requirements.txt             # Python dependencies
│   ├── data/                        # Reference data files
│   │   ├── tables/                  # CPIC Excel phenotype-drug tables
│   │   ├── sample.vcf               # Sample VCF for testing
│   │   ├── phenotypes.tsv           # Phenotype reference data
│   │   └── *.xlsx                   # CPIC diplotype-phenotype tables
│   └── .env                         # Environment variables (not committed)
│
├── Readme.md                        # ← You are here
└── .gitignore
```

---

## 📌 Prerequisites

| Requirement | Version | Notes |
|------------|---------|-------|
| **Python** | 3.14+ | Backend runtime |
| **Node.js** | 18+ | Frontend runtime (includes npm) |
| **MongoDB** | Any | Local instance or [MongoDB Atlas](https://www.mongodb.com/atlas) (cloud) |

| **Tesseract OCR** | 5.x *(optional)* | Required only for server-side Pill Scanner — [install guide](https://github.com/tesseract-ocr/tesseract) |

---

## 🚀 Getting Started

### 1. Clone the Repository

```bash
git clone <repo-url>
cd GenomeGuard
```

### 2. Backend Setup

```bash
cd py-backend

# Create and activate virtual environment
python -m venv venv

# Windows
venv\Scripts\activate
# macOS / Linux
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt
```

Create a `.env` file inside `py-backend/`:

```env
MONGO_URI=mongodb+srv://<user>:<password>@<cluster>.mongodb.net/genomeguard
```

Start the backend server:

```bash
python app.py
```

The API will be available at **`http://localhost:5000`**.

### 3. Seed the Database *(optional)*

Populate MongoDB with sample users and genetic profiles for testing:

```bash
python seed_db.py
```

### 4. Frontend Setup

```bash
cd client

# Install dependencies
npm install
```

Optionally create a `.env.local` file inside `client/`:

```env
NEXT_PUBLIC_API_URL=http://localhost:5000
```

Start the development server:

```bash
npm run dev
```

Open **[http://localhost:3000](http://localhost:3000)** in your browser.

---

## 🔑 Environment Variables

### Backend (`py-backend/.env`)

| Variable | Required | Default | Description |
|----------|:--------:|---------|-------------|
| `MONGO_URI` | ✅ | — | MongoDB connection string |
| `PORT` | ❌ | `5000` | Flask server port |
| `FLASK_DEBUG` | ❌ | `1` | Enable debug mode (`1` = on, `0` = off) |
| `CORS_ORIGINS` | ❌ | `http://localhost:3000` | Comma-separated allowed origins for CORS |
| `GOOGLE_CLIENT_ID` | ❌ | — | Google OAuth 2.0 client ID (for Google Sign-In) |

### Frontend (`client/.env.local`)

| Variable | Required | Default | Description |
|----------|:--------:|---------|-------------|
| `NEXT_PUBLIC_API_URL` | ❌ | `http://localhost:5000` | Backend API URL |
| `NEXT_PUBLIC_GOOGLE_CLIENT_ID` | ❌ | — | Google OAuth 2.0 client ID (must match backend) |

---

## 📡 API Reference

### General

| Method | Endpoint | Description |
|:------:|----------|-------------|
| `GET` | `/` | Service info and available endpoints |
| `GET` | `/health` | Health check (database status, OCR availability) |

### Analysis

| Method | Endpoint | Description |
|:------:|----------|-------------|
| `POST` | `/analyze` | Upload VCF file + drugs → pharmacogenomic risk analysis |
| `GET` | `/drugs` | List all supported drugs |
| `GET` | `/genes` | List all screened genes |
| `GET` | `/api/safety-matrix` | Full gene-drug safety matrix (phenotype × gene grid) |

### Sample Patients

| Method | Endpoint | Description |
|:------:|----------|-------------|
| `GET` | `/api/sample-patients` | List all predefined sample patients |
| `GET` | `/api/sample-patients/<id>/vcf` | Download VCF file for a sample patient |

### Authentication

| Method | Endpoint | Description |
|:------:|----------|-------------|
| `POST` | `/api/auth/signup` | Register a new doctor (name, email, password) |
| `POST` | `/api/auth/login` | Authenticate a doctor (email, password) |
| `POST` | `/api/auth/google` | Authenticate or register via Google Sign-In (ID token) |

### IVF Compatibility

| Method | Endpoint | Description |
|:------:|----------|-------------|
| `POST` | `/api/couple-analysis` | Upload two VCF files → inheritance compatibility analysis |

### OCR

| Method | Endpoint | Description |
|:------:|----------|-------------|
| `POST` | `/api/ocr` | Server-side OCR (base64 JSON or multipart file upload) |


### Utility

| Method | Endpoint | Description |
|:------:|----------|-------------|
| `POST` | `/api/seed` | Seed the database with test data |

---

## 🧬 Supported Genes & Drugs

GenomeGuard ships with a built-in CPIC-aligned knowledge base covering the following pharmacogenes:

| Gene | Enzyme / Transporter | Drugs | Clinical Relevance |
|------|---------------------|-------|-------------------|
| **CYP2D6** | Cytochrome P450 2D6 | Codeine, Tramadol, Tamoxifen | Pain management, oncology |
| **CYP2C19** | Cytochrome P450 2C19 | Clopidogrel, Omeprazole, Escitalopram, Voriconazole | Cardiology, psychiatry, gastroenterology |
| **CYP2C9** | Cytochrome P450 2C9 | Warfarin, Celecoxib, Phenytoin | Anticoagulation, pain, neurology |
| **SLCO1B1** | Solute Carrier OAT1B1 | Simvastatin, Atorvastatin | Statin-induced myopathy |
| **TPMT** | Thiopurine Methyltransferase | Azathioprine, Mercaptopurine | Immunosuppression, oncology |
| **DPYD** | Dihydropyrimidine Dehydrogenase | Fluorouracil, Capecitabine | Oncology (fluoropyrimidines) |

> **Extensible:** Additional genes are automatically loaded when CPIC Excel tables (`.xlsx`) are placed in `py-backend/data/tables/`.

---

## 📂 Sample Data

Ready-to-use test files are included for immediate testing:

| File | Location | Purpose |
|------|----------|---------|
| `sample_patient.vcf` | `client/public/` | Standard patient VCF for drug risk analysis |
| `partner_carrier.vcf` | `client/public/samples/` | Carrier-status partner for IVF testing |
| `partner_high_risk.vcf` | `client/public/samples/` | High-risk partner for IVF testing |
| `partner_normal.vcf` | `client/public/samples/` | Normal partner for IVF testing |
| `sample.vcf` | `py-backend/data/` | Backend testing sample |
| `100samples.vcf.bgz` | `py-backend/data/` | Compressed multi-sample VCF |

Additionally, the **Predefined Patient Library** (accessible via `/api/sample-patients`) provides 10 pre-built patient profiles with diverse genetic backgrounds for comprehensive platform demonstrations.

---

## 📸 Screenshots

> *Coming soon — run the app locally to explore the full UI experience.*

---

## 🤝 Contributing

Contributions are welcome! Here's how to get started:

1. **Fork** the repository
2. **Create** a feature branch (`git checkout -b feature/amazing-feature`)
3. **Commit** your changes (`git commit -m 'feat: add amazing feature'`)
4. **Push** to the branch (`git push origin feature/amazing-feature`)
5. **Open** a Pull Request

### Development Guidelines

- **Frontend:** Follow Next.js App Router conventions; use shadcn/ui components where possible
- **Backend:** Keep Flask routes in `app.py`; add new analysis logic to dedicated modules
- **Naming:** Use descriptive, consistent naming — PascalCase for components, snake_case for Python
- **Commits:** Follow [Conventional Commits](https://www.conventionalcommits.org/) (`feat:`, `fix:`, `docs:`, etc.)

---

## 📄 License

This project is provided as-is for educational and research purposes.

---

<div align="center">

**Built with ❤️ for precision medicine**

*GenomeGuard — Making pharmacogenomics accessible to every clinician.*

</div>
