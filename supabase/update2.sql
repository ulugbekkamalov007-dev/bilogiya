-- =====================================================================
--  update2.sql — vaqt hisobini soxtalashtirishdan himoyalash (qayta ishga tushirish xavfsiz)
--  Supabase → SQL Editor → New query → shu faylni qo'ying → Run.
--  Ilgari update.sql ishga tushirilgan bo'lishi kerak.
-- =====================================================================

-- Har foydalanuvchi + kategoriya uchun "vaqt hamyoni": bir soniyada ko'pi bilan 1 soniya vaqt yoziladi.
-- (brauzer konsolidan add_usage ni qayta-qayta chaqirib vaqt "yasash" mumkin bo'lmaydi)
create table if not exists public.usage_clock (
  user_id uuid not null references public.profiles(id) on delete cascade,
  kind    text not null,
  bank    double precision not null default 60,
  at      timestamptz not null default now(),
  primary key (user_id, kind)
);
alter table public.usage_clock enable row level security;   -- siyosat yo'q: faqat quyidagi funksiya yozadi

create or replace function public.add_usage(p_kind text, p_item uuid, p_secs int) returns void
language plpgsql security definer set search_path = public as $$
declare d date := (now() at time zone 'Asia/Tashkent')::date;
        s int := greatest(0, least(coalesce(p_secs, 0), 60));
        c record; bank double precision; el double precision;
begin
  if auth.uid() is null or s = 0 then return; end if;
  if p_kind not in ('app','video','audio','book','test') then return; end if;

  select * into c from public.usage_clock where user_id = auth.uid() and kind = p_kind for update;
  if not found then
    insert into public.usage_clock (user_id, kind, bank, at) values (auth.uid(), p_kind, 60, now()) returning * into c;
  end if;
  el := greatest(0, extract(epoch from (now() - c.at)));
  bank := least(120, c.bank + el);          -- ko'pi bilan 2 daqiqalik zaxira
  s := least(s, floor(bank)::int);
  update public.usage_clock set bank = bank - s, at = now() where user_id = auth.uid() and kind = p_kind;
  if s <= 0 then return; end if;

  insert into public.usage_daily (user_id, day, kind, item_id, seconds)
  values (auth.uid(), d, p_kind, coalesce(p_item, '00000000-0000-0000-0000-000000000000'), s)
  on conflict (user_id, day, kind, item_id)
  do update set seconds = public.usage_daily.seconds + excluded.seconds;
  update public.profiles set last_seen = now() where id = auth.uid();
end $$;

-- Materiallar bo'yicha ro'yxat: kategoriya bosilganda hamma materiallar ko'rinishi uchun limit kengaytirildi
create or replace function public.report_usage_items(p_user uuid, p_from date, p_to date)
returns table (item_id uuid, kind text, title jsonb, seconds bigint)
language plpgsql stable security definer set search_path = public as $$
begin
  if not public.can_view_reports(p_user) then raise exception 'ruxsat yo''q'; end if;
  return query
    select u.item_id, u.kind, i.title, sum(u.seconds)::bigint
    from public.usage_daily u left join public.items i on i.id = u.item_id
    where u.user_id = p_user and u.day between p_from and p_to and u.kind <> 'app'
    group by u.item_id, u.kind, i.title order by sum(u.seconds) desc limit 300;
end $$;

select 'update2 tayyor' as natija;
