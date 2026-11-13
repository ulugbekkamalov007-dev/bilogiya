-- =====================================================================
-- update8.sql — BioAcademy 2.0, 2-qism: flesh-kartalar (SM-2), forum, xatolar daftari/adaptiv test,
--               audit triggerlari, kengaytirilgan analitika, AI limiti va tarixi
-- Qayta ishga tushirish xavfsiz. Orqaga qaytarish: update8_rollback.sql. update7.sql dan keyin ishga tushiring.
-- =====================================================================

-- ---------- 1) FLESH-KARTALAR + SM-2
create table if not exists public.flash_decks (
  id uuid primary key default gen_random_uuid(), owner_id uuid not null references public.profiles(id) on delete cascade,
  title text not null check (length(title) between 1 and 120), description text not null default '',
  is_public boolean not null default false, course_id uuid references public.courses(id) on delete set null,
  created_at timestamptz not null default now()
);
create table if not exists public.flash_cards (
  id uuid primary key default gen_random_uuid(), deck_id uuid not null references public.flash_decks(id) on delete cascade,
  front text not null check (length(front) between 1 and 600), back text not null check (length(back) between 1 and 1200),
  position int not null default 0, created_at timestamptz not null default now()
);
create index if not exists flash_cards_deck_idx on public.flash_cards(deck_id);
create table if not exists public.card_state (
  user_id uuid not null references public.profiles(id) on delete cascade, card_id uuid not null references public.flash_cards(id) on delete cascade,
  ease numeric(4,2) not null default 2.5, interval_days int not null default 0, reps int not null default 0, lapses int not null default 0,
  due_at timestamptz not null default now(), last_review timestamptz, primary key (user_id, card_id)
);
create index if not exists card_state_due on public.card_state(user_id, due_at);
create table if not exists public.card_reviews (
  id bigserial primary key, user_id uuid not null references public.profiles(id) on delete cascade, card_id uuid not null references public.flash_cards(id) on delete cascade,
  grade int not null check (grade between 0 and 2), at timestamptz not null default now()
);
create index if not exists card_reviews_user on public.card_reviews(user_id, at desc);
alter table public.flash_decks enable row level security; alter table public.flash_cards enable row level security;
alter table public.card_state enable row level security; alter table public.card_reviews enable row level security;

create or replace function public.deck_ok(did uuid) returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.flash_decks d where d.id = did and (d.is_public or d.owner_id = auth.uid())) or public.is_admin();
$$;
create or replace function public.deck_mine(did uuid) returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.flash_decks d where d.id = did and d.owner_id = auth.uid()) or public.is_admin();
$$;
grant execute on function public.deck_ok(uuid) to authenticated; grant execute on function public.deck_mine(uuid) to authenticated;
drop policy if exists fd_sel on public.flash_decks; create policy fd_sel on public.flash_decks for select using (is_public or owner_id = auth.uid() or public.is_admin());
drop policy if exists fd_ins on public.flash_decks; create policy fd_ins on public.flash_decks for insert with check (owner_id = auth.uid() and (not is_public or public.is_staff()));
drop policy if exists fd_upd on public.flash_decks; create policy fd_upd on public.flash_decks for update using (owner_id = auth.uid() or public.is_admin()) with check ((owner_id = auth.uid() and (not is_public or public.is_staff())) or public.is_admin());
drop policy if exists fd_del on public.flash_decks; create policy fd_del on public.flash_decks for delete using (owner_id = auth.uid() or public.is_admin());
drop policy if exists fc_sel on public.flash_cards; create policy fc_sel on public.flash_cards for select using (public.deck_ok(deck_id));
drop policy if exists fc_all on public.flash_cards; create policy fc_all on public.flash_cards for all using (public.deck_mine(deck_id)) with check (public.deck_mine(deck_id));
drop policy if exists cst_sel on public.card_state; create policy cst_sel on public.card_state for select using (user_id = auth.uid());
drop policy if exists crv_sel on public.card_reviews; create policy crv_sel on public.card_reviews for select using (user_id = auth.uid() or public.is_admin());

