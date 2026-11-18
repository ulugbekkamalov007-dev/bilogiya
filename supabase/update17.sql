-- update17: kurs tizimi 2.0 — boblar, mavzu qismlari foizi, takrorlash/yakuniy test bo'sag'alari, ketma-ket ochilish.
-- Oldin update12–update16 bajarilgan bo'lishi kerak. Qayta ishga tushirsa ham xavfsiz.

-- 1) Boblar
create table if not exists public.course_chapters (
  id uuid primary key default gen_random_uuid(),
  course_id uuid not null references public.courses(id) on delete cascade,
  title jsonb not null, cover text, position int not null default 0
);
create index if not exists course_chapters_idx on public.course_chapters(course_id, position);
alter table public.course_sections add column if not exists chapter_id uuid references public.course_chapters(id) on delete set null;
alter table public.course_sections add column if not exists kind text not null default 'topic';
alter table public.course_sections drop constraint if exists course_sections_kind_check;
alter table public.course_sections add constraint course_sections_kind_check check (kind in ('topic','review','final'));
alter table public.courses add column if not exists review_pct int not null default 70 check (review_pct between 1 and 100);
alter table public.courses add column if not exists final_pct int not null default 70 check (final_pct between 1 and 100);

alter table public.course_chapters enable row level security;
drop policy if exists cc_sel on public.course_chapters;
create policy cc_sel on public.course_chapters for select using (public.course_open(course_id) or public.course_owner(course_id) or public.is_staff());
drop policy if exists cc_w on public.course_chapters;
create policy cc_w on public.course_chapters for all using (public.course_owner(course_id)) with check (public.course_owner(course_id));
grant select, insert, update, delete on public.course_chapters to authenticated;
grant select on public.course_chapters to anon;

-- 2) Qism foizlari (kitob/taqdimot/kartochka/video: o'quvchi ko'rgan ulushi; test: eng yaxshi natija serverda hisoblanadi)
create table if not exists public.lesson_pct (
  user_id uuid not null references public.profiles(id) on delete cascade,
  lesson_id uuid not null references public.lessons(id) on delete cascade,
  course_id uuid not null references public.courses(id) on delete cascade,
  pct int not null default 0 check (pct between 0 and 100), updated_at timestamptz not null default now(),
  primary key (user_id, lesson_id)
);
alter table public.lesson_pct enable row level security;
drop policy if exists lpct_sel on public.lesson_pct;
create policy lpct_sel on public.lesson_pct for select using (user_id = auth.uid());
revoke insert, update, delete on public.lesson_pct from authenticated, anon;
grant select on public.lesson_pct to authenticated;
insert into public.lesson_pct(user_id, lesson_id, course_id, pct)
  select user_id, lesson_id, course_id, 100 from public.lesson_progress on conflict do nothing;

-- 3) Qism uchun o'tish bo'sag'asi: mavzu qismi = unlock_pct, takrorlash = review_pct, yakuniy = final_pct
create or replace function public.lesson_thr(p_lesson uuid) returns int
language sql stable security definer set search_path = public as $$
  select case s.kind when 'review' then c.review_pct when 'final' then c.final_pct else c.unlock_pct end
    from public.lessons l join public.courses c on c.id = l.course_id left join public.course_sections s on s.id = l.section_id
   where l.id = p_lesson;
$$;
grant execute on function public.lesson_thr(uuid) to authenticated;

-- 4) Qulf: oldingi qism bajarilmagan yoki oldingi mavzu/takrorlash o'tilmagan bo'lsa
create or replace function public.section_locked(p_lesson uuid) returns boolean
language plpgsql stable security definer set search_path = public as $$
declare l record; prev uuid; pl uuid; tot int; dn int;
begin
  if public.is_staff() then return false; end if;
  select * into l from public.lessons where id = p_lesson; if not found or l.section_id is null then return false; end if;
  -- shu mavzu ichida oldingi qism
  select x.id into pl from public.lessons x where x.section_id = l.section_id and (x.position, x.created_at, x.id) < (l.position, l.created_at, l.id)
   order by x.position desc, x.created_at desc, x.id desc limit 1;
  if pl is not null and not exists (select 1 from public.lesson_progress lp where lp.user_id = auth.uid() and lp.lesson_id = pl) then return true; end if;
  -- oldingi mavzu / takrorlash testi to'liq o'tilganmi
  select s2.id into prev from public.course_sections s2 join public.course_sections s1 on s1.id = l.section_id
   where s2.course_id = l.course_id and (s2.position, s2.id) < (s1.position, s1.id)
     and exists (select 1 from public.lessons z where z.section_id = s2.id)
   order by s2.position desc, s2.id desc limit 1;
  if prev is null then return false; end if;
  select count(*) into tot from public.lessons where section_id = prev;
  select count(*) into dn from public.lesson_progress lp join public.lessons x on x.id = lp.lesson_id where lp.user_id = auth.uid() and x.section_id = prev;
  return dn < tot;
end $$;
grant execute on function public.section_locked(uuid) to authenticated;

-- 5) Foiz yozish (faqat oshadi). Bo'sag'adan oshsa dars avtomatik tugatiladi.
create or replace function public.report_pct(p_lesson uuid, p_pct int) returns jsonb
language plpgsql security definer set search_path = public as $$
declare l record; p int; thr int; res jsonb := null; u uuid := auth.uid();
begin
  select * into l from public.lessons where id = p_lesson; if not found then raise exception 'dars topilmadi'; end if;
  if not public.lesson_open(p_lesson) then raise exception 'PAID_REQUIRED'; end if;
  if public.section_locked(p_lesson) then raise exception 'oldingi qismni avval bajaring'; end if;
  if l.kind = 'test' and l.item_id is not null then
    select coalesce(max(percent), 0) into p from public.test_attempts where user_id = u and item_id = l.item_id;
  else p := least(100, greatest(0, coalesce(p_pct, 0))); end if;
  insert into public.lesson_pct(user_id, lesson_id, course_id, pct) values (u, p_lesson, l.course_id, p)
  on conflict (user_id, lesson_id) do update set pct = greatest(public.lesson_pct.pct, excluded.pct), updated_at = now();
  thr := public.lesson_thr(p_lesson);
  if p >= thr and not exists (select 1 from public.lesson_progress where user_id = u and lesson_id = p_lesson) then
    begin res := public.complete_lesson(p_lesson); exception when others then res := null; end;
  end if;
  return jsonb_build_object('pct', p, 'thr', thr, 'result', res);
end $$;
grant execute on function public.report_pct(uuid, int) to authenticated;

-- 6) Tugatish: o'quvchi uchun foiz bo'sag'adan past bo'lsa rad etiladi (staff uchun cheklov yo'q)
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

select 'update17 tayyor' as natija;
