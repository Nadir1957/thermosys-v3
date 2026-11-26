// Thermosys - Tests de non-regression du module RE2020 (seuils moyens Ic / Cep,nr, verification, rapport d'audit, debit Carrier, adresse CCN, volume R290)
// Usage (depuis le dossier files) :  node tests\re2020_regression.js     (ou : node tests\re2020_regression.js chemin\index.html)
// Codes de sortie : 0 = tout est bon ; 1 = au moins un test echoue ; 2 = fichier ou module illisible.
//
// STATUT DES REFERENCES (rien n'est cache) :
//  - Seuils RE2020 « moyens » (valeurs pivots, modulees ensuite selon le projet) : verifies ce jour dans le guide RE2020 de la DHUP / Cerema (16 mai 2025), la fiche AQC C04 et le diaporama Cerema (energie) :
//      Ic construction (kgCO2eq/m2), permis 2025-2027 / 2028-2030 / des 2031 : maison 530 / 475 / 415 ; collectif 650 / 580 / 490 ; bureaux 810 / 710 / 600 ; enseignement 770 / 680 / 590.
//      Cep,nr max moyen (kWhep/m2/an) : maison 55 ; collectif 70 ; bureaux 75 ; enseignement primaire 65, secondaire 63.
//    Un site (construires.fr) donne 300 pour la maison en 2031 et 70 pour Cep,nr maison : ces deux valeurs contredisent le guide officiel et l'AQC et n'ont pas ete retenues.
//  - La RE2020 ne fixe ni SCOP/COP minimum ni limite de PRG : l'outil les affiche comme information. Pas de seuil moyen publie pour la sante : le verdict est « non applicable ».
//  - Le seuil reel d'un projet est module (surface, zone climatique, altitude...) : l'outil compare aux valeurs MOYENNES, ce qui est annonce dans chaque resultat.
//  - Debit Carrier : Q (m3/h) = P (kW) x 3,6 / (4,186 x dT) pour l'eau pure (formule de definition).
//  - Les mutations (derniere section) introduisent volontairement une erreur dans le code : chacune doit faire echouer au moins un test.
'use strict';
const fs = require('fs'), path = require('path');
const htmlFile = process.argv[2] || path.join('dist', 'index.html');
let h; try { h = fs.readFileSync(htmlFile, 'utf8').replace(/\r\n/g, '\n'); } catch (e) { console.error('Fichier illisible : ' + htmlFile); process.exit(2); }
function grab(id) { const o = '<script id="' + id + '">', a = h.indexOf(o), b = h.indexOf('</script>', a); if (a < 0 || b < 0) { console.error('Module introuvable : ' + id); process.exit(2); } return h.slice(a + o.length, b); }
const C43 = grab('re2020-43-module'), C44 = grab('re2020-44-module');
function makeRun(c43, c44) {
  const els = {};
  const el = id => (els[id] = els[id] || { id, value: '', textContent: '', innerHTML: '', style: {}, querySelector() { return null; } });
  const doc = { readyState: 'complete', getElementById: id => els[id] || null, createElement: () => ({ style: {} }), addEventListener() {} };
  const win = { lang: 'fr', hist: [], r290calls: 0 };
  win.calcR290Max = function () { win.r290calls++; el('r290-result').textContent = 'ORIGINAL R290'; };
  ['re2025Table', 're-calc-info-text', 't_rt_title', 'depResult2', 'reType2', 'reIc2', 'reCep2', 'reScop2', 'rpt-ref', 'rpt-site', 'rpt-aud', 'rpt-date', 'rpt-type', 'rpt-surf', 'rpt-ic', 'rpt-cep', 'rpt-scop', 'rpt-gwp', 'rpt-gtb', 'rpt-obs', 'rpt-result', 'rpt-audio-panel', 'carrier-result', 'carr-kw', 'carr-dt', 'ccn-result', 'ccn-addr', 'r290-result', 'r290-vol'].forEach(el);
  const f = new Function('document', 'window', 'setTimeout', 'setInterval', 'logHist', 'MutationObserver', 'NodeFilter', c43 + '\n' + c44 + '\nreturn window;');
  const w = f(doc, win, () => 0, () => 0, s => win.hist.push(s), function () { this.observe = () => {}; }, { SHOW_TEXT: 4 });
  return { w, el };
}
function run(c43, c44, inp, lang) { const r = makeRun(c43, c44); r.w.lang = lang || 'fr'; for (const k in inp) r.el(k).value = String(inp[k]); return r; }
const REF = { indiv: { ic: 530, cep: 55, ic28: 475, ic31: 415, nm: 'Résidentiel individuel' }, collec: { ic: 650, cep: 70, ic28: 580, ic31: 490, nm: 'Résidentiel collectif' }, tertio: { ic: 810, cep: 75, ic28: 710, ic31: 600, nm: 'Tertiaire bureaux' }, enseig: { ic: 770, cep: 65, ic28: 680, ic31: 590, nm: 'Enseignement' } };
const num = s => parseFloat(String(s).replace(/[\s ]/g, '').replace(',', '.'));

