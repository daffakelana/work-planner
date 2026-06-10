-- ============================================================
--  RunPlanner — Skema Database (Supabase / PostgreSQL)
--  Jalankan di Supabase SQL Editor pada project baru.
-- ============================================================

-- ---------- 0. EXTENSIONS ----------
create extension if not exists pgcrypto;  -- untuk gen_random_uuid()

-- ---------- 1. ENUMS ----------
create type workout_category as enum ('running', 'strength', 'rest');
create type run_subtype      as enum ('easy', 'long', 'interval', 'tempo', 'recovery', 'fartlek');
create type strength_focus   as enum ('full', 'lower', 'upper', 'core');
create type workout_status   as enum ('planned', 'done', 'skipped');
create type intensity_zone   as enum ('Z1', 'Z2', 'Z3', 'Z4', 'Z5');
-- Urutan deklarasi = urutan sort, jadi ORDER BY day_of_week otomatis Senin→Minggu.
create type day_of_week      as enum ('Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun');
create type block_kind       as enum ('warmup', 'cooldown');
create type recovery_type    as enum ('jog', 'walk', 'rest');

-- ---------- 2. HELPER: auto-update updated_at ----------
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ============================================================
--  3. TABEL
-- ============================================================

-- 3.1 PROFIL (memperluas auth.users)
create table public.profiles (
  id          uuid primary key references auth.users (id) on delete cascade,
  full_name   text,
  location    text,
  monthly_goal_km numeric(6,1),
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- 3.2 BLOK reusable (Warm Up / Cool Down)
create table public.blocks (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users (id) on delete cascade,
  kind        block_kind not null,
  name        text not null,
  value       text,                       -- mis. "10 menit"
  steps       text[] not null default '{}',
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- 3.3 SESI LATIHAN (inti)
create table public.workouts (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid not null references auth.users (id) on delete cascade,

  -- penjadwalan
  week_index      integer not null default 0,        -- 0 = minggu ini
  day_of_week     day_of_week not null,
  session_date    date,                               -- opsional: tanggal kalender pasti

  -- klasifikasi
  category        workout_category not null,
  subtype         run_subtype,                        -- diisi bila category = running
  focus           strength_focus,                     -- diisi bila category = strength
  status          workout_status not null default 'planned',
  goal            text,
  note            text,

  -- target RUNNING
  distance_km     numeric(5,2),
  duration_min    integer,
  pace_min        text,                               -- "6:30"
  pace_max        text,                               -- "6:50"
  rpe             smallint check (rpe between 1 and 10),
  zone            intensity_zone,
  hr_min          integer,
  hr_max          integer,
  warm_up_id      uuid references public.blocks (id) on delete set null,
  cool_down_id    uuid references public.blocks (id) on delete set null,

  -- target STRENGTH
  equipment       text[] not null default '{}',

  -- HASIL AKTUAL (diisi setelah selesai)
  actual_distance_km numeric(5,2),
  actual_duration_min integer,
  actual_pace_avg    text,
  actual_rpe         smallint check (actual_rpe between 1 and 10),
  actual_hr_avg      integer,
  actual_note        text,
  completed_at       date,

  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),

  -- jaga konsistensi: field per kategori
  constraint running_has_subtype check (category <> 'running' or subtype is not null),
  constraint strength_has_focus  check (category <> 'strength' or focus is not null)
);

-- 3.4 STRUKTUR REPETISI (untuk interval/tempo/fartlek) — 1 sesi : banyak segmen
create table public.workout_segments (
  id              uuid primary key default gen_random_uuid(),
  workout_id      uuid not null references public.workouts (id) on delete cascade,
  user_id         uuid not null references auth.users (id) on delete cascade,
  position        integer not null default 0,         -- urutan tampil
  label           text,                               -- "Interval utama"
  sets            integer not null default 1,
  work_value      text,                               -- "400 m" / "3 menit"
  target_pace     text,                               -- "4:45–4:50"
  recovery_type   recovery_type default 'jog',
  recovery_value  text                                -- "200 m" / "90 detik"
);

-- 3.5 GERAKAN STRENGTH — 1 sesi : banyak gerakan
create table public.workout_exercises (
  id              uuid primary key default gen_random_uuid(),
  workout_id      uuid not null references public.workouts (id) on delete cascade,
  user_id         uuid not null references auth.users (id) on delete cascade,
  position        integer not null default 0,
  name            text not null,
  sets            integer not null default 0,
  reps            integer not null default 0,
  load_kg         numeric(6,2) not null default 0,
  rest_sec        integer not null default 0
);

-- ---------- 4. INDEXES ----------
create index idx_workouts_user_week on public.workouts (user_id, week_index, day_of_week);
create index idx_workouts_user_status on public.workouts (user_id, status);
create index idx_blocks_user_kind on public.blocks (user_id, kind);
create index idx_segments_workout on public.workout_segments (workout_id, position);
create index idx_exercises_workout on public.workout_exercises (workout_id, position);

-- ---------- 5. TRIGGERS updated_at ----------
create trigger trg_profiles_updated  before update on public.profiles
  for each row execute function public.set_updated_at();
create trigger trg_blocks_updated    before update on public.blocks
  for each row execute function public.set_updated_at();
create trigger trg_workouts_updated  before update on public.workouts
  for each row execute function public.set_updated_at();

-- ---------- 6. AUTO-BUAT PROFIL SAAT SIGNUP ----------
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, coalesce(new.raw_user_meta_data ->> 'full_name', ''));
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ============================================================
--  7. ROW LEVEL SECURITY — tiap user hanya akses datanya sendiri
-- ============================================================
alter table public.profiles          enable row level security;
alter table public.blocks            enable row level security;
alter table public.workouts          enable row level security;
alter table public.workout_segments  enable row level security;
alter table public.workout_exercises enable row level security;

-- profiles: id = user
create policy "profiles_select" on public.profiles for select using (auth.uid() = id);
create policy "profiles_update" on public.profiles for update using (auth.uid() = id);
create policy "profiles_insert" on public.profiles for insert with check (auth.uid() = id);

-- helper macro: tabel ber-user_id
create policy "blocks_all" on public.blocks
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "workouts_all" on public.workouts
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "segments_all" on public.workout_segments
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "exercises_all" on public.workout_exercises
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
