// Service worker: ilova qobig'i oflayn ochiladi; Supabase/API so'rovlari HECH QACHON keshlanmaydi.
const VER = 'bio-v11';
const SHELL = ['./', 'index.html', 'css/app.css', 'css/v2.css', 'manifest.webmanifest', 'icons/icon.svg', 'icons/icon-192.png',
  'js/main.js', 'js/materials.js', 'js/learn.js', 'js/qedit.js', 'js/core.js', 'js/config.js', 'js/i18n.js', 'js/auth.js', 'js/lock.js', 'js/fx.js', 'js/pwa.js', 'js/home.js', 'js/library.js', 'js/player.js', 'js/pdfjs.js',
  'js/tests.js', 'js/testparse.js', 'js/reports.js', 'js/groups.js', 'js/chat.js', 'js/media.js', 'js/news.js', 'js/inbox.js', 'js/settings.js', 'js/admin.js', 'js/guide.js', 'js/contact.js', 'js/offline.js', 'js/audiobar.js', 'js/addwiz.js', 'js/reader.js', 'js/charts.js', 'js/billing.js', 'js/bg.js', 'js/search.js', 'js/ui.js', 'js/xp.js', 'js/courses.js', 'js/flash.js', 'js/teacher.js', 'js/forum.js', 'js/practice.js', 'js/lab.js', 'js/ai.js', 'js/admin2.js'];

self.addEventListener('install', e => { e.waitUntil(caches.open(VER).then(c => c.addAll(SHELL)).then(() => self.skipWaiting())); });
self.addEventListener('activate', e => { e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== VER).map(k => caches.delete(k)))).then(() => self.clients.claim())); });

self.addEventListener('fetch', e => {
  const r = e.request; if (r.method !== 'GET') return;
  const u = new URL(r.url);
  if (u.hostname.endsWith('supabase.co') || u.hostname.includes('youtube') || u.hostname.includes('ytimg') || u.hostname.includes('mymemory')) return; // tarmoqqa
  if (u.origin === location.origin) {
    const isDoc = r.mode === 'navigate' || /\/(index\.html|sw\.js|manifest\.webmanifest)?$/.test(u.pathname);
    if (isDoc) {   // bosh sahifa: avval tarmoq (yangi versiya tez yetsin), 3 soniyada javob bo'lmasa kesh
      const net = fetch(r).then(res => { if (res.ok) { const cp = res.clone(); caches.open(VER).then(c => c.put(r, cp)); } return res; });
      const slow = new Promise((ok, no) => setTimeout(() => caches.match(r).then(m => m ? ok(m) : no()), 3000));
      e.respondWith(Promise.race([net, slow]).catch(() => net).catch(() => caches.match(r).then(m => m || caches.match('index.html'))));
      return;
    }
    // js/css/rasm: keshdan DARHOL, fonda yangilanadi (keyingi ochilishda yangi versiya)
    e.respondWith(caches.open(VER).then(async c => {
      const m = await c.match(r); const net = fetch(r).then(res => { if (res.ok) c.put(r, res.clone()); return res; }).catch(() => m);
      return m || net;
    }));
    return;
  }
  // CDN kutubxonalar (esm.sh, jsdelivr): kesh birinchi, fonda yangilash
  if (u.hostname.includes('esm.sh') || u.hostname.includes('jsdelivr')) {
    e.respondWith(caches.open(VER).then(async c => { const m = await c.match(r); const net = fetch(r).then(res => { if (res.ok) c.put(r, res.clone()); return res; }).catch(() => m); return m || net; }));
  }
});
