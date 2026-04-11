-- ============================================================
-- 001_initial.sql
-- Medical Management App — initial schema
-- Run against your Supabase project SQL editor
-- ============================================================

-- Enable UUID generation
create extension if not exists "pgcrypto";

-- Enable full-text search
create extension if not exists "pg_trgm";


-- ============================================================
-- ACCOUNT
-- One row per registered user.
-- notif_prefs is a JSONB blob — see structure below.
-- ============================================================
create table account (
  id               uuid primary key default gen_random_uuid(),
  username         text not null unique,
  email            text not null unique,
  mobile           text not null unique,
  password_hash    text not null,
  notif_prefs      jsonb not null default '{
    "medication_reminder": true,
    "appointment":         true,
    "telemetry_alert":     true,
    "panic":               true,
    "quiet_hours": {
      "enabled": false,
      "start":   "22:00",
      "end":     "07:00",
      "tz":      "Asia/Kolkata"
    }
  }'::jsonb,
  expo_push_token  text,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

comment on column account.notif_prefs is
  'Per-account notification preferences. Panic field is ignored for the '
  'account that presses the button — receivers always get panic alerts.';


-- ============================================================
-- PROFILE
-- One row per person being managed (patient).
-- A profile can be linked to multiple accounts via account_profile.
-- ============================================================
create table profile (
  id                uuid primary key default gen_random_uuid(),
  name              text not null,
  dob               date not null,
  gender            text check (gender in ('male','female','other','prefer_not_to_say')),
  blood_type        text check (blood_type in ('A+','A-','B+','B-','AB+','AB-','O+','O-','unknown')),
  emergency_contact jsonb,
  -- emergency_contact shape: { name, mobile, relation }
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);


-- ============================================================
-- ACCOUNT_PROFILE  (join table — symmetric, equal access)
-- Created when an account creates or links a profile.
-- relation: how this account relates to the profile person.
-- ============================================================
create table account_profile (
  account_id  uuid not null references account(id)  on delete cascade,
  profile_id  uuid not null references profile(id)  on delete cascade,
  relation    text not null default 'self',
  -- e.g. 'self', 'parent', 'child', 'spouse', 'sibling', 'guardian', 'other'
  linked_at   timestamptz not null default now(),
  primary key (account_id, profile_id)
);

create index idx_account_profile_profile on account_profile(profile_id);
create index idx_account_profile_account on account_profile(account_id);


-- ============================================================
-- MEDICAL_FILE
-- Encrypted file blobs stored in Supabase Storage.
-- ai_extracted_text populated by Gemini OCR after upload.
-- ============================================================
create table medical_file (
  id                uuid primary key default gen_random_uuid(),
  profile_id        uuid not null references profile(id) on delete cascade,
  uploaded_by       uuid not null references account(id),
  file_type         text not null check (file_type in ('report','xray','prescription','scan','other')),
  original_name     text not null,
  storage_key       text not null unique,
  -- path inside Supabase Storage bucket, e.g. profiles/{profile_id}/{uuid}.enc
  encryption_iv     text not null,
  -- base64-encoded 16-byte IV, unique per file
  mime_type         text not null,
  file_size_bytes   bigint,
  ai_extracted_text text,
  -- populated asynchronously after upload; null until OCR completes
  ocr_status        text not null default 'pending'
                    check (ocr_status in ('pending','processing','done','failed')),
  notes             text,
  uploaded_at       timestamptz not null default now()
);

create index idx_medical_file_profile on medical_file(profile_id);

-- Full-text search index on extracted text
create index idx_medical_file_fts on medical_file
  using gin(to_tsvector('english', coalesce(ai_extracted_text, '')));