-- SM-2: grade 0 = Takrorlash (again), 1 = Qiyin (hard), 2 = Bilaman (know)
create or replace function public.review_card(p_card uuid, p_grade int) returns jsonb
language plpgsql security definer set search_path = public as $$
declare u uuid := auth.uid(); st record; q int; ease numeric; iv int; reps int; lap int; due timestamptz; gave int;
begin
  if u is null then raise exception 'kirish kerak'; end if;
  if p_grade not between 0 and 2 then raise exception 'noto''g''ri baho'; end if;
  if not exists (select 1 from public.flash_cards c where c.id = p_card and public.deck_ok(c.deck_id)) then raise exception 'karta mavjud emas'; end if;
  q := case p_grade when 2 then 5 when 1 then 3 else 1 end;
  select * into st from public.card_state where user_id = u and card_id = p_card;
  ease := coalesce(st.ease, 2.5); iv := coalesce(st.interval_days, 0); reps := coalesce(st.reps, 0); lap := coalesce(st.lapses, 0);
  if q < 3 then reps := 0; iv := 0; lap := lap + 1; due := now() + interval '10 minutes';
  else
    reps := reps + 1;
    iv := case when reps = 1 then 1 when reps = 2 then 6 else greatest(1, round(iv * ease))::int end;
    if p_grade = 1 then iv := greatest(1, round(iv * 0.8))::int; end if;
    due := now() + make_interval(days => iv);
  end if;
  ease := greatest(1.3, ease + 0.1 - (5 - q) * (0.08 + (5 - q) * 0.02));
  insert into public.card_state(user_id, card_id, ease, interval_days, reps, lapses, due_at, last_review)
  values (u, p_card, ease, iv, reps, lap, due, now())
  on conflict (user_id, card_id) do update set ease = excluded.ease, interval_days = excluded.interval_days, reps = excluded.reps, lapses = excluded.lapses, due_at = excluded.due_at, last_review = now();
  insert into public.card_reviews(user_id, card_id, grade) values (u, p_card, p_grade);
  gave := public._xp(u, 'card', p_card::text, 1, 100);
  perform public.touch_streak();
  return jsonb_build_object('interval', iv, 'due', due, 'ease', ease, 'xp', gave);
end $$;
grant execute on function public.review_card(uuid, int) to authenticated;

