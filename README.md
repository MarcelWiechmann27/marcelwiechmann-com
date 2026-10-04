# marcelwiechmann.com – Deploy-Paket für Vercel

## Enthalten
- `index.html` – die Startseite (One-Pager, zweisprachig DE/EN)
- `datenschutz.html` – Datenschutzerklärung
- `impressum.html` – Impressum
- `vercel.json` – saubere URLs (z. B. /datenschutz statt /datenschutz.html) + 301-Weiterleitungen alter Seiten
- `robots.txt` – erlaubt Suchmaschinen-Crawling, verweist auf die Sitemap
- `sitemap.xml` – listet die drei echten Seiten für Google
- `api/contact.js` – Serverless-Funktion, die das Kontaktformular über Resend verschickt

## SEO: alte, bereits bei Google indexierte Seiten
Die alte Seite hatte u. a. diese Google-indexierten URLs:
- marcelwiechmann.com/ (alte DVM-Startseite)
- marcelwiechmann.com/7tage/ (7-Tage-AI-Challenge)
- marcelwiechmann.com/Branding/ (Branding Check)

`vercel.json` leitet diese drei (plus ein paar nahe Varianten wie /dvm, /checkliste) automatisch per 301 auf die neue Startseite "/" weiter. Das verhindert "Seite nicht gefunden"-Fehler bei Besuchern, die über alte Google-Treffer kommen, und überträgt die bisherige Linkkraft auf die neue Seite, statt sie zu verlieren.

Falls in der Google Search Console (Property marcelwiechmann.com) noch weitere alte URLs auftauchen, kannst du mir die Liste schicken – dann ergänze ich die Weiterleitungen.

## Nach dem Hochladen: in der Google Search Console
1. In der Search Console die neue Sitemap einreichen: `https://www.marcelwiechmann.com/sitemap.xml`
2. Unter "Entfernungen" bzw. per "URL-Prüfung" für die alten URLs (z. B. /7tage/, /Branding/) eine erneute Indexierung anstoßen, damit Google die 301-Weiterleitung zeitnah übernimmt.

## Kontaktformular / Resend
Das Formular ruft `/api/contact` per fetch auf (kein mailto mehr).

Bei Vercel unter **Settings → Environment Variables**:
- `RESEND_API_KEY` = dein API-Key von resend.com (für "Production" setzen)

Bei Resend:
- Domain `marcelwiechmann.com` muss dort als "Verified" angezeigt werden.
- Die Absenderadresse in `api/contact.js` (aktuell `kontakt@marcelwiechmann.com`) muss zu dieser verifizierten Domain passen.

## Deployment (in 2 Minuten)
1. Auf vercel.com einloggen.
2. "Add New… → Project" → diesen Ordner (bzw. das entpackte ZIP) hochladen. Kein Build-Command nötig, "Other" reicht.
3. Environment Variable `RESEND_API_KEY` setzen, danach einmal neu deployen.
4. Eigene Domain unter Project → Settings → Domains verbinden.
5. Analytics im Vercel-Dashboard unter "Analytics" aktivieren (Script ist bereits in allen drei HTML-Dateien eingebaut).

## Sonst noch offen
- YouTube-Video-IDs: Falls noch Platzhalter-Links auf den Kanal statt auf einzelne Videos zeigen, in `index.html` bei `data-video=""` die jeweilige YouTube-Video-ID eintragen.
- Bilder sind aktuell direkt in `index.html` eingebettet (Base64), daher die Dateigröße (~4 MB). Funktioniert, lädt aber langsamer als mit separaten Bilddateien.
