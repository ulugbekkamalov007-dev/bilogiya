-- =====================================================================
--  update3.sql — audio yuklash tuzatishi + foydalanuvchini bloklash / o'chirish
--  Supabase → SQL Editor → New query → shu faylni qo'ying → Run. Qayta ishga tushirish xavfsiz.
-- =====================================================================

-- 1) Audio materiallarga ruxsat ("items_kind_check" xatosi shundan chiqqan edi)
alter table public.items drop constraint if exists items_kind_check;
alter table public.items add constraint items_kind_check
  check (kind in ('video','audio','pdf','presentation','book','test','link'));
alter table public.usage_daily drop constraint if exists usage_daily_kind_check;
alter table public.usage_daily add constraint usage_daily_kind_check
  check (kind in ('app','video','audio','book','test'));

-- 2) Bloklash belgisi
alter table public.profiles add column if not exists blocked boolean not null default false;

-- foydalanuvchi o'zini blokdan chiqara olmasin
create or replace function public.protect_profile() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if new.role is distinct from old.role and not public.is_admin() and auth.uid() is not null then new.role := old.role; end if;
  if new.blocked is distinct from old.blocked and not public.is_admin() and auth.uid() is not null then new.blocked := old.blocked; end if;
  if new.email is distinct from old.email and auth.uid() is not null then new.email := old.email; end if;
  return new;
end $$;

-- 3) Admin: bloklash / blokdan chiqarish
create or replace function public.admin_set_block(p_id uuid, p_block boolean) returns void
language plpgsql security definer set search_path = public, auth as $$
begin
  if not public.is_admin() then raise exception 'ruxsat yo''q'; end if;
  if p_id = auth.uid() then raise exception 'o''zingizni bloklab bo''lmaydi'; end if;
  if exists (select 1 from public.profiles where id = p_id and role = 'admin') then
    raise exception 'adminni bloklab bo''lmaydi (avval oddiy foydalanuvchi qiling)';
  end if;
  update public.profiles set blocked = p_block where id = p_id;
  update auth.users set banned_until = case when p_block then now() + interval '100 years' else null end where id = p_id;
  if p_block then
    begin delete from auth.sessions where user_id = p_id; exception when others then null; end;
  end if;
end $$;

-- 4) Admin: foydalanuvchini butunlay o'chirish (profil va barcha ma'lumotlari bilan)
create or replace function public.admin_delete_user(p_id uuid) returns void
language plpgsql security definer set search_path = public, auth as $$
begin
  if not public.is_admin() then raise exception 'ruxsat yo''q'; end if;
  if p_id = auth.uid() then raise exception 'o''zingizni o''chirib bo''lmaydi'; end if;
  if exists (select 1 from public.profiles where id = p_id and role = 'admin') then
    raise exception 'adminni o''chirib bo''lmaydi (avval oddiy foydalanuvchi qiling)';
  end if;
  delete from auth.users where id = p_id;     -- profil va bog'liq yozuvlar "on delete cascade" bilan o'chadi
end $$;

-- 5) Foydalanuvchilar ro'yxati endi "blocked" ham qaytaradi
drop function if exists public.admin_users_summary(text);
create or replace function public.admin_users_summary(p_search text default '')
returns table (id uuid, full_name text, email text, role text, last_seen timestamptz,
               secs_7d bigint, secs_total bigint, tests_total bigint, avg_percent numeric, blocked boolean)
language plpgsql stable security definer set search_path = public as $$
begin
  if not public.is_admin() then raise exception 'ruxsat yo''q'; end if;
  return query
    select p.id, p.full_name, p.email, p.role, p.last_seen,
      coalesce((select sum(u.seconds) from public.usage_daily u
                where u.user_id = p.id and u.day >= (now() at time zone 'Asia/Tashkent')::date - 6), 0)::bigint,
      coalesce((select sum(u.seconds) from public.usage_daily u where u.user_id = p.id), 0)::bigint,
      (select count(*) from public.test_attempts a where a.user_id = p.id)::bigint,
      (select round(avg(a.percent), 1) from public.test_attempts a where a.user_id = p.id),
      p.blocked
    from public.profiles p
    where p_search = '' or p.full_name ilike '%' || p_search || '%' or p.email ilike '%' || p_search || '%'
    order by p.full_name limit 300;
end $$;

select 'update3 tayyor' as natija;
