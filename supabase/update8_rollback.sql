-- update8.sql ni qaytarish (kartalar, forum, AI tarixi, audit triggerlari o'chadi)
drop trigger if exists aud_profiles on public.profiles; drop trigger if exists aud_items on public.items; drop trigger if exists aud_folders on public.folders;
drop trigger if exists aud_courses on public.courses; drop trigger if exists aud_courses_pub on public.courses; drop trigger if exists aud_settings on public.app_settings; drop trigger if exists aud_subs on public.subscriptions;
drop function if exists public.claim_test_xp(uuid);
drop function if exists public.audit_trg() cascade, public.admin_analytics(date,date), public.ai_take_quota(), public.adaptive_questions(uuid,int), public.resolve_mistake(uuid), public.my_mistakes(),
  public.card_stats(), public.due_cards(uuid,int,int), public.review_card(uuid,int), public.forum_guard() cascade, public.forum_fill() cascade, public.thread_ok(uuid) cascade, public.deck_mine(uuid) cascade, public.deck_ok(uuid) cascade;
drop table if exists public.ai_messages, public.ai_usage, public.mistake_resolved, public.forum_posts, public.forum_threads, public.card_reviews, public.card_state, public.flash_cards, public.flash_decks cascade;
