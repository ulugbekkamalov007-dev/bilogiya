-- =====================================================================
-- update7.sql — BioAcademy 2.0, 1-qism: o'qituvchi roli, kurslar, sertifikat, XP/streak/yutuqlar
-- Qayta ishga tushirish xavfsiz. Orqaga qaytarish: update7_rollback.sql
-- Oldin update.sql … update6.sql ishga tushirilgan bo'lishi kerak.
-- =====================================================================

-- ---------- 1) ROLLAR: o'qituvchi (mavjud admin/user mantig'iga tegilmaydi)
alter table public.profiles drop constraint if exists profiles_role_check;
alter table public.profiles add constraint profiles_role_check check (role in ('user','admin','teacher'));

create or replace function public.is_teacher() returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.profiles where id = auth.uid() and role = 'teacher' and not blocked);
$$;
create or replace function public.is_staff() returns boolean
language sql stable security definer set search_path = public as $$ select public.is_admin() or public.is_teacher(); $$;
grant execute on function public.is_teacher() to authenticated;
grant execute on function public.is_staff() to authenticated;

-- audit jurnali (jadval shu yerda, triggerlar update8.sql da)
create table if not exists public.audit_log (
  id bigserial primary key, actor uuid, actor_name text, action text not null, entity text, entity_id text, meta jsonb not null default '{}'::jsonb,
  at timestamptz not null default now()
);
create index if not exists audit_at_idx on public.audit_log(at desc);
alter table public.audit_log enable row level security;
drop policy if exists audit_sel on public.audit_log;
create policy audit_sel on public.audit_log for select using (public.is_admin());

create or replace function public._audit(p_action text, p_entity text, p_id text, p_meta jsonb default '{}'::jsonb) returns void
language plpgsql security definer set search_path = public as $$
begin
  insert into public.audit_log(actor, actor_name, action, entity, entity_id, meta)
  values (auth.uid(), (select coalesce(full_name, email) from public.profiles where id = auth.uid()), p_action, p_entity, p_id, coalesce(p_meta, '{}'::jsonb));
end $$;

create or replace function public.admin_set_role(p_user uuid, p_role text) returns void
language plpgsql security definer set search_path = public as $$
begin
  if not public.is_admin() then raise exception 'ruxsat yo''q'; end if;
  if p_role not in ('user','teacher','admin') then raise exception 'noto''g''ri rol'; end if;
  if p_user = auth.uid() then raise exception 'o''z rolingizni o''zgartira olmaysiz'; end if;
  update public.profiles set role = p_role where id = p_user;
  perform public._audit('set_role', 'profile', p_user::text, jsonb_build_object('role', p_role));
end $$;
grant execute on function public.admin_set_role(uuid, text) to authenticated;

create table if not exists public.teacher_applications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  message text not null check (length(message) between 10 and 1000),
  status text not null default 'pending' check (status in ('pending','approved','rejected')),
  reviewed_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(), reviewed_at timestamptz
);
create unique index if not exists teacher_app_one_pending on public.teacher_applications(user_id) where status = 'pending';
alter table public.teacher_applications enable row level security;
drop policy if exists ta_sel on public.teacher_applications;
create policy ta_sel on public.teacher_applications for select using (user_id = auth.uid() or public.is_admin());
drop policy if exists ta_ins on public.teacher_applications;
create policy ta_ins on public.teacher_applications for insert with check (user_id = auth.uid() and status = 'pending' and not public.is_staff());
create or replace function public.decide_teacher_application(p_id uuid, p_approve boolean) returns void
language plpgsql security definer set search_path = public as $$
declare a record;
begin
  if not public.is_admin() then raise exception 'ruxsat yo''q'; end if;
  select * into a from public.teacher_applications where id = p_id and status = 'pending'; if not found then raise exception 'ariza topilmadi'; end if;
  update public.teacher_applications set status = case when p_approve then 'approved' else 'rejected' end, reviewed_by = auth.uid(), reviewed_at = now() where id = p_id;
  if p_approve then update public.profiles set role = 'teacher' where id = a.user_id and role = 'user'; end if;
  perform public._audit(case when p_approve then 'teacher_approved' else 'teacher_rejected' end, 'teacher_application', p_id::text, jsonb_build_object('user', a.user_id));
