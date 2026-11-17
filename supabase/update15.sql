-- update15: admin va o'qituvchi uchun kurslarda hech qanday qulf yo'q (mavzu qulfi, to'lov, test sharti). Qayta ishga tushirsa ham xavfsiz.
create or replace function public.section_locked(p_lesson uuid) returns boolean
language plpgsql stable security definer set search_path = public as $$
declare l record; c record; prev record; tot int; dn int;
begin
  if public.is_staff() then return false; end if;
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

create or replace function public.lesson_open(p_lesson uuid) returns boolean
language plpgsql stable security definer set search_path = public as $$
declare l record; c record; fst uuid;
begin
  if public.is_staff() then return exists (select 1 from public.lessons where id = p_lesson); end if;
  select * into l from public.lessons where id = p_lesson; if not found then return false; end if;
  select * into c from public.courses where id = l.course_id;
  if c.status <> 'published' then return false; end if;
  if not c.is_premium then return public.course_open(l.course_id); end if;
  if public.paid_ok() then return true; end if;
  select id into fst from public.lessons where course_id = l.course_id order by position, created_at, id limit 1;
  return fst = p_lesson;
end $$;
grant execute on function public.lesson_open(uuid) to authenticated;

-- Kursga bog'langan testlar: staff hammasini ochadi
create or replace function public.lesson_item_ok(iid uuid) returns boolean
language sql stable security definer set search_path = public as $$
  select public.is_staff() and exists (select 1 from public.lessons l where l.item_id = iid)
      or exists (select 1 from public.lessons l join public.enrollments e on e.course_id = l.course_id and e.user_id = auth.uid()
                 where l.item_id = iid and public.lesson_open(l.id));
$$;
grant execute on function public.lesson_item_ok(uuid) to authenticated;

-- Dars matni: staff har doim ko'radi (lesson_open orqali, o'zgartirish shart emas) — test sharti staff uchun yo'q
create or replace function public.complete_lesson(p_lesson uuid) returns jsonb
language plpgsql security definer set search_path = public as $$
declare l record; c record; total int; done int; got int := 0; cert text; fin boolean := false; u uuid := auth.uid(); okt boolean;
begin
  select * into l from public.lessons where id = p_lesson; if not found then raise exception 'dars topilmadi'; end if;
  if not public.lesson_open(p_lesson) then raise exception 'PAID_REQUIRED'; end if;
  if public.section_locked(p_lesson) then raise exception 'oldingi mavzuni avval bajaring'; end if;
  select * into c from public.courses where id = l.course_id;
  if l.kind = 'test' and l.item_id is not null and not public.is_staff() then
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

-- Staff barcha darslarni (qoralama kurslar ham) ro'yxatda ko'ra olishi uchun
drop policy if exists l_sel on public.lessons;
create policy l_sel on public.lessons for select using (public.course_open(course_id) or public.course_owner(course_id) or public.is_staff());
drop policy if exists cs_sel on public.course_sections;
create policy cs_sel on public.course_sections for select using (public.course_open(course_id) or public.course_owner(course_id) or public.is_staff());

select 'update15 tayyor' as natija;
