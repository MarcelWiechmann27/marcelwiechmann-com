'use strict';
// E-Mails über Resend: Bericht an den Besucher, Lead-Hinweis an Marcel.
const esc = (s) => String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
const clean = (s) => String(s ?? '').replace(/[\r\n\u0000-\u001f]/g, ' ').trim();

const NAVY = '#0b1730', RED = '#f5411f', INK = '#0b1730', MUTED = '#4b5468';
const label = (n) => (n >= 75 ? 'Gut' : n >= 55 ? 'Okay' : 'Schwach');
const labelStyle = (n) => (n >= 75 ? `background:${NAVY};color:#fff;border:2px solid ${NAVY}` : n >= 55 ? `background:#fff;color:${INK};border:2px solid ${INK}` : `background:${RED};color:#fff;border:2px solid ${RED}`);

function buildUserMail({ firma, report, siteUrl }) {
  const r = report;
  const cta = `${siteUrl}/#kontakt`;
  const subject = clean(`Dein Webseiten-Check: ${r.score}/100 Punkte für ${r.host}`);
  const cats = r.cats.map((c) => `
    <tr><td style="padding:14px 0;border-top:1px solid #dfe2e8">
      <table width="100%" cellpadding="0" cellspacing="0"><tr>
        <td style="font:700 16px Arial,sans-serif;color:${INK}">${esc(c.name)}</td>
        <td align="right"><span style="display:inline-block;padding:2px 10px;font:700 12px Arial,sans-serif;text-transform:uppercase;letter-spacing:1px;${labelStyle(c.score)}">${label(c.score)} · ${c.score}</span></td>
      </tr></table>
      <div style="font:14px/1.5 Arial,sans-serif;color:${MUTED};padding-top:6px">${esc(c.text)}</div>
    </td></tr>`).join('');
  const levers = r.levers.map((l, i) => `
    <tr><td style="padding:12px 0;border-top:1px solid #dfe2e8">
      <table cellpadding="0" cellspacing="0"><tr>
        <td valign="top" style="font:900 30px Arial,sans-serif;color:${RED};padding-right:14px">${i + 1}</td>
        <td><div style="font:700 15px Arial,sans-serif;color:${INK};text-transform:uppercase;letter-spacing:.5px">${esc(l.name)}</div>
        <div style="font:14px/1.5 Arial,sans-serif;color:${MUTED};padding-top:3px">${esc(l.text)}</div></td>
      </tr></table></td></tr>`).join('');
  const html = `<!doctype html><html lang="de"><body style="margin:0;background:#e9ebef">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#e9ebef"><tr><td align="center" style="padding:20px 10px">
<table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#fff">
  <tr><td style="background:${NAVY};padding:16px 24px"><img src="${siteUrl}/wc-assets/logo.png" height="44" alt="Marcel Wiechmann" style="display:block;height:44px;width:auto"></td></tr>
  <tr><td style="background:${RED};color:#fff;padding:7px 24px;font:700 13px Arial,sans-serif;letter-spacing:2px;text-transform:uppercase">Klare Analyse. Direkter Plan. Echte Wirkung.</td></tr>
  <tr><td style="padding:26px 24px 8px;font:15px/1.6 Arial,sans-serif;color:${INK}">
    <p style="margin:0 0 6px">Hallo${firma ? ' ' + esc(firma) : ''},</p>
    <p style="margin:0 0 14px">hier ist dein Webseiten-Check für <b>${esc(r.host)}</b>.</p>
    <div style="font:900 56px/1 Arial,sans-serif;color:${RED}">${r.score}<span style="font-size:22px;color:${INK}"> / 100</span></div>
    <div style="font:700 18px Arial,sans-serif;padding-top:6px">${esc(r.verdict)}</div>
  </td></tr>
  <tr><td style="padding:10px 24px 0"><table width="100%" cellpadding="0" cellspacing="0">${cats}</table></td></tr>
  <tr><td style="padding:26px 24px 0;font:900 22px Arial,sans-serif;color:${INK};text-transform:uppercase">Deine 3 größten Hebel</td></tr>
  <tr><td style="padding:6px 24px 0"><table width="100%" cellpadding="0" cellspacing="0">${levers}</table></td></tr>
  <tr><td style="padding:28px 24px 8px;font:15px/1.6 Arial,sans-serif;color:${INK}">
    <p style="margin:0 0 14px"><b>Du willst eine neue oder optimierte Webseite?</b> Melde dich gern. Ich schaue mir das mit dir an, ehrlich und ohne Fachchinesisch.</p>
    <a href="${cta}" style="display:inline-block;background:${RED};color:#fff;text-decoration:none;padding:13px 26px;font:800 16px Arial,sans-serif;text-transform:uppercase;letter-spacing:1px">Let's talk</a>
  </td></tr>
  <tr><td style="padding:26px 24px 24px;font:12px/1.5 Arial,sans-serif;color:#7a8194">
    Du bekommst diese E-Mail einmalig, weil du auf marcelwiechmann.com/webseitencheck einen Check angefordert hast. Falls du das nicht warst, kannst du sie einfach ignorieren.<br>
    Die Bewertung ist eine automatische Ersteinschätzung und ersetzt keine persönliche Beratung.<br>
    <a href="${siteUrl}/impressum" style="color:#7a8194">Impressum</a> · <a href="${siteUrl}/datenschutz" style="color:#7a8194">Datenschutz</a>
  </td></tr>
</table></td></tr></table></body></html>`;
  const text = [
    `Dein Webseiten-Check für ${r.host}: ${r.score}/100 Punkte (${r.verdict})`, '',
    ...r.cats.map((c) => `${c.name}: ${label(c.score)} (${c.score}) – ${c.text}`), '',
    'Deine 3 größten Hebel:', ...r.levers.map((l, i) => `${i + 1}. ${l.name}: ${l.text}`), '',
    `Du willst eine neue oder optimierte Webseite? Melde dich gern: ${cta}`, '',
    'Du bekommst diese E-Mail einmalig, weil du den Check angefordert hast. Die Bewertung ist eine automatische Ersteinschätzung.',
  ].join('\n');
  return { subject, html, text };
}