end $$;
grant execute on function public.decide_teacher_application(uuid, boolean) to authenticated;

-- ---------- 2) KURSLAR
create table if not exists public.courses (
  id uuid primary key default gen_random_uuid(),
  title jsonb not null, description jsonb not null default '{}'::jsonb,
  cover_url text, grade int check (grade between 1 and 12), level text not null default 'basic' check (level in ('basic','medium','advanced')),
  is_premium boolean not null default false, status text not null default 'draft' check (status in ('draft','published')),
  author_id uuid references public.profiles(id) on delete set null, goals jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now()
);
create table if not exists public.course_sections (
  id uuid primary key default gen_random_uuid(), course_id uuid not null references public.courses(id) on delete cascade,
  title jsonb not null, position int not null default 0
);
create table if not exists public.lessons (
  id uuid primary key default gen_random_uuid(), course_id uuid not null references public.courses(id) on delete cascade,
  section_id uuid references public.course_sections(id) on delete set null,
  title jsonb not null, kind text not null default 'text' check (kind in ('text','video','audio','document','test')),
  item_id uuid references public.items(id) on delete set null, youtube_id text, body text not null default '',
  xp int not null default 10 check (xp between 0 and 100), position int not null default 0, created_at timestamptz not null default now()
);
create index if not exists lessons_course_idx on public.lessons(course_id, position);
create table if not exists public.enrollments (
  user_id uuid not null references public.profiles(id) on delete cascade, course_id uuid not null references public.courses(id) on delete cascade,
  created_at timestamptz not null default now(), completed_at timestamptz, primary key (user_id, course_id)
);
create table if not exists public.lesson_progress (
  user_id uuid not null references public.profiles(id) on delete cascade, lesson_id uuid not null references public.lessons(id) on delete cascade,
  course_id uuid not null references public.courses(id) on delete cascade, completed_at timestamptz not null default now(), primary key (user_id, lesson_id)
);
create table if not exists public.course_reviews (
  user_id uuid not null references public.profiles(id) on delete cascade, course_id uuid not null references public.courses(id) on delete cascade,
  rating int not null check (rating between 1 and 5), comment text check (length(comment) <= 600), author_name text, created_at timestamptz not null default now(),
  primary key (user_id, course_id)
);
create table if not exists public.certificates (
  id uuid primary key default gen_random_uuid(), user_id uuid not null references public.profiles(id) on delete cascade,
  course_id uuid not null references public.courses(id) on delete cascade, code text not null unique, issued_at timestamptz not null default now(),
  unique (user_id, course_id)
);
alter table public.courses enable row level security; alter table public.course_sections enable row level security; alter table public.lessons enable row level security;
alter table public.enrollments enable row level security; alter table public.lesson_progress enable row level security;
alter table public.course_reviews enable row level security; alter table public.certificates enable row level security;

create or replace function public.course_owner(cid uuid) returns boolean
language sql stable security definer set search_path = public as $$
  select public.is_admin() or exists (select 1 from public.courses where id = cid and author_id = auth.uid() and public.is_teacher());
$$;
create or replace function public.course_open(cid uuid) returns boolean   -- o'quvchi uchun: nashr etilgan va (bepul yoki obuna bor)
language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.courses c where c.id = cid and c.status = 'published' and (not c.is_premium or public.has_access()));
$$;
grant execute on function public.course_owner(uuid) to authenticated; grant execute on function public.course_open(uuid) to authenticated;

drop policy if exists c_sel on public.courses;
create policy c_sel on public.courses for select using (status = 'published' or public.course_owner(id));
drop policy if exists c_ins on public.courses;
create policy c_ins on public.courses for insert with check (public.is_staff() and (author_id = auth.uid() or public.is_admin()));
drop policy if exists c_upd on public.courses;
create policy c_upd on public.courses for update using (public.course_owner(id)) with check (public.course_owner(id));
drop policy if exists c_del on public.courses;
create policy c_del on public.courses for delete using (public.course_owner(id));

