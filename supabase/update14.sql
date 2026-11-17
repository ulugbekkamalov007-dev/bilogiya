-- update14: e'lon/reklamani kimlar va qachon ko'rganini yozib borish (admin ko'radi). Qayta ishga tushirsa ham xavfsiz.
create table if not exists public.announcement_views (
  announcement_id uuid not null references public.announcements(id) on delete cascade,
  user_id         uuid not null references public.profiles(id) on delete cascade,
  first_seen      timestamptz not null default now(),
  last_seen       timestamptz not null default now(),
  views           int not null default 1,
  primary key (announcement_id, user_id)
);
alter table public.announcement_views enable row level security;
drop policy if exists av_adm on public.announcement_views;
create policy av_adm on public.announcement_views for select using (public.is_admin());

-- Foydalanuvchi e'lonni ochganda chaqiriladi (o'zi uchun yozadi)
create or replace function public.ann_seen(p_ann uuid) returns void
language plpgsql security definer set search_path = public as $$
begin
  if auth.uid() is null or public.is_admin() then return; end if;
  if not exists (select 1 from public.announcements where id = p_ann) then return; end if;
  insert into public.announcement_views(announcement_id, user_id) values (p_ann, auth.uid())
  on conflict (announcement_id, user_id) do update set last_seen = now(), views = public.announcement_views.views + 1;
end $$;
grant execute on function public.ann_seen(uuid) to authenticated;

-- Admin: kimlar ko'rgan (vaqti bilan)
create or replace function public.ann_viewers(p_ann uuid)
returns table (user_id uuid, full_name text, email text, role text, first_seen timestamptz, last_seen timestamptz, views int)
language plpgsql stable security definer set search_path = public as $$
begin
  if not public.is_admin() then raise exception 'ruxsat yo''q'; end if;
  return query select v.user_id, p.full_name, p.email, p.role::text, v.first_seen, v.last_seen, v.views
    from public.announcement_views v join public.profiles p on p.id = v.user_id
    where v.announcement_id = p_ann order by v.last_seen desc;
end $$;
grant execute on function public.ann_viewers(uuid) to authenticated;

-- Admin: har bir e'lonni necha kishi ko'rgani
create or replace function public.ann_view_counts() returns table (announcement_id uuid, n bigint)
language plpgsql stable security definer set search_path = public as $$
begin
  if not public.is_admin() then raise exception 'ruxsat yo''q'; end if;
  return query select v.announcement_id, count(*) from public.announcement_views v group by v.announcement_id;
end $$;
grant execute on function public.ann_view_counts() to authenticated;

select 'update14 tayyor' as natija;
