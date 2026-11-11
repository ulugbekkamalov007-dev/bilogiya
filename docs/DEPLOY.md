# Joylash (deploy)

## Hosting taqqoslash
| Xizmat | Tavsiya |
|---|---|
| **Cloudflare Pages** | Eng yaxshi: bepul, tez, tijoriy foydalanishga ruxsat. `_headers` qo'llab-quvvatlanadi. |
| GitHub Pages | Yaxshi, bepul. `_headers` ishlamaydi (sw.js keshi biroz kechikadi). |
| Render (static) | Kerak emas — server kodi yo'q. |
| Vercel Hobby | Faqat notijorat — pullik qilsangiz mos emas. |

**Cloudflare Pages:** GitHub repo ulang → Build command: bo'sh, Output directory: `/` → Deploy.

## Supabase sozlash
1. `schema.sql` ni ishga tushiring. 2. `config.js` ni to'ldiring. 3. Auth → URL Configuration: Site URL = sayt manzilingiz.

## Email kodlari (bittasini tanlang)
- **A) Brevo SMTP (oson):** Brevo'da bepul hisob (300 xat/kun), SMTP kalitini oling → Supabase Auth → SMTP Settings.
- **B) Gmail + Apps Script:** `scripts/gmail-apps-script.gs` ni web app qilib joylang. Keyin:
  `supabase functions deploy send-email-hook --no-verify-jwt`, sirlarni qo'ying
  (`APPS_SCRIPT_URL`, `APPS_SCRIPT_SECRET`, `SEND_EMAIL_HOOK_SECRET`), Auth → Hooks → Send Email → shu funksiya.
- Supabase'ning o'z SMTP'i faqat soatiga bir necha xat beradi — ishlab chiqarish uchun mos emas.
- Bepul SMS yo'q (ishonchli emas) — email OTP ishlatiladi.

## Video
- Hozirgi 20–30 video: YouTube (unlisted) havolasi yoki to'g'ridan-to'g'ri URL (Cloudflare R2 / Bunny) yoki Supabase Storage (≤50MB, bepul tarifda jami 1GB).
- Katta to'plam (pullik): R2/Bunny + HLS tavsiya etiladi.

## Cheklovlar (halol)
- Video "oldinga o'tmaslik" brauzerda amalga oshiriladi; texnik foydalanuvchi aylanib o'tishi mumkin.
- Bepul Supabase: 500MB DB, 1GB fayl, 7 kun faolsiz bo'lsa loyiha pauza bo'ladi (kirib turing yoki ping qo'ying).
- Kod haqiqiy Postgres'ga to'liq sinalmagan: `schema.sql` ni ishga tushirganda xato chiqsa, xabarini yuboring.
- iPhone'da o'rnatish: Safari → Ulashish → "Bosh ekranga qo'shish"; barmoq izi (Face/Touch ID) faqat o'rnatilgan ilovada va HTTPS'da.
