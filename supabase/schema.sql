-- =====================================================================
--  BIOLOGIYA PLATFORMASI — Supabase sxemasi (bitta faylda, to'liq)
--  Ishlatish: Supabase → SQL Editor → New query → shu faylni to'liq
--  qo'ying → Run. Qayta ishga tushirish xavfsiz (idempotent) bo'lishga
--  harakat qilingan, lekin birinchi marta toza loyihada ishlating.
-- =====================================================================

create extension if not exists pgcrypto;

-- ---------------------------------------------------------------------
-- 1. JADVALLAR
-- ---------------------------------------------------------------------

create table if not exists public.profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  email       text,
  full_name   text not null default '',
  role        text not null default 'user' check (role in ('user','admin')),
  gender      text check (gender in ('m','f')),
  avatar_url  text,
  lang        text not null default 'uz' check (lang in ('uz','ru','en')),
  prefs       jsonb not null default '{}'::jsonb,   -- bildirishnoma, mavzu va h.k.
  last_seen   timestamptz,
  created_at  timestamptz not null default now()
);

create table if not exists public.app_settings (
  key         text primary key,
  value       jsonb not null,
  updated_at  timestamptz not null default now()
);

-- Drive kabi papkalar (ichma-ich). title/description = {"uz":"..","ru":"..","en":".."}
create table if not exists public.folders (
  id          uuid primary key default gen_random_uuid(),
  parent_id   uuid references public.folders(id) on delete cascade,
  title       jsonb not null,
  description jsonb not null default '{}'::jsonb,
  visible     boolean not null default true,
  price       numeric(12,2) not null default 0,       -- 0 = bepul, >0 = pullik to'plam
  currency    text not null default 'UZS',
  sort        int not null default 0,
  created_by  uuid references public.profiles(id) on delete set null,
  created_at  timestamptz not null default now()
);
create index if not exists folders_parent_idx on public.folders(parent_id);

-- Papka ichidagi materiallar
create table if not exists public.items (
  id           uuid primary key default gen_random_uuid(),
  folder_id    uuid references public.folders(id) on delete cascade,
  kind         text not null check (kind in ('video','pdf','presentation','book','test','link')),
  title        jsonb not null,
  description  jsonb not null default '{}'::jsonb,
  visible      boolean not null default true,
  source       text check (source in ('youtube','url','storage')),
  youtube_id   text,
  url          text,
  storage_path text,
  size_bytes   bigint,
  meta         jsonb not null default '{}'::jsonb,    -- sifat variantlari, boblar, davomiylik...
  sort         int not null default 0,
  created_by   uuid references public.profiles(id) on delete set null,
  created_at   timestamptz not null default now()
);
create index if not exists items_folder_idx on public.items(folder_id);

-- Pullik to'plamlarga kirish huquqi
create table if not exists public.entitlements (
  user_id    uuid not null references public.profiles(id) on delete cascade,
  folder_id  uuid not null references public.folders(id) on delete cascade,
  granted_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  primary key (user_id, folder_id)
);
create table if not exists public.access_requests (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references public.profiles(id) on delete cascade,
  folder_id  uuid not null references public.folders(id) on delete cascade,
  note       text,
  status     text not null default 'pending' check (status in ('pending','approved','rejected')),
  created_at timestamptz not null default now(),
  unique (user_id, folder_id)
);

-- Test savollari. Javob harflari SAQLANMAYDI: to'g'ri javob + noto'g'ri javoblar,
-- A/B/C/D tartibi har safar ilovada tasodifiy aralashtiriladi.
create table if not exists public.questions (
  id          uuid primary key default gen_random_uuid(),
  item_id     uuid not null references public.items(id) on delete cascade,
  position    int not null default 0,
  chapter     text not null default '',               -- bob/mavzu nomi ("" = bobsiz)
  question    text not null,
  correct     text not null,
  wrong       jsonb not null default '[]'::jsonb,     -- ["...","...","..."]
  explanation text,
  created_at  timestamptz not null default now()
);
create index if not exists questions_item_idx on public.questions(item_id);

create table if not exists public.test_attempts (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references public.profiles(id) on delete cascade,
  item_id    uuid references public.items(id) on delete set null,
  total      int not null,
  correct    int not null,
  percent    numeric(5,2) not null,
  duration_s int not null default 0,
  chapters   text[] not null default '{}',
  wrong_ids  uuid[] not null default '{}',
  created_at timestamptz not null default now()
);
create index if not exists attempts_user_idx on public.test_attempts(user_id, created_at desc);

-- Video ko'rish jarayoni (oldinga o'tkazishni cheklash uchun max_pos)
create table if not exists public.video_progress (
  user_id    uuid not null references public.profiles(id) on delete cascade,
  item_id    uuid not null references public.items(id) on delete cascade,
  max_pos    real not null default 0,
  last_pos   real not null default 0,
  duration   real not null default 0,
  completed  boolean not null default false,
  updated_at timestamptz not null default now(),
  primary key (user_id, item_id)
);

