-- update4.sql — guruh ko'rinishi, xabarga javob, vazifaga test, vazifa natijalari. Qayta ishga tushirsa ham xavfsiz.
alter table public.groups add column if not exists visibility text not null default 'all';
do $$ begin
  alter table public.groups drop constraint if exists groups_visibility_check;
  alter table public.groups add constraint groups_visibility_check check (visibility in ('all','free','private'));
end $$;
alter table public.messages add column if not exists reply_to uuid references public.messages(id) on delete set null;
alter table public.assignments add column if not exists test_item_id uuid references public.items(id) on delete set null;

-- Qidiruvda guruhlar: 'all' — hamma ko'radi; 'free' — hech bir guruhda a'zo bo'lmaganlar; 'private' — faqat admin qo'shadi (qidiruvda yo'q)
create or replace view public.groups_public as
  select id, name, description from public.groups g
  where not archived and (
    visibility = 'all'
    or (visibility = 'free' and not exists (select 1 from public.group_members m where m.user_id = auth.uid() and m.status = 'approved'))
  );
grant select on public.groups_public to authenticated;

-- Vazifa bo'yicha har bir a'zoning holati (faqat admin): nechta matn / audio / fayl, baho, test natijasi
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
      (select count(*) from public.submissions s where s.assignment_id = p_assignment and s.user_id = gm.user_id and s.voice_path is not null)::int,
      (select count(*) from public.submissions s where s.assignment_id = p_assignment and s.user_id = gm.user_id and s.file_path is not null)::int,
      (select max(s.grade) from public.submissions s where s.assignment_id = p_assignment and s.user_id = gm.user_id),
      (select max(s.created_at) from public.submissions s where s.assignment_id = p_assignment and s.user_id = gm.user_id),
      case when v_test is null then null else (select max(t.percent) from public.test_attempts t where t.user_id = gm.user_id and t.item_id = v_test) end,
      case when v_test is null then 0 else (select count(*) from public.test_attempts t where t.user_id = gm.user_id and t.item_id = v_test)::int end
    from public.group_members gm join public.profiles p on p.id = gm.user_id
    where gm.group_id = v_group and gm.status = 'approved';
end $$;
grant execute on function public.assignment_overview(uuid) to authenticated;
