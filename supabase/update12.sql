-- update12: kursga "slayd" va "kartochka" darslari + test darsi uchun minimal natija sharti.
-- Qayta ishga tushirsa ham xavfsiz.
alter table public.lessons drop constraint if exists lessons_kind_check;
alter table public.lessons add constraint lessons_kind_check check (kind in ('text','video','audio','document','test','slides','cards'));

create or replace function public.complete_lesson(p_lesson uuid) returns jsonb
language plpgsql security definer set search_path = public as $$
declare l record; c record; total int; done int; got int := 0; cert text; fin boolean := false; u uuid := auth.uid(); okt boolean;
begin
  select * into l from public.lessons where id = p_lesson; if not found then raise exception 'dars topilmadi'; end if;
  if not public.course_open(l.course_id) then raise exception 'ruxsat yo''q'; end if;
  if public.section_locked(p_lesson) then raise exception 'oldingi mavzuni avval bajaring'; end if;
  select * into c from public.courses where id = l.course_id;
  -- test darsi: kamida unlock_pct% natija bilan urinish bo'lishi shart
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