-- bugungi navbat: muddati kelganlar + yangi kartalar (kuniga ko'pi bilan p_new ta yangi)
create or replace function public.due_cards(p_deck uuid default null, p_limit int default 30, p_new int default 10)
returns table (card_id uuid, deck_id uuid, deck_title text, front text, back text, is_new boolean, reps int)
language plpgsql stable security definer set search_path = public as $$
declare u uuid := auth.uid(); new_today int;
begin
  if u is null then return; end if;
  select count(distinct cr.card_id) into new_today from public.card_reviews cr
    where cr.user_id = u and cr.at >= date_trunc('day', now() at time zone 'Asia/Tashkent') at time zone 'Asia/Tashkent'
      and not exists (select 1 from public.card_reviews c2 where c2.user_id = u and c2.card_id = cr.card_id and c2.at < cr.at);
  return query
    (select c.id, c.deck_id, d.title, c.front, c.back, false, s.reps from public.card_state s join public.flash_cards c on c.id = s.card_id join public.flash_decks d on d.id = c.deck_id
      where s.user_id = u and s.due_at <= now() and public.deck_ok(c.deck_id) and (p_deck is null or c.deck_id = p_deck) order by s.due_at limit p_limit)
    union all
    (select c.id, c.deck_id, d.title, c.front, c.back, true, 0 from public.flash_cards c join public.flash_decks d on d.id = c.deck_id
      where public.deck_ok(c.deck_id) and (p_deck is null or c.deck_id = p_deck) and not exists (select 1 from public.card_state s where s.user_id = u and s.card_id = c.id)
      order by c.position, c.created_at limit greatest(0, p_new - new_today));
end $$;
grant execute on function public.due_cards(uuid, int, int) to authenticated;

create or replace function public.card_stats() returns jsonb
language plpgsql stable security definer set search_path = public as $$
declare u uuid := auth.uid(); d0 timestamptz := date_trunc('day', now() at time zone 'Asia/Tashkent') at time zone 'Asia/Tashkent';
begin
  return jsonb_build_object(
    'due', (select count(*) from public.card_state s join public.flash_cards c on c.id = s.card_id where s.user_id = u and s.due_at <= now() and public.deck_ok(c.deck_id)),
    'today', (select count(*) from public.card_reviews where user_id = u and at >= d0),
    'learned', (select count(*) from public.card_state where user_id = u and reps >= 1),
    'total', (select count(*) from public.flash_cards c where public.deck_ok(c.deck_id)),
    'retention', (select case when count(*) = 0 then null else round(100.0 * count(*) filter (where grade >= 1) / count(*)) end from (select grade from public.card_reviews where user_id = u order by at desc limit 200) x),
    'days', (select coalesce(jsonb_agg(jsonb_build_object('day', day, 'n', n) order by day), '[]'::jsonb) from (select (at at time zone 'Asia/Tashkent')::date as day, count(*) n from public.card_reviews where user_id = u and at > now() - interval '14 days' group by 1) z));
end $$;
grant execute on function public.card_stats() to authenticated;

-- ---------- 2) FORUM (umumiy yoki guruh ichida)
create table if not exists public.forum_threads (
  id uuid primary key default gen_random_uuid(), group_id uuid references public.groups(id) on delete cascade,
  author_id uuid not null references public.profiles(id) on delete cascade, author_name text,
  title text not null check (length(title) between 3 and 160), body text not null check (length(body) between 1 and 4000),
  pinned boolean not null default false, locked boolean not null default false,
  created_at timestamptz not null default now(), last_post_at timestamptz not null default now()
);
create table if not exists public.forum_posts (
  id uuid primary key default gen_random_uuid(), thread_id uuid not null references public.forum_threads(id) on delete cascade,
  author_id uuid not null references public.profiles(id) on delete cascade, author_name text,
  body text not null check (length(body) between 1 and 4000), created_at timestamptz not null default now()
);
create index if not exists forum_threads_idx on public.forum_threads(group_id, pinned desc, last_post_at desc);
create index if not exists forum_posts_idx on public.forum_posts(thread_id, created_at);
alter table public.forum_threads enable row level security; alter table public.forum_posts enable row level security;

create or replace function public.forum_fill() returns trigger language plpgsql security definer set search_path = public as $$
begin
  new.author_name := (select coalesce(full_name, 'Foydalanuvchi') from public.profiles where id = new.author_id);
  if tg_table_name = 'forum_posts' then
    if exists (select 1 from public.forum_threads t where t.id = new.thread_id and t.locked) and not public.is_staff() then raise exception 'mavzu yopilgan'; end if;
    update public.forum_threads set last_post_at = now() where id = new.thread_id;
  end if;
  return new;
end $$;
drop trigger if exists trg_ft_fill on public.forum_threads; create trigger trg_ft_fill before insert on public.forum_threads for each row execute function public.forum_fill();
drop trigger if exists trg_fp_fill on public.forum_posts; create trigger trg_fp_fill before insert on public.forum_posts for each row execute function public.forum_fill();

