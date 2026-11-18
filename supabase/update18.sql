-- update18: (1) eski 5-sinf seed kursini butunlay o'chirish, (2) foydalanuvchiga "N-mavzugacha" ruxsat berish,
-- (3) kurslar tuzilmasi hammaga ko'rinadi, mazmuni esa faqat ruxsat bo'lsa ochiladi. Qayta ishga tushirsa ham xavfsiz.

-- 1) Eski seed kursi va unga tegishli barcha testlar/savollar/darslar o'chadi
delete from public.items where id in (select item_id from public.lessons where course_id = '70bcc0ad-19f0-0387-8586-5bdf7bf4f43e' and item_id is not null);
delete from public.courses where id = '70bcc0ad-19f0-0387-8586-5bdf7bf4f43e';

-- 2) Sozlamalar va ruxsatlar
alter table public.courses add column if not exists free_topics int not null default 1 check (free_topics between 0 and 500);

create table if not exists public.course_grants (
  user_id uuid not null references public.profiles(id) on delete cascade,
  course_id uuid not null references public.courses(id) on delete cascade,
  upto int not null check (upto between 0 and 500),
  granted_by uuid references public.profiles(id) on delete set null,
  updated_at timestamptz not null default now(),
  primary key (user_id, course_id)
);
alter table public.course_grants enable row level security;
drop policy if exists cg_sel on public.course_grants;
create policy cg_sel on public.course_grants for select using (user_id = auth.uid() or public.course_owner(course_id));
revoke insert, update, delete on public.course_grants from authenticated, anon;
grant select on public.course_grants to authenticated;

-- bo'limning tartib raqami: unga qadar nechta mavzu bor (takrorlash/yakuniy test oldingi mavzu raqamini oladi)
create or replace function public.section_ord(p_section uuid) returns int
language sql stable security definer set search_path = public as $$
  select coalesce((select count(*)::int from public.course_sections s2 where s2.course_id = s.course_id and s2.kind = 'topic' and (s2.position, s2.id) <= (s.position, s.id)), 0)
    from public.course_sections s where s.id = p_section;
$$;
grant execute on function public.section_ord(uuid) to authenticated;

create or replace function public.lesson_open(p_lesson uuid) returns boolean
language plpgsql stable security definer set search_path = public as $$
declare l record; c record; o int := 0; g int;
begin
  if public.is_staff() then return exists (select 1 from public.lessons where id = p_lesson); end if;
  select * into l from public.lessons where id = p_lesson; if not found then return false; end if;
  select * into c from public.courses where id = l.course_id;
  if c.status <> 'published' then return false; end if;
  if not c.is_premium then return true; end if;
  if public.paid_ok() then return true; end if;
  if l.section_id is not null then o := public.section_ord(l.section_id); end if;
  if o <= c.free_topics then return true; end if;
  select upto into g from public.course_grants where user_id = auth.uid() and course_id = l.course_id;
  return coalesce(g, 0) >= o;
end $$;
grant execute on function public.lesson_open(uuid) to authenticated;

-- Kursga bog'langan testni ochish: shu darsga ruxsat bo'lsa (yozilish shart emas)
create or replace function public.lesson_item_ok(iid uuid) returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.lessons l where l.item_id = iid and public.lesson_open(l.id));
$$;
grant execute on function public.lesson_item_ok(uuid) to authenticated;

-- 3) Kurs tuzilmasi (bob/mavzu/dars nomlari) nashr etilgan har qanday kurs uchun ko'rinadi; mazmun lesson_bodies orqali himoyalangan
create or replace function public.course_listed(cid uuid) returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.courses c where c.id = cid and c.status = 'published');
$$;
grant execute on function public.course_listed(uuid) to authenticated;
drop policy if exists l_sel on public.lessons;
create policy l_sel on public.lessons for select using (public.course_listed(course_id) or public.course_owner(course_id) or public.is_staff());
drop policy if exists cs_sel on public.course_sections;
create policy cs_sel on public.course_sections for select using (public.course_listed(course_id) or public.course_owner(course_id) or public.is_staff());
drop policy if exists cc_sel on public.course_chapters;
create policy cc_sel on public.course_chapters for select using (public.course_listed(course_id) or public.course_owner(course_id) or public.is_staff());

-- 4) Admin/kurs egasi uchun ruxsat berish RPClari
create or replace function public.grant_course(p_email text, p_course uuid, p_upto int) returns jsonb
language plpgsql security definer set search_path = public as $$
declare u record;
begin
  if not public.course_owner(p_course) then raise exception 'ruxsat yo''q'; end if;
  select id, email, full_name into u from public.profiles where lower(email) = lower(trim(p_email)) limit 1;
  if not found then raise exception 'bunday email topilmadi: %', p_email; end if;
  insert into public.course_grants(user_id, course_id, upto, granted_by) values (u.id, p_course, greatest(0, p_upto), auth.uid())
  on conflict (user_id, course_id) do update set upto = excluded.upto, granted_by = auth.uid(), updated_at = now();
  insert into public.enrollments(user_id, course_id) values (u.id, p_course) on conflict do nothing;
  return jsonb_build_object('user_id', u.id, 'email', u.email, 'name', u.full_name, 'upto', greatest(0, p_upto));
end $$;
grant execute on function public.grant_course(text, uuid, int) to authenticated;

create or replace function public.revoke_course(p_user uuid, p_course uuid) returns void
language plpgsql security definer set search_path = public as $$
begin
  if not public.course_owner(p_course) then raise exception 'ruxsat yo''q'; end if;
  delete from public.course_grants where user_id = p_user and course_id = p_course;
end $$;
grant execute on function public.revoke_course(uuid, uuid) to authenticated;

create or replace function public.list_grants(p_course uuid) returns table(user_id uuid, email text, full_name text, upto int, updated_at timestamptz)
language plpgsql stable security definer set search_path = public as $$
begin
  if not public.course_owner(p_course) then raise exception 'ruxsat yo''q'; end if;
  return query select g.user_id, p.email::text, p.full_name::text, g.upto, g.updated_at from public.course_grants g join public.profiles p on p.id = g.user_id
    where g.course_id = p_course order by g.updated_at desc;
end $$;
grant execute on function public.list_grants(uuid) to authenticated;

select 'update18 tayyor' as natija;
