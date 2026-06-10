-- ============================================================
--  RunPlanner — Fungsi CRUD (Supabase RPC)
--  Jalankan SETELAH schema.sql. Dipanggil dari client via supabase.rpc(...).
--  Semua security invoker → RLS tetap berlaku (auth.uid()).
-- ============================================================

-- ---------- helper: ganti seluruh anak (segmen & gerakan) ----------
create or replace function public._replace_children(
  p_workout_id uuid,
  p_uid uuid,
  p_segments jsonb,
  p_exercises jsonb
) returns void
language plpgsql
security invoker
as $$
begin
  delete from public.workout_segments  where workout_id = p_workout_id;
  delete from public.workout_exercises where workout_id = p_workout_id;

  insert into public.workout_segments
    (workout_id, user_id, position, label, sets, work_value, target_pace, recovery_type, recovery_value)
  select
    p_workout_id, p_uid, ord - 1,
    e->>'label',
    coalesce(nullif(e->>'sets','')::int, 1),
    e#>>'{work,value}',
    e->>'targetPace',
    coalesce(nullif(e#>>'{recovery,type}','')::recovery_type, 'jog'),
    e#>>'{recovery,value}'
  from jsonb_array_elements(coalesce(p_segments, '[]'::jsonb)) with ordinality as t(e, ord);

  insert into public.workout_exercises
    (workout_id, user_id, position, name, sets, reps, load_kg, rest_sec)
  select
    p_workout_id, p_uid, ord - 1,
    e->>'name',
    coalesce(nullif(e->>'sets','')::int, 0),
    coalesce(nullif(e->>'reps','')::int, 0),
    coalesce(nullif(e->>'loadKg','')::numeric, 0),
    coalesce(nullif(e->>'restSec','')::int, 0)
  from jsonb_array_elements(coalesce(p_exercises, '[]'::jsonb)) with ordinality as t(e, ord);
end;
$$;

-- ============================================================
--  READ — semua sesi user, bentuk siap pakai (camelCase + nested)
-- ============================================================
create or replace function public.get_workouts()
returns jsonb
language sql
security invoker
stable
as $$
  select coalesce(jsonb_agg(t.obj order by t.week_index, t.day_of_week), '[]'::jsonb)
  from (
    select
      wo.week_index,
      wo.day_of_week,
      jsonb_build_object(
        'id', wo.id,
        'week', wo.week_index,
        'day', wo.day_of_week::text,
        'sessionDate', wo.session_date,
        'category', wo.category::text,
        'subtype', wo.subtype::text,
        'focus', wo.focus::text,
        'status', wo.status::text,
        'goal', wo.goal,
        'note', wo.note,
        'distanceKm', wo.distance_km,
        'durationMin', wo.duration_min,
        'paceMin', wo.pace_min,
        'paceMax', wo.pace_max,
        'rpe', wo.rpe,
        'zone', wo.zone::text,
        'hrMin', wo.hr_min,
        'hrMax', wo.hr_max,
        'warmUpId', wo.warm_up_id,
        'coolDownId', wo.cool_down_id,
        'equipment', to_jsonb(wo.equipment),
        'actualDistanceKm', wo.actual_distance_km,
        'actualDurationMin', wo.actual_duration_min,
        'actualPaceAvg', wo.actual_pace_avg,
        'actualRpe', wo.actual_rpe,
        'actualHrAvg', wo.actual_hr_avg,
        'actualNote', wo.actual_note,
        'completedAt', wo.completed_at,
        'structure', coalesce((
          select jsonb_agg(jsonb_build_object(
            'label', s.label,
            'sets', s.sets,
            'work', jsonb_build_object('value', s.work_value),
            'targetPace', s.target_pace,
            'recovery', jsonb_build_object('type', s.recovery_type::text, 'value', s.recovery_value)
          ) order by s.position)
          from public.workout_segments s where s.workout_id = wo.id), '[]'::jsonb),
        'exercises', coalesce((
          select jsonb_agg(jsonb_build_object(
            'name', e.name, 'sets', e.sets, 'reps', e.reps, 'loadKg', e.load_kg, 'restSec', e.rest_sec
          ) order by e.position)
          from public.workout_exercises e where e.workout_id = wo.id), '[]'::jsonb)
      ) as obj
    from public.workouts wo
  ) t;
$$;

-- ============================================================
--  CREATE — sisipkan sesi + anak-anaknya (atomic), kembalikan id baru
-- ============================================================
create or replace function public.create_workout(
  p_workout jsonb,
  p_segments jsonb default '[]'::jsonb,
  p_exercises jsonb default '[]'::jsonb
) returns uuid
language plpgsql
security invoker
as $$
declare
  v_uid uuid := auth.uid();
  v_id uuid;
begin
  if v_uid is null then
    raise exception 'Tidak ada user yang login';
  end if;

  insert into public.workouts (
    user_id, week_index, day_of_week, session_date, category, subtype, focus, status, goal, note,
    distance_km, duration_min, pace_min, pace_max, rpe, zone, hr_min, hr_max, warm_up_id, cool_down_id, equipment,
    actual_distance_km, actual_duration_min, actual_pace_avg, actual_rpe, actual_hr_avg, actual_note, completed_at
  ) values (
    v_uid,
    coalesce(nullif(p_workout->>'week','')::int, 0),
    (p_workout->>'day')::day_of_week,
    nullif(p_workout->>'sessionDate','')::date,
    (p_workout->>'category')::workout_category,
    nullif(p_workout->>'subtype','')::run_subtype,
    nullif(p_workout->>'focus','')::strength_focus,
    coalesce(nullif(p_workout->>'status','')::workout_status, 'planned'),
    p_workout->>'goal',
    p_workout->>'note',
    nullif(p_workout->>'distanceKm','')::numeric,
    nullif(p_workout->>'durationMin','')::int,
    p_workout->>'paceMin',
    p_workout->>'paceMax',
    nullif(p_workout->>'rpe','')::smallint,
    nullif(p_workout->>'zone','')::intensity_zone,
    nullif(p_workout->>'hrMin','')::int,
    nullif(p_workout->>'hrMax','')::int,
    nullif(p_workout->>'warmUpId','')::uuid,
    nullif(p_workout->>'coolDownId','')::uuid,
    coalesce((select array(select jsonb_array_elements_text(p_workout->'equipment'))), '{}'),
    nullif(p_workout->>'actualDistanceKm','')::numeric,
    nullif(p_workout->>'actualDurationMin','')::int,
    p_workout->>'actualPaceAvg',
    nullif(p_workout->>'actualRpe','')::smallint,
    nullif(p_workout->>'actualHrAvg','')::int,
    p_workout->>'actualNote',
    nullif(p_workout->>'completedAt','')::date
  ) returning id into v_id;

  perform public._replace_children(v_id, v_uid, p_segments, p_exercises);
  return v_id;
end;
$$;

-- ============================================================
--  UPDATE — perbarui sesi + ganti seluruh anaknya (atomic)
-- ============================================================
create or replace function public.update_workout(
  p_id uuid,
  p_workout jsonb,
  p_segments jsonb default '[]'::jsonb,
  p_exercises jsonb default '[]'::jsonb
) returns void
language plpgsql
security invoker
as $$
declare
  v_uid uuid := auth.uid();
begin
  update public.workouts set
    week_index          = coalesce(nullif(p_workout->>'week','')::int, 0),
    day_of_week         = (p_workout->>'day')::day_of_week,
    session_date        = nullif(p_workout->>'sessionDate','')::date,
    category            = (p_workout->>'category')::workout_category,
    subtype             = nullif(p_workout->>'subtype','')::run_subtype,
    focus               = nullif(p_workout->>'focus','')::strength_focus,
    status              = coalesce(nullif(p_workout->>'status','')::workout_status, 'planned'),
    goal                = p_workout->>'goal',
    note                = p_workout->>'note',
    distance_km         = nullif(p_workout->>'distanceKm','')::numeric,
    duration_min        = nullif(p_workout->>'durationMin','')::int,
    pace_min            = p_workout->>'paceMin',
    pace_max            = p_workout->>'paceMax',
    rpe                 = nullif(p_workout->>'rpe','')::smallint,
    zone                = nullif(p_workout->>'zone','')::intensity_zone,
    hr_min              = nullif(p_workout->>'hrMin','')::int,
    hr_max              = nullif(p_workout->>'hrMax','')::int,
    warm_up_id          = nullif(p_workout->>'warmUpId','')::uuid,
    cool_down_id        = nullif(p_workout->>'coolDownId','')::uuid,
    equipment           = coalesce((select array(select jsonb_array_elements_text(p_workout->'equipment'))), '{}'),
    actual_distance_km  = nullif(p_workout->>'actualDistanceKm','')::numeric,
    actual_duration_min = nullif(p_workout->>'actualDurationMin','')::int,
    actual_pace_avg     = p_workout->>'actualPaceAvg',
    actual_rpe          = nullif(p_workout->>'actualRpe','')::smallint,
    actual_hr_avg       = nullif(p_workout->>'actualHrAvg','')::int,
    actual_note         = p_workout->>'actualNote',
    completed_at        = nullif(p_workout->>'completedAt','')::date
  where id = p_id and user_id = v_uid;

  perform public._replace_children(p_id, v_uid, p_segments, p_exercises);
end;
$$;

-- ============================================================
--  DELETE — anak ikut terhapus via ON DELETE CASCADE
-- ============================================================
create or replace function public.delete_workout(p_id uuid)
returns void
language sql
security invoker
as $$
  delete from public.workouts where id = p_id;
$$;

-- ============================================================
--  BLOK Warm Up / Cool Down — save (insert/update) & delete
-- ============================================================
create or replace function public.save_block(p_id uuid, p_block jsonb)
returns uuid
language plpgsql
security invoker
as $$
declare
  v_uid uuid := auth.uid();
  v_id uuid;
  v_steps text[] := coalesce((select array(select jsonb_array_elements_text(p_block->'steps'))), '{}');
begin
  if p_id is null then
    insert into public.blocks (user_id, kind, name, value, steps)
    values (v_uid, (p_block->>'kind')::block_kind, p_block->>'name', p_block->>'value', v_steps)
    returning id into v_id;
  else
    update public.blocks set
      kind = (p_block->>'kind')::block_kind,
      name = p_block->>'name',
      value = p_block->>'value',
      steps = v_steps
    where id = p_id and user_id = v_uid
    returning id into v_id;
  end if;
  return v_id;
end;
$$;

create or replace function public.delete_block(p_id uuid)
returns void
language sql
security invoker
as $$
  delete from public.blocks where id = p_id;
$$;

-- ---------- hak akses RPC ----------
grant execute on function public.get_workouts()                       to authenticated;
grant execute on function public.create_workout(jsonb, jsonb, jsonb)  to authenticated;
grant execute on function public.update_workout(uuid, jsonb, jsonb, jsonb) to authenticated;
grant execute on function public.delete_workout(uuid)                 to authenticated;
grant execute on function public.save_block(uuid, jsonb)              to authenticated;
grant execute on function public.delete_block(uuid)                   to authenticated;
