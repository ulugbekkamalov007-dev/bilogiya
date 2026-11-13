-- =====================================================================
-- BioAcademy 2.0 — update9: o'qituvchi materiallari, guruhga biriktirish,
-- chiqitdon (soft delete), o'qish xulosasi, rol tayinlash (email bo'yicha)
-- update7 va update8 dan KEYIN yuriting. Qayta yuritish xavfsiz. Qaytarish: update9_rollback.sql
-- =====================================================================

-- ---------- 0) Rol tayinlash (parol tegilmaydi; hisob bo'lmasa YARATILMAYDI)
do $$
declare r record; want text;
begin
  for r in select * from (values ('ulugbekkamalov0829@gmail.com','admin'), ('umidjonkamalov0829@gmail.com','teacher')) v(em, rl) loop
    update public.profiles set role = r.rl where lower(email) = r.em;
    if not found then raise notice 'HISOB TOPILMADI (yaratilmadi): % — avval ro''yxatdan o''tsin, keyin shu blokni qayta yuriting', r.em;
    else raise notice 'Rol berildi: % -> %', r.em, r.rl; end if;
  end loop;
end $$;


-- ---------- 0b) MUHIM TUZATISH: add_usage ichidagi "bank" o'zgaruvchisi ustun nomi bilan to'qnashardi
-- ("column reference \"bank\" is ambiguous") — natijada har bir chaqiruv xato bilan tugab, vaqt umuman yozilmasdi.
create or replace function public.add_usage(p_kind text, p_item uuid, p_secs int) returns void
language plpgsql security definer set search_path = public as $$
declare d date := (now() at time zone 'Asia/Tashkent')::date;
        v_s int := greatest(0, least(coalesce(p_secs, 0), 60));
        c record; v_bank double precision; v_el double precision;
begin
  if auth.uid() is null or v_s = 0 then return; end if;
  if p_kind not in ('app','video','audio','book','test') then return; end if;

  select * into c from public.usage_clock uc where uc.user_id = auth.uid() and uc.kind = p_kind for update;
  if not found then
    insert into public.usage_clock (user_id, kind, bank, at) values (auth.uid(), p_kind, 60, now()) returning * into c;
  end if;
  v_el := greatest(0, extract(epoch from (now() - c.at)));
  v_bank := least(120, c.bank + v_el);               -- ko'pi bilan 2 daqiqalik zaxira (1 soniya/soniya)
  v_s := least(v_s, floor(v_bank)::int);
  update public.usage_clock uc set bank = v_bank - v_s, at = now() where uc.user_id = auth.uid() and uc.kind = p_kind;
  if v_s <= 0 then return; end if;

  insert into public.usage_daily (user_id, day, kind, item_id, seconds)
  values (auth.uid(), d, p_kind, coalesce(p_item, '00000000-0000-0000-0000-000000000000'), v_s)
  on conflict (user_id, day, kind, item_id)
  do update set seconds = public.usage_daily.seconds + excluded.seconds;
  update public.profiles set last_seen = now() where id = auth.uid();
end $$;
grant execute on function public.add_usage(text, uuid, int) to authenticated;

-- ---------- 1) Ustunlar
alter table public.folders add column if not exists deleted_at timestamptz;
alter table public.items   add column if not exists deleted_at timestamptz;
alter table public.items   add column if not exists cover_path text;
alter table public.questions add column if not exists image_path text;
alter table public.questions add column if not exists difficulty smallint not null default 2 check (difficulty between 1 and 3);
alter table public.questions add column if not exists points smallint not null default 1 check (points between 1 and 100);
create index if not exists items_owner_idx on public.items(created_by) where deleted_at is null;
create index if not exists folders_owner_idx on public.folders(created_by) where deleted_at is null;

-- ---------- 2) Materialni guruhga biriktirish (papka yoki material)
create table if not exists public.material_groups (
  id bigserial primary key,
  folder_id uuid references public.folders(id) on delete cascade,
  item_id uuid references public.items(id) on delete cascade,
  group_id uuid not null references public.groups(id) on delete cascade,
  created_by uuid default auth.uid(), created_at timestamptz not null default now(),
  check ((folder_id is null) <> (item_id is null))
);
create unique index if not exists mg_f_u on public.material_groups(folder_id, group_id) where folder_id is not null;
create unique index if not exists mg_i_u on public.material_groups(item_id, group_id) where item_id is not null;
alter table public.material_groups enable row level security;

