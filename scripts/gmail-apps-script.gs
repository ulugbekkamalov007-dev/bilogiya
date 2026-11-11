/**
 * Gmail orqali xat yuboruvchi Apps Script (kuniga ~100 xat, bepul Gmail).
 * 1) script.google.com -> New project -> shu kodni qo'ying
 * 2) SECRET ni o'zgartiring
 * 3) Deploy -> New deployment -> Web app -> Execute as: Me, Access: Anyone
 * 4) URL ni Supabase Edge Function sirlariga APPS_SCRIPT_URL, secret ni APPS_SCRIPT_SECRET qiling
 */
const SECRET = 'O-ZGARTIRING-uzun-tasodifiy-matn';
function doPost(e) {
  try {
    const d = JSON.parse(e.postData.contents);
    if (d.secret !== SECRET) return out({ ok: false, error: 'forbidden' });
    GmailApp.sendEmail(d.to, d.subject, d.text || '', { htmlBody: d.html, name: 'Platforma' });
    return out({ ok: true });
  } catch (err) { return out({ ok: false, error: String(err) }); }
}
function out(o) { return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON); }