create or replace function public.thread_ok(tid uuid) returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.forum_threads t where t.id = tid and (t.group_id is null or public.is_member(t.group_id))) or public.is_admin();
$$;
grant execute on function public.thread_ok(uuid) to authenticated;
drop policy if exists ft_sel on public.forum_threads; create policy ft_sel on public.forum_threads for select using (group_id is null or public.is_member(group_id) or public.is_admin());
drop policy if exists ft_ins on public.forum_threads; create policy ft_ins on public.forum_threads for insert with check (author_id = auth.uid() and (group_id is null or public.is_member(group_id)) and (not pinned and not locked or public.is_staff()));
drop policy if exists ft_upd on public.forum_threads; create policy ft_upd on public.forum_threads for update using (author_id = auth.uid() or public.is_staff()) with check (author_id = auth.uid() or public.is_staff());
drop policy if exists ft_del on public.forum_threads; create policy ft_del on public.forum_threads for delete using (author_id = auth.uid() or public.is_staff());
drop policy if exists fp_sel on public.forum_posts; create policy fp_sel on public.forum_posts for select using (public.thread_ok(thread_id));
drop policy if exists fp_ins on public.forum_posts; create policy fp_ins on public.forum_posts for insert with check (author_id = auth.uid() and public.thread_ok(thread_id));
drop policy if exists fp_del on public.forum_posts; create policy fp_del on public.forum_posts for delete using (author_id = auth.uid() or public.is_staff());
-- oddiy foydalanuvchi pinned/locked ni o'zgartira olmasin
create or replace function public.forum_guard() returns trigger language plpgsql security definer set search_path = public as $$
begin
  if (new.pinned is distinct from old.pinned or new.locked is distinct from old.locked) and not public.is_staff() then new.pinned := old.pinned; new.locked := old.locked; end if;
  new.author_id := old.author_id; new.group_id := old.group_id; return new;
end $$;
drop trigger if exists trg_ft_guard on public.forum_threads; create trigger trg_ft_guard before update on public.forum_threads for each row execute function public.forum_guard();

-- ---------- 3) XATOLAR DAFTARI + ADAPTIV TEST (test_attempts.wrong_ids asosida)
create table if not exists public.mistake_resolved (
  user_id uuid not null references public.profiles(id) on delete cascade, question_id uuid not null references public.questions(id) on delete cascade,
  resolved_at timestamptz not null default now(), primary key (user_id, question_id)
);
alter table public.mistake_resolved enable row level security;
drop policy if exists mr_sel on public.mistake_resolved; create policy mr_sel on public.mistake_resolved for select using (user_id = auth.uid());

create or replace function public.my_mistakes()
returns table (question_id uuid, item_id uuid, question text, correct text, wrong jsonb, explanation text, times bigint, last_at timestamptz)
language plpgsql stable security definer set search_path = public as $$
begin
  if auth.uid() is null then return; end if;
  return query
    select q.id, q.item_id, q.question, q.correct, q.wrong, q.explanation, w.n, w.last_at
    from (select s.qid, count(*) n, max(s.at) last_at from (select unnest(a.wrong_ids) qid, a.created_at at from public.test_attempts a where a.user_id = auth.uid()) s group by s.qid) w
    join public.questions q on q.id = w.qid
    where public.item_accessible(q.item_id)
      and not exists (select 1 from public.mistake_resolved r where r.user_id = auth.uid() and r.question_id = q.id and r.resolved_at > w.last_at)
    order by w.last_at desc limit 300;
end $$;
grant execute on function public.my_mistakes() to authenticated;

create or replace function public.resolve_mistake(p_question uuid) returns void
language plpgsql security definer set search_path = public as $$
begin
  if auth.uid() is null then return; end if;
  if not exists (select 1 from public.questions q where q.id = p_question and public.item_accessible(q.item_id)) then return; end if;
  insert into public.mistake_resolved(user_id, question_id) values (auth.uid(), p_question)
  on conflict (user_id, question_id) do update set resolved_at = now();
end $$;
grant execute on function public.resolve_mistake(uuid) to authenticated;

-- adaptiv: avval yechilmagan xatolar, qolganini o'zi ishlagan testlardan tasodifiy to'ldiradi
create or replace function public.adaptive_questions(p_item uuid default null, p_n int default 15)
returns table (id uuid, item_id uuid, chapter text, question text, correct text, wrong jsonb, explanation text, was_wrong boolean)
language plpgsql stable security definer set search_path = public as $$
begin
  if auth.uid() is null then return; end if;
  return query
    with m as (select mm.question_id from public.my_mistakes() mm),
    pool as (select q.* from public.questions q where public.item_accessible(q.item_id) and (p_item is null or q.item_id = p_item)
             and (p_item is not null or q.item_id in (select a.item_id from public.test_attempts a where a.user_id = auth.uid())))
    select p.id, p.item_id, p.chapter, p.question, p.correct, p.wrong, p.explanation, (p.id in (select question_id from m))
    from pool p order by (p.id in (select question_id from m)) desc, random() limit greatest(1, least(p_n, 50));
