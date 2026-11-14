-- update11: telefon majburiy, foydalanuvchi kartasi, test yechganlar, admin bilan aloqa, mavzu qulfi (60%)
-- Qayta ishga tushirsa bo'ladi. Tartib: update10 dan keyin.

-- 1) Telefon raqami
alter table public.profiles add column if not exists phone text;
create or replace function public.set_my_phone(p_phone text) returns void
language plpgsql security definer set search_path = public as $$
declare v text := regexp_replace(coalesce(p_phone, ''), '[^0-9+]', '', 'g');
begin
  if auth.uid() is null then raise exception 'kirish kerak'; end if;
  if v !~ '^\+?[0-9]{9,15}$' then raise exception 'telefon raqami noto''g''ri (masalan +998901234567)'; end if;
  update public.profiles set phone = v where id = auth.uid();
end $$;
grant execute on function public.set_my_phone(text) to authenticated;

-- 2) Foydalanuvchi kartasi (admin va uning talabasini ko'ra oladigan o'qituvchi)
create or replace function public.admin_user_card(p_user uuid) returns jsonb
language plpgsql stable security definer set search_path = public as $$
declare r jsonb;
begin
  if not (public.is_admin() or public.can_view_reports(p_user)) then raise exception 'ruxsat yo''q'; end if;
  select jsonb_build_object('id', p.id, 'full_name', p.full_name, 'email', p.email, 'phone', p.phone, 'role', p.role, 'avatar_url', p.avatar_url,
      'created_at', p.created_at, 'blocked', p.blocked,
      'last_day', (select max(u.day) from public.usage_daily u where u.user_id = p.id and u.seconds > 0),
      'seconds_total', (select coalesce(sum(u.seconds), 0) from public.usage_daily u where u.user_id = p.id and u.kind <> 'app'),
      'groups', (select coalesce(jsonb_agg(g.name order by g.name), '[]') from public.group_members gm join public.groups g on g.id = gm.group_id where gm.user_id = p.id and gm.status = 'approved'),
      'paid_until', (select s.paid_until from public.subscriptions s where s.user_id = p.id),
      'tests', (select count(*) from public.test_attempts a where a.user_id = p.id),
      'avg', (select coalesce(round(avg(a.percent), 1), 0) from public.test_attempts a where a.user_id = p.id),
      'courses', (select count(*) from public.enrollments e where e.user_id = p.id))
    into r from public.profiles p where p.id = p_user;
  return r;
end $$;
grant execute on function public.admin_user_card(uuid) to authenticated;

-- 3) Admin bilan aloqa: ilova ichida yozish uchun admin profili
create or replace function public.support_contact() returns table (id uuid, full_name text, avatar_url text)
language sql stable security definer set search_path = public as $$
  select p.id, p.full_name, p.avatar_url from public.profiles p where p.role = 'admin' and not p.blocked
  order by (lower(p.email) = 'ulugbekkamalov0829@gmail.com') desc, p.created_at limit 1;
$$;
grant execute on function public.support_contact() to authenticated;

-- 4) Har bir testni kimlar yechgan
create or replace function public.test_takers(p_item uuid)
returns table (user_id uuid, name text, avatar_url text, attempts bigint, best numeric, last_percent numeric, last_at timestamptz)
language plpgsql stable security definer set search_path = public as $$
begin
  if not (public.is_admin() or exists (select 1 from public.items i where i.id = p_item and i.created_by = auth.uid() and public.is_teacher())) then raise exception 'ruxsat yo''q'; end if;
  return query
  select a.user_id, coalesce(p.full_name, p.email), p.avatar_url, count(*)::bigint, max(a.percent),
         (array_agg(a.percent order by a.created_at desc))[1], max(a.created_at)
  from public.test_attempts a join public.profiles p on p.id = a.user_id
  where a.item_id = p_item group by a.user_id, p.full_name, p.email, p.avatar_url order by max(a.created_at) desc;
end $$;
grant execute on function public.test_takers(uuid) to authenticated;

-- 5) Mavzu qulfi: oldingi mavzu kamida N% bajarilmasa keyingisi ochilmaydi
alter table public.courses add column if not exists unlock_pct int not null default 60 check (unlock_pct between 0 and 100);

create or replace function public.section_locked(p_lesson uuid) returns boolean
language plpgsql stable security definer set search_path = public as $$
declare l record; c record; prev record; tot int; dn int;
begin
  select * into l from public.lessons where id = p_lesson; if not found or l.section_id is null then return false; end if;
  select * into c from public.courses where id = l.course_id;
  select s2.id into prev from public.course_sections s2 join public.course_sections s1 on s1.id = l.section_id
   where s2.course_id = l.course_id and (s2.position, s2.id) < (s1.position, s1.id) order by s2.position desc, s2.id desc limit 1;
  if prev.id is null then return false; end if;
  select count(*) into tot from public.lessons where section_id = prev.id; if tot = 0 then return false; end if;
  select count(*) into dn from public.lesson_progress lp join public.lessons x on x.id = lp.lesson_id where lp.user_id = auth.uid() and x.section_id = prev.id;
  return (dn * 100.0 / tot) < c.unlock_pct;
end $$;
grant execute on function public.section_locked(uuid) to authenticated;

create or replace function public.complete_lesson(p_lesson uuid) returns jsonb
language plpgsql security definer set search_path = public as $$
declare l record; total int; done int; got int := 0; cert text; fin boolean := false; u uuid := auth.uid();
begin
  select * into l from public.lessons where id = p_lesson; if not found then raise exception 'dars topilmadi'; end if;
  if not public.course_open(l.course_id) then raise exception 'ruxsat yo''q'; end if;
  if public.section_locked(p_lesson) then raise exception 'oldingi mavzuni avval bajaring'; end if;
  insert into public.enrollments(user_id, course_id) values (u, l.course_id) on conflict do nothing;
  begin insert into public.lesson_progress(user_id, lesson_id, course_id) values (u, p_lesson, l.course_id);
        got := public._xp(u, 'lesson', p_lesson::text, l.xp);
  exception when unique_violation then null; end;
  select count(*) into total from public.lessons where course_id = l.course_id;
  select count(*) into done from public.lesson_progress where user_id = u and course_id = l.course_id;
  if total > 0 and done >= total then
    update public.enrollments set completed_at = coalesce(completed_at, now()) where user_id = u and course_id = l.course_id;
    select code into cert from public.certificates where user_id = u and course_id = l.course_id;
    if cert is null then
      cert := upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 10));
      insert into public.certificates(user_id, course_id, code) values (u, l.course_id, cert) on conflict do nothing;
      got := got + public._xp(u, 'course', l.course_id::text, 50); fin := true;
    end if;
  end if;
  perform public.touch_streak();
  return jsonb_build_object('xp', got, 'done', done, 'total', total, 'finished', fin, 'cert', cert, 'achievements', public.check_achievements());
end $$;
grant execute on function public.complete_lesson(uuid) to authenticated;

-- 6) Ko'rinmas qilingan (yashirin) material: o'quvchilarga ko'rinmaydi (items.visible mavjud)
-- 7) Bo'limlarni yashirish: app_settings 'ui' = {"hidden":["ai","lab"]}  (admin ilovadan o'zgartiradi)
insert into public.app_settings(key, value) values ('ui', '{"hidden":["ai","lab"]}'::jsonb) on conflict (key) do nothing;

select 'update11 tayyor' as natija;
