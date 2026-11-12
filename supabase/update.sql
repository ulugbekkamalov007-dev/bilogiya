-- =====================================================================
--  YANGILANISH (schema.sql dan KEYIN, SQL Editor da bir marta ishga tushiring; qayta ishga tushirsa ham zarar yo'q)
--   1) audio material turi        2) "ilovada sayr" va audio hisobi
--   3) reyting (foydalanuvchilar ro'yxati) va boshqalarning hisobotini ko'rish
--   4) ikki admin hisobi (parollarni kirgach o'zgartiring!)
-- =====================================================================
create extension if not exists pgcrypto;

-- 1) yangi turlar
alter table public.items       drop constraint if exists items_kind_check;
alter table public.items       add  constraint items_kind_check check (kind in ('video','audio','pdf','presentation','book','test','link'));
alter table public.usage_daily drop constraint if exists usage_daily_kind_check;
alter table public.usage_daily add  constraint usage_daily_kind_check check (kind in ('app','video','audio','book','test'));

create or replace function public.add_usage(p_kind text, p_item uuid, p_secs int) returns void
language plpgsql security definer set search_path = public as $$
declare d date := (now() at time zone 'Asia/Tashkent')::date;
        s int := greatest(0, least(coalesce(p_secs, 0), 60));
begin
  if auth.uid() is null or s = 0 then return; end if;
  if p_kind not in ('app','video','audio','book','test') then return; end if;
  insert into public.usage_daily (user_id, day, kind, item_id, seconds)
  values (auth.uid(), d, p_kind, coalesce(p_item, '00000000-0000-0000-0000-000000000000'), s)
  on conflict (user_id, day, kind, item_id)
  do update set seconds = public.usage_daily.seconds + excluded.seconds;
  update public.profiles set last_seen = now() where id = auth.uid();
end $$;

-- 2) reyting sozlamalari (admin ilovadan o'zgartiradi)
update public.app_settings
   set value = value || '{"leaderboard": true, "leaderboard_names": "short"}'::jsonb
 where key = 'app' and not (value ? 'leaderboard');

create or replace function public.can_view_reports(p_user uuid) returns boolean
language sql stable security definer set search_path = public as $$
  select auth.uid() is not null and (
    p_user = auth.uid() or public.is_admin()
    or coalesce((select (value->>'leaderboard')::boolean from public.app_settings where key = 'app'), true)
  );
$$;

create or replace function public.report_usage(p_user uuid, p_from date, p_to date)
returns table (day date, kind text, seconds bigint)
language plpgsql stable security definer set search_path = public as $$
begin
  if not public.can_view_reports(p_user) then raise exception 'ruxsat yo''q'; end if;
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
  if not public.can_view_reports(p_user) then raise exception 'ruxsat yo''q'; end if;
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
  if not public.can_view_reports(p_user) then raise exception 'ruxsat yo''q'; end if;
  return query
    select a.id, (a.created_at at time zone 'Asia/Tashkent')::date, a.item_id, i.title,
           a.total, a.correct, a.percent, a.duration_s
    from public.test_attempts a left join public.items i on i.id = a.item_id
    where a.user_id = p_user
      and (a.created_at at time zone 'Asia/Tashkent')::date between p_from and p_to
    order by a.created_at;
end $$;

-- boshqa foydalanuvchining ismi/rasmi (faqat reyting yoqilgan bo'lsa)
create or replace function public.user_card(p_user uuid)
returns table (id uuid, name text, avatar_url text)
language plpgsql stable security definer set search_path = public as $$
declare mode text := coalesce((select value->>'leaderboard_names' from public.app_settings where key = 'app'), 'short');
begin
  if not public.can_view_reports(p_user) then raise exception 'ruxsat yo''q'; end if;
  return query select p.id,
    case when public.is_admin() or mode = 'full' or p.id = auth.uid() then p.full_name
         else split_part(p.full_name, ' ', 1) || case when position(' ' in trim(p.full_name)) > 0 then ' ' || left(split_part(trim(p.full_name), ' ', 2), 1) || '.' else '' end end,
    p.avatar_url
  from public.profiles p where p.id = p_user;
end $$;

-- 3) reyting: barcha foydalanuvchilar, kategoriya bo'yicha vaqt
create or replace function public.leaderboard(p_from date, p_to date)
returns table (user_id uuid, name text, avatar_url text, video bigint, audio bigint, book bigint, test bigint,
               browse bigint, total bigint, tests bigint, avg_percent numeric)
language plpgsql stable security definer set search_path = public as $$
declare mode text := coalesce((select value->>'leaderboard_names' from public.app_settings where key = 'app'), 'short');
begin
  if auth.uid() is null then raise exception 'ruxsat yo''q'; end if;
  if not public.is_admin() and not coalesce((select (value->>'leaderboard')::boolean from public.app_settings where key = 'app'), true) then
    raise exception 'ruxsat yo''q';
  end if;
  return query
  with d as (
    select u.user_id, u.day,
      coalesce(sum(u.seconds) filter (where u.kind = 'video'), 0) v,
      coalesce(sum(u.seconds) filter (where u.kind = 'audio'), 0) a,
      coalesce(sum(u.seconds) filter (where u.kind = 'book'), 0)  b,
      coalesce(sum(u.seconds) filter (where u.kind = 'test'), 0)  t,
      coalesce(sum(u.seconds) filter (where u.kind = 'app'), 0)   p
    from public.usage_daily u where u.day between p_from and p_to group by u.user_id, u.day
  ), g as (
    select d.user_id, sum(v)::bigint v, sum(a)::bigint a, sum(b)::bigint b, sum(t)::bigint t,
           sum(greatest(p - v - a - b - t, 0))::bigint br
    from d group by d.user_id
  )
  select p.id,
    case when public.is_admin() or mode = 'full' or p.id = auth.uid() then p.full_name
         else split_part(p.full_name, ' ', 1) || case when position(' ' in trim(p.full_name)) > 0 then ' ' || left(split_part(trim(p.full_name), ' ', 2), 1) || '.' else '' end end,
    p.avatar_url, g.v, g.a, g.b, g.t, g.br, (g.v + g.a + g.b + g.t + g.br)::bigint,
    (select count(*) from public.test_attempts x where x.user_id = p.id
        and (x.created_at at time zone 'Asia/Tashkent')::date between p_from and p_to)::bigint,
    (select round(avg(x.percent), 1) from public.test_attempts x where x.user_id = p.id
        and (x.created_at at time zone 'Asia/Tashkent')::date between p_from and p_to)
  from g join public.profiles p on p.id = g.user_id
  where p.role = 'user' and (g.v + g.a + g.b + g.t + g.br) > 0
  order by 9 desc limit 300;
end $$;

-- 4) admin emaillari: ro'yxatdan o'tganda avtomatik admin bo'ladi
create or replace function public.handle_new_user() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, email, full_name, gender, lang, role)
  values (
    new.id, new.email,
    coalesce(new.raw_user_meta_data->>'full_name', ''),
    nullif(new.raw_user_meta_data->>'gender', ''),
    coalesce(nullif(new.raw_user_meta_data->>'lang', ''), 'uz'),
    case when lower(new.email) in ('umidjonkamalov21@gmail.com', 'ulugbekkamalov0829@gmail.com') then 'admin' else 'user' end
  )
  on conflict (id) do update set role = excluded.role where excluded.role = 'admin';
  return new;