end $$;
grant execute on function public.adaptive_questions(uuid, int) to authenticated;

-- ---------- 4) AUDIT TRIGGERLARI
create or replace function public.audit_trg() returns trigger language plpgsql security definer set search_path = public as $$
declare r jsonb := to_jsonb(coalesce(new, old)); meta jsonb := '{}'::jsonb;
begin
  if tg_table_name = 'profiles' then meta := jsonb_build_object('role', new.role, 'blocked', new.blocked, 'was_role', old.role, 'was_blocked', old.blocked);
  elsif tg_table_name = 'app_settings' then meta := jsonb_build_object('key', r->>'key');
  elsif tg_table_name in ('items','folders','courses') then meta := jsonb_build_object('title', r->'title');
  elsif tg_table_name = 'subscriptions' then meta := jsonb_build_object('user', r->>'user_id', 'until', r->>'paid_until'); end if;
  insert into public.audit_log(actor, actor_name, action, entity, entity_id, meta)
  values (auth.uid(), (select coalesce(full_name, email) from public.profiles where id = auth.uid()), lower(tg_op), tg_table_name, coalesce(r->>'id', r->>'user_id', r->>'key'), meta);
  return coalesce(new, old);
end $$;
drop trigger if exists aud_profiles on public.profiles;
create trigger aud_profiles after update on public.profiles for each row when (old.role is distinct from new.role or old.blocked is distinct from new.blocked) execute function public.audit_trg();
drop trigger if exists aud_items on public.items; create trigger aud_items after delete on public.items for each row execute function public.audit_trg();
drop trigger if exists aud_folders on public.folders; create trigger aud_folders after delete on public.folders for each row execute function public.audit_trg();
drop trigger if exists aud_courses on public.courses; create trigger aud_courses after insert or delete on public.courses for each row execute function public.audit_trg();
drop trigger if exists aud_courses_pub on public.courses;
create trigger aud_courses_pub after update on public.courses for each row when (old.status is distinct from new.status) execute function public.audit_trg();
drop trigger if exists aud_settings on public.app_settings; create trigger aud_settings after insert or update on public.app_settings for each row execute function public.audit_trg();
drop trigger if exists aud_subs on public.subscriptions; create trigger aud_subs after insert or update or delete on public.subscriptions for each row execute function public.audit_trg();

-- ---------- 5) AI: kunlik limit va tarix (kalit faqat Edge Function da)
create table if not exists public.ai_usage (user_id uuid not null references public.profiles(id) on delete cascade, day date not null, n int not null default 0, primary key (user_id, day));
create table if not exists public.ai_messages (
  id bigserial primary key, user_id uuid not null references public.profiles(id) on delete cascade, role text not null check (role in ('user','assistant')),
  content text not null check (length(content) <= 12000), created_at timestamptz not null default now()
);
create index if not exists ai_msg_user on public.ai_messages(user_id, id desc);
alter table public.ai_usage enable row level security; alter table public.ai_messages enable row level security;
drop policy if exists aiu_sel on public.ai_usage; create policy aiu_sel on public.ai_usage for select using (user_id = auth.uid() or public.is_admin());
drop policy if exists aim_sel on public.ai_messages; create policy aim_sel on public.ai_messages for select using (user_id = auth.uid() or public.is_admin());
drop policy if exists aim_ins on public.ai_messages; create policy aim_ins on public.ai_messages for insert with check (user_id = auth.uid());
drop policy if exists aim_del on public.ai_messages; create policy aim_del on public.ai_messages for delete using (user_id = auth.uid());

