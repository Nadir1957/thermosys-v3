// Thermosys - Tests de non-regression du « Cycle frigorifique » (mono-etage) contre CoolProp
// Usage (depuis le dossier files) :  node tests\cycle_regression.js
//   ou avec un autre fichier :       node tests\cycle_regression.js chemin\vers\index.html
// Codes de sortie : 0 = tout est bon ; 1 = au moins un test echoue ; 2 = fichier ou module illisible.
//
// Statut des references (rien n'est cache) :
//  - Valeurs de reference : CoolProp 8.0.0, figees ci-dessous : pression de saturation, enthalpies, compression isentropique,
//    pour 10 cas (R134a, R32, R290, R717, R1234yf, R410A, R404A, R407C, R600a).
//  - ATTENTION : les tables du module ont ete generees avec CoolProp. Ce test verifie donc l'absence d'erreur de transcription,
//    d'interpolation et de formule (regression) ; ce n'est PAS une validation physique independante. Aucune comparaison avec REFPROP
//    ou une fiche constructeur ici.
//  - Convention : axe des temperatures = temperature de rosee ; sous-refroidissement compte a partir du point de bulle (convention usuelle).
//    Pour R407C (glissement ~ 5-7 K) l'ecart avec « Tk - SC » atteint 3 % sur h3 : c'est la convention qui compte, pas une erreur.
//  - Rendement isentropique : correlation du module, figee ici comme regression (non verifiee physiquement).
'use strict';
const fs = require('fs');
const path = require('path');
const htmlFile = process.argv[2] || path.join('dist', 'index.html');
let h; try { h = fs.readFileSync(htmlFile, 'utf8'); } catch (e) { console.error('Fichier illisible : ' + htmlFile); process.exit(2); }
let E;
try {
  const open = '<script id="cycle-module">', a = h.indexOf(open), b = h.indexOf('</script>', a);
  if (a < 0 || b < 0) { throw new Error('module cycle introuvable'); }
  let src = h.slice(a + open.length, b);
  const mark = "  var SAFE = { 'R22': 'A1'";
  if (src.split(mark).length !== 2) { throw new Error('repere moteur introuvable'); }
  src = src.replace(mark, 'window.__ENG = ENG; return;\n' + mark);
  const noop = () => { }, win = {};
  const el = () => ({ style: {}, setAttribute: noop, appendChild: noop, addEventListener: noop, classList: { add: noop, remove: noop }, querySelectorAll: () => [], innerHTML: '' });
  const doc = { getElementById: () => null, querySelector: () => null, querySelectorAll: () => [], createElement: el, head: { appendChild: noop }, body: { appendChild: noop }, addEventListener: noop, documentElement: { getAttribute: () => 'fr' } };
  win.window = win; win.document = doc; win.localStorage = { getItem: () => null, setItem: noop };
  new Function('window', 'document', 'localStorage', 'setInterval', 'setTimeout', 'clearTimeout', 'navigator', src)(win, doc, win.localStorage, noop, noop, noop, {});
  E = win.__ENG;
  if (!E || typeof E.cycle !== 'function') { throw new Error('moteur absent'); }
} catch (e) { console.error('Module illisible : ' + e.message); process.exit(2); }
process.on('uncaughtException', e => { console.log('ECHEC : erreur ' + e.message); process.exit(1); });
let ok = 0, ko = 0;
function check(nom, cond, detail) { if (cond) { ok++; } else { ko++; console.log('  ECHEC  ' + nom + (detail ? '  -> ' + detail : '')); } }
function rel(a, b) { return Math.abs(a / b - 1) * 100; }

