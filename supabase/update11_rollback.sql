drop function if exists public.set_my_phone(text);
drop function if exists public.admin_user_card(uuid);
drop function if exists public.support_contact();
drop function if exists public.test_takers(uuid);
drop function if exists public.section_locked(uuid);
alter table public.courses drop column if exists unlock_pct;
-- complete_lesson ni update7.sql dagi asl holiga qaytarish uchun update7.sql dagi shu funksiya blokini qayta ishga tushiring.
delete from public.app_settings where key = 'ui';