create or replace function public.ai_take_quota() returns jsonb
language plpgsql security definer set search_path = public as $$
declare d date := (now() at time zone 'Asia/Tashkent')::date; lim int; used int;
begin
  if auth.uid() is null then return jsonb_build_object('ok', false, 'used', 0, 'limit', 0); end if;
  lim := coalesce((select (value->>'daily_limit')::int from public.app_settings where key = 'ai'), 30);
  if (select coalesce((value->>'enabled')::boolean, true) from public.app_settings where key = 'ai') is false then return jsonb_build_object('ok', false, 'used', 0, 'limit', lim, 'off', true); end if;
  if public.is_staff() then lim := lim * 3; end if;
  insert into public.ai_usage(user_id, day, n) values (auth.uid(), d, 0) on conflict do nothing;
  select n into used from public.ai_usage where user_id = auth.uid() and day = d for update;
  if used >= lim then return jsonb_build_object('ok', false, 'used', used, 'limit', lim); end if;
  update public.ai_usage set n = n + 1 where user_id = auth.uid() and day = d;
  return jsonb_build_object('ok', true, 'used', used + 1, 'limit', lim);
end $$;
grant execute on function public.ai_take_quota() to authenticated;

-- ---------- 6) KENGAYTIRILGAN ANALITIKA (admin)
create or replace function public.admin_analytics(p_from date, p_to date) returns jsonb
language plpgsql stable security definer set search_path = public as $$
begin
  if not public.is_admin() then raise exception 'ruxsat yo''q'; end if;
  return jsonb_build_object(
    'signups', (select coalesce(jsonb_agg(jsonb_build_object('day', d, 'n', n) order by d), '[]') from (select (created_at at time zone 'Asia/Tashkent')::date d, count(*) n from public.profiles where (created_at at time zone 'Asia/Tashkent')::date between p_from and p_to group by 1) s),
    'dau', (select coalesce(jsonb_agg(jsonb_build_object('day', day, 'n', n) order by day), '[]') from (select day, count(distinct user_id) n from public.usage_daily where day between p_from and p_to group by day) s),
    'enrollments', (select count(*) from public.enrollments where (created_at at time zone 'Asia/Tashkent')::date between p_from and p_to),
    'lessons_done', (select count(*) from public.lesson_progress where (completed_at at time zone 'Asia/Tashkent')::date between p_from and p_to),
    'certificates', (select count(*) from public.certificates where (issued_at at time zone 'Asia/Tashkent')::date between p_from and p_to),
    'card_reviews', (select count(*) from public.card_reviews where (at at time zone 'Asia/Tashkent')::date between p_from and p_to),
    'tests', (select jsonb_build_object('n', count(*), 'avg', round(coalesce(avg(percent), 0))) from public.test_attempts where (created_at at time zone 'Asia/Tashkent')::date between p_from and p_to),
    'xp_by_kind', (select coalesce(jsonb_object_agg(kind, x), '{}') from (select kind, sum(xp) x from public.xp_events where day between p_from and p_to group by kind) s),
    'ai_calls', (select coalesce(sum(n), 0) from public.ai_usage where day between p_from and p_to),
    'top_courses', (select coalesce(jsonb_agg(jsonb_build_object('title', title, 'n', n, 'done', done) order by n desc), '[]') from (select c.title, count(e.user_id) n, count(e.completed_at) done from public.courses c left join public.enrollments e on e.course_id = c.id group by c.id, c.title order by count(e.user_id) desc limit 10) s),
    'users_by_role', (select coalesce(jsonb_object_agg(role, n), '{}') from (select role, count(*) n from public.profiles group by role) s));
end $$;
grant execute on function public.admin_analytics(date, date) to authenticated;

-- ---------- 7) TEST XP (har urinish uchun bir marta; miqdorni server hisoblaydi)
create or replace function public.claim_test_xp(p_attempt uuid) returns jsonb
language plpgsql security definer set search_path = public as $$
declare a record; give int;
begin
  select * into a from public.test_attempts where id = p_attempt and user_id = auth.uid();
  if not found then return jsonb_build_object('xp', 0); end if;
  if a.total < 3 or a.created_at < now() - interval '1 day' then return jsonb_build_object('xp', 0); end if;
  give := public._xp(auth.uid(), 'test', p_attempt::text, least(25, 5 + round(a.percent / 10)::int + case when a.percent >= 90 then 5 else 0 end));
  perform public.touch_streak();
  return jsonb_build_object('xp', give, 'achievements', public.check_achievements());
end $$;
grant execute on function public.claim_test_xp(uuid) to authenticated;

select 'update8 tayyor' as natija;
