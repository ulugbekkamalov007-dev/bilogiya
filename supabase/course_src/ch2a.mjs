// 2-BOB (1-qism): 5–7-§
export default [
{ n: 5, ch: 2, title: `Tirik organizmlar haqida umumiy ma'lumot`,
doc: `## Tirik dunyo qanday guruhlarga bo'linadi?

Tirik organizmlar juda xilma-xil. Hammasi nafas oladi, oziqlanadi, ko'payadi, o'sadi, lekin hujayrasi, kattaligi va oziqlanish usuli bilan farq qiladi. Ular to'rt dunyoga bo'linadi:

| Dunyo | Hujayrasi | Oziqlanishi | Harakati |
|---|---|---|---|
| Bakteriyalar | prokariot | asosan geterotrof | – |
| Zamburug'lar | eukariot | geterotrof | erkin harakat qilmaydi |
| O'simliklar ([[flora|o'simlik dunyosi]]) | eukariot | avtotrof (fotosintez) | erkin harakat qilmaydi |
| Hayvonlar ([[fauna|hayvonot dunyosi]]) | eukariot | geterotrof | erkin harakat qiladi |

- **Bakteriyalar** faqat mikroskopda ko'rinadi. Ular har yerda: sil tayoqchasi, achituvchi va chirituvchi bakteriyalar.
- **Zamburug'lar** ingichka ipchalar – [[gifa|zamburug' tanasini hosil qiluvchi ingichka ip]]lar bilan tuproqqa birikadi. Mikroskopik achitqidan yirik qo'ziqorinlargacha bor.
- **O'simliklar** yashil xlorofill yordamida [[fotosintez|o'simlik karbonat angidrid yutib, kislorod ajratadi va organik modda hosil qiladi]] qiladi.
- **Hayvonlar** nerv sistemasi va sezgi organlari (ko'rish, eshitish, ta'm bilish) orqali muhitdan axborot olib, unga javob beradi.

## Viruslar – chegaradagi mavjudot
[[Virus|hayotning hujayrasiz shakli]] hujayradan tashqarida tiriklik belgilarini ko'rsatmaydi. U hujayra ichiga kirgandagina ko'payadi va hujayrani nobud qiladi. Har bir virus o'ziga xos hujayrani tanlaydi: gepatit – jigar, gripp – nafas yo'llari, quturish – hayvonlar. Bakteriyada **bakteriofag**, o'simlikda **tamaki mozaikasi**, hayvonda **quturish virusi** parazitlik qiladi.

**Gripp:** harorat ko'tariladi, ishtaha pasayadi, holsizlik bo'ladi. Ko'p suyuqlik ichish va shifokorga murojaat qilish kerak.`,
slides: [
 { h: `Tirik dunyoni tartibga solamiz`, ic: `🗂️`, p: `Dunyoda millionlab tirik tur bor.|Kutubxonada kitoblar mavzusiga qarab javonlarga terilgani kabi, olimlar tirik organizmlarni **to'rt katta guruhga** ajratgan.|Bakteriyalar, zamburug'lar, o'simliklar, hayvonlar.`.split(`|`), q: `Nima uchun guruhlarga bo'lish kerak?`, a: `Bunda har bir organizmni topish, o'rganish va bir-biri bilan solishtirish oson bo'ladi.` },
 { h: `Bakteriyalar: ko'zga ko'rinmas qo'shnilarimiz`, ic: `🦠`, p: `Prokariot, ya'ni yadrosi shakllanmagan.|Asosan geterotrof.|Atrofimizda doim bor, lekin faqat mikroskopda ko'rinadi.`.split(`|`) },
 { h: `Zamburug'lar: o'simlik ham, hayvon ham emas`, ic: `🍄`, p: `Eukariot, erkin harakat qilmaydi, geterotrof.|Tuproqqa ingichka ipchalar – **gifalar** bilan birikadi.|Achitqidan tortib qo'ziqorinlargacha.`.split(`|`), q: `Zamburug' o'simlikka o'xshaydi, nega o'simlik emas?`, a: `Chunki u yashil emas, fotosintez qilmaydi, tayyor oziq bilan oziqlanadi (geterotrof).` },
 { h: `O'simliklar: yashil «fabrika»`, ic: `🌿`, p: `Flora – o'simlik dunyosi.|Xlorofill yordamida **fotosintez**: karbonat angidrid → kislorod va organik modda.|Erkin harakat qilmaydi, avtotrof.`.split(`|`), q: `O'simliklar bo'lmasa, havo kislorodiga nima bo'ladi?`, a: `Kislorod kamayib ketadi, chunki uni asosan o'simliklar ajratadi.` },
 { h: `Hayvonlar: harakatchan sezgirlar`, ic: `🦊`, p: `Fauna – hayvonot dunyosi.|Erkin harakatlanadi, geterotrof.|Nerv sistemasi va sezgi organlari bor: ko'radi, eshitadi, ta'm biladi va javob qaytaradi.`.split(`|`), q: `Hayvonga nega nerv sistemasi kerak?`, a: `Tashqaridan ma'lumot (xavf, oziq) olib, tez va to'g'ri javob berish uchun.` },
 { h: `Viruslar – oraliq mavjudot`, ic: `🧬`, p: `Hujayrasiz!|Hujayradan tashqarida tirik belgilarni ko'rsatmaydi.|Hujayraga kirsa – ko'payadi, hujayrani nobud qiladi.|Bu jonsiz va jonli tabiat orasidagi chegara.`.split(`|`), q: `Virus nega mustaqil yashay olmaydi?`, a: `Uning o'z moddalar almashinuvi yo'q, ko'payish uchun hujayra oziqiga muhtoj.` },
 { h: `Virus kimni tanlaydi?`, ic: `🎯`, p: `Gepatit – jigar hujayralari.|Gripp va koronavirus – nafas yo'llari.|Gerpes – lab epiteliysi.|Bakteriyada – bakteriofag; o'simlikda – tamaki mozaikasi; hayvonda – quturish.`.split(`|`), q: `Gripp bo'lganda nima qilish kerak?`, a: `Ko'p suyuqlik ichish, dam olish va shifokorga murojaat qilish.` },
],
cards: [
 [`tf`, `Flora`, `O'simlik dunyosi`, true],
 [`tf`, `Fauna`, `O'simlik dunyosi`, false],
 [`tf`, `Bakteriyalar`, `Yadrosi shakllangan eukariot organizmlar`, false],
 [`tf`, `Zamburug'lar`, `Erkin harakat qilmaydigan geterotrof eukariotlar`, true],
 [`tf`, `Fotosintez`, `O'simlik kislorod yutib, karbonat angidrid ajratishi`, false],
 [`tf`, `Virus`, `Hayotning hujayrasiz shakli`, true],
 [`tf`, `Bakteriofag`, `Bakteriyada parazitlik qiluvchi virus`, true],
 [`tf`, `Tamaki mozaikasi`, `Hayvonlarda uchraydigan virus`, false],
 [`type`, `Hayvonot dunyosining boshqa nomi`, `fauna`, [`fauna`]],
 [`type`, `Zamburug' tanasini hosil qiluvchi ingichka ipchalar`, `gifa`, [`gifa`, `gifalar`]],
 [`type`, `O'simlikning yashil pigmenti`, `xlorofill`, [`xlorofill`]],
 [`type`, `Quturish qaysi tirik shakl keltirib chiqaradi? (bir so'z)`, `virus`, [`virus`]],
],
test: [
 [`Tirik organizmlar nechta dunyoga bo'linadi?`, `To'rtta (bakteriya, zamburug', o'simlik, hayvon)`, [`Ikkita`, `Uchta`, `Beshta`], `Bakteriyalar, zamburug'lar, o'simliklar va hayvonlar.`],
 [`Flora deb nimaga aytiladi?`, `O'simliklar dunyosiga`, [`Hayvonot dunyosiga`, `Zamburug'lar dunyosiga`, `Bakteriyalar dunyosiga`], `Fauna – hayvonot dunyosi.`],
 [`Qaysi dunyo vakillari prokariot?`, `Bakteriyalar`, [`Zamburug'lar`, `O'simliklar`, `Hayvonlar`], `Bakteriyalarning yadrosi shakllanmagan.`],
 [`Zamburug'lar tuproqqa nima yordamida birikadi?`, `Gifalar`, [`Xloroplastlar`, `Sporalar`, `Fitonsidlar`], `Gifa – ingichka ipchalar.`],
 [`Fotosintez natijasida atmosferaga nima ajraladi?`, `Kislorod`, [`Karbonat angidrid`, `Azot`, `Vodorod`], `O'simlik karbonat angidridni yutib, kislorod chiqaradi.`],
 [`Hayvonlarni boshqa organizmlardan ajratib turadigan belgi qaysi?`, `Nerv sistemasi va sezgi organlari`, [`Xlorofill borligi`, `Gifalari borligi`, `Hujayrasiz tuzilishi`], `Ko'p hujayrali hayvonlarda nerv sistemasi va sezgi organlari bor.`],
 [`Viruslar nima uchun jonsiz va jonli tabiat o'rtasida oraliq o'rinda turadi?`, `Faqat hujayra ichida ko'payadi, tashqarida tiriklik belgilarini ko'rsatmaydi`, [`Ular har doim harakat qiladi`, `Ular fotosintez qiladi`, `Ular yadroga ega`], `Virus hujayrasiz va hujayra ichida tiriklik belgilarini namoyon qiladi.`],
 [`Gripp virusi asosan qaysi joyda parazitlik qiladi?`, `Nafas yo'llarining shilliq qavatida`, [`Jigar hujayralarida`, `Lab epiteliysida`, `O'simlik bargida`], `Gepatit jigarda, gerpes lab epiteliysida parazitlik qiladi.`],
 [`Tamaki mozaikasi virusi qaysi organizmda parazitlik qiladi?`, `O'simlikda`, [`Bakteriyada`, `Hayvonda`, `Odamda`], `Bakteriyada bakteriofag, hayvonda quturish virusi.`],
 [`Gripp boshlanganda eng to'g'ri harakat qaysi?`, `Ko'p suyuqlik ichish va shifokorga murojaat qilish`, [`Sovuq suvda cho'milish`, `Dori-darmonsiz sport qilish`, `Ovqatni umuman yemaslik`], `Bemorga ko'p suyuqlik ichirish va shifokorga ko'rsatish kerak.`],
],
rev: [
 [`4-mavzuda prokariotlar va eukariotlar haqida o'rgandik. To'rt dunyodan qaysi biri prokariotlardan iborat va ularda yadro qanday?`, `Bakteriyalar; yadrosi shakllanmagan`, [`Zamburug'lar; yadrosi shakllangan`, `Hayvonlar; yadrosi yo'q`, `O'simliklar; yadrosi shakllanmagan`], `Bakteriyalar – prokariot.`],
 [`O'simlik hujayrasidagi qaysi organoid fotosintez bilan eng bog'liq?`, `Xloroplast`, [`Leykoplast`, `Qisqaruvchi vakuola`, `Hazm qiluvchi vakuola`], `Xloroplastda xlorofill bor.`],
 [`Zamburug' hujayrasi qaysi toifaga kiradi va u o'simlik hujayrasidan qaysi tomoni bilan farq qiladi?`, `Eukariot; fotosintez qilmaydi, geterotrof`, [`Prokariot; yadrosi yo'q`, `Eukariot; avtotrof`, `Prokariot; fotosintez qiladi`], `Zamburug'lar eukariot, ammo geterotrof.`],
 [`Virus hujayra ichiga kirgach nima qiladi?`, `Hujayra moddalari hisobiga ko'payib, hujayrani nobud qiladi`, [`Hujayraga xloroplast beradi`, `Hujayrani kattalashtiradi`, `Yadrosini kuchaytiradi`], `Virus hujayra oziqi bilan ko'payadi.`],
 [`Nima uchun viruslarni «hujayrasiz» hayot shakli deyiladi, hujayra esa «tiriklikning eng kichik birligi» hisoblanadi?`, `Virus hujayra darajasidan ham sodda, mustaqil yashay olmaydi`, [`Virus hujayradan kattaroq`, `Virus yadrosi aniq shakllangan`, `Virus fotosintez qiladi`], `Virus hujayrasiz, shuning uchun tirik va jonsiz o'rtasida.`],
 [`Nerv hujayrasi signal o'tkazadi. Hayvonlarda bu qaysi tirik xususiyatni ta'minlaydi?`, `Ta'sirlanish`, [`Fotosintez`, `Sporalar bilan ko'payish`, `Passiv harakat`], `Nerv sistemasi tashqi ta'sirga javobni ta'minlaydi.`],
 [`Biologiyadagi qaysi fan bakteriya, zamburug' va viruslarning aksariyatini mikroskopda o'rganadi?`, `Mikrobiologiya (zamburug'larda mikologiya)`, [`Botanika`, `Zoologiya`, `Anatomiya`], `Mikrob – kichik jonzot.`],
 [`Flora va fauna – tabiatning ikki qismi. Ularning asosiy farqi qaysi?`, `Flora avtotrof, fauna geterotrof va harakatchan`, [`Flora harakatchan`, `Fauna fotosintez qiladi`, `Ikkalasi bir xil oziqlanadi`], `O'simliklar avtotrof, hayvonlar geterotrof.`],
] },

{ n: 6, ch: 2, title: `Bakteriyalar dunyosi`,
doc: `## Bakteriyalar kimlar?

Bakteriyalar – ko'zga ko'rinmas, juda sodda tuzilgan organizmlar. Ularni **mikrobiologiya** o'rganadi. Yadrosi yo'q, shuning uchun **prokariot**.

**Laboratoriyada o'rganish:** steril sharoitda Petri idishidagi ozuqa muhitiga bakteriya ekiladi → tez ko'payib ko'rinadigan *koloniya* hosil qiladi → mikropreparat tayyorlanib, mikroskopda ko'riladi.

**Shakli bo'yicha:**
- sharsimon – [[kokk|sharsimon bakteriya]];
- tayoqchasimon – [[batsilla|tayoqchasimon bakteriya]];
- buralgan – vibrion va [[spirilla|buralgan bakteriya]].

Qulay sharoitda har **20–30 daqiqada** bo'linib ko'payadi. Noqulay sharoitda qalin qobiq bilan o'ralib **spora** hosil qiladi; spora +140 °C dan –253 °C gacha bardosh beradi.

## Foydali bakteriyalar
- **Achituvchi:** qatiq, tuzlama, silos, teri oshlash. Tomizg'i sut uglevodlarini sut kislotaga aylantiradi.
- **Chirituvchi:** «yer yuzining sanitarlari», o'lik qoldiqlarni chiritib tozalaydi. (Ba'zan oziq-ovqat va san'at asarlarini buzadi.)
- **Tugunak:** dukkakdoshlar ildizida [[simbioz|hamkorlikda yashash]] qiladi: havodagi azotni o'simlikka beradi, o'simlik esa ularga oziq beradi. Tuproqni azotga boyitishda beda ekiladi.

## Zararli: parazit bakteriyalar
Sil, vabo, o'lat, ichburug', qoqshol kasalliklarini keltiradi. Kasallikning yoppasiga tarqalishi – [[epidemiya|yuqumli kasallikning yoppasiga tarqalishi]]. Oldini olish: karantin, alohida idish-sochiq, gigiyena, ovqatdan oldin qo'lni sovunlab yuvish.

Archa va terak [[fitonsid|bakteriyalarga qarshi o'simlik ajratadigan modda]] ajratib havoni tozalaydi.

## Paster tajribasi
Paster ikkita kolbada go'sht qaynatmasini qaynatdi. Birinchisi ochiq, ikkinchisiga «S» shaklidagi nay ulandi. Ochiq kolbada qaynatma aynidi, S-naylida aynimadi: chunki havodagi bakteriyalar nayning egilgan joyida to'xtab qoldi.`,
slides: [
 { h: `Ko'rinmas dunyo`, ic: `🔬`, p: `Qo'limizdagi bir tomchi suvda minglab bakteriya bo'lishi mumkin.|Ular juda kichik, shuning uchun faqat mikroskopda ko'rinadi.|Ularni **mikrobiologiya** o'rganadi.`.split(`|`) },
 { h: `Bakteriya qanday tuzilgan?`, ic: `⚪`, p: `Yadrosi yo'q – **prokariot**.|Shakli: **kokk** (shar), **batsilla** (tayoqcha), **vibrion/spirilla** (buralgan).|Tuzilishi sodda, lekin juda chidamli.`.split(`|`), q: `Kokk, batsilla, spirilla – bu nomlar nimani bildiradi?`, a: `Bakteriyalarning tashqi shaklini: shar, tayoqcha va buralgan shakl.` },
 { h: `Bakteriya qanchalik tez ko'payadi?`, ic: `⏱️`, p: `Qulay sharoitda har **20–30 daqiqada** ikkiga bo'linadi.|Bitta bakteriya bir necha soatda millionlab bo'lishi mumkin.|Shuning uchun sut tez achiydi, jarohat tez yallig'lanadi.`.split(`|`), q: `Nima uchun go'sht muzlatkichda uzoq saqlanadi?`, a: `Sovuqda bakteriyalar juda sekin ko'payadi yoki to'xtaydi.` },
 { h: `Superqahramon: spora`, ic: `🛡️`, p: `Sharoit yomonlashsa, bakteriya qalin qobiqqa o'raladi – **spora** hosil bo'ladi.|Spora +140 °C dan –253 °C gacha bardosh beradi.|Yillar o'tib, qulay sharoit kelsa – yana hayotga qaytadi.`.split(`|`), q: `Nega konserva idishlari yuqori haroratda sterilizatsiya qilinadi?`, a: `Sporalarni ham yo'q qilish uchun, aks holda ular o'sib mahsulotni buzadi.` },
 { h: `Qatiq – bakteriyalar mahsuli`, ic: `🥛`, p: `Sutga tomizg'i (achituvchi bakteriyalar) solinadi.|Ular sut shakarini **sut kislotaga** aylantiradi, sut qatiqqa aylanadi.|Tuzlamada ham shunday: sut kislota sabzavotni chirishdan saqlaydi.`.split(`|`), q: `Qatiq uchun sut nega iliq bo'lishi kerak?`, a: `Iliq harorat bakteriyalar uchun qulay: sovuqda sekin, juda issiqda o'ladi.` },
 { h: `Yer yuzining sanitarlari`, ic: `🧹`, p: `Chirituvchi bakteriyalar o'lik qoldiqlarni parchalaydi.|Agar ular bo'lmasa, yer yuzi o'lik barg va hayvonlar bilan to'lib ketardi.|Ammo ular ba'zan oziq-ovqatni ham buzadi.`.split(`|`), q: `Chirish – foydalimi yoki zararlimi?`, a: `Tabiatda foydali (tozalaydi, tuproqni boyitadi), oziq-ovqatda zararli (mahsulotni buzadi).` },
 { h: `Tugunak bakteriyalar: ideal hamkorlik`, ic: `🤝`, p: `Dukkakdoshlar (beda, no'xat) ildizida yashaydi.|Havodagi azotni o'zlashtirib, o'simlikka beradi.|O'simlik esa ularni oziq bilan ta'minlaydi.|Ikkalasiga ham foyda – bu **simbioz**.`.split(`|`), q: `Dehqonlar nega dalaga beda ekadi?`, a: `Beda ildizidagi tugunak bakteriyalar tuproqni azotga boyitadi, keyingi ekin yaxshi hosil beradi.` },
 { h: `Parazit bakteriyalar va kasalliklar`, ic: `🤒`, p: `Sil, vabo, o'lat, ichburug', qoqshol.|Epidemiya – kasallikning yoppasiga tarqalishi.|**Karantin:** odamlar to'planishi taqiqlanadi, bemor idish-tovog'i alohida tutiladi.|Eng oddiy himoya: qo'lni sovunlab yuvish.`.split(`|`), q: `Nega ovqatdan oldin qo'lni sovun bilan yuvish kerak?`, a: `Qo'ldagi bakteriyalar ovqat bilan og'izga tushib kasallik keltirishi mumkin.` },
 { h: `Paster tajribasi`, ic: `🧫`, p: `Ikki kolba, ikkalasida qaynatilgan go'sht sho'rvasi.|Ochiq kolba: sho'rva 3 kunda aynidi.|«S» shaklidagi naychali kolba: aynimadi.|Nay shakli havoni o'tkazadi, lekin bakteriyalarni to'xtatadi.`.split(`|`), q: `Sho'rva nima uchun aynidi? Tajriba nimani isbotladi?`, a: `Havodagi bakteriyalar tushgani uchun. Demak, mikroblar go'shtni buzadi.` },
],
cards: [
 [`tf`, `Kokk`, `Sharsimon bakteriya`, true],
 [`tf`, `Batsilla`, `Buralgan bakteriya`, false],
 [`tf`, `Spirilla`, `Buralgan bakteriya`, true],
 [`tf`, `Achituvchi bakteriyalar`, `Qatiq va tuzlama tayyorlashda ishlatiladi`, true],
 [`tf`, `Tugunak bakteriyalar`, `Dukkakdoshlar ildizida yashab, havodagi azotni o'zlashtiradi`, true],
 [`tf`, `Chirituvchi bakteriyalar`, `Faqat zarar keltiradi`, false],
 [`tf`, `Epidemiya`, `Yuqumli kasallikning yoppasiga tarqalishi`, true],
 [`tf`, `Fitonsid`, `Bakteriyalarni ko'paytiruvchi modda`, false],
 [`type`, `Bakteriyalarni o'rganuvchi fan`, `mikrobiologiya`, [`mikrobiologiya`]],
 [`type`, `Noqulay sharoitda bakteriya hosil qiladigan chidamli shakl`, `spora`, [`spora`]],
 [`type`, `Ikki organizmning hamkorlikda yashashi (bir so'z)`, `simbioz`, [`simbioz`]],
 [`type`, `Bakteriya koloniyasi o'stiriladigan shisha idish nomi (ikki so'z: ... idishi)`, `petri idishi`, [`petri idishi`, `petri`, `petri idishchasi`]],
],
test: [
 [`Bakteriyalarni qaysi fan o'rganadi?`, `Mikrobiologiya`, [`Mikologiya`, `Botanika`, `Zoologiya`], `Mikrobiologiya mikroblarni o'rganadi.`],
 [`Tayoqchasimon bakteriyalar qanday ataladi?`, `Batsilla`, [`Kokk`, `Spirilla`, `Vibrion`], `Kokk – shar, batsilla – tayoqcha.`],
 [`Qulay sharoitda bakteriyalar qanday ko'payadi?`, `Har 20–30 daqiqada bo'linib`, [`Har kuni gul hosil qilib`, `Faqat spora bilan`, `Yilda bir marta`], `Bakteriyalar juda tez bo'linadi.`],
 [`Bakteriya sporasi nima uchun kerak?`, `Noqulay sharoitda omon qolish uchun`, [`Oziq hosil qilish uchun`, `Harakatlanish uchun`, `Fotosintez uchun`], `Spora qalin qobiqli chidamli shakl.`],
 [`Qatiq tayyorlashda sut nimaga aylantiriladi?`, `Sut shakari (uglevod) sut kislotaga aylanadi`, [`Sut yog'i oqsilga aylanadi`, `Sut suvga aylanadi`, `Sut qand-shakarga aylanadi`], `Tomizg'idagi bakteriyalar uglevodni sut kislotaga aylantiradi.`],
 [`Nima uchun chirituvchi bakteriyalar «yer yuzining sanitarlari» deyiladi?`, `O'lik qoldiqlarni parchalab, yer yuzini tozalaydi`, [`Kasallik keltiradi`, `Havoni kislorodga to'ldiradi`, `Qatiq tayyorlaydi`], `Ular o'lik organizmlarni chiritadi.`],
 [`Tugunak bakteriyalar qaysi o'simliklar ildizida yashaydi?`, `Dukkakdoshlar`, [`Boshoqdoshlar`, `Karamdoshlar`, `Ro'yxatdagi barcha o'simlik`], `Beda, no'xat kabi dukkakdoshlar ildizida.`],
 [`Tugunak bakteriyalar va dukkakdoshlar munosabati nima deyiladi?`, `Simbioz`, [`Parazitlik`, `Yirtqichlik`, `Raqobat`], `Ikkalasiga ham foyda – simbioz.`],
 [`Quyidagilardan qaysi biri parazit bakteriyalar keltirib chiqaradigan kasallik?`, `Sil`, [`Gripp`, `Qorakuya`, `Vilt`], `Gripp virus, qorakuya va vilt zamburug' keltiradi.`],
 [`Paster tajribasida «S» shaklidagi nayli kolbada qaynatma nega aynimadi?`, `Bakteriyalar nayning egilgan qismida ushlanib qoldi`, [`U kolbada bakteriyalar yo'q edi`, `Go'sht yangi edi`, `Nay havoni o'tkazmadi`], `Havo kirdi, ammo bakteriyalar nayda to'xtadi.`],
],
rev: [
 [`5-mavzuda bakteriyalarni prokariot deb o'rgandik. Bakteriyaning sporasi va zamburug'ning sporasi o'xshashmi?`, `Ikkalasi ham noqulay sharoitda yoki ko'payish uchun xizmat qiladi`, [`Ikkalasi faqat quruqlikda bo'ladi`, `Faqat bakteriyada bo'ladi`, `Ikkalasi fotosintez qiladi`], `Ikkalasi tarqalish yoki saqlanish uchun.`],
 [`Bakteriya hujayrasida yadro yo'q. Bu nimani anglatadi va qaysi dunyoga kiradi?`, `Prokariot, bakteriyalar dunyosi`, [`Eukariot, zamburug'lar dunyosi`, `Prokariot, o'simliklar dunyosi`, `Eukariot, hayvonot dunyosi`], `Yadrosiz hujayra – prokariot.`],
 [`Hayvonlar hujayrasi eukariot. Bakteriyalardan farqli, ular hujayrasida nima bor?`, `Aniq shakllangan yadro`, [`Spora`, `Koloniya`, `Tomizg'i`], `Eukariotlarda yadro bor.`],
 [`Virus va parazit bakteriya – ikkalasi ham kasallik keltiradi. Ularning asosiy farqi nimada?`, `Virus hujayrasiz, bakteriya hujayrali`, [`Virus yadroli`, `Bakteriya hujayrasiz`, `Farqi yo'q`], `Virus hujayrasiz shakl, bakteriya prokariot hujayra.`],
 [`Mikroskopda bakteriya shaklini ko'rish uchun avval Petri idishida ko'paytiriladi. Bu qaysi o'rganish usuliga yaqin?`, `Tajriba`, [`Tarixiy usul`, `Faqat kuzatish`, `Taqqoslash`], `Sharoit yaratib, organizm o'stiriladi.`],
 [`Fotosintez qiluvchi o'simlik va azot to'plovchi bakteriya hamkorligida nima o'xshash?`, `Ikkalasi ham bir-biridan foyda oladi`, [`Ikkalasi parazit`, `Ikkalasi geterotrof`, `Ikkalasi sporasiz`], `Simbiozda ikki tomonga foyda.`],
 [`Moddalar almashinuvi (2-mavzu) bakteriyalarda qanday namoyon bo'ladi? Ularning qaysi turi o'lik qoldiqni parchalab oziqlanadi?`, `Chirituvchi bakteriyalar`, [`Tugunak bakteriyalar`, `Fitonsid hosil qiluvchilar`, `Kokklar`], `Ular tayyor organik qoldiq bilan oziqlanadi, ya'ni geterotrof.`],
 [`Karantin nima uchun e'lon qilinadi?`, `Epidemiya tarqalishining oldini olish uchun`, [`Bakteriyalarni ko'paytirish uchun`, `Sporalarni tarqatish uchun`, `Oziq-ovqatni buzish uchun`], `Odamlar to'planishi cheklanadi.`],
] },

{ n: 7, ch: 2, title: `Zamburug'lar dunyosi`,
doc: `## Zamburug'lar kimlar?

Zamburug'larni **mikologiya** o'rganadi. Ilgari ularni o'simlik deb hisoblashgan, keyin olimlar alohida dunyo qilib ajratishdi. Zamburug'lar – **eukariot**, erkin harakatlana olmaydi, hayvonlarga o'xshab **geterotrof** oziqlanadi. Yashashi uchun ozuqa, harorat va namlik yetarli bo'lsa bas; yorug'lik shart emas.

## Zamburug' turlari
1. **Achitqi zamburug'i** – ovalsimon, bir hujayrali. Non yopishda ishlatiladi. Shakarli iliq suvda kurtaklanib ko'payadi, xamirni ko'taradi, mahsulot yumshoq va g'ovak bo'ladi.
2. **Mog'or zamburug'i** – nonni mog'or bosadi. Havoda sporalari doim uchib yuradi; selofan paketdagi nam muhit qulay bo'ladi. Sporangiy yorilib minglab spora sochadi. Mog'or oziq-ovqatni buzadi, toksinlari zaharlashi mumkin. Lekin ba'zi turlaridan [[antibiotik|bakteriyalarga qarshi dori]] olinadi.
3. **Qalpoqchali zamburug'lar** – meva tanasi oyoqcha va qalpoqchadan iborat. *Yeyiladigan:* qo'zidumba (shampinion), oq qo'ziqorin. *Zaharli:* qizil muxomor, sariq soxta qo'ziqorin. Yeyishdan oldin 5–7 daqiqa qaynatib suvini to'kish kerak.
4. **Parazit zamburug'lar** – [[qorakuya|boshoqdoshlar boshog'ida qora kukun hosil qiluvchi parazit zamburug'-kasallik]] (don puch bo'ladi), [[vilt|o'simlik so'lishiga sabab bo'luvchi kasallik (Vertitsillium zamburug'i)]] (barg va poya so'liydi), zang zamburug'i (zangga o'xshash dog').

Foydali zamburug'lar ko'proq oziq-ovqat sanoatida ishlatiladi; zararlilariga qarshi o'simliklarni himoya qilish usullari ishlab chiqiladi.

## Eslab qoling
Zamburug'ni faqat **yaxshi taniganingizdagina** yeyish mumkin. Tanimagan qo'ziqorinni uzmang va yemang!`,
slides: [
 { h: `Zamburug' – alohida dunyo`, ic: `🍄`, p: `Eukariot. Geterotrof. Erkin harakat qilmaydi.|Mikologiya fani o'rganadi.|Ilgari o'simlik deb o'ylashgan, hozir alohida olam.`.split(`|`), q: `Zamburug' hayvonga ham, o'simlikka ham o'xshaydi. Qaysi jihatdan qaysiga?`, a: `Harakat qilmasligi bilan o'simlikka, tayyor oziq bilan oziqlanishi bilan hayvonga o'xshaydi.` },
 { h: `Yashash uchun nima kerak?`, ic: `💧`, p: `Ozuqa, iliq harorat, nam.|Yorug'lik shart emas.|Shuning uchun qorong'i va nam joylarda (podval, o'rmon tagi) zamburug' ko'p.`.split(`|`), q: `Nega yomg'irdan keyin o'rmonda qo'ziqorin ko'payadi?`, a: `Nam va iliq muhit zamburug' uchun eng qulay.` },
 { h: `Achitqi: non yumshoqligining siri`, ic: `🍞`, p: `Achitqi – ovalsimon bir hujayrali zamburug'.|Shakarli iliq suvda tez kurtaklanib ko'payadi.|Xamir shishib, g'ovak bo'ladi.`.split(`|`), q: `Xamir nega ko'tarilib oshadi?`, a: `Achitqi zamburug'lari ko'payib, gaz ajratadi va xamirni shishiradi.` },
 { h: `Mog'or: nonga qo'nuvchi mehmon`, ic: `🟢`, p: `Mog'or sporalari doim havoda uchib yuradi.|Selofan paket – nam va iliq muhit, mog'or rivojlanadi.|Toksinlari zaharlashi mumkin.|Lekin ba'zi mog'orlardan **antibiotik** olinadi.`.split(`|`), q: `Mog'orlagan nonning mog'or qismini kesib, qolganini yeyish to'g'rimi?`, a: `Yo'q, zaharli moddalar butun nonga o'tgan bo'lishi mumkin. Mog'orlagan oziqni yemagan ma'qul.` },
 { h: `Qalpoqchali zamburug'lar`, ic: `🍄`, p: `Oyoqcha + qalpoqcha.|Yeyiladigan: shampinion, oq qo'ziqorin.|Zaharli: qizil muxomor, sariq soxta qo'ziqorin.|Yeyishdan oldin 5–7 daqiqa qaynatib suvini to'king.`.split(`|`), q: `Tanimagan qo'ziqorinni nima qilish kerak?`, a: `Uzmaslik va yemaslik. Faqat yaxshi taniydigan mutaxassisning fikri bilan yeyiladi.` },
 { h: `Parazit zamburug'lar`, ic: `🌾`, p: `**Qorakuya** – boshoqda qora kukun, don puch bo'ladi.|**Vilt** – o'tkazuvchi qismni tutib, o'simlik so'liydi.|**Zang** – atirgul bargida zangga o'xshash dog'lar.`.split(`|`), q: `Dehqon nima uchun kasallikni erta payqashi kerak?`, a: `Parazit zamburug' tez tarqalib butun ekinni nobud qiladi.` },
 { h: `Foyda va zarar`, ic: `⚖️`, p: `**Foyda:** non, antibiotik, yeyiladigan qo'ziqorin.|**Zarar:** oziq-ovqatni buzadi, o'simlik kasalliklari, zaharli turlar.|Hammasini bilish – insonni himoya qiladi.`.split(`|`), q: `Bitta zamburug' turi (masalan, mog'or) ham foydali, ham zararli bo'la oladimi?`, a: `Ha: oziqni buzadi, ammo ayrim turlaridan antibiotik olinadi.` },
],
cards: [
 [`tf`, `Mikologiya`, `Zamburug'lar haqidagi fan`, true],
 [`tf`, `Achitqi zamburug'i`, `Ko'p hujayrali, yirik qalpoqchali zamburug'`, false],
 [`tf`, `Mog'or zamburug'i`, `Oziq-ovqatni buzishi mumkin, ayrimlaridan antibiotik olinadi`, true],
 [`tf`, `Qizil muxomor`, `Yeyiladigan zamburug'`, false],
 [`tf`, `Shampinion (qo'zidumba)`, `Yeyiladigan qalpoqchali zamburug'`, true],
 [`tf`, `Qorakuya`, `Boshoqdoshlarda parazitlik qiluvchi zamburug' kasallik`, true],
 [`tf`, `Zamburug'lar`, `Yashashi uchun yorug'lik shart`, false],
 [`type`, `Non yopishda ishlatiladigan bir hujayrali zamburug'`, `achitqi`, [`achitqi`]],
 [`type`, `Zamburug' tanasidagi ingichka ipchalar`, `gifa`, [`gifa`, `gifalar`]],
 [`type`, `Bakteriyalarga qarshi dori (mog'ordan olinadi)`, `antibiotik`, [`antibiotik`]],
 [`type`, `O'simlik so'lishiga sabab bo'luvchi kasallik nomi (Vertitsillium)`, `vilt`, [`vilt`]],
 [`type`, `Zamburug'lar qaysi hujayrali turga kiradi? (prokariot yoki ...)`, `eukariot`, [`eukariot`, `eukariotlar`]],
],
test: [
 [`Zamburug'larni qaysi fan o'rganadi?`, `Mikologiya`, [`Mikrobiologiya`, `Botanika`, `Sitologiya`], `Mikologiya – zamburug'lar haqidagi fan.`],
 [`Zamburug'lar qaysi belgisi bilan hayvonlarga o'xshaydi?`, `Geterotrof oziqlanishi`, [`Fotosintez qilishi`, `Faol harakatlanishi`, `Nerv sistemasi borligi`], `Zamburug'lar tayyor organik moddalar bilan oziqlanadi.`],
 [`Achitqi zamburug'idan qanday maqsadda foydalaniladi?`, `Non va xamir mahsulotlarini yumshoq qilish uchun`, [`Dori tayyorlash uchun`, `Teri oshlash uchun`, `Tuproqni azotga boyitish uchun`], `Achitqi xamirni ko'taradi.`],
 [`Nima uchun nonni selofan paketda uzoq saqlasa mog'orlaydi?`, `Paket ichida nam va qulay muhit hosil bo'ladi`, [`Selofan mog'or hosil qiladi`, `Non o'zi mog'orga aylanadi`, `Paket havoni butunlay o'tkazadi`], `Mog'or sporalari doim havoda bor.`],
 [`Mog'or zamburug'idan nima olinadi?`, `Antibiotik`, [`Vitamin`, `Qatiq`, `Un`], `Antibiotik bakteriyalarga qarshi dori.`],
 [`Quyidagilardan qaysi biri zaharli zamburug'?`, `Qizil muxomor`, [`Qo'zidumba`, `Oq qo'ziqorin`, `Shampinion`], `Qizil muxomor va sariq soxta qo'ziqorin zaharli.`],
 [`Yeyiladigan qo'ziqorinni taomdan oldin nima qilish kerak?`, `5–7 daqiqa qaynatib, suvini to'kish`, [`Xom holda yeyish`, `Quritmasdan yeyish`, `Sovuq suvda ivitish`], `Zaharli moddalar qaynatilganda suvga chiqib ketadi.`],
 [`Qorakuya zamburug'i qayerda parazitlik qiladi?`, `Boshoqdoshlarning boshog'ida`, [`Ildizida`, `Gulida`, `Mevasida`], `Qora kukun hosil qilib, donni puch qiladi.`],
 [`Vilt kasalligini qaysi zamburug' keltiradi?`, `Vertitsillium`, [`Qorakuya`, `Achitqi`, `Mog'or`], `O'tkazuvchi qismida parazitlik qiladi.`],
 [`Zamburug' yashashi uchun quyidagilardan qaysi biri shart emas?`, `Yorug'lik`, [`Ozuqa`, `Namlik`, `Harorat`], `Zamburug'lar fotosintez qilmaydi.`],
],
rev: [
 [`6-mavzuda bakteriyalar prokariot ekanini bildik. 7-mavzuda zamburug'lar eukariot. Ularni birlashtiruvchi umumiy belgi nima?`, `Ko'pchiligi geterotrof oziqlanadi`, [`Ikkalasida yadro aniq shakllangan`, `Ikkalasi fotosintez qiladi`, `Ikkalasi hayvonot dunyosiga kiradi`], `Bakteriyalar asosan geterotrof, zamburug'lar ham geterotrof.`],
 [`Achitqi bir hujayrali eukariot, bakteriya bir hujayrali prokariot. Ularni mikroskopda ajratishga nima yordam beradi?`, `Achitqida aniq yadro bor, bakteriyada yo'q`, [`Bakteriyada xloroplast bor`, `Achitqida qalin spora bor`, `Ikkalasida bir xil tuzilish`], `Yadro borligi eukariotni ko'rsatadi.`],
 [`Bakteriyalar ham, zamburug'lar ham sporalar hosil qiladi. Sporaning umumiy vazifasi nima?`, `Omon qolish va tarqalish`, [`Fotosintez`, `Nafas olish`, `Ayirish`], `Spora – tarqalish va omon qolish shakli.`],
 [`Mog'or zamburug'idan antibiotik olinadi. Antibiotik qaysi tirik guruhga qarshi ishlatiladi?`, `Bakteriyalarga`, [`O'simliklarga`, `Hayvonlarga`, `Zamburug'larga`], `Antibiotik bakteriyalarga qarshi dori.`],
 [`Qatiq (6-mavzu) va xamir (7-mavzu): ikkalasi ham qaysi hodisaga misol bo'ladi?`, `Mikroorganizmlar yordamida mahsulot tayyorlash`, [`Fotosintez`, `Parazitlik`, `Simbioz`], `Qatiqda bakteriya, xamirda achitqi zamburug'i ishlaydi.`],
 [`Parazit bakteriya (sil) va parazit zamburug' (qorakuya)ning farqi nima?`, `Biri odamda, ikkinchisi o'simlikda kasallik qiladi`, [`Ikkalasi faqat odamda`, `Ikkalasi faqat o'simlikda`, `Ikkalasi hujayrasiz`], `Sil – bakteriya, qorakuya – o'simlik kasalligi.`],
 [`Ikki hamkorlik misoli: tugunak bakteriya – dukkakdosh (simbioz). Parazit zamburug' – boshoqdosh munosabati nima?`, `Parazitlik (zarar yetkazadi)`, [`Simbioz`, `Ikkalasiga foyda`, `Raqobat`], `Parazit xo'jayin hisobiga yashaydi.`],
 [`Zamburug' va bakteriya: qaysi biri chirituvchi bo'lib, o'lik qoldiqlarni parchalab tabiatni tozalashda ishtirok etadi?`, `Ikkalasi ham (chirituvchi bakteriya va ba'zi zamburug'lar)`, [`Faqat tugunak bakteriya`, `Faqat parazit zamburug'`, `Hech biri`], `Ularning ko'pi o'lik qoldiq bilan oziqlanadi.`],
] },
]
