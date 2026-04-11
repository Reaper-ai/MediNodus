# MediNodus Local Setup

This guide helps collaborators set up the local backend, local Supabase, and the Expo frontend.

## 1) Prerequisites
- Python 3.11+
- Node.js 18+ (npm included)
- Docker (for local Supabase)

## 2) Backend (FastAPI)
1. Create and activate a virtual environment:
   - python -m venv .venv
   - source .venv/bin/activate
2. Install backend dependencies:
   - pip install -r backend/requirements.txt
3. Copy env template and fill values:
   - cp backend/.env.example backend/.env

## 3) Local Supabase (recommended for dev)
We use a local Supabase stack to avoid hosted rate limits.

1. Install the local CLI (repo-local):
   - mkdir -p tools/supabase
   - cd tools/supabase
   - npm init -y
   - npm install supabase
2. Initialize Supabase config:
   - cd ../..
   - npx --prefix tools/supabase supabase init
3. Start Supabase:
   - bash tools/supabase/run.sh start
4. Update backend/.env with local values (printed by Supabase):
   - SUPABASE_URL
   - SUPABASE_PUBLISHABLE_KEY
   - SUPABASE_SECRET_KEY
   - SUPABASE_DB_URL

## 4) Apply database migration
1. Ensure backend/.env is set.
2. Run migration:
   - python scripts/apply_migration.py

## 5) Run the API
- uvicorn backend.app.main:app --reload

## 6) Frontend (Expo)
1. Install dependencies:
   - cd frontend
   - npm install
2. Start Expo:
   - npm run start

## Useful URLs (local Supabase)
- Studio: http://127.0.0.1:54323
- API: http://127.0.0.1:54321

## Notes
- The local Supabase stack binds to 0.0.0.0. Do not use local keys in production.
- If ports are busy, stop Supabase with: bash tools/supabase/run.sh stop