-- ============================================================
-- MEDICATION
-- Scheduled medications only (no PRN / as-needed).
-- reminder_times is an array — supports multiple daily doses.
-- ============================================================
create table medication (
  id             uuid primary key default gen_random_uuid(),
  profile_id     uuid not null references profile(id) on delete cascade,
  added_by       uuid not null references account(id),
  name           text not null,
  dosage         text not null,
  -- e.g. '500mg', '1 tablet', '5ml'
  frequency      text not null check (frequency in ('daily','twice_daily','thrice_daily','weekly','custom')),
  reminder_times time[] not null,
  -- array of times e.g. {08:00, 20:00} for twice daily
  active         boolean not null default true,
  source         text not null default 'manual'
                 check (source in ('manual','ocr','ai_extracted')),
  start_date     date not null default current_date,
  end_date       date,
  -- null = ongoing
  notes          text,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);

create index idx_medication_profile on medication(profile_id);
create index idx_medication_active   on medication(profile_id) where active = true;


-- ============================================================
-- ALLERGY
-- ============================================================
create table allergy (
  id         uuid primary key default gen_random_uuid(),
  profile_id uuid not null references profile(id) on delete cascade,
  name       text not null,
  severity   text check (severity in ('mild','moderate','severe','unknown')),
  source     text not null default 'manual'
             check (source in ('manual','ocr','ai_extracted')),
  notes      text,
  created_at timestamptz not null default now()
);

create index idx_allergy_profile on allergy(profile_id);


