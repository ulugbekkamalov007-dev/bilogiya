// Guruhlar: so'rov bilan qo'shilish, chat, vazifalar (alohida bo'lim), a'zolarni boshqarish, xavfsizlik sozlamalari
import { sb, state, t, tr, addDict, route, go, onLeave, esc, ic, $, $$, modal, toast, friendlyErr, signedUrl, confirmDlg, btnBusy, fmtDate, fmtTime, fmtDur, spinner } from './core.js';
import { mountChat } from './chat.js';
import { testImportModal } from './tests.js';
import { openReader } from './reader.js';
import { startRecording, uploadAttachment, uploadVoice, mediaHtml, fillMedia, MAX_FILE } from './media.js';

addDict({
  uz: { 'grp.f_audio': 'Audio javoblar soni', 'grp.f_book': 'Kitob', 'grp.bk_none': 'Kitobsiz', 'grp.bk_up': '📱 Telefondan yuklash', 'grp.bk_app': 'Ilovadagi kitob', 'grp.new_test': 'Shu dars uchun yangi test yaratish', 'grp.read_book': 'Kitobni o\'qish', 'grp.audios': 'Audio javoblar', 'grp.slot_empty': 'Audio qo\'shing', 'grp.rec_now': 'Ovoz yozish', 'grp.pick_file': 'Telefondan fayl', 'grp.rec_stop': 'To\'xtatish va saqlash', 'grp.test_made': 'Test yaratildi', 'grp.pick_book': 'Kitob faylini tanlang (PDF, Word, PowerPoint)', 'grp.title': 'Guruhlar', 'grp.vis': 'Guruhni kimlar topa oladi?', 'grp.vis_all': 'Hamma (qidiruvda chiqadi)', 'grp.vis_free': 'Hech bir guruhda yo\'qlar (mavjud a\'zolarga ko\'rinmaydi)', 'grp.vis_priv': 'Hech kim — faqat men qo\'shaman', 'grp.add_m': 'A\'zo qo\'shish', 'grp.add_ph': 'Ism yoki email yozing…', 'grp.added': 'Qo\'shildi', 'grp.in': 'Guruhda', 'grp.test_att': 'Test biriktirish (ixtiyoriy)', 'grp.no_test': 'Testsiz', 'grp.take_test': 'Testni boshlash', 'grp.ov': 'Natijalar', 'grp.ov_sent': 'Topshirdi', 'grp.ov_audio': 'Audio', 'grp.ov_text': 'Matn', 'grp.ov_file': 'Fayl', 'grp.ov_test': 'Test o\'rtacha', 'grp.ov_none': 'Topshirmagan', 'grp.attempts': 'urinish', 'grp.best': 'Eng yaxshi', 'grp.my': 'Mening guruhlarim', 'grp.none': 'Hali guruhga qo\'shilmagansiz', 'grp.find': 'Guruh qidirish', 'grp.find_ph': 'Guruh nomini yozing…',
    'grp.join': 'So\'rov yuborish', 'grp.sent': 'So\'rov yuborildi', 'grp.pending': 'Tasdiq kutilmoqda', 'grp.new': 'Yangi guruh', 'grp.name': 'Guruh nomi', 'grp.desc': 'Tavsif',
    'grp.created': 'Guruh yaratildi', 'grp.tab_chat': 'Chat', 'grp.tab_tasks': 'Vazifalar', 'grp.tab_members': 'A\'zolar', 'grp.tab_set': 'Sozlamalar', 'grp.help': 'Yordam / murojaat',
    'grp.leave': 'Guruhdan chiqish', 'grp.new_task': 'Yangi vazifa', 'grp.task_title': 'Vazifa nomi', 'grp.task_body': 'Topshiriq matni', 'grp.due': 'Muddat', 'grp.no_tasks': 'Vazifalar yo\'q',
    'grp.done': 'Topshirilgan', 'grp.todo': 'Topshirilmagan', 'grp.closed': 'Yopilgan', 'grp.overdue': 'Muddati o\'tgan', 'grp.submit': 'Topshirish', 'grp.your_work': 'Sizning ishingiz',
    'grp.text_ph': 'Javob matni…', 'grp.rec': 'Ovoz yozish', 'grp.stop': 'To\'xtatish', 'grp.submitted': 'Topshirildi ✔', 'grp.subs': 'Topshirilganlar', 'grp.grade': 'Baho (0–100)', 'grp.feedback': 'Izoh',
    'grp.save': 'Saqlash', 'grp.discuss': 'Vazifa muhokamasi', 'grp.pending_list': 'So\'rovlar', 'grp.members_list': 'A\'zolar', 'grp.approve': 'Qabul qilish', 'grp.reject': 'Rad etish', 'grp.block': 'Bloklash',
    'grp.remove': 'Chiqarish', 'grp.msg': 'Yozish', 'grp.can_chat': 'Talabalar chatga yozishi mumkin', 'grp.names': 'Talaba ismi chatda', 'grp.n_first': 'Faqat ism', 'grp.n_full': 'To\'liq ism', 'grp.n_anon': 'Anonim (Talaba #1234)',
    'grp.privacy': 'Talabalar bir-birining ro\'yxati, profili va shaxsiy xabarlarini ko\'rmaydi. Shikoyat tugmasi har bir xabarda bor.', 'grp.archive': 'Arxivlash', 'grp.delete': 'Guruhni o\'chirish',
    'grp.rep_title': 'Xabar ustidan shikoyat', 'grp.rep_ph': 'Sababini yozing (ixtiyoriy)', 'grp.rep_sent': 'Shikoyat adminga yuborildi', 'grp.pending_n': '{n} ta so\'rov', 'grp.empty_members': 'A\'zolar yo\'q',
    'grp.too_big': 'Fayl 10 MB dan katta', 'grp.open': 'Ochish', 'grp.closed_task': 'Vazifa yopilgan', 'grp.close_task': 'Yopish', 'grp.reopen': 'Qayta ochish', 'grp.new_task_msg': '📌 Yangi vazifa: {t}' },
  ru: { 'grp.f_audio': 'Число аудио-ответов', 'grp.f_book': 'Книга', 'grp.bk_none': 'Без книги', 'grp.bk_up': '📱 Загрузить с телефона', 'grp.bk_app': 'Книга из приложения', 'grp.new_test': 'Создать новый тест для этого урока', 'grp.read_book': 'Читать книгу', 'grp.audios': 'Аудио-ответы', 'grp.slot_empty': 'Добавьте аудио', 'grp.rec_now': 'Записать голос', 'grp.pick_file': 'Файл с телефона', 'grp.rec_stop': 'Остановить и сохранить', 'grp.test_made': 'Тест создан', 'grp.pick_book': 'Выберите файл книги (PDF, Word, PowerPoint)', 'grp.title': 'Группы', 'grp.vis': 'Кто может найти группу?', 'grp.vis_all': 'Все (видна в поиске)', 'grp.vis_free': 'Те, кто ни в одной группе (текущим участникам не видна)', 'grp.vis_priv': 'Никто — добавляю только я', 'grp.add_m': 'Добавить участника', 'grp.add_ph': 'Имя или email…', 'grp.added': 'Добавлен', 'grp.in': 'В группе', 'grp.test_att': 'Прикрепить тест (необязательно)', 'grp.no_test': 'Без теста', 'grp.take_test': 'Начать тест', 'grp.ov': 'Результаты', 'grp.ov_sent': 'Сдали', 'grp.ov_audio': 'Аудио', 'grp.ov_text': 'Текст', 'grp.ov_file': 'Файл', 'grp.ov_test': 'Тест, средний', 'grp.ov_none': 'Не сдал(а)', 'grp.attempts': 'попыток', 'grp.best': 'Лучший', 'grp.my': 'Мои группы', 'grp.none': 'Вы ещё не вступили ни в одну группу', 'grp.find': 'Поиск группы', 'grp.find_ph': 'Введите название группы…',
    'grp.join': 'Подать заявку', 'grp.sent': 'Заявка отправлена', 'grp.pending': 'Ожидает подтверждения', 'grp.new': 'Новая группа', 'grp.name': 'Название группы', 'grp.desc': 'Описание',
    'grp.created': 'Группа создана', 'grp.tab_chat': 'Чат', 'grp.tab_tasks': 'Задания', 'grp.tab_members': 'Участники', 'grp.tab_set': 'Настройки', 'grp.help': 'Помощь / обращение',
    'grp.leave': 'Выйти из группы', 'grp.new_task': 'Новое задание', 'grp.task_title': 'Название задания', 'grp.task_body': 'Текст задания', 'grp.due': 'Срок', 'grp.no_tasks': 'Заданий нет',
    'grp.done': 'Сдано', 'grp.todo': 'Не сдано', 'grp.closed': 'Закрыто', 'grp.overdue': 'Просрочено', 'grp.submit': 'Сдать', 'grp.your_work': 'Ваша работа',
    'grp.text_ph': 'Текст ответа…', 'grp.rec': 'Записать голос', 'grp.stop': 'Остановить', 'grp.submitted': 'Сдано ✔', 'grp.subs': 'Сданные работы', 'grp.grade': 'Оценка (0–100)', 'grp.feedback': 'Комментарий',
    'grp.save': 'Сохранить', 'grp.discuss': 'Обсуждение задания', 'grp.pending_list': 'Заявки', 'grp.members_list': 'Участники', 'grp.approve': 'Принять', 'grp.reject': 'Отклонить', 'grp.block': 'Заблокировать',
    'grp.remove': 'Исключить', 'grp.msg': 'Написать', 'grp.can_chat': 'Ученики могут писать в чат', 'grp.names': 'Имя ученика в чате', 'grp.n_first': 'Только имя', 'grp.n_full': 'Полное имя', 'grp.n_anon': 'Аноним (Ученик #1234)',
    'grp.privacy': 'Ученики не видят список, профили и личные сообщения друг друга. У каждого сообщения есть кнопка жалобы.', 'grp.archive': 'В архив', 'grp.delete': 'Удалить группу',
    'grp.rep_title': 'Жалоба на сообщение', 'grp.rep_ph': 'Укажите причину (необязательно)', 'grp.rep_sent': 'Жалоба отправлена админу', 'grp.pending_n': 'Заявок: {n}', 'grp.empty_members': 'Участников нет',
    'grp.too_big': 'Файл больше 10 МБ', 'grp.open': 'Открыть', 'grp.closed_task': 'Задание закрыто', 'grp.close_task': 'Закрыть', 'grp.reopen': 'Открыть снова', 'grp.new_task_msg': '📌 Новое задание: {t}' },
  en: { 'grp.f_audio': 'Number of audio answers', 'grp.f_book': 'Book', 'grp.bk_none': 'No book', 'grp.bk_up': '📱 Upload from phone', 'grp.bk_app': 'Book from the app', 'grp.new_test': 'Create a new test for this lesson', 'grp.read_book': 'Read the book', 'grp.audios': 'Audio answers', 'grp.slot_empty': 'Add audio', 'grp.rec_now': 'Record voice', 'grp.pick_file': 'File from phone', 'grp.rec_stop': 'Stop and save', 'grp.test_made': 'Test created', 'grp.pick_book': 'Choose a book file (PDF, Word, PowerPoint)', 'grp.title': 'Groups', 'grp.vis': 'Who can find this group?', 'grp.vis_all': 'Everyone (shown in search)', 'grp.vis_free': 'People in no group yet (hidden from current members)', 'grp.vis_priv': 'Nobody — I add people myself', 'grp.add_m': 'Add member', 'grp.add_ph': 'Name or email…', 'grp.added': 'Added', 'grp.in': 'In group', 'grp.test_att': 'Attach a test (optional)', 'grp.no_test': 'No test', 'grp.take_test': 'Start test', 'grp.ov': 'Results', 'grp.ov_sent': 'Submitted', 'grp.ov_audio': 'Audio', 'grp.ov_text': 'Text', 'grp.ov_file': 'File', 'grp.ov_test': 'Test average', 'grp.ov_none': 'Not submitted', 'grp.attempts': 'attempts', 'grp.best': 'Best', 'grp.my': 'My groups', 'grp.none': 'You haven\'t joined any group yet', 'grp.find': 'Find a group', 'grp.find_ph': 'Type the group name…',
    'grp.join': 'Request to join', 'grp.sent': 'Request sent', 'grp.pending': 'Awaiting approval', 'grp.new': 'New group', 'grp.name': 'Group name', 'grp.desc': 'Description',
    'grp.created': 'Group created', 'grp.tab_chat': 'Chat', 'grp.tab_tasks': 'Assignments', 'grp.tab_members': 'Members', 'grp.tab_set': 'Settings', 'grp.help': 'Help / contact',
    'grp.leave': 'Leave group', 'grp.new_task': 'New assignment', 'grp.task_title': 'Assignment title', 'grp.task_body': 'Instructions', 'grp.due': 'Due', 'grp.no_tasks': 'No assignments',
    'grp.done': 'Submitted', 'grp.todo': 'Not submitted', 'grp.closed': 'Closed', 'grp.overdue': 'Overdue', 'grp.submit': 'Submit', 'grp.your_work': 'Your work',
    'grp.text_ph': 'Your answer…', 'grp.rec': 'Record voice', 'grp.stop': 'Stop', 'grp.submitted': 'Submitted ✔', 'grp.subs': 'Submissions', 'grp.grade': 'Grade (0–100)', 'grp.feedback': 'Feedback',
    'grp.save': 'Save', 'grp.discuss': 'Assignment discussion', 'grp.pending_list': 'Requests', 'grp.members_list': 'Members', 'grp.approve': 'Approve', 'grp.reject': 'Reject', 'grp.block': 'Block',
    'grp.remove': 'Remove', 'grp.msg': 'Message', 'grp.can_chat': 'Students can post in chat', 'grp.names': 'Student name in chat', 'grp.n_first': 'First name only', 'grp.n_full': 'Full name', 'grp.n_anon': 'Anonymous (Student #1234)',
    'grp.privacy': 'Students can\'t see each other\'s list, profiles or private messages. Every message has a report button.', 'grp.archive': 'Archive', 'grp.delete': 'Delete group',
    'grp.rep_title': 'Report this message', 'grp.rep_ph': 'Reason (optional)', 'grp.rep_sent': 'Report sent to the admin', 'grp.pending_n': '{n} requests', 'grp.empty_members': 'No members',
    'grp.too_big': 'File is larger than 10 MB', 'grp.open': 'Open', 'grp.closed_task': 'Assignment closed', 'grp.close_task': 'Close', 'grp.reopen': 'Reopen', 'grp.new_task_msg': '📌 New assignment: {t}' },
});

