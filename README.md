# MedLens — AI-Powered Clinical Information Intelligence

**MedLens** transforms fragmented patient information and medical reports into structured, reference-range-aware, human-reviewable clinical records with complete provenance tracking and inconsistency detection.

---

## 🛡️ Responsible AI & Clinical Principles

MedLens is an information organization and explanation platform designed with strict clinical guardrails:

- **Non-Diagnostic & Non-Prescriptive**: MedLens NEVER diagnoses diseases, prescribes medications, or recommends dosage changes.
- **Deterministic Reference Ranges**: MedLens evaluates `LOW` / `NORMAL` / `HIGH` statuses strictly against the numerical intervals supplied in the source document. It **NEVER** hallucinates or substitutes standard medical ranges.
- **Missing Reference Range Integrity**: If a report lacks a reference interval, status evaluates strictly to `UNKNOWN` / `NOT_AVAILABLE`.
- **Zero-Downtime Deterministic Fallback**: Clinical AI summaries utilize Google Gemini models when configured, and seamlessly fallback to a rule-based clinical synthesis engine if offline or unkeyed.
- **Complete Provenance**: Every clinical observation explicitly displays its origin tag (`USER_PROVIDED`, `REPORT_EXTRACTED`, `SYSTEM_DERIVED`, or `AI_GENERATED`) and source document page number.
- **Human Review & Audit**: Clinicians can review, confirm, or edit extracted values with full historical audit trails.
- **3D Spatial Evidence Intelligence**: High-performance interactive 3D Evidence Constellation and 8-stage spatial path visualizer with graceful 2D high-contrast fallbacks.

---

## 🏛️ System Architecture

```
hackathon-project/
├── backend/
│   ├── app/
│   │   ├── config.py              # Environment settings (Pydantic BaseSettings)
│   │   ├── database.py            # SQLAlchemy engine, session maker, SQLite/PostgreSQL
│   │   ├── models/                # SQLAlchemy ORM models (Patient, Report, Observation, etc.)
│   │   ├── schemas/               # Pydantic request/response schemas
│   │   ├── services/
│   │   │   ├── status_engine.py   # Deterministic reference-range evaluator
│   │   │   ├── pdf_extractor.py   # Page-by-page PDF digital text extractor
│   │   │   ├── medical_parser.py  # Structured tabular & inline medical parser
│   │   │   ├── conflict_engine.py # Inconsistency & allergy-medication detector
│   │   │   ├── timeline_service.py# Chronological patient event manager
│   │   │   ├── ai_summary.py      # Gemini client + deterministic synthesis engine
│   │   │   ├── demo_data.py       # Synthetic patient & PDF generator (ReportLab)
│   │   │   └── security.py        # Safe file upload, MIME validation, path sanitization
│   │   ├── routers/               # Modular FastAPI endpoints
│   │   └── main.py                # FastAPI app entrypoint, CORS, static SPA mounting
│   ├── tests/                     # 25 automated pytest tests
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── 3d/                # EvidenceConstellation, EvidenceChain3D, Timeline3D, ConflictRelationship3D, EvidenceDetailPanel, VisualizationFallback
│   │   │   ├── StatusBadge, ProvenanceBadge, ReviewModal, etc.
│   │   ├── pages/                 # Dashboard, Patients, Side-by-Side Viewer, Timeline, Conflicts, Settings
│   │   ├── services/api.js        # REST API client
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── package.json
│   └── vite.config.js
├── Dockerfile                     # Multi-stage production container for Cloud Run
├── .env.example
└── README.md
```

---

## 🚀 Quickstart & Local Development

### Prerequisites
- Python 3.11+ (tested on Python 3.13)
- Node.js 20+ (tested on Node.js 22)
- npm 10+

### 1. Backend Setup
```bash
# Navigate to project root
cd hackathon-project

# Activate Python virtual environment
# Windows:
.\backend\venv\Scripts\activate
# Linux/macOS:
# source backend/venv/bin/activate

# Install dependencies
pip install -r backend/requirements.txt

# Run backend test suite (25 tests)
pytest -v

# Start FastAPI backend
uvicorn backend.main:app --host 0.0.0.0 --port 8000 --reload
```