-- ============================================================
-- CHRONIC_CONDITION
-- ============================================================
create table chronic_condition (
  id            uuid primary key default gen_random_uuid(),
  profile_id    uuid not null references profile(id) on delete cascade,
  name          text not null,
  diagnosed_on  date,
  status        text not null default 'active'
                check (status in ('active','managed','resolved')),
  source        text not null default 'manual'
                check (source in ('manual','ocr','ai_extracted')),
  notes         text,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create index idx_chronic_condition_profile on chronic_condition(profile_id);


-- ============================================================
-- TELEMETRY
-- Manual entry for BP, blood glucose, SpO2, etc.
-- device_id reserved for future wearable integration.
-- ============================================================
create table telemetry (
  id            uuid primary key default gen_random_uuid(),
  profile_id    uuid not null references profile(id) on delete cascade,
  recorded_by   uuid not null references account(id),
  metric_type   text not null check (metric_type in (
                  'bp_systolic',
                  'bp_diastolic',
                  'blood_glucose',
                  'spo2',
                  'heart_rate',
                  'weight',
                  'temperature',
                  'respiratory_rate'
                )),
  value         numeric not null,
  unit          text not null,
  -- e.g. 'mmHg', 'mg/dL', '%', 'bpm', 'kg', 'C'
  source        text not null default 'manual'
                check (source in ('manual','device')),
  device_id     text,
  -- null for manual; populated when wearable integration added
  notes         text,
  recorded_at   timestamptz not null default now()
);

create index idx_telemetry_profile      on telemetry(profile_id);
create index idx_telemetry_profile_type on telemetry(profile_id, metric_type);
create index idx_telemetry_recorded_at  on telemetry(profile_id, recorded_at desc);


-- ============================================================
-- REMINDER_LOG
-- Written every time a reminder fires. Tracks delivery status.
-- ref_id points to the medication or appointment that triggered it.
-- ============================================================
create table reminder_log (
  id             uuid primary key default gen_random_uuid(),
  profile_id     uuid not null references profile(id) on delete cascade,
  account_id     uuid not null references account(id) on delete cascade,
  -- which account this reminder was sent to
  reminder_type  text not null check (reminder_type in ('medication','appointment')),
  ref_id         uuid not null,
  -- FK to medication.id or appointment.id (soft reference — no FK constraint)
  scheduled_at   timestamptz not null,
  sent_at        timestamptz,
  status         text not null default 'pending'
                 check (status in ('pending','sent','acknowledged','snoozed','missed')),
  snoozed_until  timestamptz,
  created_at     timestamptz not null default now()
);

create index idx_reminder_log_profile on reminder_log(profile_id);
create index idx_reminder_log_status  on reminder_log(status) where status = 'pending';


-- ============================================================
-- PANIC_EVENT
-- Triggered by any account linked to a profile.
-- channel tracks how the alert was delivered.
-- ============================================================
create table panic_event (
  id            uuid primary key default gen_random_uuid(),
  profile_id    uuid not null references profile(id) on delete cascade,
  triggered_by  uuid not null references account(id),
  -- which account pressed the button
  latitude      numeric(9,6),
  longitude     numeric(9,6),
  status        text not null default 'active'
                check (status in ('active','acknowledged','resolved')),
  channel       text not null default 'push'
                check (channel in ('push','sms','call','push+sms')),
  message       text,
  -- optional message from the person who triggered it
  triggered_at  timestamptz not null default now(),
  resolved_at   timestamptz
);

create index idx_panic_event_profile on panic_event(profile_id);
create index idx_panic_event_active  on panic_event(profile_id) where status = 'active';


-- ============================================================
-- PANIC_NOTIFICATION
-- One row per account notified for each panic event.
-- Tracks per-account delivery status.
-- ============================================================
create table panic_notification (
  id              uuid primary key default gen_random_uuid(),
  panic_event_id  uuid not null references panic_event(id) on delete cascade,
  account_id      uuid not null references account(id),
  channel         text not null check (channel in ('push','sms','call')),
  status          text not null default 'pending'
                  check (status in ('pending','sent','failed')),
  sent_at         timestamptz
);

create index idx_panic_notif_event on panic_notification(panic_event_id);


-- ============================================================
-- AUTO-UPDATE updated_at
-- Trigger function applied to tables with updated_at column.
-- ============================================================
create or replace function set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger trg_account_updated_at
  before update on account
  for each row execute function set_updated_at();

create trigger trg_profile_updated_at
  before update on profile
  for each row execute function set_updated_at();

create trigger trg_medication_updated_at
  before update on medication
  for each row execute function set_updated_at();

create trigger trg_chronic_condition_updated_at
  before update on chronic_condition
  for each row execute function set_updated_at();


-- ============================================================
-- ROW LEVEL SECURITY (Supabase)
-- Accounts can only read/write data for profiles they are linked to.
-- Enable RLS on all tables, then define policies.
-- ============================================================
alter table account           enable row level security;
alter table profile            enable row level security;
alter table account_profile    enable row level security;
alter table medical_file       enable row level security;
alter table medication         enable row level security;
alter table allergy            enable row level security;
alter table chronic_condition  enable row level security;
alter table telemetry          enable row level security;
alter table reminder_log       enable row level security;
alter table panic_event        enable row level security;
alter table panic_notification enable row level security;

-- Helper: returns profile IDs the current JWT user is linked to
create or replace function my_profile_ids()
returns setof uuid language sql security definer stable as $$
  select profile_id
  from   account_profile
  where  account_id = auth.uid()
$$;

-- Account: users see only their own row
create policy "account: own row"
  on account for all
  using (id = auth.uid());

-- Profile: accessible if linked
create policy "profile: linked accounts"
  on profile for all
  using (id in (select my_profile_ids()));

-- Account_profile: see your own links
create policy "account_profile: own links"
  on account_profile for all
  using (account_id = auth.uid());

-- All profile-scoped tables: accessible if profile is linked
create policy "medical_file: linked"
  on medical_file for all
  using (profile_id in (select my_profile_ids()));

create policy "medication: linked"
  on medication for all
  using (profile_id in (select my_profile_ids()));

create policy "allergy: linked"
  on allergy for all
  using (profile_id in (select my_profile_ids()));

create policy "chronic_condition: linked"
  on chronic_condition for all
  using (profile_id in (select my_profile_ids()));

create policy "telemetry: linked"
  on telemetry for all
  using (profile_id in (select my_profile_ids()));

create policy "reminder_log: linked"
  on reminder_log for all
  using (profile_id in (select my_profile_ids()));

create policy "panic_event: linked"
  on panic_event for all
  using (profile_id in (select my_profile_ids()));

create policy "panic_notification: own"
  on panic_notification for all
  using (account_id = auth.uid());
