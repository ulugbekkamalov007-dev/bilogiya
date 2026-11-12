// Bosh sahifa (landing), kirish, ro'yxatdan o'tish, email tasdiqlash (OTP), parolni tiklash
import { sb, state, t, addDict, route, go, esc, $, $$, ic, toast, setLang, btnBusy, rand, modal, genPassword, passScore } from './core.js';
import { dnaHelix, cellSvg } from './fx.js';
import { canInstall, installApp } from './pwa.js';
import { CONFIG } from './config.js';

addDict({
  uz: {
    'land.hero_a': 'Hayot ilmini', 'land.hero_b': 'birga o\'rganamiz',
    'land.sub': 'Video darslar, avtomatik aralashtiriladigan testlar, guruhlar va shaxsiy hisobotlar — biologiyani o\'rganish uchun yagona ilova.',
    'land.login': 'Kirish', 'land.register': 'Ro\'yxatdan o\'tish', 'land.install': 'Ilovani o\'rnatish',
    'land.f1t': 'Video darslar', 'land.f1d': 'Faqat ketma-ket ko\'rish, istalgan joyga qaytish va sifatni tanlash.',
    'land.f2t': 'Aqlli testlar', 'land.f2d': 'Javoblar har safar aralashadi. Natijada foiz, tahlil va motivatsiya.',
    'land.f3t': 'Guruhlar', 'land.f3d': 'O\'qituvchi bilan chat, vazifalar va ovozli xabarlar bir joyda.',
    'land.f4t': 'Hisobotlar', 'land.f4d': 'Kunlik va haftalik o\'qish vaqti, grafiklar va natijalar.',
    'land.topics': 'Biz o\'rganadigan mavzular',
    'land.tp1': 'Hujayra', 'land.tp2': 'Genetika va DNK', 'land.tp3': 'Botanika', 'land.tp4': 'Zoologiya', 'land.tp5': 'Odam anatomiyasi', 'land.tp6': 'Ekologiya',
    'land.fact': 'Bilasizmi?',
    'fact1': 'Odam tanasida taxminan 30–37 trillion hujayra bor.',
    'fact2': 'Har qanday ikki odamning DNKsi taxminan 99,9% bir xil.',
    'fact3': 'Kislorodning taxminan yarmini okeandagi mikroskopik suvo\'tlar (fitoplankton) ishlab chiqaradi.',
    'fact4': 'Mitoxondriya hujayraning «energiya stansiyasi» — ATF shu yerda hosil bo\'ladi.',
    'fact5': 'Odam yuragi bir kunda taxminan 100 000 marta uradi.',
    'fact6': 'Sakkizoyoqning uchta yuragi bor.',
    'fact7': 'Hujayradagi DNK cho\'zilsa, taxminan 2 metr uzunlikka yetadi.',
    'auth.login_t': 'Hujayraga xush kelibsiz', 'auth.login_s': 'Hisobingizga kiring',
    'auth.reg_t': 'Yangi hujayra — yangi o\'quvchi', 'auth.reg_s': 'Ro\'yxatdan o\'tib, o\'qishni boshlang',
    'auth.name': 'Ism familiya', 'auth.gender': 'Jins', 'auth.male': 'Erkak', 'auth.female': 'Ayol',
    'auth.email': 'Email', 'auth.pass': 'Parol', 'auth.pass2': 'Parolni takrorlang', 'auth.pass_hint': 'Kamida 8 ta belgi',
    'auth.forgot': 'Parolni unutdingizmi?', 'auth.no_acc': 'Hisobingiz yo\'qmi?', 'auth.has_acc': 'Hisobingiz bormi?',
    'auth.err_pass_match': 'Parollar mos kelmadi', 'auth.err_pass_len': 'Parol kamida 8 ta belgidan iborat bo\'lsin',
    'auth.err_name': 'Ism familiyangizni kiriting', 'auth.err_exists': 'Bu email allaqachon ro\'yxatdan o\'tgan. Kirish sahifasiga o\'ting.',
    'auth.err_creds': 'Email yoki parol noto\'g\'ri', 'auth.err_rate': 'Juda ko\'p urinish. Birozdan so\'ng qayta urinib ko\'ring.',
    'ver.title': 'Kodni kiriting', 'ver.sent': '{email} manziliga tasdiqlash kodi yuborildi.',
    'ver.hint': 'Xat kelmasa, «Spam» papkasini ham tekshiring.', 'ver.confirm': 'Tasdiqlash',
    'ver.resend': 'Kodni qayta yuborish', 'ver.resend_in': 'Qayta yuborish: {s} s', 'ver.resent': 'Kod qayta yuborildi',
    'ver.bad': 'Kod noto\'g\'ri yoki eskirgan', 'ver.ok': 'Tasdiqlandi! Xush kelibsiz 🌱',
    'ver.back': 'Boshqa email',
    'rec.title': 'Parolni tiklash', 'rec.sub': 'Emailingizni kiriting — kod yuboramiz.', 'rec.send': 'Kod yuborish',
    'rec.new': 'Yangi parol', 'rec.save': 'Parolni saqlash', 'rec.done': 'Parol yangilandi',
    'pwa.installed': 'Ilova o\'rnatildi!', 'pwa.title': 'Ilovani o\'rnatish',
    'pwa.generic': 'Brauzer menyusidan «Ilovani o\'rnatish» yoki «Bosh ekranga qo\'shish» ni tanlang.',
    'pwa.ios_title': 'iPhone / iPad ga o\'rnatish',
    'pwa.ios_1': 'Safari brauzerida pastdagi <b>«Ulashish»</b> (⬆️) tugmasini bosing.',
    'pwa.ios_2': '<b>«Bosh ekranga qo\'shish»</b> ni tanlang.', 'pwa.ios_3': '<b>«Qo\'shish»</b> ni bosing — ilova ikonkasi paydo bo\'ladi.',
    'pwa.ios_note': 'Faqat Safari orqali ishlaydi (iOS 16.4+ da bildirishnomalar ham).',
  },
  ru: {
    'land.hero_a': 'Изучаем науку', 'land.hero_b': 'о жизни вместе',
    'land.sub': 'Видеоуроки, тесты с автоперемешиванием, группы и личные отчёты — единое приложение для изучения биологии.',
    'land.login': 'Войти', 'land.register': 'Регистрация', 'land.install': 'Установить приложение',
    'land.f1t': 'Видеоуроки', 'land.f1d': 'Последовательный просмотр, возврат в любое место и выбор качества.',
    'land.f2t': 'Умные тесты', 'land.f2d': 'Ответы перемешиваются каждый раз. В итоге — процент, разбор и мотивация.',
    'land.f3t': 'Группы', 'land.f3d': 'Чат с учителем, задания и голосовые сообщения в одном месте.',
    'land.f4t': 'Отчёты', 'land.f4d': 'Время обучения по дням и неделям, графики и результаты.',
    'land.topics': 'Темы, которые мы изучаем',
    'land.tp1': 'Клетка', 'land.tp2': 'Генетика и ДНК', 'land.tp3': 'Ботаника', 'land.tp4': 'Зоология', 'land.tp5': 'Анатомия человека', 'land.tp6': 'Экология',
    'land.fact': 'Знаете ли вы?',
    'fact1': 'В теле человека примерно 30–37 триллионов клеток.',
    'fact2': 'ДНК любых двух людей совпадает примерно на 99,9%.',
    'fact3': 'Около половины кислорода производят микроскопические водоросли океана (фитопланктон).',
    'fact4': 'Митохондрия — «энергостанция» клетки: именно здесь образуется АТФ.',
    'fact5': 'Сердце человека бьётся примерно 100 000 раз в сутки.',
    'fact6': 'У осьминога три сердца.',
    'fact7': 'ДНК одной клетки, если её растянуть, достигает примерно 2 метров.',
    'auth.login_t': 'Добро пожаловать в клетку', 'auth.login_s': 'Войдите в свой аккаунт',
    'auth.reg_t': 'Новая клетка — новый ученик', 'auth.reg_s': 'Зарегистрируйтесь и начните учиться',
    'auth.name': 'Имя и фамилия', 'auth.gender': 'Пол', 'auth.male': 'Мужской', 'auth.female': 'Женский',
    'auth.email': 'Email', 'auth.pass': 'Пароль', 'auth.pass2': 'Повторите пароль', 'auth.pass_hint': 'Минимум 8 символов',
    'auth.forgot': 'Забыли пароль?', 'auth.no_acc': 'Нет аккаунта?', 'auth.has_acc': 'Уже есть аккаунт?',
    'auth.err_pass_match': 'Пароли не совпадают', 'auth.err_pass_len': 'Пароль — минимум 8 символов',
    'auth.err_name': 'Введите имя и фамилию', 'auth.err_exists': 'Этот email уже зарегистрирован. Перейдите ко входу.',
    'auth.err_creds': 'Неверный email или пароль', 'auth.err_rate': 'Слишком много попыток. Повторите позже.',
    'ver.title': 'Введите код', 'ver.sent': 'Код подтверждения отправлен на {email}.',
    'ver.hint': 'Если письма нет, проверьте папку «Спам».', 'ver.confirm': 'Подтвердить',
    'ver.resend': 'Отправить код ещё раз', 'ver.resend_in': 'Повторно через {s} с', 'ver.resent': 'Код отправлен повторно',
    'ver.bad': 'Код неверный или устарел', 'ver.ok': 'Подтверждено! Добро пожаловать 🌱',
    'ver.back': 'Другой email',
    'rec.title': 'Восстановление пароля', 'rec.sub': 'Введите email — мы отправим код.', 'rec.send': 'Отправить код',
    'rec.new': 'Новый пароль', 'rec.save': 'Сохранить пароль', 'rec.done': 'Пароль обновлён',
    'pwa.installed': 'Приложение установлено!', 'pwa.title': 'Установка приложения',
    'pwa.generic': 'В меню браузера выберите «Установить приложение» или «Добавить на главный экран».',
    'pwa.ios_title': 'Установка на iPhone / iPad',
    'pwa.ios_1': 'В Safari нажмите кнопку <b>«Поделиться»</b> (⬆️) внизу.',
    'pwa.ios_2': 'Выберите <b>«На экран Домой»</b>.', 'pwa.ios_3': 'Нажмите <b>«Добавить»</b> — появится значок приложения.',
    'pwa.ios_note': 'Работает только через Safari (уведомления — на iOS 16.4+).',
  },
  en: {
    'land.hero_a': 'Let\'s explore', 'land.hero_b': 'the science of life',
    'land.sub': 'Video lessons, auto-shuffled tests, groups and personal reports — one app to learn biology.',
    'land.login': 'Log in', 'land.register': 'Sign up', 'land.install': 'Install the app',
    'land.f1t': 'Video lessons', 'land.f1d': 'Watch in order, jump back anywhere and pick the quality.',
    'land.f2t': 'Smart tests', 'land.f2d': 'Answers reshuffle every time. Get a score, review and motivation.',
    'land.f3t': 'Groups', 'land.f3d': 'Teacher chat, assignments and voice messages in one place.',
    'land.f4t': 'Reports', 'land.f4d': 'Daily and weekly study time, charts and results.',
    'land.topics': 'Topics we study',
    'land.tp1': 'The cell', 'land.tp2': 'Genetics & DNA', 'land.tp3': 'Botany', 'land.tp4': 'Zoology', 'land.tp5': 'Human anatomy', 'land.tp6': 'Ecology',
    'land.fact': 'Did you know?',
    'fact1': 'The human body contains roughly 30–37 trillion cells.',
    'fact2': 'Any two people share about 99.9% of their DNA.',
    'fact3': 'About half of the oxygen we breathe is produced by microscopic ocean algae (phytoplankton).',
    'fact4': 'Mitochondria are the cell\'s "power plants" — ATP is made there.',
    'fact5': 'A human heart beats around 100,000 times a day.',
    'fact6': 'An octopus has three hearts.',
    'fact7': 'The DNA in a single cell would stretch about 2 metres if unwound.',
    'auth.login_t': 'Welcome to the cell', 'auth.login_s': 'Log in to your account',
    'auth.reg_t': 'New cell — new learner', 'auth.reg_s': 'Sign up and start learning',
    'auth.name': 'Full name', 'auth.gender': 'Gender', 'auth.male': 'Male', 'auth.female': 'Female',
    'auth.email': 'Email', 'auth.pass': 'Password', 'auth.pass2': 'Repeat password', 'auth.pass_hint': 'At least 8 characters',
    'auth.forgot': 'Forgot password?', 'auth.no_acc': 'No account?', 'auth.has_acc': 'Already have an account?',
    'auth.err_pass_match': 'Passwords do not match', 'auth.err_pass_len': 'Password must be at least 8 characters',
    'auth.err_name': 'Enter your full name', 'auth.err_exists': 'This email is already registered. Please log in.',
    'auth.err_creds': 'Wrong email or password', 'auth.err_rate': 'Too many attempts. Try again later.',
    'ver.title': 'Enter the code', 'ver.sent': 'A confirmation code was sent to {email}.',
    'ver.hint': 'If you don\'t see it, check your Spam folder.', 'ver.confirm': 'Confirm',
    'ver.resend': 'Resend code', 'ver.resend_in': 'Resend in {s}s', 'ver.resent': 'Code sent again',
    'ver.bad': 'The code is wrong or expired', 'ver.ok': 'Confirmed! Welcome 🌱',
    'ver.back': 'Use another email',
    'rec.title': 'Reset password', 'rec.sub': 'Enter your email — we\'ll send a code.', 'rec.send': 'Send code',
    'rec.new': 'New password', 'rec.save': 'Save password', 'rec.done': 'Password updated',
    'pwa.installed': 'App installed!', 'pwa.title': 'Install the app',
    'pwa.generic': 'Use your browser menu: "Install app" or "Add to Home screen".',
    'pwa.ios_title': 'Install on iPhone / iPad',
    'pwa.ios_1': 'In Safari tap the <b>Share</b> button (⬆️) at the bottom.',
    'pwa.ios_2': 'Choose <b>Add to Home Screen</b>.', 'pwa.ios_3': 'Tap <b>Add</b> — the app icon appears.',
    'pwa.ios_note': 'Works through Safari only (notifications need iOS 16.4+).',
  },
});

