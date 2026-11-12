-- update5.sql — reyting tuzatildi (testli foydalanuvchilar ham chiqadi) + pullik tizim. Qayta ishga tushirsa ham xavfsiz.

-- 1) REYTING: vaqti 0, lekin test topshirgan foydalanuvchilar ham ro'yxatga kiradi
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
  ), ta as (
    select x.user_id, count(*)::bigint n, round(avg(x.percent), 1) av
    from public.test_attempts x where (x.created_at at time zone 'Asia/Tashkent')::date between p_from and p_to group by x.user_id
  )
  select p.id,
    case when public.is_admin() or mode = 'full' or p.id = auth.uid() then p.full_name
         else split_part(p.full_name, ' ', 1) || case when position(' ' in trim(p.full_name)) > 0 then ' ' || left(split_part(trim(p.full_name), ' ', 2), 1) || '.' else '' end end,
    p.avatar_url,
    coalesce(g.v, 0)::bigint, coalesce(g.a, 0)::bigint, coalesce(g.b, 0)::bigint, coalesce(g.t, 0)::bigint, coalesce(g.br, 0)::bigint,
    (coalesce(g.v, 0) + coalesce(g.a, 0) + coalesce(g.b, 0) + coalesce(g.t, 0) + coalesce(g.br, 0))::bigint,
    coalesce(ta.n, 0)::bigint, ta.av
  from public.profiles p
  left join g on g.user_id = p.id
  left join ta on ta.user_id = p.id
  where p.role = 'user' and (g.user_id is not null or ta.user_id is not null)
  order by 9 desc, 10 desc limit 300;
end $$;

-- 2) PULLIK TIZIM
create table if not exists public.subscriptions (
  user_id    uuid primary key references public.profiles(id) on delete cascade,
  paid_until timestamptz not null,
  granted_by uuid references public.profiles(id) on delete set null,
  note       text,
  updated_at timestamptz not null default now()
);
create table if not exists public.payment_requests (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references public.profiles(id) on delete cascade,
  amount      numeric,
  note        text not null default '',
  status      text not null default 'pending' check (status in ('pending','approved','rejected')),
  created_at  timestamptz not null default now(),
  resolved_at timestamptz
);
alter table public.subscriptions enable row level security;
alter table public.payment_requests enable row level security;
drop policy if exists sub_sel on public.subscriptions;
create policy sub_sel on public.subscriptions for select using (user_id = auth.uid() or public.is_admin());
drop policy if exists sub_all on public.subscriptions;
create policy sub_all on public.subscriptions for all using (public.is_admin()) with check (public.is_admin());
drop policy if exists pr_sel on public.payment_requests;
create policy pr_sel on public.payment_requests for select using (user_id = auth.uid() or public.is_admin());
drop policy if exists pr_ins on public.payment_requests;
create policy pr_ins on public.payment_requests for insert with check (user_id = auth.uid() and status = 'pending');
drop policy if exists pr_adm on public.payment_requests;
create policy pr_adm on public.payment_requests for all using (public.is_admin()) with check (public.is_admin());

-- Foydalanish huquqi bormi: admin, yoki pullik tizim o'chiq, yoki obuna faol
create or replace function public.has_access() returns boolean
language sql stable security definer set search_path = public as $$
  select public.is_admin()
      or not coalesce((select (value->>'enabled')::boolean from public.app_settings where key = 'billing'), false)
      or exists (select 1 from public.subscriptions s where s.user_id = auth.uid() and s.paid_until > now());
$$;
grant execute on function public.has_access() to authenticated;

-- Pullik tizim yoqilgan bo'lsa, ruxsatsiz hech kim fayl/video/audio/savollarga kira olmaydi (storage ham shu orqali himoyalangan)
create or replace function public.folder_accessible(fid uuid) returns boolean
language plpgsql stable security definer set search_path = public as $$
declare cur uuid := fid; f record; n int := 0;
begin
  if public.is_admin() then return true; end if;
  if not public.has_access() then return false; end if;
  if fid is null then return true; end if;
  while cur is not null and n < 20 loop
    select visible, price, parent_id into f from public.folders where id = cur;
    if not found or not f.visible then return false; end if;
    if f.price > 0 and not exists (select 1 from public.entitlements e where e.user_id = auth.uid() and e.folder_id = cur) then
      return false;
    end if;
    cur := f.parent_id; n := n + 1;
  end loop;
  return true;
end $$;

-- Admin: obuna berish (oy hisobida, mavjud muddatga qo'shiladi) va bekor qilish
create or replace function public.grant_subscription(p_user uuid, p_months int, p_request uuid default null) returns timestamptz
language plpgsql security definer set search_path = public as $$
declare cur timestamptz; nu timestamptz;
begin
  if not public.is_admin() then raise exception 'ruxsat yo''q'; end if;
  if p_months is null or p_months < 1 or p_months > 36 then raise exception 'oy soni noto''g''ri'; end if;
  select paid_until into cur from public.subscriptions where user_id = p_user;
  nu := greatest(coalesce(cur, now()), now()) + (p_months * 30) * interval '1 day';
  insert into public.subscriptions (user_id, paid_until, granted_by, updated_at) values (p_user, nu, auth.uid(), now())
    on conflict (user_id) do update set paid_until = excluded.paid_until, granted_by = excluded.granted_by, updated_at = now();
  if p_request is not null then update public.payment_requests set status = 'approved', resolved_at = now() where id = p_request; end if;
  return nu;
end $$;
grant execute on function public.grant_subscription(uuid, int, uuid) to authenticated;

create or replace function public.revoke_subscription(p_user uuid) returns void
language plpgsql security definer set search_path = public as $$
begin
  if not public.is_admin() then raise exception 'ruxsat yo''q'; end if;
  delete from public.subscriptions where user_id = p_user;
end $$;
grant execute on function public.revoke_subscription(uuid) to authenticated;
