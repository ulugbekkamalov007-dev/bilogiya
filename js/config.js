// =====================================================================
//  SOZLAMALAR — faqat shu faylni to'ldirasiz.
//  Supabase → Project Settings → API dan 2 ta qiymatni oling.
//  (anon key ochiq bo'lishi mumkin, xavfsizlikni RLS siyosatlari ta'minlaydi.
//   service_role kalitini HECH QACHON bu yerga yozmang!)
// =====================================================================
export const CONFIG = {
  SUPABASE_URL: 'https://YOUR-PROJECT.supabase.co',
  SUPABASE_ANON_KEY: 'YOUR-ANON-PUBLIC-KEY',

  APP_NAME: 'BioAcademy',

  // Supabase → Authentication → Email → "Email OTP Length" bilan bir xil bo'lishi kerak (tavsiya: 6)
  OTP_LENGTH: 6,
  TZ: 'Asia/Tashkent',

  // Admin e'lon/material yozganda boshqa tillarga avtomatik tarjima (MyMemory, bepul, kuniga ~5000 belgi).
  AI_TRANSLATE: true,
  // Tarjima limiti oshganda ko'tarish uchun (ixtiyoriy) — o'z emailingiz:
  TRANSLATE_EMAIL: '',

  // Bepul Supabase: 1 GB fayl, 50 MB/fayl. Katta videolarni YouTube (unlisted) yoki
  // tashqi URL (Cloudflare R2 / Bunny) orqali ulang. Pastdagi son — admin yuklaydigan fayl limiti (MB).
  MAX_UPLOAD_MB: 50,
};
