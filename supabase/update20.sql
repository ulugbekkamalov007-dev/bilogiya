-- update20: "Yakuniy sinov markazi" (kind='bank') — kurs oxirida katta test va kartochka banklari.
-- Bank bo'limi ketma-ketlikka va sertifikat hisobiga kirmaydi; barcha boblar tugagach ochiladi. Qayta ishga tushirsa ham xavfsiz.
alter table public.course_sections drop constraint if exists course_sections_kind_check;
alter table public.course_sections add constraint course_sections_kind_check check (kind in ('intro','topic','review','final','bank'));

create or replace function public.section_locked(p_lesson uuid) returns boolean
language plpgsql stable security definer set search_path = public as $$
declare l record; k text; prev uuid; pl uuid; tot int; dn int;
begin
  if public.is_staff() then return false; end if;
  select * into l from public.lessons where id = p_lesson; if not found or l.section_id is null then return false; end if;
  select kind into k from public.course_sections where id = l.section_id;
  if k = 'bank' then  -- sinov markazi: butun kurs (bank bo'limlaridan tashqari) tugagach ochiladi
    return exists (select 1 from public.lessons x left join public.course_sections s on s.id = x.section_id
                    where x.course_id = l.course_id and coalesce(s.kind, 'topic') <> 'bank'
                      and not exists (select 1 from public.lesson_progress lp where lp.user_id = auth.uid() and lp.lesson_id = x.id));
  end if;
  select x.id into pl from public.lessons x where x.section_id = l.section_id and (x.position, x.created_at, x.id) < (l.position, l.created_at, l.id)
   order by x.position desc, x.created_at desc, x.id desc limit 1;
  if pl is not null and not exists (select 1 from public.lesson_progress lp where lp.user_id = auth.uid() and lp.lesson_id = pl) then return true; end if;
  select s2.id into prev from public.course_sections s2 join public.course_sections s1 on s1.id = l.section_id
   where s2.course_id = l.course_id and s2.kind <> 'bank' and (s2.position, s2.id) < (s1.position, s1.id)
     and exists (select 1 from public.lessons z where z.section_id = s2.id)
   order by s2.position desc, s2.id desc limit 1;
  if prev is null then return false; end if;
  select count(*) into tot from public.lessons where section_id = prev;
  select count(*) into dn from public.lesson_progress lp join public.lessons x on x.id = lp.lesson_id where lp.user_id = auth.uid() and x.section_id = prev;
  return dn < tot;
end $$;
grant execute on function public.section_locked(uuid) to authenticated;

-- sertifikat hisobida bank darslari sanalmaydi
create or replace function public.complete_lesson(p_lesson uuid) returns jsonb
language plpgsql security definer set search_path = public as $$
declare l record; c record; total int; done int; got int := 0; cert text; fin boolean := false; u uuid := auth.uid(); pc int; thr int;
begin
  select * into l from public.lessons where id = p_lesson; if not found then raise exception 'dars topilmadi'; end if;
  if not public.lesson_open(p_lesson) then raise exception 'PAID_REQUIRED'; end if;
  if public.section_locked(p_lesson) then raise exception 'oldingi qismni avval bajaring'; end if;
  select * into c from public.courses where id = l.course_id;
  if not public.is_staff() then
    thr := public.lesson_thr(p_lesson);
    if l.kind = 'test' and l.item_id is not null then select coalesce(max(percent), 0) into pc from public.test_attempts where user_id = u and item_id = l.item_id;
    else select coalesce(max(pct), 0) into pc from public.lesson_pct where user_id = u and lesson_id = p_lesson; end if;
    if pc < thr then raise exception 'kamida % foiz bajaring (hozir % foiz)', thr, pc; end if;
  end if;
  insert into public.enrollments(user_id, course_id) values (u, l.course_id) on conflict do nothing;
  begin insert into public.lesson_progress(user_id, lesson_id, course_id) values (u, p_lesson, l.course_id);
        got := public._xp(u, 'lesson', p_lesson::text, l.xp);
  exception when unique_violation then null; end;
  insert into public.lesson_pct(user_id, lesson_id, course_id, pct) values (u, p_lesson, l.course_id, 100)
  on conflict (user_id, lesson_id) do update set pct = greatest(public.lesson_pct.pct, case when l.kind = 'test' then public.lesson_pct.pct else 100 end);
  select count(*) into total from public.lessons x left join public.course_sections s on s.id = x.section_id where x.course_id = l.course_id and coalesce(s.kind, 'topic') <> 'bank';
  select count(*) into done from public.lesson_progress lp join public.lessons x on x.id = lp.lesson_id left join public.course_sections s on s.id = x.section_id
   where lp.user_id = u and lp.course_id = l.course_id and coalesce(s.kind, 'topic') <> 'bank';
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
select 'update20 tayyor' as natija;
