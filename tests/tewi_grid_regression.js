// Thermosys - Tests du selecteur de facteurs d'emission du reseau electrique (TEWI)
// Sources : AIE 2025 (tableau "2025 Electricity Emission Factors", reproduit par ABB) pour 50 pays ; Ember 2022-2025 (cycle de vie) pour 22 pays (dont l'Iran).
// Usage (depuis le dossier files) :  node tests\tewi_grid_regression.js
'use strict';
const fs = require('fs'), path = require('path');
const file = process.argv[2] || path.join('dist', 'index.html');
const html = fs.readFileSync(file, 'utf8');
const IEA = {"Algeria":500.1,"France":41.3,"Egypt":400,"Saudi Arabia":596.7,"UAE":358.2,"Qatar":460.6,"Nigeria":403.5,"South Africa":872.6,"Germany":331.3,"Italy":257.4,"Spain":132.7,"United Kingdom":175,"Turkey":414.2,"Norway":5.5,"Sweden":9.9,"Finland":41.5,"Denmark":62,"Netherlands":233.3,"Belgium":141.4,"Switzerland":21.3,"Austria":99.9,"Greece":294.7,"Poland":543.8,"Czech Republic":390.3,"Romania":225.3,"Hungary":152.9,"Croatia":148.3,"Slovakia":97.2,"Serbia":669.3,"China":589.2,"Japan":448.2,"South Korea":455.7,"India":747.3,"Australia":583.4,"New Zealand":89.9,"Indonesia":752.8,"Malaysia":615.4,"Thailand":432.4,"Vietnam":558.4,"Philippines":770.2,"Singapore":377.6,"Taiwan":554.1,"USA":330.8,"Canada":119,"Brazil":65.8,"Mexico":420.5,"Argentina":257.5,"Chile":221,"Colombia":210.4,"Peru":221.3}, ADEME = {"Morocco":0.577,"Tunisia":0.545,"Libya":0.806,"Kuwait":0.634,"Bahrain":0.902,"Oman":0.506,"Jordan":0.49,"Lebanon":0.391,"Iraq":0.682,"Syria":0.657,"Yemen":0.551,"Kenya":0.092,"Ghana":0.461,"Ethiopia":0.023,"Tanzania":0.326,"Cameroon":0.22,"Senegal":0.507,"Ivory Coast":0.398,"Ukraine":0.251,"Pakistan":0.309,"Bangladesh":0.69,"Iran":0.656};
const a = html.indexOf('<script id="tewi-grid-v1">');
if (a < 0) { console.log('ECHEC : module tewi-grid-v1 introuvable'); process.exit(1); }
const sc = html.slice(a, html.indexOf('</script>', a));
const m = /var GRID=(\[\[[\s\S]*?\]\]);/.exec(sc);
if (!m) { console.log('ECHEC : liste GRID introuvable'); process.exit(1); }
const GRID = new Function('return ' + m[1])();
function suite(G) {
  const f = []; const ok = (c, msg) => { if (!c) f.push(msg); };
  const byName = {}; G.forEach(r => { const n = r[1].replace(/\s*\(.*$/, ''); byName[n] = r; });
  ok(G.length === 73, 'nombre d\'entrees : ' + G.length);
  Object.keys(IEA).forEach(n => { const r = byName[n]; ok(!!r, 'absent : ' + n); if (r) { ok(Math.abs(parseFloat(r[0]) * 1000 - IEA[n]) <= 1.0, 'AIE ' + n + ' : ' + r[0] + ' vs ' + IEA[n]); ok(r[1].indexOf('(' + r[0] + ')') > 0, 'etiquette ' + n); ok(!/ADEME|non v/.test(r[1]), 'etiquette AIE sans mention ancienne ' + n); } });
  Object.keys(ADEME).forEach(n => { const r = byName[n]; ok(!!r, 'absent : ' + n); if (r) { ok(Math.abs(parseFloat(r[0]) - ADEME[n]) < 0.0006, 'ADEME ' + n + ' : ' + r[0] + ' vs ' + ADEME[n]); ok(/Ember (2022|2024|2025)/.test(r[1]) && r[1].indexOf(r[0]) > 0, 'etiquette Ember ' + n); } });
  ok(!byName['EU-27 avg.'], 'moyenne UE retiree (aucune source)');
  ok(byName['Iran'] && /Ember 2025/.test(byName['Iran'][1]) && r0(byName['Iran']) === 0.656, 'Iran : valeur Ember 2025');
  ok(!G.some(r => /non v|ADEME/.test(r[1])), 'plus aucune valeur non verifiee ni ADEME 2011');
  ok(G[G.length - 1][0] === 'custom' || /Custom/i.test(G[G.length - 1][1]), 'choix personnalise en dernier');
  G.forEach(r => { if (r[0] !== 'custom') { const v = parseFloat(r[0]); ok(v >= 0 && v < 1.5, 'plage ' + r[1]); } });
  ok(new Set(G.map(r => r[1].replace(/\s*\(.*$/, ''))).size === G.length, 'pas de doublon de pays');
  ok(parseFloat(byName['Ethiopia'][0]) <= 0.03 && parseFloat(byName['Kenya'][0]) < 0.15 && parseFloat(byName['Lebanon'][0]) < 0.45, 'anciennes valeurs 2011 (Kenya 0,274 ; Liban 0,709) remplacees');
  return f;
  function r0(r) { return parseFloat(r[0]); }
}
const base = suite(GRID);
if (base.length) { console.log(base.slice(0, 15).join('\n')); console.log('ECHECS : ' + base.length); process.exit(1); }
let surv = 0, n = 0;
GRID.forEach((r, i) => { if (r[0] === 'custom') return; n++; const G2 = GRID.map(x => x.slice()); G2[i][0] = (parseFloat(r[0]) + 0.01).toFixed(3); if (!suite(G2).length) { console.log('MUTANT SURVIVANT : ' + r[1]); surv++; } });
const G3 = GRID.filter(r => r[1].indexOf('Iran') < 0); n++; if (!suite(G3).length) { console.log('MUTANT SURVIVANT : retrait Iran'); surv++; }
const G4 = GRID.concat([['0.275', 'EU-27 avg. (0.275)']]); n++; if (!suite(G4).length) { console.log('MUTANT SURVIVANT : retour UE'); surv++; }
if (surv) { console.log('ECHEC : ' + surv + ' mutation(s) non detectee(s)'); process.exit(1); }
console.log('TOUT EST BON : ' + GRID.length + ' entrees verifiees, ' + n + ' mutations toutes detectees');
