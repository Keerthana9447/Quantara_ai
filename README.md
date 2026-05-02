# QUANTARA AI
> *"Quantifying Value. Decoding Liquidity."*

**AI-Powered Collateral Valuation & Resale Liquidity Engine**  
Built for **Smart India Hackathon 2025** · Python 3.14.2 · Next.js 15

---

## Quick Start — One Command

```bash
# 1. Install root dependencies
npm install

# 2. Run full setup (installs backend + frontend deps, creates .env files)
npm run setup

# 3. Start BOTH backend + frontend together
npm run dev
```

- **Frontend** → http://localhost:3000  
- **Backend API** → http://localhost:8000  
- **API Docs** → http://localhost:8000/api/docs  

---

## Prerequisites

| Tool | Version | Install |
|---|---|---|
| Python | **3.14.2** | https://python.org/downloads/ |
| Node.js | 20+ | https://nodejs.org |
| npm | 10+ | bundled with Node |

> Python 3.14.2 is **required**. Install from python.org before running setup.

---

## Manual Setup (Step by Step)

### 1. Backend
```bash
cd backend

# Create and activate virtualenv
python3.14 -m venv .venv
source .venv/bin/activate          # Windows: .venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Copy env file
cp .env.example .env               # Edit if needed (defaults work out-of-box)

# Start API server
python3.14 -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

### 2. Frontend (new terminal)
```bash
cd frontend
npm install
cp .env.local.example .env.local   # already set to localhost:8000
npm run dev
```

---

## Root npm Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start **both** backend + frontend (requires `concurrently`) |
| `npm run dev:backend` | Start only the FastAPI backend |
| `npm run dev:frontend` | Start only the Next.js frontend |
| `npm run setup` | Auto-install all deps + create .env files |
| `npm run build` | Production build of frontend |
| `npm run start` | Start both in production mode |

---

## Docker (Optional)

```bash
# Copy env file first
cp backend/.env.example backend/.env

# Build and start all services
docker compose up --build

# Services:
# Frontend:  http://localhost:3000
# Backend:   http://localhost:8000
# Full stack: http://localhost:80 (via nginx)
```

---

## Tech Stack

| Layer | Technology |
|---|---|
| **Backend** | FastAPI, Python **3.14.2**, Pydantic v2, SQLAlchemy 2.0 async |
| **Database** | SQLite + aiosqlite (default, zero-config) |
| **Auth** | PyJWT + bcrypt (RBAC: Admin / Analyst / Viewer) |
| **ML Engine** | Pure Python (XGBoost-simulated), Isolation Forest fraud detection |
| **LLM** | GPT-4o (optional), template fallback |
| **Frontend** | Next.js 15, TypeScript, TailwindCSS, Framer Motion, Recharts |
| **State** | Zustand + TanStack Query |
| **DevOps** | Docker Compose, Nginx |

---

## Environment Variables

### `backend/.env`
```env
DATABASE_URL=sqlite+aiosqlite:///./quantara.db   # SQLite (default)
SECRET_KEY=change-this-to-a-secure-random-string
OPENAI_API_KEY=                                  # Optional: sk-... for GPT-4o
DEBUG=false
```

### `frontend/.env.local`
```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```

---

## Demo Flow

1. Open http://localhost:3000
2. Click **Get Started** → Register an account
3. Login → arrive at **Command Center**
4. Go to **Analyze Property**:
   - Address: `Banjara Hills, Hyderabad`
   - Type: Residential | Area: 1100 sqft | Age: 8 | Freehold | RERA ✓
   - Click **Run AI Analysis** — watch 5-step pipeline animate
5. See Market Value, Distress Value, Liquidity Score, Fraud Risk, LLM Memo
6. Try **What-If Simulator** — compare 4 scenarios side-by-side
7. Check **Explainability** — SHAP waterfall, confidence dials
8. Run **Fraud Detection** — 6-check anomaly scan

---

## API Reference

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/auth/register` | Create account |
| `POST` | `/api/auth/login` | Get JWT token |
| `POST` | `/api/analyze-property` | Full AI valuation |
| `GET`  | `/api/valuation/{id}` | Retrieve valuation |
| `POST` | `/api/simulate` | What-if scenario comparison |
| `GET`  | `/api/fraud-analysis/{id}` | Fraud check |
| `GET`  | `/api/market-trends` | City market data |
| `GET`  | `/api/admin/stats` | Platform analytics |

Full interactive docs: http://localhost:8000/api/docs

---

## Project Structure

```
quantara-ai/
├── package.json          ← ROOT: npm run dev starts everything
├── backend/
│   ├── app/
│   │   ├── main.py       ← FastAPI entry point
│   │   ├── core/         ← Config, DB, JWT security
│   │   ├── models/       ← SQLAlchemy ORM (SQLite/Postgres)
│   │   ├── schemas/      ← Pydantic v2 schemas
│   │   ├── ml/           ← Valuation engine + LLM explainability
│   │   └── api/routes/   ← REST endpoints
│   ├── requirements.txt  ← Python 3.14.2 compatible
│   └── .env.example
├── frontend/
│   ├── src/app/
│   │   ├── page.tsx            ← Landing page
│   │   ├── auth/               ← Login / Register
│   │   └── dashboard/          ← Analyze, Simulator, Explainability,
│   │                              Fraud Detection, Admin
│   ├── src/lib/               ← API client, Zustand store
│   └── package.json
├── docker-compose.yml
├── nginx.conf
└── README.md
```

---

## Cities Supported

Hyderabad · Bangalore · Mumbai · Chennai · Pune · Delhi · Gurugram · Noida · Kolkata  
*(+ any city with fallback pricing model)*

---

*"Lenders don't just need price — they need exit certainty."*
