-- update21: O'qituvchi (teacher) kontent bo'yicha admin singari: HAMMA papka, material, savol va fayllarni ko'radi/yuklaydi/tahrirlaydi/o'chiradi.
-- Narx (folders.price), to'lovlar, foydalanuvchilar va rollar faqat admin qo'lida qoladi.
-- Qaytarish: update21_rollback.sql

drop policy if exists f_staff_all on public.folders;
create policy f_staff_all on public.folders for all to authenticated using (public.is_staff()) with check (public.is_staff());
drop policy if exists i_staff_all on public.items;
create policy i_staff_all on public.items for all to authenticated using (public.is_staff()) with check (public.is_staff());
drop policy if exists q_staff_all on public.questions;
create policy q_staff_all on public.questions for all to authenticated using (public.is_staff()) with check (public.is_staff());

-- Papka narxini faqat admin o'zgartira oladi
create or replace function public.folder_price_guard() returns trigger language plpgsql security definer set search_path = public as $$
begin
  if not public.is_admin() then
    if tg_op = 'INSERT' then new.price := 0;
    elsif new.price is distinct from old.price then new.price := old.price; end if;
  end if;
  return new;
end $$;
drop trigger if exists folder_price_guard on public.folders;
create trigger folder_price_guard before insert or update on public.folders for each row execute function public.folder_price_guard();

-- Storage (eski Supabase 'content' va 'media' paketlari): staff hammasiga yoza oladi
drop policy if exists st_staff_all on storage.objects;
create policy st_staff_all on storage.objects for all to authenticated
  using (bucket_id in ('content', 'media') and public.is_staff()) with check (bucket_id in ('content', 'media') and public.is_staff());