addDict({
  uz: { 'pw.gen': 'Ishonchli parol yaratish', 'pw.gen_t': 'Ishonchli parol yaratildi', 'pw.gen_d': 'Uni albatta nusxalab oling yoki saqlang — keyin ko\'rsatilmaydi.',
    'pw.copy': 'Nusxalash', 'pw.copied': 'Nusxalandi', 'pw.use_save': 'Ishlatish va saqlash', 'pw.use': 'Faqat ishlatish', 'pw.save_q': 'Brauzer parolni saqlashni taklif qiladi — «Saqlash»ni tanlang. Keyingi safar kirishda u tayyor turadi.',
    'pw.weak': 'Parol juda oddiy. Harf, raqam va belgilarni aralashtiring yoki «Ishonchli parol yaratish» ni bosing.', 'pw.s0': 'Juda zaif', 'pw.s1': 'Zaif', 'pw.s2': 'O\'rtacha', 'pw.s3': 'Yaxshi', 'pw.s4': 'Juda ishonchli',
    'pw.saved_use': 'Saqlangan parol bilan kirish', 'auth.throttle': 'Juda ko\'p noto\'g\'ri urinish. {s} soniyadan keyin qayta urinib ko\'ring.',
    'auth.forgot_hint': 'Parol esingizdan chiqdimi? «Parolni unutdingizmi?» ni bosing — emailingizga kod yuboramiz.' },
  ru: { 'pw.gen': 'Создать надёжный пароль', 'pw.gen_t': 'Надёжный пароль создан', 'pw.gen_d': 'Обязательно скопируйте или сохраните его — потом он не показывается.',
    'pw.copy': 'Копировать', 'pw.copied': 'Скопировано', 'pw.use_save': 'Использовать и сохранить', 'pw.use': 'Только использовать', 'pw.save_q': 'Браузер предложит сохранить пароль — выберите «Сохранить». В следующий раз он подставится при входе.',
    'pw.weak': 'Пароль слишком простой. Смешайте буквы, цифры и символы или нажмите «Создать надёжный пароль».', 'pw.s0': 'Очень слабый', 'pw.s1': 'Слабый', 'pw.s2': 'Средний', 'pw.s3': 'Хороший', 'pw.s4': 'Очень надёжный',
    'pw.saved_use': 'Войти с сохранённым паролем', 'auth.throttle': 'Слишком много неверных попыток. Повторите через {s} сек.',
    'auth.forgot_hint': 'Забыли пароль? Нажмите «Забыли пароль?» — мы отправим код на email.' },
  en: { 'pw.gen': 'Generate a strong password', 'pw.gen_t': 'Strong password created', 'pw.gen_d': 'Be sure to copy or save it — it will not be shown again.',
    'pw.copy': 'Copy', 'pw.copied': 'Copied', 'pw.use_save': 'Use and save', 'pw.use': 'Use only', 'pw.save_q': 'Your browser will offer to save the password — choose “Save”. Next time it is ready at sign-in.',
    'pw.weak': 'Password is too simple. Mix letters, digits and symbols or tap “Generate a strong password”.', 'pw.s0': 'Very weak', 'pw.s1': 'Weak', 'pw.s2': 'Fair', 'pw.s3': 'Good', 'pw.s4': 'Very strong',
    'pw.saved_use': 'Sign in with saved password', 'auth.throttle': 'Too many wrong attempts. Try again in {s} s.',
    'auth.forgot_hint': 'Forgot your password? Tap “Forgot password?” — we email you a code.' },
});

