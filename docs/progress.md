# MediNodus Progress

## Phase 1: Foundation (Supabase + FastAPI)
- [x] DB schema migration (001_initial.sql)
- [x] FastAPI skeleton
- [x] Auth endpoints (/auth register/login/push-token/notif-prefs)
- [x] Profile create/link/list/detail/update
- [x] JWT verification (JWKS)
- [x] Data provider abstraction for easy swap

## Phase 2: Medications + Reminders
- [ ] Medication CRUD
- [ ] Celery Beat scheduler
- [ ] Expo push integration
- [ ] Reminder log writes
- [ ] Notification prefs checks

## Phase 3: Telemetry Entry
- [ ] Telemetry CRUD
- [ ] Manual entry form
- [ ] Basic list view
- [ ] Threshold check hook (v2 alerts)

## Phase 4: Medical Files + OCR
- [ ] File upload to Supabase Storage
- [ ] AES-256 encrypt/decrypt flow
- [ ] OCR on upload
- [ ] Store ai_extracted_text
- [ ] File list view

## Phase 5: AI Search
- [ ] Postgres full-text search on ai_extracted_text
- [ ] Gemini summary endpoint
- [ ] AIService abstraction class
- [ ] Chat-style query UI

## Phase 6: Panic Button
- [ ] Panic event write
- [ ] Fan-out push to linked accounts
- [ ] Panic status tracking
- [ ] Big red button UI
