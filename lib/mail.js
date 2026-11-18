'use strict';
// E-Mails über Resend: Bericht an den Besucher (im Branding von marcelwiechmann.com), Lead-Hinweis an Marcel.
const esc = (s) => String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
const clean = (s) => String(s ?? '').replace(/[\r\n\u0000-\u001f]/g, ' ').trim();

const NAVY = '#0b1730', RED = '#f5411f', ORANGE = '#ff6a2a', INK = '#0b1730', MUTED = '#4b5468', PAPER = '#f3f4f6', LINE = '#dfe2e8';
const FONT = "Arial,Helvetica,sans-serif";
const label = (n) => (n >= 75 ? 'Gut' : n >= 55 ? 'Okay' : 'Schwach');
const tone = (n) => (n >= 75 ? NAVY : n >= 55 ? ORANGE : RED);
const pill = (n) => `display:inline-block;padding:3px 11px;font:700 12px ${FONT};text-transform:uppercase;letter-spacing:1px;background:${tone(n)};color:#fff`;

function bar(n) {
  const w = Math.max(3, Math.min(100, Math.round(n)));
  return `<table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="margin-top:8px"><tr>
      <td width="${w}%" height="6" bgcolor="${tone(n)}" style="background:${tone(n)};height:6px;line-height:6px;font-size:0">&nbsp;</td>
      <td bgcolor="${LINE}" style="background:${LINE};height:6px;line-height:6px;font-size:0">&nbsp;</td>
    </tr></table>`;
}

const P = `font:14px/1.6 ${FONT};color:${MUTED};padding-top:8px`;
const LBL = (t, col) => `<div style="font:800 11px ${FONT};letter-spacing:1.5px;text-transform:uppercase;color:${col};padding-top:12px">${t}</div>`;
function catBody(c) {
  const parts = [];
  if (c.problem) parts.push(LBL('Das bremst dich', RED) + `<div style="${P};padding-top:3px">${esc(c.problem)}</div>`);
  if (c.stark) parts.push(LBL('Das läuft gut', NAVY) + `<div style="${P};padding-top:3px">${esc(c.stark)}</div>`);
  if (c.hebel && (c.problem || c.score < 85)) parts.push(LBL('Dein nächster Schritt', ORANGE) + `<div style="${P};padding-top:3px">${esc(c.hebel)}</div>`);
  return parts.length ? parts.join('') : `<div style="${P}">${esc(c.text)}</div>`;
}

