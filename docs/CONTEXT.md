## Architecture
[image](/home/gaurav/python/MediNodus/medical_mgmt_refined_architecture.svg)


# AI Serrvice  design\

/home/gaurav/python/MediNodus/ai_service_design.svg


# build order 
- 1 Foundation — Supabase + FastAPI skeleton
DB schema migration · auth endpoints · ACCOUNT + PROFILE + ACCOUNT_PROFILE tables · profile share by ID · basic JWT middleware

- 2 Medications + reminders
MEDICATION CRUD · Celery Beat scheduler · Expo push integration · REMINDER_LOG writes · notif_prefs check

- 3 Telemetry entry
TELEMETRY CRUD · manual entry form · basic list view · threshold check hook (for v2 alerts)

- 4 Medical files + OCR
File upload to Supabase Storage · AES-256 encrypt · Gemini OCR on upload · store ai_extracted_text · file list view

- 5 AI search
Postgres full-text search on ai_extracted_text · Gemini summary endpoint · AIService abstraction class · chat-style query UI

- 6 Panic button
PANIC_EVENT write · fan-out push to all linked accounts · PANIC_EVENT status tracking · big red button UI


backend/
├── app/
│   ├── main.py
│   ├── config.py          env vars
│   ├── database.py        supabase client
│   │
│   ├── models/            pydantic schemas
│   │   ├── account.py
│   │   ├── profile.py
│   │   ├── medication.py
│   │   ├── telemetry.py
│   │   ├── medical_file.py
│   │   └── panic.py
│   │
│   ├── routers/           API endpoints
│   │   ├── auth.py
│   │   ├── profiles.py
│   │   ├── medications.py
│   │   ├── telemetry.py
│   │   ├── files.py
│   │   ├── ai.py
│   │   └── panic.py
│   │
│   ├── services/          business logic
│   │   ├── profile_service.py
│   │   ├── notification_service.py
│   │   ├── encryption_service.py
│   │   └── ai_service.py
│   │
│   ├── tasks/             celery jobs
│   │   ├── celery_app.py
│   │   ├── reminder_tasks.py
│   │   └── panic_tasks.py
│   │
│   └── utils/
│       ├── security.py    JWT helpers
│       └── push.py        expo push wrapper
│
├── migrations/            SQL migration files
│   └── 001_initial.sql
│
├── requirements.txt
├── .env
└── Dockerfile

mobile/
├── app/                   expo router screens
│   ├── (auth)/
│   │   ├── login.tsx
│   │   └── register.tsx
│   ├── (tabs)/
│   │   ├── dashboard.tsx
│   │   ├── medications.tsx
│   │   ├── telemetry.tsx
│   │   ├── records.tsx    medical files
│   │   └── ai.tsx         search + chat
│   └── profile/
│       ├── [id].tsx       view profile
│       ├── create.tsx
│       └── link.tsx       share by ID
│
├── components/
│   ├── ProfileCard.tsx
│   ├── MedReminderCard.tsx
│   ├── TelemetryEntry.tsx
│   ├── FileUploader.tsx
│   ├── AISearchBar.tsx
│   └── PanicButton.tsx    big red button
│
├── services/
│   ├── api.ts             axios base client
│   ├── auth.ts
│   ├── notifications.ts   expo push setup
│   └── encryption.ts      client-side AES
│
├── store/
│   └── useAppStore.ts     zustand global state
│
├── hooks/
│   ├── useProfile.ts
│   └── useMedications.ts
│
├── constants/
│   └── theme.ts
│
├── app.json
├── package.json
└── .env


# Medical Management App — Design Context

## What this is
A family medical management mobile app. Primary use case: adult children (son, daughter) managing an elderly parent's health alongside their own. A profile (the patient) can be shared across multiple accounts with equal access. Everyone gets relevant notifications based on their own preferences.

---

