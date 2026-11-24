// Thermosys - Tests de non-regression de la « Tuyauterie frigorifique » (lignes liquide / aspiration / refoulement)
// Usage (depuis le dossier files) :  node tests\refrig_pipe_regression.js
//   ou avec un autre fichier :       node tests\refrig_pipe_regression.js chemin\vers\index.html
// Codes de sortie : 0 = tout est bon ; 1 = au moins un test echoue ; 2 = fichier ou fonction illisible.
//
// Statut des references (rien n'est cache) :
//  - Proprietes des 5 fluides (R410A, R32, R134a, R404A, R290 ; evap. 5 C, cond. 45 C, surchauffe 5 K, sous-refroidissement 5 K) :
//    comparees a CoolProp 8.0.0 (valeurs figees ci-dessous). Ecarts constates : <= 1,9 % sauf la viscosite du gaz R404A (-5 %),
//    dont l'effet sur la perte de charge est de l'ordre de 1 %. Tolerances du test : voir TOL.
//  - Perte de charge : le module utilise Swamee-Jain (rugosite 1,5 micron, cuivre tire) ; le test la recalcule avec Colebrook-White
//    (resolution iterative) a partir du tube retenu. Tolerance 2,5 %.
//  - Epaisseurs de paroi ACR (ASTM B280) : 1/4" a 1-3/8" (tube recuit) verifiees sur le tableau d'EngineeringToolBox et sur celui de
//    Cooney Brothers ; 1-5/8" a 4-1/8" (tube ecroui) verifiees sur la table 1 de l'ASTM B280-23 (extrait public iTeh). Pour 3/4" les tableaux
//    donnent 0,035" et 0,042" : le module prend 0,035". Le module ne propose que la serie en pouces (pas la serie metrique EN 12735).
//  - Plages de vitesse et limite de perte de charge : confrontees a 5 documents de fabricants (voir « 5) » ci-dessous) :
//      vitesse mini aspiration horizontale : McQuay 500 fpm (2,5 m/s), DuPont 750 (3,8), Lennox 800 (4,1) ; module : 4 m/s
//      vitesse mini colonne montante       : McQuay 1000 fpm (5,1 m/s), Lennox 1200-1500 (6,1-7,6), DuPont 1500 (7,6) ; module : 7 m/s
//      vitesse maxi aspiration             : Opteon/DuPont 4000 fpm (20 m/s), Lennox 2000 (10, bruit) ; module : 15 m/s
//      refoulement                         : Opteon/DuPont 2000-3500 fpm (10-18 m/s) ; module : 5-18 m/s
//      liquide                             : McQuay/Lennox/DuPont < 300 fpm (1,5 m/s) avec electrovanne ; module : 0,5-1,5 m/s
//      perte de charge (temp. de saturation) : aspiration 2 F = 1,1 K (Opteon, DuPont, Lennox, McQuay 2-3 F) ; refoulement et liquide
//      1 F = 0,56 K (Opteon, DuPont) ou 2-3 F (McQuay). Module : 1 K pour toutes les lignes (plus severe que les sources sur l'aspiration,
//      moins severe que DuPont/Opteon sur le refoulement et le liquide, dans la fourchette de McQuay).
//  - NON verifie : le texte de l'ASHRAE Refrigeration Handbook (non consulte) ; le manuel Copeland n'a pas pu etre lu (acces refuse).
//    Les vitesses minimales des sources valent pour la charge minimale (colonnes montantes) ; ce module ne verifie que la pleine charge
//    (le module « chambre froide » verifie la colonne a 50 % de charge).
//  - Limites du module : conditions fixes 5 C / 45 C quel que soit le regime reel ; la hauteur de colonne et les accessoires ne sont pas
//    calcules (l'utilisateur saisit une longueur equivalente) ; le fluide est suppose pur (R410A, R404A : melanges traites sans glissement).
'use strict';
const fs = require('fs');
const path = require('path');
const htmlFile = process.argv[2] || path.join('dist', 'index.html');
let h; try { h = fs.readFileSync(htmlFile, 'utf8'); } catch (e) { console.error('Fichier illisible : ' + htmlFile); process.exit(2); }
h = h.replace(/\r\n/g, '\n');   // fichier avec fins de ligne Windows ou Unix
let M;
try {
  const a = h.indexOf('var FRIGO_PROPS = {');
  const endMark = "logHist('Frigo: '+fp.name+', '+ligne+', '+cap+'kW');\n}";
  const b = h.indexOf(endMark, a);
  if (a < 0 || b < 0) { throw new Error('repere introuvable'); }
  const src = h.slice(a, b + endMark.length);
  const els = {}; const get = id => els[id] || (els[id] = { value: '', innerHTML: '' });
  const f = new Function('document', 'lang', '__sxl', 'logHist', src + '\nreturn { calc: calcRefrigPipe, P: FRIGO_PROPS, T: ACR_TUBES_MM, W: ACR_WALL_MM };');
  M = f({ getElementById: get }, 'fr', s => s, () => { });
  M.run = o => { get('frigoCap').value = String(o.cap); get('frigoFluid').value = o.fluid; get('frigoLigne').value = o.ligne; get('frigoRiser').value = o.riser ? '1' : '0'; get('frigoLeq').value = String(o.leq); get('frigoResult').innerHTML = ''; M.calc(); return get('frigoResult').innerHTML; };
} catch (e) { console.error('Fonction illisible : ' + e.message); process.exit(2); }
process.on('uncaughtException', e => { console.log('ECHEC : erreur ' + e.message); process.exit(1); });
let ok = 0, ko = 0;
function check(nom, cond, detail) { if (cond) { ok++; } else { ko++; console.log('  ECHEC  ' + nom + (detail ? '  -> ' + detail : '')); } }
function rel(a, b) { return Math.abs(a / b - 1) * 100; }

