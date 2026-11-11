# Arxitektura

- **Frontend:** `index.html` + `js/*.js` (ES modullar), hash-router (`#/library`), `css/app.css`. Build yo'q.
- **Backend:** Supabase. Barcha ruxsatlar RLS siyosatlari va SECURITY DEFINER funksiyalar orqali (`supabase/schema.sql`).
- **Rollar:** `profiles.role` = user | admin.
- **Sozlamalar:** `app_settings` (video qoidalari, ilova sozlamalari) — admin panelidan o'zgaradi, kodda emas.
- **Kontent:** `folders` (ichma-ich, narx, ko'rinish) → `items` (video, pdf, taqdimot, kitob, test, havola). Pullik to'plamlar: `folders.price`, `entitlements`, `access_requests`.
- **Video:** HTML5/HLS yoki YouTube IFrame; oldinga o'tish `max_pos` bilan bloklanadi, orqaga ruxsat. Eslatma: bu brauzer darajasidagi cheklov, to'liq DRM emas.
- **Testlar:** `testparse.js` Word/PDF/TXT dan savollarni ajratadi; variantlar test paytida aralashtiriladi.
- **Hisobotlar:** `usage_daily` (kunlik vaqt), `video_progress`, `test_attempts`; RPC funksiyalar grafiklar uchun.
- **Guruhlar:** `groups`, `group_members`, `assignments`, `messages` (vazifa muhokamasi alohida `assignment_id`), `submissions`. Talabalar a'zolar ro'yxatini ko'rmaydi; guruhda ism ko'rsatish rejimi sozlanadi.
- **Xabarlar/e'lonlar:** `direct_messages` (foydalanuvchi↔admin), `announcements` (hamma / guruh / shaxs).
- **Xavfsizlik (tezkor kirish):** PIN (PBKDF2) va WebAuthn qurilma darajasida; chiqishda hammasi tozalanadi.
- **Hajmni tejash:** chat rasmlari WebP, ovoz Opus, limitlar; admin "Xotira" bo'limidan eski mediani tozalaydi.
