// Thermosys - AIDE bloc 29 + textes vocaux (RAPPORT) du module CYCLE FRIGORIFIQUE
// Usage : node update_aide_cycle.js dist\index.html
const fs = require('fs');
const f = process.argv[2];
if (!f) { console.log('ARRET : indiquez le fichier'); process.exit(1); }
let s = fs.readFileSync(f, 'utf8');
const before = s.length;
const NL = s.indexOf('\r\n') >= 0 ? '\r\n' : '\n';
let done = 0, skip = 0;

/* ---------- 1) AIDE : bloc 29 ---------- */
if (s.indexOf('29. CYCLE FRIGORIFIQUE') >= 0) { console.log('AIDE bloc 29 : DEJA FAIT'); skip++; }
else {
  const re = /(Not validated in Mediterranean or Algerian climate\.<\/i>\r?\n<\/div>\r?\n<\/div>)/g;
  const m = s.match(re);
  if (!m || m.length !== 1) { console.log('ARRET : ancre AIDE introuvable ou multiple (' + (m ? m.length : 0) + ')'); process.exit(1); }
  const block = [
    '',
    '<div style="margin-top:10px;border:1px solid var(--border);border-radius:6px;overflow:hidden">',
    '<div style="background:var(--tm);color:#000;padding:8px 12px;font-weight:700;font-size:12px">&#10052; 29. CYCLE FRIGORIFIQUE — Diagramme log p–h, COP, puissances / 29. REFRIGERATION CYCLE — log p–h diagram, COP, power</div>',
    '<div style="padding:10px;font-size:11px;line-height:1.8">',
    '&#9679; <b>Utilisation :</b> 1) choisissez le fluide frigorigène ; 2) réglez les températures d\'évaporation et de condensation, la surchauffe utile et totale, le sous-refroidissement et la puissance frigorifique ; 3) choisissez le type de compresseur (générique, ou scroll calibré sur le Copeland ZP54 en R410A) ; 4) cliquez sur CALCULER. « Note imprimable » ouvre la note de calcul sur une page A4, avec le diagramme log p–h.<br>',
    '&#9679; <b>Résultats :</b> COP, puissance absorbée, débit massique, température de refoulement, cylindrée balayée à installer, et diagramme log p–h du cycle.<br>',
    '&#9679; <b>Compresseur :</b> en mode générique, les rendements sont estimés s\'ils ne sont pas saisis. En mode scroll ZP54, le rendement volumétrique et le rendement électrique global sont calculés d\'après les données du constructeur (23 points de fonctionnement, rapports de pression de 1,88 à 6,52).<br>',
    '&#9679; <b>Limites :</b> cycle simple étage, pertes de charge négligées. La calibration ne vaut que pour le Copeland ZP54 en R410A ; pour tout autre compresseur, les résultats sont indicatifs et doivent être confirmés avec les données du constructeur. Estimation d\'ingénieur, pas un logiciel de sélection certifié.<br>',
    '&#9679; <b>Vérifications :</b> les propriétés du fluide viennent de CoolProp (écart contrôlé sur 680 cas : 0,2 % au plus). Pour le Copeland ZP54, la capacité calculée est à 0,67 % en moyenne et 2,4 % au maximum des données du constructeur.<br><br>',
    '<i>&#9679; <b>How to use:</b> 1) choose the refrigerant; 2) set the evaporating and condensing temperatures, useful and total superheat, subcooling and cooling capacity; 3) choose the compressor type (generic, or scroll calibrated on the Copeland ZP54 with R410A); 4) click CALCULATE. "Printable note" opens the calculation note on one A4 page, with the log p–h diagram.<br>',
    '&#9679; <b>Results:</b> COP, input power, mass flow, discharge temperature, swept volume to install, and the log p–h diagram of the cycle.<br>',
    '&#9679; <b>Compressor:</b> in generic mode, efficiencies are estimated if not entered. In ZP54 scroll mode, volumetric efficiency and overall electrical efficiency are calculated from the manufacturer\'s data (23 operating points, pressure ratios from 1.88 to 6.52).<br>',
    '&#9679; <b>Limits:</b> single-stage cycle, pressure drops neglected. The calibration only applies to the Copeland ZP54 with R410A; for any other compressor, results are indicative and must be confirmed with the manufacturer\'s data. Engineer\'s estimate, not certified selection software.<br>',
    '&#9679; <b>Checks:</b> fluid properties come from CoolProp (deviation checked on 680 cases: 0.2 % at most). For the Copeland ZP54, calculated capacity is within 0.67 % on average and 2.4 % at most of the manufacturer\'s data.</i>',
    '</div>',
    '</div>'
  ].join(NL);
  s = s.replace(re, function (x) { return x + NL + block; });
  console.log('AIDE bloc 29 : OK'); done++;
}

