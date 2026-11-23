// Thermosys - Tests de non-regression du « Reseau hydraulique » : coefficients K des accessoires et perte de charge lineaire
// Usage (depuis le dossier files) :  node tests\network_k_regression.js
//   ou avec un autre fichier :       node tests\network_k_regression.js chemin\vers\index.html
// Codes de sortie : 0 = tout est bon ; 1 = au moins un test echoue ; 2 = fichier ou fonctions illisibles.
//
// Statut des references (rien n'est cache) :
//  - K des accessoires : methode Crane TP-410 (K = n x f_T) telle que reproduite par SimuPipe ; plausibilite controlee contre le tableau
//    de Cengel & Cimbala (feuille de formules de Purdue, ME 309) et contre Neutrium. Le texte de Crane TP-410 lui-meme n'a pas ete consulte.
//  - Perte de charge lineaire : formule de Darcy-Weisbach avec Swamee-Jain ; verifiee contre Colebrook-White (resolution iterative) et,
//    en regime laminaire, contre la loi exacte de Hagen-Poiseuille.
//  - Limites connues non corrigees ici : viscosite et masse volumique fixes a 20 C (eau) ; rugosite 0,046 mm (acier commercial).
'use strict';
const fs = require('fs');
const path = require('path');
const htmlFile = process.argv[2] || path.join('dist', 'index.html');
let h; try { h = fs.readFileSync(htmlFile, 'utf8'); } catch (e) { console.error('Fichier illisible : ' + htmlFile); process.exit(2); }
function cut(startMark, endMark) { const a = h.indexOf(startMark); const b = h.indexOf(endMark, a); if (a < 0 || b < 0) { console.error('Repere introuvable : ' + startMark); process.exit(2); } return h.slice(a, b + endMark.length); }
let K, P;
try {
  const kSrc = cut('var RESEAU_N =', 'return { K: K, fT: fT };\n}');
  const pSrc = cut('function calcSegmentPDC(Q, D, L, fluid){', 'return {v:v, Re:Re, f:f, dP:dP};\n}');
  K = new Function(kSrc + '\nreturn { N: RESEAU_N, fT: reseauFT, sum: reseauKsum };')();
  P = new Function(pSrc + '\nreturn calcSegmentPDC;')();
} catch (e) { console.error('Fonctions illisibles : ' + e.message); process.exit(2); }
process.on('uncaughtException', e => { console.log('ECHEC : erreur ' + e.message); process.exit(1); });
let ok = 0, ko = 0;
function check(nom, cond, detail) { if (cond) { ok++; } else { ko++; console.log('  ECHEC  ' + nom + (detail ? '  -> ' + detail : '')); } }
function near(a, b, tol) { return Math.abs(a - b) <= tol; }

console.log('1) Coefficient de friction turbulent f_T (Crane, acier propre) selon le diametre');
// diametre interieur approximatif (mm) -> diametre nominal : 1/2" 15 ; 1" 25 ; 2" 50 ; 4" 100 ; 6" 150 ; 8-10" 200-250 ; 12-16" 300-400
[[15, 0.027], [25, 0.023], [50, 0.019], [100, 0.017], [150, 0.015], [200, 0.014], [250, 0.014], [300, 0.013], [400, 0.013]].forEach(p => check('f_T pour D = ' + p[0] + ' mm : ' + p[1], K.fT(p[0]) === p[1], 'obtenu ' + K.fT(p[0])));

console.log('2) K par accessoire a 2" (DN 50) : Crane TP-410 via SimuPipe');
const one = k => { const c = {}; c[k] = 1; return K.sum(c, 50).K; };
[['coudes', 0.57], ['coudes45', 0.30], ['tesRun', 0.38], ['tes', 1.14], ['vannes', 0.15], ['pap', 0.86], ['globe', 6.46], ['clapet', 1.90]]
  .forEach(p => check('K ' + p[0] + ' = ' + p[1], near(one(p[0]), p[1], 0.01), 'obtenu ' + one(p[0]).toFixed(3)));
