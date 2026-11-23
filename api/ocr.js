// ═══════════════════════════════════════════════════════════════════
//  THERMOSYS v3 — Vercel Serverless Function : /api/ocr
//  Rôle  : Proxy sécurisé Gemini 2.5 Flash + compression Sharp
//  Modes : nameplate (OCR plaque) | barcode (code-barres / QR)
// ═══════════════════════════════════════════════════════════════════
import https  from 'https';
import sharp  from 'sharp';

// ── Securite : session Supabase obligatoire, limites, origine ──────
const SUPABASE_URL  = process.env.SUPABASE_URL      || 'https://qltwswtiyzhzwihzjkwb.supabase.co';
const SUPABASE_ANON = process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFsdHdzd3RpeXpoendpaHpqa3diIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQ4OTk1MzYsImV4cCI6MjEwMDQ3NTUzNn0.NapZil3VokS9h2c4D1acyr_aSKpV4oPvHvuyzTAZjB0'; // cle publique (role anon), deja presente dans la page
const SITE_ORIGIN   = process.env.SITE_ORIGIN       || 'https://thermosys-v3.vercel.app';
const MAX_BASE64    = 6000000;                  // ~4,5 Mo d'image
const MODES_OK      = ['extract', 'diagnose', 'conform', 'translate', 'barcode', 'qrcode'];
const MIMES_OK      = ['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'image/heif', 'image/gif', 'application/pdf'];
const LIMITE_N      = 20;                       // appels max par utilisateur
const LIMITE_MS     = 10 * 60 * 1000;           // sur 10 minutes (par instance serveur : protection de base)
const compteurs     = new Map();

async function verifierSession(req) {
  const m = /^Bearer\s+(.+)$/i.exec(req.headers['authorization'] || '');
  if (!m) return null;
  try {
    const r = await fetch(SUPABASE_URL + '/auth/v1/user', {
      headers: { apikey: SUPABASE_ANON, Authorization: 'Bearer ' + m[1] },
      signal: AbortSignal.timeout(5000)
    });
    if (!r.ok) return null;
    const u = await r.json();
    return (u && u.id) ? u : null;
  } catch (e) { return null; }
}

function limiteAtteinte(id) {
  const t = Date.now();
  const l = (compteurs.get(id) || []).filter(x => t - x < LIMITE_MS);
  if (l.length >= LIMITE_N) { compteurs.set(id, l); return true; }
  l.push(t); compteurs.set(id, l);
  if (compteurs.size > 5000) { compteurs.clear(); }
  return false;
}

export default async function handler(req, res) {

  // ── Sécurité CORS ──────────────────────────────────────────────
  res.setHeader('Access-Control-Allow-Origin',  SITE_ORIGIN);
  res.setHeader('Vary', 'Origin');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST')
    return res.status(405).json({ error: 'Méthode non autorisée.' });

  // ── Connexion obligatoire (jeton Supabase verifie cote serveur) ──
  const utilisateur = await verifierSession(req);
  if (!utilisateur)
    return res.status(401).json({ error: 'Connexion requise : connectez-vous pour utiliser l\'OCR.' });
  if (limiteAtteinte(utilisateur.id))
    return res.status(429).json({ error: 'Trop de demandes : réessayez dans quelques minutes.' });

  try {
    // ── Clé API (variable Vercel — jamais exposée côté client) ────
    const aiKey = process.env.GEMINI_API_KEY;
    if (!aiKey)
      return res.status(500).json({ error: 'GEMINI_API_KEY manquante dans les variables Vercel.' });

    // ── Récupération des données ───────────────────────────────────
    const { imageBase64, mimeType, mode, lang } = req.body;
    const rawImage = imageBase64 || req.body.image;
    if (!rawImage)
      return res.status(400).json({ error: 'Aucune donnée image reçue.' });
    if (typeof rawImage !== 'string' || rawImage.length > MAX_BASE64)
      return res.status(413).json({ error: 'Image trop volumineuse (maximum environ 4,5 Mo).' });
    if (mode !== undefined && MODES_OK.indexOf(mode) === -1)
      return res.status(400).json({ error: 'Mode inconnu.' });
    if (mimeType !== undefined && MIMES_OK.indexOf(mimeType) === -1)
      return res.status(400).json({ error: 'Format d\'image non pris en charge.' });

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