function buildLeadMail({ firma, url, email, contactOk, report, at }) {
  const r = report;
  const subject = clean(`Webseiten-Check: ${firma} · ${r.score}/100${contactOk ? ' · Kontakt erlaubt' : ''}`);
  const rows = [['Firma', firma], ['Webseite', url], ['E-Mail', email], ['Kontakt per E-Mail erlaubt', contactOk ? 'JA' : 'nein (nur Bericht)'], ['Score', `${r.score}/100`], ['Zeitpunkt', at], ['KI-Auswertung', r.usedAi ? 'ja' : 'nein (grobe Einschätzung)'], ['PageSpeed-Messung', r.usedPsi ? 'ja' : 'nein']];
  const html = `<div style="font:14px/1.5 Arial,sans-serif;color:#111"><table cellpadding="6" cellspacing="0" style="border-collapse:collapse">${rows.map(([k, v]) => `<tr><td style="border-bottom:1px solid #ddd"><b>${esc(k)}</b></td><td style="border-bottom:1px solid #ddd">${esc(v)}</td></tr>`).join('')}</table>
<h3 style="margin:18px 0 6px">Kategorien</h3><ul style="margin:0;padding-left:18px">${r.cats.map((c) => `<li><b>${esc(c.name)}</b> ${c.score}: ${esc(c.text)}</li>`).join('')}</ul>
<h3 style="margin:18px 0 6px">Hebel</h3><ol style="margin:0;padding-left:18px">${r.levers.map((l) => `<li><b>${esc(l.name)}:</b> ${esc(l.text)}</li>`).join('')}</ol></div>`;
  const text = [...rows.map(([k, v]) => `${k}: ${v}`), '', ...r.cats.map((c) => `${c.name} ${c.score}: ${c.text}`), '', ...r.levers.map((l, i) => `${i + 1}. ${l.name}: ${l.text}`)].join('\n');
  return { subject, html, text };
}

async function sendMail({ fetch, env }, { to, subject, html, text, replyTo }) {
  if (!env.RESEND_API_KEY) return false;
  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { authorization: `Bearer ${env.RESEND_API_KEY}`, 'content-type': 'application/json' },
      body: JSON.stringify({ from: env.MAIL_FROM || 'Marcel Wiechmann <check@marcelwiechmann.com>', to: [to], subject, html, text, ...(replyTo ? { reply_to: replyTo } : {}) }),
    });
    return res.ok;
  } catch { return false; }
}

module.exports = { buildUserMail, buildLeadMail, sendMail, esc };
