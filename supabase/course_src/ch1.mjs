// 1-BOB. Biologiya – tirik organizmlar haqidagi fan (1–4-§)
// Format: doc (markdown, [[atama|izoh]]), slides [{h,ic,p[],q,a}], cards [['tf',termin,ta'rif,true/false]|['type',izoh,javob,[muqobil]]],
//         test/rev: [savol, to'g'ri, [3 ta noto'g'ri], izoh]
export default [
{ n: 1, ch: 1, title: `Biologiya – hayot haqidagi fan`,
doc: `## Biologiya nima?

**Biologiya** – tirik tabiat, ya'ni hayot haqidagi fan. Bu so'z yunoncha ikki so'zdan olingan: *bios* – hayot, *logos* – fan, ta'limot.

Tirik tabiat juda katta, shuning uchun uni bo'laklarga bo'lib o'rganishadi. Har bir bo'lakni o'rganuvchi alohida fan bor:

- [[Botanika|o'simliklar haqidagi fan]] – o'simliklarni o'rganadi.
- [[Zoologiya|hayvonlar haqidagi fan]] – hayvonlarni o'rganadi.
- [[Mikologiya|zamburug'lar haqidagi fan]] – zamburug'larni o'rganadi.
- [[Mikrobiologiya|ko'zga ko'rinmas kichik jonzotlar haqidagi fan]].
- [[Sitologiya|hujayra haqidagi fan]].
- [[Anatomiya|tirik organizmning ichki tuzilishini o'rganadi]].
- [[Fiziologiya|organizmda boradigan jarayonlarni o'rganadi]].
- [[Sistematika|organizmlarni o'xshash belgilariga ko'ra guruhlarga ajratadi]].
- [[Genetika|irsiyat va o'zgaruvchanlik haqidagi fan]].
- [[Ekologiya|organizmlarning bir-biri va tashqi muhit bilan aloqasini o'rganadi]].

## Biologiya bizga nima uchun kerak?

1. **Dehqonchilik:** o'simlik qanday o'sishini bilgan odam mo'l hosil oladi.
2. **Chorvachilik:** hayvonni to'g'ri boqish va kasalligini davolashni bilgan odamning mollari ko'payadi.
3. **Sog'liq:** tanamiz qanday ishlashini bilsak, kasallikdan saqlanamiz. Abu Nasr Farobiy: kasalliklar ko'pincha ovqatlanish tartibi buzilishidan kelib chiqadi, degan.
4. **Tibbiyot:** dorivor o'simliklar va ba'zi hayvon zaharlari (asalari, qoraqurt, ilon) to'g'ri miqdorda dori sifatida ishlatiladi.
5. **Tabiatni asrash:** inson tabiatga doim ta'sir qiladi. Biologiyani bilsak, zararni kamaytirib, boyliklardan oqilona foydalanamiz.

## Bizning olimlarimiz

- Yolqin To'raqulov – qalqonsimon bezni o'rgangan, osh tuziga yod qo'shib buqoq kasalligini davolagan.
- Jo'ra Musayev – genetik, dunyoda birinchi bo'lib g'o'za kolleksiyasini yaratgan.
- Mashhura Mavloniy – mikrobiologiya; Jaloliddin Azimov – hayvon parazitlari (zoologiya).
- To'raxon Rahimova – cho'l va adir o'simliklari ekologiyasi; O'ktam Pratov – botanika.

## Laboratoriyada xavfsizlik
Mashg'ulotni faqat o'qituvchi nazoratida bajaring, darz ketgan idishlarni ishlatmang, qizdirilgan probirkani tutqich bilan ushlang va og'zini hech kimga qaratmang, ish oxirida qo'lni sovunlab yuving.`,
slides: [
 { h: `Hayot haqidagi fan`, ic: `🌍`, p: [`Atrofga qarang: daraxt, mushuk, o'zingiz, hatto ko'zga ko'rinmas bakteriyalar ham tirik.`, `Ularning hammasini o'rganadigan fan – **biologiya**.`, `Bios – hayot, logos – fan.`], q: `Sizningcha, tirik narsa bilan jonsiz narsaning eng katta farqi nima?`, a: `Tirik narsa oziqlanadi, o'sadi, ko'payadi, tashqi ta'sirga javob beradi. Tosh bularni qilmaydi. (Buni keyingi mavzuda batafsil ko'ramiz.)` },
 { h: `Nega bitta fan emas, o'nta?`, ic: `🧩`, p: `Tirik tabiat juda katta. Kitobni boblarga bo'lganimiz kabi, biologiya ham bo'limlarga bo'lingan.|Hamma bo'limning nomi o'rganadigan narsasini aytib turadi.|Masalan: *zoo* – hayvon, *bota* – o't-o'simlik, *sito* – hujayra.`.split(`|`) },
 { h: `Eng muhim bo'limlar`, ic: `📚`, p: [`**Botanika** – o'simliklar. **Zoologiya** – hayvonlar. **Mikologiya** – zamburug'lar.`, `**Mikrobiologiya** – mikroblar. **Sitologiya** – hujayra.`, `**Anatomiya** – ichki tuzilish. **Fiziologiya** – ishlash jarayonlari.`, `**Sistematika** – guruhlash. **Genetika** – irsiyat. **Ekologiya** – muhit bilan aloqa.`], q: `Quyon yaproqni qanday hazm qiladi? Bu savolga qaysi bo'lim javob beradi?`, a: `Fiziologiya – chunki bu organizmdagi jarayon (hazm qilish).` },
 { h: `Anatomiya va fiziologiya – farqi nimada?`, ic: `🫀`, p: `Anatomiya savoli: yurak qanday tuzilgan? Nechta xonasi bor?|Fiziologiya savoli: yurak qanday ishlaydi? Qonni qanday haydaydi?|Tuzilish – anatomiya, ish – fiziologiya. Soatning ichiga qarash va soat qanday yurishini kuzatishga o'xshaydi.`.split(`|`) },
 { h: `Dehqon va chorvador uchun`, ic: `🌾`, p: `Paxta qachon va qancha suv talab qilishini bilgan dehqon hosilni oshiradi.|Qo'yni to'g'ri boqishni bilgan chorvador kam yo'qotadi.|Bilim – bu pul, mehnat va vaqtni tejash.`.split(`|`), q: `Dehqon o'simlikning qaysi xususiyatlarini bilishi kerak?`, a: `Qanday tuproq, qancha suv, yorug'lik va issiqlik kerakligini, qaysi kasallik va zararkunandalar xavf solishini.` },
 { h: `Tabiat dorixonasi`, ic: `🌿`, p: `Dorivor o'simliklar ko'p kasallikka shifo beradi.|Hatto ilon, asalari, qoraqurt zahri ham **juda oz va to'g'ri miqdorda** dori bo'ladi.|Shuning uchun dorivor o'simlikni zaharlisidan ajrata bilish hayotiy muhim.`.split(`|`), q: `Nima uchun zahar bir holda o'ldiradi, boshqa holda davolaydi?`, a: `Hammasi miqdorga bog'liq. Mutaxassis aniq miqdorni hisoblaydi; o'zboshimchalik bilan ishlatish xavfli.` },
 { h: `Sog'lom bo'lish – biologiya ham`, ic: `🥗`, p: `Farobiy: kasalliklar ko'pincha noto'g'ri ovqatlanishdan.|Meva-sabzavotda vitamin va mineral moddalar bor, tanamizga ular kerak.|Tanani bilish – o'z sog'ligimizni asrash uchun birinchi qadam.`.split(`|`) },
 { h: `Inson va tabiat`, ic: `🌳`, p: `Biz suv ichamiz, ekin sug'oramiz, daraxt kesamiz, dori sepamiz – ya'ni tabiatga doim ta'sir qilamiz.|Biologiyani bilsak, zararni kamaytiramiz va boyliklarni tugatib qo'ymaymiz.`.split(`|`), q: `Bitta daraxt kesilsa nimalar o'zgaradi? Kamida uchta oqibatni ayting.`, a: `Soya va kislorod kamayadi, qushlar uyasiz qoladi, tuproq yuvilib ketishi mumkin.` },
 { h: `O'zbek olimlari`, ic: `🔬`, p: `**To'raqulov** – tuzga yod qo'shib buqoqni davolagan.|**Musayev** – g'o'za kolleksiyasini yaratgan genetik.|**Mavloniy** – mikrobiologiya; **Azimov** – hayvon parazitlari; **Rahimova** – cho'l o'simliklari; **Pratov** – botanika.|Siz ham ularning o'rnini egallashingiz mumkin.`.split(`|`), q: `Siz olim bo'lsangiz, qaysi sohani tanlardingiz va nima uchun?`, a: `Bu savolning to'g'ri javobi yo'q – eng muhimi, sababini aniq tushuntirish. Bunday fikrlash biologning asosiy ko'nikmasi.` },
],
cards: [
 [`tf`, `Botanika`, `Hayvonlar haqidagi fan`, false],
 [`tf`, `Zoologiya`, `Hayvonlar haqidagi fan`, true],
 [`tf`, `Sitologiya`, `Hujayra haqidagi fan`, true],
 [`tf`, `Ekologiya`, `Irsiyat va o'zgaruvchanlik haqidagi fan`, false],
 [`tf`, `Anatomiya`, `Tirik organizmning ichki tuzilishini o'rganadi`, true],
 [`tf`, `Mikologiya`, `O'simliklar haqidagi fan`, false],
 [`type`, `«Bios» yunoncha nima degani? (bir so'z)`, `hayot`, [`hayot`]],
 [`type`, `O'simliklar haqidagi fan nomi`, `botanika`, [`botanika`]],
 [`type`, `Irsiyat va o'zgaruvchanlik haqidagi fan`, `genetika`, [`genetika`]],
 [`type`, `Organizmda boradigan jarayonlarni o'rganuvchi fan`, `fiziologiya`, [`fiziologiya`]],
 [`tf`, `Sistematika`, `Organizmlarni o'xshash belgilariga ko'ra guruhlarga ajratadi`, true],
 [`tf`, `Asalari, qoraqurt va ilon zahri`, `Hech qachon dori sifatida ishlatilmaydi`, false],
],
test: [
 [`Biologiya so'zi qanday ma'noni bildiradi?`, `Hayot haqidagi fan`, [`Hayvonlar haqidagi fan`, `Tabiat go'zalligi`, `Hujayra haqidagi ta'limot`], `Bios – hayot, logos – fan.`],
 [`Zamburug'larni o'rganuvchi fan qaysi?`, `Mikologiya`, [`Botanika`, `Zoologiya`, `Sitologiya`], `Mikologiya – zamburug'lar haqidagi fan.`],
 [`Sistematika nimani o'rganadi?`, `Organizmlarni o'xshash belgilariga ko'ra guruhlarga ajratadi`, [`Hujayra tuzilishini`, `Organizmdagi jarayonlarni`, `Irsiy belgilarni`], `Sistematika – guruhlash fani.`],
 [`Yurak qanday tuzilganini (necha xonaligini) o'rganish qaysi fanga tegishli?`, `Anatomiya`, [`Fiziologiya`, `Genetika`, `Mikrobiologiya`], `Tuzilish – anatomiya. Ishlash jarayoni esa fiziologiya.`],
 [`Ona-bola o'rtasida belgilar qanday o'tishini o'rganadigan fan qaysi?`, `Genetika`, [`Ekologiya`, `Botanika`, `Sitologiya`], `Genetika – irsiyat va o'zgaruvchanlik haqidagi fan.`],
 [`Quyidagilardan qaysi biri ekologiyaga tegishli savol?`, `Quyonlar soni kamayganda tulkilarga nima bo'ladi?`, [`Quyonning yuragi nechta xonali?`, `Quyon hujayrasida nimalar bor?`, `Quyon qaysi guruhga kiradi?`], `Ekologiya organizmlarning bir-biri bilan aloqasini o'rganadi.`],
 [`Osh tuziga yod qo'shib, buqoq kasalligini davolagan olim kim?`, `Yolqin To'raqulov`, [`Jo'ra Musayev`, `Mashhura Mavloniy`, `O'ktam Pratov`], `To'raqulov qalqonsimon bez faoliyatini o'rgangan.`],
 [`Dunyoda birinchi bo'lib g'o'za kolleksiyasini yaratgan olim kim?`, `Jo'ra Musayev`, [`Jaloliddin Azimov`, `To'raxon Rahimova`, `Muhsin Valixonov`], `Musayev – akademik, genetik olim.`],
 [`Ilon zahridan odamlar nima maqsadda foydalanadi?`, `Oz va to'g'ri miqdorda dori sifatida`, [`Ovqat sifatida`, `Kiyim bo'yash uchun`, `Suvni tozalash uchun`], `Mutaxassislar zahar miqdorini aniq hisoblab, kasallik davolashda ishlatadi.`],
 [`Qaysi buyum laboratoriyada suyuqlikni tomchilatish uchun ishlatiladi?`, `Pipetka`, [`Pinset`, `Skalpel`, `Petri idishi`], `Pipetka – suyuqlikni tomizish uchun.`],
],
rev: [] },

{ n: 2, ch: 1, title: `Tirik organizmlarning xususiyatlari`,
doc: `## Tirik nima bilan jonsizdan farq qiladi?

Tirik organizmlarning sakkizta asosiy belgisi bor. Bu belgilarning **hammasi** bo'lsa, u tirik hisoblanadi.

1. **Moddalar almashinuvi** ([[metabolizm|tirik tanadagi barcha kimyoviy o'zgarishlar yig'indisi]]). Ikki qismdan iborat: *assimilyatsiya* – yangi moddalar hosil bo'lishi (energiya sarflanadi), *dissimilyatsiya* – moddalar parchalanishi (energiya ajraladi).
2. **Oziqlanish.** [[Avtotrof|oziqni o'zi hosil qiladigan organizm]] (yashil o'simliklar) va [[geterotrof|tayyor oziq bilan oziqlanadigan organizm]] (hayvonlar, zamburug'lar, ko'p bakteriyalar).
3. **Nafas olish.** Ko'pchilik organizm kislorod yutib, karbonat angidrid chiqaradi.
4. **Ayirish.** Zararli moddalar (karbonat angidrid, mochevina, ortiqcha tuzlar) tanadan chiqariladi.
5. **Ta'sirlanish.** Tipratikanga tegsangiz yumaloqlanadi, uyatchan mimoza bargini yumadi.
6. **Harakatlanish.** Hayvonlarda faol (yugurish, uchish), o'simliklarda passiv (barg yorug'likka, kungaboqar quyoshga buriladi).
7. **Ko'payish.** Jinssiz (bitta organizm: bo'linish, kurtaklanish, [[spora|zamburug' va o'simliklarning ko'payish hujayrasi]]) va jinsiy (ikki organizm, [[gameta|jinsiy ko'payishda ishtirok etuvchi hujayra]]lar).
8. **O'sish va rivojlanish.** O'sish – miqdoriy ortish, rivojlanish – sifat o'zgarishi.

## Misol
Urug'dan unib chiqqan nihol kattalashadi – bu **o'sish**. Poyasi yo'g'onlashib, barg yozib, gullab meva beradi – bu **rivojlanish**.`,
slides: [
 { h: `Tosh tirikmi?`, ic: `🪨`, p: [`Tosh turibdi, o'zgarmaydi, hech narsa yemaydi.`, `Mushuk esa yeydi, o'sadi, o'ynaydi.`, `Demak, farq bor. Keling, o'sha farqni aniq belgilarga ajratamiz.`], q: `Olov ham «o'sadi» va «yeydi» (o'tinni). Nima uchun u tirik emas?`, a: `Olov ko'paymaydi, nafas olmaydi, hujayradan iborat emas va o'zini tiklay olmaydi. Faqat bitta belgi yetmaydi, hamma belgilar birga bo'lishi kerak.` },
 { h: `1. Moddalar almashinuvi`, ic: `🔄`, p: `Tanamiz doim ichida «qurilish» va «buzish» ishi bilan band.|**Qurilish** (assimilyatsiya): oziqdan o'zimizga kerakli narsa yasaymiz – energiya sarflanadi.|**Buzish** (dissimilyatsiya): oziqni parchalaymiz – energiya hosil bo'ladi.`.split(`|`), q: `Ovqat hazm bo'lishi – qurilishmi yoki buzish?`, a: `Buzish (dissimilyatsiya): murakkab oziq mayda qismlarga parchalanadi va energiya ajraladi.` },
 { h: `2. Oziqlanish: o'zi pishiruvchi va tayyorni yeyuvchi`, ic: `🍃`, p: `**Avtotrof** – oziqni o'zi yasaydi (yashil o'simlik quyosh nuridan).|**Geterotrof** – tayyor oziq qidiradi (hayvon, zamburug', ko'p bakteriyalar).|Avto – o'zi, getero – boshqa.`.split(`|`), q: `Bo'ri quyonni yeydi, quyon o'tni yeydi. Kim avtotrof?`, a: `Faqat o't (o'simlik). Quyon ham, bo'ri ham geterotrof.` },
 { h: `3–4. Nafas va ayirish`, ic: `💨`, p: `Nafas: kislorod kiradi, karbonat angidrid chiqadi.|Quruqlikdagilar havo kislorodi bilan, suvdagilar suvda erigan kislorod bilan nafas oladi.|Ayirish – tanani «chiqindidan tozalash»: karbonat angidrid, mochevina, ortiqcha tuzlar.`.split(`|`), q: `Baliq suvdan chiqarib qo'yilsa nega halok bo'ladi?`, a: `U suvda erigan kislorod bilan nafas oladi. Quruqlikda bu kislorodni ola olmaydi.` },
 { h: `5–6. Ta'sirlanish va harakat`, ic: `⚡`, p: `Tipratikanga tegsangiz – yumaloq bo'ladi. Mimoza bargi – yumiladi. Bu ta'sirlanish.|Hayvonlar faol harakatlanadi: yuguradi, uchadi, suzadi.|O'simlik passiv harakatlanadi: barg yorug'likka burilishi, kungaboqarning quyoshga qarashi.`.split(`|`), q: `Nima uchun hayvonlarga faol harakat kerak, o'simlikka esa unchalik emas?`, a: `Hayvon oziqni izlashi va dushmandan qochishi kerak. O'simlik oziqni o'zi yasaydi va joyida turib quyosh va suvni oladi.` },
 { h: `7. Ko'payish`, ic: `🐣`, p: `**Jinssiz** – bitta organizm ishtirok etadi (bo'linish, kurtaklanish, spora).|**Jinsiy** – ikkita organizm; irsiy xususiyatlar aralashadi. Ishtirok etuvchi hujayralar – gametalar.|Ko'payish turni yo'qolishdan saqlaydi.`.split(`|`) },
 { h: `8. O'sish va rivojlanish`, ic: `🌱`, p: `**O'sish** – kattalashish (miqdor).|**Rivojlanish** – o'zgarish (sifat): barg yozish, gullash, meva tugish.|Ikkalasi doim birga ketadi, lekin bir xil narsa emas.`.split(`|`), q: `Kuchukcha katta itga aylanishi o'sishmi yoki rivojlanishmi?`, a: `Ikkalasi: kattalashadi (o'sish), tishlari almashadi, tana nisbatlari o'zgaradi (rivojlanish).` },
 { h: `Xulosa: tirik bo'lish uchun nima kerak?`, ic: `✅`, p: `Moddalar almashinuvi, oziqlanish, nafas, ayirish, ta'sirlanish, harakat, ko'payish, o'sish-rivojlanish.|Faqat bittasi bor narsa tirik emas, **hammasi** birga bo'lishi kerak.`.split(`|`), q: `Robot yuradi, «ovqat» sifatida batareya oladi. Uni tirik deyish mumkinmi?`, a: `Yo'q: u ko'paymaydi, o'smaydi, nafas olmaydi, moddalar almashinuvi yo'q. Faqat ba'zi belgilarga o'xshaydi.` },
],
cards: [
 [`tf`, `Metabolizm`, `Tirik organizmdagi barcha moddalar almashinuvi`, true],
 [`tf`, `Avtotrof`, `Tayyor oziq bilan oziqlanadigan organizm`, false],
 [`tf`, `Geterotrof`, `Tayyor oziq bilan oziqlanadigan organizm`, true],
 [`tf`, `Assimilyatsiya`, `Moddalarning parchalanishi, energiya ajralishi`, false],
 [`tf`, `Dissimilyatsiya`, `Moddalarning parchalanishi, energiya ajralishi`, true],
 [`tf`, `O'sish`, `Sifat jihatdan o'zgarish`, false],
 [`tf`, `Rivojlanish`, `Sifat jihatdan o'zgarish`, true],
 [`type`, `Oziqni o'zi sintez qiladigan organizm`, `avtotrof`, [`avtotrof`]],
 [`type`, `Jinsiy ko'payishda ishtirok etadigan hujayralar`, `gameta`, [`gameta`, `gametalar`]],
 [`type`, `Kungaboqar quyoshga burilishi qanday harakat? (faol yoki ...)`, `passiv`, [`passiv`]],
 [`type`, `Zararli moddalarni tanadan chiqarish jarayoni`, `ayirish`, [`ayirish`]],
 [`tf`, `Jinssiz ko'payish`, `Ikkita organizm ishtirokida boradi`, false],
],
test: [
 [`Metabolizm nima?`, `Tirik organizmdagi moddalar almashinuvi`, [`Faqat nafas olish`, `Ko'payish usuli`, `Tashqi ta'sirga javob`], `Metabolizm – assimilyatsiya va dissimilyatsiya yig'indisi.`],
 [`Qaysi organizm avtotrof?`, `Yashil o'simlik`, [`Zamburug'`, `Quyon`, `Bo'ri`], `Yashil o'simlik oziqni quyosh nuridan o'zi hosil qiladi.`],
 [`Assimilyatsiya jarayonida nima sodir bo'ladi?`, `Yangi moddalar hosil bo'ladi, energiya sarflanadi`, [`Moddalar parchalanib energiya ajraladi`, `Zararli moddalar chiqariladi`, `Gametalar qo'shiladi`], `Assimilyatsiya – sintez, qurilish jarayoni.`],
 [`Dissimilyatsiyaga qaysi misol to'g'ri keladi?`, `Oqsil, yog' va uglevodlarning hazm qilinishi`, [`Oqsil biosintezi`, `Fotosintez`, `Urug'ning unib chiqishi`], `Hazm qilishda moddalar parchalanadi va energiya hosil bo'ladi.`],
 [`Tipratikanga qo'l tekkizilganda u yumaloqlanadi. Bu qaysi xususiyat?`, `Ta'sirlanish`, [`Ko'payish`, `Ayirish`, `O'sish`], `Tashqi ta'sirga javob – ta'sirlanish.`],
 [`Jinsiy ko'payishda nima ro'y beradi?`, `Ikki organizm ishtirok etadi va irsiy axborot almashinadi`, [`Bitta organizm ikkiga bo'linadi`, `Kurtak hosil bo'ladi`, `Faqat spora tarqaladi`], `Jinsiy ko'payishda gametalar qo'shiladi.`],
 [`Qaysi usul jinssiz ko'payishga kirmaydi?`, `Gametalar qo'shilishi`, [`Ikkiga bo'linish`, `Kurtaklanish`, `Spora bilan ko'payish`], `Gametalar jinsiy ko'payishda ishtirok etadi.`],
 [`Urug'dan ekilgan o'simlik poyasi yo'g'onlashib, gullab meva berdi. Bu nima?`, `Rivojlanish`, [`Faqat o'sish`, `Ayirish`, `Harakatlanish`], `Rivojlanish – sifat o'zgarishi.`],
 [`Hayvonlardan farqli, o'simliklardagi harakat qanday?`, `Passiv`, [`Faol`, `Tez`, `Umuman bo'lmaydi`], `Masalan, barglar yorug'likka buriladi.`],
 [`Quyidagilardan qaysi biri geterotrof?`, `Zamburug'`, [`Olma daraxti`, `Lola`, `Bug'doy`], `Zamburug'lar tayyor organik moddalar bilan oziqlanadi.`],
],
rev: [
 [`Hayvonning ovqatni hazm qilish jarayonini qaysi fan o'rganadi va bu tirik organizmning qaysi xususiyatiga tegishli?`, `Fiziologiya; moddalar almashinuvi`, [`Anatomiya; ko'payish`, `Botanika; ta'sirlanish`, `Sistematika; nafas olish`], `Jarayonni fiziologiya o'rganadi, hazm qilish esa moddalar almashinuvining bir qismi.`],
 [`Botanika qaysi organizmlarni o'rganadi va ular qanday oziqlanadi (yashil qismlari bo'yicha)?`, `O'simliklarni; ko'pchiligi avtotrof`, [`Hayvonlarni; geterotrof`, `Zamburug'larni; avtotrof`, `Bakteriyalarni; hammasi avtotrof`], `Yashil o'simliklar oziqni o'zi hosil qiladi.`],
 [`Zoologiya hayvonlarni o'rganadi. Quyonning o't yeyishi tirik organizmning qaysi xususiyatiga tegishli va u qaysi usulda oziqlanadi?`, `Oziqlanish; geterotrof`, [`Ko'payish; avtotrof`, `Ta'sirlanish; avtotrof`, `Ayirish; geterotrof`], `Quyon tayyor oziq (o't) bilan oziqlanadi, ya'ni geterotrof.`],
 [`Ekolog cho'ldagi o'simlikning issiqqa javobini o'rganmoqda. Bu qaysi xususiyatga yaqin?`, `Ta'sirlanish`, [`Ko'payish`, `Jinsiy ko'payish`, `Assimilyatsiya`], `Muhit ta'siriga javob – ta'sirlanish.`],
 [`Genetika qaysi tirik xususiyat bilan eng bog'liq?`, `Ko'payish – irsiy axborot avlodga o'tishi`, [`Nafas olish`, `Ayirish`, `Harakatlanish`], `Irsiyat nasl qoldirish bilan bog'liq.`],
 [`Sitologlar hujayra ichida energiya ajralishi jarayonini o'rganmoqda. U qaysi qismga to'g'ri keladi?`, `Dissimilyatsiya`, [`Assimilyatsiya`, `Rivojlanish`, `Passiv harakat`], `Energiya ajralishi parchalanish (dissimilyatsiya) bilan bog'liq.`],
 [`Nima uchun bitta belgi (masalan, harakat) bilan organizmni tirik deb bo'lmaydi?`, `Tirik bo'lish uchun barcha belgilar birga bo'lishi kerak`, [`Chunki harakat faqat o'simlikda bo'ladi`, `Chunki tirik narsa harakat qilmaydi`, `Chunki belgilar faqat bakteriyada bor`], `Masalan, bulut ham «harakat» qiladi, lekin tirik emas.`],
 [`Sistematika organizmlarni guruhlaydi. Quyidagi belgilardan qaysi biri guruhlash uchun oqilona asos?`, `Oziqlanish usuli (avtotrof yoki geterotrof)`, [`Rangining chiroyligi`, `Qaysi odamga yoqishi`, `Nomining uzunligi`], `Guruhlash o'xshash muhim belgilarga asoslanadi.`],
] },

{ n: 3, ch: 1, title: `Biologiyaning o'rganish usullari`,
doc: `## Olimlar tirik tabiatni qanday o'rganadi?

To'rtta asosiy usul bor.

1. **Kuzatish** – eng qadimgi usul. Ko'rish, eshitish, his qilish orqali, tabiatga **aralashmasdan** ma'lumot yig'iladi. Masalan, qush uyasi oldida kuzatish. Hozir videokamera va chip ham ishlatiladi.
2. **Taqqoslash** – ikki organizm solishtirilib, o'xshash va farqli tomonlari topiladi. Masalan, oq va qo'ng'ir ayiq: ikkalasi ham tirik, nafas oladi (o'xshash), lekin yashash joyi va rangi boshqa (farq).
3. **Tarixiy usul** – qadimda yashagan organizmlar hozirgilar bilan solishtiriladi. Paleontologlar: ot qadimda tulkidek yirtqich bo'lgan, keyin oyoqlari uzayib, tuyoqli, o't yeydigan tez chopuvchiga aylangan.
4. **Tajriba** – organizm uchun maxsus sharoit yaratilib, o'zgarishi o'rganiladi. Masalan, oq gulni bo'yoqli suvga solib, 2 soatdan keyin rangi o'zgarganini ko'rish.

## Redi tajribasi (XVII asr)
Redi uchta idishga go'sht qo'ydi: birinchisi ochiq, ikkinchisi zich yopiq, uchinchisi doka bilan yopiq. Faqat ochiq idishda qurt va pashsha paydo bo'ldi. **Xulosa:** qurtlar go'shtdan o'z-o'zidan chiqmaydi, ularni pashsha tuxum qo'ygani uchun paydo bo'ladi.

## Lupa va mikroskop
- **Lupa** – eng sodda asbob, 2–20 marta kattalashtiradi.
- **Mikroskop** – juda kichik narsalarni ko'rsatadi. Kattalashtirish = okulyar × obyektiv. Masalan, 10 × 20 = 200 marta.
- Mikroskopda ishlash: avval kichik obyektivda, keyin kattasida qarang; makrovint bilan tasvirni topib, mikrovint bilan tiniqlashtiring.`,
slides: [
 { h: `Savol tug'ilganda...`, ic: `🤔`, p: `Qush uyasini qanday qurishi qiziq. Qanday aniqlaymiz?|Tabiatda nimadir noma'lum bo'lsa, olim uni to'rt yo'ldan biri bilan tekshiradi.|Bu yo'llar – o'rganish usullari.`.split(`|`) },
 { h: `1-usul: Kuzatish`, ic: `👀`, p: `Tabiatga aralashmaymiz, faqat ko'ramiz, eshitamiz va yozib boramiz.|Eng qadimgi usul.|Hozir videokamera va kuzatuv chipi ham yordam beradi.`.split(`|`), q: `Nima uchun yovvoyi qushni kuzatganda uyasiga tegmaslik kerak?`, a: `Tegsak, qush bezovta bo'ladi va xulq-atvori tabiiy bo'lmay qoladi – ma'lumot noto'g'ri chiqadi.` },
 { h: `2-usul: Taqqoslash`, ic: `⚖️`, p: `Ikkita narsani yonma-yon qo'yamiz: nimasi o'xshash, nimasi farq?|Oq va qo'ng'ir ayiq: ikkalasi ham tirik, nafas oladi (o'xshash), ammo yashash joyi va rangi boshqa (farq).`.split(`|`), q: `Mushuk va it nimasi bilan o'xshash va nimasi bilan farq qiladi?`, a: `O'xshash: sut emizuvchi, junli, 4 oyoqli. Farq: oziqlanishi, ovozi, xulqi, tirnoqlari.` },
 { h: `3-usul: Tarixiy usul`, ic: `🦴`, p: `Qadimgi jonzotlar qoldiqlarini hozirgilar bilan solishtiramiz.|Ot qadimda tulkidek yirtqich bo'lgan. Zamonlar o'tib oyoqlari uzaydi, tuyoq paydo bo'ldi, o'tni yeydigan bo'ldi.|Shunday qilib, organizmlar qanchalik o'zgarganini bilamiz.`.split(`|`), q: `Otning uzun oyoqlari unga qanday foyda beradi?`, a: `Tez chopib dushmandan qochadi va ozuqa uchun uzoq masofani tez bosib o'tadi.` },
 { h: `4-usul: Tajriba`, ic: `🧪`, p: `Biz sharoitni **o'zimiz** yaratamiz va natijani kuzatamiz.|Oq gulni bo'yoqli suvga solamiz. 2 soatdan keyin guli rangi o'zgaradi.|Xulosa: o'simlik suvni poyasi orqali tortadi.`.split(`|`), q: `Tajribada nega bitta guldan emas, bir nechta guldan foydalangan yaxshi?`, a: `Natija tasodif emasligiga ishonch hosil qilish uchun. Takrorlangan natija ishonchliroq.` },
 { h: `Redi tajribasi`, ic: `🍖`, p: `3 ta idish, hammasida go'sht: **ochiq**, **zich yopiq**, **doka bilan yopiq**.|Faqat ochiq idishda qurt va pashsha chiqdi.|Doka havoni o'tkazadi, lekin pashshani to'sadi.`.split(`|`), q: `Bu tajribadan qanday xulosa chiqadi? Qaysi usullar ishlatilgan?`, a: `Qurtlar go'shtdan o'zi paydo bo'lmaydi, pashsha tuxum qo'ygani uchun chiqadi. Tajriba va kuzatish usullari ishlatilgan.` },
 { h: `Lupa va mikroskop`, ic: `🔍`, p: `Lupa 2–20 marta kattalashtiradi. Tarvuz mag'zini lupada ko'rsak, yumaloq hujayralar sezila boshlaydi.|Mikroskop undan ham kuchli.|**Kattalashtirish = okulyar × obyektiv.** 10 × 20 = 200 marta.`.split(`|`), q: `Okulyar 10, obyektiv 40 bo'lsa, mikroskop necha marta kattalashtiradi?`, a: `10 × 40 = 400 marta.` },
 { h: `Mikroskopda ishlash tartibi`, ic: `🔬`, p: `1. Mikroskopni stol chetidan 3–4 sm ichkariga qo'ying.|2. Ko'zguni yorug'likka qarating.|3. Preparatni stolchaga qo'yib, qisqich bilan qotiring.|4. Avval **kichik obyektivda**, keyin kattasida qarang.|5. Makrovintda tasvirni toping, mikrovintda tiniqlashtiring.|6. Ishdan keyin artib, joyiga qo'ying.`.split(`|`), q: `Nega avval kichik obyektivda qaraladi?`, a: `Maydon kengroq, preparatni topish oson va obyektiv preparatga tegib, oynani sindirib qo'ymaydi.` },
],
cards: [
 [`tf`, `Kuzatish usuli`, `Tabiiy holatga ta'sir qilmagan holda ma'lumot to'plash`, true],
 [`tf`, `Taqqoslash usuli`, `Qadimgi organizmlarni hozirgilari bilan solishtirish`, false],
 [`tf`, `Tarixiy usul`, `Qadimgi organizmlarni hozirgilari bilan solishtirish`, true],
 [`tf`, `Tajriba usuli`, `Organizm uchun maxsus sharoit yaratib, o'zgarishini o'rganish`, true],
 [`tf`, `Lupa`, `Juda murakkab, 2000 marta kattalashtiradigan asbob`, false],
 [`tf`, `Mikroskopning kattalashtirishi`, `Okulyar va obyektiv ko'rsatkichlarining ko'paytmasi`, true],
 [`type`, `Eng qadimgi o'rganish usuli`, `kuzatish`, [`kuzatish`, `kuzatish usuli`]],
 [`type`, `Redi tajribasida qaysi hasharot paydo bo'ldi? (bir so'z)`, `pashsha`, [`pashsha`]],
 [`type`, `Eng sodda kattalashtiruvchi asbob`, `lupa`, [`lupa`]],
 [`type`, `Mikroskopda tasvirni topish uchun burab ko'tariladigan/tushiriladigan vint`, `makrovint`, [`makrovint`]],
 [`type`, `Okulyar 10, obyektiv 20 bo'lsa necha marta kattalashadi? (raqam)`, `200`, [`200`]],
 [`tf`, `Redi tajribasi`, `Qurtlar go'shtdan o'z-o'zidan paydo bo'ladi, deb isbotladi`, false],
],
test: [
 [`Tabiiy holatga ta'sir qilmay, sezgi organlari orqali ma'lumot to'plash qaysi usul?`, `Kuzatish`, [`Tajriba`, `Taqqoslash`, `Tarixiy usul`], `Kuzatishda tabiatga aralashilmaydi.`],
 [`Oq va qo'ng'ir ayiqning o'xshash va farqli tomonlarini aniqlash qaysi usulda amalga oshadi?`, `Taqqoslash`, [`Kuzatish`, `Tarixiy usul`, `Tajriba`], `Ikki organizm o'zaro solishtiriladi.`],
 [`Otlarning qadimgi ajdodlari haqida ma'lumot olish uchun qaysi usul kerak?`, `Tarixiy usul`, [`Kuzatish`, `Tajriba`, `Taqqoslash`], `Tarixiy usulda qadimgi va hozirgi organizmlar solishtiriladi.`],
 [`Oq gulning bo'yoqli suvda rangi o'zgarishini tekshirish qaysi usulga kiradi?`, `Tajriba`, [`Kuzatish`, `Tarixiy usul`, `Taqqoslash`], `Sharoit maxsus yaratiladi.`],
 [`Redi tajribasida nega faqat ochiq idishda qurt paydo bo'ldi?`, `Pashsha faqat ochiq idishga tuxum qo'ya oldi`, [`Faqat ochiq idishdagi go'sht yangi edi`, `Yopiq idishda go'sht yo'q edi`, `Qurtlar havosiz tug'ilmaydi`], `Pashsha yopiq va doka bilan to'silgan idishga tuxum qo'ya olmadi.`],
 [`Redi tajribasidagi doka bilan yopilgan idish nimani isbotlashga yordam berdi?`, `Havo kirsa ham, pashsha kirmasa qurt chiqmaydi`, [`Qurt faqat havosiz joyda chiqadi`, `Doka go'shtni buzadi`, `Pashsha dokani yeydi`], `Havo kirgan bo'lsa ham, pashsha kirmaganligi sababli qurt chiqmadi.`],
 [`Qo'l lupasi buyumni necha marta kattalashtiradi?`, `2–20 marta`, [`100–200 marta`, `1000 marta`, `2000 marta`], `Lupa – eng sodda asbob.`],
 [`Okulyar 10, obyektiv 40 bo'lgan mikroskop necha marta kattalashtiradi?`, `400`, [`50`, `4`, `140`], `10 × 40 = 400.`],
 [`Mikroskopda preparat dastlab qaysi obyektivda ko'riladi?`, `Kichik obyektivda`, [`Katta obyektivda`, `Ikkalasida bir vaqtda`, `Obyektivsiz`], `Kichik obyektivda qaralib, keyin kattasiga o'tiladi.`],
 [`Tasvirni tiniqlashtirish uchun mikroskopning qaysi qismidan foydalaniladi?`, `Mikrovint`, [`Ko'zgu`, `Qisqich`, `Shtativ`], `Mikrovint tasvirni tiniqlashtiradi.`],
],
rev: [
 [`Zoolog suvsarning uyasi oldida kuzatuv olib bormoqda va uni boshqa hayvon bilan solishtirmoqda. U qaysi usullardan foydalanyapti?`, `Kuzatish va taqqoslash`, [`Tajriba va tarixiy usul`, `Faqat tajriba`, `Faqat tarixiy usul`], `Kuzatish – ma'lumot yig'ish, taqqoslash – solishtirish.`],
 [`Botanik oq gulni bo'yoq eritmasiga solib, 2 soatdan keyin rangini kuzatdi. Bu qaysi usul va qaysi xususiyatni tekshirish uchun?`, `Tajriba; o'simlikning suv tortishi`, [`Kuzatish; ko'payish`, `Tarixiy usul; harakat`, `Taqqoslash; nafas olish`], `Sharoit yaratib, o'simlikning moddalar tashishini ko'ramiz.`],
 [`Mikologiya zamburug'larni o'rganadi. Zamburug' sporasini ko'rish uchun qaysi asbob kerak?`, `Mikroskop`, [`Faqat lupa`, `Pinset`, `Skalpel`], `Spora juda kichik, mikroskop kerak.`],
 [`Paleontolog qadimgi hayvon suyagini hozirgi hayvon suyagi bilan solishtirdi. U qaysi ikki usulni qo'lladi?`, `Tarixiy va taqqoslash`, [`Tajriba va kuzatish`, `Faqat kuzatish`, `Faqat tajriba`], `Qadimgi bilan hozirgini solishtirish – tarixiy usul, solishtirishning o'zi – taqqoslash.`],
 [`Redi tajribasida pashsha go'shtga tuxum qo'ydi, tuxumdan qurt chiqdi. Bu tirik organizmning qaysi xususiyatiga misol?`, `Ko'payish (pashsha tuxum qo'ygan)`, [`Nafas olish`, `Ayirish`, `Ta'sirlanish`], `Pashsha ko'payib tuxum qo'yadi, undan qurt chiqadi.`],
 [`Hayvonlarning qanday oziqlanishini mikroskopda ko'rib bo'lmaydi, uni qaysi usul bilan o'rganish qulay?`, `Kuzatish`, [`Faqat mikroskop`, `Faqat tarixiy usul`, `Hech qaysi usul`], `Odatda yirik hayvonlarning oziqlanishi kuzatish bilan o'rganiladi.`],
 [`Fiziologiya jarayonlarni o'rganadi. Quyidagilardan qaysi biri o'rganishda ko'proq tajriba usulini talab qiladi?`, `Issiqlikda o'simlik transpiratsiyasi qanday o'zgarishi`, [`Qadimgi otning tuzilishi`, `Qushlarning ko'chib o'tishi`, `Ayiqning rangi`], `Sharoit o'zgartirilib, natija o'lchanadi.`],
 [`Olim nima uchun tajribani bir necha marta takrorlaydi?`, `Natija tasodif emasligini tekshirish uchun`, [`Vaqtni o'tkazish uchun`, `Idishlarni ko'paytirish uchun`, `Kuzatish usulini almashtirish uchun`], `Takrorlangan natija ishonchli bo'ladi.`],
] },

{ n: 4, ch: 1, title: `Hujayra – tiriklikning asosi`,
doc: `## Hujayra nima?

**Hujayra** – tiriklikning eng kichik birligi. Har qanday tirik organizm hujayradan tuzilgan. Hujayralarning shakli bajaradigan ishiga bog'liq:
- eritrotsit (qizil qon tanachasi) – kislorod tashiydi, ikki tomoni botiq;
- leykotsit – soxta oyoqlar hosil qilib, organizmni mikroblardan himoya qiladi;
- barg og'izchasi hujayrasi – loviyasimon, suv bug'latadi va gaz almashtiradi;
- nerv hujayrasi – uzun va kalta o'simtalari bor, signal (nerv impulsi) o'tkazadi.

## Ikki xil hujayra
- [[Prokariotlar|yadrosi shakllanmagan organizmlar]]: bakteriyalar va ko'k-yashil suvo'tlar.
- [[Eukariotlar|yadrosi yaxshi shakllangan organizmlar]]: zamburug'lar, o'simliklar, hayvonlar.

## Eukariot hujayra uchta asosiy qismdan iborat
1. **Sitoplazmatik membrana** – hujayrani o'rab himoya qiladi, kerakli moddalarni tanlab o'tkazadi.
2. **Sitoplazma** – ichki suyuqlik; unda vazifalari turlicha [[organoidlar|sitoplazmadagi doimiy tuzilmalar, har biri o'z ishini bajaradi]] joylashgan.
3. **Yadro** – eng muhim qism: irsiy axborotni saqlaydi va moddalar almashinuvini boshqaradi.

## O'simlik va hayvon hujayrasi
**Umumiy:** membrana, sitoplazma, yadro.
**Faqat o'simlikda:** sellyuloza qobiq (mustahkamlik beradi), plastidalar, hujayra shirali yirik vakuola.
**Faqat hayvonda:** yupqa qobiq, qisqaruvchi va hazm qiluvchi mayda vakuolalar.

[[Plastida|faqat o'simlik hujayrasidagi organoid]] 3 xil: **xloroplast** (yashil; yosh poya va barglarda), **xromoplast** (rangli; gul va mevada), **leykoplast** (rangsiz; ildiz va urug'da). Pomidor dastlab yashil (xloroplast), keyin oqaradi (leykoplast), so'ng qizaradi (xromoplast).

Vakuola shirasida 70–95% suv bor. Organik kislota ko'p bo'lsa – meva nordon, uglevod ko'p bo'lsa – shirin.

## Hujayradan organizmgacha
Hujayralar → [[to'qima|bir xil vazifani bajaruvchi hujayralar yig'indisi]] → organ → organizm.`,
slides: [
 { h: `Eng kichik g'isht`, ic: `🧱`, p: `Uy g'ishtdan quriladi. Tirik organizm esa **hujayradan**.|Hujayra – tiriklikning eng kichik birligi.|Ko'pchilik hujayra ko'zga ko'rinmaydi, mikroskop kerak.`.split(`|`), q: `Hujayra juda kichik bo'lsa, nega organizm katta bo'lishi mumkin?`, a: `Chunki organizmda milliardlab hujayra bor, ular birgalikda ishlaydi.` },
 { h: `Shakl – vazifaga qarab`, ic: `🔴`, p: `**Eritrotsit** – ikki tomoni botiq, kislorod tashiydi.|**Leykotsit** – soxta oyoqlari bor, mikrobni ushlaydi.|**Barg og'izchasi** – loviyasimon, suv bug'latadi.|**Nerv hujayrasi** – uzun o'simtalari bor, signal o'tkazadi.`.split(`|`), q: `Nerv hujayrasi nega uzun o'simtalarga ega?`, a: `Signalni uzoq masofaga tez yetkazish uchun, xuddi sim kabi.` },
 { h: `Ikki oila: prokariot va eukariot`, ic: `👪`, p: `**Prokariot** – yadrosi alohida shakllanmagan (bakteriyalar, ko'k-yashil suvo'tlar).|**Eukariot** – yadrosi aniq shakllangan (zamburug', o'simlik, hayvon).|Pro – oldin, eu – chin. Yadro «chin» bo'lsa – eukariot.`.split(`|`), q: `Odam qaysi guruhga kiradi?`, a: `Eukariotlar: odam hujayralarida yadro aniq shakllangan.` },
 { h: `Hujayrada uchta asosiy qism`, ic: `🏠`, p: `**Membrana** – devor va darvoza: himoya qiladi, kerakli narsani kiritadi.|**Sitoplazma** – xona: ichida organoidlar «ishlaydi».|**Yadro** – boshqaruv xonasi: irsiy axborotni saqlaydi, ishni boshqaradi.`.split(`|`), q: `Agar yadro yo'qolsa nima bo'ladi?`, a: `Hujayra boshqaruvdan mahrum bo'ladi va irsiy axborot saqlanmaydi, hujayra ishdan chiqadi.` },
 { h: `O'simlik va hayvon hujayrasi`, ic: `🌿🐾`, p: `**Ikkalasida bor:** membrana, sitoplazma, yadro.|**Faqat o'simlikda:** sellyuloza qobiq, plastidalar, yirik vakuola.|**Faqat hayvonda:** yupqa qobiq, qisqaruvchi va hazm qiluvchi mayda vakuola.`.split(`|`), q: `Nega o'simlikka sellyuloza qobiq kerak, hayvonga esa shart emas?`, a: `O'simlik joyida turadi, shuning uchun mustahkam «suyak»siz qolmaydi. Hayvonda tayanch suyak, bo'g'imlar va mushaklar bor.` },
 { h: `Plastidalar – o'simlik ranglari`, ic: `🍅`, p: `**Xloroplast** – yashil (barg, yosh poya).|**Xromoplast** – rangli: sariq, qizil (gul, meva).|**Leykoplast** – rangsiz (ildiz, urug').|Pomidor: yashil → oq → qizil. Plastidalar bir-biriga aylanishi mumkin.`.split(`|`), q: `Kuzda barg nega sarg'ayadi?`, a: `Yashil xloroplast o'zgarib, sariq xromoplastga aylanadi. Shu sababli rangi o'zgaradi.` },
 { h: `Vakuola va meva ta'mi`, ic: `🍋`, p: `O'simlik vakuolasi hujayra shirasi bilan to'la (70–95% suv).|Organik kislota ko'p – **nordon** (limon).|Uglevod ko'p – **shirin** (uzum).|Hayvonda vakuola mayda va kattalasha olmaydi.`.split(`|`), q: `Olma pishgan sayin nega shirinlashadi?`, a: `Vakuolada kislota kamayib, uglevodlar ko'payadi.` },
 { h: `Hujayradan organizmgacha`, ic: `🌳`, p: `**Hujayra** → **to'qima** (bir xil ishni bajaruvchi hujayralar) → **organ** (ildiz, barg) → **organizm**.|Zarang daraxti – organizm; barg – organ; barg to'qimalari – qoplovchi, o'tkazuvchi, asosiy.`.split(`|`), q: `Yurak – hujayra, to'qima, organ yoki organizm?`, a: `Organ (mushak to'qimasi va boshqa to'qimalardan tuzilgan).` },
 { h: `Piyoz po'sti tajribasi`, ic: `🧅`, p: `Piyozni to'rtga bo'lamiz, yupqa po'stini suv tomchisiga qo'yamiz, yod tomizamiz, qoplag'ich oyna bilan yopamiz.|Mikroskopda: zich silindrsimon hujayralar, sitoplazma, vakuola, yadro va sellyuloza qobiq ko'rinadi.|Yod yadro va sitoplazmani bo'yab ko'rsatadi.`.split(`|`), q: `Hujayra qobig'idagi teshikchalar nima uchun kerak?`, a: `Suv va mineral moddalar bir hujayradan ikkinchisiga shu teshikchalar orqali o'tadi.` },
],
cards: [
 [`tf`, `Hujayra`, `Tiriklikning eng kichik birligi`, true],
 [`tf`, `Prokariot`, `Yadrosi yaxshi shakllangan organizm`, false],
 [`tf`, `Eukariot`, `Yadrosi yaxshi shakllangan organizm`, true],
 [`tf`, `Xloroplast`, `Rangsiz plastida, ildiz va urug'da uchraydi`, false],
 [`tf`, `Leykoplast`, `Rangsiz plastida, ildiz va urug'da uchraydi`, true],
 [`tf`, `Sellyuloza qobiq`, `O'simlik hujayrasiga mustahkamlik beradi`, true],
 [`tf`, `Hayvon hujayrasi`, `Katta vakuola va sellyuloza qobiqqa ega`, false],
 [`tf`, `To'qima`, `Bir xil vazifani bajaruvchi hujayralar yig'indisi`, true],
 [`type`, `Hujayraning irsiy axborotni saqlovchi qismi`, `yadro`, [`yadro`]],
 [`type`, `Hujayrani o'rab turuvchi, moddalarni tanlab o'tkazuvchi qism`, `membrana`, [`membrana`, `sitoplazmatik membrana`]],
 [`type`, `Yashil plastida nomi`, `xloroplast`, [`xloroplast`]],
 [`type`, `Bakteriyalar qaysi guruhga kiradi? (yadrosi shakllanmagan)`, `prokariot`, [`prokariot`, `prokariotlar`]],
],
test: [
 [`Hujayra nima?`, `Tiriklikning eng kichik birligi`, [`Faqat o'simlikning bir qismi`, `Faqat hayvonning bir qismi`, `Faqat mikroskopda ko'rinadigan modda`], `Har bir tirik organizm hujayradan tuzilgan.`],
 [`Qizil qon tanachasi (eritrotsit) qanday vazifani bajaradi?`, `Kislorod tashiydi`, [`Mikroblarni yutadi`, `Signal o'tkazadi`, `Suv bug'latadi`], `Eritrotsitlar kislorod tashishda ishtirok etadi.`],
 [`Yadrosi shakllanmagan organizmlar qanday ataladi?`, `Prokariotlar`, [`Eukariotlar`, `Autotroflar`, `Plastidalar`], `Prokariotlarda yadro shakllanmagan.`],
 [`Quyidagilardan qaysi biri eukariot?`, `Zamburug'`, [`Bakteriya`, `Ko'k-yashil suvo'ti`, `Hech biri`], `Zamburug', o'simlik va hayvonlar eukariot.`],
 [`Hujayraning irsiy axborotni saqlovchi va moddalar almashinuvini boshqaruvchi qismi qaysi?`, `Yadro`, [`Membrana`, `Sitoplazma`, `Vakuola`], `Yadro – hujayraning eng muhim qismi.`],
 [`Faqat o'simlik hujayrasiga xos belgi qaysi?`, `Plastidalar`, [`Yadro`, `Sitoplazma`, `Membrana`], `Plastidalar faqat o'simlikda uchraydi.`],
 [`Xromoplastlar qayerda uchraydi?`, `Gul va mevada`, [`Ildizda`, `Urug'da`, `Faqat yosh poyada`], `Xromoplast rangli plastida (sariq, qizil).`],
 [`Meva nordon bo'lishi nimaga bog'liq?`, `Vakuolada organik kislotalar ko'pligiga`, [`Vakuolada uglevod ko'pligiga`, `Yadro kattaligiga`, `Sellyuloza qobiq qalinligiga`], `Kislota ko'p – nordon, uglevod ko'p – shirin.`],
 [`Hayvon hujayrasidagi qisqaruvchi vakuola qanday ish qiladi?`, `Ortiqcha suyuqlikni chiqarib yuboradi`, [`Oziqni hazm qiladi`, `Irsiy axborot saqlaydi`, `Yorug'likni yutadi`], `Hazm qiluvchi vakuola esa oziq moddalarni parchalaydi.`],
 [`Bir xil vazifani bajaruvchi hujayralar yig'indisi nima deyiladi?`, `To'qima`, [`Organ`, `Organizm`, `Organoid`], `To'qimalar organni, organlar organizmni hosil qiladi.`],
],
rev: [
 [`Sitologiya hujayrani o'rganadi. Bu fan o'simlik va hayvon hujayrasi orasidagi qaysi farqni o'rganishi mumkin?`, `Sellyuloza qobiq va plastidalarning bo'lishini`, [`Yadroning mavjudligini`, `Membranani`, `Sitoplazmani`], `Yadro, membrana va sitoplazma ikkalasida ham bor.`],
 [`Metabolizm hujayrada boradi. Moddalar almashinuvini hujayraning qaysi qismi boshqaradi?`, `Yadro`, [`Membrana`, `Sellyuloza qobiq`, `Xromoplast`], `Yadro moddalar almashinuvini ham boshqaradi.`],
 [`Avtotrof o'simlik hujayrasida quyosh nuridan oziq hosil qilishda qaysi plastida muhim?`, `Xloroplast`, [`Leykoplast`, `Xromoplast`, `Qisqaruvchi vakuola`], `Yashil xloroplast yorug'likdan foydalanadi.`],
 [`Mikroskopda piyoz po'sti ko'rilganda hujayra tuzilishini ko'rish uchun qaysi usul va asbob kerak?`, `Kuzatish va mikroskop`, [`Tarixiy usul va lupa`, `Tajriba va pinset`, `Taqqoslash va skalpel`], `Mikropreparat mikroskopda kuzatiladi.`],
 [`Bakteriya hujayrasi prokariot ekanligini nimadan bilamiz?`, `Yadrosi aniq shakllanmaganidan`, [`Sellyuloza qobig'i borligidan`, `Xloroplast borligidan`, `Rangi yashil ekanidan`], `Prokariot – yadrosi shakllanmagan.`],
 [`Tirik organizmning ko'payish xususiyati hujayra qismlaridan qaysisi bilan eng bog'liq?`, `Yadro (irsiy axborot)`, [`Sellyuloza qobiq`, `Vakuola shirasi`, `Leykoplast`], `Irsiy axborot yadroda saqlanadi va avlodga o'tadi.`],
 [`O'simlikdagi moddalar o'tkazuvchi to'qima qaysi darajaga kiradi va nimadan iborat?`, `To'qima: bir xil vazifali hujayralardan`, [`Organizm: bitta hujayradan`, `Organoid: bitta organdan`, `Hujayra: bir nechta to'qimadan`], `To'qima – hujayralar yig'indisi.`],
 [`Mikroskopda piyoz hujayrasi: sellyuloza qobiqning teshikchalari qanday vazifa bajaradi?`, `Suv va mineral moddalarni hujayralar orasida o'tkazadi`, [`Yorug'likni yutadi`, `Irsiy axborotni saqlaydi`, `Ovqatni hazm qiladi`], `Teshikchalar orqali moddalar o'tadi.`],
] },
]
