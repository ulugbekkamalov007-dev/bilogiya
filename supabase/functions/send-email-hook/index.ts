// Supabase Auth "Send Email" hook -> Apps Script (Gmail) ga yo'naltiradi.
// Sirlar: SEND_EMAIL_HOOK_SECRET (v1,whsec_... ), APPS_SCRIPT_URL, APPS_SCRIPT_SECRET
import { Webhook } from "https://esm.sh/standardwebhooks@1.0.0";

const SUBJECTS: Record<string, string> = {
  signup: "Platforma: tasdiqlash kodi",
  recovery: "Platforma: parolni tiklash kodi",
  magiclink: "Platforma: kirish kodi",
  email_change: "Platforma: emailni tasdiqlash kodi",
  invite: "Platforma: taklif",
  reauthentication: "Platforma: tasdiqlash kodi",
};

Deno.serve(async (req) => {
  const payload = await req.text();
  const secret = (Deno.env.get("SEND_EMAIL_HOOK_SECRET") ?? "").replace("v1,whsec_", "");
  let data: any;
  try {
    data = new Webhook(secret).verify(payload, Object.fromEntries(req.headers));
  } catch {
    return new Response(JSON.stringify({ error: { http_code: 401, message: "bad signature" } }), { status: 401 });
  }
  const { user, email_data } = data;
  const code = email_data.token;
  const subject = SUBJECTS[email_data.email_action_type] ?? "Platforma";
  const html = `<div style="font-family:Arial;max-width:480px;margin:auto;padding:24px;background:#f3faf5;border-radius:16px">
<h2 style="color:#157347">🧬 Platforma</h2><p>Kod / Код / Code:</p>
<div style="font-size:34px;letter-spacing:8px;font-weight:700;color:#157347;background:#fff;border-radius:12px;padding:16px;text-align:center">${code}</div></div>`;
  const r = await fetch(Deno.env.get("APPS_SCRIPT_URL")!, {
    method: "POST",
    body: JSON.stringify({ secret: Deno.env.get("APPS_SCRIPT_SECRET"), to: user.email, subject, html, text: `Kod: ${code}` }),
  });
  const j = await r.json().catch(() => ({ ok: false }));
  if (!j.ok) return new Response(JSON.stringify({ error: { http_code: 500, message: "mail failed" } }), { status: 500 });
  return new Response(JSON.stringify({}), { status: 200, headers: { "Content-Type": "application/json" } });
});