drop policy if exists cs_sel on public.course_sections;
create policy cs_sel on public.course_sections for select using (public.course_open(course_id) or public.course_owner(course_id));
drop policy if exists cs_all on public.course_sections;
create policy cs_all on public.course_sections for all using (public.course_owner(course_id)) with check (public.course_owner(course_id));
drop policy if exists l_sel on public.lessons;
create policy l_sel on public.lessons for select using (public.course_open(course_id) or public.course_owner(course_id));
drop policy if exists l_all on public.lessons;
create policy l_all on public.lessons for all using (public.course_owner(course_id)) with check (public.course_owner(course_id));

drop policy if exists en_sel on public.enrollments;
create policy en_sel on public.enrollments for select using (user_id = auth.uid() or public.course_owner(course_id));
drop policy if exists lp_sel on public.lesson_progress;
create policy lp_sel on public.lesson_progress for select using (user_id = auth.uid() or public.course_owner(course_id));
drop policy if exists cr_sel on public.course_reviews;
create policy cr_sel on public.course_reviews for select using (true);
drop policy if exists cr_ins on public.course_reviews;
create policy cr_ins on public.course_reviews for insert with check (user_id = auth.uid() and exists (select 1 from public.enrollments e where e.user_id = auth.uid() and e.course_id = course_reviews.course_id));
drop policy if exists cr_upd on public.course_reviews;
create policy cr_upd on public.course_reviews for update using (user_id = auth.uid()) with check (user_id = auth.uid());
drop policy if exists cr_del on public.course_reviews;
create policy cr_del on public.course_reviews for delete using (user_id = auth.uid() or public.is_admin());
drop policy if exists cert_sel on public.certificates;
create policy cert_sel on public.certificates for select using (user_id = auth.uid() or public.is_admin());

create or replace function public.fill_review_author() returns trigger language plpgsql security definer set search_path = public as $$
begin new.author_name := (select coalesce(full_name, 'Foydalanuvchi') from public.profiles where id = new.user_id); return new; end $$;
drop trigger if exists trg_review_author on public.course_reviews;
create trigger trg_review_author before insert on public.course_reviews for each row execute function public.fill_review_author();

-- kursga bog'langan material (yashirin bo'lsa ham) yozilgan o'quvchiga ochiq
create or replace function public.lesson_item_ok(iid uuid) returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.lessons l join public.enrollments e on e.course_id = l.course_id and e.user_id = auth.uid()
                 where l.item_id = iid and public.course_open(l.course_id)) and public.has_access();
$$;
grant execute on function public.lesson_item_ok(uuid) to authenticated;

create or replace function public.item_accessible(iid uuid) returns boolean
language plpgsql stable security definer set search_path = public as $$
declare it record;
begin
  if public.is_admin() then return true; end if;
  if public.task_item_ok(iid) or public.lesson_item_ok(iid) then return true; end if;
  select visible, folder_id into it from public.items where id = iid;
  if not found or not it.visible then return false; end if;
  return public.folder_accessible(it.folder_id);
end $$;
drop policy if exists i_sel on public.items;
create policy i_sel on public.items for select using (
  public.is_admin() or (visible and public.folder_visible(folder_id)) or public.task_item_ok(id) or public.lesson_item_ok(id)
);

-- ---------- 3) XP / STREAK / DARAJA (foydalanuvchi to'g'ridan-to'g'ri yoza olmaydi)
create table if not exists public.user_stats (
  user_id uuid primary key references public.profiles(id) on delete cascade,
  xp int not null default 0, streak int not null default 0, best_streak int not null default 0,
  last_day date, daily_goal_min int not null default 20 check (daily_goal_min between 5 and 240)
);
create table if not exists public.xp_events (
  id bigserial primary key, user_id uuid not null references public.profiles(id) on delete cascade, kind text not null,
  ref text not null default '', xp int not null, day date not null default (now() at time zone 'Asia/Tashkent')::date, created_at timestamptz not null default now()
);
create unique index if not exists xp_once on public.xp_events(user_id, kind, ref) where kind in ('lesson','course','test','achv','daily_goal');
create index if not exists xp_user_day on public.xp_events(user_id, day);
alter table public.user_stats enable row level security; alter table public.xp_events enable row level security;
drop policy if exists us_sel on public.user_stats;
create policy us_sel on public.user_stats for select using (user_id = auth.uid() or public.is_admin());
drop policy if exists xe_sel on public.xp_events;
create policy xe_sel on public.xp_events for select using (user_id = auth.uid() or public.is_admin());

