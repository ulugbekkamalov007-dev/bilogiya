-- update10.sql — rollar emaili tuzatildi + o'qituvchi o'z guruhlari/vazifalarini boshqaradi. Qayta ishga tushirsa ham xavfsiz.
-- Tartib: update6 → update7 → update8 → update9 → update10

-- 0) Rollar (parol tegilmaydi; hisob yo'q bo'lsa yaratilmaydi)
do $$
declare r record;
begin
  for r in select * from (values ('ulugbekkamalov0829@gmail.com','admin'), ('umidjonkamalov21@gmail.com','teacher')) v(em, rl) loop
    update public.profiles set role = r.rl where lower(email) = r.em;
    if not found then raise notice 'HISOB TOPILMADI: % — avval ro''yxatdan o''tsin, keyin shu blokni qayta yuriting', r.em; end if;
  end loop;
  -- avvalgi (xato) email o'qituvchi bo'lib qolgan bo'lsa, oddiy foydalanuvchiga qaytariladi
  update public.profiles set role = 'user' where lower(email) = 'umidjonkamalov0829@gmail.com' and role = 'teacher';
end $$;

-- 1) Guruhni boshqarish huquqi: admin yoki guruh egasi bo'lgan o'qituvchi
create or replace function public.g_manage(gid uuid) returns boolean
language sql stable security definer set search_path = public as $$
  select public.is_admin() or exists (select 1 from public.groups g where g.id = gid and g.owner_id = auth.uid() and public.is_teacher());
$$;
grant execute on function public.g_manage(uuid) to authenticated;

-- 2) Siyosatlar
drop policy if exists g_sel on public.groups;
create policy g_sel on public.groups for select using (public.is_admin() or public.is_member(id) or (owner_id = auth.uid() and public.is_teacher()));
drop policy if exists g_tch on public.groups;
create policy g_tch on public.groups for all using (public.is_admin() or (owner_id = auth.uid() and public.is_teacher())) with check (public.is_admin() or (owner_id = auth.uid() and public.is_teacher()));

drop policy if exists gm_sel on public.group_members;
create policy gm_sel on public.group_members for select using (user_id = auth.uid() or public.g_manage(group_id));
drop policy if exists gm_leave on public.group_members;
create policy gm_leave on public.group_members for delete using (user_id = auth.uid() or public.g_manage(group_id));
drop policy if exists gm_adm on public.group_members;
create policy gm_adm on public.group_members for all using (public.g_manage(group_id)) with check (public.g_manage(group_id));

drop policy if exists as_sel on public.assignments;
create policy as_sel on public.assignments for select using (public.is_member(group_id) or public.g_manage(group_id));
drop policy if exists as_all on public.assignments;
create policy as_all on public.assignments for all using (public.g_manage(group_id)) with check (public.g_manage(group_id));

drop policy if exists m_sel on public.messages;
create policy m_sel on public.messages for select using (public.g_manage(group_id) or public.is_member(group_id));
drop policy if exists m_ins on public.messages;
create policy m_ins on public.messages for insert with check (
  user_id = auth.uid() and (public.g_manage(group_id)
    or (public.is_member(group_id) and (assignment_id is not null or (select students_can_chat from public.groups g where g.id = group_id)))));
drop policy if exists m_del on public.messages;
create policy m_del on public.messages for delete using (user_id = auth.uid() or public.g_manage(group_id));

drop policy if exists sb_sel on public.submissions;
create policy sb_sel on public.submissions for select using (user_id = auth.uid() or public.g_manage(group_id));
drop policy if exists sb_adm on public.submissions;
create policy sb_adm on public.submissions for update using (public.g_manage(group_id)) with check (public.g_manage(group_id));
drop policy if exists sb_del on public.submissions;
create policy sb_del on public.submissions for delete using (user_id = auth.uid() or public.g_manage(group_id));

drop policy if exists aa_sel on public.assignment_audios;
create policy aa_sel on public.assignment_audios for select using (user_id = auth.uid() or public.g_manage(group_id));
drop policy if exists aa_del on public.assignment_audios;
create policy aa_del on public.assignment_audios for delete using (user_id = auth.uid() or public.g_manage(group_id));

-- 3) Fayllar (chat bucket): o'qituvchi o'z guruhi papkalariga o'qiydi/yozadi
create or replace function public.chat_object_ok(p_name text, p_write boolean) returns boolean
language plpgsql stable security definer set search_path = public, storage as $$
declare parts text[] := storage.foldername(p_name); gid uuid;
begin
  if auth.uid() is null then return false; end if;
  if public.is_admin() then return true; end if;
  if parts[1] = 'dm' then return parts[2] = auth.uid()::text; end if;
  begin gid := parts[1]::uuid; exception when others then return false; end;
  if public.g_manage(gid) then return true; end if;
  if not public.is_member(gid) then return false; end if;
  if p_write then return parts[2] = auth.uid()::text; end if;
  return true;
end $$;