const LANG_NAME = { uz: 'O\u02BBzbekcha', ru: 'Русский', en: 'English' };
// Bitta tugma: joriy til. Bossangiz boshqa ikki til chiqadi, tanlasangiz almashadi.
const langSwitch = () => `<div class="langdd"><button type="button" class="langcur" data-lcur aria-haspopup="true">🌐 ${LANG_NAME[state.lang]} <span class="caret">▾</span></button>
  <div class="langmenu" hidden>${['uz', 'ru', 'en'].filter(l => l !== state.lang).map(l => `<button type="button" data-lang="${l}">${LANG_NAME[l]}</button>`).join('')}</div></div>`;
function bindLang(el) {
  const dd = $('.langdd', el); if (!dd) return;
  const menu = $('.langmenu', dd);
  $('[data-lcur]', dd).onclick = e => { e.stopPropagation(); menu.hidden = !menu.hidden; };
  const close = () => { if (!dd.isConnected) return document.removeEventListener('click', close); menu.hidden = true; };
  document.addEventListener('click', close);
  $$('[data-lang]', dd).forEach(b => b.onclick = () => setLang(b.dataset.lang));
}

function authErr(e) {
  const m = (e?.message || '').toLowerCase();
  if (m.includes('banned')) return t('err.banned');
  if (m.includes('invalid login')) return t('auth.err_creds');
  if (m.includes('rate') || e?.status === 429) return t('auth.err_rate');
  if (m.includes('already')) return t('auth.err_exists');
  if (m.includes('expired') || m.includes('invalid') || m.includes('token')) return t('ver.bad');
  return friendlyErr(e?.message || String(e));
}

