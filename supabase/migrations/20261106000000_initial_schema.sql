create table public.rolls (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  name text not null,
  shots_limit integer not null default 10,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  constraint rolls_code_format check (code ~ '^[a-z0-9][a-z0-9-]{2,31}$'),
  constraint rolls_name_not_blank check (length(btrim(name)) > 0),
  constraint rolls_shots_limit_positive check (shots_limit between 1 and 100)
);

create table public.guests (
  id uuid primary key default gen_random_uuid(),
  device_id text not null,
  roll_id uuid not null references public.rolls(id) on delete restrict,
  shots_used integer not null default 0,
  bonus_shots integer not null default 0,
  created_at timestamptz not null default now(),
  constraint guests_device_id_format check (device_id ~ '^[a-f0-9-]{16,64}$'),
  constraint guests_shots_used_non_negative check (shots_used >= 0),
  constraint guests_bonus_shots_non_negative check (bonus_shots >= 0),
  constraint guests_device_roll_unique unique (device_id, roll_id)
);

create table public.photos (
  id uuid primary key default gen_random_uuid(),
  guest_id uuid not null references public.guests(id) on delete cascade,
  roll_id uuid not null references public.rolls(id) on delete restrict,
  storage_path text not null unique,
  status text not null default 'pending',
  width integer not null,
  height integer not null,
  created_at timestamptz not null default now(),
  constraint photos_status_valid check (status in ('pending', 'approved', 'rejected')),
  constraint photos_width_valid check (width > 0 and width <= 20000),
  constraint photos_height_valid check (height > 0 and height <= 20000),
  constraint photos_storage_path_not_blank check (length(btrim(storage_path)) > 0)
);

create table public.refill_codes (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  extra_shots integer not null,
  max_uses integer not null,
  used_count integer not null default 0,
  expires_at timestamptz,
  created_at timestamptz not null default now(),
  constraint refill_codes_code_format check (code ~ '^[A-Z0-9][A-Z0-9-]{2,31}$'),
  constraint refill_codes_extra_shots_positive check (extra_shots > 0),
  constraint refill_codes_max_uses_positive check (max_uses > 0),
  constraint refill_codes_used_count_valid check (used_count >= 0 and used_count <= max_uses)
);

create table public.settings (
  key text primary key,
  value jsonb not null,
  constraint settings_key_format check (key ~ '^[a-z][a-z0-9_]{2,63}$')
);

create table public.upload_reservations (
  id uuid primary key default gen_random_uuid(),
  guest_id uuid not null references public.guests(id) on delete cascade,
  storage_path text not null unique,
  status text not null default 'reserved',
  photo_id uuid references public.photos(id) on delete set null,
  expires_at timestamptz not null,
  created_at timestamptz not null default now(),
  released_at timestamptz,
  confirmed_at timestamptz,
  constraint upload_reservations_status_valid check (status in ('reserved', 'confirmed', 'released')),
  constraint upload_reservations_storage_path_not_blank check (length(btrim(storage_path)) > 0)
);

create index guests_roll_id_idx on public.guests(roll_id);
create index photos_roll_status_created_idx on public.photos(roll_id, status, created_at desc);
create index photos_guest_created_idx on public.photos(guest_id, created_at desc);
create index upload_reservations_guest_status_idx on public.upload_reservations(guest_id, status);
create index upload_reservations_expiry_idx on public.upload_reservations(status, expires_at);

alter table public.rolls enable row level security;
alter table public.guests enable row level security;
alter table public.photos enable row level security;
alter table public.refill_codes enable row level security;
alter table public.settings enable row level security;
alter table public.upload_reservations enable row level security;

revoke all on table public.rolls from anon, authenticated;
revoke all on table public.guests from anon, authenticated;
revoke all on table public.photos from anon, authenticated;
revoke all on table public.refill_codes from anon, authenticated;
revoke all on table public.settings from anon, authenticated;
revoke all on table public.upload_reservations from anon, authenticated;

create or replace function public.claim_shot(p_guest_id uuid)
returns integer
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_remaining integer;
begin
  update public.guests as g
  set shots_used = g.shots_used + 1
  from public.rolls as r
  where g.id = p_guest_id
    and r.id = g.roll_id
    and r.is_active = true
    and g.shots_used < r.shots_limit + g.bonus_shots
  returning (r.shots_limit + g.bonus_shots) - g.shots_used into v_remaining;

  if not found then
    return null;
  end if;

  return v_remaining;
end;
$$;

revoke all on function public.claim_shot(uuid) from public;
revoke all on function public.claim_shot(uuid) from anon, authenticated;
grant execute on function public.claim_shot(uuid) to service_role;

insert into public.settings (key, value)
values
  ('curation_mode', 'false'::jsonb),
  ('gallery_open', 'false'::jsonb),
  ('max_photos_per_hour', '30'::jsonb)
on conflict (key) do nothing;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('photos', 'photos', false, 3145728, array['image/jpeg'])
on conflict (id) do update
set public = false,
    file_size_limit = excluded.file_size_limit,
    allowed_mime_types = excluded.allowed_mime_types;