console.log('1) Proprietes des fluides contre CoolProp 8.0.0');
const REF = {
  'R410A':{dh:162.83,rhoLiq:981.6,rhoVap:34.57,rhoDis:94.2,muS:12.55,muD:16.19,muL:98.2,kE:28.63,kC:64.36},
  'R32':{dh:247.14,rhoLiq:896.3,rhoVap:25.00,rhoDis:62.3,muS:12.82,muD:16.29,muL:92.9,kE:29.34,kC:66.22},
  'R134a':{dh:149.69,rhoLiq:1147.9,rhoVap:16.69,rhoDis:54.1,muS:11.12,muD:13.01,muL:162.0,kE:12.16,kC:30.10},
  'R404A':{dh:114.00,rhoLiq:970.9,rhoVap:34.51,rhoDis:105.2,muS:11.90,muD:15.15,muL:103.8,kE:21.51,kC:48.07},
  'R290':{dh:282.21,rhoLiq:468.2,rhoVap:11.65,rhoDis:32.0,muS:7.74,muD:9.33,muL:83.2,kE:16.19,kC:34.36}
};
const TOL = { dh: 1.2, rhoLiq: 0.5, rhoVap: 3.5, rhoDis: 1.0, muS: 6, muD: 6, muL: 3, kE: 1.5, kC: 1.5 };
const KEY = { r410a: 'R410A', r32: 'R32', r134a: 'R134a', r404a: 'R404A', r290: 'R290' };
Object.keys(KEY).forEach(k => {
  const p = M.P[k], r = REF[KEY[k]];
  check('fluide ' + k + ' present', !!p && !!r);
  if (p && r) { Object.keys(TOL).forEach(q => check(KEY[k] + ' ' + q, rel(p[q], r[q]) <= TOL[q], 'module ' + p[q] + ' ref ' + r[q])); }
});
console.log('2) Tubes ACR (ASTM B280, tube recuit)');
const WALL_IN = { 6.35: 0.030, 9.53: 0.032, 12.7: 0.032, 15.88: 0.035, 19.05: 0.035, 22.23: 0.045, 28.58: 0.050, 34.93: 0.055, 41.28: 0.060, 53.98: 0.070, 66.68: 0.080, 79.38: 0.090, 92.08: 0.100, 104.78: 0.110 };
M.T.forEach((d, i) => { if (WALL_IN[d] !== undefined) { check('paroi ' + d + ' mm', Math.abs(M.W[i] - WALL_IN[d] * 25.4) < 0.03, 'module ' + M.W[i] + ' attendu ' + (WALL_IN[d] * 25.4).toFixed(2)); } });
check('serie complete 1/4" a 4-1/8" (14 tailles dont 3-5/8")', Object.keys(WALL_IN).every(d => M.T.some(t => Math.abs(t - d) < 0.006)), M.T.join(' '));
check('diametres croissants', M.T.every((d, i) => i === 0 || d > M.T[i - 1]));
check('parois croissantes', M.W.every((d, i) => i === 0 || d >= M.W[i - 1]));

