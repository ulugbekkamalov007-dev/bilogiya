-- update18 ni qaytarish: eski ochilish qoidasi (update15) va ko'rinish siyosatlari. O'chirilgan seed kursi qaytmaydi.
drop function if exists public.grant_course(text, uuid, int);
drop function if exists public.revoke_course(uuid, uuid);
drop function if exists public.list_grants(uuid);
-- keyin update15.sql ni qayta ishga tushiring