create or replace function public.mg_ok(p_kind text, p_id uuid) returns boolean
language sql stable security definer set search_path = public as $$
  select not exists (select 1 from public.material_groups m where (p_kind = 'f' and m.folder_id = p_id) or (p_kind = 'i' and m.item_id = p_id))
      or exists (select 1 from public.material_groups m where ((p_kind = 'f' and m.folder_id = p_id) or (p_kind = 'i' and m.item_id = p_id))
                 and (public.is_member(m.group_id) or exists (select 1 from public.groups g where g.id = m.group_id and g.owner_id = auth.uid())));
$$;
grant execute on function public.mg_ok(text, uuid) to authenticated;

drop policy if exists mg_sel on public.material_groups;
create policy mg_sel on public.material_groups for select using (public.is_staff() or public.is_member(group_id));
-- yozish faqat RPC orqali (assign_material_groups)

-- ---------- 3) Ko'rinish funksiyalari: guruh cheklovi + chiqitdon + egasi
create or replace function public.folder_visible(fid uuid) returns boolean
language plpgsql stable security definer set search_path = public as $$
declare cur uuid := fid; f record; n int := 0;
begin
  if fid is null then return true; end if;
  if public.is_admin() then return true; end if;
  while cur is not null and n < 20 loop
    select visible, parent_id, created_by, deleted_at into f from public.folders where id = cur;
    if not found then return false; end if;
    if f.created_by = auth.uid() then return true; end if;
    if not f.visible or f.deleted_at is not null or not public.mg_ok('f', cur) then return false; end if;
    cur := f.parent_id; n := n + 1;
  end loop;
  return true;
end $$;

create or replace function public.folder_accessible(fid uuid) returns boolean
language plpgsql stable security definer set search_path = public as $$
declare cur uuid := fid; f record; n int := 0;
begin
  if fid is null then return true; end if;
  if public.is_admin() then return true; end if;
  while cur is not null and n < 20 loop
    select visible, price, parent_id, created_by, deleted_at into f from public.folders where id = cur;
    if not found then return false; end if;
    if f.created_by = auth.uid() then return true; end if;
    if not f.visible or f.deleted_at is not null or not public.mg_ok('f', cur) then return false; end if;
    if f.price > 0 and not exists (select 1 from public.entitlements e where e.user_id = auth.uid() and e.folder_id = cur) then return false; end if;
    cur := f.parent_id; n := n + 1;
  end loop;
  return true;
end $$;

create or replace function public.item_accessible(iid uuid) returns boolean
language plpgsql stable security definer set search_path = public as $$
declare it record;
begin
  if public.is_admin() then return true; end if;
  select visible, folder_id, created_by, deleted_at into it from public.items where id = iid;
  if not found then return false; end if;
  if it.created_by = auth.uid() then return true; end if;
  if public.task_item_ok(iid) or public.lesson_item_ok(iid) then return it.deleted_at is null; end if;
  if not it.visible or it.deleted_at is not null or not public.mg_ok('i', iid) then return false; end if;
  return public.folder_accessible(it.folder_id);
end $$;

drop policy if exists f_sel on public.folders;
create policy f_sel on public.folders for select using (public.folder_visible(id));
drop policy if exists i_sel on public.items;
create policy i_sel on public.items for select using (
  public.is_admin() or created_by = auth.uid()
  or (visible and deleted_at is null and public.folder_visible(folder_id) and public.mg_ok('i', id))
  or ((public.task_item_ok(id) or public.lesson_item_ok(id)) and deleted_at is null)
);

-- ---------- 4) O'qituvchi o'z papka/materiallarini boshqaradi (narx belgilay olmaydi)
create or replace function public.own_folder(fid uuid) returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.folders f where f.id = fid and f.created_by = auth.uid() and f.deleted_at is null);
$$;
grant execute on function public.own_folder(uuid) to authenticated;

drop policy if exists f_own_ins on public.folders;
create policy f_own_ins on public.folders for insert to authenticated
  with check (public.is_teacher() and created_by = auth.uid() and price = 0 and (parent_id is null or public.own_folder(parent_id)));