end $$;

-- 5) ikkita admin hisobi (email tasdiqlangan, parol bilan kirish mumkin)
do $$
declare r record; uid uuid;
begin
  for r in select * from (values
      ('umidjonkamalov21@gmail.com',  'umidjon21',   'Umidjon Kamalov'),
      ('ulugbekkamalov0829@gmail.com', 'ulugbek0829', 'Ulugbek Kamalov')) as v(em, pw, nm)
  loop
    select id into uid from auth.users where lower(email) = r.em;
    if uid is null then
      uid := gen_random_uuid();
      insert into auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
        raw_app_meta_data, raw_user_meta_data, created_at, updated_at,
        confirmation_token, recovery_token, email_change, email_change_token_new,
        email_change_token_current, phone_change, phone_change_token, reauthentication_token)
      values ('00000000-0000-0000-0000-000000000000', uid, 'authenticated', 'authenticated', r.em,
        crypt(r.pw, gen_salt('bf')), now(),
        '{"provider":"email","providers":["email"]}', jsonb_build_object('full_name', r.nm), now(), now(),
        '', '', '', '', '', '', '', '');
      insert into auth.identities (id, user_id, provider_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
      values (gen_random_uuid(), uid, uid::text,
        jsonb_build_object('sub', uid::text, 'email', r.em, 'email_verified', true), 'email', now(), now(), now());
    else
      update auth.users set encrypted_password = crypt(r.pw, gen_salt('bf')),
        email_confirmed_at = coalesce(email_confirmed_at, now()),
        confirmation_token = coalesce(confirmation_token, ''), recovery_token = coalesce(recovery_token, ''),
        email_change = coalesce(email_change, ''), email_change_token_new = coalesce(email_change_token_new, ''),
        email_change_token_current = coalesce(email_change_token_current, ''), phone_change = coalesce(phone_change, ''),
        phone_change_token = coalesce(phone_change_token, ''), reauthentication_token = coalesce(reauthentication_token, '')
      where id = uid;
      if not exists (select 1 from auth.identities where user_id = uid and provider = 'email') then
        insert into auth.identities (id, user_id, provider_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
        values (gen_random_uuid(), uid, uid::text,
          jsonb_build_object('sub', uid::text, 'email', r.em, 'email_verified', true), 'email', now(), now(), now());
      end if;
    end if;
    insert into public.profiles (id, email, full_name, role) values (uid, r.em, r.nm, 'admin')
      on conflict (id) do update set role = 'admin';
  end loop;
end $$;

select email, role, full_name from public.profiles where role = 'admin' order by email;