-- Kunlik foydalanish vaqti (soniyalarda). kind: app | video | book | test
create table if not exists public.usage_daily (
  user_id uuid not null references public.profiles(id) on delete cascade,
  day     date not null,
  kind    text not null check (kind in ('app','video','book','test')),
  item_id uuid not null default '00000000-0000-0000-0000-000000000000',
  seconds int not null default 0,
  primary key (user_id, day, kind, item_id)
);

-- Guruhlar
create table if not exists public.groups (
  id                 uuid primary key default gen_random_uuid(),
  name               text not null,
  description        text not null default '',
  owner_id           uuid references public.profiles(id) on delete set null,
  students_can_chat  boolean not null default true,   -- false = faqat o'qituvchi yozadi
  show_names         text not null default 'first' check (show_names in ('first','full','anon')),
  archived           boolean not null default false,
  created_at         timestamptz not null default now()
);
create table if not exists public.group_members (
  group_id  uuid not null references public.groups(id) on delete cascade,
  user_id   uuid not null references public.profiles(id) on delete cascade,
  status    text not null default 'pending' check (status in ('pending','approved','blocked')),
  joined_at timestamptz not null default now(),
  primary key (group_id, user_id)
);
create index if not exists gm_user_idx on public.group_members(user_id);

create table if not exists public.assignments (
  id         uuid primary key default gen_random_uuid(),
  group_id   uuid not null references public.groups(id) on delete cascade,
  title      text not null,
  body       text not null default '',
  due_at     timestamptz,
  closed     boolean not null default false,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now()
);
create index if not exists asg_group_idx on public.assignments(group_id, created_at desc);

-- Chat xabarlari. assignment_id != null bo'lsa — xabar faqat vazifa ichida ko'rinadi
-- (shunda guruh chati vazifalar bilan "surilib ketmaydi").
create table if not exists public.messages (
  id            uuid primary key default gen_random_uuid(),
  group_id      uuid not null references public.groups(id) on delete cascade,
  assignment_id uuid references public.assignments(id) on delete cascade,
  user_id       uuid not null references public.profiles(id) on delete cascade,
  sender_name   text not null default '',
  sender_role   text not null default 'user',
  kind          text not null default 'text' check (kind in ('text','voice','image','file')),
  body          text not null default '',
  media_path    text,
  media_secs    int,
  media_expired boolean not null default false,
  created_at    timestamptz not null default now()
);
create index if not exists msg_group_idx on public.messages(group_id, created_at desc);
create index if not exists msg_asg_idx   on public.messages(assignment_id, created_at);

create table if not exists public.submissions (
  id            uuid primary key default gen_random_uuid(),
  assignment_id uuid not null references public.assignments(id) on delete cascade,
  group_id      uuid not null references public.groups(id) on delete cascade,
  user_id       uuid not null references public.profiles(id) on delete cascade,
  sender_name   text not null default '',
  text          text not null default '',
  file_path     text,
  file_name     text,
  voice_path    text,
  voice_secs    int,
  media_expired boolean not null default false,
  grade         int check (grade between 0 and 100),
  feedback      text,
  created_at    timestamptz not null default now()
);
create index if not exists sub_asg_idx on public.submissions(assignment_id);

-- Admin <-> foydalanuvchi shaxsiy yozishmalari. Suhbat kaliti = thread_user (talaba).
create table if not exists public.direct_messages (
  id          uuid primary key default gen_random_uuid(),
  thread_user uuid not null references public.profiles(id) on delete cascade,
  sender_id   uuid not null references public.profiles(id) on delete cascade,
  topic       text check (topic in ('question','help','complaint')),
  kind        text not null default 'text' check (kind in ('text','voice','image')),
  body        text not null default '',
  media_path  text,
  media_secs  int,
  media_expired boolean not null default false,
  read_at     timestamptz,
  created_at  timestamptz not null default now()
);
create index if not exists dm_thread_idx on public.direct_messages(thread_user, created_at);

-- Guruh chatidagi xabar ustidan shikoyat (xavfsizlik)
create table if not exists public.message_reports (
  id         uuid primary key default gen_random_uuid(),
  reporter   uuid not null references public.profiles(id) on delete cascade,
  message_id uuid references public.messages(id) on delete set null,
  group_id   uuid references public.groups(id) on delete cascade,
  reason     text not null default '',
  status     text not null default 'open' check (status in ('open','resolved')),
  created_at timestamptz not null default now()
);