create or replace function public.level_of(p_xp int) returns int language sql immutable as $$ select floor(sqrt(greatest(p_xp, 0) / 40.0))::int + 1; $$;

-- ichki: XP berish (miqdorni faqat server belgilaydi). Qaytaradi: haqiqatan berilgan XP
create or replace function public._xp(p_user uuid, p_kind text, p_ref text, p_xp int, p_cap int default null) returns int
language plpgsql security definer set search_path = public as $$
declare d date := (now() at time zone 'Asia/Tashkent')::date; today int; give int := p_xp;
begin
  if p_user is null or p_xp <= 0 then return 0; end if;
  insert into public.user_stats(user_id) values (p_user) on conflict do nothing;
  if p_cap is not null then
    select coalesce(sum(xp), 0) into today from public.xp_events where user_id = p_user and kind = p_kind and day = d;
    give := least(p_xp, greatest(0, p_cap - today)); if give <= 0 then return 0; end if;
  end if;
  begin insert into public.xp_events(user_id, kind, ref, xp, day) values (p_user, p_kind, coalesce(p_ref, ''), give, d);
  exception when unique_violation then return 0; end;
  update public.user_stats set xp = xp + give where user_id = p_user;
  return give;
end $$;

-- streak: faqat haqiqiy faollik bo'lsa (bugun kamida 60 soniya foydalanish yoki XP) hisoblanadi
create or replace function public.touch_streak() returns jsonb
language plpgsql security definer set search_path = public as $$
declare d date := (now() at time zone 'Asia/Tashkent')::date; s record; act boolean; ns int;
begin
  if auth.uid() is null then return '{}'::jsonb; end if;
  insert into public.user_stats(user_id) values (auth.uid()) on conflict do nothing;
  select * into s from public.user_stats where user_id = auth.uid() for update;
  act := exists (select 1 from public.usage_daily where user_id = auth.uid() and day = d and kind <> 'app' and seconds >= 60)
      or exists (select 1 from public.xp_events where user_id = auth.uid() and day = d);
  if act and (s.last_day is distinct from d) then
    ns := case when s.last_day = d - 1 then s.streak + 1 else 1 end;
    update public.user_stats set streak = ns, best_streak = greatest(best_streak, ns), last_day = d where user_id = auth.uid() returning * into s;
  elsif s.last_day is not null and s.last_day < d - 1 and s.streak <> 0 then
    update public.user_stats set streak = 0 where user_id = auth.uid() returning * into s;
  end if;
  return jsonb_build_object('xp', s.xp, 'level', public.level_of(s.xp), 'streak', s.streak, 'best', s.best_streak, 'goal', s.daily_goal_min);
end $$;
grant execute on function public.touch_streak() to authenticated;

create or replace function public.my_stats() returns jsonb
language plpgsql stable security definer set search_path = public as $$
declare d date := (now() at time zone 'Asia/Tashkent')::date; s record; today_s int;
begin
  select * into s from public.user_stats where user_id = auth.uid();
  select coalesce(sum(seconds), 0) into today_s from public.usage_daily where user_id = auth.uid() and day = d and kind <> 'app';
  return jsonb_build_object('xp', coalesce(s.xp, 0), 'level', public.level_of(coalesce(s.xp, 0)), 'next_xp', (power(public.level_of(coalesce(s.xp, 0)), 2) * 40)::int,
    'cur_xp', (power(public.level_of(coalesce(s.xp, 0)) - 1, 2) * 40)::int, 'streak', coalesce(s.streak, 0), 'best', coalesce(s.best_streak, 0),
    'goal', coalesce(s.daily_goal_min, 20), 'today_sec', today_s);
end $$;
grant execute on function public.my_stats() to authenticated;

create or replace function public.set_daily_goal(p_min int) returns void
language plpgsql security definer set search_path = public as $$
begin
  if auth.uid() is null then return; end if;
  insert into public.user_stats(user_id, daily_goal_min) values (auth.uid(), greatest(5, least(240, p_min)))
  on conflict (user_id) do update set daily_goal_min = greatest(5, least(240, p_min));
