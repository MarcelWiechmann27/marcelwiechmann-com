// Vercel Serverless Function – versendet das Kontaktformular über Resend.
// Benoetigt die Umgebungsvariable RESEND_API_KEY (Vercel: Settings -> Environment Variables).
module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  try {
    const { name, email, telefon, themen, nachricht, firma, _ts } = req.body || {};

    // Honeypot: verstecktes Feld, das nur Bots ausfüllen. Ist es gefüllt, stillschweigend abbrechen.
    if (firma && String(firma).trim() !== '') {
      res.status(200).json({ ok: true });
      return;
    }

    // Zeit-Check: echte Menschen brauchen mindestens ein paar Sekunden, um das Formular auszufüllen.
    // Bots senden meist sofort nach dem Laden der Seite ab.
    const submittedAt = Date.now();
    const loadedAt = Number(_ts);
    if (!loadedAt || Number.isNaN(loadedAt) || submittedAt - loadedAt < 3000) {
      res.status(200).json({ ok: true });
      return;
    }

    if (!name || !email || !nachricht) {
      res.status(400).json({ error: 'Bitte Name, E-Mail und Nachricht ausfüllen.' });
      return;
    }

    const themenText = Array.isArray(themen) && themen.length ? `\nThemen: ${themen.join(', ')}` : '';
    const telText = telefon ? `\nTelefon: ${telefon}` : '';

    const r = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'Kontaktformular <kontakt@marcelwiechmann.com>', // muss eine bei Resend verifizierte Absenderadresse auf deiner Domain sein
        to: ['hello@marcelwiechmann.com'],
        reply_to: email,
        subject: `Anfrage über marcelwiechmann.com – ${name}`,
        text: `Name: ${name}\nE-Mail: ${email}${telText}${themenText}\n\n${nachricht}`,
      }),
    });

    if (!r.ok) {
      const errText = await r.text();
      console.error('Resend error:', r.status, errText);
      res.status(502).json({ error: 'E-Mail-Versand fehlgeschlagen.' });
      return;
    }

    res.status(200).json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Serverfehler.' });
  }
};
