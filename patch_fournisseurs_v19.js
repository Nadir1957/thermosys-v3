// Thermosys - SCOP/COP : fournisseurs et gestionnaires de reseau, corriges et structures (v19, Afrique, Asie du Sud-Est, Cuba et Turkmenistan)
// Usage : node patch_fournisseurs_v19.js dist\index.html
const fs = require('fs');
const f = process.argv[2];
if (!f) { console.log('ARRET : indiquez le fichier'); process.exit(1); }
let s = fs.readFileSync(f, 'utf8');
if (s.indexOf('id="fournisseurs-v19"') >= 0) { console.log('DEJA FAIT'); process.exit(0); }
const a = s.indexOf('<script id="fournisseurs-v18">');
if (a < 0) { console.log('ARRET : appliquez d\'abord patch_fournisseurs_v18.js'); process.exit(1); }
const e = s.indexOf('</script>', a) + 9;
const CHK = ' Vérifiez auprès de votre commune ou sur votre facture.';
const D = {
 "ZM": [
  "ZESCO, entreprise d’État intégrée (production, transport, distribution, fourniture), sert plus d’un million de clients. Dans la Copperbelt, Copperbelt Energy Corporation (privée) possède des réseaux de transport et de distribution et fournit les mines. Régulateur : ERB (loi sur la régulation de l’énergie n° 12 de 2019).",
  "ZESCO, a vertically integrated state utility (generation, transmission, distribution, supply), serves over one million customers. In the Copperbelt, Copperbelt Energy Corporation (private) owns transmission and distribution networks and supplies the mines. Regulator: ERB (Energy Regulation Act No. 12 of 2019).",
  "ZESCO, empresa estatal integrada (generación, transporte, distribución, suministro), atiende a más de un millón de clientes. En la Copperbelt, Copperbelt Energy Corporation (privada) posee redes de transporte y distribución y abastece a las minas. Regulador: ERB (Ley de Regulación de la Energía n.º 12 de 2019)."
 ],
 "MZ": [
  "EDM, entreprise publique, est la principale institution chargée de l’accès à l’électricité sur le réseau. Cadre légal : loi n° 12/2022 ; régulateur ARENE (loi n° 11/2017), qui traite les concessions ; hors réseau régi par le décret n° 93/2021 (en vigueur depuis le 24 janvier 2022). Source de 2023, à revalider.",
  "EDM, a public company, is the main institution responsible for on-grid electricity access. Legal framework: Law No. 12/2022; regulator ARENE (Law No. 11/2017), which handles concessions; off-grid is governed by Decree No. 93/2021 (in force since 24 January 2022). 2023 source, to re-validate.",
  "EDM, empresa pública, es la principal institución responsable del acceso a la electricidad en la red. Marco legal: Ley n.º 12/2022; regulador ARENE (Ley n.º 11/2017), que tramita las concesiones; fuera de red rige el Decreto n.º 93/2021 (en vigor desde el 24 de enero de 2022). Fuente de 2023, a revalidar."
 ],
 "MM": [
  "Electricity Supply Enterprise (ESE), sous le ministère de l’Électricité et de l’Énergie, vend l’électricité au public et aux industries ; son département de distribution opère dans tout le pays, avec 16 bureaux d’État et de division. Les zones isolées sont alimentées par groupes diesel et petites centrales hydrauliques.",
  "The Electricity Supply Enterprise (ESE), under the Ministry of Electricity and Energy, sells electricity to the public and to industry; its Power Distribution Department operates nationwide, with 16 state and divisional offices. Remote areas are supplied by diesel generators and small hydropower plants.",
  "La Electricity Supply Enterprise (ESE), bajo el Ministerio de Electricidad y Energía, vende electricidad al público y a la industria; su Departamento de Distribución opera en todo el país, con 16 oficinas estatales y divisionales. Las zonas remotas se abastecen con generadores diésel y pequeñas centrales hidroeléctricas."
 ],
 "LA": [
  "EDL (Électricité du Laos), société d’État, possède et exploite les actifs de production, de transport et de distribution. Depuis septembre 2020, EDLT, coentreprise avec China Southern Power Grid (majoritaire), contrôle le réseau de transport ; l’État doit racheter progressivement les parts chinoises. Source unique, à revalider.",
  "EDL (Électricité du Laos), a state corporation, owns and operates generation, transmission and distribution assets. Since September 2020, EDLT, a joint venture with China Southern Power Grid (majority shareholder), controls the transmission grid; the government is to buy back the Chinese shares gradually. Single source, to re-validate.",
  "EDL (Électricité du Laos), sociedad estatal, posee y opera los activos de generación, transporte y distribución. Desde septiembre de 2020, EDLT, empresa conjunta con China Southern Power Grid (mayoritaria), controla la red de transporte; el Estado recomprará gradualmente las acciones chinas. Fuente única, a revalidar."
 ],
 "CU": [
  "Unión Eléctrica (UNE), entreprise d’État, assure la production, le transport, la distribution et la commercialisation de l’électricité. Les réseaux de distribution sont en mauvais état : les pertes de transport et de distribution dépassent 16 % de la production (rapport Cuba Study Group, 2026).",
  "Unión Eléctrica (UNE), a state company, handles generation, transmission, distribution and sale of electricity. Distribution networks are in poor condition: transmission and distribution losses exceed 16% of generation (Cuba Study Group report, 2026).",
  "Unión Eléctrica (UNE), empresa estatal, se encarga de la generación, el transporte, la distribución y la comercialización de electricidad. Las redes de distribución están en mal estado: las pérdidas de transporte y distribución superan el 16 % de la generación (informe del Cuba Study Group, 2026)."
 ],
 "TM": [
  "Turkmenenergo, corporation d’État verticalement intégrée sous contrôle du ministère de l’Énergie et de l’Industrie, assure la production, le transport, le dispatching et la distribution. Les tarifs ne reflètent pas les coûts et sont fortement subventionnés. Source de 2016, à revalider.",
  "Turkmenenergo, a vertically integrated state corporation controlled by the Ministry of Energy and Industry, handles generation, transmission, dispatch and distribution. Tariffs are not cost-reflective and are heavily subsidised. 2016 source, to re-validate.",
  "Turkmenenergo, corporación estatal verticalmente integrada y controlada por el Ministerio de Energía e Industria, se encarga de la generación, el transporte, el despacho y la distribución. Las tarifas no reflejan los costes y están muy subvencionadas. Fuente de 2016, a revalidar."
 ]
};