drop policy if exists f_own_upd on public.folders;
create policy f_own_upd on public.folders for update to authenticated
  using (public.is_teacher() and created_by = auth.uid())
  with check (public.is_teacher() and created_by = auth.uid() and price = 0 and (parent_id is null or public.own_folder(parent_id)));
drop policy if exists f_own_del on public.folders;
create policy f_own_del on public.folders for delete to authenticated
  using (public.is_teacher() and created_by = auth.uid() and deleted_at is not null);

drop policy if exists i_own_ins on public.items;
create policy i_own_ins on public.items for insert to authenticated
  with check (public.is_teacher() and created_by = auth.uid() and folder_id is not null and public.own_folder(folder_id));
drop policy if exists i_own_upd on public.items;
create policy i_own_upd on public.items for update to authenticated
  using (public.is_teacher() and created_by = auth.uid())
  with check (public.is_teacher() and created_by = auth.uid() and folder_id is not null and public.own_folder(folder_id));
drop policy if exists i_own_del on public.items;
create policy i_own_del on public.items for delete to authenticated
  using (public.is_teacher() and created_by = auth.uid() and deleted_at is not null);

drop policy if exists q_own on public.questions;
create policy q_own on public.questions for all to authenticated
  using (public.is_teacher() and exists (select 1 from public.items i where i.id = item_id and i.created_by = auth.uid()))
  with check (public.is_teacher() and exists (select 1 from public.items i where i.id = item_id and i.created_by = auth.uid()));

-- O'qituvchi o'z testlari natijalarini ko'ra oladi
drop policy if exists ta_owner_sel on public.test_attempts;
create policy ta_owner_sel on public.test_attempts for select to authenticated
  using (public.is_teacher() and exists (select 1 from public.items i where i.id = item_id and i.created_by = auth.uid()));

-- ---------- 5) Storage: o'qituvchi 'content' ga faqat o'z (yoki yangi) material papkasiga yozadi, 'media' ga (muqova) yozadi
create or replace function public.content_write_ok(p_name text) returns boolean
language plpgsql stable security definer set search_path = public, storage as $$
declare iid uuid;
begin
  if public.is_admin() then return true; end if;
  if not public.is_teacher() then return false; end if;
  begin iid := (storage.foldername(p_name))[1]::uuid; exception when others then return false; end;
  return not exists (select 1 from public.items i where i.id = iid and i.created_by is distinct from auth.uid());
end $$;
grant execute on function public.content_write_ok(text) to authenticated;

drop policy if exists st_ct_write on storage.objects;
create policy st_ct_write on storage.objects for all to authenticated
  using (bucket_id = 'content' and public.content_write_ok(name)) with check (bucket_id = 'content' and public.content_write_ok(name));
drop policy if exists st_md_write on storage.objects;
create policy st_md_write on storage.objects for all to authenticated
  using (bucket_id = 'media' and public.is_staff()) with check (bucket_id = 'media' and public.is_staff());

-- ---------- 6) RPC: materialni guruhlarga biriktirish
create or replace function public.assign_material_groups(p_kind text, p_id uuid, p_groups uuid[]) returns void
language plpgsql security definer set search_path = public as $$
declare g uuid; own uuid;
begin
  if not public.is_staff() then raise exception 'ruxsat yo''q'; end if;
  if p_kind not in ('f','i') then raise exception 'noto''g''ri tur'; end if;
  select created_by into own from (select created_by from public.folders where p_kind = 'f' and id = p_id
                                   union all select created_by from public.items where p_kind = 'i' and id = p_id) x limit 1;
  if not found then raise exception 'topilmadi'; end if;
  if not public.is_admin() and own is distinct from auth.uid() then raise exception 'bu sizning materialingiz emas'; end if;
  foreach g in array coalesce(p_groups, '{}') loop
    if not public.is_admin() and not exists (select 1 from public.groups where id = g and owner_id = auth.uid()) then raise exception 'bu sizning guruhingiz emas'; end if;
  end loop;
  if p_kind = 'f' then delete from public.material_groups where folder_id = p_id; else delete from public.material_groups where item_id = p_id; end if;
  foreach g in array coalesce(p_groups, '{}') loop
    if p_kind = 'f' then insert into public.material_groups(folder_id, group_id) values (p_id, g) on conflict do nothing;
    else insert into public.material_groups(item_id, group_id) values (p_id, g) on conflict do nothing; end if;
  end loop;
  perform public._audit('material.groups', case when p_kind = 'f' then 'folder' else 'item' end, p_id::text, jsonb_build_object('groups', coalesce(p_groups, '{}')));
