// Thermosys - Tests de non-regression du module « Gaines d'air » (dimensionnement par la vitesse + diametre equivalent de Huebscher)
// Usage (depuis le dossier files) :  node tests\gaines_regression.js     (ou : node tests\gaines_regression.js chemin\index.html)
// Codes de sortie : 0 = tout est bon ; 1 = au moins un test echoue ; 2 = fichier ou module illisible.
//
// STATUT DES REFERENCES (rien n'est cache) :
//  - Le module dimensionne par la VITESSE (S = Q / v) ; il ne calcule PAS les pertes de charge du reseau.
//  - Formule de Huebscher  De = 1,30 (a.b)^0,625 / (a+b)^0,25 : confirmee par un exemple publie (EngineeringToolBox, d'apres ASHRAE) :
//    300 x 500 mm -> 420 mm ;  8 x 12 po -> 10,7 po. Ces deux valeurs servent de reference dans ce test.
//  - Serie de diametres circulaires 80 ... 1250 mm : serie courante des gaines circulaires (EngineeringToolBox : 63 a 1250). 63 mm n'est pas dans le module.
//  - Plages de vitesses (5-8 / 3-5 / 1,5-3 m/s) : valeurs USUELLES indicatives, non issues d'une norme ; les tableaux publies varient selon le batiment
//    (ex. 5 m/s pour un logement, jusqu'a 10 m/s pour des bureaux, en gaine principale de soufflage). Le test verifie que le module applique SES plages.
//  - Le rapport d'aspect maximal des gaines rectangulaires n'a pas pu etre verifie dans une source : le module n'en parle pas, le test non plus.
//  - Les mutations (section 8) introduisent volontairement une erreur dans le code : chacune doit faire echouer au moins un test.
'use strict';
const fs = require('fs'), path = require('path');
const htmlFile = process.argv[2] || path.join('dist', 'index.html');
let h; try { h = fs.readFileSync(htmlFile, 'utf8').replace(/\r\n/g, '\n'); } catch (e) { console.error('Fichier illisible : ' + htmlFile); process.exit(2); }
const a1 = h.indexOf('function calcGaine(){'), b1 = h.indexOf('// TUYAUTERIE FRIGORIFIQUE', a1);
const a2 = h.indexOf('/* 5. Gaines'), b2 = h.indexOf('/* 6. Tuyauterie', a2);
if (a1 < 0 || b1 < 0 || a2 < 0 || b2 < 0) { console.error('Module gaines introuvable dans ' + htmlFile); process.exit(2); }
const CODE = h.slice(a1, b1), WRAP = h.slice(a2, b2);

// mini DOM : juste ce qu'il faut pour lire le resultat
function makeEnv(inputs) {
  const els = {};
  const inp = id => (els[id] = els[id] || { value: inputs[id] === undefined ? '' : String(inputs[id]) });
  const res = { innerHTML: '', _extra: [], appendChild(n) { this._extra.push(n); }, rows: null,
    querySelectorAll(sel) { return this._rows(); }, querySelector(sel) { if (sel === '.hy48w') return this._extra.find(n => n.className === 'hy48w') || null; return null; },
    _rows() {
      if (this.rows) return this.rows;
      const out = []; const re = /<div class="frow"><span class="flb">(.*?) :<\/span><b>(.*?)<\/b><\/div>/g; let m;
      while ((m = re.exec(this.innerHTML))) { const lab = { textContent: m[1] + ' :' }, b = { textContent: m[2] };
        out.push({ textContent: m[1] + ' :' + m[2], lab, b, querySelector(s) { return s === 'b' ? b : s === '.flb' ? lab : null; } }); }
      return (this.rows = out);
    } };
  const doc = { getElementById(id) { return id === 'gaineResult' ? res : inp(id); }, createElement() { return { style: {}, className: '', textContent: '', remove() {} }; } };
  return { doc, res };
}
function runCode(code, wrap, inputs, lang) {
  const env = makeEnv(inputs), win = {};
  const f = new Function('document', 'lang', 'logHist', '__sxl', 'window', '$', 'L',
    code + '\nwindow.calcGaine = calcGaine;\n' + (wrap ? wrap : '') + '\nreturn window.calcGaine;');
  const fn = f(env.doc, lang || 'fr', function () {}, s => s, win, id => env.doc.getElementById(id), (fr, en) => (lang || 'fr') === 'fr' ? fr : en);
  fn();
  const rows = {}; const re = /<div class="frow"><span class="flb">(.*?) :<\/span><b>(.*?)<\/b><\/div>/g; let m;
  while ((m = re.exec(env.res.innerHTML))) rows[m[1]] = m[2];
  const warn = /color:var\(--wn\)/.test(env.res.innerHTML) ? env.res.innerHTML.replace(/<[^>]+>/g, '') : '';
  return { rows, html: env.res.innerHTML, warn, extra: env.res._extra, rowObjs: env.res.rows };
}

