-- update19: "Kirish" (so'z boshi) bo'limi — mavzu hisoblanmaydi, hammaga ochiq, mavzu raqamini surmaydi. Qayta ishga tushirsa ham xavfsiz.
alter table public.course_sections drop constraint if exists course_sections_kind_check;
alter table public.course_sections add constraint course_sections_kind_check check (kind in ('intro','topic','review','final'));
select 'update19 tayyor' as natija;