end $$;
grant execute on function public.assign_material_groups(text, uuid, uuid[]) to authenticated;

-- ---------- 7) Ko'rishlar soni (har ochilish)
create table if not exists public.item_views (
  user_id uuid not null references public.profiles(id) on delete cascade,
  item_id uuid not null references public.items(id) on delete cascade,
  plays int not null default 0, last_at timestamptz not null default now(),
  primary key (user_id, item_id)
);
alter table public.item_views enable row level security;
drop policy if exists iv_sel on public.item_views;
create policy iv_sel on public.item_views for select using (user_id = auth.uid() or public.is_admin());
create or replace function public.item_open(p_item uuid) returns void
language plpgsql security definer set search_path = public as $$
begin
  if auth.uid() is null or not public.item_accessible(p_item) then return; end if;
  insert into public.item_views(user_id, item_id, plays) values (auth.uid(), p_item, 1)
  on conflict (user_id, item_id) do update set plays = public.item_views.plays + 1, last_at = now();
end $$;
grant execute on function public.item_open(uuid) to authenticated;

-- ---------- 8) O'qish xulosasi (talaba kabineti, kalendar, streak) — learning time = video+audio+book+test
create or replace function public.my_learning_summary() returns jsonb
language plpgsql stable security definer set search_path = public as $$
declare uid uuid := auth.uid(); today date := (now() at time zone 'Asia/Tashkent')::date; r jsonb;
begin
  if uid is null then return null; end if;
  select jsonb_build_object(
    'today', (select coalesce(jsonb_object_agg(kind, s), '{}') from (select kind, sum(seconds)::int s from public.usage_daily where user_id = uid and day = today and kind <> 'app' group by kind) a),
    'week',  (select coalesce(jsonb_object_agg(kind, s), '{}') from (select kind, sum(seconds)::int s from public.usage_daily where user_id = uid and day > today - 7 and kind <> 'app' group by kind) a),
    'all',   (select coalesce(jsonb_object_agg(kind, s), '{}') from (select kind, sum(seconds)::int s from public.usage_daily where user_id = uid and kind <> 'app' group by kind) a),
    'days',  (select coalesce(jsonb_agg(jsonb_build_object('d', day, 's', s) order by day), '[]') from (select day, sum(seconds)::int s from public.usage_daily where user_id = uid and kind <> 'app' and day > today - 140 group by day) a),
    'streak', (select coalesce(streak, 0) from public.user_stats where user_id = uid),
    'best', (select coalesce(best_streak, 0) from public.user_stats where user_id = uid),
    'goal', (select coalesce(daily_goal_min, 20) from public.user_stats where user_id = uid),
    'tests', (select jsonb_build_object('n', count(*), 'correct', coalesce(sum(correct), 0), 'total', coalesce(sum(total), 0), 'best', coalesce(max(percent), 0)) from public.test_attempts where user_id = uid)
  ) into r;
  return r;
end $$;
grant execute on function public.my_learning_summary() to authenticated;

-- Tur bo'yicha tarix (video/audio/book/presentation): davomiylik, oxirgi joy, foiz, ko'rishlar soni
create or replace function public.item_history(p_kinds text[]) returns table (
  item_id uuid, kind text, title jsonb, folder_id uuid, duration real, last_pos real, percent int, plays int, last_at timestamptz, seconds int, size_bytes bigint, storage_path text, youtube_id text, meta jsonb)
language sql stable security invoker as $$
  select i.id, i.kind, i.title, i.folder_id, coalesce(nullif(vp.duration, 0), (i.meta->>'duration')::real, 0)::real, coalesce(vp.last_pos, 0)::real,
    case when vp.completed then 100 when coalesce(nullif(vp.duration, 0), (i.meta->>'duration')::real, 0) > 0 then least(100, round(100 * vp.max_pos / coalesce(nullif(vp.duration, 0), (i.meta->>'duration')::real))::int) else 0 end,
    coalesce(v.plays, 0), greatest(vp.updated_at, v.last_at), coalesce(u.s, 0)::int, i.size_bytes, i.storage_path, i.youtube_id, i.meta
  from public.items i
  left join public.video_progress vp on vp.item_id = i.id and vp.user_id = auth.uid()
  left join public.item_views v on v.item_id = i.id and v.user_id = auth.uid()
  left join (select item_id, sum(seconds) s from public.usage_daily where user_id = auth.uid() group by item_id) u on u.item_id = i.id
  where i.kind = any(p_kinds) and i.deleted_at is null and (vp.item_id is not null or v.item_id is not null or u.s > 0)
  order by greatest(vp.updated_at, v.last_at) desc nulls last limit 200;