// ------------------------------------------------------------------ RO'YXAT
route('/groups', async ({ el, alive }) => {
  const uid = state.user.id; let groups = [], pend = {};
  if (state.isAdmin) {
    const [g, p] = await Promise.all([sb.from('groups').select('*').eq('archived', false).order('created_at', { ascending: false }), sb.from('group_members').select('group_id').eq('status', 'pending')]);
    groups = (g.data || []).map(x => ({ ...x, status: 'approved' })); (p.data || []).forEach(r => pend[r.group_id] = (pend[r.group_id] || 0) + 1);
  } else {
    const { data: ms } = await sb.from('group_members').select('group_id,status').eq('user_id', uid);
    const ids = (ms || []).map(m => m.group_id);
    const pub = ids.length ? (await sb.from('groups_public').select('*').in('id', ids)).data || [] : [];
    groups = (ms || []).map(m => ({ ...(pub.find(p => p.id === m.group_id) || { id: m.group_id, name: '…', description: '' }), status: m.status })).filter(g => g.name !== '…');
  }
  if (!alive()) return;
  const draw = () => {
    el.innerHTML = `<div class="page"><div class="row between mb"><h1>${esc(t('grp.title'))}</h1>${state.isAdmin ? `<button class="btn" id="new">${ic('plus')} ${esc(t('grp.new'))}</button>` : ''}</div>
      ${groups.length ? `<div class="cards">${groups.map(g => `<a class="card pad item-row" href="${g.status === 'approved' ? '#/group/' + g.id : '#/groups'}">
        <span class="item-ic users">${ic('users')}</span><div class="grow"><b>${esc(g.name)}</b><small class="muted">${esc(g.description || '')}</small>
        ${g.status === 'pending' ? `<span class="chip warn">${esc(t('grp.pending'))}</span>` : ''}${pend[g.id] ? `<span class="chip warn">${esc(t('grp.pending_n', { n: pend[g.id] }))}</span>` : ''}</div>${g.status === 'approved' ? ic('chev') : ''}</a>`).join('')}</div>` : `<p class="muted">${esc(t('grp.none'))}</p>`}
      ${state.isAdmin ? '' : `<h3 class="mt">${esc(t('grp.find'))}</h3><input class="input" id="q" placeholder="${esc(t('grp.find_ph'))}"><div id="res" class="cards mt"></div>`}</div>`;
    $('#new', el)?.addEventListener('click', createGroup);
    const q = $('#q', el); if (!q) return; let to;
    q.oninput = () => { clearTimeout(to); to = setTimeout(async () => {
      const v = q.value.trim(); if (v.length < 2) { $('#res', el).innerHTML = ''; return; }
      const { data } = await sb.from('groups_public').select('*').ilike('name', `%${v}%`).limit(15);
      $('#res', el).innerHTML = (data || []).map(g => { const mine = groups.find(x => x.id === g.id); return `<div class="card pad item-row"><span class="item-ic users">${ic('users')}</span><div class="grow"><b>${esc(g.name)}</b><small class="muted">${esc(g.description || '')}</small></div>
        ${mine ? `<span class="chip">${esc(t(mine.status === 'pending' ? 'grp.pending' : 'grp.my'))}</span>` : `<button class="btn sm" data-j="${g.id}">${esc(t('grp.join'))}</button>`}</div>`; }).join('');
      $$('[data-j]', el).forEach(b => b.onclick = async () => { const { error } = await sb.rpc('request_join', { p_group: b.dataset.j }); if (error) return toast(error.message, 'err'); toast(t('grp.sent'), 'ok'); groups.push({ id: b.dataset.j, name: '…', status: 'pending' }); b.outerHTML = `<span class="chip">${esc(t('grp.pending'))}</span>`; });
    }, 300); };
  };
  draw();
  function createGroup() {
    const m = modal(`<h3>${esc(t('grp.new'))}</h3><form class="form" id="f"><label class="fld"><span>${esc(t('grp.name'))}</span><input class="input" id="n" required maxlength="80"></label>
      <label class="fld"><span>${esc(t('grp.desc'))}</span><textarea class="input" id="d" rows="2"></textarea></label>
      <label class="fld"><span>${esc(t('grp.vis'))}</span><select class="input" id="vz"><option value="all">${esc(t('grp.vis_all'))}</option><option value="free">${esc(t('grp.vis_free'))}</option><option value="private">${esc(t('grp.vis_priv'))}</option></select></label><button class="btn lg block">${esc(t('grp.new'))}</button></form>`);
    $('#f', m.el).onsubmit = async e => { e.preventDefault(); const { data, error } = await sb.from('groups').insert({ name: $('#n', m.el).value.trim(), description: $('#d', m.el).value.trim(), owner_id: uid, visibility: $('#vz', m.el).value }).select().single();
      if (error) return toast(error.message, 'err'); toast(t('grp.created'), 'ok'); m.close(); go('/group/' + data.id + '?tab=members'); };
  }
}, { auth: true });