## Core concept — profile sharing
- **Account** = a registered user (has login, owns their notification prefs)
- **Profile** = a patient (the person whose health is tracked)
- One profile can be linked to N accounts via `account_profile` join table
- All linked accounts have **equal access** — no owner/viewer hierarchy
- Notification preferences are **per account**, not per profile
- Example: Son creates dad's profile → shares profile ID → daughter links same profile → both see identical data, both get alerts per their own prefs

---

## Tech stack
| Layer | Choice | Reason |
|---|---|---|
| Mobile | React Native + Expo | Single codebase Android + iOS, handles push + camera |
| Backend | FastAPI (Python) | Team knows Python, async, clean AI integration |
| Database | PostgreSQL via Supabase | Free tier, RLS, auth, storage built in |
| File storage | Supabase Storage | 1GB free, S3-compatible, encrypted blobs |
| Push notifications | Expo Push + FCM | Free, abstracts FCM/APNs |
| SMS fallback | Fast2SMS (India) | Works on 2G, ₹100 free starter |
| Call fallback | Twilio / Exotel | Panic-only, no internet needed |
| Task scheduler | Celery + Redis (Upstash) | Med reminder scheduling, free tier |
| AI | Gemini 2.0 Flash | 1M token context, 15 rpm free tier |
| Auth | Supabase Auth | JWT, email + phone OTP |
| Hosting | Railway / Render | Free tier, auto-deploy from GitHub |

**Total MVP cost: ~₹0/month**

---

## Database schema (all tables)

### account
```
id uuid PK | username text unique | email text unique | mobile text unique
password_hash text | notif_prefs jsonb | expo_push_token text
created_at timestamptz | updated_at timestamptz
```

notif_prefs shape:
```json
{
  "medication_reminder": true,
  "appointment": true,
  "telemetry_alert": true,
  "panic": true,
  "quiet_hours": { "enabled": false, "start": "22:00", "end": "07:00", "tz": "Asia/Kolkata" }
}
```

### profile
```
id uuid PK | name text | dob date | gender text | blood_type text
emergency_contact jsonb | created_at | updated_at
```
emergency_contact shape: `{ name, mobile, relation }`

### account_profile (join table)
```
account_id uuid FK → account | profile_id uuid FK → profile
relation text | linked_at timestamptz
PK: (account_id, profile_id)
```

### medical_file
```
id uuid PK | profile_id FK | uploaded_by FK → account
file_type text (report|xray|prescription|scan|other)
original_name text | storage_key text unique | encryption_iv text
mime_type text | file_size_bytes bigint
ai_extracted_text text | ocr_status text (pending|processing|done|failed)
notes text | uploaded_at timestamptz
```
FTS index on ai_extracted_text via tsvector.

### medication
```
id uuid PK | profile_id FK | added_by FK → account
name text | dosage text | frequency text (daily|twice_daily|thrice_daily|weekly|custom)
reminder_times time[] | active boolean | source text (manual|ocr|ai_extracted)
start_date date | end_date date | notes text | created_at | updated_at
```
Scheduled only — no PRN/as-needed medications.

### allergy
```
id uuid PK | profile_id FK | name text | severity text (mild|moderate|severe|unknown)
source text | notes text | created_at
```

### chronic_condition
```
id uuid PK | profile_id FK | name text | diagnosed_on date
status text (active|managed|resolved) | source text | notes text | created_at | updated_at
```

### telemetry
```
id uuid PK | profile_id FK | recorded_by FK → account
metric_type text (bp_systolic|bp_diastolic|blood_glucose|spo2|heart_rate|weight|temperature|respiratory_rate)
value numeric | unit text | source text (manual|device)
device_id text (reserved for future wearables) | notes text | recorded_at timestamptz
```

### reminder_log
```
id uuid PK | profile_id FK | account_id FK
reminder_type text (medication|appointment) | ref_id uuid (soft FK)
scheduled_at | sent_at | status text (pending|sent|acknowledged|snoozed|missed)
snoozed_until timestamptz | created_at
```

### panic_event
```
id uuid PK | profile_id FK | triggered_by FK → account
latitude numeric | longitude numeric
status text (active|acknowledged|resolved) | channel text (push|sms|call|push+sms)
message text | triggered_at | resolved_at
```

