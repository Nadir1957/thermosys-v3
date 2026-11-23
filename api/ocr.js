// ═══════════════════════════════════════════════════════════════════
//  THERMOSYS v3 — Vercel Serverless Function : /api/ocr
//  Rôle  : Proxy sécurisé Gemini 2.5 Flash + compression Sharp
//  Modes : nameplate (OCR plaque) | barcode (code-barres / QR)
// ═══════════════════════════════════════════════════════════════════
import https  from 'https';
import sharp  from 'sharp';

// THERMOSYS_AUTH_V1 - verification du compte Supabase avant tout appel a Gemini
const SUPABASE_HOST = 'qltwswtiyzhzwihzjkwb.supabase.co';
const SUPABASE_ANON = process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFsdHdzd3RpeXpoendpaHpqa3diIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQ4OTk1MzYsImV4cCI6MjEwMDQ3NTUzNn0.NapZil3VokS9h2c4D1acyr_aSKpV4oPvHvuyzTAZjB0';
const ALLOWED_ORIGIN = /^https:\/\/thermosys-v3(-[a-z0-9-]+)?\.vercel\.app$/;
const RATE_MAX = 40;            // demandes max par utilisateur
const RATE_WINDOW_MS = 600000;  // par fenetre de 10 minutes
const MAX_IMAGE_CHARS = 8000000;
const _rate = new Map();

function supaGet(p, token) {
  return new Promise((resolve, reject) => {
    const r = https.request({
      hostname: SUPABASE_HOST, port: 443, path: p, method: 'GET',
      headers: { 'apikey': SUPABASE_ANON, 'Authorization': 'Bearer ' + token }
    }, (rs) => {
      let d = '';
      rs.on('data', ch => d += ch);
      rs.on('end', () => { try { resolve({ status: rs.statusCode, json: JSON.parse(d) }); } catch (e) { resolve({ status: rs.statusCode, json: null }); } });
    });
    r.setTimeout(8000, () => r.destroy(new Error('timeout')));
    r.on('error', reject);
    r.end();
  });
}

function rateLimited(uid) {
  const now = Date.now();
  const arr = (_rate.get(uid) || []).filter(t => now - t < RATE_WINDOW_MS);
  if (arr.length >= RATE_MAX) { _rate.set(uid, arr); return true; }
  arr.push(now); _rate.set(uid, arr);
  if (_rate.size > 5000) { for (const [k, v] of _rate) { if (!v.some(t => now - t < RATE_WINDOW_MS)) _rate.delete(k); } }
  return false;
}