// ------------------------------------------------------------------ LANDING
route('/', async ({ el }) => {
  if (state.user) return go('/home', true);
  const facts = Array.from({ length: 7 }, (_, i) => 'fact' + (i + 1));
  const topics = [['🧫', 'land.tp1'], ['🧬', 'land.tp2'], ['🌿', 'land.tp3'], ['🦎', 'land.tp4'], ['🫀', 'land.tp5'], ['🌍', 'land.tp6']];
  const feats = [['video', 'f1'], ['test', 'f2'], ['users', 'f3'], ['chart', 'f4']];
  el.innerHTML = `
  <div class="landing">
    <header class="land-top"><div class="brand">🧬 <b>${esc(CONFIG.APP_NAME)}</b></div>${langSwitch()}
      <div class="land-cta"><a class="btn" href="#/login">${esc(t('land.login'))}</a><a class="btn ghost" href="#/register">${esc(t('land.register'))}</a></div></header>
    <section class="hero">
      <div class="hero-txt">
        <h1>${esc(t('land.hero_a'))}<br><span class="grad">${esc(t('land.hero_b'))}</span></h1>
        <p class="lead">${esc(t('land.sub'))}</p>
        <div class="row wrap">
          <button class="btn lg soft" id="inst" hidden>${ic('download')} ${esc(t('land.install'))}</button>
        </div>
        <div class="fact"><span class="tag">💡 ${esc(t('land.fact'))}</span><span id="fact">${esc(t(rand(facts)))}</span></div>
      </div>
      <div class="hero-art" id="art"></div>
    </section>
    <section class="feat-grid">
      ${feats.map(([i, k]) => `<div class="card feat"><div class="feat-ic">${ic(i, 26)}</div><h3>${esc(t('land.' + k + 't'))}</h3><p class="muted">${esc(t('land.' + k + 'd'))}</p></div>`).join('')}
    </section>
    <section class="topics"><h2>${esc(t('land.topics'))}</h2>
      <div class="chips">${topics.map(([e, k]) => `<span class="chip big">${e} ${esc(t(k))}</span>`).join('')}</div>
    </section>
    <footer class="land-foot muted small">© ${new Date().getFullYear()} ${esc(CONFIG.APP_NAME)} · 🌱</footer>
  </div>`;
  bindLang(el); dnaHelix($('#art', el), { rows: 18 });
  const inst = $('#inst', el); const upd = () => { inst.hidden = !canInstall(); }; upd();
  document.addEventListener('pwa-can-install', upd); inst.onclick = installApp;
  let fi = 0; const iv = setInterval(() => { if (!$('#fact')) return clearInterval(iv); $('#fact').textContent = t(facts[(fi++) % facts.length]); }, 6000);
});

