-- update13: (1) can_view_reports funksiyasi (hisobot "does not exist" xatosi), (2) pullik kursda faqat 1-dars bepul,
-- (3) dars matni/video faqat ruxsati borlarga RPC orqali beriladi. Qayta ishga tushirsa ham xavfsiz.

-- 1) Hisobotni ko'rish huquqi: o'zi, admin, o'z guruhidagi talabaning o'qituvchisi yoki reyting ochiq bo'lsa
create or replace function public.can_view_reports(p_user uuid) returns boolean
language sql stable security definer set search_path = public as $$
  select auth.uid() is not null and (
    p_user = auth.uid() or public.is_admin()
    or (public.is_teacher() and exists (select 1 from public.group_members gm join public.groups g on g.id = gm.group_id
          where gm.user_id = p_user and gm.status = 'approved' and g.owner_id = auth.uid()))
    or coalesce((select (value->>'leaderboard')::boolean from public.app_settings where key = 'app'), true)
  );
$$;
grant execute on function public.can_view_reports(uuid) to authenticated;

-- 2) Haqiqiy to'lov (obuna) bormi? (pullik tizim "yoqilmagan" bo'lsa ham pullik kurs uchun talab qilinadi)
create or replace function public.paid_ok() returns boolean
language sql stable security definer set search_path = public as $$
  select public.is_admin() or exists (select 1 from public.subscriptions s where s.user_id = auth.uid() and s.paid_until > now());
$$;
grant execute on function public.paid_ok() to authenticated;

-- Dars ochiqmi: bepul kurs / kurs egasi / obuna bor / pullik kursning 1-darsi
create or replace function public.lesson_open(p_lesson uuid) returns boolean
language plpgsql stable security definer set search_path = public as $$
declare l record; c record; fst uuid;
begin
  select * into l from public.lessons where id = p_lesson; if not found then return false; end if;
  if public.course_owner(l.course_id) then return true; end if;
  select * into c from public.courses where id = l.course_id;
  if c.status <> 'published' then return false; end if;
  if not c.is_premium then return public.course_open(l.course_id); end if;
  if public.paid_ok() then return true; end if;
  select id into fst from public.lessons where course_id = l.course_id order by position, created_at, id limit 1;
  return fst = p_lesson;
end $$;
grant execute on function public.lesson_open(uuid) to authenticated;

-- Dars matni va videosi (faqat ochiq darslar uchun)
create or replace function public.lesson_content(p_lesson uuid) returns jsonb
language plpgsql stable security definer set search_path = public as $$
declare l record;
begin
  select * into l from public.lessons where id = p_lesson; if not found then raise exception 'dars topilmadi'; end if;
  if not public.lesson_open(p_lesson) then raise exception 'PAID_REQUIRED'; end if;
  return jsonb_build_object('body', l.body, 'youtube_id', l.youtube_id);
end $$;
grant execute on function public.lesson_content(uuid) to authenticated;

-- Kursga bog'langan test materiali: faqat dars ochiq bo'lsa
create or replace function public.lesson_item_ok(iid uuid) returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.lessons l join public.enrollments e on e.course_id = l.course_id and e.user_id = auth.uid()
                 where l.item_id = iid and public.lesson_open(l.id));
$$;
grant execute on function public.lesson_item_ok(uuid) to authenticated;

-- Darsni tugatish: dars ochiq bo'lishi shart (qolgan mantiq update12 dagidek)
create or replace function public.complete_lesson(p_lesson uuid) returns jsonb
language plpgsql security definer set search_path = public as $$
declare l record; c record; total int; done int; got int := 0; cert text; fin boolean := false; u uuid := auth.uid(); okt boolean;
begin
  select * into l from public.lessons where id = p_lesson; if not found then raise exception 'dars topilmadi'; end if;
  if not public.lesson_open(p_lesson) then raise exception 'PAID_REQUIRED'; end if;
  if public.section_locked(p_lesson) then raise exception 'oldingi mavzuni avval bajaring'; end if;
  select * into c from public.courses where id = l.course_id;
  if l.kind = 'test' and l.item_id is not null then
    select exists (select 1 from public.test_attempts t where t.user_id = u and t.item_id = l.item_id and t.percent >= c.unlock_pct) into okt;
    if not okt then raise exception 'testni kamida % foiz natija bilan topshiring', c.unlock_pct; end if;
  end if;
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

-- Staff uchun to'liq dars (tahrirlash oynasi)
create or replace function public.lesson_full(p_lesson uuid) returns jsonb
language plpgsql stable security definer set search_path = public as $$
declare l record;
begin
  select * into l from public.lessons where id = p_lesson; if not found then raise exception 'dars topilmadi'; end if;
  if not public.course_owner(l.course_id) then raise exception 'ruxsat yo''q'; end if;
  return jsonb_build_object('body', l.body, 'youtube_id', l.youtube_id);
end $$;
grant execute on function public.lesson_full(uuid) to authenticated;

-- 3) Matn va video ustunlarini to'g'ridan-to'g'ri o'qishni yopish (faqat RPC orqali)
revoke select on public.lessons from anon, authenticated;
grant select (id, course_id, section_id, title, kind, item_id, xp, position, created_at) on public.lessons to authenticated;

-- 4) To'lov so'rovi: qaysi kurs uchun ekani (ixtiyoriy)
alter table public.payment_requests add column if not exists course_id uuid references public.courses(id) on delete set null;

select 'update13 tayyor' as natija;