// ---- 2e implementation independante
const DNS = [80, 100, 125, 160, 200, 250, 315, 400, 500, 630, 800, 1000, 1250];
const RG = { principale: [5, 8], secondaire: [3, 5], terminal: [1.5, 3] };
const huebscher = (a, b) => 1.30 * Math.pow(a * b, 0.625) / Math.pow(a + b, 0.25);
function refCirc(Q, v) {
  const A = Q / 3600 / v, D = Math.sqrt(4 * A / Math.PI) * 1000;
  let best = DNS[0]; for (const d of DNS) if (Math.abs(d - D) < Math.abs(best - D)) best = d;
  return { D, DN: best, vr: Q / 3600 / (Math.PI * Math.pow(best / 2000, 2)) };
}
function refRect(Q, v, H) {
  const Wex = Q * 1e6 / (3600 * v * H);                 // mm, sans passer par des metres intermediaires
  const W = Math.ceil(Wex / 10 - 1e-6) * 10;
  return { Wex, W, De: huebscher(W, H), vr: Q / 3600 / (W / 1000 * H / 1000) };
}
const num = s => parseFloat(String(s).replace(/[^0-9.\-]/g, ' ').trim().split(/\s+/)[0]);
let seed = 4242; const rnd = () => (seed = (seed * 1664525 + 1013904223) % 4294967296) / 4294967296;
const pick = arr => arr[Math.floor(rnd() * arr.length)];