// ------------------------------------------------------------------ shared auth shell
function shell(title, sub, body, { open = false, noLang = false } = {}) {
  return `<div class="auth-wrap">
    <div class="auth-art"><div id="aart">${cellSvg(open)}</div><div class="auth-dna" id="adna"></div></div>
    <div class="auth-card card">
      <div class="row between"><a class="brand" href="#/">🧬 <b>${esc(CONFIG.APP_NAME)}</b></a>${noLang ? '' : langSwitch()}</div>
      <h2>${esc(title)}</h2><p class="muted mb">${esc(sub)}</p>${body}
    </div></div>`;
}
const passField = (id, label, auto = 'current-password') => `<label class="fld"><span>${esc(label)}</span>
  <div class="pw"><input class="input" id="${id}" type="password" autocomplete="${auto}" required><button type="button" class="pw-eye" data-eye="${id}" aria-label="show">${ic('eye')}</button></div></label>`;
export const strengthBar = id => `<div class="pwmeter" data-for="${id}"><i></i><i></i><i></i><i></i><small></small></div>`;
export function bindStrength(el, id) {
  const inp = $('#' + id, el), box = $(`.pwmeter[data-for=${id}]`, el); if (!inp || !box) return;
  const upd = () => { const { score } = passScore(inp.value); $$('i', box).forEach((x, k) => x.className = inp.value && k < score ? 'on s' + score : ''); $('small', box).textContent = inp.value ? t('pw.s' + score) : ''; };
  inp.addEventListener('input', upd); upd(); box.update = upd;
}
// parol generatori (ro'yxatdan o'tish uchun)
function bindGenerator(el, st) {
  const btn = $('#gen', el); if (!btn) return;
  btn.onclick = () => {
    const pw = genPassword(14);
    const m = modal(`<div class="center"><div class="bigic">🔐</div><h3>${esc(t('pw.gen_t'))}</h3></div><code class="genpw" id="gp">${esc(pw)}</code>
      <p class="muted small">${esc(t('pw.gen_d'))}</p><p class="muted small">${esc(t('pw.save_q'))}</p>
      <div class="stack"><button class="btn" id="cp">${esc(t('pw.copy'))}</button><button class="btn lg" id="us">${esc(t('pw.use_save'))}</button><button class="btn ghost" id="uo">${esc(t('pw.use'))}</button></div>`);
    const fill = save => { $('#pw', el).value = pw; $('#pw2', el).value = pw; $('#pw', el).type = $('#pw2', el).type = 'text'; st.save = save; $$('.pwmeter', el).forEach(b => b.update?.()); m.close(); };
    $('#cp', m.el).onclick = async () => { try { await navigator.clipboard.writeText(pw); toast(t('pw.copied'), 'ok'); } catch { /* */ } };
    $('#us', m.el).onclick = () => fill(true); $('#uo', m.el).onclick = () => fill(false);
  };
}
// brauzerning parol saqlash oynasini ochish (Chrome/Edge/Android). Keyingi kirishda login sahifasi shuni taklif qiladi.
async function storeCred(email, password, name) {
  try { if (window.PasswordCredential) { await navigator.credentials.store(new PasswordCredential({ id: email, password, name })); localStorage.setItem('bio.hasCred', '1'); } } catch { /* */ }
}
function bindEyes(el) { $$('[data-eye]', el).forEach(b => b.onclick = () => { const i = $('#' + b.dataset.eye, el); i.type = i.type === 'password' ? 'text' : 'password'; }); }
function mountArt(el) { const d = $('#adna', el); if (d) dnaHelix(d, { rows: 14, w: 160, h: 300 }); bindLang(el); bindEyes(el); }

