'use strict';
// Schutz davor, dass der Server interne Adressen abruft (SSRF).
const dns = require('dns').promises;
const net = require('net');

function isPrivateIPv4(ip) {
  const p = ip.split('.').map(Number);
  if (p.length !== 4 || p.some((n) => Number.isNaN(n))) return true;
  const [a, b] = p;
  return (
    a === 0 || a === 10 || a === 127 ||
    (a === 100 && b >= 64 && b <= 127) ||   // CGNAT
    (a === 169 && b === 254) ||              // Link-local / Cloud-Metadaten
    (a === 172 && b >= 16 && b <= 31) ||
    (a === 192 && b === 168) ||
    (a === 192 && b === 0) ||
    (a === 198 && (b === 18 || b === 19)) ||
    a >= 224                                 // Multicast, reserviert
  );
}

function isPrivateIPv6(ip) {
  const x = ip.toLowerCase();
  if (x === '::' || x === '::1') return true;
  if (x.startsWith('fe8') || x.startsWith('fe9') || x.startsWith('fea') || x.startsWith('feb')) return true; // fe80::/10
  if (x.startsWith('fc') || x.startsWith('fd')) return true;                                                  // fc00::/7
  if (x.startsWith('::ffff:')) {                                                                              // IPv4-mapped
    const v4 = x.slice(7);
    return net.isIPv4(v4) ? isPrivateIPv4(v4) : true;
  }
  return false;
}

function isPrivateIp(ip) {
  if (net.isIPv4(ip)) return isPrivateIPv4(ip);
  if (net.isIPv6(ip)) return isPrivateIPv6(ip);
  return true;
}

// Macht aus Nutzereingabe eine saubere http(s)-URL oder wirft einen Fehler mit Meldung für die Anzeige.
function normalizeUrl(input) {
  let raw = String(input || '').trim();
  if (!raw || raw.length > 300) throw new UserError('Bitte gib eine gültige Webseiten-Adresse ein.');
  if (!/^https?:\/\//i.test(raw)) raw = 'https://' + raw;
  let u;
  try { u = new URL(raw); } catch { throw new UserError('Diese Webseiten-Adresse kann ich nicht lesen. Prüf sie bitte noch mal.'); }
  if (!['http:', 'https:'].includes(u.protocol)) throw new UserError('Bitte nutze eine Adresse mit http oder https.');
  if (u.username || u.password) throw new UserError('Adressen mit Zugangsdaten sind nicht erlaubt.');
  if (u.port && !['80', '443'].includes(u.port)) throw new UserError('Nur die üblichen Ports 80 und 443 sind erlaubt.');
  const host = u.hostname.replace(/^\[|\]$/g, '');
  if (!net.isIP(host) && !host.includes('.')) throw new UserError('Bitte gib eine vollständige Adresse ein, zum Beispiel www.deine-seite.de.');
  u.hash = '';
  return u;
}

class UserError extends Error {
  constructor(message, status = 400) { super(message); this.name = 'UserError'; this.status = status; }
}

// Prüft, dass der Host nur auf öffentliche Adressen zeigt.
async function assertPublicHost(hostname, lookup = dns.lookup.bind(dns)) {
  const host = hostname.replace(/^\[|\]$/g, '');
  if (net.isIP(host)) {
    if (isPrivateIp(host)) throw new UserError('Diese Adresse ist nicht öffentlich erreichbar.');
    return;
  }
  let addrs;
  try { addrs = await lookup(host, { all: true }); }
  catch { throw new UserError('Diese Webseite habe ich nicht gefunden. Prüf die Adresse bitte noch mal.'); }
  if (!addrs.length || addrs.some((a) => isPrivateIp(a.address))) {
    throw new UserError('Diese Adresse ist nicht öffentlich erreichbar.');
  }
}

module.exports = { normalizeUrl, assertPublicHost, isPrivateIp, UserError };
