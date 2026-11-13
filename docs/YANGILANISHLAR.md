# Yangilanishlarni yuritish qoidasi

Tizimga har bir yangi imkoniyat qo'shilganda yoki o'zgartirilganda **bir xil ish bilan** quyidagilar ham yangilanadi:

1. `js/guide.js` — «Foydalanish yo'riqnomasi» (3 til: uz, ru, en) va kerak bo'lsa «Ilova haqida» ro'yxati (`A`).
2. `node scripts/bump-version.mjs` — versiyani oshiradi (`js/version.js`, `version.json`, `sw.js` bir xil bo'ladi). Shundan so'ng foydalanuvchilarda «Yangilanish mavjud» xabari chiqadi.
3. Yangi SQL bo'lsa — `supabase/updateN.sql` (qayta ishga tushsa xavfsiz) va `updateN_rollback.sql`.
4. Vaqtni hisoblash qoidalari o'zgarsa — `docs/TIME_TRACKING_RULES.md`.
