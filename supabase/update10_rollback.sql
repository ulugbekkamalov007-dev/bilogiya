-- update10 ni qaytarish: siyosatlar admin-only holatiga qaytariladi
drop policy if exists g_tch on public.groups;
drop policy if exists g_sel on public.groups; create policy g_sel on public.groups for select using (public.is_admin() or public.is_member(id));
drop policy if exists gm_sel on public.group_members; create policy gm_sel on public.group_members for select using (user_id = auth.uid() or public.is_admin());
drop policy if exists gm_leave on public.group_members; create policy gm_leave on public.group_members for delete using (user_id = auth.uid() or public.is_admin());
drop policy if exists gm_adm on public.group_members; create policy gm_adm on public.group_members for all using (public.is_admin()) with check (public.is_admin());
drop policy if exists as_sel on public.assignments; create policy as_sel on public.assignments for select using (public.is_admin() or public.is_member(group_id));
drop policy if exists as_all on public.assignments; create policy as_all on public.assignments for all using (public.is_admin()) with check (public.is_admin());
drop policy if exists m_sel on public.messages; create policy m_sel on public.messages for select using (public.is_admin() or public.is_member(group_id));
drop policy if exists m_del on public.messages; create policy m_del on public.messages for delete using (user_id = auth.uid() or public.is_admin());
drop policy if exists sb_sel on public.submissions; create policy sb_sel on public.submissions for select using (user_id = auth.uid() or public.is_admin());
drop policy if exists sb_adm on public.submissions; create policy sb_adm on public.submissions for update using (public.is_admin()) with check (public.is_admin());
drop policy if exists aa_sel on public.assignment_audios; create policy aa_sel on public.assignment_audios for select using (user_id = auth.uid() or public.is_admin());
drop function if exists public.g_manage(uuid) cascade;
