// Thermosys - Test des servomoteurs du catalogue Vannes (fiches fabricants relevees le 27/11/2026)
// Usage (depuis le dossier files) :  node tests\servomoteurs_regression.js
'use strict';
const fs = require('fs'), path = require('path'), vm = require('vm');
const file = process.argv[2] || path.join('dist', 'index.html');
const html = fs.readFileSync(file, 'utf8').replace(/\r\n/g, '\n');
const ORIG = [{"br":"Belimo","m":"LM24A-SR","cat":"Clapet d’air (pas vanne d’eau)","sig":"2-10V","alim":"24VAC/DC","force":"5 Nm","tps":"150s","ip":"IP54","pds":"0.5 kg","note":"Servomoteur de clapets d’air","detail":{"Ancien":"x"}},{"br":"Belimo","m":"NM24A-SR","cat":"Clapet d’air (pas vanne d’eau)","sig":"2-10V","alim":"24VAC","force":"10 Nm","tps":"150s","ip":"IP54","pds":"0.75 kg","note":"Servomoteur de clapets d’air","detail":{"Ancien":"x"}},{"br":"Belimo","m":"AM24A-SR","cat":"Clapet d’air (pas vanne d’eau)","sig":"2-10V","alim":"24VAC","force":"20 Nm","tps":"150s","ip":"IP54","pds":"1.1 kg","note":"Servomoteur de clapets d’air","detail":{"Ancien":"x"}},{"br":"Belimo","m":"GM24A-SR","cat":"Clapet d’air (pas vanne d’eau)","sig":"2-10V","alim":"24VAC","force":"40 Nm","tps":"150s","ip":"IP54","pds":"2.1 kg","note":"Servomoteur de clapets d’air","detail":{"Ancien":"x"}},{"br":"Belimo","m":"SM230A","cat":"Rotatif 90°","sig":"TOR (On/Off)","alim":"230VAC","force":"20 Nm","tps":"150s","ip":"IP40","pds":"1.0 kg","note":"230V TOR — simples circuits","detail":{"Ancien":"x"}},{"br":"Belimo","m":"LF24-SR","cat":"Linéaire","sig":"2-10V","alim":"24VAC","force":"100 N","tps":"150s","ip":"IP54","pds":"0.45 kg","note":"Linéaire compact — vannes 2V/3V","detail":{"Ancien":"x"}},{"br":"Belimo","m":"NF24A-SR","cat":"Linéaire","sig":"2-10V","alim":"24VAC","force":"500 N","tps":"120s","ip":"IP54","pds":"0.8 kg","note":"Linéaire grand — vannes DN25-DN50","detail":{"Ancien":"x"}},{"br":"Belimo","m":"TR24A-SR","cat":"Retour ressort","sig":"2-10V","alim":"24VAC","force":"5 Nm","tps":"90°:150s / ret:20s","ip":"IP54","pds":"0.85 kg","note":"Fail-safe — retour ressort NC ou NO","detail":{"Ancien":"x"}},{"br":"Siemens","m":"SQS65","cat":"Rotatif 90°","sig":"0-10V","alim":"24VAC","force":"20 Nm","tps":"150s","ip":"IP54","pds":"0.9 kg","note":"Standard Siemens tertiaire","detail":{"Ancien":"x"}},{"br":"Siemens","m":"SQS82.00U","cat":"Rotatif 90°","sig":"0-10V","alim":"24VAC","force":"20 Nm","tps":"150s","ip":"IP54","pds":"0.9 kg","note":"Avec bus MP-Bus Synco","detail":{"Ancien":"x"}},{"br":"Siemens","m":"SQK62.00","cat":"Linéaire","sig":"0-10V","alim":"24VAC","force":"1000 N","tps":"120s","ip":"IP54","pds":"1.2 kg","note":"Grand couple linéaire","detail":{"Ancien":"x"}},{"br":"Siemens","m":"SSA31","cat":"Électrothermique","sig":"24V TOR","alim":"24VAC/DC","force":"100 N","tps":"—","ip":"IP54","pds":"0.08 kg","note":"Ultra-compact — plancher chauffant","detail":{"Ancien":"x"}},{"br":"Siemens","m":"SQS35.00","cat":"Rotatif 90°","sig":"0-10V","alim":"24VAC","force":"5 Nm","tps":"75s","ip":"IP54","pds":"0.4 kg","note":"Compact 5Nm — petites vannes","detail":{"Ancien":"x"}},{"br":"Honeywell","m":"ML7420A6009","cat":"Linéaire","sig":"0-10V","alim":"24VAC","force":"750 N","tps":"60s","ip":"IP54","pds":"1.1 kg","note":"Course 20mm — réglable","detail":{"Ancien":"x"}},{"br":"Honeywell","m":"ML7984A1001","cat":"Linéaire","sig":"TOR 24V","alim":"24VAC","force":"250 N","tps":"—","ip":"IP54","pds":"0.7 kg","note":"TOR — 2 positions","detail":{"Ancien":"x"}},{"br":"Honeywell","m":"ML6425A2108","cat":"Linéaire","sig":"0-10V","alim":"24VAC","force":"500 N","tps":"90s","ip":"IP54","pds":"0.85 kg","note":"Retour ressort NC — sécurité","detail":{"Ancien":"x"}},{"br":"Danfoss","m":"AME 10","cat":"Linéaire","sig":"TOR 24V","alim":"24VAC","force":"200 N","tps":"—","ip":"IP44","pds":"0.35 kg","note":"Ultra-compact TOR","detail":{"Ancien":"x"}},{"br":"Danfoss","m":"AME 15","cat":"Linéaire","sig":"TOR/0-10V","alim":"24VAC","force":"300 N","tps":"60s","ip":"IP44","pds":"0.5 kg","note":"Modulant ou TOR","detail":{"Ancien":"x"}},{"br":"Danfoss","m":"AME 25","cat":"Linéaire","sig":"0-10V","alim":"24VAC","force":"800 N","tps":"120s","ip":"IP54","pds":"0.8 kg","note":"Standard DN25-DN50","detail":{"Ancien":"x"}},{"br":"Danfoss","m":"AME 35","cat":"Linéaire","sig":"0-10V","alim":"24VAC","force":"1000 N","tps":"120s","ip":"IP54","pds":"1.0 kg","note":"DN50-DN65 — course 7.5mm","detail":{"Ancien":"x"}},{"br":"Danfoss","m":"AME 55","cat":"Linéaire","sig":"0-10V","alim":"24VAC","force":"1500 N","tps":"150s","ip":"IP54","pds":"1.3 kg","note":"Grand couple DN65-DN100","detail":{"Ancien":"x"}},{"br":"Danfoss","m":"AME 658","cat":"Rotatif 90°","sig":"0-10V","alim":"24VAC","force":"20 Nm","tps":"90s","ip":"IP54","pds":"1.4 kg","note":"Rotatif — vanne papillon/boule","detail":{"Ancien":"x"}},{"br":"Sauter","m":"AVM215F001","cat":"Linéaire","sig":"0-10V","alim":"24VAC","force":"100 N","tps":"95s","ip":"IP54","pds":"0.35 kg","note":"Compact — HVAC européen","detail":{"Ancien":"x"}},{"br":"Sauter","m":"SAX31.03","cat":"Linéaire","sig":"0-10V","alim":"24VAC","force":"500 N","tps":"120s","ip":"IP54","pds":"0.8 kg","note":"DN25-DN50","detail":{"Ancien":"x"}},{"br":"Sauter","m":"SAX61.03","cat":"Linéaire","sig":"0-10V","alim":"24VAC","force":"1000 N","tps":"150s","ip":"IP54","pds":"1.1 kg","note":"Grand DN50-DN80","detail":{"Ancien":"x"}}];
// ---- table figee : ce que disent les fiches des fabricants (force, temps, IP, poids, alimentation, signal) ----
// u = unite de force ; kind : 'damper' (clapets d'air, rotatif), 'linear' (vannes), 'mask' (reference non confirmee)
const T = [
  ['Belimo', 'LF24-SR', 'damper', 4, 'Nm', '150s', 'IP54', '1.5 kg', '24VAC/DC', '2-10V'],
  ['Belimo', 'NF24A-SR', 'damper', 10, 'Nm', '150s', 'IP54', '2.0 kg', '24VAC/DC', '2-10V'],
  ['Belimo', 'SM230A', 'damper', 20, 'Nm', '150s', 'IP54', '0.94 kg', '100-240VAC', 'Tout ou rien / 3 points'],
  ['Siemens', 'SQS65', 'linear', 400, 'N', '—', '—', '—', '24VAC', '0-10V'],
  ['Siemens', 'SQS35.00', 'linear', 400, 'N', '—', '—', '—', '230VAC', '3 points'],
  ['Siemens', 'SSA31', 'linear', 100, 'N', '150s', 'IP40', '0.35 kg', '230VAC', '3 points'],
  ['Danfoss', 'AME 10', 'linear', 300, 'N', '14 s/mm', 'IP54', '0.6 kg', '24VAC', '0-10V'],
  ['Danfoss', 'AME 15', 'linear', 500, 'N', '11 s/mm', 'IP54', '—', '24VAC', '0-10V'],
  ['Danfoss', 'AME 25', 'linear', 1000, 'N', '11 s/mm', 'IP54', '1.70 kg', '24VAC', '0-10V'],
  ['Danfoss', 'AME 35', 'linear', 600, 'N', '3 s/mm', 'IP54', '1.70 kg', '24VAC', '0-10V'],
  ['Danfoss', 'AME 55', 'linear', 2000, 'N', '8 s/mm', 'IP54', '3.8 kg', '24VAC', '0-10V'],
  ['Danfoss', 'AME 658', 'linear', 2000, 'N', '4 ou 6 s/mm', 'IP54', '8.6 kg', '24VAC/DC', '3 points / 0-10V'],
  ['Honeywell', 'ML7420A6009', 'linear', 600, 'N', '60s', 'IP54', '1.3 kg', '24VAC', '0-10V'],
  ['Siemens', 'SAX31.03', 'linear', 800, 'N', '30s', 'IP54', '—', '230VAC', '3 points'],
  ['Siemens', 'SAX61.03', 'linear', 800, 'N', '30s', 'IP54', '—', '24VAC/DC', '0-10V']
];
const MASKED = [['Honeywell', 'ML6425A2108'], ['Sauter', 'AVM215F001'], ['Siemens', 'SQK62.00'], ['Siemens', 'SQS82.00U'], ['Belimo', 'TR24A-SR']];
const REMOVED = [['Honeywell', 'ML7984A1001']];
const UNTOUCHED = [['Belimo', 'LM24A-SR', '5 Nm'], ['Belimo', 'NM24A-SR', '10 Nm'], ['Belimo', 'AM24A-SR', '20 Nm'], ['Belimo', 'GM24A-SR', '40 Nm']];
const OLD_SAUTER = ['SAX31.03', 'SAX61.03'];
const INVENTED = ['Compatibilité', 'Compatibilité vannes', 'Compatibility', 'Applications', 'Options', 'Câble', 'Consommation', 'Couple limite', 'Référence'];
function parseForce(s) { const m = /^(\d+(?:\.\d+)?) (Nm|N)$/.exec(String(s)); return m ? [Number(m[1]), m[2]] : null; }

