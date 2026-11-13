// Supabase Edge Function: ai-chat — faqat BIOLOGIYA bo'yicha yordamchi.
// Kalit faqat serverda: `supabase secrets set ANTHROPIC_API_KEY=sk-ant-...`  (ixtiyoriy: AI_MODEL)
// Joylash: `supabase functions deploy ai-chat`  (JWT tekshiruvi yoqilgan holda qoldiring)
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const CORS = { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type', 'Access-Control-Allow-Methods': 'POST, OPTIONS' };
const json = (o: unknown, status = 200) => new Response(JSON.stringify(o), { status, headers: { ...CORS, 'Content-Type': 'application/json' } });

const BASE = `You are BioAcademy's biology tutor. You ONLY help with biology (cells, genetics, anatomy, botany, zoology, ecology, evolution, microbiology, biochemistry, human health basics). If asked about anything else, politely refuse in one sentence and steer back to biology. Reply in the user's language (Uzbek Latin, Russian or English). Be accurate, concise and age-appropriate for school students. Never invent facts; say when unsure.`;
const MODES: Record<string, string> = {
  chat: BASE,
  quiz: BASE + ` Generate a multiple-choice quiz on the requested biology topic. Format: numbered questions, 4 options A-D, then "Answer: X" and a one-line explanation for each.`,
  cards: BASE + ` Create flashcards on the requested biology topic. Output ONLY a JSON array (no markdown fences) of 8-15 objects: [{"front":"question or term","back":"short answer"}].`,
  material: BASE + ` The user is a teacher. Produce a structured lesson material (goals, key terms, explanation, activities, 5 check questions) on the requested biology topic.`,
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: CORS });
  try {
    const auth = req.headers.get('Authorization') ?? '';
    const sb = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_ANON_KEY')!, { global: { headers: { Authorization: auth } } });
    const { data: u } = await sb.auth.getUser();
    if (!u?.user) return json({ error: 'auth' }, 401);

    const body = await req.json();
    const mode = MODES[body.mode] ? body.mode : 'chat';
    const text = String(body.message ?? '').slice(0, 4000).trim();
    if (!text) return json({ error: 'empty' }, 400);
    if (mode === 'material') {
      const { data: p } = await sb.from('profiles').select('role').eq('id', u.user.id).maybeSingle();
      if (!p || !['teacher', 'admin'].includes(p.role)) return json({ error: 'staff_only' }, 403);
    }
    const { data: quota, error: qe } = await sb.rpc('ai_take_quota');
    if (qe) return json({ error: 'quota_error' }, 500);
    if (!quota?.ok) return json({ error: quota?.off ? 'off' : 'limit', quota }, 429);

    const key = Deno.env.get('ANTHROPIC_API_KEY');
    if (!key) return json({ error: 'not_configured' }, 503);

    const hist = Array.isArray(body.history) ? body.history.slice(-10).filter((m: any) => ['user', 'assistant'].includes(m?.role) && typeof m?.content === 'string').map((m: any) => ({ role: m.role, content: String(m.content).slice(0, 4000) })) : [];
    const content: unknown[] = [];
    if (body.image?.data && /^image\/(png|jpeg|webp|gif)$/.test(body.image?.type) && String(body.image.data).length < 6_000_000) content.push({ type: 'image', source: { type: 'base64', media_type: body.image.type, data: body.image.data } });
    content.push({ type: 'text', text });

    const r = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST', headers: { 'x-api-key': key, 'anthropic-version': '2023-06-01', 'content-type': 'application/json' },
      body: JSON.stringify({ model: Deno.env.get('AI_MODEL') ?? 'claude-haiku-5-5', max_tokens: mode === 'chat' ? 900 : 1800, system: MODES[mode], messages: [...hist, { role: 'user', content }] }),
    });
    if (!r.ok) return json({ error: 'upstream', status: r.status }, 502);
    const out = await r.json();
    const reply = (out.content ?? []).filter((b: any) => b.type === 'text').map((b: any) => b.text).join('\n').trim();
    await sb.from('ai_messages').insert([{ user_id: u.user.id, role: 'user', content: text }, { user_id: u.user.id, role: 'assistant', content: reply.slice(0, 12000) }]);
    return json({ reply, quota });
  } catch (e) {
    return json({ error: 'server', detail: String(e).slice(0, 200) }, 500);
  }
});