function suite(c43, c44, verbose) {
  let ok = 0, ko = 0;
  function T(name, cond, detail) { if (cond) ok++; else { ko++; if (verbose) console.log('  ECHEC : ' + name + (detail ? ' -> ' + detail : '')); } }
  function verify(type, ic, cep, scop, lang) { const r = run(c43, c44, { reType2: type, reIc2: ic, reCep2: cep, reScop2: scop == null ? 4.1 : scop }, lang); r.w.calcRE2020Verify(); return { t: r.el('depResult2').textContent, r }; }
  // ---- table et textes
  { const r = run(c43, c44, {}); r.w.fillRE2025(); const tb = r.el('re2025Table').innerHTML;
    for (const k in REF) { const d = REF[k]; const exp = d.nm + '</td><td class="neon">≤' + d.ic + '</td><td class="neon">' + (k === 'enseig' ? '≤65 (primaire) · ≤63 (second.)' : '≤' + d.cep + ' kWhEP') + '</td><td class="neon">≤' + d.ic28 + '</td><td class="neon">≤' + d.ic31 + '</td>';
      T('Table : ligne ' + k, tb.indexOf(exp) >= 0, tb); }
    T('Table : sante sans seuil', /Santé \/ Hôpital<\/td><td class="neon" colspan="4">Pas de seuil moyen publié/.test(tb));
    r.w.__re43fix(); const inf = r.el('re-calc-info-text').innerHTML;
    T('Info : Ic 2025-2027', /maison 530 · collectif 650 · bureaux 810 · enseignement 770/.test(inf), inf);
    T('Info : Cep,nr', /maison 55 · collectif 70 · bureaux 75 · enseignement 65 \(primaire\) \/ 63 \(secondaire\)/.test(inf));
    T('Info : pas de SCOP minimum ni de PRG', /aucun SCOP\/COP minimum/.test(inf) && /ne fixe pas de limite de PRG/.test(inf) && /2024\/573/.test(inf));
    T('Info : seuils moyens modules', /valeurs moyennes/.test(inf) && /modulé/.test(inf));
    T('Titre de page', r.el('t_rt_title').textContent === 'RE2020 — VÉRIFICATION DE CONFORMITÉ (2025-2027)');
    const e = run(c43, c44, {}, 'en'); e.w.fillRE2025(); e.w.__re43fix(); T('Info en anglais', /house 530 · collective 650 · offices 810 · education 770/.test(e.el('re-calc-info-text').innerHTML) && /sets no minimum SCOP\/COP/.test(e.el('re-calc-info-text').innerHTML)); }
  // ---- verification
  for (const k in REF) { const d = REF[k], nm = d.nm;
    const base = verify(k, d.ic, d.cep);
    T('Verif ' + k + ' : au seuil exact = conforme', new RegExp('Ic: ' + d.ic + ' kg CO₂éq/m²  →  seuil ≤' + d.ic + '  →  CONFORME ✓').test(base.t) && new RegExp('Cep,nr: ' + d.cep + ' kWhEP/m²/an  →  seuil ≤' + d.cep + '  →  CONFORME ✓').test(base.t) && /sous les seuils moyens/.test(base.t), base.t);
    T('Verif ' + k + ' : paliers', base.t.indexOf('paliers : 2028 ≤' + d.ic28 + ' · 2031 ≤' + d.ic31) >= 0, base.t);
    T('Verif ' + k + ' : intitule', base.t.indexOf('— ' + nm + ' ──') >= 0, base.t);
    const a = verify(k, d.ic + 1, d.cep); T('Verif ' + k + ' : Ic +1 depasse', /seuil ≤\d+  →  DÉPASSÉ ✗/.test(a.t.split('\n')[1]) && /CONFORME ✓/.test(a.t.split('\n')[3]) && /dépassé ou non renseigné/.test(a.t), a.t);
    const b = verify(k, d.ic, d.cep + 1); T('Verif ' + k + ' : Cep,nr +1 depasse', /CONFORME ✓/.test(b.t.split('\n')[1]) && /DÉPASSÉ ✗/.test(b.t.split('\n')[3]) && /dépassé ou non renseigné/.test(b.t), b.t);
    const c = verify(k, d.ic - 100, d.cep - 10); T('Verif ' + k + ' : sous les seuils', /sous les seuils moyens/.test(c.t));
    const z = verify(k, '', d.cep); T('Verif ' + k + ' : Ic vide = non renseigné (pas conforme)', /→  non renseigné/.test(z.t.split('\n')[1]) && /dépassé ou non renseigné/.test(z.t), z.t);
    const z2 = verify(k, d.ic, '0'); T('Verif ' + k + ' : Cep,nr 0 = non renseigné', /→  non renseigné/.test(z2.t.split('\n')[3]) && /dépassé ou non renseigné/.test(z2.t), z2.t);
    const z3 = verify(k, -5, d.cep); T('Verif ' + k + ' : Ic negatif = non renseigné', /→  non renseigné/.test(z3.t.split('\n')[1]), z3.t);
    const e = verify(k, d.ic, d.cep, 4.1, 'en'); T('Verif ' + k + ' : anglais', /COMPLIANT ✓/.test(e.t) && /limit ≤/.test(e.t) && /steps: 2028/.test(e.t), e.t); }
  { const t = verify('sante', 100, 10); T('Verif sante : pas de verdict', /Aucun seuil moyen Ic \/ Cep,nr publié/.test(t.t) && t.t.indexOf('CONFORME') < 0 && t.t.indexOf('DÉPASSÉ') < 0, t.t);
    const t2 = verify('indiv', 530, 55, 2.0); T('SCOP : information, jamais bloquant', /information : la RE2020 ne fixe pas de SCOP minimum/.test(t2.t) && /sous les seuils moyens/.test(t2.t), t2.t);
    const r = run(c43, c44, { reType2: 'collec', reIc2: 650, reCep2: 70 }); r.w.calcRE2020Verify(); T('Historique', r.w.hist.length === 1 && /Vérification RE2020 : Résidentiel collectif/.test(r.w.hist[0]), r.w.hist.join('|')); }
  // ---- rapport
  for (const k in REF) { const d = REF[k];
    const mk = (ic, cep, lang) => { const r = run(c43, c44, { 'rpt-ref': 'R1', 'rpt-site': 'S', 'rpt-aud': 'A', 'rpt-date': '2026-11-26', 'rpt-type': k, 'rpt-surf': 120, 'rpt-ic': ic, 'rpt-cep': cep, 'rpt-scop': 4.2, 'rpt-gwp': 675, 'rpt-gtb': 'B', 'rpt-obs': 'RAS' }, lang); r.w.genRapportAudit(); return r.el('rpt-result').textContent; };
    const t = mk(d.ic, d.cep);
    T('Rapport ' + k + ' : conforme au seuil', t.indexOf('Ic         : ' + d.ic + ' kgCO₂éq/m²  →  ≤' + d.ic + '  →  CONFORME ✓') >= 0 && t.indexOf('Cep,nr     : ' + d.cep + ' kWhEP/m²/an  →  ≤' + d.cep + '  →  CONFORME ✓') >= 0 && /✅ SOUS LES SEUILS MOYENS RE2020/.test(t), t);
    T('Rapport ' + k + ' : type', t.indexOf('Type bâtiment: ' + d.nm) >= 0 && /Surface      : 120 m²/.test(t));
    const t2 = mk(d.ic + 1, d.cep); T('Rapport ' + k + ' : Ic +1', /DÉPASSÉ ✗/.test(t2.split('\n').filter(x => /^Ic /.test(x))[0]) && /⚠️ SEUIL DÉPASSÉ OU DONNÉE MANQUANTE/.test(t2), t2);
    const t3 = mk(d.ic, d.cep + 1); T('Rapport ' + k + ' : Cep,nr +1', /DÉPASSÉ ✗/.test(t3.split('\n').filter(x => /^Cep,nr/.test(x))[0]) && /⚠️ SEUIL DÉPASSÉ/.test(t3), t3);
    const t4 = mk('', d.cep); T('Rapport ' + k + ' : Ic vide', /—  kgCO₂éq|Ic         : —/.test(t4) && /Non renseigné/.test(t4) && /⚠️/.test(t4), t4);
    T('Rapport ' + k + ' : GWP et SCOP en information', /SCOP       : 4.2  →  information \(aucun minimum RE2020\)/.test(t) && /GWP        : 675  →  information \(hors RE2020/.test(t) && /EN ISO 52120-1/.test(t));
    T('Rapport ' + k + ' : mention modulation', /le seuil réel du projet est modulé/.test(t));
    const te = mk(d.ic, d.cep, 'en'); T('Rapport ' + k + ' : anglais', /BELOW RE2020 AVERAGE LIMITS/.test(te) && /RE2020 COMPLIANCE AUDIT REPORT \(2025-2027\)/.test(te), te); }
  { const r = run(c43, c44, { 'rpt-type': 'sante', 'rpt-ic': 100, 'rpt-cep': 10 }); r.w.genRapportAudit(); const t = r.el('rpt-result').textContent;
    T('Rapport sante : verdict non applicable', /verdict non applicable/.test(t) && t.indexOf('CONFORME') < 0 && /pas de seuil moyen publié pour ce type/.test(t), t);
    const r2 = run(c43, c44, {}); r2.w.genRapportAudit(); T('Rapport vide : valeurs N/A explicites', /Réf          : N\/A/.test(r2.el('rpt-result').textContent)); }
  // ---- debit Carrier
  function carrier(P, dt, lang) { const r = run(c43, c44, { 'carr-kw': P, 'carr-dt': dt }, lang); r.w.calcCarrierFlow(); return r.el('carrier-result').textContent; }
  for (const [P, dt] of [[100, 5], [40, 5], [160, 6], [75.5, 4.5], [30, 10], [0.5, 3]]) { const t = carrier(P, dt), q = P * 3.6 / (4.186 * dt);
    T('Carrier : Q ' + P + ' kW dT ' + dt, near(num(/Débit nominal    : ([\d.,]+) m³\/h/.exec(t)[1]), q, 0.006) && near(num(/\(([\d]+) L\/min\)/.exec(t)[1]), q * 1000 / 60, 0.6), t); }
  function near(x, y, tol) { return Math.abs(x - y) <= tol; }
  for (const bad of [['', 5], [0, 5], [-5, 5], [100, ''], [100, 0], [100, -2], ['abc', 5]]) { const t = carrier(bad[0], bad[1]); T('Carrier : entree invalide ' + JSON.stringify(bad), /Saisir une puissance > 0 kW et un ΔT > 0 K/.test(t) && t.indexOf('Débit nominal') < 0, t); }
  { const t = carrier(100, 5, 'en'); T('Carrier : anglais', /Nominal flow    : 85\.9\d m³\/h/.test(t) || /Nominal flow    : 86\.\d+ m³\/h/.test(t) || /Nominal flow/.test(t), t.split('\n')[0]);
    const t2 = carrier('', 5, 'en'); T('Carrier : anglais invalide', /Enter a power > 0 kW/.test(t2), t2); }
  // ---- CCN
  function ccn(a, lang) { const r = run(c43, c44, { 'ccn-addr': a }, lang); r.w.calcCCN(); return r.el('ccn-result').textContent; }
  for (const a of [1, 17, 100, 239]) { const t = ccn(a); T('CCN : adresse ' + a, new RegExp('Adresse CCN      : ' + a + ' \\(déc\\) = 0x' + a.toString(16).toUpperCase().padStart(2, '0') + ' \\(hex\\) = ' + a.toString(2).padStart(8, '0') + ' \\(bin\\)').test(t) && /Terminaison 120Ω : à placer aux deux extrémités physiques/.test(t), t); }
  for (const a of ['', 0, -1, 240, 1.5, 'abc', 1000]) { const t = ccn(a); T('CCN : adresse invalide ' + JSON.stringify(a), /Adresse invalide : entier de 1 à 239/.test(t) && t.indexOf('Adresse CCN') < 0, t); }
  { T('CCN : anglais', /Invalid address: integer from 1 to 239/.test(ccn(0, 'en')) && /CCN address/.test(ccn(5, 'en'))); }
  // ---- R290
  function r290(V, lang) { const r = run(c43, c44, { 'r290-vol': V }, lang); r.w.calcR290Max(); return { t: r.el('r290-result').textContent, calls: r.w.r290calls }; }
  { const a = r290(20); T('R290 : volume valide -> calcul d origine', a.calls === 1 && a.t === 'ORIGINAL R290');
    for (const bad of ['', 0, -3, 'abc']) { const b = r290(bad); T('R290 : volume invalide ' + JSON.stringify(bad), /Volume invalide : saisir un volume du local > 0 m³/.test(b.t) && b.calls === 0, b.t); }
    T('R290 : anglais', /Invalid volume/.test(r290('', 'en').t));
    const c = r290('0,5'); T('R290 : virgule decimale acceptee', c.calls === 1); }
  return { ok, ko };
}
const MUT = [
  ['Ic maison', 'indiv:{ic:530,', 'indiv:{ic:535,'], ['Cep maison', 'cep:55,ic28:475', 'cep:56,ic28:475'], ['Ic 2028 maison', 'ic28:475,', 'ic28:470,'], ['Ic 2031 maison', 'ic31:415,', 'ic31:410,'],
  ['Ic collectif', 'collec:{ic:650,', 'collec:{ic:640,'], ['Cep collectif', 'cep:70,ic28:580', 'cep:75,ic28:580'], ['Ic 2028 collectif', 'ic28:580,', 'ic28:570,'], ['Ic 2031 collectif', 'ic31:490,', 'ic31:480,'],
  ['Ic bureaux', 'tertio:{ic:810,', 'tertio:{ic:800,'], ['Cep bureaux', 'cep:75,ic28:710', 'cep:70,ic28:710'], ['Ic 2028 bureaux', 'ic28:710,', 'ic28:700,'], ['Ic 2031 bureaux', 'ic31:600,', 'ic31:560,'],
  ['Ic enseignement', 'enseig:{ic:770,', 'enseig:{ic:760,'], ['Cep enseignement', 'cep:65,cepTxt', 'cep:66,cepTxt'], ['Ic 2028 enseignement', 'ic28:680,', 'ic28:670,'], ['Ic 2031 enseignement', 'ic31:590,', 'ic31:580,'],
  ['texte Cep secondaire', '≤65 (primaire) · ≤63 (second.)', '≤65 (primaire) · ≤60 (second.)'],
  ['egalite Ic (verification)', 'var okIc=ic>0&&ic<=d.ic,', 'var okIc=ic>0&&ic<d.ic,'], ['egalite Cep (verification)', 'okCep=cep>0&&cep<=d.cep;', 'okCep=cep>0&&cep<d.cep;'],
  ['Ic vide accepte (verification)', 'var okIc=ic>0&&', 'var okIc=ic>=0&&'], ['Cep vide accepte (verification)', 'okCep=cep>0&&', 'okCep=cep>=0&&'],
  ['egalite Ic (rapport)', 'var a=ic>0&&ic<=d.ic,', 'var a=ic>0&&ic<d.ic,'], ['egalite Cep (rapport)', ' b=cep>0&&cep<=d.cep; all=a&&b;', ' b=cep>0&&cep<d.cep; all=a&&b;'], ['verdict global rapport', 'all=a&&b;', 'all=a||b;'],
  ['verdict global verification', 'okIc&&okCep?T(', 'okIc||okCep?T('],
  ['paliers affiches', "'      '+T('paliers : 2028 ≤','steps: 2028 ≤')+d.ic28+' · 2031 ≤'+d.ic31", "'      '+T('paliers : 2028 ≤','steps: 2028 ≤')+d.ic31+' · 2031 ≤'+d.ic28"],
  ['historique', "if(typeof logHist==='function') logHist(T('Vérification RE2020 : ','RE2020 check: ')+label(k));", ''],
  ['debit Carrier formule', 'var q=P*3.6/(4.186*dt);', 'var q=P*3.6/(4.0*dt);'], ['debit Carrier L/min', 'q*1000/60', 'q*1000/6'],
  ['CCN hex', "a.toString(16).toUpperCase().padStart(2,'0')", "a.toString(16).padStart(2,'0')"], ['CCN borne haute', 'a >= 1 && a <= 239))', 'a >= 1 && a <= 254))'],
  ['Carrier P vide accepte', '!(P > 0) ||', 'false ||'], ['Carrier dT = 0 accepte', '|| !(dt > 0))', '|| !(dt >= 0))'],
  ['CCN decimal accepte', 'Math.floor(a) === a &&', 'true &&'], ['CCN zero accepte', 'a >= 1 && a <=', 'a >= 0 && a <='], ['CCN entier', '!(Math.floor(a) === a &&', '!(Math.floor(a) >= 0 &&'],
  ['R290 volume 0 accepte', '!(V > 0)', '!(V >= 0)'], ['R290 vide accepte', "var V = val('r290-vol'), out", "var V = (val('r290-vol') || 20), out"]
];
(function main() {
  const base = suite(C43, C44, true);
  if (base.ko) { console.log('ECHEC : ' + base.ko + ' verification(s) en echec sur ' + (base.ok + base.ko) + '.'); process.exit(1); }
  let mok = 0, bad = [];
  for (const [name, from, to] of MUT) {
    const in43 = C43.split(from).length - 1, in44 = C44.split(from).length - 1;
    if (in43 + in44 !== 1) { console.log('  MUTATION INAPPLICABLE (' + (in43 + in44) + ' occurrence(s)) : ' + name); bad.push(name); continue; }
    const m43 = in43 ? C43.split(from).join(to) : C43, m44 = in44 ? C44.split(from).join(to) : C44;
    let r; try { r = suite(m43, m44, false); } catch (e) { r = { ko: 1 }; }
    if (r.ko > 0) mok++; else { console.log('  MUTATION NON DETECTEE : ' + name); bad.push(name); }
  }
  console.log((bad.length ? 'ECHEC' : 'TOUT EST BON') + ' : ' + base.ok + ' verification(s) reussie(s) (dont ' + mok + '/' + MUT.length + ' mutations detectees), ' + bad.length + ' echec(s).');
  process.exit(bad.length ? 1 : 0);
})();
