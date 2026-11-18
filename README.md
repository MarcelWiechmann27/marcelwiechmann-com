# marcelwiechmann.com – komplettes Paket für GitHub und Vercel

## Inhalt
- `index.html` – die Startseite (DE/EN). Alle Bilder liegen jetzt als Dateien in `img/`, die Seite lädt dadurch deutlich schneller.
- `webseitencheck.html` – die Seite unter /webseitencheck (jetzt für Google freigegeben, mit eigener Beschreibung und Vorschaubild)
- `impressum.html`, `datenschutz.html` – Pflichtseiten (bewusst `noindex`)
- `404.html` – eigene Fehlerseite
- `api/check.js`, `api/contact.js`, `lib/` – Server-Funktionen (Webseiten-Check mit KI und PageSpeed, Kontaktformular, E-Mail über Resend)
- `img/`, `wc-assets/` – Bilder; `og.jpg` – Vorschaubild für Social Media und Google
- `favicon.ico`, `favicon.svg`, `favicon-16.png`, `favicon-32.png`, `apple-touch-icon.png`, `icon-192.png`, `icon-512.png`, `site.webmanifest` – Favicons
- `sitemap.xml`, `robots.txt` – für Google
- `vercel.json` – saubere URLs, Weiterleitungen, Sicherheits- und Cache-Header, 60 Sekunden Laufzeit für den Check

## Einrichtung (einmalig)
1. **Resend:** Domain marcelwiechmann.com ist dort verifiziert (SPF/DKIM). Absender ist `check@marcelwiechmann.com`.
2. **Vercel → Projekt → Settings → Environment Variables** (Production) anlegen:
   - `RESEND_API_KEY` – Pflicht. Ohne ihn zeigt der Check "gerade nicht verfügbar".
   - `ANTHROPIC_API_KEY` – für die Bewertung von Botschaft, Handlungsaufforderung und Vertrauen. Ohne ihn gibt es nur eine grobe Einschätzung.
   - `PAGESPEED_API_KEY` – empfohlen (kostenlos, Google Cloud Console → "PageSpeed Insights API"). Ohne Schlüssel wird die Messung von Google oft gedrosselt.
   - Optional: `ANTHROPIC_MODEL` (Standard `claude-haiku-5-5`), `LEAD_TO` (Standard hello@marcelwiechmann.com), `MAIL_FROM` (Standard `Marcel Wiechmann <check@marcelwiechmann.com>`).
3. Danach neu deployen, damit die Variablen greifen.
4. **Kosten begrenzen:** In der Anthropic-Konsole ein monatliches Limit setzen. In Vercel unter Firewall eine Rate-Limit-Regel für `/api/check` anlegen (zum Beispiel 10 Anfragen pro Stunde und IP).

## Deployment
Im Vercel-Projekt ein neues Deployment mit dem entpackten Ordner per Drag-and-drop. Kein Build-Command nötig.

## Vor dem Livegang prüfen
- `webseitencheck.html` enthält `noindex`. Die Zeile entfernen, wenn die Seite bei Google auftauchen darf.
- Mit einer echten Webseite und deiner eigenen E-Mail-Adresse einmal durchtesten (Bericht und Lead-Hinweis kommen an).
- Datenschutz-Abschnitt "Webseiten-Check" lesen: Speicherdauer (6 Monate) und Anbieter müssen zu dir passen. Mit Resend, Anthropic, Google und Vercel brauchst du Auftragsverarbeitungsverträge, die sich in den jeweiligen Konten per Klick abschließen lassen.
- Das Kontaktformular der Startseite läuft weiter über mailto, unverändert.
