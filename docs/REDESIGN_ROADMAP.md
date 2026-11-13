# BioAcademy 2.0 — Yo'l xaritasi

Tamoyil: har faza oxirida ilova ishlaydigan holatda, `sw.js` versiyasi oshirilgan, smoke-testlar o'tgan. Bir faza tugamaguncha keyingisiga o'tilmaydi.

| Faza | Mazmun | Backend | Asosiy fayllar |
|---|---|---|---|
| 0 | Audit (shu hujjat) | yo'q | docs/ |
| 1 | Dizayn poydevori: tokenlar (rang, radius, spacing, soya), Inter/Manrope (self-host), dark mode, sidebar (yig'iladigan), header, mobil bottom-bar + bottom-sheet, komponentlar, skeleton/empty/error | yo'q | css/ (tokens.css, components.css), main.js, core.js, sw.js, _headers |
| 2 | O'quvchi: dashboard, kutubxona (filtr/saralash/oxirgi), profil, reyting, hisobot | yo'q | home.js, library.js, reports.js, settings.js |
| 3 | Kontent/media: dars sahifasi 3 ustun, pleyer, kitob o'quvchi, eslatmalar | eslatmalar uchun kichik migratsiya | player.js, audiobar.js, reader.js |
| 4 | Ta'lim: testlar (savol xaritasi, tarix, xatolar daftari), guruhlar, flesh-kartalar (SM-2) | flashcards jadvallari | tests.js, groups.js, yangi flash.js |
| 5 | O'qituvchi paneli | **rol kengaytirish (yuqori xavf)** | admin.js, groups.js, SQL |
| 6 | Admin: jadvallar, pagination, eksport, audit jurnali | audit_log | admin.js, billing.js |
| 7 | Mobil optimallashtirish: 320–430 px, 3 ta qurilma sinfi | yo'q | css/ |
| 8 | QA: Playwright testlarini repoga ko'chirish, a11y (axe), Lighthouse, regression | yo'q | tests/ |

Alohida qaror talab qiladiganlar (backend + yangi funksiya): kurslar/sertifikat, XP/seriya/yutuqlar, AI yordamchi, laboratoriya, forum, o'qituvchi roli.
