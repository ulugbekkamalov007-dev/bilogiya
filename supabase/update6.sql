-- update6.sql — reyting tafsilotlari, vazifada audio joylar / kitob / test. Qayta ishga tushirsa ham xavfsiz.

-- 1) REYTING: foydalanuvchi tafsilotlari (reyting yoqilgan bo'lsa hamma ko'ra oladi, admin doim)
create or replace function public.rating_user_items(p_user uuid, p_from date, p_to date)
returns table (item_id uuid, kind text, title jsonb, seconds bigint)
language plpgsql stable security definer set search_path = public as $$
begin
  if auth.uid() is null then raise exception 'ruxsat yo''q'; end if;
  if not public.is_admin() and p_user <> auth.uid()
     and not coalesce((select (value->>'leaderboard')::boolean from public.app_settings where key = 'app'), true) then
    raise exception 'ruxsat yo''q';
  end if;
  return query
    select u.item_id, u.kind, i.title, sum(u.seconds)::bigint
    from public.usage_daily u left join public.items i on i.id = u.item_id
    where u.user_id = p_user and u.day between p_from and p_to and u.kind <> 'app'
    group by u.item_id, u.kind, i.title order by sum(u.seconds) desc limit 300;
end $$;
grant execute on function public.rating_user_items(uuid, date, date) to authenticated;

create or replace function public.rating_user_tests(p_user uuid, p_from date, p_to date)
returns table (item_id uuid, title jsonb, correct int, total int, percent numeric, created_at timestamptz)
language plpgsql stable security definer set search_path = public as $$
begin
  if auth.uid() is null then raise exception 'ruxsat yo''q'; end if;
  if not public.is_admin() and p_user <> auth.uid()
     and not coalesce((select (value->>'leaderboard')::boolean from public.app_settings where key = 'app'), true) then
    raise exception 'ruxsat yo''q';
  end if;
  return query
    select a.item_id, i.title, a.correct::int, a.total::int, a.percent, a.created_at
    from public.test_attempts a left join public.items i on i.id = a.item_id
    where a.user_id = p_user and (a.created_at at time zone 'Asia/Tashkent')::date between p_from and p_to
    order by a.created_at desc limit 100;
end $$;
grant execute on function public.rating_user_tests(uuid, date, date) to authenticated;

-- 2) VAZIFA: audio joylar soni, biriktirilgan kitob (ilovadagi yoki yuklangan)
alter table public.assignments add column if not exists audio_slots int not null default 5;
do $$ begin
  alter table public.assignments drop constraint if exists assignments_audio_slots_check;
  alter table public.assignments add constraint assignments_audio_slots_check check (audio_slots between 0 and 20);
end $$;
alter table public.assignments add column if not exists book_item_id uuid references public.items(id) on delete set null;
alter table public.assignments add column if not exists book_path text;
alter table public.assignments add column if not exists book_name text;

create table if not exists public.assignment_audios (
  id            uuid primary key default gen_random_uuid(),
  assignment_id uuid not null references public.assignments(id) on delete cascade,
  group_id      uuid not null references public.groups(id) on delete cascade,
  user_id       uuid not null references public.profiles(id) on delete cascade,
  slot          int  not null check (slot between 1 and 20),
  path          text not null,
  secs          int,
  file_name     text,
  created_at    timestamptz not null default now(),
  unique (assignment_id, user_id, slot)
);
alter table public.assignment_audios enable row level security;
drop policy if exists aa_sel on public.assignment_audios;
create policy aa_sel on public.assignment_audios for select using (user_id = auth.uid() or public.is_admin());
drop policy if exists aa_ins on public.assignment_audios;
create policy aa_ins on public.assignment_audios for insert with check (user_id = auth.uid() and public.is_member(group_id));
drop policy if exists aa_upd on public.assignment_audios;
create policy aa_upd on public.assignment_audios for update using (user_id = auth.uid()) with check (user_id = auth.uid() and public.is_member(group_id));
drop policy if exists aa_del on public.assignment_audios;
create policy aa_del on public.assignment_audios for delete using (user_id = auth.uid() or public.is_admin());
drop policy if exists aa_adm on public.assignment_audios;
create policy aa_adm on public.assignment_audios for all using (public.is_admin()) with check (public.is_admin());

-- Vazifaga biriktirilgan test/kitob (yashirin bo'lsa ham) shu guruh a'zolariga ochiq
create or replace function public.task_item_ok(iid uuid) returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.assignments a join public.group_members gm on gm.group_id = a.group_id
                 where (a.test_item_id = iid or a.book_item_id = iid) and gm.user_id = auth.uid() and gm.status = 'approved')
     and public.has_access();
$$;
grant execute on function public.task_item_ok(uuid) to authenticated;

create or replace function public.item_accessible(iid uuid) returns boolean
language plpgsql stable security definer set search_path = public as $$
declare it record;
begin
  if public.is_admin() then return true; end if;
  if public.task_item_ok(iid) then return true; end if;
  select visible, folder_id into it from public.items where id = iid;
  if not found or not it.visible then return false; end if;
  return public.folder_accessible(it.folder_id);
end $$;

drop policy if exists i_sel on public.items;
create policy i_sel on public.items for select using (
  public.is_admin() or (visible and public.folder_visible(folder_id)) or public.task_item_ok(id)
);

-- Vazifa natijalari: audio soni endi joylardan ham hisoblanadi
create or replace function public.assignment_overview(p_assignment uuid)
returns table (uid uuid, full_name text, texts int, voices int, files int, grade int, last_at timestamptz, test_best numeric, test_n int)
language plpgsql stable security definer set search_path = public as $$
declare v_group uuid; v_test uuid;
begin
  if not public.is_admin() then raise exception 'ruxsat yo''q'; end if;
  select a.group_id, a.test_item_id into v_group, v_test from public.assignments a where a.id = p_assignment;
  return query
    select gm.user_id, coalesce(p.full_name, p.email),
      (select count(*) from public.submissions s where s.assignment_id = p_assignment and s.user_id = gm.user_id and length(s.text) > 0)::int,
      ((select count(*) from public.submissions s where s.assignment_id = p_assignment and s.user_id = gm.user_id and s.voice_path is not null)
       + (select count(*) from public.assignment_audios x where x.assignment_id = p_assignment and x.user_id = gm.user_id))::int,
      (select count(*) from public.submissions s where s.assignment_id = p_assignment and s.user_id = gm.user_id and s.file_path is not null)::int,
      (select max(s.grade) from public.submissions s where s.assignment_id = p_assignment and s.user_id = gm.user_id),
      greatest((select max(s.created_at) from public.submissions s where s.assignment_id = p_assignment and s.user_id = gm.user_id),
               (select max(x.created_at) from public.assignment_audios x where x.assignment_id = p_assignment and x.user_id = gm.user_id)),
      case when v_test is null then null else (select max(t.percent) from public.test_attempts t where t.user_id = gm.user_id and t.item_id = v_test) end,
      case when v_test is null then 0 else (select count(*) from public.test_attempts t where t.user_id = gm.user_id and t.item_id = v_test)::int end
    from public.group_members gm join public.profiles p on p.id = gm.user_id
    where gm.group_id = v_group and gm.status = 'approved';
end $$;
grant execute on function public.assignment_overview(uuid) to authenticated;
select 'update6 tayyor' as natija;
