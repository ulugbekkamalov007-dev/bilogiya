// BioAcademy — R2 media Worker.  /media/* shu yerda, qolgan hamma narsa statik fayl.
// Binding: env.MEDIA (R2 bucket "bio-media").
const SB = 'https://zghfacfjrcwfsjuwrvzh.supabase.co';
const ANON = 'sb_publishable_PfyyytC0MlHDHVQNV_maJA_ezCkQ7sS';
const MAX_FILE = 2 * 1024 * 1024 * 1024; // 2 GB
const cache = new Map(); // token -> {uid, role, exp}

const json = (o, s = 200) => new Response(JSON.stringify(o), { status: s, headers: { 'content-type': 'application/json', 'cache-control': 'no-store' } });

async function who(token) {
  if (!token) return null;
  const c = cache.get(token);
  if (c && c.exp > Date.now()) return c;
  const h = { apikey: ANON, authorization: 'Bearer ' + token };
  const r = await fetch(SB + '/auth/v1/user', { headers: h });
  if (!r.ok) return null;
  const u = await r.json();
  let role = 'user';
  const p = await fetch(`${SB}/rest/v1/profiles?id=eq.${u.id}&select=role`, { headers: h });
  if (p.ok) { const a = await p.json(); if (a[0] && a[0].role) role = a[0].role; }
  const v = { uid: u.id, role, exp: Date.now() + 60000 };
  cache.set(token, v);
  if (cache.size > 500) cache.clear();
  return v;
}
const isStaff = (u) => u && (u.role === 'admin' || u.role === 'teacher');
const safeName = (s) => String(s || 'file').normalize('NFKD').replace(/[^\w.\-]+/g, '_').slice(-80);

export default {
  async fetch(req, env) {
    const url = new URL(req.url);
    if (!url.pathname.startsWith('/media')) return env.ASSETS.fetch(req);
    try { return await handle(req, env, url); }
    catch (e) { return json({ error: String(e && e.message || e) }, 500); }
  },
};

async function handle(req, env, url) {
  const m = req.method;
  const bearer = (req.headers.get('authorization') || '').replace(/^Bearer\s+/i, '');
  const token = bearer || url.searchParams.get('t') || '';
  const user = await who(token);
  if (!user) return json({ error: 'auth' }, 401);
  const key = decodeURIComponent(url.pathname.replace(/^\/media\/?/, ''));

  // ---------- yuklash (faqat admin/o'qituvchi) ----------
  if (m === 'POST' && !key && url.searchParams.has('new')) {
    if (!isStaff(user)) return json({ error: 'forbidden' }, 403);
    const name = safeName(url.searchParams.get('name'));
    const k = `${user.uid.slice(0, 8)}/${Date.now().toString(36)}-${crypto.randomUUID().slice(0, 8)}/${name}`;
    const mp = await env.MEDIA.createMultipartUpload(k, { httpMetadata: { contentType: url.searchParams.get('type') || 'application/octet-stream' } });
    return json({ key: k, uploadId: mp.uploadId });
  }
  if (m === 'PUT' && key && url.searchParams.has('uploadId')) {
    if (!isStaff(user)) return json({ error: 'forbidden' }, 403);
    const n = parseInt(url.searchParams.get('part'), 10);
    if (!(n >= 1 && n <= 10000)) return json({ error: 'part' }, 400);
    const mp = env.MEDIA.resumeMultipartUpload(key, url.searchParams.get('uploadId'));
    const part = await mp.uploadPart(n, req.body);
    return json({ partNumber: part.partNumber, etag: part.etag });
  }
  if (m === 'POST' && key && url.searchParams.has('uploadId')) {
    if (!isStaff(user)) return json({ error: 'forbidden' }, 403);
    const mp = env.MEDIA.resumeMultipartUpload(key, url.searchParams.get('uploadId'));
    const body = await req.json();
    const o = await mp.complete(body.parts || []);
    if (o.size > MAX_FILE) { await env.MEDIA.delete(key); return json({ error: 'too_big' }, 413); }
    return json({ key, size: o.size, url: '/media/' + encodeURI(key) });
  }
  if (m === 'DELETE' && key && url.searchParams.has('uploadId')) {
    if (!isStaff(user)) return json({ error: 'forbidden' }, 403);
    await env.MEDIA.resumeMultipartUpload(key, url.searchParams.get('uploadId')).abort();
    return json({ ok: true });
  }
  if (m === 'DELETE' && key) {
    if (!isStaff(user)) return json({ error: 'forbidden' }, 403);
    await env.MEDIA.delete(key);
    return json({ ok: true });
  }
  if (m === 'GET' && !key && url.searchParams.has('list')) {
    if (!isStaff(user)) return json({ error: 'forbidden' }, 403);
    const l = await env.MEDIA.list({ limit: 200, cursor: url.searchParams.get('cursor') || undefined });
    return json({ objects: l.objects.map((o) => ({ key: o.key, size: o.size, uploaded: o.uploaded })), cursor: l.truncated ? l.cursor : null });
  }

  // ---------- o'qish (kirgan har qanday foydalanuvchi; kalit taxmin qilib bo'lmaydi) ----------
  if ((m === 'GET' || m === 'HEAD') && key) {
    const range = req.headers.get('range');
    let opts = {};
    if (range) opts = { range: req.headers };
    const o = m === 'HEAD' ? await env.MEDIA.head(key) : await env.MEDIA.get(key, opts);
    if (!o) return new Response('Not found', { status: 404 });
    const h = new Headers();
    o.writeHttpMetadata(h);
    h.set('etag', o.httpEtag);
    h.set('accept-ranges', 'bytes');
    h.set('cache-control', 'private, max-age=3600');
    h.set('x-content-type-options', 'nosniff');
    let status = 200;
    if (o.range && range) {
      const r = o.range;
      const off = r.offset ?? (r.suffix != null ? o.size - r.suffix : 0);
      const len = r.length ?? (r.suffix != null ? r.suffix : o.size - off);
      h.set('content-range', `bytes ${off}-${off + len - 1}/${o.size}`);
      h.set('content-length', String(len));
      status = 206;
    } else h.set('content-length', String(o.size));
    return new Response(m === 'HEAD' ? null : o.body, { status, headers: h });
  }
  return json({ error: 'bad_request' }, 400);
}
