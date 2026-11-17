// 3-BOB. Organizm va tashqi muhit (16–18-§)
export default [
{ n: 16, ch: 3, title: `Ekologik omillar`,
doc: `## Ekologik omillar
Tirik organizmga ta'sir qiluvchi tashqi omillar – **ekologik omillar**. Uch xil:
1. **Abiotik** – jonsiz tabiat omillari: yorug'lik, namlik, harorat.
2. **Biotik** – tirik organizmlarning bir-biriga ta'siri (o'simlik, hayvon, mikroorganizm).
3. **Antropogen** – inson faoliyatining ta'siri (turlarning qirilishi yoki tiklanishi, yangi nav va zotlar yaratish).

[[Yashash muhiti|organizm moslashgan va yaxshi ko'payadigan muhit]]ga moslanish misollari: baliqning suyri shakli va shilimshig'i suv qarshiligini yengadi; sudralib yuruvchining muguz tangachasi cho'lda suv bug'lanishi va issiqdan asraydi.

## Biotsenoz
Tabiiy jamoaning jonli qismi – [[biotsenoz|o'simlik, hayvon va mikroorganizmlar uyushmasi]]. Uch guruhdan iborat:
- **Produtsentlar** – organik modda hosil qiluvchilar (yashil o'simliklar).
- **Konsumentlar** – iste'molchilar (o'txo'r va yirtqich hayvonlar).
- **Redutsentlar** – parchalovchilar: organik moddalarni mineral moddalarga aylantiradi (bakteriya va zamburug'lar).

## Ozuqa zanjiri
O'zidan oldingisini yeb, keyingisiga oziq bo'ladigan organizmlar qatori. Birinchi halqada – produtsent o'simlik, keyin konsumentlar, oxirida redutsentlar.

**Misol:** bug'doy → chigirtka → baqa → ilon → burgut (hammasida redutsentlar parchalaydi).

Zanjirning bir halqasi uzilsa, keyingilariga ta'sir qiladi: yomg'ir kam yoqsa → o'simlik kam → chigirtka kam → qushlar kam → yirtqich qushlar kam.`,
slides: [
 { h: `Tashqi dunyo bizga qanday ta'sir qiladi?`, ic: `🌦️`, p: `Yorug'lik, issiqlik, nam, boshqa jonzotlar, inson – hammasi tirik organizmga ta'sir qiladi.|Bu ta'sirlar **ekologik omillar**.|Uch guruh: abiotik, biotik, antropogen.`.split(`|`) },
 { h: `Abiotik – jonsiz omillar`, ic: `☀️`, p: `Yorug'lik, namlik, harorat.|Misol: cho'lda issiq va quruq, o'rmonda salqin va nam.|Organizm shunga moslashadi.`.split(`|`), q: `Kaktusning qalin etli poyasi qaysi omilga moslashuv?`, a: `Namlikning yetishmasligiga: suvni zaxira qiladi.` },
 { h: `Biotik – tirik omillar`, ic: `🐝`, p: `Tirik organizmlarning bir-biriga ta'siri.|Yirtqich va o'lja. Parazit va xo'jayin. Asalari va gul.|Bir tur boshqasining hayotini o'zgartiradi.`.split(`|`), q: `Asalari va gul orasidagi munosabat qaysi omilga kiradi?`, a: `Biotik omilga: ikkalasiga foyda keltiradi.` },
 { h: `Antropogen – inson omili`, ic: `🧑‍🌾`, p: `Inson tabiatni o'zgartiradi.|Ijobiy: yangi nav va zotlar.|Salbiy: o'rmonni kesish, havoni ifloslantirish.`.split(`|`), q: `Bitta ijobiy va bitta salbiy antropogen omil ayting.`, a: `Ijobiy: yangi nav yaratish. Salbiy: haddan ortiq daraxt kesish yoki ifloslantirish.` },
 { h: `Biotsenoz: «tirik jamoa»`, ic: `🏞️`, p: `Bir joyda yashovchi o'simlik, hayvon, mikroorganizmlar uyushmasi.|**Produtsent** – ishlab chiqaradi.|**Konsument** – iste'mol qiladi.|**Redutsent** – parchalaydi.`.split(`|`), q: `Bakteriya va zamburug' nega redutsent?`, a: `Ular o'lik qoldiqlarni parchalab, mineral moddalarga aylantiradi, o'simliklar yana ulardan foydalanadi.` },
 { h: `Ozuqa zanjiri`, ic: `⛓️`, p: `Bug'doy → chigirtka → baqa → ilon → burgut.|Birinchi halqa – o'simlik (produtsent).|Hammasi – konsument. Oxirida redutsentlar parchalaydi.`.split(`|`), q: `Bu zanjirda ilon yo'qolsa nima bo'ladi?`, a: `Baqalar ko'payib ketadi (chigirtka kamayadi), burgut esa oziqsiz qoladi.` },
 { h: `Zanjir uzilsa`, ic: `💥`, p: `Yomg'ir kam → o'simlik kam → chigirtka kam → qush kam → yirtqich qush kam.|Tabiatda hamma narsa bir-biri bilan bog'langan.`.split(`|`), q: `Fermer bo'rilarni yo'q qildi: avval qo'ylar ko'paydi, keyin kasallikdan ko'p tuyoqlilar qirildi. Nega?`, a: `Bo'rilar kasal va kuchsiz hayvonlarni yeb, populyatsiyani sog'lom saqlagan. Ularsiz kasallik tarqaldi.` },
 { h: `Quyon va tulki`, ic: `🐇`, p: `Quyon ko'paysa – tulki ko'payadi (oziq ko'p).|Tulki ko'paysa – quyon kamayadi.|Quyon kamaysa – tulki ham kamayadi.|Ular bir-biriga bog'liq, sonlari tebranib turadi.`.split(`|`), q: `Bu bog'lanishdan qanday xulosa qilamiz?`, a: `Yirtqich va o'lja soni bir-biriga bog'liq va tabiiy muvozanatni ushlab turadi.` },
],
cards: [
 [`tf`, `Abiotik omil`, `Jonsiz tabiat omili: yorug'lik, namlik, harorat`, true],
 [`tf`, `Biotik omil`, `Inson faoliyatining tabiatga ta'siri`, false],
 [`tf`, `Antropogen omil`, `Inson faoliyatining tabiatga ta'siri`, true],
 [`tf`, `Produtsent`, `Organik moddani parchalovchi bakteriya`, false],
 [`tf`, `Konsument`, `Tayyor organik modda iste'mol qiluvchi organizm`, true],
 [`tf`, `Redutsent`, `Organik moddalarni mineral moddalarga aylantiruvchi`, true],
 [`tf`, `Ozuqa zanjirining birinchi halqasi`, `Yirtqich hayvon`, false],
 [`tf`, `Biotsenoz`, `Tabiiy jamoaning jonli qismi`, true],
 [`type`, `Jonsiz tabiat omillari (… omillar)`, `abiotik`, [`abiotik`]],
 [`type`, `Organik modda hosil qiluvchilar`, `produtsent`, [`produtsent`, `produtsentlar`]],
 [`type`, `Parchalovchilar`, `redutsent`, [`redutsent`, `redutsentlar`]],
 [`type`, `Ozuqa zanjirining birinchi halqasidagi organizmlar (o'…)`, `o'simlik`, [`o'simlik`, `o'simliklar`]],
],
test: [
 [`Ekologik omillar necha xil bo'ladi?`, `Uch xil`, [`Ikki xil`, `To'rt xil`, `Besh xil`], `Abiotik, biotik va antropogen.`],
 [`Yorug'lik, namlik, harorat qaysi omilga kiradi?`, `Abiotik`, [`Biotik`, `Antropogen`, `Ijtimoiy`], `Bu jonsiz tabiat omillari.`],
 [`Yirtqich va o'lja munosabati qaysi omilga kiradi?`, `Biotik`, [`Abiotik`, `Antropogen`, `Iqlimiy`], `Tirik organizmlarning o'zaro ta'siri.`],
 [`Yangi nav va zotlar yaratilishi qaysi omilga misol?`, `Antropogen`, [`Abiotik`, `Biotik`, `Tabiiy`], `Inson faoliyati natijasi.`],
 [`Sudralib yuruvchilar muguz tangachasi nimaga yordam beradi?`, `Cho'lda suv bug'lanishi va issiqdan saqlanishga`, [`Suzishga`, `Uchishga`, `Yorug'likni yutishga`], `Moslashuvga misol.`],
 [`Biotsenozning produtsentlari kimlar?`, `Yashil o'simliklar`, [`O'txo'r hayvonlar`, `Yirtqichlar`, `Bakteriyalar`], `Organik modda hosil qiladilar.`],
 [`Redutsentlarga kimlar kiradi?`, `Bakteriya va zamburug'lar`, [`O'txo'r hayvonlar`, `Yashil o'simliklar`, `Yirtqich qushlar`], `Ular mineral moddalargacha parchalaydi.`],
 [`Ozuqa zanjirida chigirtka, baqa, ilon va burgut nima hisoblanadi?`, `Konsumentlar`, [`Produtsentlar`, `Redutsentlar`, `Parazitlar`], `Ular tayyor organik modda iste'mol qiladi.`],
 [`Ozuqa zanjirida baqa bilan ilon o'rtasida qanday bog'liqlik bor?`, `Ilon baqa bilan oziqlanadi`, [`Baqa ilonni yeydi`, `Ular o'zaro bog'liq emas`, `Ikkalasi ham produtsent`], `Ilon baqa bilan oziqlanib, burgutga ozuqa bo'ladi.`],
 [`Yomg'ir kam yog'sa ozuqa zanjirida nimalar yuz beradi?`, `O'simlik kam, keyin chigirtka va qushlar soni kamayadi`, [`Qushlar ko'payadi`, `Hech narsa o'zgarmaydi`, `Chigirtka ko'payadi`], `Birinchi halqa zarar ko'rsa, keyingilari ham kamayadi.`],
],
rev: [
 [`15-mavzuda odam organlar sistemalarini o'rgandik. Odam ozuqa zanjirida qaysi toifaga kiradi?`, `Konsument`, [`Produtsent`, `Redutsent`, `Abiotik omil`], `Odam tayyor organik modda bilan oziqlanadi.`],
 [`Odam nafas olganda kislorod yutadi. Bu kislorodning asosiy manbai nima?`, `Produtsent o'simliklarning fotosintezi`, [`Redutsentlar`, `Mikroblar faoliyati`, `Konsumentlar`], `Yashil o'simliklar kislorod ajratadi.`],
 [`Issiq yoki sovuq harorat odamning organizm sistemalariga qanday ta'sir qiladi? Bu qaysi omil?`, `Abiotik omil: tana harorati va jarayonlarga ta'sir qiladi`, [`Biotik: faqat yirtqichlar`, `Antropogen: faqat odam`, `Ta'sir qilmaydi`], `Harorat – abiotik omil.`],
 [`Limfa sistemasi bakteriyalarni ushlaydi. Bakteriyalar ekologik omillarning qaysi guruhiga kiradi?`, `Biotik`, [`Abiotik`, `Antropogen`, `Hech biri`], `Mikroorganizmlar – tirik omil.`],
 [`Asalari o'simlikni changlatadi, o'simlik unga nektar beradi. Ozuqa zanjirida o'simlik asalariga nima?`, `Produtsent (oziq beruvchi)`, [`Redutsent`, `Konsument`, `Parazit`], `O'simlik – oziq yaratuvchi.`],
 [`Qon aylanish sistemasi va ozuqa zanjiri: ikkalasida umumiy tamoyil qaysi?`, `Hamma bo'g'in bir-biriga bog'liq: biri buzilsa, qolganlarga ta'sir qiladi`, [`Ular bir-biriga bog'liq emas`, `Faqat bir qismi muhim`, `Ularning hech biri uzilmaydi`], `Tizimli bog'liqlik.`],
 [`Adrenalin gormoni ta'siridagi qochish – bu qaysi ekologik munosabatga misol (yirtqich bilan o'lja)?`, `Biotik omil`, [`Abiotik omil`, `Antropogen omil`, `Iqlimiy`], `Yirtqichdan qochish – tirik organizmlar orasida.`],
 [`Hayvonlar (12-mavzu) tabiatda sanitar rolini bajaradi. Ozuqa zanjirida sanitar sifatida kimlar ishlaydi?`, `Redutsentlar (bakteriya, zamburug')`, [`Faqat yirtqichlar`, `Faqat o'simliklar`, `Faqat qushlar`], `Parchalovchilar tabiatni tozalaydi.`],
] },

{ n: 17, ch: 3, title: `Inson va tabiat`,
doc: `## Inson tabiatga qanday ta'sir qilgan?
Odam ham boshqa tirik organizm kabi muhitdan kislorod va oziq oladi. Qadim odamlar meva, urug', ildizmeva, xom go'sht bilan oziqlangan, keyin quroll yasagan, olovdan foydalangan. Dehqonchilik va chorvachilik doimiy yashash joyiga ega bo'lishga olib kelgan.

## Ijobiy ta'sir
- o'simlikning yangi navlari yaratilishi;
- hayvonlarning yangi zotlari (go'shtdor, sersut) olinishi;
- oziq-ovqat mahsulotlarining ko'paytirilishi.

## Salbiy ta'sir
- yovvoyi hayvonlarni ko'p ovlash – ularning qirilib ketishi;
- o'rmonni keragidan ortiq kesish;
- atmosferani chiqindilar bilan ifloslantirish;
- cho'llarni o'zlashtirish natijasida daryo va dengizlarning qurishi.

## Ekologik muammolar
- **Orol dengizining qurishi:** cho'llarni o'zlashtirish, tuproq sho'rini yuvish va g'o'zani ko'p sug'orish oqibati.
- **Havo harorati ko'tarilishi:** transport va yoqilg'idan chiqqan karbonat angidrid ko'payadi → muzliklar eriydi → ba'zi joylarda suv toshqini.
- **Azon qatlamidagi tuynuklar:** muzlatkich va konditsionerlardan ajraladigan modda atmosferaning himoya qobig'iga zarar beradi → zararli nurlar yerga yetadi → o'simlik va hayvonlarga zarar, odamlarda terining xavfli o'smasi.

Bularning hammasi **ekologik muvozanatning buzilishiga** olib keladi. Biologiya bilimlari insonning salbiy ta'sirini kamaytirishga yordam beradi.`,
slides: [
 { h: `Tabiatning eng kuchli o'zgartiruvchisi`, ic: `🧑`, p: `Odam ham tabiat bolasi: nafas oladi, oziqlanadi.|Lekin u boshqa jonzotlardan farqli, tabiatni **ongli o'zgartira oladi**.|Bu foyda ham, zarar ham keltiradi.`.split(`|`), q: `Inson boshqa hayvonlardan qanday farqlanadi?`, a: `U qurol yasaydi, olovdan foydalanadi, ekin ekadi, tabiatni tubdan o'zgartira oladi.` },
 { h: `Qanday yashab kelgan?`, ic: `🔥`, p: `Qadimda: meva, urug', ildizmeva, xom go'sht.|Keyin: qurollar, olov, ov.|Dehqonchilik va chorvachilik – doimiy yashash joyi.`.split(`|`), q: `Dehqonchilik odam hayotini qanday o'zgartirdi?`, a: `Odam bir joyda o'troq yasha boshladi, oziq barqaror bo'ldi, aholi ko'paydi.` },
 { h: `Ijobiy ta'sir`, ic: `🌾`, p: `Yangi o'simlik navlari.|Yangi hayvon zotlari: go'shtdor, sersut.|Oziq-ovqat mahsulotlarining ko'payishi.`.split(`|`), q: `Yangi nav yaratish nima uchun foydali?`, a: `Hosildorlik, kasallikka chidamlilik va sifat oshadi.` },
 { h: `Salbiy ta'sir`, ic: `🪓`, p: `Ov – turlarning qirilishi.|O'rmonni ortiqcha kesish.|Havoning chiqindilardan ifloslanishi.|Cho'llarni o'zlashtirish – daryo va dengizlarning qurishi.`.split(`|`), q: `O'rmon kesilishining uzoq muddatli oqibatlari qanday?`, a: `Kislorod kamayadi, tuproq yuvilib ketadi, hayvonlar uysiz qoladi, iqlim o'zgaradi.` },
 { h: `Orol dengizi`, ic: `🌊`, p: `Cho'llar o'zlashtirildi, g'o'za ko'p sug'orildi.|Daryolardan dengizga suv kam keldi.|Dengiz quriy boshladi – iqlim, baliqchilik va aholi salomatligiga ta'sir qildi.`.split(`|`), q: `Bu muammoni qanday kamaytirish mumkin?`, a: `Suvni tejab sug'orish, kam suv talab qiladigan ekinlar va qurigan tubida o'simlik (saksovul) ekish.` },
 { h: `Isish va azon tuynugi`, ic: `🌡️`, p: `Transport va yoqilg'i → karbonat angidrid ko'payadi → havo isiydi → muzlik eriydi → toshqin.|Muzlatkich va konditsioner moddalari azon qatlamiga zarar beradi.|Zararli nur o'simlik, hayvon va odamga (teri o'smasi) xavfli.`.split(`|`), q: `Azon qatlami Yerni nimadan himoya qiladi?`, a: `Quyoshning zararli nurlaridan.` },
 { h: `Ekologik muvozanat`, ic: `⚖️`, p: `Tabiat hammasi o'zaro bog'langan zanjir.|Bir narsani ortiqcha o'zgartirsak, boshqasi buziladi.|Biologiya bilimi zararni kamaytirishga yordam beradi.`.split(`|`), q: `Siz o'z hayotingizda tabiatga zararni kamaytirish uchun nima qila olasiz?`, a: `Suv va elektrni tejash, chiqindini ajratish, daraxt ekish, plastikni kamaytirish.` },
],
cards: [
 [`tf`, `Yangi nav va zotlar yaratish`, `Insonning tabiatga ijobiy ta'siri`, true],
 [`tf`, `O'rmonni ortiqcha kesish`, `Insonning tabiatga ijobiy ta'siri`, false],
 [`tf`, `Orol dengizi quriy boshladi`, `Cho'llarni o'zlashtirish va g'o'zani ko'p sug'orish oqibatida`, true],
 [`tf`, `Azon qatlami`, `Atmosferaning zararli nurlardan himoya qobig'i`, true],
 [`tf`, `Karbonat angidrid ko'payishi`, `Havo haroratining pasayishiga olib keladi`, false],
 [`tf`, `Muzlatkich va konditsioner moddalari`, `Azon qatlamiga zarar yetkazishi mumkin`, true],
 [`tf`, `Zararli nurlar`, `Odamlarda teri o'smasi kasalligini keltirishi mumkin`, true],
 [`tf`, `Ekologik muvozanat`, `Tabiatdagi turli omillarning bir-biriga mos barqaror holati`, true],
 [`type`, `Atmosferaning himoya qatlami (… qatlami)`, `azon`, [`azon`]],
 [`type`, `Insonning salbiy ta'siridan dengiz qurib borayotgan joy`, `orol`, [`orol`, `orol dengizi`]],
 [`type`, `Havo isishida ko'payadigan gaz (karbonat …)`, `angidrid`, [`angidrid`, `karbonat angidrid`]],
 [`type`, `Tabiatdagi muvozanat buzilishi natijasida paydo bo'ladigan muammolar (… muammolar)`, `ekologik`, [`ekologik`]],
],
test: [
 [`Quyidagilardan qaysi biri insonning tabiatga ijobiy ta'siri?`, `Yangi o'simlik navlarini yaratish`, [`O'rmonni kesish`, `Havoni ifloslantirish`, `Hayvonlarni ko'plab ovlash`], `Yangi nav va zotlar oziq-ovqatni ko'paytiradi.`],
 [`Quyidagilardan qaysi biri salbiy ta'sir?`, `Yovvoyi hayvonlarni ko'plab ovlash`, [`Yangi zot olish`, `Oziq-ovqatni ko'paytirish`, `Ko'chat ekish`], `Turlar qirilib ketishi mumkin.`],
 [`Orol dengizi nima sababdan quriy boshladi?`, `Cho'llar o'zlashtirilib, g'o'za ko'p sug'orilgani sababli`, [`Ko'p yomg'ir yoqqani sababli`, `Baliq ko'payganidan`, `Shamol kuchaygani sababli`], `Dengizga suv kam yetib keldi.`],
 [`Karbonat angidrid ko'payishi nimaga olib keladi?`, `Havo haroratining ko'tarilishiga`, [`Havoning sovishiga`, `Kislorod ko'payishiga`, `Azon qatlami qalinlashishiga`], `Muzliklar eriydi.`],
 [`Azon qatlamining yupqalashishi nimaga sabab bo'ladi?`, `Zararli nurlarning yerga yetishiga`, [`Havoning sovishiga`, `Yomg'ir ko'payishiga`, `Dengiz sathi pasayishiga`], `Odamda teri o'smasi xavfi ortadi.`],
 [`Muzliklar erishi qanday oqibatga olib keladi?`, `Ayrim joylarda suv toshqini`, [`Sahroning ko'payishi`, `Shamol to'xtashi`, `Suvning kamayishi`], `Dengiz va daryolarga qo'shimcha suv qo'shiladi.`],
 [`Ekologik muammolar nima sababdan ko'payadi?`, `Insonning tabiatga salbiy ta'siri ortgani sari`, [`Tabiat o'zgarmagani sababli`, `Hayvonlar ko'payishi sababli`, `O'simliklar soni oshgani sababli`], `Ekologik muvozanat buziladi.`],
 [`Qadimgi odamlar olovdan nima uchun foydalanishgan?`, `Isinish va ovqat tayyorlash uchun`, [`Faqat yoritish uchun`, `Qurol yasash uchun`, `Faqat hayvonlardan qo'rqish uchun`], `Iqlim sovib borgani sababli.`],
 [`Dehqonchilik va chorvachilik rivojlanishi odamga nima berdi?`, `Doimiy yashash joyini`, [`Ko'chmanchilikni`, `Tabiatdan uzoqlashishni`, `Ovning ko'payishini`], `Odam o'troq hayotga o'tdi.`],
 [`Biologiya bilimlari odamga nimada yordam beradi?`, `Tabiatga salbiy ta'sirni kamaytirishda`, [`Tabiatni yo'qotishda`, `Hayvonlarni ko'paytirmaslikda`, `Daraxtlarni kesishda`], `Oqilona foydalanishni o'rgatadi.`],
],
rev: [
 [`16-mavzuda antropogen omilni o'rgandik. 17-mavzuda uning misollari: o'rmon kesilishi ozuqa zanjiriga qanday ta'sir qiladi?`, `Produtsentlar kamayib, keyingi halqalar ham kamayadi`, [`Konsumentlar ko'payadi`, `Redutsentlar yo'qoladi`, `Ta'sir qilmaydi`], `Birinchi halqa – o'simlik.`],
 [`O'rmon kesilgan hududda biotsenoz qanday o'zgaradi?`, `Tur xilma-xilligi kamayadi`, [`Ko'payadi`, `O'zgarmaydi`, `Yangi turlar paydo bo'ladi`], `Yashash muhiti yo'qoladi.`],
 [`Havo ifloslanishi va nafas olish sistemasi: ifloslangan havo qaysi sistemaga eng ko'p zarar beradi?`, `Nafas olish sistemasiga`, [`Skeletga`, `Endokrin sistemaga`, `Muskullarga`], `Zararli moddalar o'pkaga tushadi.`],
 [`O'simliklar kislorod ajratadi. Daraxtlar kesilganda atmosferada nima ko'payadi?`, `Karbonat angidrid nisbati`, [`Kislorod`, `Azon`, `Azot faqat`], `Fotosintez kamayadi.`],
 [`Azon tuynugi zararli nur o'simlik va hayvonlarga ta'sir qiladi. Bu qaysi omil bilan bog'liq?`, `Antropogen omil`, [`Biotik omil`, `Tabiiy abiotik omil`, `Hech biri`], `Inson chiqargan moddalar sababchi.`],
 [`Nima uchun Orol dengizi qurishi nafaqat suv, balki butun biotsenozga ta'sir qiladi?`, `Suvga bog'liq o'simlik va hayvonlar yo'qoladi`, [`Faqat suv kamayadi`, `Hech narsa o'zgarmaydi`, `Qushlar ko'payadi`], `Biotsenoz muhitga bog'liq.`],
 [`Yangi navlar yaratish (genetika) qaysi fanga bog'liq?`, `Genetika`, [`Anatomiya`, `Sitologiya`, `Mikologiya`], `Irsiyat va o'zgaruvchanlik fani.`],
 [`Redutsentlar organik chiqindini parchalaydi. Nima uchun chiqindini tabiatga tashlash baribir zararli?`, `Plastik kabi sun'iy chiqindilar tabiiy parchalanmaydi va muhitni ifloslantiradi`, [`Redutsentlar hamma chiqindini bir kunda parchalaydi`, `Chiqindi o'simlikka oziq bo'ladi`, `Chiqindi umuman zarar qilmaydi`], `Sun'iy materiallar tabiiy yo'l bilan parchalanmaydi.`],
] },

{ n: 18, ch: 3, title: `Tabiatni muhofaza qilish`,
doc: `## Muhofaza qilinadigan hududlar
O'zbekistonda tabiatni muhofaza qilish Konstitutsiya va «Tabiatni muhofaza qilish to'g'risida»gi qonunga asosan olib boriladi. Muhofaza hududlari to'rt xil:

1. **Qo'riqxona** – odamning xo'jalik faoliyati cheklangan hudud. Tabiat qanday bo'lsa, shundayligicha saqlanadi. Mol boqish, meva terish, hayvon ovlash **qat'iyan taqiqlangan.** Asosiylari: Chotqol biosfera, Nurota tog'-yong'oq, Zomin, Zarafshon, Surxon, Hisor, Kitob geologiya va Qizilqum qo'riqxonalari.
2. **Buyurtmaxona** – ma'lum davrlarda hayvon ovlashga ruxsat beriladi; o'simliklar buyurtma asosida ko'paytirilib tarqatiladi (archa, qarag'ay ko'chatlari; mo'ynasi uchun ondatra).
3. **Milliy bog'** – madaniy hordiq va estetik zavq uchun hudud: o'simliklarga shakl berish, gul ekish mumkin; ammo gulni payhon qilish, uzish, ifloslantirish mumkin emas.
4. **Tabiat yodgorliklari** – noyob joylar: g'orlar, sharsharalar, qoyatoshlar, buloqlar, ulkan daraxtlar. 400 dan ortiq. Masalan: Teshiktosh g'ori, Obirahmat g'ori, Xo'jakentdagi qoyatosh rasmlari.

## «Qizil kitob»
O'zbekiston «Qizil kitob»i **1979-yilda** ta'sis etilgan. 1983-yilda 1-jildi (**umurtqali hayvonlar**, 63 tur), 1984-yilda 2-jildi (**o'simliklar**, 163 tur) chop etilgan. U odamlarni ayrim turlar yo'qolib ketayotgani va ularni asrash zarurligi haqida ogohlantiradi. Unda turning tuzilishi, tarqalgan joyi, yashash tarzi va qirilish sabablari yoziladi.

**Kitobga kiritilgan misollar:**
- **Yovvoyi tok** – chorva boqilishi va o'tin sifatida kesilishi tufayli kamaygan.
- **Xolmon isirg'aguli** – chiroyli guli terilgani va piyozi yeyilgani sabab kamaygan.
- **Safsan xurmosi** – yerlar o'zlashtirilishi, qurilish va o'tin tufayli kamaygan.
- **Xongul (Buxoro bug'usi)** – to'qaylarning qisqarishi va brakonyerlik tufayli kamaygan.
- **Yo'rg'a tuvaloq** – cho'lda yashashga moslashgan; ovlash taqiqlangan.

Tabiatni asrash – har birimizning vazifamiz.`,
slides: [
 { h: `Nega muhofaza kerak?`, ic: `🛡️`, p: `Tabiat boyliklari cheksiz emas.|Ayrim turlar yo'qolish xavfi ostida.|Shuning uchun maxsus hududlar va qonunlar bor.`.split(`|`), q: `Bir tur yo'qolsa, uni qayta tiklab bo'ladimi?`, a: `Odatda yo'q. Yo'qolgan tur butunlay yo'qoladi, shuning uchun oldini olish muhim.` },
 { h: `4 xil muhofaza hududi`, ic: `🏞️`, p: `**Qo'riqxona** – eng qattiq himoya.|**Buyurtmaxona** – cheklangan ov mumkin.|**Milliy bog'** – hordiq, lekin tabiatga zarar yo'q.|**Tabiat yodgorligi** – noyob joylar.`.split(`|`) },
 { h: `Qo'riqxona – «qulflangan» tabiat`, ic: `🔒`, p: `Xo'jalik faoliyati cheklangan.|Mol boqish, meva terish, ov qilish qat'iyan **taqiqlangan**.|Tabiat o'z holicha saqlanadi.|Chotqol, Nurota, Zomin, Zarafshon, Surxon, Hisor, Kitob, Qizilqum.`.split(`|`), q: `Nega qo'riqxonada hatto meva terish ham taqiqlangan?`, a: `Meva hayvonlar uchun oziq va o'simlikning ko'payish yo'li; terib olsak, zanjir buziladi.` },
 { h: `Buyurtmaxona va milliy bog'`, ic: `🌲`, p: `**Buyurtmaxona:** ma'lum davrda ov ruxsat, ko'chatlar ko'paytirilib tarqatiladi (archa, qarag'ay, ondatra).|**Milliy bog':** dam olish uchun; gulni uzish va iflos qilish mumkin emas.`.split(`|`), q: `Qo'riqxona va buyurtmaxonaning asosiy farqi nima?`, a: `Qo'riqxonada ov va xo'jalik butunlay taqiqlanadi; buyurtmaxonada ma'lum davrda ov va ko'chat tarqatish mumkin.` },
 { h: `Tabiat yodgorliklari`, ic: `🗿`, p: `G'orlar, sharsharalar, buloqlar, ulkan daraxtlar, qoyatosh rasmlari.|400 dan ortiq.|Teshiktosh g'ori, Obirahmat g'ori, Xo'jakent qoyatosh rasmlari.`.split(`|`), q: `Teshiktosh va Obirahmat g'orlari nimasi bilan qimmatli?`, a: `Qadimgi odamlar qoldiqlari va turmush izlari topilgan, ya'ni tarix va biologiya uchun muhim.` },
 { h: `«Qizil kitob» – ogohlantiruvchi signal`, ic: `📕`, p: `1979-yilda ta'sis etilgan. 1983: 1-jild, umurtqali hayvonlar, 63 tur. 1984: 2-jild, o'simliklar, 163 tur.|Unga yo'qolish xavfi ostidagi turlar kiritiladi.|Yozilgan: tuzilishi, tarqalishi, yashash tarzi, kamayish sababi.`.split(`|`), q: `Qizil kitob nima uchun «qizil»?`, a: `Qizil rang xavf va ogohlantirish belgisi: bu turlar yo'qolish xavfi ostida.` },
 { h: `Qizil kitobdan misollar`, ic: `🦌`, p: `**Yovvoyi tok** – chorva va o'tin.|**Xolmon isirg'aguli** – gulini terish, piyozni yeyish.|**Safsan xurmosi** – yer o'zlashtirish va o'tin.|**Xongul** – to'qay kamayishi, brakonyerlik.|**Yo'rg'a tuvaloq** – ovlash taqiqlangan.`.split(`|`), q: `Kamayishning ko'p sababi kim? (antropogen omil)`, a: `Inson: kesish, terish, ov va yer o'zlashtirish.` },
 { h: `Men nima qila olaman?`, ic: `🌱`, p: `Gullarni uzmaslik, daraxt kesmaslik, tabiatda chiqindi tashlamaslik.|Daraxt ekish, suv va elektr tejash.|Boshqalarni ham ogohlantirish.`.split(`|`), q: `Maktab hovlisida tabiatni asrash uchun qanday loyiha o'ylab topasiz?`, a: `Masalan: daraxt ekish kuni, chiqindi ajratish qutilari, qushlar uchun uyacha qo'yish.` },
],
cards: [
 [`tf`, `Qo'riqxona`, `Xo'jalik faoliyati cheklangan, ovlash qat'iyan taqiqlangan hudud`, true],
 [`tf`, `Buyurtmaxona`, `Hayvon ovlash hech qachon ruxsat etilmaydigan hudud`, false],
 [`tf`, `Milliy bog'`, `Madaniy hordiq va estetik zavq uchun hudud`, true],
 [`tf`, `Teshiktosh g'ori`, `Tabiat yodgorligi`, true],
 [`tf`, `«Qizil kitob»`, `Yo'qolish xavfi ostidagi turlar haqidagi kitob`, true],
 [`tf`, `Qizil kitobning 2-jildi`, `Umurtqali hayvonlar haqida`, false],
 [`tf`, `Xongul`, `Buxoro bug'usi, Qizil kitobga kiritilgan`, true],
 [`tf`, `Yovvoyi tok`, `Qizil kitobga kiritilmagan oddiy o'simlik`, false],
 [`type`, `Eng qattiq muhofaza qilinadigan hudud`, `qo'riqxona`, [`qo'riqxona`, `qoriqxona`]],
 [`type`, `Qizil kitob qaysi yilda ta'sis etilgan (raqam)`, `1979`, [`1979`]],
 [`type`, `Ma'lum davrlarda ovga ruxsat beriladigan hudud`, `buyurtmaxona`, [`buyurtmaxona`]],
 [`type`, `Noyob g'or, sharshara, buloqlar qaysi hududga kiradi? (tabiat …)`, `yodgorligi`, [`yodgorligi`, `yodgorliklari`, `tabiat yodgorligi`]],
],
test: [
 [`Muhofaza qilinadigan hududlarga qaysilar kiradi?`, `Qo'riqxona, buyurtmaxona, milliy bog', tabiat yodgorliklari`, [`Faqat qo'riqxona`, `Dala va bog'lar`, `Shahar markazlari`], `Bu to'rt turdagi hudud.`],
 [`Qo'riqxonada nima qat'iyan taqiqlangan?`, `Mol boqish, meva terish, hayvon ovlash`, [`Fotosurat olish`, `Kuzatish`, `Ilmiy tadqiqot`], `Tabiat o'z holicha saqlanadi.`],
 [`Buyurtmaxonaning qo'riqxonadan farqi nima?`, `Ma'lum davrda ovlashga ruxsat beriladi`, [`Ov mutlaqo taqiqlangan`, `Faqat gulzor`, `Hech qanday farq yo'q`], `Masalan, mo'ynasi uchun ondatra ko'paytiriladi.`],
 [`Milliy bog'da nima mumkin emas?`, `Gullarni payhon qilish va ifloslantirish`, [`Dam olish`, `Ko'chat ekish`, `Manzarali gullarni parvarishlash`], `Milliy bog' hordiq uchun, lekin tabiat zarar ko'rmasligi kerak.`],
 [`Quyidagilardan qaysi biri tabiat yodgorligi?`, `Teshiktosh g'ori`, [`Chotqol qo'riqxonasi`, `Nurota qo'riqxonasi`, `Hisor qo'riqxonasi`], `G'orlar tabiat yodgorligiga kiradi.`],
 [`Qaysi qo'riqxona geologiyaga ixtisoslashgan?`, `Kitob davlat qo'riqxonasi`, [`Chotqol`, `Qizilqum`, `Zomin`], `Kitob – geologiya qo'riqxonasi.`],
 [`O'zbekiston «Qizil kitob»i qachon ta'sis etilgan?`, `1979-yilda`, [`1983-yilda`, `1984-yilda`, `1991-yilda`], `1983-yilda 1-jildi chiqqan.`],
 [`«Qizil kitob»ning 2-jildi nima haqida?`, `O'simliklar`, [`Umurtqali hayvonlar`, `Zamburug'lar`, `Bakteriyalar`], `1984-yilda chop etilgan, 163 tur.`],
 [`Xongul qaysi hayvonning boshqa nomi?`, `Buxoro bug'usi`, [`Yo'rg'a tuvaloq`, `Qor barsi`, `Qo'ng'ir ayiq`], `To'qaylarning qisqarishi va brakonyerlik uchun kamaygan.`],
 [`Yo'rg'a tuvaloq haqida qaysi gap to'g'ri?`, `Cho'lda yashashga moslashgan, ovlash taqiqlangan`, [`Suvda yashaydi`, `Uchmaydi`, `Faqat tog'da`], `U yaxshi uchadi va suvsizlikka chidaydi.`],
],
rev: [
 [`17-mavzuda antropogen salbiy ta'sirni bilgan edik. «Qizil kitob»ga kiritilgan turlarning kamayish asosiy sababi qaysi omil?`, `Antropogen omil`, [`Abiotik omil`, `Faqat biotik omil`, `Hech biri`], `Ov, kesish, o'zlashtirish – inson ta'siri.`],
 [`Qo'riqxona ekologik muammolarning qaysi birini kamaytirishga yordam beradi?`, `Turlarning qirilishini va yashash joylari yo'qolishini`, [`Muzliklar erishini`, `Faqat Orolni`, `Azon tuynugini`], `Hudud tabiiy holda saqlanadi.`],
 [`Ozuqa zanjiri (16-mavzu) va «Qizil kitob»: bir turning yo'qolishi zanjirga qanday ta'sir qiladi?`, `Zanjirning boshqa halqalariga zarar yetadi`, [`Ta'sir qilmaydi`, `Zanjirni mustahkamlaydi`, `Faqat redutsentlarga`], `Halqa uzilsa, boshqalar ta'sirlanadi.`],
 [`Yo'rg'a tuvaloq hayvonlar qaysi sinfga kiradi?`, `Qushlar`, [`Sudralib yuruvchilar`, `Sut emizuvchilar`, `Baliqlar`], `Uchadi, tuxum qo'yadi, pat bilan qoplangan.`],
 [`Xongul (Buxoro bug'usi) qaysi sinfga kiradi?`, `Sut emizuvchilar`, [`Qushlar`, `Sudralib yuruvchilar`, `Baliqlar`], `Bolasini sut bilan boqadi.`],
 [`Yovvoyi tok va safsan xurmosi o'simlik. Ular qaysi bo'limga kiradi (yuksak, gulli)?`, `Yopiq urug'lilar`, [`Ochiq urug'lilar`, `Suvo'tlar`, `Yo'sinlar`], `Gul va meva hosil qiladi.`],
 [`Olimlar turning kamayib borayotganini qaysi usul bilan aniqlaydi?`, `Uzoq muddat kuzatib, sonini hisoblash orqali`, [`Faqat taxmin qilib`, `Faqat mikroskopda`, `Hech qanday tekshirmasdan`], `Kuzatish – biologiyaning asosiy usuli.`],
 [`Tabiatni asrash uchun odam qanday bilimlarga tayanishi kerak?`, `Biologiya va ekologiya`, [`Faqat matematika`, `Faqat tarix`, `Hech qanday`], `Bu fanlar tabiat qonunlarini o'rgatadi.`],
] },
]
