'use strict';
// POST /api/check – prüft eine Webseite, schickt den Bericht per Resend und meldet den Lead an Marcel.
const dns = require('dns').promises;
const { normalizeUrl, UserError } = require('../lib/ssrf');
const { analyze } = require('../lib/analyze');
const { buildUserMail, buildLeadMail, sendMail } = require('../lib/mail');

const HOUR = 3600 * 1000;
const EMAIL_RE = /^[^\s@<>"',;]+@[^\s@<>"',;]+\.[A-Za-z]{2,}$/;

function createHandler(deps) {
  const hits = new Map(); // Schlüssel -> Zeitstempel (best effort, pro Instanz)
  const limited = (key, max, now) => {
    const list = (hits.get(key) || []).filter((t) => now - t < HOUR);
    if (list.length >= max) { hits.set(key, list); return true; }
    list.push(now); hits.set(key, list);
    if (hits.size > 5000) for (const [k, v] of hits) if (!v.some((t) => now - t < HOUR)) hits.delete(k);
    return false;
  };
  const originOk = (origin, env) => {
    if (!origin) return true; // z. B. direkte Tests
    try {
      const h = new URL(origin).hostname;
      const extra = (env.ALLOWED_ORIGINS || '').split(',').map((s) => s.trim()).filter(Boolean);
      return h === 'marcelwiechmann.com' || h === 'www.marcelwiechmann.com' || h.endsWith('.vercel.app') || extra.includes(h);
    } catch { return false; }
  };
  const send = (res, status, body) => { res.statusCode = status; res.setHeader('content-type', 'application/json; charset=utf-8'); res.setHeader('cache-control', 'no-store'); res.end(JSON.stringify(body)); };

  return async function handler(req, res) {
    const { env } = deps;
    const now = (deps.now || Date.now)();
    if (req.method !== 'POST') { res.setHeader('allow', 'POST'); return send(res, 405, { ok: false, error: 'Nur POST erlaubt.' }); }
    if (!originOk(req.headers.origin, env)) return send(res, 403, { ok: false, error: 'Nicht erlaubt.' });
    if (!env.RESEND_API_KEY) return send(res, 503, { ok: false, error: 'Der Check ist gerade nicht verfügbar. Bitte versuch es später noch einmal.' });

    try {
      let b = req.body;
      if (typeof b === 'string') { try { b = JSON.parse(b); } catch { b = null; } }
      if (!b || typeof b !== 'object') throw new UserError('Die Anfrage war unvollständig.');
      if (b.hp) throw new UserError('Die Anfrage konnte nicht verarbeitet werden.');
      if (typeof b.t === 'number' && b.t < 2500) throw new UserError('Das ging zu schnell. Bitte versuch es noch einmal.');
      const firma = clean(b.firma, 120);
      const email = clean(b.email, 254).toLowerCase();
      if (!firma) throw new UserError('Bitte gib den Namen deines Unternehmens ein.');
      if (!EMAIL_RE.test(email)) throw new UserError('Bitte gib eine gültige E-Mail-Adresse ein.');
      if (b.consent !== true) throw new UserError('Bitte stimme zu, damit ich dir den Bericht schicken darf.');
      const urlObj = normalizeUrl(b.url);

      const ip = String(req.headers['x-forwarded-for'] || req.headers['x-real-ip'] || 'unknown').split(',')[0].trim();
      if (limited('ip:' + ip, 5, now) || limited('mail:' + email, 3, now) || limited('host:' + urlObj.hostname, 8, now)) {
        throw new UserError('Du hast in der letzten Zeit schon mehrere Checks gestartet. Bitte versuch es in einer Stunde noch einmal.', 429);
      }

      const report = await analyze(urlObj, deps);
      const siteUrl = env.SITE_URL || 'https://marcelwiechmann.com';
      const at = new Date(now).toLocaleString('de-DE', { timeZone: 'Europe/Berlin' });
      const userMail = buildUserMail({ firma, report, siteUrl });
      const leadMail = buildLeadMail({ firma, url: urlObj.href, email, contactOk: b.contactOk === true, report, at });
      const [mailSent] = await Promise.all([
        sendMail(deps, { to: email, ...userMail, replyTo: env.LEAD_TO || 'hello@marcelwiechmann.com' }),
        sendMail(deps, { to: env.LEAD_TO || 'hello@marcelwiechmann.com', ...leadMail, replyTo: email }),
      ]);
      return send(res, 200, { ok: true, mailSent, report });
    } catch (err) {
      if (err instanceof UserError) return send(res, err.status, { ok: false, error: err.message });
      console.error('check failed:', err && err.message);
      return send(res, 500, { ok: false, error: 'Beim Prüfen ist etwas schiefgelaufen. Versuch es bitte gleich noch einmal.' });
    }
  };
}

function clean(v, max) { return String(v == null ? '' : v).replace(/[\u0000-\u001f\u007f]/g, ' ').trim().slice(0, max); }

const handler = createHandler({ fetch: (...a) => fetch(...a), lookup: dns.lookup.bind(dns), env: process.env });
module.exports = handler;
module.exports.createHandler = createHandler;