-- E'lon va reklamalar
create table if not exists public.announcements (
  id          uuid primary key default gen_random_uuid(),
  kind        text not null default 'news' check (kind in ('news','ad')),
  title       jsonb not null,
  body        jsonb not null default '{}'::jsonb,
  image_path  text,
  link        text,
  target      text not null default 'all' check (target in ('all','groups','users')),
  group_ids   uuid[] not null default '{}',
  user_ids    uuid[] not null default '{}',
  pinned      boolean not null default false,
  visible     boolean not null default true,
  starts_at   timestamptz not null default now(),
  ends_at     timestamptz,
  created_by  uuid references public.profiles(id) on delete set null,
  created_at  timestamptz not null default now()
);

-- ---------------------------------------------------------------------
-- 2. YORDAMCHI FUNKSIYALAR
-- ---------------------------------------------------------------------

create or replace function public.is_admin() returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.profiles where id = auth.uid() and role = 'admin');
$$;

create or replace function public.is_member(gid uuid) returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.group_members
                 where group_id = gid and user_id = auth.uid() and status = 'approved');
$$;

-- Papka (va barcha ota-papkalari) foydalanuvchiga ko'rinadimi (kartochka sifatida)?
create or replace function public.folder_visible(fid uuid) returns boolean
language plpgsql stable security definer set search_path = public as $$
declare cur uuid := fid; f record; n int := 0;
begin
  if fid is null then return true; end if;
  if public.is_admin() then return true; end if;
  while cur is not null and n < 20 loop
    select visible, parent_id into f from public.folders where id = cur;
    if not found or not f.visible then return false; end if;
    cur := f.parent_id; n := n + 1;
  end loop;
  return true;
end $$;

-- Papka ichidagi materiallarga kirish mumkinmi (pullik bo'lsa — huquq bor yoki yo'q)?
create or replace function public.folder_accessible(fid uuid) returns boolean
language plpgsql stable security definer set search_path = public as $$
declare cur uuid := fid; f record; n int := 0;
begin
  if fid is null then return true; end if;
  if public.is_admin() then return true; end if;
  while cur is not null and n < 20 loop
    select visible, price, parent_id into f from public.folders where id = cur;
    if not found or not f.visible then return false; end if;
    if f.price > 0 and not exists (select 1 from public.entitlements e
                                   where e.user_id = auth.uid() and e.folder_id = cur) then
      return false;
    end if;
    cur := f.parent_id; n := n + 1;
  end loop;
  return true;
end $$;

create or replace function public.item_accessible(iid uuid) returns boolean
language plpgsql stable security definer set search_path = public as $$
declare it record;
begin
  if public.is_admin() then return true; end if;
  select visible, folder_id into it from public.items where id = iid;
  if not found or not it.visible then return false; end if;
  return public.folder_accessible(it.folder_id);
end $$;

-- Yangi foydalanuvchi ro'yxatdan o'tganda profil yaratish
create or replace function public.handle_new_user() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, email, full_name, gender, lang)
  values (
    new.id, new.email,
    coalesce(new.raw_user_meta_data->>'full_name', ''),
    nullif(new.raw_user_meta_data->>'gender', ''),
    coalesce(nullif(new.raw_user_meta_data->>'lang', ''), 'uz')
  )
  on conflict (id) do nothing;
  return new;
end $$;
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users
  for each row execute function public.handle_new_user();

-- Oddiy foydalanuvchi o'z rolini o'zgartira olmasin
create or replace function public.protect_profile() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if new.role is distinct from old.role and not public.is_admin() and auth.uid() is not null then
    new.role := old.role;
  end if;
  if new.email is distinct from old.email and auth.uid() is not null then
    new.email := old.email;
  end if;
  return new;
end $$;
drop trigger if exists protect_profile_trg on public.profiles;
create trigger protect_profile_trg before update on public.profiles
  for each row execute function public.protect_profile();

-- Chat xabarlariga yuboruvchi nomini avtomatik qo'yish (talaba nomi guruh sozlamasiga ko'ra)
create or replace function public.fill_sender() returns trigger
language plpgsql security definer set search_path = public as $$
declare p record; g record; nm text;
begin
  select full_name, role into p from public.profiles where id = new.user_id;
  select show_names into g from public.groups where id = new.group_id;
  nm := coalesce(nullif(trim(p.full_name), ''), 'Foydalanuvchi');
  if p.role <> 'admin' then
    if g.show_names = 'first' then nm := split_part(nm, ' ', 1);
    elsif g.show_names = 'anon' then nm := 'Talaba #' || substr(md5(new.user_id::text), 1, 4);
    end if;
  end if;
  new.sender_name := nm;
  new.sender_role := p.role;
  new.body := left(coalesce(new.body, ''), 2000);
  return new;
end $$;
drop trigger if exists messages_fill on public.messages;
create trigger messages_fill before insert on public.messages
  for each row execute function public.fill_sender();