function suite(code, wrap, verbose) {
  let ok = 0, ko = 0;
  const T = (name, cond, info) => { if (cond) ok++; else { ko++; if (verbose || true) console.log('  ECHEC  ' + name + (info ? '  [' + info + ']' : '')); } };
  const run = (inp, lg) => runCode(code, wrap, inp, lg);
  const C = (Q, v, pos) => run({ gaineQ: Q, gaineVmax: v, gainePos: pos || 'principale', gaineForme: 'circ' });
  const R = (Q, v, H, pos) => run({ gaineQ: Q, gaineVmax: v, gaineH: H, gainePos: pos || 'principale', gaineForme: 'rect' });

  // 1) reference publiee de la formule de Huebscher (independante du module)
  T('Huebscher 300 x 500 mm = 420 mm (EngineeringToolBox)', Math.round(huebscher(300, 500)) === 420, huebscher(300, 500));
  T('Huebscher 8 x 12 po = 10,7 po (EngineeringToolBox)', Math.abs(huebscher(8, 12) - 10.7) < 0.05, huebscher(8, 12));

  // 2) circulaire : cas calcules a la main
  let r = C(1000, 5);
  T('Q 1000 m3/h, 5 m/s : Ø calcule 266 mm', r.rows['Diamètre calculé'] === '266 mm', r.rows['Diamètre calculé']);
  T('... Ø normalise 250', r.rows['Diamètre normalisé'] === 'Ø 250 mm', r.rows['Diamètre normalisé']);
  T('... vitesse reelle 5,66 m/s', num(r.rows['Vitesse réelle (Ø normalisé)']) === 5.66, r.rows['Vitesse réelle (Ø normalisé)']);
  r = C(20000, 5);
  T('Q 20000 m3/h, 5 m/s : Ø 1250 disponible (et non 1000)', r.rows['Diamètre normalisé'] === 'Ø 1250 mm', r.rows['Diamètre normalisé']);
  r = C(30, 3);
  T('petit debit : plus petit Ø de la serie = 80', r.rows['Diamètre normalisé'] === 'Ø 80 mm', r.rows['Diamètre normalisé']);

  // 3) rectangulaire : cas calcules a la main
  r = R(2700, 5, 300);
  T('2700 m3/h, 5 m/s, H 300 : section 500 x 300', r.rows['Dimensions calculées (l×h)'] === '500 × 300 mm', r.rows['Dimensions calculées (l×h)']);
  T('... diametre equivalent 420 mm (exemple publie)', r.rows['Diamètre équivalent'] === '420 mm', r.rows['Diamètre équivalent']);
  T('... vitesse reelle 5,00 m/s', num(r.rows['Vitesse réelle (section arrondie)']) === 5, r.rows['Vitesse réelle (section arrondie)']);
  r = R(136.8, 2, 100);
  T('largeur exacte 190 mm : pas d\'arrondi parasite a 200', r.rows['Dimensions calculées (l×h)'] === '190 × 100 mm', r.rows['Dimensions calculées (l×h)']);
  r = R(1000, 5, 200);
  T('1000 m3/h, 5 m/s, H 200 : largeur 280 (277,8 arrondi au 10 mm superieur)', r.rows['Dimensions calculées (l×h)'] === '280 × 200 mm', r.rows['Dimensions calculées (l×h)']);
  T('... De calcule sur la section AFFICHEE 280 x 200', r.rows['Diamètre équivalent'] === Math.round(huebscher(280, 200)) + ' mm', r.rows['Diamètre équivalent'] + ' vs ' + huebscher(280, 200).toFixed(1));

  // 4) plages de vitesses et icones
  const ic = (Q, v, pos) => /✅/.test(C(Q, v, pos).rows['Vitesse retenue']) ;
  T('principale : 5 m/s accepte (borne basse)', ic(1000, 5, 'principale'));
  T('principale : 4,99 m/s refuse', !ic(1000, 4.99, 'principale'));
  T('principale : 8 m/s accepte (borne haute)', ic(1000, 8, 'principale'));
  T('principale : 8,01 m/s refuse', !ic(1000, 8.01, 'principale'));
  T('secondaire : 3 m/s accepte', ic(1000, 3, 'secondaire'));
  T('secondaire : 5 m/s accepte', ic(1000, 5, 'secondaire'));
  T('secondaire : 5,01 refuse', !ic(1000, 5.01, 'secondaire'));
  T('secondaire : 2,99 refuse', !ic(1000, 2.99, 'secondaire'));
  T('terminal : 1,5 m/s accepte', ic(1000, 1.5, 'terminal'));
  T('terminal : 3 m/s accepte', ic(1000, 3, 'terminal'));
  T('terminal : 1,49 refuse', !ic(1000, 1.49, 'terminal'));
  T('terminal : 3,01 refuse', !ic(1000, 3.01, 'terminal'));
  T('texte de plage affiche (principale)', C(1000, 6, 'principale').rows['Plage recommandée'] === '5 – 8 m/s');
  T('texte de plage affiche (terminal)', C(1000, 2, 'terminal').rows['Plage recommandée'] === '1.5 – 3 m/s');

  // 5) entrees invalides : message, aucun resultat, aucune valeur par defaut silencieuse
  for (const [lab, inp] of [['debit 0', { gaineQ: 0, gaineVmax: 5 }], ['debit negatif', { gaineQ: -100, gaineVmax: 5 }], ['debit vide', { gaineQ: '', gaineVmax: 5 }],
    ['vitesse 0', { gaineQ: 1000, gaineVmax: 0 }], ['vitesse negative', { gaineQ: 1000, gaineVmax: -2 }], ['vitesse vide', { gaineQ: 1000, gaineVmax: '' }]]) {
    const x = run(Object.assign({ gaineForme: 'circ', gainePos: 'principale' }, inp));
    T('entree invalide (' + lab + ') : message et pas de resultat', x.warn.indexOf('supérieurs à 0') >= 0 && Object.keys(x.rows).length === 0, x.warn);
  }
  for (const H of [0, -50, '']) {
    const x = run({ gaineQ: 1000, gaineVmax: 5, gaineForme: 'rect', gaineH: H });
    T('hauteur invalide (' + H + ') : message et pas de resultat', x.warn.indexOf('supérieure à 0') >= 0 && Object.keys(x.rows).length === 0, x.warn);
  }
  T('message en anglais', run({ gaineQ: 0, gaineVmax: 5 }, 'en').warn.indexOf('greater than 0') >= 0);

  // 6) 300 cas aleatoires contre la 2e implementation
  seed = 4242; let badC = 0, badR = 0;
  for (let i = 0; i < 300; i++) {
    const Q = Math.round(50 + rnd() * 40000), v = pick([1.5, 2, 2.5, 3, 3.5, 4, 5, 6, 7, 8]), pos = pick(Object.keys(RG));
    const x = C(Q, v, pos), e = refCirc(Q, v);
    if (x.rows['Diamètre calculé'] !== e.D.toFixed(0) + ' mm' || x.rows['Diamètre normalisé'] !== 'Ø ' + e.DN + ' mm' ||
      num(x.rows['Vitesse réelle (Ø normalisé)']) !== parseFloat(e.vr.toFixed(2))) badC++;
  }
  T('300 gaines circulaires aleatoires = 2e implementation', badC === 0, badC + ' ecart(s)');
  seed = 777;
  for (let i = 0; i < 300; i++) {
    const v = pick([1.5, 2, 2.5, 3, 4, 5, 6, 8]), H = pick([100, 150, 200, 250, 300, 400, 500]), W = 100 + 10 * Math.floor(rnd() * 150);
    const Q = pick([0, 1]) ? Math.round(3600 * v * (H / 1000) * (W / 1000) * 100) / 100 : Math.round(100 + rnd() * 30000);
    const x = R(Q, v, H), e = refRect(Q, v, H);
    const wOk = x.rows['Dimensions calculées (l×h)'] === e.W + ' × ' + H + ' mm';
    const dOk = x.rows['Diamètre équivalent'] === e.De.toFixed(0) + ' mm';
    const vOk = num(x.rows['Vitesse réelle (section arrondie)']) === parseFloat(e.vr.toFixed(2));
    if (!(wOk && dOk && vOk)) badR++;
  }
  T('300 gaines rectangulaires aleatoires = 2e implementation', badR === 0, badR + ' ecart(s)');

  // 7) coherences physiques
  seed = 99; let coh = 0;
  for (let i = 0; i < 100; i++) {
    const Q = Math.round(100 + rnd() * 20000), v = pick([2, 3, 4, 5, 6]), H = pick([150, 200, 300, 400]);
    const x = R(Q, v, H), vr = num(x.rows['Vitesse réelle (section arrondie)']), W = num(x.rows['Dimensions calculées (l×h)']);
    if (!(vr <= v + 0.005 && vr >= v * (W - 10) / W - 0.01)) coh++;     // l'arrondi vers le haut ne peut que baisser la vitesse, de moins de 10 mm / W
  }
  T('rect : la vitesse reelle est <= vitesse cible (arrondi vers le haut)', coh === 0, coh + ' cas');
  const dn = [80, 100, 125, 160, 200, 250, 315, 400, 500, 630, 800, 1000, 1250];
  const m = /var DN_STD = \[([^\]]*)\]/.exec(code);
  T('serie de diametres = 80 ... 1250', m && JSON.stringify(m[1].split(',').map(Number)) === JSON.stringify(dn), m && m[1]);

  // 7b) icone de la vitesse reelle d'une gaine rectangulaire (section arrondie) : calculee avec la plage de la position
  T('rect : 1000 m3/h, 5 m/s, H 200 -> 4,96 m/s reel : hors plage 5-8 (⚠️)', /⚠️/.test(R(1000, 5, 200, 'principale').rows['Vitesse réelle (section arrondie)']), R(1000, 5, 200, 'principale').rows['Vitesse réelle (section arrondie)']);
  T('rect : 2700 m3/h, 5 m/s, H 300 -> 5,00 m/s reel : dans la plage (✅)', /✅/.test(R(2700, 5, 300, 'principale').rows['Vitesse réelle (section arrondie)']));
  T('rect : meme vitesse reelle 5,00 m/s en piquage terminal (1,5-3) : hors plage (⚠️)', /⚠️/.test(R(2700, 5, 300, 'terminal').rows['Vitesse réelle (section arrondie)']));

  // 8) verdict final sur le diametre normalise (couche d'etape 48)
  if (wrap) {
    let x = C(1000, 5, 'principale');
    T('couche 48 : 5,66 m/s en principale -> OK', /✅/.test(x.rowObjs.find(o => /Vitesse réelle/.test(o.textContent)).b.textContent) && x.extra.length === 0);
    x = C(1000, 3, 'principale');
    T('couche 48 : Ø 315 -> 3,57 m/s hors plage 5-8 : avertissement', /⚠️/.test(x.rowObjs.find(o => /Vitesse réelle/.test(o.textContent)).b.textContent) && x.extra.length === 1);
    x = C(1000, 8, 'principale');
    T('couche 48 : Ø 200 -> 8,84 m/s au-dessus de la plage 5-8 : avertissement', /⚠️/.test(x.rowObjs.find(o => /Vitesse réelle/.test(o.textContent)).b.textContent) && x.extra.length === 1);
    x = C(1000, 5, 'principale');
    T('couche 48 : libelle « Vitesse de calcul »', x.rowObjs.find(o => /Vitesse retenue|Vitesse de calcul/.test(o.textContent)).lab.textContent === 'Vitesse de calcul :');
  }
  return { ok, ko };
}