// ------------------------------------------------------------------ LOGIN
route('/login', async ({ el }) => {
  if (state.user) return go('/home', true);
  el.innerHTML = shell(t('auth.login_t'), t('auth.login_s'), `
    <form id="f" class="form">
      <label class="fld"><span>${esc(t('auth.email'))}</span><input class="input" id="em" type="email" autocomplete="email" inputmode="email" required></label>
      ${passField('pw', t('auth.pass'))}
      <div class="err" id="err"></div>
      <button class="btn lg block" id="go">${esc(t('land.login'))}</button>
      ${window.PasswordCredential && localStorage.getItem('bio.hasCred') ? `<button type="button" class="btn soft block mt" id="cred">🔑 ${esc(t('pw.saved_use'))}</button>` : ''}
      <div class="row between mt"><a href="#/forgot">${esc(t('auth.forgot'))}</a><span class="muted">${esc(t('auth.no_acc'))} <a href="#/register">${esc(t('land.register'))}</a></span></div>
    </form>`);
  mountArt(el);
  $('#cred', el)?.addEventListener('click', async () => {
    try { const c = await navigator.credentials.get({ password: true, mediation: 'optional' }); if (c?.password) { $('#em', el).value = c.id; $('#pw', el).value = c.password; } } catch { /* */ }
  });
  $('#f', el).onsubmit = async e => {
    e.preventDefault(); const b = $('#go', el); $('#err', el).textContent = '';
    // oddiy himoya: ketma-ket noto'g'ri urinishlardan keyin vaqtincha to'xtatish
    const th = JSON.parse(localStorage.getItem('bio.loginfail') || '{"n":0,"until":0}');
    if (th.until > Date.now()) return $('#err', el).textContent = t('auth.throttle', { s: Math.ceil((th.until - Date.now()) / 1000) });
    btnBusy(b, true);
    const email = $('#em', el).value.trim().toLowerCase();
    const { error } = await sb.auth.signInWithPassword({ email, password: $('#pw', el).value });
    btnBusy(b, false);
    if (!error) localStorage.removeItem('bio.loginfail');
    else if (/invalid login/i.test(error.message || '')) { th.n++; if (th.n >= 5) { th.until = Date.now() + Math.min(600, 30 * (th.n - 4)) * 1000; } localStorage.setItem('bio.loginfail', JSON.stringify(th)); }
    if (error) {
      if ((error.message || '').toLowerCase().includes('not confirmed')) { await sb.auth.resend({ type: 'signup', email }); return go('/verify?type=signup&email=' + encodeURIComponent(email)); }
      $('#err', el).textContent = authErr(error) + (/invalid login/i.test(error.message || '') ? '\n' + t('auth.forgot_hint') : '');
    }
    // muvaffaqiyatli bo'lsa main.js dagi onAuthStateChange yo'naltiradi
  };
});

