// Thermosys - Tests de non-regression du calcul acoustique (niveau sonore a distance)
// Usage (depuis le dossier files) :  node tests\acoustique_regression.js     (ou : node tests\acoustique_regression.js chemin\index.html)
// Codes de sortie : 0 = tout est bon ; 1 = au moins un test echoue ; 2 = fichier ou module illisible.
//
// STATUT DES REFERENCES (rien n'est cache) :
//  - Lp = Lw + 10 log10(n) - 20 log10(r) - k : propagation d'une source ponctuelle. k = 11 dB en champ libre spherique (10 log10(4 pi) = 10,99) ; k = 8 dB en demi-sphere (un plan reflechissant : 11 - 3).
//    ISO 9613-2 : Adiv = 20 log10(d/d0) + 11 dB et correction de directivite de +3 dB pour une source sur un plan : coherent avec les deux valeurs de k.
//  - Les n unites sont supposees identiques et a la meme distance (somme energetique : +10 log10(n)).
//  - Resultat indicatif en champ lointain : ni absorption de l'air, ni ecran, ni bruit de fond, ni cas d'angle (deux plans, k = 5). Annonce dans le resultat.
//  - Les mutations (derniere section) introduisent volontairement une erreur dans le code : chacune doit faire echouer au moins un test.
'use strict';
const fs = require('fs'), path = require('path');
const htmlFile = process.argv[2] || path.join('dist', 'index.html');
let h; try { h = fs.readFileSync(htmlFile, 'utf8').replace(/\r\n/g, '\n'); } catch (e) { console.error('Fichier illisible : ' + htmlFile); process.exit(2); }
const o = '<script id="acoustique-45-module">', a = h.indexOf(o), b = h.indexOf('</script>', a);
if (a < 0 || b < 0) { console.error('Module acoustique introuvable dans ' + htmlFile); process.exit(2); }
const CODE = h.slice(a + o.length, b);
function run(code, inp, lang, sxl) {
  const els = {}; const el = id => (els[id] = els[id] || { id, value: '', innerHTML: '' });
  const doc = { getElementById: id => els[id] || null }; const win = { lang: lang || 'fr', hist: [] };
  ['acResult', 'acLw', 'acDist', 'acN', 'acType'].forEach(el);
  for (const k in inp) el(k).value = String(inp[k]);
  const f = new Function('document', 'window', 'logHist', '__sxl', code + '\nreturn window;');
  const w = f(doc, win, s => win.hist.push(s), sxl);
  w.calcAcoustic(); return { html: els.acResult.innerHTML, hist: win.hist, w };
}
const BASE = { acLw: 72, acDist: 10, acN: 1, acType: 'free' };
const num = s => parseFloat(String(s).replace(/[\s ]/g, '').replace(',', '.'));
function val(code, inp, lang) { const r = run(code, Object.assign({}, BASE, inp), lang); const m = /Niveau perçu à [\d,]+ m :<\/span><b>(-?[\d,]+) dB\(A\)/.exec(r.html), m2 = /Level perceived at [\d.]+ m :<\/span><b>(-?[\d.]+) dB\(A\)/.exec(r.html), t = /Puissance acoustique totale :<\/span><b>(-?[\d,]+)/.exec(r.html) || /Total sound power :<\/span><b>(-?[\d.]+)/.exec(r.html); return { lp: m ? num(m[1]) : m2 ? num(m2[1]) : NaN, lw: t ? num(t[1]) : NaN, html: r.html, r }; }
const refLp = (lw, d, n, wall) => lw + 10 * Math.log10(n) - 20 * Math.log10(d) - (wall ? 8 : 11);
function suite(code, verbose) {
  let ok = 0, ko = 0; function T(name, cond, detail) { if (cond) ok++; else { ko++; if (verbose) console.log('  ECHEC : ' + name + (detail ? ' -> ' + detail : '')); } }
  { const v = val(code, {}); T('Lw 72, 10 m, champ libre : 41,0 dB(A)', v.lp === 41, v.html); T('Lw total = 72,0', v.lw === 72); }
  { const v = val(code, { acType: 'wall' }); T('Contre un plan : 44,0 dB(A) (+3)', v.lp === 44, v.html); }
  { const v = val(code, { acN: 2 }); T('2 unites : +3,0 dB', v.lp === 44 && v.lw === 75, v.html);
    const v4 = val(code, { acN: 4 }); T('4 unites : +6,0 dB', v4.lp === 47 && v4.lw === 78, v4.html);
    const v10 = val(code, { acN: 10 }); T('10 unites : +10 dB', v10.lp === 51 && v10.lw === 82, v10.html);
    const v3 = val(code, { acN: 3 }); T('3 unites : +4,8 dB (4,77)', v3.lw === 76.8 && v3.lp === 45.8, v3.html); }
  { const v = val(code, { acDist: 20 }); T('Distance doublee : -6,0 dB', v.lp === 35, v.html);
    const v2 = val(code, { acDist: 1 }); T('1 m : 61,0', v2.lp === 61, v2.html);
    const v3 = val(code, { acDist: 100 }); T('100 m : 21,0', v3.lp === 21, v3.html); }
  let seed = 7; const rnd = () => (seed = (seed * 1664525 + 1013904223) % 4294967296) / 4294967296; let good = 0, n = 0;
  for (let i = 0; i < 60; i++) { const lw = Math.round((30 + rnd() * 90) * 10) / 10, d = Math.round((0.5 + rnd() * 200) * 10) / 10, nn = 1 + Math.floor(rnd() * 20), wall = rnd() < 0.5;
    const v = val(code, { acLw: lw, acDist: d, acN: nn, acType: wall ? 'wall' : 'free' }); n++;
    const rl = refLp(lw, d, nn, wall), rt = lw + 10 * Math.log10(nn);
    if (Math.abs(v.lp - rl) <= 0.051 && Math.abs(v.lw - rt) <= 0.051) good++; else if (verbose) console.log('   cas ' + [lw, d, nn, wall] + ' : ' + v.lp + ' vs ' + rl.toFixed(2));
  }
  T('60 cas aleatoires vs reference independante', good === n, good + '/' + n);
  for (const bad of [{ acLw: '' }, { acLw: 0 }, { acLw: -5 }, { acDist: '' }, { acDist: 0 }, { acDist: -1 }, { acN: '' }, { acN: 0 }, { acN: -2 }, { acN: 2.5 }, { acN: 'abc' }]) {
    const r = run(code, Object.assign({}, BASE, bad)); T('entree invalide ' + JSON.stringify(bad), /Veuillez saisir une puissance acoustique > 0/.test(r.html) && r.html.indexOf('Niveau perçu') < 0 && r.hist.length === 0, r.html); }
  { const r = run(code, Object.assign({}, BASE, { acN: '1,0' })); T('n = 1,0 accepte', /Niveau perçu/.test(r.html));
    const r2 = run(code, Object.assign({}, BASE, { acLw: '72,5', acDist: '10,5' })); T('virgule decimale', /Niveau perçu à 10,5 m/.test(r2.html), r2.html); }
  { const r = run(code, BASE); T('formule affichee (champ libre)', /Lp = Lw \+ 10·log\(n\) − 20·log\(r\) − 11 \(propagation sphérique\)/.test(r.html) && /Champ lointain seulement/.test(r.html) && /acousticien qualifié/.test(r.html), r.html);
    const w = run(code, Object.assign({}, BASE, { acType: 'wall' })); T('formule affichee (plan)', /− 8 \(demi-sphère, un plan réfléchissant\)/.test(w.html) && /Contre mur \/ sol/.test(w.html), w.html);
    T('historique', r.hist.length === 1 && r.hist[0] === 'Acoustique : 41,0 dB(A) @ 10,0 m', r.hist.join('|')); }
  { const r = run(code, BASE, 'en'); T('anglais', /Level perceived at 10\.0 m :<\/span><b>41\.0 dB\(A\)/.test(r.html) && /Free field/.test(r.html) && /Far field only/.test(r.html) && r.hist[0] === 'Acoustic: 41.0 dB(A) @ 10.0 m', r.html);
    const e = run(code, Object.assign({}, BASE, { acN: 0 }), 'en'); T('anglais invalide', /Please enter a sound power > 0/.test(e.html)); }
  { const r = run(code, BASE, 'fr', x => '[' + x + ']'); T('__sxl applique aux valeurs', /<b>\[41,0 dB\(A\)\]<\/b>/.test(r.html), r.html); }
  { const r = run(code, Object.assign({}, BASE, { acType: '' })); T('type absent -> champ libre', r.html.indexOf('Champ libre') >= 0); }
  return { ok, ko };
}
const MUT = [
  ['k champ libre', "var k = (type === 'wall') ? 8 : 11;", "var k = (type === 'wall') ? 8 : 10;"], ['k plan', "(type === 'wall') ? 8 : 11;", "(type === 'wall') ? 6 : 11;"],
  ['cas inverses', "(type === 'wall') ? 8 : 11;", "(type !== 'wall') ? 8 : 11;"],
  ['somme energetique', 'lw + 10 * Math.log10(n);', 'lw + 20 * Math.log10(n);'], ['distance', '- 20 * Math.log10(dist)', '- 10 * Math.log10(dist)'],
  ['signe distance', 'lwTotal - 20 * Math.log10(dist) - k', 'lwTotal + 20 * Math.log10(dist) - k'],
  ['Lw vide accepte', '!(lw > 0) ||', 'false ||'], ['Lw zero accepte', '!(lw > 0)', '!(lw >= 0)'], ['distance zero accepte', '!(dist > 0)', '!(dist >= 0)'], ['distance vide accepte', '|| !(dist > 0) ||', '|| false ||'],
  ['n zero accepte', 'n >= 1 &&', 'n >= 0 &&'], ['n decimal accepte', 'Math.floor(n) === n', 'true'], ['n vide accepte', "n = val('acN')", "n = (val('acN') || 1)"],
  ['virgule decimale', ".replace(',', '.').trim()", ".trim()"], ['format FR', "return isFr() ? s.replace('.', ',') : s;", 'return s;'],
  ['formule k affichee', "(k === 11 ? 'propagation sphérique' : 'demi-sphère, un plan réfléchissant')", "(k === 11 ? 'demi-sphère, un plan réfléchissant' : 'propagation sphérique')"],
  ['mention champ lointain', 'Champ lointain seulement, sans absorption de l’air, écran, ni bruit de fond. ', ''],
  ['historique', "if (typeof logHist === 'function') { logHist(T('Acoustique : ', 'Acoustic: ') + f(lp, 1) + ' dB(A) @ ' + f(dist, 1) + ' m'); }", ''],
  ['__sxl', "typeof __sxl === 'function' ? __sxl(x) : x", 'x'], ['type par defaut', "|| 'free';", "|| 'wall';"],
  ['libelle implantation', "T('Contre mur / sol', 'Against wall / ground')", "T('Champ libre', 'Free field')"]
];
(function main() {
  const base = suite(CODE, true);
  if (base.ko) { console.log('ECHEC : ' + base.ko + ' verification(s) en echec sur ' + (base.ok + base.ko) + '.'); process.exit(1); }
  let mok = 0, bad = [];
  for (const [name, from, to] of MUT) {
    const parts = CODE.split(from); if (parts.length !== 2) { console.log('  MUTATION INAPPLICABLE (' + (parts.length - 1) + ' occurrence(s)) : ' + name); bad.push(name); continue; }
    let r; try { r = suite(parts.join(to), false); } catch (e) { r = { ko: 1 }; }
    if (r.ko > 0) mok++; else { console.log('  MUTATION NON DETECTEE : ' + name); bad.push(name); }
  }
  console.log((bad.length ? 'ECHEC' : 'TOUT EST BON') + ' : ' + base.ok + ' verification(s) reussie(s) (dont ' + mok + '/' + MUT.length + ' mutations detectees), ' + bad.length + ' echec(s).');
  process.exit(bad.length ? 1 : 0);
})();
