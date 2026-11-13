-- update7.sql ni qaytarish (ma'lumotlar o'chadi: kurslar, XP, yutuqlar, arizalar). Foydalanuvchilar/materiallar saqlanadi.
update public.profiles set role = 'user' where role = 'teacher';
drop function if exists public.course_stats(uuid), public.verify_certificate(text), public.complete_lesson(uuid), public.enroll_course(uuid),
  public.check_achievements(), public.set_daily_goal(int), public.my_stats(), public.touch_streak(), public._xp(uuid,text,text,int,int), public.level_of(int),
  public.decide_teacher_application(uuid,boolean), public.admin_set_role(uuid,text), public._audit(text,text,text,jsonb) cascade;
drop table if exists public.user_achievements, public.achievements, public.xp_events, public.user_stats, public.certificates, public.course_reviews,
  public.lesson_progress, public.enrollments, public.lessons, public.course_sections, public.courses, public.teacher_applications, public.audit_log cascade;
-- item_accessible / i_sel ni update6.sql dagi holatga qaytarish uchun update6.sql ni qayta ishga tushiring.
drop function if exists public.lesson_item_ok(uuid) cascade, public.course_open(uuid) cascade, public.course_owner(uuid) cascade, public.is_staff() cascade, public.is_teacher() cascade;
alter table public.profiles drop constraint if exists profiles_role_check;
alter table public.profiles add constraint profiles_role_check check (role in ('user','admin'));
