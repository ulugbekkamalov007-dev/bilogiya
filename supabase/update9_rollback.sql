-- update9 ni qaytarish (ma'lumotlar jadvallari saqlanadi; faqat yangi mantiq olinadi)
drop policy if exists f_own_ins on public.folders; drop policy if exists f_own_upd on public.folders; drop policy if exists f_own_del on public.folders;
drop policy if exists i_own_ins on public.items; drop policy if exists i_own_upd on public.items; drop policy if exists i_own_del on public.items;
drop policy if exists q_own on public.questions; drop policy if exists ta_owner_sel on public.test_attempts;
drop policy if exists st_ct_write on storage.objects;
create policy st_ct_write on storage.objects for all to authenticated using (bucket_id = 'content' and public.is_admin()) with check (bucket_id = 'content' and public.is_admin());
drop policy if exists st_md_write on storage.objects;
create policy st_md_write on storage.objects for all to authenticated using (bucket_id = 'media' and public.is_admin()) with check (bucket_id = 'media' and public.is_admin());
drop policy if exists i_sel on public.items;
create policy i_sel on public.items for select using (public.is_admin() or (visible and public.folder_visible(folder_id)) or public.task_item_ok(id) or public.lesson_item_ok(id));
create or replace function public.folder_visible(fid uuid) returns boolean language plpgsql stable security definer set search_path = public as $$
declare cur uuid := fid; f record; n int := 0;
begin if fid is null then return true; end if; if public.is_admin() then return true; end if;
  while cur is not null and n < 20 loop select visible, parent_id into f from public.folders where id = cur; if not found or not f.visible then return false; end if; cur := f.parent_id; n := n + 1; end loop; return true; end $$;
create or replace function public.folder_accessible(fid uuid) returns boolean language plpgsql stable security definer set search_path = public as $$
declare cur uuid := fid; f record; n int := 0;
begin if fid is null then return true; end if; if public.is_admin() then return true; end if;
  while cur is not null and n < 20 loop select visible, price, parent_id into f from public.folders where id = cur; if not found or not f.visible then return false; end if;
    if f.price > 0 and not exists (select 1 from public.entitlements e where e.user_id = auth.uid() and e.folder_id = cur) then return false; end if; cur := f.parent_id; n := n + 1; end loop; return true; end $$;
create or replace function public.item_accessible(iid uuid) returns boolean language plpgsql stable security definer set search_path = public as $$
declare it record;
begin if public.is_admin() then return true; end if; if public.task_item_ok(iid) or public.lesson_item_ok(iid) then return true; end if;
  select visible, folder_id into it from public.items where id = iid; if not found or not it.visible then return false; end if; return public.folder_accessible(it.folder_id); end $$;
drop function if exists public.assign_material_groups(text, uuid, uuid[]); drop function if exists public.item_open(uuid); drop function if exists public.my_learning_summary();
drop function if exists public.item_history(text[]); drop function if exists public.material_stats(uuid); drop function if exists public.teacher_overview();
-- material_groups, item_views jadvallari, deleted_at/cover_path/image_path/difficulty/points ustunlari ma'lumot yo'qolmasligi uchun qoldiriladi.
drop function if exists public.leaderboard_meta();
drop trigger if exists usage_streak on public.usage_daily; drop function if exists public.usage_streak_trg();
