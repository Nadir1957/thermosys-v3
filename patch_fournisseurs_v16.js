// Thermosys - SCOP/COP : fournisseurs et gestionnaires de reseau, corriges et structures (v16, Amerique latine, suite)
// Usage : node patch_fournisseurs_v16.js dist\index.html
const fs = require('fs');
const f = process.argv[2];
if (!f) { console.log('ARRET : indiquez le fichier'); process.exit(1); }
let s = fs.readFileSync(f, 'utf8');
if (s.indexOf('id="fournisseurs-v16"') >= 0) { console.log('DEJA FAIT'); process.exit(0); }
const a = s.indexOf('<script id="fournisseurs-v15">');
if (a < 0) { console.log('ARRET : appliquez d\'abord patch_fournisseurs_v15.js'); process.exit(1); }
const e = s.indexOf('</script>', a) + 9;
const CHK = ' Vérifiez auprès de votre commune ou sur votre facture.';
const D = {
  UY: ["Réseau : la distribution est assurée par l’entité d’État UTE ; le régulateur URSEA contrôle la qualité du service et traite les réclamations.",
       "Grid: distribution is provided by the state entity UTE; the regulator URSEA oversees service quality and handles complaints.",
       "Red: la distribución la presta el ente estatal UTE; el regulador URSEA fiscaliza la calidad del servicio y resuelve reclamos."],
  PY: ["ANDE (Administración Nacional de Electricidad), entreprise d’État, gère la commercialisation et le service aux clients : plus de 1,63 million de contrats actifs, couverture électrique de 99 % du pays (2019).",
       "ANDE (National Electricity Administration), a state company, runs sales and customer service: more than 1.63 million active contracts, 99% national electricity coverage (2019).",
       "ANDE (Administración Nacional de Electricidad), empresa estatal, gestiona la comercialización y la atención a clientes: más de 1,63 millones de contratos activos, cobertura eléctrica del 99 % del país (2019)."],
  CR: ["Selon la zone, sans choix : ICE (zones non concédées, souvent éloignées), CNFL (principale distributrice), JASEC (Cartago), ESPH (Heredia) et 4 coopératives rurales : Coopesantos, Coopelesca, Coopealfaroruiz et Coopeguanacaste. Régulateur : ARESEP.",
       "By area, no choice: ICE (unconceded, often remote areas), CNFL (main distributor), JASEC (Cartago), ESPH (Heredia) and 4 rural cooperatives: Coopesantos, Coopelesca, Coopealfaroruiz and Coopeguanacaste. Regulator: ARESEP.",
       "Según la zona, sin elección: ICE (zonas no concesionadas, a menudo alejadas), CNFL (principal distribuidora), JASEC (Cartago), ESPH (Heredia) y 4 cooperativas rurales: Coopesantos, Coopelesca, Coopealfaroruiz y Coopeguanacaste. Regulador: ARESEP."],
  EC: ["Selon la province : CNEL EP (11 unités de négociation, environ 48 % des clients du pays, fin 2023) et d’autres entreprises électriques régionales ou municipales (par exemple Quito). Votre entreprise figure sur votre facture.",
       "By province: CNEL EP (11 business units, about 48% of the country’s customers, end 2023) and other regional or municipal electricity companies (for example Quito). Your company is shown on your bill.",
       "Según la provincia: CNEL EP (11 unidades de negocio, cerca del 48 % de los clientes del país, finales de 2023) y otras empresas eléctricas regionales o municipales (por ejemplo Quito). Su empresa figura en la factura."],
  BO: ["Selon le département, sans choix : DELAPAZ (La Paz, El Alto), CRE (Santa Cruz), ELFEC (Cochabamba), ENDE (Oruro, Beni, Pando), SEPSA, CESSA, SETAR et autres. Le régulateur fixe les prix maximums de distribution tous les quatre ans (source 2023).",
       "By department, no choice: DELAPAZ (La Paz, El Alto), CRE (Santa Cruz), ELFEC (Cochabamba), ENDE (Oruro, Beni, Pando), SEPSA, CESSA, SETAR and others. The regulator sets maximum distribution prices every four years (2023 source).",
       "Según el departamento, sin elección: DELAPAZ (La Paz, El Alto), CRE (Santa Cruz), ELFEC (Cochabamba), ENDE (Oruro, Beni, Pando), SEPSA, CESSA, SETAR y otras. El regulador fija precios máximos de distribución cada cuatro años (fuente de 2023)."],
  GT: ["Selon la zone : EEGSA (capitale), Deocsa et Deorsa (reste du pays) (source 2015, à revalider). Régulateur : CNEE.",
       "By area: EEGSA (capital), Deocsa and Deorsa (rest of the country) (2015 source, to be re-validated). Regulator: CNEE.",
       "Según la zona: EEGSA (capital), Deocsa y Deorsa (resto del país) (fuente de 2015, por revalidar). Regulador: CNEE."],
  SV: ["Selon la zone : CAESS (San Salvador), EEO, Deusem et CLESA (source 2015, à revalider). Régulateur : SIGET.",
       "By area: CAESS (San Salvador), EEO, Deusem and CLESA (2015 source, to be re-validated). Regulator: SIGET.",
       "Según la zona: CAESS (San Salvador), EEO, Deusem y CLESA (fuente de 2015, por revalidar). Regulador: SIGET."],
  HN: ["Sans choix : ENEE (Empresa Nacional de Energía Eléctrica), entreprise d’État, dessert la capitale (source 2015, à revalider).",
       "No choice: ENEE (National Electric Power Company), a state company, serves the capital (2015 source, to be re-validated).",
       "Sin elección: ENEE (Empresa Nacional de Energía Eléctrica), empresa estatal, sirve a la capital (fuente de 2015, por revalidar)."],
  PA: ["Selon la zone : ENSA (Elektra Noreste, est et une partie de la capitale), Edemet (région métropolitaine) et Edechi (Chiriquí) (source 2015, à revalider). Régulateur : ASEP.",
       "By area: ENSA (Elektra Noreste, east and part of the capital), Edemet (metropolitan area) and Edechi (Chiriquí) (2015 source, to be re-validated). Regulator: ASEP.",
       "Según la zona: ENSA (Elektra Noreste, este y parte de la capital), Edemet (área metropolitana) y Edechi (Chiriquí) (fuente de 2015, por revalidar). Regulador: ASEP."]
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
    var sc = $('scopCountry'); if (sc && !sc.__fv16) { sc.__fv16 = 1; sc.addEventListener('change', later); }
    var el = $('costFournisseur');
    if (el && !el.__fv16 && typeof MutationObserver !== 'undefined') { el.__fv16 = 1; new MutationObserver(function () { setTimeout(apply, 0); }).observe(el, { childList: true, characterData: true, subtree: true }); }
  }
  try { var og = window.goPage; if (typeof og === 'function') window.goPage = function (n) { var r = og.apply(this, arguments); if (n === 'scop') { hook(); later(); } return r; }; } catch (e) {}
  try { var ot = window.toggleLang; if (typeof ot === 'function') window.toggleLang = function () { var r = ot.apply(this, arguments); later(); return r; }; } catch (e) {}
  hook(); later();
}
const RT = '<script id="fournisseurs-v16">(' + runtime.toString() + ')(' + JSON.stringify(D) + ');</script>';
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