console.log('3) Dimensionnement : recalcul independant sur 160 cas (5 fluides x 4 lignes x 4 puissances x 2 longueurs)');
function colebrookF(Re, eps, D) { if (Re < 2300) { return 64 / Re; } let f = 0.02; for (let i = 0; i < 100; i++) { const n = 1 / Math.pow(-2 * Math.log10(eps / (3.7 * D) + 2.51 / (Re * Math.sqrt(f))), 2); if (Math.abs(n - f) < 1e-12) { f = n; break; } f = n; } return f; }
function indep(o) {
  const p = M.P[o.fluid], mdot = o.cap / p.dh;
  let vT, rho, mu, k;
  if (o.ligne === 'liquide') { vT = 1.0; rho = p.rhoLiq; mu = p.muL; k = p.kC; }
  else if (o.ligne === 'aspiration') { vT = o.riser ? 11 : 10; rho = p.rhoVap; mu = p.muS; k = p.kE; }
  else { vT = 12; rho = p.rhoDis; mu = p.muD; k = p.kC; }
  const Dideal = Math.sqrt(4 * mdot / (rho * vT * Math.PI)) * 1000;
  const id = i => M.T[i] - 2 * M.W[i];
  const res = i => { const D = id(i) / 1000, v = mdot / (rho * Math.PI * D * D / 4), Re = rho * v * D / (mu * 1e-6), f = colebrookF(Re, 1.5e-6, D), dP = f * (o.leq / D) * rho * v * v / 2 / 1000; return { v: v, dP: dP, dT: dP / k }; };
  let n = 0; M.T.forEach((d, i) => { if (Math.abs(id(i) - Dideal) < Math.abs(id(n) - Dideal)) { n = i; } });
  const pick = lim => { let s = n; while (s < M.T.length - 1 && res(s).dT > lim) { s++; } return s; };
  const s = pick(1), sLo = pick(1.03), sHi = pick(0.97);   // marge de +-3 % sur la limite de 1 K (Swamee-Jain et Colebrook different legerement)
  return { idx: s, nearest: n, r: res(s), D: M.T[s], Dmin: M.T[sLo], Dmax: M.T[sHi], at: i => res(i), mdot: mdot };
}
const txt = h2 => h2.replace(/<div class="frow"><span class="flb">/g, '\n').replace(/<[^>]+>/g, '');
let nbSel = 0, nbOk = 0, minV = 1e9;
const caps = [3, 10, 35, 100], legs = [10, 40];
const lines = [['liquide', 0], ['aspiration', 0], ['aspiration', 1], ['refoulement', 0]];
Object.keys(KEY).forEach(fl => lines.forEach(ln => caps.forEach(cap => legs.forEach(leq => {
  const o = { fluid: fl, ligne: ln[0], riser: ln[1], cap: cap, leq: leq }, tag = fl + ' ' + ln[0] + (ln[1] ? ' (colonne)' : '') + ' ' + cap + ' kW L=' + leq + ' : ';
  const t = txt(M.run(o)), ref = indep(o);
  const mD = /Tube ACR normalis[^:]*:\s*⌀ ([0-9.]+) mm/.exec(t), mV = /Vitesse r[^:]*:\s*([0-9.]+) m\/s/.exec(t), mP = /Perte de charge[^:]*:\s*([0-9.]+) kPa/.exec(t), mM = /Débit massique estimé :\s*([0-9.]+) kg\/h/.exec(t);
  check(tag + 'sortie lisible', !!(mD && mV && mP && mM), t.slice(0, 200));
  if (!(mD && mV && mP && mM)) { return; }
  nbSel++;
  const Dm = parseFloat(mD[1]), im = M.T.findIndex(d => Math.abs(d - Dm) < 0.006), rm = im >= 0 ? ref.at(im) : null;
  check(tag + 'tube retenu (dans la marge de 3 % sur 1 K)', Dm >= ref.Dmin - 0.006 && Dm <= ref.Dmax + 0.006, 'module ' + mD[1] + ' attendu ' + ref.Dmin.toFixed(2) + ' a ' + ref.Dmax.toFixed(2));
  if (Math.abs(Dm - ref.D) < 0.006) { nbOk++; }
  if (!rm) { check(tag + 'tube dans la serie ACR', false, mD[1]); return; }
  check(tag + 'debit massique', Math.abs(parseFloat(mM[1]) - ref.mdot * 3600) <= 0.06, 'module ' + mM[1] + ' attendu ' + (ref.mdot * 3600).toFixed(2));
  check(tag + 'vitesse', Math.abs(parseFloat(mV[1]) - rm.v) <= 0.006 + 0.005 * rm.v, 'module ' + mV[1] + ' attendu ' + rm.v.toFixed(3));
  check(tag + 'perte de charge vs Colebrook (2,5 %)', Math.abs(parseFloat(mP[1]) - rm.dP) <= 0.06 + 0.025 * rm.dP, 'module ' + mP[1] + ' attendu ' + rm.dP.toFixed(2));
  check(tag + 'regle : < 1 K (+3 %) ou plus gros tube', rm.dT <= 1.03 || im === M.T.length - 1);
  minV = Math.min(minV, rm.v);
}))));
check('au moins 150 cas exploitables', nbSel >= 150, nbSel + ' cas');
check('au moins 95 % des cas : tube identique au calcul independant', nbOk >= 0.95 * nbSel, nbOk + ' / ' + nbSel);
console.log('5) Plages de vitesse affichees contre les fabricants (fpm x 0,00508 = m/s)');
function plage(o) { const t = txt(M.run(o)), m = /Plage recommand[^:]*:\s*([0-9.]+) . ([0-9.]+) m\/s/.exec(t); return m ? [parseFloat(m[1]), parseFloat(m[2])] : null; }
const pL = plage({ fluid: 'r410a', ligne: 'liquide', cap: 10, leq: 20 }), pH = plage({ fluid: 'r410a', ligne: 'aspiration', riser: 0, cap: 10, leq: 20 }), pR = plage({ fluid: 'r410a', ligne: 'aspiration', riser: 1, cap: 10, leq: 20 }), pD = plage({ fluid: 'r410a', ligne: 'refoulement', cap: 10, leq: 20 });
check('plages lisibles', !!(pL && pH && pR && pD));
if (pL && pH && pR && pD) {
  check('aspiration horizontale mini 4 m/s entre McQuay (2,54) et Lennox (4,06)', pH[0] >= 2.54 && pH[0] <= 4.1, String(pH[0]));
  check('colonne montante mini 7 m/s entre McQuay (5,08) et DuPont (7,62)', pR[0] >= 5.08 && pR[0] <= 7.65, String(pR[0]));
  check('aspiration maxi <= 20,3 m/s (Opteon/DuPont 4000 fpm)', pH[1] <= 20.4 && pR[1] <= 20.4, pH[1] + ' ' + pR[1]);
  check('refoulement maxi <= 17,8 m/s + 2 % (3500 fpm)', pD[1] <= 18.2, String(pD[1]));
  check('liquide maxi <= 1,54 m/s (McQuay 300 fpm, electrovanne)', pL[1] <= 1.55, String(pL[1]));
  check('liquide mini >= 0,5 m/s (100 fpm)', pL[0] >= 0.5 - 1e-9, String(pL[0]));
}
console.log('4) Sens physique');
const a1 = indep({ fluid: 'r410a', ligne: 'liquide', cap: 10, leq: 20 }), a2 = indep({ fluid: 'r410a', ligne: 'liquide', cap: 40, leq: 20 });
check('puissance x4 -> tube au moins aussi gros', a2.idx >= a1.idx);
const b1 = indep({ fluid: 'r410a', ligne: 'aspiration', cap: 10, leq: 10 }), b2 = indep({ fluid: 'r410a', ligne: 'aspiration', cap: 10, leq: 80 });
check('ligne 8 fois plus longue -> tube au moins aussi gros', b2.idx >= b1.idx);
check('colonne montante : tube pas plus gros que l\'horizontale a vitesse cible plus haute', indep({ fluid: 'r410a', ligne: 'aspiration', riser: 1, cap: 10, leq: 10 }).idx <= indep({ fluid: 'r410a', ligne: 'aspiration', riser: 0, cap: 10, leq: 10 }).idx);
console.log(ko === 0 ? 'OK : ' + ok + ' verifications reussies.' : 'ECHEC : ' + ko + ' erreur(s) sur ' + (ok + ko) + '.');
process.exit(ko === 0 ? 0 : 1);
