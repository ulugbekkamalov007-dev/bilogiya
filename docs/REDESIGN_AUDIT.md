# BioAcademy 2.0 — FAZA 0: AUDIT (2026-11-13)

Bu hujjat mavjud loyihani kodga tegmasdan tahlil qiladi. Zaxira nusxa: `biologiya_ilova_backup_2026-11-13.zip`.

## 1. Texnik holat
| Qatlam | Hozirgi holat |
|---|---|
| Frontend | Vanilla JS (ES-modullar), build bosqichi **yo'q**, TypeScript **yo'q**. ~6100 qator (js 4100, css 409, sql 1500). Hash-router (`route(pattern, handler, {auth, admin})`), `addDict` orqali uz/ru/en i18n. |
| Hosting | Cloudflare Workers static assets (`wrangler.jsonc`), `_headers` ichida CSP. PWA: `manifest.webmanifest`, `sw.js` (kesh `bio-v8`). |
| Backend | Supabase (Postgres + Auth + Storage + Realtime). Alohida server kodi yo'q: barcha mantiq RLS siyosatlari va `security definer` RPC funksiyalarida. |
| Auth | Email + parol, email OTP (signup/recovery), PIN/barmoq izi bilan ekran qulfi (`lock.js`), bloklash. |
| Rollar | Faqat `user` va `admin` (`profiles.role` check). O'qituvchi roli **yo'q**. |
| Ikonkalar | O'z inline SVG to'plami (`IC` in `core.js`), Lucide uslubiga yaqin, lekin Lucide emas. |
| Shriftlar | `system-ui` (Inter/Manrope yuklanmagan). Oflayn rejim va CSP tufayli shrift fayllarini o'zimizdan berish kerak. |
| Testlash | Qo'lda yozilgan Playwright smoke testlari (`/tmp/smoke`, repoda emas). Repoda avtomatik test yo'q. |

## 2. Mavjud sahifalar (marshrutlar)
`/` (landing), `/login`, `/register`, `/forgot`, `/verify`, `/newpass`, `/home`, `/library`, `/library/:fid`, `/audios/:fid`, `/item/:id`, `/test/:id`, `/groups`, `/group/:id`, `/group/:id/task/:aid`, `/taskdoc/:aid`, `/rating`, `/rating/u/:uid`, `/reports`, `/reports/user/:uid`, `/inbox`, `/inbox/:uid`, `/news`, `/offline`, `/offline/:id`, `/settings`, `/settings/:s`, `/guide`, `/admin` (?tab=users|requests|video|app|stats|news|billing|storage).

## 3. Ma'lumotlar bazasi
Jadvallar: profiles, folders, items, questions, test_attempts, video_progress, usage_daily, usage_clock, groups, group_members, messages, assignments, submissions, assignment_audios, direct_messages, announcements, access_requests, entitlements, subscriptions, payment_requests, message_reports, app_settings.
Funksiyalar (RPC): add_usage, leaderboard, rating_user_items/tests, report_*, admin_*, assignment_overview, grant/revoke_subscription, request_join, group_roster va boshqalar.
Storage: `content` (kutubxona), `chat` (guruh/vazifa fayllari), avatar bucketlari. Migratsiyalar: `schema.sql` + `update.sql … update6.sql` (qo'lda, SQL Editor orqali).

## 4. Qaysi funksiyalar ishlaydi
Kutubxona (papka → material: video, audio, PDF, Word, PPTX, kitob, test), ichki o'quvchi (PDF/Word/PPTX), video/audio pleyer (fonda ijro, davom ettirish, progress), vaqtni hisoblash, testlar (import, taymer, urinishlar), guruhlar (chat, javob, vazifa, audio joylar, kitob, test, natijalar), reyting + foydalanuvchi sahifasi, hisobotlar/grafiklar, pullik kirish (obuna, to'lov so'rovi), xabarlar/e'lonlar, oflayn saqlash, ekran qulfi, 3 til, qorong'i rejim, fon tanlash, admin paneli.

Ishlashi telefon/kompyuterda **tekshirilmagan** joylar: PPTX haqiqiy fayllar bilan, audio ekran qulflanganda, vazifa kitobi/audio yuklash (faqat stub muhitda sinalgan).

## 5. Prompt va mavjud tizim o'rtasidagi tafovut (muhim)
Promptdagi quyidagi modullar **hozir mavjud emas** va yangi backend (jadvallar, RPC, RLS) talab qiladi:
- Kurslar/darslar/bo'limlar/sertifikat (hozir papka+material strukturasi bor, "kurs" tushunchasi yo'q).
- Flesh-kartalar + SM-2.
- Laboratoriya (hujayra/DNK/Punnett/anatomiya/fotosintez/ekotizim) — mavjud modellar yo'q.
- AI yordamchi (serverdagi kalit uchun Edge Function kerak).
- XP, seriya (streak), yutuqlar, kunlik savol, kunlik maqsad.
- O'qituvchi roli, sinflar, baholar jadvali, o'qituvchilar arizalari.
- Forum, izohlar, kurs reytinglari, audit jurnali, AI xarajatlari.
- Global qidiruv, transkript, subtitr, shaxsiy eslatmalar, video sifati tanlash.
Promptdagi "Mavjud modellarni saqla" va "3D/laboratoriya" bandlari mavjud kodga mos kelmaydi (saqlanadigan narsa yo'q). "TypeScript va build xatolari yo'q" bandi ham amal qilmaydi (build/TS yo'q).

## 6. Dizayn jihatidan zaif joylar
1. Rang tizimi promptdagidan farq qiladi (`#16a34a` vs `#087C50`), tokenlar to'liq emas (spacing, radius, soya shkalasi yo'q).
2. Shriftlar tizim shrifti; sarlavha/matn iyerarxiyasi bir xil.
3. Mobil pastki menyu: Bosh, Kutubxona, Guruhlar, Reyting, Profil (prompt: Kurslar, Kartalar, Testlar, Profil).
4. Desktop: chap menyu bor, lekin yig'ilmaydi; yuqori headerda qidiruv, XP, profil menyusi yo'q.
5. Modallar mobilda ham markaziy oyna (bottom sheet emas, faqat yozish sheeti bor).
6. `app.css` bitta fayl, 400+ qator, ko'p "qo'shimcha blok" (tarixiy qatlamlar, takrorlanuvchi qoidalar).
7. Skeleton yuklash holati yo'q (spinner bor), bo'sh/xato holatlari yagona komponent emas.
8. Ikonkalar Lucide emas; gradientlar ko'p (prompt "ortiqcha gradient yo'q" deydi).
9. 320 px da gorizontal scroll: bir necha joyda tuzatilgan, lekin to'liq sinalmagan.
10. Accessibility: fokus halqalari, ARIA, kontrast WCAG AA bo'yicha tekshirilmagan.
11. Dars sahifasi 3 ustunli maket (mundarija/kontent/yon panel) yo'q, material alohida sahifada ochiladi.

