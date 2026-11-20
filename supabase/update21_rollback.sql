drop policy if exists f_staff_all on public.folders; drop policy if exists i_staff_all on public.items; drop policy if exists q_staff_all on public.questions;
drop trigger if exists folder_price_guard on public.folders; drop function if exists public.folder_price_guard();
drop policy if exists st_staff_all on storage.objects;