### panic_notification
```
id uuid PK | panic_event_id FK | account_id FK
channel text (push|sms|call) | status text (pending|sent|failed) | sent_at
```

---

## Notification system

**Event types:** medication_reminder, appointment, telemetry_alert, panic

**Flow:**
1. Event fires (Celery task hit, threshold crossed, panic pressed)
2. Query `account_profile` → get all accounts linked to profile
3. For each account, check `notif_prefs` for this event type + quiet hours
4. Fan out to: Expo Push (internet) → SMS Fast2SMS (2G fallback) → call (panic only)
5. Write to `reminder_log` or `panic_notification`

**Panic bypasses notif_prefs filter** — all linked accounts always receive panic alerts regardless of preferences.

**Reminder status lifecycle:** pending → sent → acknowledged / snoozed → (missed if no action)

**Celery Beat:** When medication created/updated, a periodic task is written. When medication deactivated/deleted, task is cancelled.

---

## AI service design

**Model:** Gemini 2.0 Flash (free tier: 15 rpm, 1M token context)

**Three pipelines:**

1. **OCR on upload** — file uploaded → decrypt → send to Gemini as base64 image → extract JSON (tests, values, units, dates, diagnosis, medications mentioned) → store in `ai_extracted_text`

2. **Search + summarise** — user query → Postgres FTS on `ai_extracted_text` + fetch recent telemetry → assemble context → Gemini summary → return answer + source snippets

3. **Diet/exercise suggestions** — triggered on demand or weekly → build context (conditions + meds + recent labs) → Gemini → return suggestions + mandatory disclaimer → cache result, regenerate only on profile change

**Rate limit strategy:**
- OCR runs once per file, result cached — never re-called
- Search: debounce queries, queue, show loading state
- Suggestions: weekly cache, regenerate on profile change only

**AIService abstraction:** single Python class with `extract_from_file()`, `search_history()`, `generate_suggestion()` — swap model by changing internals only

**System prompt skeleton:**
```
You are a medical assistant for a family health app. The patient is {name}, {age}.
Known conditions: [...]. Current medications: [...].
Always recommend consulting a doctor before making any changes.
Respond in simple, clear language.
```

---

## API endpoints (full contract)

All profile-scoped endpoints verify account is linked to profile_id via account_profile.

### Auth `/auth`
```
POST   /auth/register            body: {username, email, mobile, password}         → {account_id, token}
POST   /auth/login               body: {identifier, password}                       → {account_id, token, expires_at}
PATCH  /auth/push-token          body: {expo_push_token}                            → {ok}
PATCH  /auth/notif-prefs         body: {medication_reminder?, appointment?, ...}    → {notif_prefs}
```

### Profiles `/profiles`
```
POST   /profiles                 body: {name, dob, gender?, blood_type?, relation, emergency_contact?} → {profile_id, profile}
POST   /profiles/link            body: {profile_id, relation}                       → {profile}
GET    /profiles                                                                     → [{profile_id, name, dob, relation, linked_accounts_count}]
GET    /profiles/:id                                                                 → {profile, linked_accounts}
PATCH  /profiles/:id             body: {name?, blood_type?, emergency_contact?}     → {profile}
```

### Medications `/profiles/:pid/medications`
```
GET    /                         query: ?active=true|false|all                      → [{id, name, dosage, frequency, reminder_times, ...}]
POST   /                         body: {name, dosage, frequency, reminder_times, start_date, end_date?, notes?} → {medication}
PATCH  /:med_id                  body: {active?, dosage?, reminder_times?, end_date?} → {medication}
DELETE /:med_id                                                                      → {ok}
```

### Telemetry `/profiles/:pid/telemetry`
```
POST   /                         body: {metric_type, value, unit, recorded_at?, notes?} → {telemetry}
GET    /                         query: ?metric_type=&from=&limit=                  → [{id, metric_type, value, unit, recorded_at, recorded_by}]
DELETE /:reading_id                                                                  → {ok}
```