end $$;
grant execute on function public.set_daily_goal(int) to authenticated;

-- ---------- 4) YUTUQLAR
create table if not exists public.achievements (
  code text primary key, title jsonb not null, descr jsonb not null, icon text not null default 'trophy', xp int not null default 20, sort int not null default 0
);
create table if not exists public.user_achievements (
  user_id uuid not null references public.profiles(id) on delete cascade, code text not null references public.achievements(code) on delete cascade,
  earned_at timestamptz not null default now(), primary key (user_id, code)
);
alter table public.achievements enable row level security; alter table public.user_achievements enable row level security;
drop policy if exists ach_sel on public.achievements; create policy ach_sel on public.achievements for select using (true);
drop policy if exists ach_adm on public.achievements; create policy ach_adm on public.achievements for all using (public.is_admin()) with check (public.is_admin());
drop policy if exists ua_sel on public.user_achievements; create policy ua_sel on public.user_achievements for select using (user_id = auth.uid() or public.is_admin());

insert into public.achievements(code, title, descr, icon, xp, sort) values
 ('first_lesson', '{"uz":"Birinchi dars","ru":"Первый урок","en":"First lesson"}', '{"uz":"Birinchi darsni tugatdingiz","ru":"Вы завершили первый урок","en":"You finished your first lesson"}', 'book', 20, 1),
 ('lessons_10', '{"uz":"10 ta dars","ru":"10 уроков","en":"10 lessons"}', '{"uz":"10 ta darsni tugatdingiz","ru":"Завершено 10 уроков","en":"10 lessons completed"}', 'book', 50, 2),
 ('first_test', '{"uz":"Birinchi test","ru":"Первый тест","en":"First test"}', '{"uz":"Birinchi testni yechdingiz","ru":"Вы прошли первый тест","en":"You took your first test"}', 'test', 20, 3),
 ('test_ace', '{"uz":"A''lochi","ru":"Отличник","en":"Ace"}', '{"uz":"Testda 90% va undan yuqori natija","ru":"Результат теста 90% и выше","en":"Scored 90%+ on a test"}', 'trophy', 40, 4),
 ('tests_10', '{"uz":"10 ta test","ru":"10 тестов","en":"10 tests"}', '{"uz":"10 ta test yechdingiz","ru":"Пройдено 10 тестов","en":"10 tests taken"}', 'test', 50, 5),
 ('streak_3', '{"uz":"3 kunlik seriya","ru":"Серия 3 дня","en":"3-day streak"}', '{"uz":"Ketma-ket 3 kun o''qidingiz","ru":"3 дня подряд","en":"3 days in a row"}', 'zap', 30, 6),
 ('streak_7', '{"uz":"Haftalik seriya","ru":"Недельная серия","en":"Weekly streak"}', '{"uz":"Ketma-ket 7 kun","ru":"7 дней подряд","en":"7 days in a row"}', 'zap', 70, 7),
 ('streak_30', '{"uz":"Oylik seriya","ru":"Месячная серия","en":"Monthly streak"}', '{"uz":"Ketma-ket 30 kun","ru":"30 дней подряд","en":"30 days in a row"}', 'zap', 200, 8),
 ('cards_100', '{"uz":"100 ta karta","ru":"100 карточек","en":"100 cards"}', '{"uz":"100 ta kartani takrorladingiz","ru":"Повторено 100 карточек","en":"Reviewed 100 cards"}', 'layers', 50, 9),
 ('first_cert', '{"uz":"Sertifikat","ru":"Сертификат","en":"Certificate"}', '{"uz":"Birinchi kursni tugatdingiz","ru":"Вы завершили первый курс","en":"You completed your first course"}', 'award', 100, 10),
 ('xp_500', '{"uz":"500 XP","ru":"500 XP","en":"500 XP"}', '{"uz":"500 XP to''pladingiz","ru":"Набрано 500 XP","en":"Earned 500 XP"}', 'star', 50, 11)
on conflict (code) do nothing;