create or replace function public.fill_submission() returns trigger
language plpgsql security definer set search_path = public as $$
declare p record;
begin
  select full_name into p from public.profiles where id = new.user_id;
  new.sender_name := coalesce(nullif(trim(p.full_name), ''), 'Foydalanuvchi');
  new.text := left(coalesce(new.text, ''), 4000);
  return new;
end $$;
drop trigger if exists submissions_fill on public.submissions;
create trigger submissions_fill before insert on public.submissions
  for each row execute function public.fill_submission();

-- Foydalanish vaqtini qo'shish (har 15-30 soniyada ilovadan chaqiriladi)
create or replace function public.add_usage(p_kind text, p_item uuid, p_secs int) returns void
language plpgsql security definer set search_path = public as $$
declare d date := (now() at time zone 'Asia/Tashkent')::date;
        s int := greatest(0, least(coalesce(p_secs, 0), 60));
begin
  if auth.uid() is null or s = 0 then return; end if;
  if p_kind not in ('app','video','book','test') then return; end if;
  insert into public.usage_daily (user_id, day, kind, item_id, seconds)
  values (auth.uid(), d, p_kind, coalesce(p_item, '00000000-0000-0000-0000-000000000000'), s)
  on conflict (user_id, day, kind, item_id)
  do update set seconds = public.usage_daily.seconds + excluded.seconds;
  update public.profiles set last_seen = now() where id = auth.uid();
end $$;

-- Hisobotlar ---------------------------------------------------------
create or replace function public.report_usage(p_user uuid, p_from date, p_to date)
returns table (day date, kind text, seconds bigint)
language plpgsql stable security definer set search_path = public as $$
begin
  if p_user is distinct from auth.uid() and not public.is_admin() then
    raise exception 'ruxsat yo''q';
  end if;
  return query
    select u.day, u.kind, sum(u.seconds)::bigint
    from public.usage_daily u
    where u.user_id = p_user and u.day between p_from and p_to
    group by u.day, u.kind order by u.day;
end $$;

create or replace function public.report_usage_items(p_user uuid, p_from date, p_to date)
returns table (item_id uuid, kind text, title jsonb, seconds bigint)
language plpgsql stable security definer set search_path = public as $$
begin
  if p_user is distinct from auth.uid() and not public.is_admin() then
    raise exception 'ruxsat yo''q';
  end if;
  return query
    select u.item_id, u.kind, i.title, sum(u.seconds)::bigint
    from public.usage_daily u left join public.items i on i.id = u.item_id
    where u.user_id = p_user and u.day between p_from and p_to and u.kind <> 'app'
    group by u.item_id, u.kind, i.title order by sum(u.seconds) desc limit 50;
end $$;

create or replace function public.report_tests(p_user uuid, p_from date, p_to date)
returns table (id uuid, day date, item_id uuid, title jsonb, total int, correct int, percent numeric, duration_s int)
language plpgsql stable security definer set search_path = public as $$
begin
  if p_user is distinct from auth.uid() and not public.is_admin() then
    raise exception 'ruxsat yo''q';
  end if;
  return query
    select a.id, (a.created_at at time zone 'Asia/Tashkent')::date, a.item_id, i.title,
           a.total, a.correct, a.percent, a.duration_s
    from public.test_attempts a left join public.items i on i.id = a.item_id
    where a.user_id = p_user
      and (a.created_at at time zone 'Asia/Tashkent')::date between p_from and p_to
    order by a.created_at;
end $$;

create or replace function public.admin_users_summary(p_search text default '')
returns table (id uuid, full_name text, email text, role text, last_seen timestamptz,
               secs_7d bigint, secs_total bigint, tests_total bigint, avg_percent numeric)
language plpgsql stable security definer set search_path = public as $$
begin
  if not public.is_admin() then raise exception 'ruxsat yo''q'; end if;
  return query
    select p.id, p.full_name, p.email, p.role, p.last_seen,
      coalesce((select sum(u.seconds) from public.usage_daily u
                where u.user_id = p.id and u.day >= (now() at time zone 'Asia/Tashkent')::date - 6), 0)::bigint,
      coalesce((select sum(u.seconds) from public.usage_daily u where u.user_id = p.id), 0)::bigint,
      (select count(*) from public.test_attempts a where a.user_id = p.id)::bigint,
      (select round(avg(a.percent), 1) from public.test_attempts a where a.user_id = p.id)
    from public.profiles p
    where p_search = '' or p.full_name ilike '%' || p_search || '%' or p.email ilike '%' || p_search || '%'
    order by p.full_name limit 300;
end $$;