## 7. Backendga tegmasdan bajariladigan ishlar (xavfsiz, CSS/JS)
- Dizayn tokenlari (rang, radius, spacing, soya), dark mode palitrasi, Inter/Manrope (o'zimizdan berilgan), tipografiya.
- Sidebar (yig'iladigan) va header (qidiruv shu foydalanuvchiga ko'rinadigan materiallardan, til, tema, profil menyusi).
- Mobil bottom-sheet modallar, tugma/karta/input/tab/dialog komponentlari, skeleton/empty/error holatlari.
- Bosh sahifa qayta tartiblash (mavjud ma'lumotlar: davom ettirish, vaqt statistikasi, reyting, e'lonlar, kutayotgan vazifalar).
- Kutubxona: filtr, saralash, "oxirgi ochilgan" (`video_progress` dan), karta dizayni.
- Test sahifasi: savol xaritasi yon paneli / bottom sheet; natijalar tarixi (`test_attempts` mavjud).
- Guruhlar, reyting, admin, hisobot sahifalarining vizual qayta ishlanishi, desktop jadvallar, pagination (mavjud RPC lar ustida).
- Lucide ikonkalariga o'tish (inline SVG sifatida, kutubxonasiz).

## 8. Backend o'zgarishi kerak bo'lgan ishlar
| Ish | Zarur o'zgarish | Xavf |
|---|---|---|
| Flesh-kartalar + SM-2 | `flashcards`, `flashcard_progress` jadvallari, RLS | past (yangi jadval) |
| XP/seriya/yutuqlar/kunlik maqsad | `xp_events`, `streaks`, `achievements`, `user_achievements`, `profiles.daily_goal_min` | past |
| Kurslar/darslar | `courses`, `lessons` (yoki papkani kurs deb talqin qilish) | **o'rta**: mavjud `folders/items` bilan bog'lash |
| O'qituvchi roli | `profiles.role` check kengaytirish, RLS siyosatlari, `teacher_applications` | **yuqori**: barcha `is_admin()` tekshiruvlariga tegadi |
| AI yordamchi | Supabase Edge Function + kalit sirlari + limit jadvali | o'rta (xarajat, suiiste'mol) |
| Laboratoriya | faqat frontend (SVG/Canvas), DB shart emas | past |
| Forum, izohlar | `threads`, `comments`, moderatsiya | o'rta |
| Audit jurnali | `audit_log` + triggerlar | past |
| Transkript/subtitr/eslatmalar | `items.transcript`, `notes` jadvali, Storage `.vtt` | past |
Har bir migratsiya: alohida `updateN.sql`, qayta ishga tushirsa xavfsiz, orqaga qaytarish `drop` bloki bilan; mavjud foydalanuvchi ma'lumotlariga tegmaydi.

## 9. Xavf va regressiya nuqtalari
1. **RLS/`is_admin()`**: o'qituvchi roli qo'shilsa, mavjud siyosatlar buzilishi mumkin (eng xavfli).
2. **Service Worker keshi**: yangi CSS/JS eski keshda qolishi; har relizda `VER` oshirilishi shart.
3. **Vaqt hisobi / reyting**: `add_usage` va `usage_clock` mantig'iga tegilmasligi kerak.
4. **Test harakatlari**: javoblarni serverda tekshirish hozir qisman klientda; to'liq server-tekshiruv yangi RPC talab qiladi.
5. **Oflayn rejim**: kesh ro'yxati (`SHELL`) yangi fayllar bilan yangilanmasa oflayn ishlamaydi.
6. **CSP**: tashqi shrift/CDN qo'shish `_headers` ni buzadi → shriftlarni o'zimiz berishimiz kerak.
7. **Qulf ekrani, orqaga tugmasi, fonda audio** — nozik brauzer xatti-harakatlari; har fazadan keyin qayta tekshirish.
8. **Bitta katta `app.css`**: tokenlarga o'tishda ko'p joyda rang/radius qayta yoziladi; vizual regressiya ehtimoli yuqori.
9. **To'lov tizimi**: avtomatik tekshiruv yo'q; dizayn o'zgarishi paywall oqimini buzmasligi kerak.
10. Test muhiti yo'q: avtomatik regressiya uchun Playwright testlarini repoga ko'chirish kerak (FAZA 1 oldidan).
