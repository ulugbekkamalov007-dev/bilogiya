# 🧬 Platforma — biologiya o'quv platformasi

Vanilla JS PWA (build kerak emas) + Supabase (Postgres, Auth, Storage, Realtime).
Telefon, kompyuter va iPhone'da o'rnatiladigan ilova. uz / ru / en.

## Tezkor ishga tushirish
1. [supabase.com](https://supabase.com) da bepul loyiha oching.
2. **SQL Editor** da `supabase/schema.sql` ni to'liq ishga tushiring.
3. `js/config.js` ga `SUPABASE_URL` va `SUPABASE_ANON_KEY` (Project Settings → API) ni yozing.
4. Auth → Providers → Email: "Confirm email" yoqilgan bo'lsin. Auth → Email Templates da `supabase/email-templates/*.html` ni qo'ying (kod `{{ .Token }}`).
5. Email yuborish: `docs/DEPLOY.md` dagi variantlardan birini tanlang.
6. Ro'yxatdan o'ting, so'ng SQL Editor da o'zingizni admin qiling:
   `update public.profiles set role='admin' where email='sizning@email';`
7. Joylash: GitHub'ga push → Cloudflare Pages (yoki GitHub Pages). Batafsil: `docs/DEPLOY.md`.

Mahalliy sinash: `python -m http.server 8080` va http://localhost:8080 (service worker va WebAuthn uchun localhost yoki HTTPS kerak).

Arxitektura: `docs/ARXITEKTURA.md`.