function buildUserMail({ firma, report, siteUrl }) {
  const r = report;
  const cta = `${siteUrl}/#kontakt`;
  const subject = clean(`Dein Webseiten-Check: ${r.score}/100 Punkte für ${r.host}`);
  const preheader = `${r.score}/100 Punkte und deine 3 größten Hebel für ${r.host}`;
  const cats = r.cats.map((c) => `
    <tr><td style="padding:16px 0;border-top:1px solid ${LINE}">
      <table width="100%" cellpadding="0" cellspacing="0" role="presentation"><tr>
        <td style="font:700 16px ${FONT};color:${INK}">${esc(c.name)}</td>
        <td align="right"><span style="${pill(c.score)}">${label(c.score)} · ${c.score}</span></td>
      </tr></table>
      ${bar(c.score)}
      ${catBody(c)}
    </td></tr>`).join('');
  const levers = r.levers.map((l, i) => `
    <tr><td style="padding:14px 0;border-top:1px solid ${LINE}">
      <table cellpadding="0" cellspacing="0" role="presentation"><tr>
        <td valign="top" style="font:900 32px ${FONT};color:${RED};padding-right:16px;width:28px">${i + 1}</td>
        <td><div style="font:800 15px ${FONT};color:${INK};text-transform:uppercase;letter-spacing:.5px">${esc(l.name)}</div>
        <div style="font:14px/1.55 ${FONT};color:${MUTED};padding-top:4px">${esc(l.text)}</div></td>
      </tr></table></td></tr>`).join('');
  const html = `<!doctype html><html lang="de"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${esc(subject)}</title></head>
<body style="margin:0;background:#e9ebef">
<div style="display:none;max-height:0;overflow:hidden;opacity:0;color:transparent">${esc(preheader)}</div>
<table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="background:#e9ebef"><tr><td align="center" style="padding:24px 10px">
<table width="600" cellpadding="0" cellspacing="0" role="presentation" style="max-width:600px;width:100%;background:#fff">
  <tr><td style="background:${NAVY};padding:16px 24px">
    <table width="100%" cellpadding="0" cellspacing="0" role="presentation"><tr>
      <td><a href="${siteUrl}" style="text-decoration:none"><img src="${siteUrl}/wc-assets/logo.png" height="44" alt="Marcel Wiechmann" style="display:block;height:44px;width:auto;border:0"></a></td>
      <td align="right" style="font:700 12px ${FONT};letter-spacing:2px;text-transform:uppercase;color:${RED}">Webseiten-Check</td>
    </tr></table></td></tr>
  <tr><td style="background:${RED};color:#fff;padding:8px 24px;font:800 13px ${FONT};letter-spacing:2px;text-transform:uppercase">Wo verliert deine Webseite Kunden?</td></tr>
  <tr><td style="padding:28px 24px 10px;font:15px/1.6 ${FONT};color:${INK}">
    <p style="margin:0 0 6px">Hallo,</p>
    <p style="margin:0 0 16px">danke für deine Anfrage. Hier ist meine Auswertung zu deiner Seite <b>${esc(r.host)}</b>.</p>
    <div style="font:900 60px/1 ${FONT};color:${RED}">${r.score}<span style="font-size:22px;color:${INK}"> / 100</span></div>
    <div style="font:800 18px ${FONT};padding-top:8px;color:${INK}">${esc(r.verdict)}</div>
  </td></tr>
  <tr><td style="padding:10px 24px 0"><table width="100%" cellpadding="0" cellspacing="0" role="presentation">${cats}</table></td></tr>
  <tr><td style="padding:22px 24px 0"><table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="background:${PAPER}"><tr><td style="padding:16px 18px">
    <div style="font:800 12px ${FONT};letter-spacing:1.5px;text-transform:uppercase;color:${RED}">So habe ich geprüft</div>
    ${(r.method || []).map((m) => `<div style="font:14px/1.55 ${FONT};color:${MUTED};padding-top:8px"><b style="color:${INK}">${esc(m.name)}:</b> ${esc(m.text)}</div>`).join('')}
  </td></tr></table></td></tr>
  <tr><td style="padding:28px 24px 0;font:900 22px ${FONT};color:${INK};text-transform:uppercase">Deine 3 größten <span style="color:${RED}">Hebel</span></td></tr>
  <tr><td style="padding:6px 24px 0"><table width="100%" cellpadding="0" cellspacing="0" role="presentation">${levers}</table></td></tr>
  <tr><td style="padding:30px 24px 0">
    <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="background:${NAVY}"><tr><td style="padding:24px">
      <div style="font:900 21px/1.15 ${FONT};color:#fff;text-transform:uppercase">Wo stehst du im Marketing <span style="color:${RED}">insgesamt?</span></div>
      <div style="font:14px/1.6 ${FONT};color:#d3d8e2;padding:10px 0 18px">Im Sichtbarkeits-Check schaue ich 15 Minuten online mit dir auf Marke, Auftritt und Sichtbarkeit. Du erfährst, welche drei Dinge dich am meisten Kunden kosten. Kostenlos und ohne Verpflichtung.</div>
      <a href="${cta}" style="display:inline-block;background:${RED};color:#fff;text-decoration:none;padding:13px 26px;font:800 15px ${FONT};text-transform:uppercase;letter-spacing:1px">Sichtbarkeits-Check anfragen</a>
    </td></tr></table>
  </td></tr>
  <tr><td style="padding:26px 24px 4px;font:14px/1.5 ${FONT};color:${INK}">
    <div style="font-weight:800">Marcel Wiechmann</div>
    <div style="color:${MUTED}">Externer Markenberater · komplett remote</div>
    <div style="padding-top:4px"><a href="mailto:hello@marcelwiechmann.com" style="color:${RED};text-decoration:none">hello@marcelwiechmann.com</a> · <a href="${siteUrl}" style="color:${RED};text-decoration:none">marcelwiechmann.com</a></div>
  </td></tr>
  <tr><td style="padding:18px 24px 26px;font:12px/1.55 ${FONT};color:#7a8194">
    Du bekommst diese E-Mail einmalig, weil du auf marcelwiechmann.com/webseitencheck einen Check angefordert hast. Falls du das nicht warst, kannst du sie einfach ignorieren.<br>
    Die Bewertung ersetzt keine persönliche Beratung.<br>
    <a href="${siteUrl}/impressum" style="color:#7a8194">Impressum</a> · <a href="${siteUrl}/datenschutz" style="color:#7a8194">Datenschutz</a>
  </td></tr>
</table></td></tr></table></body></html>`;
  const text = [
    'Hallo,', `danke für deine Anfrage. Hier ist meine Auswertung zu deiner Seite ${r.host}: ${r.score}/100 Punkte (${r.verdict})`, '',
    ...r.cats.map((c) => [`${c.name}: ${label(c.score)} (${c.score})`, c.problem && `Das bremst dich: ${c.problem}`, c.stark && `Das läuft gut: ${c.stark}`, c.hebel && `Dein nächster Schritt: ${c.hebel}`].filter(Boolean).join('\n') + '\n'),
    'So habe ich geprüft:', ...(r.method || []).map((m) => `${m.name}: ${m.text}`), '',
    'Deine 3 größten Hebel:', ...r.levers.map((l, i) => `${i + 1}. ${l.name}: ${l.text}`), '',
    'Wo stehst du im Marketing insgesamt? Im Sichtbarkeits-Check schaue ich 15 Minuten online mit dir auf Marke, Auftritt und Sichtbarkeit. Kostenlos und ohne Verpflichtung:',
    cta, '',
    'Marcel Wiechmann · Externer Markenberater · hello@marcelwiechmann.com', '',
    'Du bekommst diese E-Mail einmalig, weil du den Check angefordert hast. Die Bewertung ersetzt keine persönliche Beratung.',
  ].join('\n');
  return { subject, html, text };
}

function buildLeadMail({ firma, url, email, contactOk, report, at, diag = {} }) {
  const r = report;
  const subject = clean(`Webseiten-Check: ${firma} · ${r.score}/100${contactOk ? ' · Kontakt erlaubt' : ''}`);
  const rows = [
    ['Firma', firma], ['Webseite', url], ['E-Mail', email],
    ['Kontakt per E-Mail erlaubt', contactOk ? 'JA' : 'nein (nur Bericht)'],
    ['Score', `${r.score}/100`], ['Zeitpunkt', at],
    ['KI-Auswertung', r.usedAi ? (diag.ai || 'ja') : `NEIN, grobe Einschätzung: ${diag.ai || 'unbekannt'}`],
    ['PageSpeed-Messung', r.usedPsi ? 'ja' : `NEIN: ${diag.psi || 'unbekannt'}`],
  ];
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