console.log('3) K du coude 90 standard et du coude 45 selon la taille (SimuPipe)');
[[15, 0.81, 0.43], [25, 0.69, 0.37], [50, 0.57, 0.30], [100, 0.51, 0.27], [150, 0.45, 0.24], [200, 0.42, 0.22], [300, 0.39, 0.21]].forEach(p => {
  check('Coude 90 standard, D = ' + p[0] + ' mm : ' + p[1], near(K.sum({ coudes: 1 }, p[0]).K, p[1], 0.01), 'obtenu ' + K.sum({ coudes: 1 }, p[0]).K.toFixed(3));
  check('Coude 45, D = ' + p[0] + ' mm : ' + p[2], near(K.sum({ coudes45: 1 }, p[0]).K, p[2], 0.01), 'obtenu ' + K.sum({ coudes45: 1 }, p[0]).K.toFixed(3));
});
console.log('4) Plausibilite contre Cengel & Cimbala (Purdue) et Neutrium');
// Cengel : coude 90 regulier 0,3 (bride) a 1,5 (visse) ; te passage 0,2 a 0,9 ; te derivation 1,0 a 2,0 ; globe 10 ; gate 0,15 ; clapet a battant 2 ; boisseau 0,05
check('Coude 90 DN50 entre 0,3 et 1,5', one('coudes') >= 0.3 && one('coudes') <= 1.5);
check('Te passage direct DN50 entre 0,2 et 0,9', one('tesRun') >= 0.2 && one('tesRun') <= 0.9);
check('Te derivation DN50 entre 1,0 et 2,0', one('tes') >= 1.0 && one('tes') <= 2.0);
check('Vanne globe DN50 entre 5 et 11 (Crane 6,5 ; Cengel 10 ; Neutrium 6)', one('globe') >= 5 && one('globe') <= 11);
check('Vanne a opercule DN50 entre 0,1 et 0,3 (Cengel 0,15 ; Neutrium 0,17)', one('vannes') >= 0.1 && one('vannes') <= 0.3);
check('Clapet a battant DN50 entre 1,5 et 2,5 (Cengel 2 ; Neutrium 2)', one('clapet') >= 1.5 && one('clapet') <= 2.5);
check('Une vanne globe pese au moins 30 fois une vanne a opercule (l\'ancien K unique de 0,2 sous-estimait les globes)', one('globe') / one('vannes') >= 30);

console.log('5) Somme et K supplementaire');
// DN50 : 2 coudes + 1 te derivation + 1 globe + 1 opercule = 0,019 x (60 + 60 + 340 + 8) = 8,892 ; + K fabricant 0,5 = 9,392
let r = K.sum({ coudes: 2, tes: 1, globe: 1, vannes: 1, kx: 0.5 }, 50);
check('Somme DN50 : K = 9,392', near(r.K, 9.392, 1e-6), 'K = ' + r.K);
check('Aucun accessoire : K = 0', K.sum({}, 50).K === 0);
check('K supplementaire negatif ignore', K.sum({ kx: -3 }, 50).K === 0);

console.log('6) Perte de charge lineaire (Darcy-Weisbach)');
// Colebrook-White resolu par iteration, independant de Swamee-Jain
function colebrook(Re, rel) { let x = 0.02; for (let i = 0; i < 200; i++) { x = Math.pow(-2 * Math.log10(rel / 3.7 + 2.51 / (Re * Math.sqrt(x))), -2); } return x; }
[[10, 40, 50], [30, 80, 100], [3, 25, 20], [100, 150, 200]].forEach(p => {
  const c = P(p[0], p[1], p[2], 1000), cb = colebrook(c.Re, 0.000046 / (p[1] / 1000));
  check('Eau Q = ' + p[0] + ' m3/h, D = ' + p[1] + ' mm : f = ' + c.f.toFixed(4) + ' (Colebrook ' + cb.toFixed(4) + ')', Math.abs(c.f / cb - 1) < 0.03, 'ecart ' + ((c.f / cb - 1) * 100).toFixed(2) + ' %');
});
// regime laminaire : dP = 32 mu L v / D^2 (Hagen-Poiseuille), mu = 0,001 Pa.s
(function () {
  const c = P(0.05, 50, 50, 1000), v = 0.05 / 3600 / (Math.PI * 0.05 * 0.05 / 4), att = 32 * 0.001 * 50 * v / (0.05 * 0.05);
  check('Laminaire : Re < 2300 et dP = Hagen-Poiseuille (' + att.toFixed(3) + ' Pa)', c.Re < 2300 && Math.abs(c.dP / att - 1) < 1e-9, 'Re = ' + c.Re + ', dP = ' + c.dP);
})();
// vitesse = Q / A
(function () { const c = P(10, 40, 50, 1000); check('Vitesse 10 m3/h dans 40 mm = 2,2105 m/s', near(c.v, 10 / 3600 / (Math.PI * 0.04 * 0.04 / 4), 1e-9) && near(c.v, 2.2105, 0.0005), 'v = ' + c.v); })();

console.log('\n' + (ko === 0 ? 'TOUT EST BON' : 'ECHEC') + ' : ' + ok + ' verification(s) reussie(s), ' + ko + ' echec(s).');
process.exit(ko === 0 ? 0 : 1);