// ------------------------------------------------------------------ REGISTER
route('/register', async ({ el }) => {
  if (state.user) return go('/home', true);
  el.innerHTML = shell(t('auth.reg_t'), t('auth.reg_s'), `
    <form id="f" class="form">
      <label class="fld"><span>${esc(t('auth.name'))}</span><input class="input" id="nm" autocomplete="name" required></label>
      <div class="fld"><span>${esc(t('auth.gender'))}</span>
        <div class="seg"><label><input type="radio" name="g" value="m" checked><span>${esc(t('auth.male'))}</span></label><label><input type="radio" name="g" value="f"><span>${esc(t('auth.female'))}</span></label></div></div>
      <label class="fld"><span>${esc(t('auth.email'))}</span><input class="input" id="em" type="email" autocomplete="email" inputmode="email" required></label>
      ${passField('pw', t('auth.pass'), 'new-password')}${strengthBar('pw')}
      ${passField('pw2', t('auth.pass2'), 'new-password')}
      <button type="button" class="btn soft" id="gen">🔐 ${esc(t('pw.gen'))}</button>
      <small class="muted">${esc(t('auth.pass_hint'))}</small>
      <div class="err" id="err"></div>
      <button class="btn lg block" id="go">${esc(t('land.register'))}</button>
      <p class="center muted mt">${esc(t('auth.has_acc'))} <a href="#/login">${esc(t('land.login'))}</a></p>
    </form>`);
  mountArt(el);
  const st = { save: false }; bindStrength(el, 'pw'); bindGenerator(el, st);
  $('#f', el).onsubmit = async e => {
    e.preventDefault(); const err = $('#err', el); err.textContent = '';
    const name = $('#nm', el).value.trim(), email = $('#em', el).value.trim().toLowerCase(), p1 = $('#pw', el).value, p2 = $('#pw2', el).value;
    if (name.length < 3) return err.textContent = t('auth.err_name');
    if (p1.length < 8) return err.textContent = t('auth.err_pass_len');
    if (passScore(p1).issue) return err.textContent = t('pw.weak');
    if (p1 !== p2) return err.textContent = t('auth.err_pass_match');
    const b = $('#go', el); btnBusy(b, true);
    const { data, error } = await sb.auth.signUp({ email, password: p1, options: { data: { full_name: name, gender: $('input[name=g]:checked', el).value, lang: state.lang } } });
    btnBusy(b, false);
    if (error) return err.textContent = authErr(error);
    if (data.user && data.user.identities && data.user.identities.length === 0) return err.textContent = t('auth.err_exists');
    if (st.save) await storeCred(email, p1, name);
    if (!data.session) go('/verify?type=signup&email=' + encodeURIComponent(email));
  };
});

