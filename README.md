# marcelwiechmann.com – Deploy-Paket für Vercel

## Enthalten
- `index.html` – die Startseite (One-Pager)
- `datenschutz.html` – Datenschutzerklärung
- `impressum.html` – Impressum
- `vercel.json` – sorgt für saubere URLs (z. B. /datenschutz statt /datenschutz.html)
- `api/contact.js` – Serverless-Funktion, die das Kontaktformular über Resend verschickt

## Kontaktformular / Resend einrichten
Das Formular ruft jetzt `/api/contact` per fetch auf (kein mailto mehr, öffnet also kein E-Mail-Programm beim Besucher).

Damit der Versand funktioniert, brauchst du bei Vercel unter **Settings → Environment Variables**:
- `RESEND_API_KEY` = dein API-Key von resend.com (für "Production" UND ggf. "Preview" setzen)

Und bei Resend:
- Domain `marcelwiechmann.com` muss dort verifiziert sein (die DNS-Records, die Resend dir zeigt, bei Vercel unter Domains eintragen – genau wie bei ImprovMX).
- Die Absenderadresse in `api/contact.js` (aktuell `kontakt@marcelwiechmann.com`) muss zu dieser verifizierten Domain passen. Willst du eine andere Absenderadresse, einfach in `api/contact.js` bei `from:` ändern.
- Nach jeder Änderung an `api/contact.js`: neu deployen, damit Vercel die Funktion aktualisiert.

## Deployment (in 2 Minuten)
1. Auf vercel.com einloggen.
2. "Add New… → Project" → diesen Ordner (bzw. das entpackte ZIP) hochladen. Kein Build-Command nötig, "Other" reicht.
3. Environment Variable `RESEND_API_KEY` setzen (siehe oben), danach einmal neu deployen.
4. Eigene Domain unter Project → Settings → Domains verbinden.

## Sonst noch offen
- YouTube-Video-IDs: Falls noch Platzhalter-Links auf den Kanal statt auf einzelne Videos zeigen, in `index.html` bei `data-video=""` die jeweilige YouTube-Video-ID eintragen.
- Bilder sind aktuell direkt in `index.html` eingebettet (Base64), daher die Dateigröße (~4 MB). Funktioniert, lädt aber langsamer als mit separaten Bilddateien.