Backend API will be live at:
- **API Docs**: [http://localhost:8000/docs](http://localhost:8000/docs)
- **Health Check**: [http://localhost:8000/health](http://localhost:8000/health)

### 2. Frontend Setup (Development Mode)
```bash
cd frontend
npm install
npm run dev
```

Frontend development server will be live at: [http://localhost:5173](http://localhost:5173) (proxies requests to backend at `:8000`).

---

## 🧪 Automated Testing Suite

The repository includes a comprehensive 25-test suite covering deterministic reference ranges, PDF extraction, file security, conflict detection, human review audits, and REST APIs:

```bash
pytest -v backend/tests
```

### Test Coverage Highlights
- `test_status_engine.py`: Tests numeric intervals (`12-16`), inequality bounds (`<10`, `>30`), qualitative text (`Negative`, `Normal`), unsupported ranges (`UNKNOWN`), and missing ranges (`NOT_AVAILABLE`).
- `test_pdf_extraction.py`: Page-by-page PDF extraction and malformed PDF error handling.
- `test_medical_parser.py`: Multi-line tabular stream parsing, units extraction, and line provenance.
- `test_conflict_engine.py`: Allergy vs Medication detection (e.g. Penicillin allergy vs Amoxicillin prescription) and temporal biomarker shifts.
- `test_security.py`: Path traversal prevention, UUID safe storage names, and malicious file type rejection.
- `test_api.py`: Full end-to-end endpoint tests (`/health`, `/patients`, `/reports`, `/review`, `/summary`, `/conflicts`, `/demo/seed`).

---

## ☁️ Google Cloud Run Deployment

MedLens is packaged as a multi-stage container that builds the React frontend and serves both the REST API and the SPA frontend via FastAPI on `0.0.0.0:$PORT`.

### 1. Build and Test Container Locally
```bash
# Build Docker image
docker build -t medlens:latest .

# Run container locally on port 8080
docker run -p 8080:8000 -e PORT=8000 -e GEMINI_API_KEY="" medlens:latest
```
Access at [http://localhost:8080](http://localhost:8080).

### 2. Deploy to Google Cloud Run
```bash
# Authenticate and set project
gcloud auth login
gcloud config set project YOUR_GCP_PROJECT_ID

# Build and submit container image via Google Cloud Build
gcloud builds submit --tag gcr.io/YOUR_GCP_PROJECT_ID/medlens:latest

# Deploy to Cloud Run
gcloud run deploy medlens \
  --image gcr.io/YOUR_GCP_PROJECT_ID/medlens:latest \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --set-env-vars="APP_ENV=production,AI_PROVIDER=gemini,GEMINI_API_KEY=YOUR_GEMINI_API_KEY"
```

---

## 🔗 Traceable Evidence Chain (8-Stage Verification)

Every clinical observation extracted or displayed in MedLens is backed by an 8-stage **Traceable Evidence Chain** providing verifiable lineage from raw report pixels/text to clinical audit state:

1. **Clinical Observation & Reported Value**: Standardized test name, reported measurement, unit, and any clinician-corrected values.
2. **Source Document & Report Metadata**: Originating report title, original file name, diagnostic laboratory name, and collection timestamp.
3. **Exact Document Location / Verbatim Source Text**: Document page number and exact verbatim digital extraction line.
4. **Reference Range Supplied by Source**: Explicit numerical or qualitative interval stated by the lab report (`"Reference range not provided"` strictly evaluates to `NOT_AVAILABLE`).
5. **Deterministic Evaluation & Reasoning**: Mathematical status evaluation (`NORMAL`, `HIGH`, `LOW`, `UNKNOWN`, `NOT_AVAILABLE`) with explicit step-by-step reasoning.
6. **Information Provenance**: Clear lineage categorization (`REPORT_EXTRACTED`, `USER_PROVIDED`, `SYSTEM_DERIVED`, or `AI_GENERATED`).
7. **Extraction Confidence**: Algorithmic certainty score representing OCR/digital parsing fidelity.
8. **Human Review & Audit State**: Verification status (`UNREVIEWED`, `CONFIRMED`, `EDITED`, `REJECTED`), reviewer clinical notes, and timestamped historical action logs.

---

## 🧑‍⚕️ Hackathon Demonstration Walkthrough

1. Open MedLens in your browser ([http://localhost:8000](http://localhost:8000) or dev [http://localhost:5173](http://localhost:5173)).
2. Click **"Load Demo Patient"** in the top header:
   - Automatically loads synthetic patient **Sarah Jenkins (SYN-89421)** with multi-report history.
   - Displays demographics, symptoms (Fatigue), conditions (Type 2 Diabetes), allergy (Penicillin), and current medications (Amoxicillin).
3. Observe the **Clinical Inconsistency Alert**:
   - MedLens immediately flags an `ALLERGY_MEDICATION` conflict between recorded Penicillin allergy and prescribed Amoxicillin.
4. Inspect the **Traceable Evidence Chain**:
   - Click **"Evidence"** on any observation card (e.g. Fasting Blood Glucose, Vitamin D, or Total Protein Ratio).
   - Trace through all 8 stages from raw text line and source page to deterministic classification and audit trail.
5. Navigate to **Medical Reports**:
   - Inspect the **Side-by-Side View**: Source extracted text on the left, structured observation cards on the right.
   - Note the deterministic evaluation of **Hemoglobin** (Normal), **Fasting Glucose** (High), **Vitamin D** (Low), and **Total Protein Ratio** (Stated reference range missing -> evaluates to `NOT_AVAILABLE`).
6. Navigate to **Review Queue ("Needs Review")**:
   - Filter and prioritize unreviewed or out-of-range biomarkers.
   - Click **"Review"** to perform a clinician action (`CONFIRM`, `EDIT`, `REJECT`) with clinical justification.
   - Observe the updated status and persistent audit trail.
7. Check **Patient Timeline**:
   - View chronological feed tracing intake, report upload, laboratory findings, and human reviews.
8. Click **"Regenerate AI Summary"**:
   - Produces a clear, non-diagnostic, patient-friendly summary adhering to all clinical transparency rules.