create or replace function public.admin_overview(p_from date, p_to date)
returns table (kind text, seconds bigint, users bigint)
language plpgsql stable security definer set search_path = public as $$
begin
  if not public.is_admin() then raise exception 'ruxsat yo''q'; end if;
  return query
    select u.kind, sum(u.seconds)::bigint, count(distinct u.user_id)::bigint
    from public.usage_daily u where u.day between p_from and p_to group by u.kind;
end $$;

create or replace function public.admin_daily_active(p_from date, p_to date)
returns table (day date, users bigint, seconds bigint)
language plpgsql stable security definer set search_path = public as $$
begin
  if not public.is_admin() then raise exception 'ruxsat yo''q'; end if;
  return query
    select u.day, count(distinct u.user_id)::bigint, sum(u.seconds)::bigint
    from public.usage_daily u where u.day between p_from and p_to group by u.day order by u.day;
end $$;

-- Pullik to'plam: so'rovni tasdiqlash / rad etish
create or replace function public.resolve_access_request(p_id uuid, p_approve boolean) returns void
language plpgsql security definer set search_path = public as $$
declare r record;
begin
  if not public.is_admin() then raise exception 'ruxsat yo''q'; end if;
  select * into r from public.access_requests where id = p_id;
  if not found then return; end if;
  if p_approve then
    insert into public.entitlements (user_id, folder_id, granted_by)
    values (r.user_id, r.folder_id, auth.uid()) on conflict do nothing;
    update public.access_requests set status = 'approved' where id = p_id;
  else
    update public.access_requests set status = 'rejected' where id = p_id;
  end if;
end $$;