// ------------------------------------------------------------------ VERIFY (email OTP)
route('/verify', async ({ el, q }) => {
  const email = q.email || '', type = q.type === 'recovery' ? 'recovery' : 'signup';
  if (!email) return go('/login', true);
  el.innerHTML = shell(t('ver.title'), t('ver.sent', { email }), `
    <form id="f" class="form">
      <input class="input otp" id="otp" inputmode="numeric" autocomplete="one-time-code" maxlength="${CONFIG.OTP_LENGTH}" placeholder="${'•'.repeat(CONFIG.OTP_LENGTH)}" required>
      <small class="muted">${esc(t('ver.hint'))}</small>
      <div class="err" id="err"></div>
      <button class="btn lg block" id="go">${esc(t('ver.confirm'))}</button>
      <div class="row between mt"><button type="button" class="link" id="rs"></button><a href="#/${type === 'signup' ? 'register' : 'forgot'}">${esc(t('ver.back'))}</a></div>
    </form>`, { noLang: true });
  mountArt(el);
  const otp = $('#otp', el); otp.focus();
  let cd = 60, iv; const rs = $('#rs', el);
  const tickCd = () => { if (!rs.isConnected) return clearInterval(iv); if (cd > 0) { rs.disabled = true; rs.textContent = t('ver.resend_in', { s: cd-- }); } else { rs.disabled = false; rs.textContent = t('ver.resend'); clearInterval(iv); } };
  iv = setInterval(tickCd, 1000); tickCd();
  rs.onclick = async () => {
    const r = type === 'signup' ? await sb.auth.resend({ type: 'signup', email }) : await sb.auth.resetPasswordForEmail(email);
    if (r.error) return toast(authErr(r.error), 'err');
    toast(t('ver.resent'), 'ok'); cd = 60; iv = setInterval(tickCd, 1000); tickCd();
  };
  const submit = async () => {
    const token = otp.value.replace(/\D/g, ''); if (token.length < 6) return;
    const b = $('#go', el); btnBusy(b, true); $('#err', el).textContent = '';
    const { error } = await sb.auth.verifyOtp({ email, token, type });
    btnBusy(b, false);
    if (error) { $('#err', el).textContent = authErr(error); otp.select(); return; }
    $('#aart', el).innerHTML = cellSvg(true); toast(t('ver.ok'), 'ok');
    if (type === 'recovery') go('/newpass', true);
    // signup: onAuthStateChange → /home
  };
  $('#f', el).onsubmit = e => { e.preventDefault(); submit(); };
  otp.oninput = () => { otp.value = otp.value.replace(/\D/g, '').slice(0, CONFIG.OTP_LENGTH); if (otp.value.length === CONFIG.OTP_LENGTH) submit(); };
});

// ------------------------------------------------------------------ FORGOT / NEW PASSWORD
route('/forgot', async ({ el }) => {
  el.innerHTML = shell(t('rec.title'), t('rec.sub'), `
    <form id="f" class="form">
      <label class="fld"><span>${esc(t('auth.email'))}</span><input class="input" id="em" type="email" inputmode="email" required></label>
      <div class="err" id="err"></div>
      <button class="btn lg block" id="go">${esc(t('rec.send'))}</button>
      <p class="center mt"><a href="#/login">${esc(t('land.login'))}</a></p>
    </form>`, { noLang: true });
  mountArt(el);
  $('#f', el).onsubmit = async e => {
    e.preventDefault(); const b = $('#go', el); btnBusy(b, true);
    const email = $('#em', el).value.trim().toLowerCase();
    const { error } = await sb.auth.resetPasswordForEmail(email); btnBusy(b, false);
    if (error) return $('#err', el).textContent = authErr(error);
    go('/verify?type=recovery&email=' + encodeURIComponent(email));
  };
});

route('/newpass', async ({ el }) => {
  if (!state.user) return go('/login', true);
  el.innerHTML = shell(t('rec.new'), '', `
    <form id="f" class="form">${passField('pw', t('rec.new'), 'new-password')}${strengthBar('pw')}${passField('pw2', t('auth.pass2'), 'new-password')}
      <div class="err" id="err"></div><button class="btn lg block" id="go">${esc(t('rec.save'))}</button></form>`, { open: true, noLang: true });
  mountArt(el); bindStrength(el, 'pw');
  $('#f', el).onsubmit = async e => {
    e.preventDefault(); const p1 = $('#pw', el).value, p2 = $('#pw2', el).value, err = $('#err', el);
    if (p1.length < 8) return err.textContent = t('auth.err_pass_len');
    if (passScore(p1).issue) return err.textContent = t('pw.weak');
    if (p1 !== p2) return err.textContent = t('auth.err_pass_match');
    const b = $('#go', el); btnBusy(b, true);
    const { error } = await sb.auth.updateUser({ password: p1 }); btnBusy(b, false);
    if (error) return err.textContent = authErr(error);
    toast(t('rec.done'), 'ok'); go('/home');
  };
});