-- yutuqlar shartlari serverda tekshiriladi; yangi olinganlar ro'yxati qaytadi
create or replace function public.check_achievements() returns jsonb
language plpgsql security definer set search_path = public as $$
declare u uuid := auth.uid(); st record; n_les int; n_test int; best numeric; n_cards int := 0; n_cert int; got text[] := '{}'; c text;
begin
  if u is null then return '[]'::jsonb; end if;
  select * into st from public.user_stats where user_id = u;
  select count(*) into n_les from public.lesson_progress where user_id = u;
  select count(*), coalesce(max(percent), 0) into n_test, best from public.test_attempts where user_id = u;
  if to_regclass('public.card_reviews') is not null then execute 'select count(*) from public.card_reviews where user_id = $1' into n_cards using u; end if;
  select count(*) into n_cert from public.certificates where user_id = u;
  for c in select unnest(array[
      case when n_les >= 1 then 'first_lesson' end, case when n_les >= 10 then 'lessons_10' end,
      case when n_test >= 1 then 'first_test' end, case when best >= 90 then 'test_ace' end, case when n_test >= 10 then 'tests_10' end,
      case when coalesce(st.best_streak, 0) >= 3 then 'streak_3' end, case when coalesce(st.best_streak, 0) >= 7 then 'streak_7' end, case when coalesce(st.best_streak, 0) >= 30 then 'streak_30' end,
      case when n_cards >= 100 then 'cards_100' end, case when n_cert >= 1 then 'first_cert' end, case when coalesce(st.xp, 0) >= 500 then 'xp_500' end]) loop
    if c is null then continue; end if;
    begin insert into public.user_achievements(user_id, code) values (u, c); got := got || c;
          perform public._xp(u, 'achv', c, (select xp from public.achievements where code = c));
    exception when unique_violation then null; end;
  end loop;
  return to_jsonb(got);
end $$;
grant execute on function public.check_achievements() to authenticated;

-- ---------- 5) KURS RPC lari
create or replace function public.enroll_course(p_course uuid) returns void
language plpgsql security definer set search_path = public as $$
begin
  if auth.uid() is null then raise exception 'kirish kerak'; end if;
  if not public.course_open(p_course) then raise exception 'kurs mavjud emas yoki obuna talab qilinadi'; end if;
  insert into public.enrollments(user_id, course_id) values (auth.uid(), p_course) on conflict do nothing;
end $$;
grant execute on function public.enroll_course(uuid) to authenticated;

create or replace function public.complete_lesson(p_lesson uuid) returns jsonb
language plpgsql security definer set search_path = public as $$
declare l record; total int; done int; got int := 0; cert text; fin boolean := false; u uuid := auth.uid();
begin
  select * into l from public.lessons where id = p_lesson; if not found then raise exception 'dars topilmadi'; end if;
  if not public.course_open(l.course_id) then raise exception 'ruxsat yo''q'; end if;
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

create or replace function public.verify_certificate(p_code text) returns jsonb
language sql stable security definer set search_path = public as $$
  select jsonb_build_object('ok', true, 'name', p.full_name, 'course', c.title, 'issued', ce.issued_at)
  from public.certificates ce join public.profiles p on p.id = ce.user_id join public.courses c on c.id = ce.course_id where ce.code = upper(trim(p_code));
$$;
grant execute on function public.verify_certificate(text) to anon, authenticated;

create or replace function public.course_stats(p_course uuid)
returns table (uid uuid, full_name text, lessons_done int, lessons_total int, enrolled_at timestamptz, completed_at timestamptz)
language plpgsql stable security definer set search_path = public as $$
begin
  if not public.course_owner(p_course) then raise exception 'ruxsat yo''q'; end if;
  return query select e.user_id, coalesce(p.full_name, p.email),
    (select count(*) from public.lesson_progress lp where lp.user_id = e.user_id and lp.course_id = p_course)::int,
    (select count(*) from public.lessons l where l.course_id = p_course)::int, e.created_at, e.completed_at
  from public.enrollments e join public.profiles p on p.id = e.user_id where e.course_id = p_course order by e.created_at desc;
end $$;
grant execute on function public.course_stats(uuid) to authenticated;

select 'update7 tayyor' as natija;