function load(src, lang) {
  const calls = { n: 0 };
  const act = JSON.parse(JSON.stringify(ORIG));
  const ctx = { window: { lang: lang || 'fr', renderActuators() { calls.n++; }, showActDetail() { } }, document: { getElementById() { return null; } }, setTimeout() { }, ACTUATORS: act };
  vm.createContext(ctx);
  vm.runInContext(src, ctx);
  return { ctx, act, calls };
}
function runChecks(src, quiet) {
  let pass = 0, fail = 0; const msgs = [];
  function ok(c, m) { if (c) { pass++; } else { fail++; if (msgs.length < 12) { msgs.push(m); } } }
  let L;
  try { L = load(src, 'fr'); } catch (e) { return { pass, fail: fail + 1, msgs: ['erreur a l execution : ' + e.message] }; }
  const act = L.act;
  const find = (br, m) => act.filter(a => (a.m === m) && (a.br === br));
  ok(act.length === 24, 'le catalogue doit compter 24 servomoteurs (25 moins l accessoire), il en compte ' + act.length);
  REMOVED.forEach(r => ok(act.every(a => a.m !== r[1]), r[1] + ' est un accessoire : doit etre retire'));
  OLD_SAUTER.forEach(m => ok(act.every(a => !(a.br === 'Sauter' && a.m === m)), m + ' n est pas une reference Sauter'));
  T.forEach(row => {
    const [br, m, kind, fv, fu, tps, ip, pds, alim, sig] = row, f = find(br, m);
    ok(f.length === 1, br + ' ' + m + ' : une seule fiche attendue');
    if (f.length !== 1) { return; }
    const a = f[0], pf = parseForce(a.force);
    ok(pf && pf[0] === fv && pf[1] === fu, m + ' : force ' + fv + ' ' + fu + ' attendue, ' + a.force + ' trouvee');
    ok(a.tps === tps, m + ' : temps ' + tps + ' attendu, ' + a.tps);
    ok(a.ip === ip, m + ' : protection ' + ip + ' attendue, ' + a.ip);
    ok(a.pds === pds, m + ' : poids ' + pds + ' attendu, ' + a.pds);
    ok(a.alim === alim, m + ' : alimentation ' + alim + ' attendue, ' + a.alim);
    ok(a.sig === sig, m + ' : signal ' + sig + ' attendu, ' + a.sig);
    if (kind === 'linear') { ok(/^Lin/.test(a.cat) && fu === 'N' && !/clapet/i.test(a.cat), m + ' : servomoteur lineaire de vanne, force en N'); }
    if (kind === 'damper') { ok(/Clapet d/.test(a.cat) && fu === 'Nm', m + ' : servomoteur de clapets d air, couple en Nm'); }
    ok(a.detail && a.detail.Source && a.detail.Source.indexOf('Fiche constructeur') === 0, m + ' : source citee dans la fiche');
    ok(a.detail && INVENTED.every(k => !(k in a.detail)), m + ' : aucune rubrique inventee (compatibilite, applications...)');
    ok(a.detail && a.detail.Constructeur === br, m + ' : constructeur de la fiche');
  });
  MASKED.forEach(r => {
    const f = find(r[0], r[1]);
    ok(f.length === 1, r[1] + ' : fiche presente');
    if (f.length !== 1) { return; }
    const a = f[0];
    ok(['sig', 'alim', 'force', 'tps', 'ip', 'pds'].every(k => a[k] === '—'), r[1] + ' : valeurs masquees');
    ok(a.cat === 'Non vérifié' && a.detail && a.detail.Statut && !/Ancien/.test(JSON.stringify(a.detail)), r[1] + ' : statut non verifie, anciennes valeurs retirees');
  });
  UNTOUCHED.forEach(r => { if (r[2]) { const f = find(r[0], r[1]); ok(f.length === 1 && f[0].force === r[2], r[1] + ' : fiche inchangee'); } });
  // anglais, puis retour au francais, puis idempotence
  try {
    L.ctx.window.lang = 'en'; L.ctx.window.renderActuators();
    const e = find('Belimo', 'LF24-SR')[0], s = find('Siemens', 'SAX61.03')[0], d = find('Danfoss', 'AME 658')[0];
    ok(e && /Air damper/.test(e.cat) && e.detail['Running time'] === '150 s for 90° (adjustable 75 to 300 s)' && e.detail.Source.indexOf('Manufacturer datasheet') === 0, 'anglais : fiche LF24-SR');
    ok(s && s.sig === '0-10V' && s.detail['Running time'] === '30 s' && d.tps === '4 or 6 s/mm' && d.sig === '3-point / 0-10V', 'anglais : SAX61.03 et AME 658');
    const m6 = find('Honeywell', 'ML6425A2108')[0]; ok(m6 && m6.cat === 'Unverified' && m6.detail.Status, 'anglais : fiche non verifiee');
    L.ctx.window.lang = 'fr'; L.ctx.window.renderActuators();
    const f2 = find('Belimo', 'LF24-SR')[0]; ok(f2.detail['Temps de course'] === '150 s pour 90° (réglable 75 à 300 s)' && act.length === 24, 'retour au francais sans doublon');
    const snap = JSON.stringify(act); L.ctx.window.renderActuators(); ok(snap === JSON.stringify(act), 'appliquer deux fois ne change rien');
    ok(L.calls.n >= 2, 'le rendu d origine est bien appele');
  } catch (er) { fail++; msgs.push('erreur anglais : ' + er.message); }
  return { pass, fail, msgs };
}
const m = /<script id="servo-module">([\s\S]*?)<\/script>/.exec(html);
if (!m) { console.log('ECHEC : module servomoteurs introuvable'); process.exit(1); }
const src = m[1];
const base = runChecks(src);
let pass = base.pass, fail = base.fail; base.msgs.forEach(x => console.log('ECHEC : ' + x));
// presence unique et ordre
ok1(html.split('<script id="servo-module">').length === 2, 'module present une seule fois');
ok1(html.indexOf('<script id="servo-module">') > html.indexOf('<script id="vannes38-module">') || html.indexOf('vannes38-module') < 0, 'module place apres celui des vannes');
ok1(!/AME 658<\/td><td>6 000 N/.test(html) && !/AMV 20\/23/.test(html) && !/AME 55<\/td><td>2 500 N/.test(html), 'ancien tableau Danfoss (6 000 N, 2 500 N, AMV) retire');
ok1(/AME 658 SU\/SD<\/td><td>2 000 N<\/td><td>50 mm/.test(html) && /AME 55<\/td><td>2 000 N<\/td><td>40 mm/.test(html), 'tableau Danfoss corrige (AME 55, AME 658)');
function ok1(c, msg) { if (c) { pass++; } else { fail++; console.log('ECHEC : ' + msg); } }
// ---- mutations : on abime le module, le test doit le voir ----
const lines = src.split('\n'), muts = [];
const FIELDS = ['force', 'tps', 'ip', 'pds', 'alim', 'sig'];
lines.forEach((ln, i) => {
  const km = /^\s*'((?:Belimo|Siemens|Danfoss|Honeywell|Sauter)\|[^']+)': \{ br:/.exec(ln); if (!km) { return; }
  FIELDS.forEach(f => {
    const re = new RegExp('(\\b' + f + ": )('([^']*)'|DASH)"); const mm = re.exec(ln); if (!mm) { return; }
    muts.push([km[1] + ' ' + f, i, ln.replace(re, '$1\'' + (mm[3] || '') + '9\'')]);
  });
  const bm = /br: '([^']+)'/.exec(ln); if (bm) { muts.push([km[1] + ' br', i, ln.replace(/br: '[^']+'/, "br: 'Xyz'")]); }
  const cm = /cat: \['[^']*'/.exec(ln); if (cm) { muts.push([km[1] + ' cat', i, ln.replace(/cat: \['[^']*'/, "cat: ['Rotatif 90°'")]); }
});
const LOGIC = [
  ["'Honeywell|ML7984A1001': 1", "'Honeywell|ML7984A1001x': 1"],
  ["if (REMOVE[key(ACTUATORS[i])])", "if (false)"],
  ["var k = a.__orig || key(a)", "var k = key(a)"],
  ["a.cat = E ? 'Unverified' : 'Non vérifié'", "a.cat = 'Non vérifié'"],
  ["a.force = DASH; a.tps = DASH", "a.tps = DASH"],
  ["a.pds = DASH;\n", "\n"],
  ["d[E ? r[1] : r[0]] = E ? r[3] : r[2];", "d[r[0]] = r[2];"],
  ["a.sig = E && f.sigEn ? f.sigEn : f.sig", "a.sig = f.sig"],
  ["a.tps = E && f.tpsEn ? f.tpsEn : f.tps", "a.tps = f.tps"],
  ["a.br = f.br;", ""],
  ["'Fiche constructeur : ' + f.src", "'Fiche : ' + f.src"],
  ["'Sauter|AVM215F001': 'Référence absente", "'Sauter|AVM215F001x': 'Référence absente"],
  ["'Siemens|SQK62.00': 'Aucune", "'Siemens|SQK62.00x': 'Aucune"],
  ["window.renderActuators = function () { apply(); var r = oR.apply(this, arguments);", "window.renderActuators = function () { var r = oR.apply(this, arguments);"]
];
LOGIC.forEach(p => { const n = src.split(p[0]).length - 1; if (n < 1) { fail++; console.log('ECHEC : mutation introuvable (a corriger dans le test) : ' + p[0].slice(0, 50)); return; } muts.push(['logique ' + p[0].slice(0, 40), -1, null, p]); });
let killed = 0, survivors = [];
muts.forEach(mu => {
  let s2;
  if (mu[1] >= 0) { const l2 = lines.slice(); l2[mu[1]] = mu[2]; s2 = l2.join('\n'); } else { s2 = src.replace(mu[3][0], mu[3][1]); }
  if (s2 === src) { survivors.push(mu[0] + ' (sans effet)'); return; }
  const r = runChecks(s2, true);
  if (r.fail > 0) { killed++; } else { survivors.push(mu[0]); }
});
if (survivors.length) { fail += survivors.length; survivors.forEach(x => console.log('ECHEC : mutation survivante : ' + x)); }
pass += killed;
if (fail === 0) { console.log('TOUT EST BON : ' + (pass - killed) + ' verifications, ' + killed + ' mutations tuees'); }
else { console.log(fail + ' echec(s), ' + pass + ' reussite(s)'); process.exit(1); }