console.log('Module gaines : ' + htmlFile);
const res = suite(CODE, WRAP, true);

// ---- Mutations
console.log('8) Mutations (chacune doit etre detectee)');
const MUT = [
  ['De : 1,30 devient 1,20', 'var De = 1.30 *', 'var De = 1.20 *', CODE],
  ['De : exposant 0,625 devient 0,6', 'Math.pow((WmmR*H),0.625)', 'Math.pow((WmmR*H),0.6)', CODE],
  ['De : exposant 0,25 devient 0,5', 'Math.pow((WmmR+H),0.25)', 'Math.pow((WmmR+H),0.5)', CODE],
  ['De calcule sur la largeur non arrondie', 'Math.pow((WmmR*H),0.625) / Math.pow((WmmR+H),0.25)', 'Math.pow((Wmm*H),0.625) / Math.pow((Wmm+H),0.25)', CODE],
  ['S = Q * v au lieu de Q / v', 'var area = Qs / v;', 'var area = Qs * v;', CODE],
  ['m3/h -> m3/s avec 3000', 'var Qs = Q / 3600;', 'var Qs = Q / 3000;', CODE],
  ['diametre : 2 au lieu de 4', 'Math.sqrt(4*area/Math.PI)', 'Math.sqrt(2*area/Math.PI)', CODE],
  ['serie sans 1250', ',800,1000,1250]', ',800,1000]', CODE],
  ['serie : 315 devient 300', '250,315,400', '250,300,400', CODE],
  ['arrondi 10 mm : round au lieu de ceil', 'Math.ceil(Wmm/10 - 1e-9)', 'Math.round(Wmm/10)', CODE],
  ['arrondi 10 mm sans tolerance', 'Math.ceil(Wmm/10 - 1e-9)', 'Math.ceil(Wmm/10)', CODE],
  ['vitesse reelle rect sur largeur non arrondie', '(WmmR/1000) * Hm', '(Wmm/1000) * Hm', CODE],
  ['vitesse reelle circ : rayon sans carre', 'Math.pow((DN/1000)/2,2)', 'Math.pow((DN/1000)/2,1)', CODE],
  ['DN le plus eloigne au lieu du plus proche', 'Math.abs(d-Dmm) < Math.abs(best-Dmm)', 'Math.abs(d-Dmm) > Math.abs(best-Dmm)', CODE],
  ['plage principale 4-8', 'principale:  {min:5,', 'principale:  {min:4,', CODE],
  ['plage secondaire 3-6', 'secondaire:  {min:3,   max:5,', 'secondaire:  {min:3,   max:6,', CODE],
  ['plage terminal 1-3', 'terminal:    {min:1.5, max:3,', 'terminal:    {min:1, max:3,', CODE],
  ['borne basse exclue', 'v >= rg.min && v <= rg.max', 'v > rg.min && v <= rg.max', CODE],
  ['borne haute exclue', 'v >= rg.min && v <= rg.max', 'v >= rg.min && v < rg.max', CODE],
  ['plus de controle debit / vitesse', '!(Q > 0) || !(v > 0)', 'false', CODE],
  ['plus de controle hauteur', '!(H > 0)', 'false', CODE],
  ['valeur par defaut silencieuse du debit', 'var Q = parseFloat((document.getElementById(\'gaineQ\')||{}).value);', 'var Q = parseFloat((document.getElementById(\'gaineQ\')||{}).value) || 1000;', CODE],
  ['icone rect : plage non testee', "((vRect>=rg.min && vRect<=rg.max)?'✅':'⚠️')", "'✅'", CODE],
  ['couche 48 : borne haute ignoree', 'vr<=parseFloat(m[2])', 'true', WRAP],
  ['couche 48 : borne basse ignoree', 'vr>=parseFloat(m[1])', 'true', WRAP]
];
let mok = 0, mdet = 0;
for (const [nm, s, rr, where] of MUT) {
  const parts = where.split(s);
  if (parts.length < 2) { console.log('  ECHEC  mutation « ' + nm + ' » : ancre introuvable'); mdet++; continue; }
  const mutated = parts.length === 2 ? parts.join(rr) : parts[0] + rr + parts.slice(1).join(s);
  const code2 = where === CODE ? mutated : CODE, wrap2 = where === WRAP ? mutated : WRAP;
  let q; try { seed = 4242; const keep = console.log; console.log = () => {}; try { q = suite(code2, wrap2, false); } finally { console.log = keep; } } catch (e) { q = { ko: 1 }; }
  if (q.ko > 0) mok++; else { console.log('  ECHEC  mutation « ' + nm + ' » NON detectee'); mdet++; }
}
const ok = res.ok + mok, ko = res.ko + mdet;
console.log('\n' + (ko === 0 ? 'TOUT EST BON' : 'ECHEC') + ' : ' + ok + ' verification(s) reussie(s) (dont ' + mok + '/' + MUT.length + ' mutations detectees), ' + ko + ' echec(s).');
process.exit(ko === 0 ? 0 : 1);
