### Auth — /auth

POST
/auth/register
create account
body: { username, email, mobile, password }
resp: { account_id, token }

POST
/auth/login
email or mobile + password
body: { identifier, password }   ← email or mobile
resp: { account_id, token, expires_at }

PATCH
/auth/push-token
register Expo push token
body: { expo_push_token }
resp: { ok: true }

PATCH
/auth/notif-prefs
update notification prefs
body: { medication_reminder?, appointment?, telemetry_alert?,
        panic?, quiet_hours?: { enabled, start, end, tz } }
resp: { notif_prefs }   ← full updated object

### Profiles — /profiles

POST
/profiles
create new profile
body: { name, dob, gender?, blood_type?, relation, emergency_contact? }
resp: { profile_id, profile }

POST
/profiles/link
link existing profile by ID
body: { profile_id, relation }
resp: { profile }  or 404 if ID not found

GET
/profiles
all profiles for my account
resp: [ { profile_id, name, dob, relation, linked_accounts_count } ]

GET
/profiles/:id
full profile detail
resp: { profile, linked_accounts: [{ account_id, username, relation }] }

PATCH
/profiles/:id
update profile fields
body: { name?, blood_type?, emergency_contact? }
resp: { profile }

### Medications — /profiles/:pid/medications

GET
/
list active medications
query: ?active=true|false|all  (default: true)
resp: [ { id, name, dosage, frequency, reminder_times, start_date, end_date } ]
POST
/
add medication
body: { name, dosage, frequency, reminder_times: ["08:00","20:00"],
        start_date, end_date?, notes? }
resp: { medication }  → scheduler task created automatically
PATCH
/:med_id
edit or deactivate
body: { active?, dosage?, reminder_times?, end_date? }
resp: { medication }  → Celery task updated/cancelled
DELETE
/:med_id
remove medication
resp: { ok: true }  → Celery task cancelled

### Telemetry — /profiles/:pid/telemetry

POST
/
log a reading
body: { metric_type, value, unit, recorded_at?, notes? }
resp: { telemetry }
GET
/
list readings
query: ?metric_type=bp_systolic&from=2025-01-01&limit=50
resp: [ { id, metric_type, value, unit, recorded_at, recorded_by } ]
DELETE
/:reading_id
remove a reading
resp: { ok: true }

### Medical files — /profiles/:pid/files

POST
/upload-url
get presigned upload URL
body: { file_type, original_name, mime_type, file_size_bytes, encryption_iv }
resp: { file_id, upload_url, storage_key }
  ← client encrypts, uploads to URL directly, then calls /confirm
POST
/:file_id/confirm
trigger OCR after upload
body: {}
resp: { file_id, ocr_status: "processing" }
  ← Gemini OCR queued as background task
GET
/
list files
query: ?file_type=report&limit=20
resp: [ { id, file_type, original_name, ocr_status, uploaded_at } ]
GET
/:file_id/download-url
get presigned download URL
resp: { download_url, encryption_iv }
  ← client downloads, then decrypts locally
DELETE
/:file_id
delete file + storage blob
resp: { ok: true }

### AI — /profiles/:pid/ai

POST
/search
search + summarise history
body: { query: "what was my BP last month?" }
resp: { answer, sources: [ { file_id, snippet } ] }
GET
/suggestions
diet + exercise suggestions
resp: { suggestions, generated_at, disclaimer, cached: bool }
GET
/ocr-status/:file_id
poll OCR progress
resp: { ocr_status: "pending"|"processing"|"done"|"failed" }

### Panic — /profiles/:pid/panic

POST
/trigger
fire panic alert
body: { latitude?, longitude?, message? }
resp: { panic_event_id, notified_count }
  ← fans out push to all linked accounts immediately
PATCH
/:event_id/resolve
mark resolved
body: {}
resp: { status: "resolved", resolved_at }
GET
/history
past panic events
query: ?limit=10
resp: [ { id, triggered_by, status, triggered_at, location } ]

### Reminders — /profiles/:pid/reminders

GET
/today
today's reminder schedule
resp: [ { id, reminder_type, ref_id, name, scheduled_at, status } ]
PATCH
/:log_id/acknowledge
mark taken / seen
body: {}
resp: { status: "acknowledged" }
PATCH
/:log_id/snooze
snooze reminder


The file upload is a two-step flow — /upload-url first, then client encrypts and pushes directly to Supabase Storage, then /confirm to trigger OCR. This keeps encrypted bytes off your FastAPI server entirely, which is both faster and safer.
All profile-scoped endpoints are nested under /profiles/:pid/ — the backend verifies on every request that the calling account is actually linked to that profile via account_profile. This is the RLS policy from the migration reinforced at the application layer too.
/auth/push-token is called once when the app starts and the user logs in — Expo gives you a token, you register it immediately. This is what makes push notifications work on new devices or after reinstalls.
The identifier field on /auth/login accepts either email or mobile — one endpoint, detect format in the backend with a simple regex check.