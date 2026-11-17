grant select on public.lessons to authenticated;
drop function if exists public.lesson_full(uuid), public.lesson_content(uuid), public.lesson_open(uuid), public.paid_ok();
-- complete_lesson va lesson_item_ok ni asl holiga qaytarish: update12.sql / update7.sql dagi bloklarni qayta ishga tushiring.