// ------------------------------------------------------------------ GURUH SAHIFASI
route('/group/:id', async ({ el, params, alive, q }) => {
  const gid = params.id, uid = state.user.id;
  const { data: g } = await sb.from('groups').select('*').eq('id', gid).maybeSingle();
  if (!alive()) return; if (!g) return go('/groups', true);
  document.body.classList.add('fs-read', 'fs-chat'); onLeave(() => document.body.classList.remove('fs-read', 'fs-chat'));
  const tabs = [['chat', 'grp.tab_chat'], ['tasks', 'grp.tab_tasks'], ...(state.isAdmin ? [['members', 'grp.tab_members'], ['set', 'grp.tab_set']] : [])];
  let tab = q.tab || 'chat', chat = null;
  const paint = async () => {
    chat?.destroy(); chat = null;
    el.innerHTML = `<div class="page chatpage fsg"><div class="row between"><div class="row"><a class="btn ghost sm" href="#/groups">${ic('back')}</a><div><h2 class="mb0">${esc(g.name)}</h2><small class="muted">${esc(g.description || '')}</small></div></div>
      ${state.isAdmin ? '' : `<a class="btn ghost sm" href="#/inbox?topic=help&ctx=${encodeURIComponent(g.name)}">${ic('help', 16)} ${esc(t('grp.help'))}</a>`}</div>
      <div class="tabs">${tabs.map(([k, l]) => `<button class="${k === tab ? 'on' : ''}" data-tab="${k}">${esc(t(l))}</button>`).join('')}</div><div id="body"></div></div>`;
    $$('[data-tab]', el).forEach(b => b.onclick = () => { tab = b.dataset.tab; paint(); });
    const body = $('#body', el);
    if (tab === 'chat') {
      chat = mountChat(body, { table: 'messages', filterCol: 'group_id', filterVal: gid, scope: qq => qq.is('assignment_id', null), accept: m => !m.assignment_id,
        insertBase: { group_id: gid }, folder: `${gid}/${uid}`, canWrite: state.isAdmin || g.students_can_chat, reply: true,
        canDelete: m => state.isAdmin || m.user_id === uid, onReport: reportMessage });
      onLeave(() => chat?.destroy());
    } else if (tab === 'tasks') await tasksTab(body); else if (tab === 'members') await membersTab(body); else if (tab === 'set') settingsTab(body);
  };
  function reportMessage(mid) {
    const m = modal(`<h3>${ic('flag')} ${esc(t('grp.rep_title'))}</h3><textarea class="input" id="r" rows="3" placeholder="${esc(t('grp.rep_ph'))}"></textarea><div class="row end mt"><button class="btn danger" id="ok">${esc(t('chat.report'))}</button></div>`);
    $('#ok', m.el).onclick = async () => { await sb.from('message_reports').insert({ reporter: uid, message_id: mid, group_id: gid, reason: $('#r', m.el).value.trim() }); toast(t('grp.rep_sent'), 'ok'); m.close(); };
  }
  async function tasksTab(body) {
    const [{ data: as }, { data: mine }] = await Promise.all([sb.from('assignments').select('*').eq('group_id', gid).order('created_at', { ascending: false }), sb.from('submissions').select('assignment_id').eq('group_id', gid).eq('user_id', uid)]);
    const done = new Set((mine || []).map(x => x.assignment_id));
    const books = state.isAdmin ? ((await sb.from('items').select('id,title,kind').in('kind', ['book', 'pdf', 'presentation']).order('created_at', { ascending: false })).data || []) : [];
    const tests = state.isAdmin ? ((await sb.from('items').select('id,title').eq('kind', 'test').order('created_at', { ascending: false })).data || []) : [];
    body.innerHTML = `${state.isAdmin ? `<button class="btn mb" id="nt">${ic('plus')} ${esc(t('grp.new_task'))}</button>` : ''}
      ${(as || []).length ? `<div class="cards">${as.map(a => { const od = a.due_at && new Date(a.due_at) < new Date() && !a.closed;
        return `<a class="card pad item-row" href="#/group/${gid}/task/${a.id}"><span class="item-ic book">${ic('test')}</span><div class="grow"><b>${esc(a.title)}</b>
        <small class="muted">${a.due_at ? esc(fmtDate(a.due_at) + ' ' + fmtTime(a.due_at)) : ''}</small>
        <div class="chips">${a.closed ? `<span class="chip">${esc(t('grp.closed'))}</span>` : ''}${od ? `<span class="chip warn">${esc(t('grp.overdue'))}</span>` : ''}${!state.isAdmin ? `<span class="chip ${done.has(a.id) ? 'ok' : ''}">${esc(t(done.has(a.id) ? 'grp.done' : 'grp.todo'))}</span>` : ''}</div></div>${ic('chev')}</a>`; }).join('')}</div>` : `<p class="muted">${esc(t('grp.no_tasks'))}</p>`}`;
    $('#nt', body)?.addEventListener('click', () => {
      const m = modal(`<h3>${esc(t('grp.new_task'))}</h3><form class="form" id="f"><label class="fld"><span>${esc(t('grp.task_title'))}</span><input class="input" id="ti" required></label>
        <label class="fld"><span>${esc(t('grp.task_body'))}</span><textarea class="input" id="bo" rows="4"></textarea></label><label class="fld"><span>${esc(t('grp.f_audio'))}</span><input class="input" id="as" type="number" min="0" max="20" value="5" style="max-width:110px"></label>
        <label class="fld"><span>${esc(t('grp.f_book'))}</span><select class="input" id="bk"><option value="">${esc(t('grp.bk_none'))}</option><option value="_up">${esc(t('grp.bk_up'))}</option>${books.map(x => `<option value="${x.id}">${esc(tr(x.title))}</option>`).join('')}</select></label><input type="file" id="bkf" accept=".pdf,.doc,.docx,.ppt,.pptx" hidden>
        <label class="fld"><span>${esc(t('grp.test_att'))}</span><select class="input" id="tt"><option value="">${esc(t('grp.no_test'))}</option>${tests.map(x => `<option value="${x.id}">${esc(tr(x.title))}</option>`).join('')}</select></label><button type="button" class="btn soft sm" id="mt">${ic('plus', 14)} ${esc(t('grp.new_test'))}</button><label class="fld"><span>${esc(t('grp.due'))}</span><input class="input" id="du" type="datetime-local"></label><button class="btn lg block">${esc(t('grp.new_task'))}</button></form>`);
      $('#bk', m.el).onchange = e => { if (e.target.value === '_up') $('#bkf', m.el).click(); };
      $('#bkf', m.el).onchange = e => { const f = e.target.files[0]; const o = $('#bk option[value=_up]', m.el); o.textContent = f ? '📎 ' + f.name.slice(0, 28) : t('grp.bk_up'); if (!f) $('#bk', m.el).value = ''; };
      $('#mt', m.el).onclick = () => testImportModal({ folderId: null, hidden: true, onDone: id => { const o = document.createElement('option'); o.value = id; o.textContent = '✔ ' + t('grp.test_made'); $('#tt', m.el).appendChild(o); $('#tt', m.el).value = id; toast(t('grp.test_made'), 'ok'); } });
      $('#f', m.el).onsubmit = async e => { e.preventDefault(); const title = $('#ti', m.el).value.trim(); const du = $('#du', m.el).value;
        const row = { group_id: gid, title, body: $('#bo', m.el).value.trim(), due_at: du ? new Date(du).toISOString() : null, test_item_id: $('#tt', m.el).value || null, audio_slots: Math.max(0, Math.min(20, +$('#as', m.el).value || 0)), created_by: uid };
        const bv = $('#bk', m.el).value;
        try { if (bv === '_up') { const f = $('#bkf', m.el).files[0]; if (!f) return toast(t('grp.pick_book'), 'err'); const up = await uploadAttachment(`${gid}/${uid}`, f); row.book_path = up.path; row.book_name = f.name; } else if (bv) row.book_item_id = bv; } catch (x) { return toast(friendlyErr(x.message || String(x)), 'err'); }
        const { error } = await sb.from('assignments').insert(row);
        if (error) return toast(error.message, 'err');
        await sb.from('messages').insert({ group_id: gid, user_id: uid, kind: 'text', body: t('grp.new_task_msg', { t: title }) }); m.close(); paint(); };
    });
  }
  async function membersTab(body) {
    const { data } = await sb.rpc('group_roster', { p_group: gid }); const rows = data || [];
    const grp = (st, title) => { const r = rows.filter(x => x.status === st); return r.length ? `<h4>${esc(t(title))} (${r.length})</h4><div class="cards">${r.map(m => `<div class="card pad item-row"><div class="grow"><b>${esc(m.full_name || m.email)}</b><small class="muted">${esc(m.email)}</small></div>
      ${st === 'pending' ? `<button class="btn sm" data-ap="${m.user_id}">${ic('check', 16)} ${esc(t('grp.approve'))}</button><button class="btn sm ghost" data-rm="${m.user_id}">${esc(t('grp.reject'))}</button>`
        : `<a class="btn sm ghost" href="#/inbox/${m.user_id}">${esc(t('grp.msg'))}</a><button class="btn sm ghost" data-bl="${m.user_id}:${st}">${esc(st === 'blocked' ? t('grp.approve') : t('grp.block'))}</button><button class="btn sm danger" data-rm="${m.user_id}">${ic('trash', 14)}</button>`}</div>`).join('')}</div>` : ''; };
    const have = new Set(rows.map(x => x.user_id));
    const addBox = `<div class="card pad mb"><h4>${esc(t('grp.add_m'))}</h4><input class="input" id="ams" placeholder="${esc(t('grp.add_ph'))}" autocomplete="off"><div id="amr" class="cards mt"></div></div>`;
    body.innerHTML = addBox + (rows.length ? grp('pending', 'grp.pending_list') + grp('approved', 'grp.members_list') + grp('blocked', 'grp.block') : `<p class="muted">${esc(t('grp.empty_members'))}</p>`);
    let amt; $('#ams', body).oninput = e => { clearTimeout(amt); amt = setTimeout(async () => {
      const v = e.target.value.trim(), box = $('#amr', body); if (v.length < 2) { box.innerHTML = ''; return; }
      const { data: us } = await sb.rpc('admin_users_summary', { p_search: v });
      box.innerHTML = (us || []).slice(0, 12).map(u => `<div class="card pad item-row"><span class="avatar">${esc((u.full_name || '?')[0])}</span><div class="grow"><b>${esc(u.full_name || '—')}</b><br><small class="muted">${esc(u.email || '')}</small></div>
        ${have.has(u.id) ? `<span class="chip">${esc(t('grp.in'))}</span>` : `<button class="btn sm" data-au="${u.id}">${ic('plus', 14)} ${esc(t('grp.add_m'))}</button>`}</div>`).join('');
      $$('[data-au]', box).forEach(b => b.onclick = async () => { const { error } = await sb.from('group_members').upsert({ group_id: gid, user_id: b.dataset.au, status: 'approved' }, { onConflict: 'group_id,user_id' }); if (error) return toast(error.message, 'err'); toast(t('grp.added'), 'ok'); membersTab(body); });
    }, 300); };
    const setSt = async (u, st) => { await sb.from('group_members').update({ status: st }).eq('group_id', gid).eq('user_id', u); membersTab(body); };
    $$('[data-ap]', body).forEach(b => b.onclick = () => setSt(b.dataset.ap, 'approved'));
    $$('[data-bl]', body).forEach(b => { const [u, st] = b.dataset.bl.split(':'); b.onclick = () => setSt(u, st === 'blocked' ? 'approved' : 'blocked'); });
    $$('[data-rm]', body).forEach(b => b.onclick = async () => { await sb.from('group_members').delete().eq('group_id', gid).eq('user_id', b.dataset.rm); membersTab(body); });
  }
  function settingsTab(body) {
    body.innerHTML = `<div class="card pad form"><label class="fld"><span>${esc(t('grp.name'))}</span><input class="input" id="n" value="${esc(g.name)}"></label>
      <label class="fld"><span>${esc(t('grp.desc'))}</span><textarea class="input" id="d" rows="2">${esc(g.description || '')}</textarea></label>
      <label class="fld"><span>${esc(t('grp.vis'))}</span><select class="input" id="vz">${[['all', 'grp.vis_all'], ['free', 'grp.vis_free'], ['private', 'grp.vis_priv']].map(([v, k]) => `<option value="${v}" ${(g.visibility || 'all') === v ? 'selected' : ''}>${esc(t(k))}</option>`).join('')}</select></label>
      <label class="chk"><input type="checkbox" id="c" ${g.students_can_chat ? 'checked' : ''}> ${esc(t('grp.can_chat'))}</label>
      <label class="fld"><span>${esc(t('grp.names'))}</span><select class="input" id="s">${[['first', 'grp.n_first'], ['full', 'grp.n_full'], ['anon', 'grp.n_anon']].map(([v, k]) => `<option value="${v}" ${g.show_names === v ? 'selected' : ''}>${esc(t(k))}</option>`).join('')}</select></label>
      <p class="muted small">🛡 ${esc(t('grp.privacy'))}</p>
      <button class="btn" id="sv">${esc(t('grp.save'))}</button><div class="row"><button class="btn ghost" id="ar">${esc(t('grp.archive'))}</button><button class="btn danger" id="dl">${ic('trash', 16)} ${esc(t('grp.delete'))}</button></div></div>`;
    $('#sv', body).onclick = async () => { const p = { name: $('#n', body).value.trim() || g.name, description: $('#d', body).value.trim(), students_can_chat: $('#c', body).checked, visibility: $('#vz', body).value, show_names: $('#s', body).value };
      const { error } = await sb.from('groups').update(p).eq('id', gid); if (error) return toast(error.message, 'err'); Object.assign(g, p); toast(t('grp.save') + ' ✔', 'ok'); };
    $('#ar', body).onclick = async () => { await sb.from('groups').update({ archived: true }).eq('id', gid); go('/groups'); };
    $('#dl', body).onclick = async () => { if (!(await confirmDlg(t('grp.delete') + '?'))) return; await sb.from('groups').delete().eq('id', gid); go('/groups'); };
  }
  paint();
}, { auth: true });