function runtime(D) {
  function $(id) { return document.getElementById(id); }
  function lg() { try { if (window.I18N3 && I18N3.get && I18N3.get() === 'es') return 2; } catch (e) {} return window.lang === 'fr' ? 0 : 1; }
  function apply() {
    var sc = $('scopCountry'), el = $('costFournisseur'); if (!sc || !el) return;
    var d = D[sc.value]; if (!d) return;
    var t = d[lg()]; if (el.textContent !== t) el.textContent = t;
  }
  function later() { setTimeout(apply, 250); setTimeout(apply, 800); }
  function hook() {
    var sc = $('scopCountry'); if (sc && !sc.__fv19) { sc.__fv19 = 1; sc.addEventListener('change', later); }
    var el = $('costFournisseur');
    if (el && !el.__fv19 && typeof MutationObserver !== 'undefined') { el.__fv19 = 1; new MutationObserver(function () { setTimeout(apply, 0); }).observe(el, { childList: true, characterData: true, subtree: true }); }
  }
  try { var og = window.goPage; if (typeof og === 'function') window.goPage = function (n) { var r = og.apply(this, arguments); if (n === 'scop') { hook(); later(); } return r; }; } catch (e) {}
  try { var ot = window.toggleLang; if (typeof ot === 'function') window.toggleLang = function () { var r = ot.apply(this, arguments); later(); return r; }; } catch (e) {}
  hook(); later();
}
const RT = '<script id="fournisseurs-v19">(' + runtime.toString() + ')(' + JSON.stringify(D) + ');</script>';
const before = s.length;
s = s.slice(0, e) + '\n' + RT + s.slice(e);
const scripts = s.match(/<script(?![^>]*\bsrc=)[^>]*>[\s\S]*?<\/script>/g) || [];
let ok = true;
scripts.forEach(function (x) { const body = x.replace(/^<script[^>]*>/, '').replace(/<\/script>$/, ''); if (!body.trim() || /type="(application\/json|text\/template)"/.test(x)) return; try { new Function(body); } catch (er) { ok = false; console.log('Erreur de syntaxe : ' + er.message); } });
if (!ok) { console.log('ARRET : rien ecrit'); process.exit(1); }
fs.writeFileSync(f, s, 'utf8');
console.log('Pays mis a jour : ' + Object.keys(D).length);
console.log('Taille : ' + before + ' -> ' + s.length + ' octets');
console.log('Syntaxe JS : OK');
