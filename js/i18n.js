// Umumiy matnlar (uz / ru / en). Har bir modul o'z matnlarini o'zida ham qo'shadi (addDict).
import { addDict } from './core.js';

addDict({
  uz: { cancel: 'Bekor qilish', yes: 'Ha', no: 'Yo\'q', save: 'Saqlash', delete: 'O\'chirish', edit: 'Tahrirlash', close: 'Yopish',
    'u.min': 'daq', 'u.h': 'soat', 'nav.home': 'Bosh sahifa', 'nav.library': 'Kutubxona', 'nav.groups': 'Guruhlar', 'nav.reports': 'Hisobot', 'nav.rating': 'Reyting', 'nav.inbox': 'Xabarlar', 'nav.settings': 'Sozlamalar',
    'back.again': 'Chiqish uchun yana bir marta bosing', 'net.on': 'Internet qayta ulandi', 'net.off': 'Internet yo\'q — oflayn rejim' },
  ru: { cancel: 'Отмена', yes: 'Да', no: 'Нет', save: 'Сохранить', delete: 'Удалить', edit: 'Изменить', close: 'Закрыть',
    'u.min': 'мин', 'u.h': 'ч', 'nav.home': 'Главная', 'nav.library': 'Библиотека', 'nav.groups': 'Группы', 'nav.reports': 'Отчёт', 'nav.rating': 'Рейтинг', 'nav.inbox': 'Сообщения', 'nav.settings': 'Настройки',
    'back.again': 'Нажмите ещё раз для выхода', 'net.on': 'Интернет восстановлен', 'net.off': 'Нет интернета — офлайн-режим' },
  en: { cancel: 'Cancel', yes: 'Yes', no: 'No', save: 'Save', delete: 'Delete', edit: 'Edit', close: 'Close',
    'u.min': 'min', 'u.h': 'h', 'nav.home': 'Home', 'nav.library': 'Library', 'nav.groups': 'Groups', 'nav.reports': 'Report', 'nav.rating': 'Ranking', 'nav.inbox': 'Messages', 'nav.settings': 'Settings',
    'back.again': 'Press again to exit', 'net.on': 'Back online', 'net.off': 'No internet — offline mode' },
});