// P en kPa, h en kJ/kg (CoolProp 8.0.0)
const REF = [
  {f:'R134a',T0:5,Tk:45,SHu:5,SHt:8,SC:5,Q0:10, P0:349.659,Pk:1159.924,hEv:406.071,h1:408.801,h3:256.382,h2s:434.841, etaIs:0.7505},
  {f:'R32',T0:0,Tk:45,SHu:5,SHt:8,SC:5,Q0:10, P0:813.101,Pk:2794.781,hEv:521.367,h1:524.859,h3:275.281,h2s:577.834, etaIs:0.7469},
  {f:'R290',T0:-10,Tk:40,SHu:5,SHt:8,SC:5,Q0:10, P0:345.280,Pk:1369.420,hEv:571.949,h1:576.950,h3:292.787,h2s:644.417, etaIs:0.7310},
  {f:'R717',T0:-10,Tk:35,SHu:5,SHt:8,SC:3,Q0:50, P0:290.640,Pk:1349.992,hEv:1608.583,h1:1616.043,h3:496.976,h2s:1847.487, etaIs:0.7107},
  {f:'R1234yf',T0:5,Tk:50,SHu:5,SHt:8,SC:5,Q0:10, P0:373.006,Pk:1302.349,hEv:371.447,h1:374.283,h3:262.386,h2s:397.503, etaIs:0.7453},
  {f:'R134a',T0:-20,Tk:40,SHu:5,SHt:10,SC:3,Q0:5, P0:132.735,Pk:1016.593,hEv:390.631,h1:394.712,h3:251.942,h2s:439.356, etaIs:0.6368},
  {f:'R410A',T0:5,Tk:45,SHu:5,SHt:8,SC:5,Q0:10, P0:933.176,Pk:2726.131,hEv:428.538,h1:431.844,h3:265.708,h2s:462.602, etaIs:0.7624},
  {f:'R404A',T0:-25,Tk:40,SHu:5,SHt:10,SC:3,Q0:8, P0:247.512,Pk:1814.949,hEv:356.627,h1:360.958,h3:254.534,h2s:403.328, etaIs:0.6433},
  {f:'R407C',T0:5,Tk:45,SHu:5,SHt:8,SC:5,Q0:10, P0:546.906,Pk:1753.500,hEv:416.629,h1:419.514,h3:252.405,h2s:449.060, etaIs:0.7538},
  {f:'R600a',T0:-15,Tk:40,SHu:5,SHt:8,SC:3,Q0:1, P0:89.053,Pk:531.208,hEv:541.941,h1:546.595,h3:288.710,h2s:615.659, etaIs:0.6710}
];
console.log('1) Pressions, enthalpies et compression isentropique contre CoolProp (tolerance 0,05 %)');
const out = REF.map(r => {
  const o = E.cycle({ fluid: r.f, T0: r.T0, Tk: r.Tk, SHu: r.SHu, SHt: r.SHt, SC: r.SC, Q0: r.Q0, comp: 'gen', etaIs: 0, etaM: 0.9 });
  const tag = r.f + ' ' + r.T0 + '/' + r.Tk + ' : ';
  check(tag + 'pas d\'erreur', !o.err, String(o.err));
  ['P0', 'Pk', 'hEv', 'h1', 'h3', 'h2s'].forEach(k => check(tag + k, rel(o[k], r[k]) < 0.05, 'module ' + o[k] + ' ref ' + r[k]));
  return { r: r, o: o };
});
console.log('2) Identites internes du cycle');
out.forEach(x => {
  const o = x.o, r = x.r, tag = r.f + ' ' + r.T0 + '/' + r.Tk + ' : ';
  check(tag + 'q0 = hEv - h3', Math.abs(o.q0 - (o.hEv - o.h3)) < 1e-6);
  check(tag + 'travail = h2s - h1', Math.abs(o.dhIs - (o.h2s - o.h1)) < 1e-6);
  check(tag + 'debit = Q0 / q0', rel(o.m, r.Q0 / o.q0) < 1e-6);
  check(tag + 'COP = q0 / (travail / (etaIs x 0,9))', rel(o.COP, o.q0 / (o.dhIs / (o.etaIs * 0.9))) < 1e-6);
  check(tag + 'rendement isentropique fige', Math.abs(o.etaIs - r.etaIs) < 5e-4, 'module ' + o.etaIs + ' fige ' + r.etaIs);
  check(tag + 'rapport de pression = Pk / P0', rel(o.PR, o.Pk / o.P0) < 1e-6);
});
console.log('3) Glissement : nul pour un corps pur, positif pour R407C');
out.forEach(x => {
  const g = x.o.glideK, f = x.r.f;
  if (f === 'R407C') { check('glissement R407C > 3 K', g > 3, 'obtenu ' + g); }
  else if (f === 'R410A' || f === 'R404A') { check('glissement ' + f + ' < 1,5 K', g >= 0 && g < 1.5, 'obtenu ' + g); }
  else { check('glissement ' + f + ' = 0', Math.abs(g) < 1e-9, 'obtenu ' + g); }
});
console.log('4) Sens physique : COP baisse quand Tk monte, monte quand T0 monte');
const base = { fluid: 'R134a', T0: 0, Tk: 40, SHu: 5, SHt: 8, SC: 5, Q0: 10, comp: 'gen', etaIs: 0, etaM: 0.9 };
const c0 = E.cycle(base).COP, cK = E.cycle(Object.assign({}, base, { Tk: 50 })).COP, cT = E.cycle(Object.assign({}, base, { T0: 5 })).COP;
check('Tk +10 K -> COP plus bas', cK < c0, cK + ' vs ' + c0);
check('T0 +5 K -> COP plus haut', cT > c0, cT + ' vs ' + c0);
console.log(ko === 0 ? 'OK : ' + ok + ' verifications reussies.' : 'ECHEC : ' + ko + ' erreur(s) sur ' + (ok + ko) + '.');
process.exit(ko === 0 ? 0 : 1);
