// Thermosys - Tests de non-regression de l'outil « Confort ete (degres-heures) » de l'onglet Vannes / Prereglage
// Usage (depuis le dossier files) :  node tests\vannes_dh_regression.js     (ou : node tests\vannes_dh_regression.js chemin\index.html)
// Codes de sortie : 0 = tout est bon ; 1 = au moins un test echoue ; 2 = fichier ou module illisible.
//
// STATUT DES REFERENCES (rien n'est cache) :
//  - DH = max(0, T interieure - T limite) x heures par jour x jours : definition d'un degre-heure ; calcul simplifie (temperature et heures supposees constantes).
//  - Limites hautes de temperature operative d'ete de l'EN 16798-1 (activite sedentaire, categories I, II, III) : 25,5 ; 26 ; 27 C : verifiees (REHVA, tableau des categories). Pas de limite pour la categorie IV.
//  - Les seuils de DH de l'outil (100 / 300 / 600) et le seuil « surchauffe severe » (28 C, 200 DH) NE SONT PAS normatifs et n'ont PAS pu etre verifies : ils sont affiches comme « indicatifs, propres a l'outil ».
//  - Anciennes valeurs retirees car sans source : puissance de climatisation 40 + 4 x (T ext - 26) W/m2, COP 3,2, « brasseurs d'air -2 a -4 C », « protection solaire -40 % », « vegetalisation ».
//  - Les mutations (derniere section) introduisent volontairement une erreur dans le code : chacune doit faire echouer au moins un test.
'use strict';
const fs = require('fs'), path = require('path');
const htmlFile = process.argv[2] || path.join('dist', 'index.html');
let h; try { h = fs.readFileSync(htmlFile, 'utf8').replace(/\r\n/g, '\n'); } catch (e) { console.error('Fichier illisible : ' + htmlFile); process.exit(2); }
const open = '<script id="vannes39-module">', a = h.indexOf(open), b = h.indexOf('</script>', a);
if (a < 0 || b < 0) { console.error('Module DH introuvable dans ' + htmlFile); process.exit(2); }
const CODE = h.slice(a + open.length, b);
function node(txt, attrs) { return { textContent: txt, attrs: Object.assign({}, attrs), getAttribute(k) { return this.attrs[k] == null ? null : this.attrs[k]; }, setAttribute(k, v) { this.attrs[k] = v; } }; }
function makeRun(code) {
  const els = {};
  const el = id => (els[id] = els[id] || { id, value: '', textContent: '', innerHTML: '', style: {}, parentNode: { style: {} } });
  const doc = { getElementById: id => els[id] || null };
  const win = { lang: 'fr' };
  const nodes = [node('CALCULATEUR DEGRÉS-HEURES — EN 15251', { 'data-fr': 'CALCULATEUR DEGRÉS-HEURES — EN 15251', 'data-en': 'DEGREE-HOURS CALCULATOR — EN 15251' }), node('Catégorie EN 15251 :', { 'data-fr': 'Catégorie EN 15251 :', 'data-en': 'EN 15251 Category:' }), node('SEUILS EN 15251', { 'data-fr': 'SEUILS EN 15251', 'data-en': 'EN 15251 THRESHOLDS' }), node('25°C'), node('26°C'), node('Résultats', { 'data-fr': 'Résultats' })];
  el('prc-dh').querySelectorAll = () => nodes; el('prc-dh').__nodes = nodes;
  ['dh-surf', 'dh-result', 'dh-solutions', 'dh-cat'].forEach(k => el(k));
  const f = new Function('document', 'window', 'setInterval', code + '\nreturn window;');
  const w = f(doc, win, () => 0);
  return { w, el, nodes };
}
const BASE = { 'dh-text': 36, 'dh-tint': 28, 'dh-tlim': 26, 'dh-hjour': 8, 'dh-jours': 90, 'dh-cat': 'II' };
function dh(code, inp, lang) {
  const r = makeRun(code); r.w.lang = lang || 'fr'; const I = Object.assign({}, BASE, inp || {});
  for (const k in I) r.el(k).value = String(I[k]);
  r.w.calcDH(); const t = r.el('dh-result').textContent; return { t, L: t.split('\n'), sol: r.el('dh-solutions').innerHTML, r };
}
const num = s => parseFloat(String(s).replace(/[\s ]/g, '').replace(',', '.'));
const LIMR = { I: 100, II: 300, III: 600 }, TOPR = { I: 25.5, II: 26, III: 27 };
function suite(code, verbose) {
  let ok = 0, ko = 0;
  function T(name, cond, detail) { if (cond) ok++; else { ko++; if (verbose) console.log('  ECHEC : ' + name + (detail ? ' -> ' + detail : '')); } }
  { const t = dh(code, {});   // (28-26) x 8 x 90 = 1440 DH, cat II limite 300 -> +380 %
    T('DH = 1440', /DH calculé : 1440 DH/.test(t.t), t.t);
    T('Depassement +380 %', /Critère dépassé : \+380 %/.test(t.t), t.t);
    T('DH > 28 C = 0', /\(> 28 °C, seuil de l’outil\) : 0 DH/.test(t.t), t.t);
    T('Seuil annonce indicatif', /seuil indicatif propre à l’outil, non normatif/.test(t.t));
    T('Limite EN 16798-1 cat II = 26,0 avec alerte', /EN 16798-1 cat\. II : 26,0 °C ⚠️/.test(t.t), t.t);
    T('Plus de puissance ni energie inventees', !/W\/m²|kWh|COP|kW\b/.test(t.t.replace(/CHARGE THERMIQUE \/ CHARGE PRO/, '')), t.t);
    T('Solutions sans chiffres inventes', !/−2|−4|40 %|25 W/.test(t.sol) && /rafraîchissement actif/.test(t.sol), t.sol);
    T('Surface plus utilisee', !/Surface/.test(t.t)); }
  for (const [Tint, cat, DHr] of [[28, 'II', 1440], [26.5, 'II', 360], [26.4, 'II', 288], [26.5, 'III', 360], [27, 'III', 720], [25.5, 'I', 0], [27.5, 'I', 1080], [26.0, 'II', 0]]) {
    const t = dh(code, { 'dh-tint': Tint, 'dh-cat': cat }), D = Math.max(0, Tint - 26) * 8 * 90, lim = LIMR[cat], okr = D <= lim;
    T('DH ' + Tint + '/' + cat, Math.abs(num(/DH calculé : ([\d,]+) DH/.exec(t.t)[1]) - D) < 0.6 && Math.abs(D - DHr) < 1e-6, t.L[4]);
    T('verdict ' + Tint + '/' + cat, okr ? /✅ Inconfort limité — catégorie/.test(t.t) && t.t.indexOf('❌') < 0 : /❌ Critère dépassé : \+(\d+) %/.test(t.t) && num(/\+(\d+) %/.exec(t.t)[1]) === Math.round((D / lim - 1) * 100), t.L[6]);
    T('limite EN ' + cat + ' ' + Tint, t.t.indexOf('EN 16798-1 cat. ' + cat + ' : ' + TOPR[cat].toFixed(1).replace('.', ',') + ' °C ' + (Tint <= TOPR[cat] ? '✅' : '⚠️')) >= 0, t.t); }
  { // egalite exacte avec le seuil : cat I, DH = 100 -> accepte
    const t = dh(code, { 'dh-tint': 27.25, 'dh-tlim': 26, 'dh-hjour': 4, 'dh-jours': 20, 'dh-cat': 'I' }); T('DH = limite exacte (100) accepte', /DH calculé : 100 DH/.test(t.t) && /✅ Inconfort limité/.test(t.t), t.t);
    const t2 = dh(code, { 'dh-tint': 27.3, 'dh-tlim': 26, 'dh-hjour': 4, 'dh-jours': 20, 'dh-cat': 'I' }); T('DH = 104 depasse la limite', /❌ Critère dépassé : \+4 %/.test(t2.t), t2.t); }
  { const t = dh(code, { 'dh-tint': 40, 'dh-cat': 'IV' }); T('Cat IV : pas de verdict ni de limite EN', /aucun seuil de DH/.test(t.t) && /Pas de verdict/.test(t.t) && t.t.indexOf('✅ Inconfort') < 0 && t.t.indexOf('❌') < 0 && t.t.indexOf('EN 16798-1 cat.') < 0, t.t); }
  { const t = dh(code, { 'dh-tint': 40, 'dh-cat': 'IV' }); T('Cat IV : recommandation neutre', /pas de critère de DH/.test(t.sol) && !/Inconfort limité|Dépassement|Surchauffe/.test(t.sol), t.sol);
    const t1 = dh(code, { 'dh-tint': 28.5, 'dh-cat': 'III' }); T('DH28 360 > 200 : surchauffe severe', /Surchauffe sévère/.test(t1.sol), t1.sol);
    const t2 = dh(code, { 'dh-tint': 28.2, 'dh-cat': 'III' }); T('DH28 144 < 200 : pas de surchauffe severe', !/Surchauffe sévère/.test(t2.sol), t2.sol); }
  { const t = dh(code, { 'dh-tint': 31, 'dh-cat': 'II' }); T('DH > 28 C : (31-28) x 720 = 2160', /: 2160 DH/.test(t.t.split('\n').filter(x => /> 28/.test(x))[0] || ''), t.t);
    T('Surchauffe severe : recommandations', /Surchauffe sévère/.test(t.sol) && /Dépassement important/.test(t.sol), t.sol); }
  { const t = dh(code, { 'dh-tint': 26.6, 'dh-cat': 'III' }); T('Cat III 432 DH : > 70 % de 600 -> marge', /Inconfort limité/.test(t.t) && /Proche du seuil/.test(t.sol), t.sol);
    const t2 = dh(code, { 'dh-tint': 26.4, 'dh-cat': 'III' }); T('Cat III 288 DH : pas de marge', !/Proche du seuil/.test(t2.sol), t2.sol);
    const t3 = dh(code, { 'dh-tint': 26.5, 'dh-cat': 'II' }); T('Depassement modere : pas de climatisation imposee', !/Dépassement important/.test(t3.sol) === (360 <= 600), t3.sol); }
  for (const bad of [{ 'dh-text': '' }, { 'dh-tint': '' }, { 'dh-tlim': '' }, { 'dh-hjour': '' }, { 'dh-hjour': 0 }, { 'dh-hjour': 25 }, { 'dh-jours': '' }, { 'dh-jours': 0 }, { 'dh-jours': 367 }, { 'dh-jours': -3 }]) {
    const t = dh(code, bad); T('entree invalide ' + JSON.stringify(bad), /Saisir toutes les températures/.test(t.t) && t.t.indexOf('DH calculé') < 0 && t.sol === '', t.t); }
  for (const good of [{ 'dh-hjour': 24 }, { 'dh-jours': 366 }, { 'dh-tlim': 0 }, { 'dh-text': 0 }, { 'dh-hjour': 0.5 }]) { const t = dh(code, good); T('entree limite acceptee ' + JSON.stringify(good), /DH calculé/.test(t.t), t.t); }
  { const t = dh(code, { 'dh-hjour': 8.5, 'dh-jours': 90.5, 'dh-tint': 28 }); T('virgule : 2 x 8,5 x 90,5 = 1538,5 -> 1539', /DH calculé : 153[89] DH/.test(t.t), t.t); }
  { const t = dh(code, { 'dh-tint': '28,5' }); T('virgule decimale acceptee (2,5 x 720 = 1800)', /DH calculé : 1800 DH/.test(t.t), t.t); }
  { const t = dh(code, { 'dh-cat': 'X' }); T('categorie inconnue -> II', /cat\. II : 300 DH/.test(t.t), t.t); }
  { const t = dh(code, { 'dh-cat': 'IV' }, 'en'), e = dh(code, {}, 'en'); T('anglais', /DH calculated: 1440 DH/.test(e.t) && /Criterion exceeded: \+380 %/.test(e.t) && /Upper operative temperature limit, EN 16798-1 cat\. II : 26\.0 °C/.test(e.t), e.t);
    T('anglais cat IV', /No verdict for category IV/.test(t.t), t.t); }
  { const r = makeRun(code), n = r.nodes;
    T('UI : titre EN 15251 -> EN 16798-1 (fr)', n[0].attrs['data-fr'] === 'CALCULATEUR DEGRÉS-HEURES — EN 16798-1' && n[0].textContent === 'CALCULATEUR DEGRÉS-HEURES — EN 16798-1');
    T('UI : titre (en)', n[0].attrs['data-en'] === 'DEGREE-HOURS CALCULATOR — EN 16798-1');
    T('UI : libelle categorie', n[1].textContent === 'Catégorie EN 16798-1 :' && n[1].attrs['data-en'] === 'EN 16798-1 Category:');
    T('UI : seuils', n[2].textContent === 'SEUILS EN 16798-1' && n[2].attrs['data-en'] === 'EN 16798-1 THRESHOLDS');
    T('UI : cat I 25 -> 25,5 C', n[3].textContent === '25,5°C' && n[4].textContent === '26°C');
    T('UI : autre element intact', n[5].textContent === 'Résultats');
    T('UI : ligne surface masquee', r.el('dh-surf').parentNode.style.display === 'none'); }
  return { ok, ko };
}
const MUT = [
  ['formule DH', 'Math.max(0, Tint - Tlim) * h * d, DH28', 'Math.max(0, Tint - Tlim) * h * d * 2, DH28'],
  ['DH surchauffe 28', 'Math.max(0, Tint - 28) * h * d;', 'Math.max(0, Tint - 27) * h * d;'],
  ['seuil cat I', 'var LIM = { I: 100,', 'var LIM = { I: 150,'],
  ['seuil cat II', 'II: 300,', 'II: 400,'],
  ['seuil cat III', 'III: 600 }', 'III: 500 }'],
  ['limite EN cat I', 'var TOP = { I: 25.5,', 'var TOP = { I: 25,'],
  ['limite EN cat II', 'II: 26, III: 27 }', 'II: 25.5, III: 27 }'],
  ['limite EN cat III', 'III: 27 };', 'III: 28 };'],
  ['egalite au seuil', 'DH <= lim,', 'DH < lim,'],
  ['pourcentage de depassement', 'Math.round((DH / lim - 1) * 100)', 'Math.round((DH / lim) * 100)'],
  ['heures > 24', 'h <= 24', 'h <= 48'],
  ['heures = 0', '!(h > 0 && h <= 24)', '!(h >= 0 && h <= 24)'],
  ['jours > 366', 'd <= 366', 'd <= 800'],
  ['jours = 0', '(d > 0 && d <= 366)', '(d >= 0 && d <= 366)'],
  ['temperature vide acceptee', '!isFinite(Text) ||', 'false ||'],
  ['Tlim vide acceptee', '!isFinite(Tlim) ||', 'false ||'],
  ['categorie inconnue', "{ cat = 'II'; }", "{ cat = 'III'; }"],
  ['recommandation DH > 2 x seuil', 'DH > lim * 2', 'DH > lim * 5'],
  ['recommandation DH28 > 200', 'DH28 > 200', 'DH28 > 2000'],
  ['marge 70 %', 'DH > lim * 0.7', 'DH > lim * 0.9'],
  ['titre EN 15251', "v.split('EN 15251').join('EN 16798-1')", "v"],
  ['texte EN 15251', "e.textContent = e.textContent.split('EN 15251').join('EN 16798-1');", "e.textContent = e.textContent;"],
  ['25 C -> 25,5', "e.textContent = '25,5°C'", "e.textContent = '25°C'"],
  ['surface masquee', "s.parentNode.style.display = 'none'", "s.parentNode.style.display = ''"],
  ['verdict dans le message', "'❌ Critère dépassé : +'", "'❌ Critère : +'"],
  ['virgule decimale', ".replace(',', '.').trim()", ".trim()"]
];
(function main() {
  const base = suite(CODE, true);
  if (base.ko) { console.log('ECHEC : ' + base.ko + ' verification(s) en echec sur ' + (base.ok + base.ko) + '.'); process.exit(1); }
  let mok = 0, bad = [];
  for (const [name, from, to] of MUT) {
    const parts = CODE.split(from);
    if (parts.length !== 2) { console.log('  MUTATION INAPPLICABLE (' + (parts.length - 1) + ' occurrence(s)) : ' + name); bad.push(name); continue; }
    let r; try { r = suite(parts.join(to), false); } catch (e) { r = { ko: 1 }; }
    if (r.ko > 0) mok++; else { console.log('  MUTATION NON DETECTEE : ' + name); bad.push(name); }
  }
  console.log((bad.length ? 'ECHEC' : 'TOUT EST BON') + ' : ' + base.ok + ' verification(s) reussie(s) (dont ' + mok + '/' + MUT.length + ' mutations detectees), ' + bad.length + ' echec(s).');
  process.exit(bad.length ? 1 : 0);
})();