-- 4) A'zolar ro'yxati va vazifa natijalari — o'qituvchiga ham
create or replace function public.group_roster(p_group uuid)
returns table (user_id uuid, full_name text, email text, status text, joined_at timestamptz)
language plpgsql stable security definer set search_path = public as $$
begin
  if not public.g_manage(p_group) then raise exception 'ruxsat yo''q'; end if;
  return query
    select m.user_id, p.full_name, p.email, m.status, m.joined_at
    from public.group_members m join public.profiles p on p.id = m.user_id
    where m.group_id = p_group order by m.status, p.full_name;
end $$;

create or replace function public.assignment_overview(p_assignment uuid)
returns table (uid uuid, full_name text, texts int, voices int, files int, grade int, last_at timestamptz, test_best numeric, test_n int)
language plpgsql stable security definer set search_path = public as $$
declare v_group uuid; v_test uuid;
begin
  select a.group_id, a.test_item_id into v_group, v_test from public.assignments a where a.id = p_assignment;
  if not public.g_manage(v_group) then raise exception 'ruxsat yo''q'; end if;
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
grant execute on function public.group_roster(uuid) to authenticated;
grant execute on function public.assignment_overview(uuid) to authenticated;

-- 5) Talabalar BARCHA guruhlarni (nomi bilan) ko'radi va so'rov yuboradi — groups_public ko'rinishi allaqachon ochiq.
--    Guruhdagi a'zolar soni ham ko'rsatiladi:
create or replace view public.groups_public as
  select g.id, g.name, g.description,
         (select count(*) from public.group_members m where m.group_id = g.id and m.status = 'approved')::int as members
  from public.groups g where not g.archived;
grant select on public.groups_public to authenticated;

-- 6) Faollik kalendari uchun 400 kunlik ma'lumot (oylik ko'rinish)
create or replace function public.my_learning_summary() returns jsonb
language plpgsql stable security definer set search_path = public as $$
declare uid uuid := auth.uid(); today date := (now() at time zone 'Asia/Tashkent')::date; r jsonb;
begin
  if uid is null then return null; end if;
  select jsonb_build_object(
    'today', (select coalesce(jsonb_object_agg(kind, s), '{}') from (select kind, sum(seconds)::int s from public.usage_daily where user_id = uid and day = today and kind <> 'app' group by kind) a),
    'week',  (select coalesce(jsonb_object_agg(kind, s), '{}') from (select kind, sum(seconds)::int s from public.usage_daily where user_id = uid and day > today - 7 and kind <> 'app' group by kind) a),
    'all',   (select coalesce(jsonb_object_agg(kind, s), '{}') from (select kind, sum(seconds)::int s from public.usage_daily where user_id = uid and kind <> 'app' group by kind) a),
    'days',  (select coalesce(jsonb_agg(jsonb_build_object('d', day, 's', s) order by day), '[]') from (select day, sum(seconds)::int s from public.usage_daily where user_id = uid and kind <> 'app' and day > today - 400 group by day) a),
    'streak', (select coalesce(streak, 0) from public.user_stats where user_id = uid),
    'best', (select coalesce(best_streak, 0) from public.user_stats where user_id = uid),
    'goal', (select coalesce(daily_goal_min, 20) from public.user_stats where user_id = uid),
    'tests', (select jsonb_build_object('n', count(*), 'correct', coalesce(sum(correct), 0), 'total', coalesce(sum(total), 0), 'best', coalesce(max(percent), 0)) from public.test_attempts where user_id = uid)
  ) into r;
  return r;
end $$;
grant execute on function public.my_learning_summary() to authenticated;

-- 7) Guruhga e'lon: xabar chatga tushadi VA guruhning barcha a'zolariga e'lon (bildirishnoma) sifatida boradi
create or replace function public.announce_group(p_group uuid, p_text text, p_assignment uuid default null) returns uuid
language plpgsql security definer set search_path = public as $$
declare v_id uuid; v_title text := left(trim(p_text), 80); v_name text;
begin
  if auth.uid() is null or not public.g_manage(p_group) then raise exception 'ruxsat yo''q'; end if;
  if length(trim(coalesce(p_text, ''))) = 0 then raise exception 'matn bo''sh'; end if;
  select name into v_name from public.groups where id = p_group;
  insert into public.messages (group_id, assignment_id, user_id, kind, body) values (p_group, p_assignment, auth.uid(), 'text', '📢 ' || trim(p_text));
  insert into public.announcements (kind, title, body, target, group_ids, pinned, created_by)
  values ('news', jsonb_build_object('uz', '📢 ' || coalesce(v_name, 'Guruh') || ': ' || v_title, 'ru', '📢 ' || coalesce(v_name, 'Группа') || ': ' || v_title, 'en', '📢 ' || coalesce(v_name, 'Group') || ': ' || v_title),
          jsonb_build_object('uz', trim(p_text), 'ru', trim(p_text), 'en', trim(p_text)), 'groups', array[p_group], false, auth.uid())
  returning id into v_id;
  return v_id;
end $$;
grant execute on function public.announce_group(uuid, text, uuid) to authenticated;

select 'update10 tayyor' as natija;
