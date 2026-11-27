// Thermosys - Tests de la page "Validation et references" (contenu fidele aux tests reels, trois langues)
// Usage (depuis le dossier files) :  node tests\validation_regression.js
'use strict';
const fs = require('fs'), path = require('path');
const file = process.argv[2] || path.join('dist', 'index.html');
const html = fs.readFileSync(file, 'utf8');
const m = /<script id="validation-46-module">([\s\S]*?)<\/script>/.exec(html);
let pass = 0, fail = 0;
function ok(c, msg) { if (c) pass++; else { fail++; console.log('ECHEC : ' + msg); } }
if (!m) { console.log('ECHEC : module introuvable'); process.exit(1); }
const els = {};
let langV = 'fr', es = false;
function mkEl(tag) { return { tag, id: '', className: '', style: {}, children: [], parentNode: null, textContent: '', _h: '',
  set innerHTML(v) { this._h = v; }, get innerHTML() { return this._h; },
  querySelectorAll() { return []; }, appendChild(c) { c.parentNode = this; this.children.push(c); }, insertBefore(c) { this.children.push(c); } }; }
const pg = mkEl('div'); pg.id = 'pg-aide';
const sandbox = { window: {}, document: { getElementById(i) { return i === 'pg-aide' ? pg : els[i] || null; }, createElement: mkEl }, setInterval() {} };
sandbox.window.I18N3 = { ov() { return es; } };
const origAppend = pg.appendChild.bind(pg);
pg.appendChild = function (c) { els[c.id] = c; origAppend(c); };
Object.defineProperty(sandbox, 'lang', { get() { return langV; } });
new Function('window', 'document', 'setInterval', 'lang', m[1])(sandbox.window, sandbox.document, sandbox.setInterval, undefined);
const V = sandbox.window.__val46;
ok(V && V.V.length >= 20, 'au moins 20 modules listes');
// source de verite : README_TESTS.txt
let readme = '';
try { readme = fs.readFileSync(path.join('tests', 'README_TESTS.txt'), 'utf8'); } catch (e) { /* ignore */ }
V.V.forEach(function (x) {
  ok(readme === '' || readme.indexOf(x.t) >= 0, 'test inconnu du README : ' + x.t);
  [0, 1, 2].forEach(function (i) {
    ok(x.n[i] && x.c[i] && x.l[i], x.id + ' texte manquant langue ' + i);
    ok(x.l[i].length > 20, x.id + ' limites vides langue ' + i);
  });
  ok(/non v[ée]rifi|not verified|no verificado|ne sont pas|not |No |non corrig|sin corregir|uncorrected|\u00e9cart|deviation|desviaci/i.test(x.l[0] + x.l[1] + x.l[2]), x.id + ' doit dire ce qui n\'est pas verifie');
  if (x.k) { const r = new RegExp(x.t.replace('.', '\\.') + '[^\\n]*?' + x.k[0] + '[^\\n]*?' + x.k[1]); ok(readme === '' || r.test(readme), x.id + ' comptes ' + x.k + ' differents du README'); }
});
ok(V.V.some(x => x.id === 'gaines_ef' && /13 %/.test(x.l[0])), 'gaines_ef : limite honnete presente');
ok(!/Pas de perte de charge/.test(JSON.stringify(V.V)), 'gaines : ancienne limite retiree');
ok(V.V.some(x => x.id === 'psychro' && /0,7 %/.test(x.l[0]) && /0\.7 %/.test(x.l[1]) && /0,7 %/.test(x.l[2]) && /Kuehn/.test(x.l[0])), 'psychro : choix gaz parfait documente avec la source ASHRAE');
ok(V.V.some(x => x.id === 'psychro' && x.l.every(z => !/3,7 K|3\.7 K/.test(z)) && /givre/.test(x.l[0]) && /frost/.test(x.l[1]) && /escarcha/.test(x.l[2])), 'psychro : point de givre documente, ancienne limite 3,7 K retiree');
ok(V.V.some(x => x.id === 'airtreat' && /Lois de COP/.test(x.c[0]) && /COP laws/.test(x.c[1]) && /Leyes de COP/.test(x.c[2]) && /dégivrage non modélisé/i.test(x.l[0]) && /not modelled/.test(x.l[1]) && /no modelado/.test(x.l[2]) && /deux étages/.test(x.l[0]) && /two-stage/.test(x.l[1]) && /dos etapas/.test(x.l[2]) && /non vérifiée/.test(x.l[0]) && /not verified/.test(x.l[1]) && /no verificada/.test(x.l[2])), 'airtreat : lois de COP comparees, limites honnetes x3');
ok(V.V.some(x => x.id === 'heating' && /heating_exemples_regression/.test(x.c[0]) && /heating_exemples_regression/.test(x.c[1]) && /heating_exemples_regression/.test(x.c[2]) && /payante/.test(x.l[0]) && /is paid/.test(x.l[1]) && /es de pago/.test(x.l[2]) && /appliquée à la ventilation naturelle seulement/.test(x.l[0]) && /REHAU/.test(x.l[0]) && /heizlast\.de/.test(x.l[0]) && /heizlast\.de/.test(x.l[1]) && /heizlast\.de/.test(x.l[2]) && /43 %/.test(x.l[0]) && /43 %/.test(x.l[1]) && /43 %/.test(x.l[2]) && /REHAU/.test(x.l[1]) && /REHAU/.test(x.l[2]) && /\+44 %/.test(x.l[0]) && /\+44 %/.test(x.l[1]) && /\+44 %/.test(x.l[2]) && !/non confirmée par une seconde source/.test(x.l[0]) && /applied to natural ventilation only/.test(x.l[1]) && /se aplica solo a la ventilación natural/.test(x.l[2])), 'chauffage : sources lues et limites honnetes x3');
// phrases interdites (chiffres non mesures)
const all = JSON.stringify(V.V) + JSON.stringify(sandbox.window.__val46.render(0));
['0,6 % contre EnergyPlus', '0.6 % vs EnergyPlus', 'certifié conforme', 'validé à 0,6'].forEach(function (b) { ok(all.indexOf(b) < 0, 'phrase interdite : ' + b); });
ok(/n’est pas une certification/.test(V.render(0)) && /not a certification/.test(V.render(1)) && /no es una certificaci/i.test(V.render(2)), 'avertissement certification x3');
// rendu
[0, 1, 2].forEach(function (i) { const h = V.render(i); ok((h.match(/<details/g) || []).length === V.V.length, 'nb details langue ' + i); ok(h.indexOf('<script') < 0, 'pas de script'); });
// installation et changement de langue
V.install(); const p = els['val46-panel'];
ok(p && p._h.indexOf('VALIDATION ET R') >= 0, 'panneau FR');
es = true; V.install(); ok(p._h.indexOf('VALIDACI') >= 0, 'panneau ES');
es = false; langV = 'en'; sandbox.window.lang = 'en'; V.install(); ok(p._h.indexOf('VALIDATION AND REFERENCES') >= 0 || p._h.indexOf('VALIDACI') >= 0, 'panneau EN');
console.log(fail ? 'ECHECS : ' + fail + ' / ' + (pass + fail) : 'TOUT EST BON : ' + pass + ' verifications');
process.exit(fail ? 1 : 0);
