// 2-BOB (4-qism): 14–15-§
export default [
{ n: 14, ch: 2, title: `Umurtqali hayvonlar`,
doc: `## Umurtqali hayvonlarning besh sinfi

| Sinf | Nafas olishi | Yuragi | Tana harorati | Ko'payishi |
|---|---|---|---|---|
| **Baliqlar** | jabra | 2 kamerali | sovuqqonli | suvda |
| **Suvda va quruqlikda yashovchilar** (baqa, triton) | teri va o'pka | 3 kamerali | sovuqqonli | tuxumni suvga qo'yadi |
| **Sudralib yuruvchilar** (kaltakesak, ilon, timsoh) | o'pka (katakchali) | 3 kamerali | sovuqqonli | tuxumni quruqlikka qo'yadi |
| **Qushlar** | o'pka + havo xaltachalari | 4 kamerali | issiqqonli | tuxumini bosib yotadi |
| **Sut emizuvchilar** | o'pka | 4 kamerali | issiqqonli | bolasini sut bilan boqadi |

## Har bir sinfning o'ziga xosligi
- **Baliq:** tanasi suyri, shilimshiq bilan qoplangan. Qon aylanishi bitta doira, yuragida faqat venoz qon oqadi. Muhit isisa harakati tezlashadi, sovisa sekinlashadi.
- **Suvda va quruqlikda yashovchi:** tuxumini suvga qo'ygani uchun suvdan uzoqqa keta olmaydi. Qon aylanishi ikki doira (katta va kichik).
- **Sudralib yuruvchi:** tanasi **muguz tangacha** bilan qoplangan, tuxumi qattiq po'choqli va sariqlikka boy – quruqlikda rivojlanishga imkon beradi.
- **Qush:** tanasi pat bilan qoplangan, old oyoqlari qanotga aylangan; bir marta olgan havosidan **ikki marta nafas oladi**; tana harorati doimiy.
- **Sut emizuvchi:** tanasi jun bilan qoplangan, bolasini sut bilan boqadi.

[[Sovuqqonli|tana harorati tashqi muhitga bog'liq]] va [[issiqqonli|tana harorati doimiy]] hayvonlar farqiga e'tibor bering.

## Baqaning hayot sikli
Tuxum (suvda, qora rangda – quyosh nurini yaxshi yutadi) → **itbaliq** (suzgichli, suvo'tlar bilan oziqlanadi) → orqa, keyin oldingi oyoqlar paydo bo'ladi → dumi tushadi → yosh baqa. Baqa 3 yilda voyaga yetadi. Erkagi bahorda sayraydi.`,
slides: [
 { h: `Besh sinf – besh moslashuv`, ic: `🦎`, p: `Baliqlar, suvda va quruqlikda yashovchilar, sudralib yuruvchilar, qushlar, sut emizuvchilar.|Har biri o'z muhitiga moslashgan.|Asosiy farq – yurak, nafas, tana harorati va ko'payish.`.split(`|`), q: `Qaysi sinflar suvga eng bog'liq?`, a: `Baliqlar (butunlay) va suvda-quruqlikda yashovchilar (tuxumini suvga qo'yadi).` },
 { h: `Baliqlar`, ic: `🐟`, p: `Suyri tana, shilimshiq qoplama.|Jabra bilan nafas oladi.|Yurak 2 kamerali, qon aylanishi bitta doira.|Sovuqqonli: muhit isisa harakati tezlashadi.`.split(`|`), q: `Muz tagida baliq nega sekin harakat qiladi?`, a: `Sovuqqonli: tana harorati suv harorati bilan bir xil, ya'ni past, harakat sustlashadi.` },
 { h: `Suvda va quruqlikda yashovchilar`, ic: `🐸`, p: `Teri va o'pka bilan nafas oladi.|Yurak 3 kamerali, ikki qon aylanish doirasi.|Tuxumini suvga qo'yadi – suvdan uzoqqa keta olmaydi.|Misol: baqa, salamandra, triton.`.split(`|`), q: `Baqa teri bilan ham nafas olgani uchun terisi qanday bo'lishi kerak?`, a: `Doim nam bo'lishi kerak, quruq teri orqali gaz almashinuvi bo'lmaydi.` },
 { h: `Sudralib yuruvchilar – quruqlik fathchilari`, ic: `🐍`, p: `Muguz tangacha qoplagan tana.|Tuxumi qattiq po'choqli, sariqlikka boy.|Tuxumni quruqlikka qo'yadi – suvga bog'liq emas.|Cho'llarda keng tarqalgan.`.split(`|`), q: `Tuxumdagi qattiq po'choq nima uchun muhim?`, a: `Tuxumni qurib qolishdan va shikastdan saqlaydi – quruqlikda rivojlanish uchun zarur.` },
 { h: `Qushlar – havo ustalari`, ic: `🦅`, p: `Pat bilan qoplangan tana, old oyoqlar qanotga aylangan.|Yurak 4 kamerali, issiqqonli.|Havo xaltachalari tufayli bir marta olgan havosidan 2 marta nafas oladi.|Tuxumini bosib yotadi.`.split(`|`), q: `Uchish uchun qush nega ko'p kislorod kerak?`, a: `Uchish juda ko'p energiya sarflaydi; ikki marta nafas olish kislorodni to'liq o'zlashtirishga imkon beradi.` },
 { h: `Sut emizuvchilar`, ic: `🐅`, p: `Tanasi jun bilan qoplangan.|Bolasini sut bilan boqadi.|Yurak 4 kamerali, issiqqonli.|Hasharotxo'rlardan primatlargacha – juda xilma-xil sinf.`.split(`|`), q: `Odam qaysi sinfga kiradi?`, a: `Sut emizuvchilar sinfiga.` },
 { h: `Sovuqqonli va issiqqonli`, ic: `🌡️`, p: `**Sovuqqonli:** tana harorati muhitga bog'liq (baliq, baqa, ilon).|**Issiqqonli:** tana harorati doimiy (qush, sut emizuvchi).|Issiqqonlilar qishda ham faol bo'la oladi, lekin ko'p oziq kerak.`.split(`|`), q: `Nega kaltakesak ertalab quyoshda isinadi?`, a: `Sovuqqonli, shuning uchun harakat qilish uchun tashqi issiqlikdan foydalanadi.` },
 { h: `Baqaning hayot yo'li`, ic: `🥚`, p: `Tuxum (qora – quyoshni yaxshi yutadi) → itbaliq (suzgichli) → orqa oyoq → oldingi oyoq → dumi tushadi → yosh baqa.|Voyaga yetishi 3 yil.|Embrion tuxumdagi sariqlik bilan oziqlanadi.`.split(`|`), q: `Itbaliq nimasi bilan baliqqa o'xshaydi, voyaga yetgan baqa bilan esa nimasi farq qiladi?`, a: `Suzgichi va suvda yashashi baliqqa o'xshash; baqada esa oyoq bor va quruqlikda yashaydi.` },
],
cards: [
 [`tf`, `Baliqlar`, `Yuragi 2 kamerali, jabra bilan nafas oladi`, true],
 [`tf`, `Suvda va quruqlikda yashovchilar`, `Yuragi 4 kamerali`, false],
 [`tf`, `Sudralib yuruvchilar`, `Tanasi muguz tangacha bilan qoplangan`, true],
 [`tf`, `Qushlar`, `Sovuqqonli hayvonlar`, false],
 [`tf`, `Sut emizuvchilar`, `Bolasini sut bilan boqadi, issiqqonli`, true],
 [`tf`, `Issiqqonli hayvon`, `Tana harorati tashqi muhitga bog'liq`, false],
 [`tf`, `Itbaliq`, `Baqaning suzgichli lichinkasi`, true],
 [`tf`, `Baqa tuxumi`, `Quruqlikda rivojlanadi`, false],
 [`type`, `Baliqlar nafas oladigan organ`, `jabra`, [`jabra`]],
 [`type`, `Qushlarning yuragi necha kamerali (raqam)`, `4`, [`4`, `to'rt`]],
 [`type`, `Tana harorati tashqi muhitga bog'liq hayvonlar (... qonli)`, `sovuq`, [`sovuq`, `sovuqqonli`]],
 [`type`, `Baqa lichinkasi nomi`, `itbaliq`, [`itbaliq`]],
],
test: [
 [`Baliqlar qanday nafas oladi?`, `Jabra yordamida`, [`O'pka yordamida`, `Teri orqali`, `Havo xaltachalari bilan`], `Baliqlar suvda erigan kislorodni jabra bilan oladi.`],
 [`Baliqlar yuragi nechta kamerali?`, `Ikki`, [`Uch`, `To'rt`, `Bir`], `Yuragida venoz qon oqadi.`],
 [`Suvda va quruqlikda yashovchilar nega suvdan uzoqqa keta olmaydi?`, `Tuxumini suvga qo'yadi`, [`Nafas olishi uchun suv shart emas`, `O'pkasi yo'q`, `Yuragi bir kamerali`], `Tuxum va itbaliq suvda rivojlanadi.`],
 [`Sudralib yuruvchilar tanasi nima bilan qoplangan?`, `Muguz tangacha`, [`Pat`, `Jun`, `Shilimshiq`], `Bu quruqlikda qurib qolishdan saqlaydi.`],
 [`Quyidagilardan qaysi biri sudralib yuruvchi?`, `Timsoh`, [`Qurbaqa`, `Triton`, `Burgut`], `Timsoh, ilon, kaltakesak – sudralib yuruvchilar.`],
 [`Qushlar bir marta olgan havosidan necha marta nafas oladi?`, `Ikki marta`, [`Bir marta`, `Uch marta`, `Nafas olmaydi`], `Havo xaltachalari tufayli.`],
 [`Qaysi sinf vakillari issiqqonli?`, `Qushlar va sut emizuvchilar`, [`Baliqlar va baqalar`, `Ilonlar va timsohlar`, `Faqat baliqlar`], `Tana harorati doimiy.`],
 [`Sut emizuvchilarning asosiy belgisi qaysi?`, `Bolasini sut bilan boqadi`, [`Tuxumini bosib yotadi`, `Jabra bilan nafas oladi`, `Muguz tangacha`], `Shuning uchun ular sut emizuvchi deyiladi.`],
 [`Yuragi uch kamerali sinflar qaysilar?`, `Suvda-quruqlikda yashovchilar va sudralib yuruvchilar`, [`Baliqlar va qushlar`, `Qushlar va sut emizuvchilar`, `Faqat baliqlar`], `Qushlar va sut emizuvchilarniki 4 kamerali.`],
 [`Itbaliq baqaga aylanishida dastlab qaysi oyoq paydo bo'ladi?`, `Orqa oyoq`, [`Oldingi oyoq`, `Ikkalasi bir vaqtda`, `Hech biri`], `Keyin oldingi oyoq rivojlanadi va dum tushadi.`],
],
rev: [
 [`13-mavzuda umurtqasizlarni o'rgandik. Umurtqali hayvonlar bilan asosiy farqi nimada?`, `Umurtqali hayvonlarda umurtqa pog'onasi bor`, [`Umurtqasizlar sovuqqonli`, `Umurtqasizlar hujayrasiz`, `Umurtqalilar geterotrof emas`], `Umurtqa tayanch vazifasini bajaradi.`],
 [`Asalari to'liq o'zgarish bilan, baqa esa qanday rivojlanishga ega (itbaliq bosqichi)?`, `Baqada ham lichinka (itbaliq) bosqichi bor`, [`Baqada lichinka bosqichi yo'q`, `Baqada faqat tuxum bor`, `Baqa to'liq o'zgarishsiz`], `Ikkalasida ham lichinka bosqichi bor, ikkalasi o'zgarib rivojlanadi.`],
 [`Xitin bo'g'imoyoqlilarda tashqi skelet. Sudralib yuruvchilarda tashqi qoplama nima?`, `Muguz tangacha`, [`Pat`, `Jun`, `Xitin`], `Muguz tangacha.`],
 [`Halqali chuvalchanglarda qon aylanish sistemasi paydo bo'lgan. Baliqda qon aylanishi qanday?`, `Yopiq, bitta doira`, [`Ochiq`, `Ikki doira`, `Yo'q`], `Baliqda bitta doira.`],
 [`Sodda hayvon evglena va baliq: ikkalasi ham...`, `Suvda yashaydi`, [`Sovuqqonli emas`, `Issiqqonli`, `Quruqlikda yashaydi`], `Ikkalasi ham suv muhitida.`],
 [`Hayvon hujayrasida qisqaruvchi vakuola bor (4-mavzu). Baqa va baliqda suv muvozanatini kim boshqaradi?`, `Ayirish sistemasi (buyrak)`, [`Faqat sellyuloza`, `Faqat spora`, `Xlorofill`], `Umurtqalilarda ayirish organlari.`],
 [`Parazit chuvalchang va qush: ikkalasi geterotrof. Bu qanday ma'noni anglatadi?`, `Ikkalasi ham tayyor oziq bilan oziqlanadi`, [`Ikkalasi fotosintez qiladi`, `Ikkalasi avtotrof`, `Ikkalasi o'simlik`], `Geterotrof – tayyor oziq.`],
 [`Hayvon sistematikasida baliq, qush, sut emizuvchi qaysi birlik darajasida ajraladi?`, `Sinf darajasida`, [`Tur darajasida`, `Oila darajasida`, `Tip darajasida`], `Xordalilar tipi bir necha sinfga bo'linadi.`],
] },

{ n: 15, ch: 2, title: `Odam organlari sistemasi`,
doc: `## Tana qanday qurilgan?

Hujayralar → to'qimalar → organ → **organlar sistemasi** → organizm. Masalan, yurak va qon tomirlar mushak, biriktiruvchi va epiteliy to'qimalaridan hosil bo'ladi; yurak, arteriya, vena, kapillyarlar birgalikda qon aylanish sistemasini tashkil qiladi.

## Yetti sistema
1. **Tayanch-harakatlanish:** skelet + muskullar. Miya qutisi miyani, ko'krak qafasi o'pka va yurakni himoya qiladi. Suyak ko'migida qon hujayralari hosil bo'ladi. Qo'lni bukishda ikki boshli muskul qisqaradi, uch boshli bo'shashadi; yozishda – aksincha.
2. **Qon aylanish:** 4 kamerali yurak – nasos. [[Arteriya|yurakdan chiquvchi qon tomir]], [[vena|yurakka kiruvchi qon tomir]], [[kapillyar|to'qimalar orasidagi mayda qon tomir]]. Yopiq sistema, 2 doira: katta va kichik.
3. **Hazm qilish:** og'iz bo'shlig'i → halqum → qizilo'ngach → oshqozon → ichak.
4. **Nerv:** markaziy (bosh va orqa miya) va periferik (nervlar, nerv tugunlari). Orqa miya umurtqa pog'onasi kanalida.
5. **Nafas olish:** burun bo'shlig'i → halqum → traxeya → bronx → alveola → o'pka. Alveola va kapillyar orasida gaz almashinuvi bo'ladi. Yopiq xonada havo tez-tez almashtirilmasa, kislorod yetishmasdan bosh og'riydi.
6. **Limfa:** limfa tugunlari, tomirlari, suyuqligi va taloq. Immunitetni ta'minlaydi, bakteriya va viruslarni ushlab zararsizlantiradi. Ochiq sistema. Taloqda limfotsitlar hosil bo'ladi.
7. **Endokrin:** ichki sekretsiya bezlari (gipofiz, epifiz, qalqonsimon, ayrisimon, buyrak usti). Ular qonga [[gormon|biologik faol modda, juda oz miqdorda ham ta'sir qiladi]] chiqaradi. Masalan, qo'rqqanda **adrenalin** ko'p ajraladi.

Hamma sistema o'z vazifasini bajarsagina organizm sog'lom bo'ladi.`,
slides: [
 { h: `Jamoa bo'lib ishlaydigan tana`, ic: `🧍`, p: `Hujayra → to'qima → organ → organlar sistemasi → organizm.|7 asosiy sistema.|Birortasi ishdan chiqsa, qolganlariga ham ta'sir qiladi.`.split(`|`), q: `Bir sistema buzilsa, nima uchun boshqalari ham zarar ko'radi?`, a: `Sistemalar bir-biriga bog'liq: masalan, yurak ishlamasa, qon bilan kislorod boshqa organlarga yetmaydi.` },
 { h: `Tayanch-harakat`, ic: `💪`, p: `Skelet + muskullar.|Miya qutisi – miya himoyasi, ko'krak qafasi – o'pka va yurak himoyasi.|Qo'lni bukkanda ikki boshli qisqaradi, uch boshli bo'shashadi.`.split(`|`), q: `Qo'lni yozganda qaysi muskul qisqaradi?`, a: `Uch boshli muskul qisqaradi, ikki boshli bo'shashadi.` },
 { h: `Qon aylanish`, ic: `❤️`, p: `4 kamerali yurak – nasos.|**Arteriya** – yurakdan chiqadi. **Vena** – yurakka kiradi. **Kapillyar** – mayda, to'qimalar orasida.|Yopiq sistema, 2 doira: katta va kichik.`.split(`|`), q: `Kapillyar nima uchun juda yupqa?`, a: `Qon va to'qimalar orasida moddalar (kislorod, oziq) almashinuvi oson bo'lishi uchun.` },
 { h: `Hazm qilish`, ic: `🍽️`, p: `Og'iz → halqum → qizilo'ngach → oshqozon → ichak.|Og'izda tish va til ovqatni maydalaydi, so'lak bezlari ishlaydi.`.split(`|`), q: `Ovqatni yaxshilab chaynash nega foydali?`, a: `Maydalangan ovqat tez va to'liq hazm bo'ladi, oshqozon yengillashadi.` },
 { h: `Nerv sistemasi`, ic: `🧠`, p: `Markaziy: bosh miya (miya qutisida) va orqa miya (umurtqa kanalida).|Periferik: nervlar va nerv tugunlari.|Butun organizmni boshqaradi.`.split(`|`), q: `Issiq narsaga tegib qo'lni tez tortib olish – bu nima bilan bog'liq?`, a: `Nerv sistemasi signalni tez o'tkazib, himoya refleksini ishga soladi.` },
 { h: `Nafas olish`, ic: `🫁`, p: `Burun → halqum → traxeya → bronx → alveola → o'pka.|Alveola bilan kapillyar orasida gazlar almashadi.|Yopiq xonada havo kam kislorodli bo'ladi, shuning uchun uni almashtirish kerak.`.split(`|`), q: `Sinfda deraza ochib havo almashtirish nega kerak?`, a: `Ko'p odam nafas olsa kislorod kamayib, karbonat angidrid ko'payadi – bosh og'riydi, diqqat pasayadi.` },
 { h: `Limfa – himoya posti`, ic: `🛡️`, p: `Limfa tugunlari, tomirlari, suyuqlik, taloq.|Tugunlar filtr kabi bakteriya va virusni ushlaydi.|Taloqda limfotsitlar hosil bo'ladi.`.split(`|`), q: `Kasallik paytida bo'yindagi limfa tugunlari kattalashishi nimani bildiradi?`, a: `Ular mikrobga qarshi faol ishlayapti (tutib, zararsizlantirmoqda).` },
 { h: `Endokrin: gormonlar`, ic: `⚗️`, p: `Ichki sekretsiya bezlari: gipofiz, epifiz, qalqonsimon, ayrisimon, buyrak usti.|Gormonlar qonga chiqadi, juda oz miqdorda ham kuchli ta'sir qiladi.|Adrenalin – qo'rqqanda ajraladi.`.split(`|`), q: `Nega qo'rqqanda yurak tez urib, kuch oshadi?`, a: `Adrenalin gormoni ajralib, organizmni himoyaga (qochish yoki kurashishga) tayyorlaydi.` },
],
cards: [
 [`tf`, `Arteriya`, `Yurakdan chiquvchi qon tomir`, true],
 [`tf`, `Vena`, `Yurakdan chiquvchi qon tomir`, false],
 [`tf`, `Kapillyar`, `To'qimalar orasidagi mayda qon tomir`, true],
 [`tf`, `Odam yuragi`, `3 kamerali`, false],
 [`tf`, `Orqa miya`, `Umurtqa pog'onasi kanalida joylashgan`, true],
 [`tf`, `Alveola`, `O'pkadagi gaz almashinuvi bo'ladigan qism`, true],
 [`tf`, `Limfa sistemasi`, `Immunitetni ta'minlashda ishtirok etadi`, true],
 [`tf`, `Gormon`, `Hazm qilishda ishlatiladigan shira`, false],
 [`type`, `Qo'rqqanda buyrak usti bezi ajratadigan gormon`, `adrenalin`, [`adrenalin`]],
 [`type`, `Limfotsitlar hosil bo'ladigan organ`, `taloq`, [`taloq`]],
 [`type`, `Qon aylanish doirasi nechta? (raqam)`, `2`, [`2`, `ikki`]],
 [`type`, `Yurakka kiruvchi qon tomir`, `vena`, [`vena`]],
],
test: [
 [`Odam yuragi necha kamerali?`, `To'rt`, [`Ikki`, `Uch`, `Bir`], `Odam yuragi 4 kamerali nasos.`],
 [`Arteriya qanday qon tomir?`, `Yurakdan chiquvchi`, [`Yurakka kiruvchi`, `To'qimalar orasidagi mayda`, `Faqat venoz`], `Vena yurakka kiradi.`],
 [`Odamda nechta qon aylanish doirasi bor?`, `Ikkita: katta va kichik`, [`Bitta`, `Uchta`, `To'rtta`], `Qon aylanish yopiq.`],
 [`Orqa miya qayerda joylashgan?`, `Umurtqa pog'onasi kanalida`, [`Miya qutisida`, `Ko'krak qafasida`, `Qorin bo'shlig'ida`], `Bosh miya esa miya qutisida.`],
 [`Hazm yo'li to'g'ri tartibda qaysi qatorda?`, `Og'iz – halqum – qizilo'ngach – oshqozon – ichak`, [`Og'iz – oshqozon – halqum – ichak – qizilo'ngach`, `Halqum – og'iz – ichak – oshqozon`, `Qizilo'ngach – og'iz – halqum – ichak`], `Ovqat shu yo'ldan o'tadi.`],
 [`Gaz almashinuvi o'pkaning qaysi qismida bo'ladi?`, `Alveola va kapillyar orasida`, [`Traxeyada`, `Bronxda`, `Halqumda`], `Kislorod qonga, karbonat angidrid chiqishga o'tadi.`],
 [`Limfa tugunlarining vazifasi nima?`, `Bakteriya va viruslarni ushlab zararsizlantirish`, [`Qonni haydash`, `Ovqat hazm qilish`, `Nafas olish`], `Ular filtr vazifasini bajaradi.`],
 [`Limfotsitlar qayerda hosil bo'ladi?`, `Taloqda`, [`Yurakda`, `Qizilo'ngachda`, `O'pkada`], `Taloq – limfa sistemasi organi.`],
 [`Gormon nima?`, `Ichki sekretsiya bezlari qonga chiqaradigan biologik faol modda`, [`Hazm shirasi`, `Qon hujayrasi`, `Suyak qismi`], `Juda oz miqdorda ham ta'sir qiladi.`],
 [`Adrenalin qaysi bezda ishlab chiqariladi va qachon ko'p ajraladi?`, `Buyrak usti bezida, qo'rqqanda`, [`Qalqonsimon bezda, ovqatdan keyin`, `Taloqda, uxlaganda`, `Gipofizda, qorong'ida`], `Himoya refleksini ishga tushiradi.`],
],
rev: [
 [`14-mavzuda qushlar va sut emizuvchilarning yuragi 4 kamerali ekanini bilib oldik. Odamning yuragi qaysi sinfnikiga o'xshaydi?`, `Sut emizuvchilarniki`, [`Baliqlarniki`, `Baqalarniki`, `Ilonlarniki`], `Odam sut emizuvchilar sinfiga kiradi.`],
 [`Qush ham, odam ham issiqqonli. Bu nimani bildiradi?`, `Tana harorati doimiy`, [`Tana harorati muhitga bog'liq`, `Ikkalasi ham jabra bilan nafas oladi`, `Ikkalasi tuxum qo'yadi`], `Issiqqonli – doimiy harorat.`],
 [`Baliq yuragi 2 kamerali, odamniki 4 kamerali. Bu farq nimani ko'rsatadi?`, `Odamda qon aylanishi mukammalroq`, [`Odam sovuqqonli`, `Baliq issiqqonli`, `Baliq quruqlikda yashaydi`], `Ko'proq kamera – qon aylanishi samaraliroq.`],
 [`Hayvonlarda 4 xil to'qima bor (12-mavzu). Odam yuragi qaysi to'qimalardan tuzilgan?`, `Muskul, biriktiruvchi, epiteliy`, [`Faqat nerv`, `Faqat qoplovchi`, `Faqat suyak`], `Turli to'qimalar organni hosil qiladi.`],
 [`Baqa teri va o'pka bilan, odam nafas yo'llari bilan nafas oladi. Ularning umumiy nafas organi nima?`, `O'pka`, [`Jabra`, `Teri`, `Havo xaltachalari`], `Ikkalasida ham o'pka bor.`],
 [`Hazm qilish va nafas olish: ikkalasi ham tirik organizmning qaysi xususiyati bilan bog'liq?`, `Moddalar almashinuvi`, [`Ko'payish`, `Harakat`, `Spora hosil qilish`], `Oziqlanish va nafas – metabolizm qismi.`],
 [`Limfa tugunlari bakteriyalarni ushlab qoladi. 6-mavzudan: parazit bakteriyalar qaysi kasalliklarni keltiradi?`, `Sil, vabo, o'lat, ichburug', qoqshol`, [`Gripp, quturish`, `Qorakuya, vilt`, `Zang, mog'or`], `Bakteriyalar keltirgan kasalliklar.`],
 [`Nerv hujayrasi (4-mavzu) signal o'tkazadi. Nerv sistemasida bu nima hosil qiladi?`, `Boshqaruv va refleks`, [`Fotosintez`, `Spora`, `Gormon emas, faqat oziq`], `Nerv sistemasi organizmni boshqaradi.`],
] },
]