-- Guruh qidirish (kod/maxfiy ma'lumotsiz). Talaba faqat nomi/tavsifni ko'radi.
create or replace view public.groups_public as
  select id, name, description from public.groups where not archived;
grant select on public.groups_public to authenticated;

-- Guruhga qo'shilish so'rovi
create or replace function public.request_join(p_group uuid) returns void
language plpgsql security definer set search_path = public as $$
begin
  if auth.uid() is null then raise exception 'kirish kerak'; end if;
  insert into public.group_members (group_id, user_id, status)
  values (p_group, auth.uid(), 'pending')
  on conflict (group_id, user_id) do nothing;
end $$;

-- Admin uchun: so'rov yuborgan va a'zolar ro'yxati (ism bilan)
create or replace function public.group_roster(p_group uuid)
returns table (user_id uuid, full_name text, email text, status text, joined_at timestamptz)
language plpgsql stable security definer set search_path = public as $$
begin
  if not public.is_admin() then raise exception 'ruxsat yo''q'; end if;
  return query
    select m.user_id, p.full_name, p.email, m.status, m.joined_at
    from public.group_members m join public.profiles p on p.id = m.user_id
    where m.group_id = p_group order by m.status, p.full_name;
end $$;

-- Foydalanuvchilarni qidirish (admin: shaxsiy e'lon / xabar uchun)
create or replace function public.admin_find_users(p_q text)
returns table (id uuid, full_name text, email text)
language plpgsql stable security definer set search_path = public as $$
begin
  if not public.is_admin() then raise exception 'ruxsat yo''q'; end if;
  return query
    select p.id, p.full_name, p.email from public.profiles p
    where p.full_name ilike '%' || p_q || '%' or p.email ilike '%' || p_q || '%'
    order by p.full_name limit 20;
end $$;

-- Saqlash joyini tozalash: eskirgan chat fayllari ro'yxati (admin tugmasi chaqiradi)
create or replace function public.expired_media(p_days int)
returns table (src text, id uuid, path text)
language plpgsql stable security definer set search_path = public as $$
begin
  if not public.is_admin() then raise exception 'ruxsat yo''q'; end if;
  return query
    select 'msg'::text, m.id, m.media_path from public.messages m
      where m.media_path is not null and not m.media_expired and m.created_at < now() - make_interval(days => p_days)
    union all
    select 'dm', d.id, d.media_path from public.direct_messages d
      where d.media_path is not null and not d.media_expired and d.created_at < now() - make_interval(days => p_days)
    union all
    select 'sub_file', s.id, s.file_path from public.submissions s
      where s.file_path is not null and not s.media_expired and s.created_at < now() - make_interval(days => p_days)
    union all
    select 'sub_voice', s.id, s.voice_path from public.submissions s
      where s.voice_path is not null and not s.media_expired and s.created_at < now() - make_interval(days => p_days);
end $$;

create or replace function public.mark_media_expired(p_src text, p_ids uuid[]) returns void
language plpgsql security definer set search_path = public as $$
begin
  if not public.is_admin() then raise exception 'ruxsat yo''q'; end if;
  if p_src = 'msg' then
    update public.messages set media_expired = true, media_path = null where id = any(p_ids);
  elsif p_src = 'dm' then
    update public.direct_messages set media_expired = true, media_path = null where id = any(p_ids);
  elsif p_src = 'sub_file' then
    update public.submissions set media_expired = true, file_path = null where id = any(p_ids);
  elsif p_src = 'sub_voice' then
    update public.submissions set media_expired = true, voice_path = null where id = any(p_ids);
  end if;
end $$;

create or replace function public.storage_usage()
returns table (bucket text, files bigint, bytes bigint)
language plpgsql stable security definer set search_path = public, storage as $$
begin
  if not public.is_admin() then raise exception 'ruxsat yo''q'; end if;
  return query
    select o.bucket_id::text, count(*)::bigint, coalesce(sum((o.metadata->>'size')::bigint), 0)::bigint
    from storage.objects o group by o.bucket_id;
end $$;

-- ---------------------------------------------------------------------
-- 3. ROW LEVEL SECURITY
-- ---------------------------------------------------------------------
alter table public.profiles         enable row level security;
alter table public.app_settings     enable row level security;
alter table public.folders          enable row level security;
alter table public.items            enable row level security;
alter table public.entitlements     enable row level security;
alter table public.access_requests  enable row level security;
alter table public.questions        enable row level security;
alter table public.test_attempts    enable row level security;
alter table public.video_progress   enable row level security;
alter table public.usage_daily      enable row level security;
alter table public.groups           enable row level security;
alter table public.group_members    enable row level security;
alter table public.assignments      enable row level security;
alter table public.messages         enable row level security;
alter table public.submissions      enable row level security;
alter table public.direct_messages  enable row level security;
alter table public.message_reports  enable row level security;
alter table public.announcements    enable row level security;

-- profiles: o'zini ko'radi/yangilaydi; admin hammasini ko'radi
drop policy if exists p_sel on public.profiles;
create policy p_sel on public.profiles for select using (id = auth.uid() or public.is_admin());
drop policy if exists p_upd on public.profiles;
create policy p_upd on public.profiles for update using (id = auth.uid() or public.is_admin())
  with check (id = auth.uid() or public.is_admin());

-- app_settings
drop policy if exists s_sel on public.app_settings;
create policy s_sel on public.app_settings for select using (auth.uid() is not null);
drop policy if exists s_all on public.app_settings;
create policy s_all on public.app_settings for all using (public.is_admin()) with check (public.is_admin());

-- folders / items
drop policy if exists f_sel on public.folders;
create policy f_sel on public.folders for select using (public.folder_visible(id));
drop policy if exists f_all on public.folders;
create policy f_all on public.folders for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists i_sel on public.items;
create policy i_sel on public.items for select using (
  public.is_admin() or (visible and public.folder_visible(folder_id))
);
-- eslatma: pullik papkadagi material qatori ko'rinadi (qulf belgisi uchun),
-- lekin fayl/savollar va storage'ga kirish folder_accessible() bilan himoyalangan.
drop policy if exists i_all on public.items;
create policy i_all on public.items for all using (public.is_admin()) with check (public.is_admin());

-- entitlements / requests
drop policy if exists e_sel on public.entitlements;
create policy e_sel on public.entitlements for select using (user_id = auth.uid() or public.is_admin());
drop policy if exists e_all on public.entitlements;
create policy e_all on public.entitlements for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists ar_sel on public.access_requests;
create policy ar_sel on public.access_requests for select using (user_id = auth.uid() or public.is_admin());
drop policy if exists ar_ins on public.access_requests;
create policy ar_ins on public.access_requests for insert with check (user_id = auth.uid() and status = 'pending');
drop policy if exists ar_adm on public.access_requests;
create policy ar_adm on public.access_requests for all using (public.is_admin()) with check (public.is_admin());

-- questions: faqat kirish huquqi bor materialniki
drop policy if exists q_sel on public.questions;
create policy q_sel on public.questions for select using (public.item_accessible(item_id));
drop policy if exists q_all on public.questions;
create policy q_all on public.questions for all using (public.is_admin()) with check (public.is_admin());

-- test_attempts
drop policy if exists ta_sel on public.test_attempts;
create policy ta_sel on public.test_attempts for select using (user_id = auth.uid() or public.is_admin());
drop policy if exists ta_ins on public.test_attempts;
create policy ta_ins on public.test_attempts for insert with check (user_id = auth.uid());

-- video_progress
drop policy if exists vp_sel on public.video_progress;
create policy vp_sel on public.video_progress for select using (user_id = auth.uid() or public.is_admin());
drop policy if exists vp_ins on public.video_progress;
create policy vp_ins on public.video_progress for insert with check (user_id = auth.uid());
drop policy if exists vp_upd on public.video_progress;
create policy vp_upd on public.video_progress for update using (user_id = auth.uid()) with check (user_id = auth.uid());

-- usage_daily: faqat add_usage() orqali yoziladi; o'qish report_* orqali, lekin to'g'ridan-to'g'ri ham o'zi ko'ra oladi
drop policy if exists u_sel on public.usage_daily;
create policy u_sel on public.usage_daily for select using (user_id = auth.uid() or public.is_admin());

-- groups: a'zo yoki admin ko'radi; faqat admin boshqaradi
drop policy if exists g_sel on public.groups;
create policy g_sel on public.groups for select using (public.is_admin() or public.is_member(id));
drop policy if exists g_all on public.groups;
create policy g_all on public.groups for all using (public.is_admin()) with check (public.is_admin());

-- group_members: talaba faqat o'z qatorini ko'radi (boshqalarni KO'RMAYDI)
drop policy if exists gm_sel on public.group_members;
create policy gm_sel on public.group_members for select using (user_id = auth.uid() or public.is_admin());
drop policy if exists gm_leave on public.group_members;
create policy gm_leave on public.group_members for delete using (user_id = auth.uid() or public.is_admin());
drop policy if exists gm_adm on public.group_members;
create policy gm_adm on public.group_members for all using (public.is_admin()) with check (public.is_admin());
-- (talaba qo'shilish so'rovini request_join() funksiyasi orqali yuboradi)

-- assignments
drop policy if exists as_sel on public.assignments;
create policy as_sel on public.assignments for select using (public.is_admin() or public.is_member(group_id));
drop policy if exists as_all on public.assignments;
create policy as_all on public.assignments for all using (public.is_admin()) with check (public.is_admin());

-- messages
drop policy if exists m_sel on public.messages;
create policy m_sel on public.messages for select using (public.is_admin() or public.is_member(group_id));
drop policy if exists m_ins on public.messages;
create policy m_ins on public.messages for insert with check (
  user_id = auth.uid() and (
    public.is_admin()
    or (public.is_member(group_id) and (
          assignment_id is not null
          or (select students_can_chat from public.groups g where g.id = group_id)
        ))
  )
);
drop policy if exists m_del on public.messages;
create policy m_del on public.messages for delete using (user_id = auth.uid() or public.is_admin());

-- submissions: talaba faqat o'zinikini, admin hammasini
drop policy if exists sb_sel on public.submissions;
create policy sb_sel on public.submissions for select using (user_id = auth.uid() or public.is_admin());
drop policy if exists sb_ins on public.submissions;
create policy sb_ins on public.submissions for insert with check (
  user_id = auth.uid() and public.is_member(group_id)
  and exists (select 1 from public.assignments a where a.id = assignment_id and not a.closed)
);
drop policy if exists sb_adm on public.submissions;
create policy sb_adm on public.submissions for update using (public.is_admin()) with check (public.is_admin());
drop policy if exists sb_del on public.submissions;
create policy sb_del on public.submissions for delete using (user_id = auth.uid() or public.is_admin());

-- direct_messages
drop policy if exists dm_sel on public.direct_messages;
create policy dm_sel on public.direct_messages for select using (thread_user = auth.uid() or public.is_admin());
drop policy if exists dm_ins on public.direct_messages;
create policy dm_ins on public.direct_messages for insert with check (
  sender_id = auth.uid() and (thread_user = auth.uid() or public.is_admin())
);
drop policy if exists dm_upd on public.direct_messages;
create policy dm_upd on public.direct_messages for update using (thread_user = auth.uid() or public.is_admin());

-- message_reports
drop policy if exists mr_ins on public.message_reports;
create policy mr_ins on public.message_reports for insert with check (reporter = auth.uid());
drop policy if exists mr_adm on public.message_reports;
create policy mr_adm on public.message_reports for all using (public.is_admin()) with check (public.is_admin());

-- announcements
drop policy if exists an_sel on public.announcements;
create policy an_sel on public.announcements for select using (
  public.is_admin() or (
    visible and starts_at <= now() and (ends_at is null or ends_at > now()) and (
      target = 'all'
      or (target = 'users' and auth.uid() = any(user_ids))
      or (target = 'groups' and exists (
            select 1 from public.group_members gm
            where gm.user_id = auth.uid() and gm.status = 'approved' and gm.group_id = any(group_ids)))
    )
  )
);
drop policy if exists an_all on public.announcements;
create policy an_all on public.announcements for all using (public.is_admin()) with check (public.is_admin());

-- ---------------------------------------------------------------------
-- 4. REALTIME (chat uchun)
-- ---------------------------------------------------------------------
do $$ begin
  begin alter publication supabase_realtime add table public.messages;        exception when others then null; end;
  begin alter publication supabase_realtime add table public.direct_messages; exception when others then null; end;
  begin alter publication supabase_realtime add table public.assignments;     exception when others then null; end;
end $$;

-- ---------------------------------------------------------------------
-- 5. STORAGE (fayllar) — buckets va siyosatlar
--   avatars : ochiq o'qish, har kim faqat o'z papkasiga yozadi
--   media   : ochiq o'qish (e'lon rasmlari, muqovalar), faqat admin yozadi
--   content : yopiq (video/pdf/taqdimot), faqat huquqi borlar signed URL oladi
--   chat    : yopiq (guruh/vazifa/DM fayllari)
-- ---------------------------------------------------------------------
insert into storage.buckets (id, name, public, file_size_limit) values
  ('avatars', 'avatars', true, 2097152),
  ('media',   'media',   true, 5242880),
  ('content', 'content', false, 52428800),   -- Supabase bepul rejasi: 50 MB/fayl
  ('chat',    'chat',    false, 10485760)
on conflict (id) do update set file_size_limit = excluded.file_size_limit, public = excluded.public;

create or replace function public.chat_object_ok(p_name text, p_write boolean) returns boolean
language plpgsql stable security definer set search_path = public, storage as $$
declare parts text[] := storage.foldername(p_name); gid uuid;
begin
  if auth.uid() is null then return false; end if;
  if public.is_admin() then return true; end if;
  if parts[1] = 'dm' then
    return parts[2] = auth.uid()::text;                       -- dm/<thread_user>/...
  end if;
  begin gid := parts[1]::uuid; exception when others then return false; end;
  if not public.is_member(gid) then return false; end if;
  if p_write then return parts[2] = auth.uid()::text; end if;  -- <group>/<uid>/...
  return true;
end $$;

create or replace function public.content_object_ok(p_name text) returns boolean
language plpgsql stable security definer set search_path = public, storage as $$
declare iid uuid;
begin
  begin iid := (storage.foldername(p_name))[1]::uuid; exception when others then return false; end;
  return public.item_accessible(iid);
end $$;

-- avatars
drop policy if exists st_av_read on storage.objects;
create policy st_av_read on storage.objects for select using (bucket_id = 'avatars');
drop policy if exists st_av_write on storage.objects;
create policy st_av_write on storage.objects for insert to authenticated
  with check (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);
drop policy if exists st_av_upd on storage.objects;
create policy st_av_upd on storage.objects for update to authenticated
  using (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);
drop policy if exists st_av_del on storage.objects;
create policy st_av_del on storage.objects for delete to authenticated
  using (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);

-- media
drop policy if exists st_md_read on storage.objects;
create policy st_md_read on storage.objects for select using (bucket_id = 'media');
drop policy if exists st_md_write on storage.objects;
create policy st_md_write on storage.objects for all to authenticated
  using (bucket_id = 'media' and public.is_admin()) with check (bucket_id = 'media' and public.is_admin());

-- content
drop policy if exists st_ct_read on storage.objects;
create policy st_ct_read on storage.objects for select to authenticated
  using (bucket_id = 'content' and public.content_object_ok(name));
drop policy if exists st_ct_write on storage.objects;
create policy st_ct_write on storage.objects for all to authenticated
  using (bucket_id = 'content' and public.is_admin()) with check (bucket_id = 'content' and public.is_admin());

-- chat
drop policy if exists st_ch_read on storage.objects;
create policy st_ch_read on storage.objects for select to authenticated
  using (bucket_id = 'chat' and public.chat_object_ok(name, false));
drop policy if exists st_ch_ins on storage.objects;
create policy st_ch_ins on storage.objects for insert to authenticated
  with check (bucket_id = 'chat' and public.chat_object_ok(name, true));
drop policy if exists st_ch_del on storage.objects;
create policy st_ch_del on storage.objects for delete to authenticated
  using (bucket_id = 'chat' and public.is_admin());

-- ---------------------------------------------------------------------
-- 6. BOSHLANG'ICH SOZLAMALAR (admin keyin ilovaning o'zidan o'zgartiradi)
-- ---------------------------------------------------------------------
insert into public.app_settings (key, value) values
 ('video', '{
    "allow_forward_seek": false,
    "forward_tolerance_s": 2,
    "rewind_step_s": 10,
    "allowed_speeds": [0.75, 1, 1.25, 1.5],
    "default_quality": "auto",
    "resume": true,
    "complete_pct": 90,
    "watermark": true,
    "pause_when_hidden": true
  }'::jsonb),
 ('app', '{
    "app_name": "BioAcademy",
    "pin_max_attempts": 5,
    "autolock_minutes": 1,
    "chat_media_days": 60,
    "max_voice_seconds": 120
  }'::jsonb)
on conflict (key) do nothing;

-- ---------------------------------------------------------------------
-- 7. BIRINCHI ADMINNI TAYINLASH (ro'yxatdan o'tgandan KEYIN, o'z emailingizni yozing):
--   update public.profiles set role = 'admin' where email = 'sizning@email.com';
-- ---------------------------------------------------------------------