export default async function handler(req, res) {

  // ── Sécurité CORS ──────────────────────────────────────────────
  const _origin = String(req.headers['origin'] || '');
  if (ALLOWED_ORIGIN.test(_origin)) res.setHeader('Access-Control-Allow-Origin', _origin);
  res.setHeader('Vary', 'Origin');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST')
    return res.status(405).json({ error: 'Méthode non autorisée.' });

  try {
    // ── Clé API (variable Vercel — jamais exposée côté client) ────
    // THERMOSYS_AUTH_V1 : seuls les comptes connectes et approuves peuvent utiliser l'OCR
    const authHeader = String(req.headers['authorization'] || '');
    const token = authHeader.replace(/^Bearer\s+/i, '').trim();
    if (!token) return res.status(401).json({ error: 'Connexion requise / Login required.' });
    let who;
    try { who = await supaGet('/auth/v1/user', token); }
    catch (e) { return res.status(503).json({ error: 'Verification du compte indisponible. Reessayez.' }); }
    if (who.status !== 200 || !who.json || !who.json.id)
      return res.status(401).json({ error: 'Session invalide ou expiree / Invalid or expired session.' });
    const uid = who.json.id;
    let prof;
    try { prof = await supaGet('/rest/v1/profiles?select=status,is_admin&id=eq.' + encodeURIComponent(uid), token); }
    catch (e) { return res.status(503).json({ error: 'Verification du compte indisponible. Reessayez.' }); }
    const row = (prof.status === 200 && Array.isArray(prof.json)) ? prof.json[0] : null;
    if (!row || !(row.status === 'approved' || row.is_admin === true))
      return res.status(403).json({ error: 'Compte non autorise / Account not authorized.' });
    if (rateLimited(uid))
      return res.status(429).json({ error: 'Trop de demandes. Reessayez dans quelques minutes / Too many requests.' });

    const aiKey = process.env.GEMINI_API_KEY;
    if (!aiKey)
      return res.status(500).json({ error: 'GEMINI_API_KEY manquante dans les variables Vercel.' });

    // ── Récupération des données ───────────────────────────────────
    const { imageBase64, mimeType, mode, lang } = req.body;
    if (req.body && typeof (req.body.imageBase64 || req.body.image) === 'string' && (req.body.imageBase64 || req.body.image).length > MAX_IMAGE_CHARS)
      return res.status(413).json({ error: 'Image trop volumineuse / Image too large.' });
    const rawImage = imageBase64 || req.body.image;
    if (!rawImage)
      return res.status(400).json({ error: 'Aucune donnée image reçue.' });

    const base64Input = rawImage.includes(',') ? rawImage.split(',')[1] : rawImage;
    const inputBuffer = Buffer.from(base64Input, 'base64');

    // ── Pré-traitement Sharp (100 % en mémoire, aucun fichier disque) ──
    let processedBase64 = base64Input;
    let processedMime   = 'image/jpeg';

    try {
      if (mode === 'barcode' || mode === 'qrcode') {
        // ── Mode Code-barres / QR Code ────────────────────────────
        // Objectif : contraste extrême, noir et blanc pur, envoi rapide
        const buf = await sharp(inputBuffer)
          .resize({ width: 1200, withoutEnlargement: true })
          .greyscale()                          // niveaux de gris
          .normalize()                          // étirement de l'histogramme
          .sharpen({ sigma: 1.5 })              // netteté renforcée
          .threshold(128)                       // binarisation N/B pur
          .jpeg({ quality: 70, progressive: false })
          .toBuffer();
        processedBase64 = buf.toString('base64');

      } else {
        // ── Mode Plaque Signalétique / OCR Texte (par défaut) ─────
        // Objectif : lisibilité maximale des caractères, poids réduit
        const buf = await sharp(inputBuffer)
          .resize({ width: 1920, withoutEnlargement: true })
          .greyscale()                          // supprime les artefacts couleur
          .normalize()                          // améliore le contraste global
          .sharpen({ sigma: 0.8, m1: 1, m2: 3 }) // netteté fine pour les petits caractères
          .jpeg({ quality: 82, progressive: true, mozjpeg: true })
          .toBuffer();
        processedBase64 = buf.toString('base64');
      }
    } catch (sharpErr) {
      // Si Sharp échoue (format non supporté), on utilise l'image originale
      console.warn('[THERMOSYS] Sharp skipped:', sharpErr.message);
      processedBase64 = base64Input;
      processedMime   = mimeType || 'image/jpeg';
    }

    // ── Sélection du prompt selon le mode ─────────────────────────
    const prompts_fr = {
      extract:   'Effectue une extraction OCR stricte et exhaustive de tout le texte visible sur cette image de plaque signalétique industrielle. Liste chaque valeur avec son libellé exact.',
      diagnose:  'Analyse techniquement cette plaque signalétique HVAC. Identifie les données clés (puissance, réfrigérant, pression, courant) et signale toute anomalie ou incohérence technique.',
      conform:   'Contrôle la conformité réglementaire de cette plaque signalétique HVAC selon les normes EN 378, EN 60335, PED 2014/68/UE et F-Gas. Liste les points conformes et les non-conformités.',
      translate: 'Traduis techniquement en français tous les termes et abréviations visibles sur cette plaque signalétique. Fournis le terme original, sa traduction et son unité SI si applicable.',
      barcode:   'Lis et décode intégralement ce code-barres ou QR Code. Retourne toutes les données encodées, le format détecté (EAN-13, QR, Data Matrix, Code 128, etc.) et leur signification.',
      qrcode:    'Analyse et décode ce QR Code. Retourne le contenu complet, le type de données (URL, texte, vCard, etc.) et toute information pertinente encodée.'
    };
    const prompts_en = {
      extract:   'Perform a strict and exhaustive OCR extraction of all text visible on this industrial nameplate image. List each value with its exact label.',
      diagnose:  'Technically analyze this HVAC nameplate. Identify key data (power, refrigerant, pressure, current) and flag any technical anomaly or inconsistency.',
      conform:   'Check the regulatory compliance of this HVAC nameplate against the EN 378, EN 60335, PED 2014/68/EU and F-Gas standards. List compliant points and non-conformities.',
      translate: 'Technically translate into English all terms and abbreviations visible on this nameplate. Provide the original term, its translation, and its SI unit if applicable.',
      barcode:   'Read and fully decode this barcode or QR Code. Return all encoded data, the detected format (EAN-13, QR, Data Matrix, Code 128, etc.) and their meaning.',
      qrcode:    'Analyze and decode this QR Code. Return the full content, the data type (URL, text, vCard, etc.) and any relevant encoded information.'
    };
    const prompts = (lang === 'en') ? prompts_en : prompts_fr;
    const promptText = prompts[mode] || prompts.extract;

    // ── Construction de la requête Gemini 2.5 Flash ────────────────
    const payload = JSON.stringify({
      contents: [{
        parts: [
          { text: promptText },
          { inlineData: { mimeType: processedMime, data: processedBase64 } }
        ]
      }],
      generationConfig: {
        temperature:     0.1,
        topP:            0.95,
        maxOutputTokens: 2048
      }
    });

    const options = {
      hostname: 'generativelanguage.googleapis.com',
      port:     443,
      path:     `/v1/models/gemini-2.5-flash:generateContent?key=${aiKey}`,
      method:   'POST',
      headers:  {
        'Content-Type':   'application/json',
        'Content-Length': Buffer.byteLength(payload)
      }
    };

    // ── Appel HTTPS natif vers Gemini avec retry automatique (503) ─
    const callGemini = () => new Promise((resolve, reject) => {
      const gReq = https.request(options, (gRes) => {
        let data = '';
        gRes.on('data',  chunk => data += chunk);
        gRes.on('end',   ()    => {
          if (gRes.statusCode >= 200 && gRes.statusCode < 300) {
            resolve(data);
          } else {
            reject(new Error(`Gemini API Error (${gRes.statusCode}): ${data.substring(0, 200)}`));
          }
        });
      });
      gReq.on('error', e => reject(e));
      gReq.write(payload);
      gReq.end();
    });

    const sleep = ms => new Promise(r => setTimeout(r, ms));
    let responseText;
    let lastError;
    for (let attempt = 1; attempt <= 3; attempt++) {
      try {
        responseText = await callGemini();
        break; // succès
      } catch (err) {
        lastError = err;
        const is503 = err.message.indexOf('503') !== -1;
        const is429 = err.message.indexOf('429') !== -1;
        if ((is503 || is429) && attempt < 3) {
          console.log(`[THERMOSYS OCR] Tentative ${attempt}/3 échouée (${is503?'503':'429'}) — retry dans ${attempt * 2}s`);
          await sleep(attempt * 2000); // 2s, 4s
        } else {
          throw err;
        }
      }
    }

    // ── Extraction de la réponse ───────────────────────────────────
    const parsed     = JSON.parse(responseText);
    const textResult = parsed?.candidates?.[0]?.content?.parts?.[0]?.text
                    || 'Aucun texte extrait. Vérifiez la qualité de l\'image.';

    return res.status(200).json({ text: textResult });

  } catch (error) {
    console.error('[THERMOSYS OCR] Error:', error.message);
    return res.status(500).json({ error: error.message });
  }
}

module.exports = handler;