### Medical files `/profiles/:pid/files`
```
POST   /upload-url               body: {file_type, original_name, mime_type, file_size_bytes, encryption_iv} → {file_id, upload_url, storage_key}
POST   /:file_id/confirm         body: {}                                           → {file_id, ocr_status: "processing"}
GET    /                         query: ?file_type=&limit=                          → [{id, file_type, original_name, ocr_status, uploaded_at}]
GET    /:file_id/download-url                                                       → {download_url, encryption_iv}
DELETE /:file_id                                                                     → {ok}
```

### AI `/profiles/:pid/ai`
```
POST   /search                   body: {query}                                      → {answer, sources: [{file_id, snippet}]}
GET    /suggestions                                                                  → {suggestions, generated_at, disclaimer, cached}
GET    /ocr-status/:file_id                                                         → {ocr_status}
```

### Panic `/profiles/:pid/panic`
```
POST   /trigger                  body: {latitude?, longitude?, message?}            → {panic_event_id, notified_count}
PATCH  /:event_id/resolve        body: {}                                           → {status: "resolved", resolved_at}
GET    /history                  query: ?limit=                                     → [{id, triggered_by, status, triggered_at, location}]
```

### Reminders `/profiles/:pid/reminders`
```
GET    /today                                                                        → [{id, reminder_type, ref_id, name, scheduled_at, status}]
PATCH  /:log_id/acknowledge      body: {}                                           → {status: "acknowledged"}
PATCH  /:log_id/snooze           body: {minutes: 15|30|60}                         → {status: "snoozed", snoozed_until}
```

---

## Project folder structure

### Backend
```
backend/
├── app/
│   ├── main.py
│   ├── config.py
│   ├── database.py
│   ├── models/          (account, profile, medication, telemetry, medical_file, panic)
│   ├── routers/         (auth, profiles, medications, telemetry, files, ai, panic)
│   ├── services/        (profile_service, notification_service, encryption_service, ai_service)
│   ├── tasks/           (celery_app, reminder_tasks, panic_tasks)
│   └── utils/           (security, push)
├── migrations/001_initial.sql
├── requirements.txt
└── .env
```

### Frontend
```
mobile/
├── app/
│   ├── (auth)/          (login, register)
│   ├── (tabs)/          (dashboard, medications, telemetry, records, ai)
│   └── profile/         (create, link, [id])
├── components/          (ProfileCard, MedReminderCard, TelemetryEntry, FileUploader, AISearchBar, PanicButton)
├── services/            (api, auth, notifications, encryption)
├── store/               (useAppStore — Zustand)
├── hooks/               (useProfile, useMedications)
└── constants/           (theme)
```

---

## MVP v1 scope (build now)
- Account + auth
- Profile create + share by ID
- Medications (scheduled only)
- Med reminders (push notifications)
- Telemetry manual entry
- Medical file upload + OCR
- Basic AI search
- Panic button (push)

## v2 scope (after validation)
- SMS + call fallback
- Appointment reminders
- Allergies + chronic conditions UI
- Diet/exercise suggestions
- Telemetry charts + trends
- Quiet hours, missed reminder escalation

## Build order
1. Foundation — Supabase schema + FastAPI skeleton + auth (3–4 days)
2. Medications + Celery reminders + push (4–5 days)
3. Telemetry entry (2–3 days)
4. Medical files + OCR (3–4 days)
5. AI search + summary (3–4 days)
6. Panic button (2–3 days)

Total: ~3–4 weeks solo, ~2 weeks with Ashmeet

---

## Key decisions already made
- No profile photos
- Scheduled medications only (no PRN)
- Equal access for all linked accounts (no owner/viewer split)
- Notification prefs per account, per event type
- AI tier depends on free model availability — Gemini Flash first, abstract the service layer
- device_id on telemetry reserved for future wearables (manual entry only for v1)
- Encryption: AES-256 per file, unique IV, key derived from user password client-side
- File upload: presigned URL flow — encrypted bytes never touch FastAPI server
- Missed reminders: log + badge only in v1, escalation in v2
- AI search: Postgres FTS first, vector search later if needed