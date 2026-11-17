-- update16: dars matni/videosi alohida jadvalda (lesson_bodies) — "lessons" jadvali endi oddiy o'qiladi (ruxsat xatosi yo'q),
-- matn esa faqat ochiq darslar uchun RLS bilan himoyalanadi. Qayta ishga tushirsa ham xavfsiz.
create table if not exists public.lesson_bodies (
  lesson_id  uuid primary key references public.lessons(id) on delete cascade,
  body       text not null default '',
  youtube_id text
);
alter table public.lesson_bodies enable row level security;
grant select, insert, update, delete on public.lesson_bodies to authenticated;

-- eski ma'lumotni ko'chirish (lessons.body hali bor bo'lsa)
insert into public.lesson_bodies(lesson_id, body, youtube_id)
select id, body, youtube_id from public.lessons
on conflict (lesson_id) do update set body = excluded.body, youtube_id = excluded.youtube_id
where public.lesson_bodies.body = '' and public.lesson_bodies.youtube_id is null;

drop policy if exists lb_sel on public.lesson_bodies;
create policy lb_sel on public.lesson_bodies for select using (public.lesson_open(lesson_id));
drop policy if exists lb_all on public.lesson_bodies;
create policy lb_all on public.lesson_bodies for all
  using (exists (select 1 from public.lessons l where l.id = lesson_id and public.course_owner(l.course_id)))
  with check (exists (select 1 from public.lessons l where l.id = lesson_id and public.course_owner(l.course_id)));

-- lessons dagi matn va video ustunlarini bo'shatish va jadvalni qaytadan oddiy o'qiladigan qilish
update public.lessons set body = '', youtube_id = null where body <> '' or youtube_id is not null;
grant select on public.lessons to authenticated;

create or replace function public.lesson_content(p_lesson uuid) returns jsonb
language plpgsql stable security definer set search_path = public as $$
declare b record;
begin
  if not exists (select 1 from public.lessons where id = p_lesson) then raise exception 'dars topilmadi'; end if;
  if not public.lesson_open(p_lesson) then raise exception 'PAID_REQUIRED'; end if;
  select * into b from public.lesson_bodies where lesson_id = p_lesson;
  return jsonb_build_object('body', coalesce(b.body, ''), 'youtube_id', b.youtube_id);
end $$;
grant execute on function public.lesson_content(uuid) to authenticated;

create or replace function public.lesson_full(p_lesson uuid) returns jsonb
language plpgsql stable security definer set search_path = public as $$
declare l record; b record;
begin
  select * into l from public.lessons where id = p_lesson; if not found then raise exception 'dars topilmadi'; end if;
  if not public.course_owner(l.course_id) then raise exception 'ruxsat yo''q'; end if;
  select * into b from public.lesson_bodies where lesson_id = p_lesson;
  return jsonb_build_object('body', coalesce(b.body, ''), 'youtube_id', b.youtube_id);
end $$;
grant execute on function public.lesson_full(uuid) to authenticated;

select 'update16 tayyor' as natija;