// ------------------------------------------------------------------ VAZIFA SAHIFASI
route('/group/:id/task/:aid', async ({ el, params, alive }) => {
  const gid = params.id, aid = params.aid, uid = state.user.id;
  const [{ data: a }, { data: g }] = await Promise.all([sb.from('assignments').select('*').eq('id', aid).maybeSingle(), sb.from('groups').select('id,name').eq('id', gid).maybeSingle()]);
  if (!alive()) return; if (!a) return go('/group/' + gid, true);
  document.body.classList.add('fs-read'); onLeave(() => document.body.classList.remove('fs-read'));
  const isClosed = a.closed || (a.due_at && new Date(a.due_at) < new Date() && false);
  const loadSubs = async () => (await sb.from('submissions').select('*').eq('assignment_id', aid).order('created_at', { ascending: false })).data || [];
  let subs = await loadSubs();
  const subHtml = s => `<div class="card pad mb" data-s="${s.id}"><div class="row between"><b>${esc(s.sender_name)}</b><small class="muted">${esc(fmtDate(s.created_at) + ' ' + fmtTime(s.created_at))}</small></div>
    ${s.text ? `<p class="pre">${esc(s.text)}</p>` : ''}${s.file_path || s.media_expired ? mediaHtml({ kind: 'file', media_path: s.file_path, body: s.file_name, media_expired: !s.file_path && s.media_expired }) : ''}
    ${s.voice_path ? mediaHtml({ kind: 'voice', media_path: s.voice_path, media_secs: s.voice_secs }) : ''}
    ${state.isAdmin ? `<div class="row wrap mt"><input class="input sm" style="max-width:110px" type="number" min="0" max="100" data-g placeholder="${esc(t('grp.grade'))}" value="${s.grade ?? ''}"><input class="input grow" data-f placeholder="${esc(t('grp.feedback'))}" value="${esc(s.feedback || '')}"><button class="btn sm" data-sv="${s.id}">${esc(t('grp.save'))}</button></div>`
      : (s.grade !== null || s.feedback ? `<div class="chips mt">${s.grade !== null ? `<span class="chip ok">${s.grade}/100</span>` : ''}${s.feedback ? `<span class="chip">${esc(s.feedback)}</span>` : ''}</div>` : '')}</div>`;
  el.innerHTML = `<div class="page chatpage fst"><div class="row"><a class="btn ghost sm" href="#/group/${gid}?tab=tasks">${ic('back')}</a><h2 class="mb0">${esc(a.title)}</h2></div>
    <div class="card pad mt"><p class="pre">${esc(a.body || '')}</p>${a.due_at ? `<p class="muted small">⏰ ${esc(fmtDate(a.due_at) + ' ' + fmtTime(a.due_at))}</p>` : ''}
      ${a.closed ? `<span class="chip">${esc(t('grp.closed_task'))}</span>` : ''}
      ${state.isAdmin ? `<div class="row end"><button class="btn sm ghost" id="cl">${esc(a.closed ? t('grp.reopen') : t('grp.close_task'))}</button><button class="btn sm danger" id="dl">${ic('trash', 14)}</button></div>` : ''}</div>
    ${a.book_item_id || a.book_path ? `<a class="btn lg block mt" href="${a.book_item_id ? '#/item/' + a.book_item_id : '#/taskdoc/' + aid}">${ic('book')} ${esc(t('grp.read_book'))}${a.book_name ? ' — ' + esc(a.book_name.slice(0, 30)) : ''}</a>` : ''}
    ${!state.isAdmin && a.audio_slots > 0 ? `<div class="card pad mt"><h4>🎤 ${esc(t('grp.audios'))}</h4><div id="slots"></div></div>` : ''}
    ${!state.isAdmin && !a.closed ? `<div class="card pad mt form"><h4>${esc(t('grp.your_work'))}</h4><textarea class="input" id="tx" rows="3" placeholder="${esc(t('grp.text_ph'))}"></textarea>
      <div class="row wrap"><label class="btn ghost sm">${ic('clip', 16)} <span id="fn">…</span><input type="file" id="fl" hidden></label><button class="btn ghost sm" id="mc" type="button">${ic('mic', 16)} <span id="mt">${esc(t('grp.rec'))}</span></button><span class="grow"></span><button class="btn" id="sb">${esc(t('grp.submit'))}</button></div></div>` : ''}
    ${a.test_item_id && !state.isAdmin ? `<a class="btn lg block mt" href="#/test/${a.test_item_id}">${ic('test')} ${esc(t('grp.take_test'))}</a>` : ''}${state.isAdmin ? `<div id="ov" class="mt">${spinner()}</div>` : ''}
    <h3 class="mt">${esc(state.isAdmin ? t('grp.subs') + ' (' + subs.length + ')' : t('grp.your_work'))}</h3><div id="subs">${subs.map(subHtml).join('') || '<p class="muted">—</p>'}</div>
    <h3 class="mt">${ic('users', 18)} ${esc(t('grp.discuss'))}</h3><div id="thread" class="threadbox"></div></div>`;
  fillMedia($('#subs', el));
  if (state.isAdmin) (async () => {
    const { data, error } = await sb.rpc('assignment_overview', { p_assignment: aid }); const ov = $('#ov', el); if (!ov) return;
    if (error) { ov.innerHTML = ''; return; }
    const rows = (data || []).sort((x, y) => (y.texts + y.voices + y.files) - (x.texts + x.voices + x.files) || String(x.full_name).localeCompare(String(y.full_name)));
    const sent = r => r.texts + r.voices + r.files > 0 || r.test_n > 0, nSent = rows.filter(sent).length, sum = k => rows.reduce((q, r) => q + (r[k] || 0), 0);
    const tb = rows.filter(r => r.test_best !== null).map(r => +r.test_best), tavg = tb.length ? Math.round(tb.reduce((q, v) => q + v, 0) / tb.length) : null;
    ov.innerHTML = `<h3>${esc(t('grp.ov'))}</h3><div class="stats3 mb"><div class="stat card"><span>${esc(t('grp.ov_sent'))}</span><b>${nSent}/${rows.length}</b></div><div class="stat card"><span>🎤 ${esc(t('grp.ov_audio'))}</span><b>${sum('voices')}</b></div>
      ${a.test_item_id ? `<div class="stat card"><span>${esc(t('grp.ov_test'))}</span><b>${tavg === null ? '—' : tavg + '%'}</b></div>` : `<div class="stat card"><span>${esc(t('grp.ov_text'))} / ${esc(t('grp.ov_file'))}</span><b>${sum('texts')} / ${sum('files')}</b></div>`}</div>
      <div class="cards">${rows.map(r => `<button class="card pad item-row left" data-u="${r.uid}"><span class="avatar">${esc((r.full_name || '?')[0])}</span><div class="grow"><b>${esc(r.full_name)}</b>
        <div class="chips">${sent(r) ? `${r.voices ? `<span class="chip">🎤 ${r.voices}</span>` : ''}${r.texts ? `<span class="chip">✍ ${r.texts}</span>` : ''}${r.files ? `<span class="chip">📎 ${r.files}</span>` : ''}${a.test_item_id && r.test_n ? `<span class="chip ok">🧪 ${Math.round(r.test_best)}%</span>` : ''}${r.grade !== null ? `<span class="chip ok">${r.grade}/100</span>` : ''}` : `<span class="chip warn">${esc(t('grp.ov_none'))}</span>`}</div></div>${ic('chev')}</button>`).join('')}</div>`;
    $$('[data-u]', ov).forEach(b => b.onclick = async () => {
      const r = rows.find(x => x.uid === b.dataset.u), mine = subs.filter(x => x.user_id === r.uid);
      const m = modal(`<h3>${esc(r.full_name)}</h3><div id="ud">${spinner()}</div>`, { cls: 'wide' });
      let tests = []; if (a.test_item_id) tests = (await sb.from('test_attempts').select('*').eq('user_id', r.uid).eq('item_id', a.test_item_id).order('created_at', { ascending: false })).data || [];
      const auds = (await sb.from('assignment_audios').select('*').eq('assignment_id', aid).eq('user_id', r.uid).order('slot')).data || [];
      $('#ud', m.el).innerHTML = (auds.length ? `<h4>🎤 ${esc(t('grp.audios'))}</h4>${auds.map(x => `<div class="row" style="gap:8px;align-items:center;margin:6px 0"><span class="avatar">${x.slot}</span><div class="grow">${mediaHtml({ kind: 'voice', media_path: x.path, media_secs: x.secs })}</div></div>`).join('')}` : '') + (a.test_item_id ? `<h4>🧪 ${esc(t('grp.ov_test'))}</h4>${tests.length ? `<div class="tbl">${tests.map(x => `<div class="trow"><small class="muted">${esc(fmtDate(x.created_at) + ' ' + fmtTime(x.created_at))}</small><span class="grow muted">${x.correct}/${x.total}</span><b>${Math.round(x.percent)}%</b></div>`).join('')}</div>` : `<p class="muted">${esc(t('grp.ov_none'))}</p>`}` : '') + (mine.length ? mine.map(subHtml).join('') : '<p class="muted">—</p>');
      fillMedia($('#ud', m.el)); $$('[data-sv]', m.el).forEach(sv => sv.onclick = async () => { const c = sv.closest('[data-s]'), gr = $('[data-g]', c).value; const { error: e2 } = await sb.from('submissions').update({ grade: gr === '' ? null : +gr, feedback: $('[data-f]', c).value.trim() || null }).eq('id', sv.dataset.sv); toast(e2 ? e2.message : t('grp.save') + ' ✔', e2 ? 'err' : 'ok'); });
    });
  })();
  const chat = mountChat($('#thread', el), { table: 'messages', filterCol: 'group_id', filterVal: gid, aid, scope: qq => qq.eq('assignment_id', aid), accept: m => m.assignment_id === aid,
    insertBase: { group_id: gid, assignment_id: aid }, folder: `${gid}/${uid}`, canWrite: true, reply: true, canDelete: m => state.isAdmin || m.user_id === uid });
  onLeave(() => chat.destroy());
  const bindSubs = () => $$('[data-sv]', el).forEach(b => b.onclick = async () => { const c = b.closest('[data-s]'), gr = $('[data-g]', c).value;
    const { error } = await sb.from('submissions').update({ grade: gr === '' ? null : +gr, feedback: $('[data-f]', c).value.trim() || null }).eq('id', b.dataset.sv); toast(error ? error.message : t('grp.save') + ' ✔', error ? 'err' : 'ok'); });
  bindSubs();
  $('#cl', el)?.addEventListener('click', async () => { await sb.from('assignments').update({ closed: !a.closed }).eq('id', aid); location.reload(); });
  $('#dl', el)?.addEventListener('click', async () => { if (!(await confirmDlg(t('delete') + '?'))) return; await sb.from('assignments').delete().eq('id', aid); go('/group/' + gid + '?tab=tasks'); });
  // audio joylar
  const slotsEl = $('#slots', el); if (slotsEl) {
    let mine = {};
    const drawSlots = async () => {
      const { data } = await sb.from('assignment_audios').select('*').eq('assignment_id', aid).eq('user_id', uid); mine = {}; (data || []).forEach(x => mine[x.slot] = x);
      slotsEl.innerHTML = Array.from({ length: a.audio_slots }, (_, i) => { const n = i + 1, x = mine[n];
        return `<div class="row slotrow" style="gap:8px;align-items:center;margin:8px 0"><span class="avatar" style="flex:none">${n}</span><div class="grow">${x ? mediaHtml({ kind: 'voice', media_path: x.path, media_secs: x.secs }) : `<span class="muted">${esc(t('grp.slot_empty'))}</span>`}</div>${a.closed ? '' : `<button class="btn sm" data-sl="${n}">${ic('plus', 16)}</button>`}</div>`; }).join('');
      fillMedia(slotsEl);
      $$('[data-sl]', slotsEl).forEach(b => b.onclick = () => slotSheet(+b.dataset.sl));
    };
    const saveSlot = async (n, path, secs, fname) => {
      const { error } = await sb.from('assignment_audios').upsert({ assignment_id: aid, group_id: gid, user_id: uid, slot: n, path, secs: secs || null, file_name: fname || null }, { onConflict: 'assignment_id,user_id,slot' });
      if (error) throw error; toast(t('grp.submitted'), 'ok'); await drawSlots();
    };
    const slotSheet = n => {
      const m = modal(`<h3>#${n}</h3><div class="form"><button class="btn lg block" id="sr">🎤 ${esc(t('grp.rec_now'))}</button><label class="btn ghost lg block">${ic('clip', 16)} ${esc(t('grp.pick_file'))}<input type="file" id="sf" accept="audio/*,.m4a,.mp3,.wav,.ogg,.aac,.opus,.amr" hidden></label></div>`);
      let rec = null; const sr = $('#sr', m.el);
      sr.onclick = async () => {
        try {
          if (rec) { const v = await rec.stop(); rec = null; btnBusy(sr, true); const path = await uploadVoice(`${gid}/${uid}`, v); await saveSlot(n, path, v.secs); m.close?.(); return; }
          rec = await startRecording(state.settings.app?.max_voice_seconds || 300, s => { sr.textContent = '⏺ ' + fmtDur(s) + ' — ' + t('grp.rec_stop'); });
        } catch (x) { toast(friendlyErr(x.message || String(x)), 'err'); btnBusy(sr, false); rec = null; }
      };
      $('#sf', m.el).onchange = async e => { const f = e.target.files[0]; if (!f) return;
        if (f.size > MAX_FILE) return toast(t('grp.too_big'), 'err');
        try { const up = await uploadAttachment(`${gid}/${uid}`, f); await saveSlot(n, up.path, null, f.name); m.close?.(); } catch (x) { toast(friendlyErr(x.message || String(x)), 'err'); } };
    };
    drawSlots();
  }
  // topshirish
  const sbm = $('#sb', el); if (sbm) {
    let file = null, voice = null, rec = null;
    $('#fl', el).onchange = e => { file = e.target.files[0] || null; if (file && file.size > MAX_FILE) { toast(t('grp.too_big'), 'err'); file = null; e.target.value = ''; } $('#fn', el).textContent = file ? file.name.slice(0, 22) : '…'; };
    $('#mc', el).onclick = async () => {
      if (rec) { voice = await rec.stop(); rec = null; $('#mt', el).textContent = `🎤 ${fmtDur(voice.secs)} ✔`; return; }
      rec = await startRecording(state.settings.app?.max_voice_seconds || 120, s => { $('#mt', el).textContent = '⏺ ' + fmtDur(s) + ' — ' + t('grp.stop'); }); voice = null;
    };
    sbm.onclick = async () => {
      if (rec) { voice = await rec.stop(); rec = null; }
      const text = $('#tx', el).value.trim(); if (!text && !file && !voice) return; btnBusy(sbm, true);
      try {
        const row = { assignment_id: aid, group_id: gid, user_id: uid, text };
        if (file) { const up = await uploadAttachment(`${gid}/${uid}`, file); row.file_path = up.path; row.file_name = file.name; }
        if (voice) { row.voice_path = await uploadVoice(`${gid}/${uid}`, voice); row.voice_secs = voice.secs; }
        const { error } = await sb.from('submissions').insert(row); if (error) throw error;
        toast(t('grp.submitted'), 'ok'); location.reload();
      } catch (x) { toast(x.message || String(x), 'err'); btnBusy(sbm, false); }
    };
  }
}, { auth: true });

route('/taskdoc/:aid', async ({ el, params, alive }) => {
  const { data: a } = await sb.from('assignments').select('book_path,book_name,title,group_id').eq('id', params.aid).maybeSingle();
  if (!alive()) return; if (!a?.book_path) return go('/groups', true);
  el.innerHTML = spinner();
  try { const url = await signedUrl('chat', a.book_path, 3600); if (!alive()) return; const nm = a.book_name || a.title, ext = (nm.split('.').pop() || '').toLowerCase(); await openReader(el, { title: nm }, url, ext, '#/group/' + a.group_id + '/task/' + params.aid); }
  catch (x) { el.innerHTML = `<div class="page"><p class="muted">${esc(friendlyErr(x.message || String(x)))}</p></div>`; }
}, { auth: true });