$$;
grant execute on function public.item_history(text[]) to authenticated;

-- ---------- 9) O'qituvchi / material statistikasi (faqat egasi va admin)
create or replace function public.material_stats(p_item uuid) returns jsonb
language plpgsql stable security definer set search_path = public as $$
declare own uuid;
begin
  select created_by into own from public.items where id = p_item;
  if not found then raise exception 'topilmadi'; end if;
  if not public.is_admin() and own is distinct from auth.uid() then raise exception 'ruxsat yo''q'; end if;
  return jsonb_build_object(
    'viewers', (select count(distinct user_id) from public.item_views where item_id = p_item),
    'plays', (select coalesce(sum(plays), 0) from public.item_views where item_id = p_item),
    'seconds', (select coalesce(sum(seconds), 0) from public.usage_daily where item_id = p_item),
    'completed', (select count(*) from public.video_progress where item_id = p_item and completed),
    'attempts', (select count(*) from public.test_attempts where item_id = p_item),
    'avg_percent', (select coalesce(round(avg(percent), 1), 0) from public.test_attempts where item_id = p_item));
end $$;
grant execute on function public.material_stats(uuid) to authenticated;

create or replace function public.teacher_overview() returns jsonb
language plpgsql stable security definer set search_path = public as $$
declare uid uuid := auth.uid();
begin
  if not public.is_staff() then raise exception 'ruxsat yo''q'; end if;
  return jsonb_build_object(
    'courses', (select count(*) from public.courses where author_id = uid),
    'materials', (select count(*) from public.items where created_by = uid and deleted_at is null),
    'groups', (select count(*) from public.groups where owner_id = uid and not archived),
    'students', (select count(distinct gm.user_id) from public.group_members gm join public.groups g on g.id = gm.group_id where g.owner_id = uid and gm.status = 'approved'),
    'pending', (select count(*) from public.group_members gm join public.groups g on g.id = gm.group_id where g.owner_id = uid and gm.status = 'pending'),
    'by_kind', (select coalesce(jsonb_object_agg(kind, n), '{}') from (select kind, count(*) n from public.items where created_by = uid and deleted_at is null group by kind) a));
end $$;
grant execute on function public.teacher_overview() to authenticated;

-- ---------- 10) Reyting kartalari uchun qo'shimcha: rol, guruhlar, streak (faqat reytingga kirgan foydalanuvchilar uchun ma'lumot)
create or replace function public.leaderboard_meta() returns table (user_id uuid, role text, groups text[], streak int)
language plpgsql stable security definer set search_path = public as $$
begin
  if auth.uid() is null then raise exception 'ruxsat yo''q'; end if;
  return query
    select p.id, p.role::text,
      coalesce((select array_agg(g.name order by g.name) from public.group_members gm join public.groups g on g.id = gm.group_id where gm.user_id = p.id and gm.status = 'approved' and not g.archived), '{}'),
      coalesce(us.streak, 0)
    from public.profiles p left join public.user_stats us on us.user_id = p.id
    where p.role <> 'admin' and exists (select 1 from public.usage_daily u where u.user_id = p.id limit 1);
end $$;
grant execute on function public.leaderboard_meta() to authenticated;

-- ---------- 11) Streak o'qish paytida avtomatik yangilanadi (ilovani qayta ochishga bog'liq emas)
create or replace function public.usage_streak_trg() returns trigger
language plpgsql security definer set search_path = public as $$
declare ld date; d date := (now() at time zone 'Asia/Tashkent')::date;
begin
  if new.kind = 'app' or new.user_id is distinct from auth.uid() then return new; end if;
  select last_day into ld from public.user_stats where user_id = new.user_id;
  if ld is distinct from d then perform public.touch_streak(); end if;
  return new;
end $$;
drop trigger if exists usage_streak on public.usage_daily;
create trigger usage_streak after insert or update on public.usage_daily for each row execute function public.usage_streak_trg();
