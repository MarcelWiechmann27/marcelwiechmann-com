# marcelwiechmann.com – Deploy-Paket für Vercel

## Enthalten
- `index.html`, `datenschutz.html`, `impressum.html` – deine Seite (Stand von GitHub, ergänzt um Menüpunkt, Button und Datenschutz-Abschnitt zum Webseiten-Check; DE/EN-Umschalter bleibt erhalten)
- `webseitencheck.html` – die Seite unter /webseitencheck, `wc-assets/` – Logo und Fotos dafür
- `api/check.js` + `lib/` – die Server-Funktion hinter dem Check (Prüfung, KI-Auswertung, Versand über Resend)
- `vercel.json` – saubere URLs, Weiterleitungen (/websitecheck, /website-check, /webseiten-check, /Webseitencheck → /webseitencheck) und 60 Sekunden Laufzeit für die Funktion

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