/* ---------- 2) Textes vocaux (RAPPORT) ---------- */
const V = {
  fr: { anchor: /(\r?\n[ \t]*)hourly:([ \t]+)'Module estimation horaire/g,
    text: 'Module cycle frigorifique. Cycle à compression simple étage : diagramme logarithme de pression enthalpie, coefficient de performance, puissance absorbée, débit massique, température de refoulement et cylindrée balayée. Les propriétés du fluide viennent de CoolProp. Compresseur générique, ou scroll calibré sur le Copeland Z.P. cinquante-quatre en R. quatre cent dix A. Pertes de charge négligées : résultats indicatifs, à confirmer avec les données du constructeur, avec note imprimable.' },
  en: { anchor: /(\r?\n[ \t]*)hourly:([ \t]+)'Hourly estimation module/g,
    text: 'Refrigeration cycle module. Single stage compression cycle: log pressure enthalpy diagram, coefficient of performance, input power, mass flow, discharge temperature and swept volume. Fluid properties come from CoolProp. Generic compressor, or scroll calibrated on the Copeland Z.P. fifty-four with R. four ten A. Pressure drops are neglected: results are indicative and must be confirmed with the manufacturer data, with a printable note.' },
  es: { anchor: /(\r?\n[ \t]*)hourly:([ \t]+)'Módulo de estimación horaria/g,
    text: 'Módulo de ciclo frigorífico. Ciclo de compresión de una sola etapa: diagrama logaritmo de presión entalpía, coeficiente de rendimiento, potencia absorbida, caudal másico, temperatura de descarga y cilindrada barrida. Las propiedades del fluido provienen de CoolProp. Compresor genérico, o scroll calibrado con el Copeland Z.P. cincuenta y cuatro en R. cuatrocientos diez A. Pérdidas de carga despreciadas: resultados indicativos, a confirmar con los datos del fabricante, con nota imprimable.' }
};
for (const k of ['fr', 'en', 'es']) {
  const v = V[k];
  const marker = 'cycle:' ;
  const m = s.match(v.anchor);
  if (!m || m.length !== 1) { console.log('ARRET : ancre voix ' + k + ' introuvable ou multiple (' + (m ? m.length : 0) + ')'); process.exit(1); }
  if (s.indexOf(v.text) >= 0) { console.log('Voix ' + k + ' : DEJA FAIT'); skip++; continue; }
  s = s.replace(v.anchor, function (x, nl, sp) { return nl + "cycle:" + sp + "'" + v.text + "'," + x; });
  console.log('Voix ' + k + ' : OK'); done++;
}

if (done === 0) { console.log('Rien a faire.'); process.exit(0); }
fs.writeFileSync(f, s, 'utf8');
console.log('Taille : ' + before + ' -> ' + s.length + ' octets (' + (s.length - before) + ')');
let bad = 0;
(s.match(/<script(?![^>]*\bsrc=)[^>]*>[\s\S]*?<\/script>/g) || []).forEach(function (x, i) {
  try { new Function(x.replace(/<\/?script[^>]*>/g, '')); } catch (e) { bad++; console.log('ATTENTION script ' + i + ' : ' + e.message); }
});
console.log(bad ? 'Syntaxe : ' + bad + ' probleme(s)' : 'Syntaxe JS : OK');
