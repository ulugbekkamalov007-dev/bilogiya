-- Avval 'slides'/'cards' darslarini o'chiring, so'ng cheklovni qaytaring:
-- delete from public.lessons where kind in ('slides','cards');
alter table public.lessons drop constraint if exists lessons_kind_check;
alter table public.lessons add constraint lessons_kind_check check (kind in ('text','video','audio','document','test'));
-- complete_lesson ni asl holiga qaytarish: update11.sql dagi shu funksiya blokini qayta ishga tushiring.
