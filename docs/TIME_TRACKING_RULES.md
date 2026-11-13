# O'qish vaqtini hisoblash qoidalari (TIME_TRACKING_RULES)

Hujjat BioAcademy 2.0 dagi vaqt hisoblash mexanizmining **haqiqiy** (kodda amalga oshirilgan) qoidalarini bayon qiladi.

## 1. Uch xil vaqt

| Tur | Ma'nosi | Qayerda saqlanadi | Reyting/statistikaga |
|---|---|---|---|
| Session time | Ilova ochiq bo'lgan vaqt | `usage_daily`, `kind='app'` | **Qo'shilmaydi** |
| Active time | Foydalanuvchi faol bo'lgan vaqt (sichqoncha, scroll, tegish, klavishlar) | mijoz tomonida aniqlanadi, `app` ga yoziladi | Qo'shilmaydi |
| Learning time | Haqiqiy o'qish: video, audio, kitob/taqdimot, test | `usage_daily`, `kind in ('video','audio','book','test')` | **Asos** |

Profil, sozlamalar, reyting, navigatsiya, bosh sahifada o'tkazilgan vaqt `app` ga ketadi va o'qish vaqtiga **qo'shilmaydi**.
Reytingdagi "Umumiy" = video + audio + kitob + test (faqat o'qish turlari). `my_learning_summary()` ham `app` ni chiqarib tashlaydi.

## 2. Turlar bo'yicha qoidalar (js/core.js `trackTime`)

- **Video**: faqat video haqiqatan ijro etilayotganda (play, pauza emas, tugamagan). 2x tezlikda ham *real o'tgan devor soati* hisoblanadi (material vaqti emas). Tab yashirilsa video to'xtaydi (brauzer), hisob ham to'xtaydi.
- **Audio**: ijro vaqtida hisoblanadi. Ekran qulflanganda / tab fonda bo'lsa ham audio *haqiqatan davom etayotgan bo'lsa* hisoblanadi (har tikda ≤ 75 s, oldingi tik faol bo'lgan bo'lsa). Pauza yoki tugash — to'xtaydi. Bir vaqtda faqat bitta audio pleyer hisob yuritadi (ikki marta hisoblanmaydi).
- **Kitob / taqdimot**: hujjat ochiq, tab ko'rinib turibdi va oxirgi faollikdan beri < 4 daqiqa o'tgan bo'lsa hisoblanadi. Sahifa/slayd almashishi, scroll, bosish, tegish, klavish faollik hisoblanadi. 4 daqiqa faolsizlikdan keyin hisob to'xtaydi; tab yashirilsa — to'xtaydi.
- **Test**: test oynasi ochiq va faol bo'lgan vaqt `test` ga yoziladi; urinishning umumiy davomiyligi `test_attempts.duration_s` da alohida saqlanadi va natijaga bog'lanadi.

## 3. Yuborish va ikki marta hisoblanishning oldini olish

1. Mijoz har ~15 s da to'plangan vaqtni (va sahifa yopilishi/yashirilishida) to'plangan soniyalarni `add_usage(kind, item, secs)` RPC orqali yuboradi; bitta chaqiruvda ≤ 60 s.
2. **Server vaqtiga tayanish**: `add_usage` mijoz yuborgan soniyani to'g'ridan-to'g'ri ishonmaydi. Har foydalanuvchi uchun `usage_clock` "bank"i bor: real vaqt o'tgan sari 1 soniya/soniya tezlikda to'ladi (maks. 120 s). So'ralgan soniya bankdan ortiq bo'lsa, ortig'i **tashlab yuboriladi**. Shu sabab:
   - mijoz soatini o'zgartirish yoki ko'p yuborish ortiqcha vaqt bermaydi;
   - bir nechta qurilma/tabdan bir vaqtda yuborilsa ham jami 1 s/s dan oshmaydi (ikki marta hisoblanmaydi).
3. Sana `Asia/Tashkent` vaqt zonasi bo'yicha serverda aniqlanadi (`day`). Mijoz sanasiga tayanilmaydi.
4. Internet uzilsa: oflayn paytdagi vaqt **hisoblanmaydi** (adolat uchun). Yuborish muvaffaqiyatsiz bo'lsa, soniyalar xotirada qoladi va ulanganda qayta yuboriladi (sahifa yopilsa yo'qolishi mumkin).
5. Ma'lumot `usage_daily (user_id, day, kind, item_id)` kaliti bo'yicha **qo'shib boriladi** (upsert), shuning uchun takroriy yozuv paydo bo'lmaydi.

## 4. Video/audio joyi

`video_progress`: `last_pos` (oxirgi joy), `max_pos` (eng uzoq ko'rilgan), `duration`, `completed`. Qayta ochilganda `last_pos` dan davom etadi. Foiz = `max_pos / duration`. `item_views.plays` — material necha marta ochilgani (`item_open` RPC).

## 5. Streak

- Streak faqat **haqiqiy o'qish** (kuniga ≥ 60 soniya learning time yoki dars/test/karta tugatish) bo'lgan kunda oshadi: `touch_streak()` (server tomonda, `user_stats`). update9 dan boshlab u `usage_daily` yozilganda trigger orqali avtomatik chaqiriladi.
- Kun almashishi `Asia/Tashkent` bo'yicha; bir kunda necha marta kirsa ham streak bir marta oshadi.
- Bir kun o'tkazib yuborilsa streak 1 ga tushadi (`best_streak` saqlanadi).
- Kalendar `my_learning_summary().days` dan chiziladi (kunlik o'qish soniyalari).

## 6. Reyting

- `leaderboard(from, to)` — davr bo'yicha (bugun / 7 / 30 / hammasi) foydalanuvchi bo'yicha `usage_daily` yig'indisi; kategoriyalar: umumiy, kitob, video, test, audio.
- `leaderboard_meta()` — rol, guruhlar, streak (filtr va karta uchun). Admin reytingga kirmaydi.
- Reyting sahifasi har ochilganda va davr almashtirilganda serverdan qayta o'qiydi, shuning uchun `usage_daily` yangilanishi bilan avtomatik yangilanadi. Kartadagi batafsil hisobot (`rating_user_items`, `rating_user_tests`) xuddi shu jadvaldan olinadi, shu sabab reyting va hisobotlar bir xil ma'lumotni ko'rsatadi.

## 7. Tuzatilgan jiddiy xato (update9)

`add_usage` funksiyasida `bank` o'zgaruvchisi `usage_clock.bank` ustuni bilan to'qnashgan (`column reference "bank" is ambiguous`), shu sabab har bir chaqiruv xato bilan tugab, **vaqt umuman yozilmagan** edi. Funksiya qayta yozildi (o'zgaruvchilar `v_bank`, `v_s`, `v_el`) va lokal PostgreSQL 16 da sinaldi.

## 8. Ma'lum cheklovlar

- Telefonda ekran qulflanganda audio fonda hisoblanishi sandbox'da simulyatsiya qilingan; haqiqiy qurilmalarda (iOS Safari, Android Chrome) sinab ko'rish tavsiya etiladi.
- Test javoblari to'g'ri/noto'g'ri tekshiruvi hozircha mijozda; serverda tekshirish keyingi bosqichga qoldirilgan.
