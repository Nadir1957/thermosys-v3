// Thermosys - SCOP/COP : fournisseurs et gestionnaires de reseau, corriges et structures (v9, Ameriques, partie 1)
// Usage : node patch_fournisseurs_v9.js dist\index.html
const fs = require('fs');
const f = process.argv[2];
if (!f) { console.log('ARRET : indiquez le fichier'); process.exit(1); }
let s = fs.readFileSync(f, 'utf8');
if (s.indexOf('id="fournisseurs-v9"') >= 0) { console.log('DEJA FAIT'); process.exit(0); }
const a = s.indexOf('<script id="fournisseurs-v8">');
if (a < 0) { console.log('ARRET : appliquez d\'abord patch_fournisseurs_v8.js'); process.exit(1); }
const e = s.indexOf('</script>', a) + 9;
const CHK = ' Vérifiez auprès de votre commune ou sur votre facture.';
const D = {
  MX: ["Les ménages n’ont pas le choix : CFE Suministro Básico (CFE) fournit tout usager techniquement raccordable. Les fournisseurs qualifiés ne servent que les gros consommateurs. Tarifs fixés par le régulateur CRE.",
       "No choice for households: CFE Suministro Básico (CFE) serves every technically connectable user. Qualified suppliers serve large consumers only. Tariffs set by the regulator CRE.",
       "Sin elección para los hogares: CFE Suministro Básico (CFE) atiende a todo usuario técnicamente conectable. Los suministradores calificados solo atienden a grandes consumidores. Tarifas fijadas por el regulador CRE."],
  BR: ["Selon la zone de concession : 105 distributeurs enregistrés auprès de l’ANEEL (54 concessionnaires, 38 permissionnaires, 13 coopératives d’électrification rurale), en général régionaux. Votre distributeur figure sur votre facture.",
       "By concession area: 105 distributors registered with ANEEL (54 concessionaires, 38 permission holders, 13 rural electrification cooperatives), generally regional. Your distributor is shown on your bill.",
       "Según el área de concesión: 105 distribuidoras registradas en ANEEL (54 concesionarias, 38 permisionarias, 13 cooperativas de electrificación rural), en general regionales. Su distribuidora figura en la factura."],
  CL: ["Selon la zone : 28 sociétés de distribution classées en 12 zones types par la CNE. Principales : CGE, Enel Distribución Chile, Chilquinta, Frontel, Saesa, Edelmag, ainsi que des coopératives (Coopelan, Copelec…).",
       "By area: 28 distribution companies grouped into 12 typical areas by the CNE. Main ones: CGE, Enel Distribución Chile, Chilquinta, Frontel, Saesa, Edelmag, plus cooperatives (Coopelan, Copelec…).",
       "Según la zona: 28 empresas de distribución agrupadas en 12 áreas típicas por la CNE. Principales: CGE, Enel Distribución Chile, Chilquinta, Frontel, Saesa, Edelmag, además de cooperativas (Coopelan, Copelec…)."],
  AR: ["Selon la zone : Edenor et Edesur desservent l’agglomération de Buenos Aires (AMBA, sous contrôle de l’ENRE) ; ailleurs, la distribution relève des provinces (distributeurs provinciaux ou coopératives). Vérifiez votre distributeur sur votre facture.",
       "By area: Edenor and Edesur serve the Buenos Aires metropolitan area (AMBA, under ENRE control); elsewhere distribution is a provincial matter (provincial distributors or cooperatives). Check your distributor on your bill.",
       "Según la zona: Edenor y Edesur sirven el Área Metropolitana de Buenos Aires (AMBA, bajo control del ENRE); en el resto, la distribución es provincial (distribuidoras provinciales o cooperativas). Compruebe su distribuidora en la factura."],
  CO: ["Selon la région : plus de 100 entreprises de distribution (130 sur la liste de la CREG), dont environ 30 assurent l’essentiel du service. Grands groupes : EPM (Antioquia, Afinia), Grupo Energía Bogotá (Bogotá et Cundinamarca), Empresa de Energía de Pereira (Air-e dans les Caraïbes). Vérifiez votre opérateur sur votre facture.",
       "By region: more than 100 distribution companies (130 on the CREG list), about 30 of which provide most of the service. Large groups: EPM (Antioquia, Afinia), Grupo Energía Bogotá (Bogotá and Cundinamarca), Empresa de Energía de Pereira (Air-e on the Caribbean coast). Check your operator on your bill.",
       "Según la región: más de 100 empresas de distribución (130 en la lista de la CREG), de las que unas 30 prestan la mayor parte del servicio. Grandes grupos: EPM (Antioquia, Afinia), Grupo Energía Bogotá (Bogotá y Cundinamarca), Empresa de Energía de Pereira (Air-e en el Caribe). Compruebe su operador en la factura."],
  PE: ["Selon la zone : 23 sociétés de distribution (2023). Principales par nombre de clients : Enel Distribución Perú (Lima), Luz del Sur, Hidrandina, Electrocentro, Electro Sur Este, Electro Oriente. Vérifiez votre société sur votre facture.",
       "By area: 23 distribution companies (2023). Largest by customers: Enel Distribución Perú (Lima), Luz del Sur, Hidrandina, Electrocentro, Electro Sur Este, Electro Oriente. Check your company on your bill.",
       "Según la zona: 23 empresas de distribución (2023). Mayores por clientes: Enel Distribución Perú (Lima), Luz del Sur, Hidrandina, Electrocentro, Electro Sur Este, Electro Oriente. Compruebe su empresa en la factura."]
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
    var sc = $('scopCountry'); if (sc && !sc.__fv9) { sc.__fv9 = 1; sc.addEventListener('change', later); }
    var el = $('costFournisseur');
    if (el && !el.__fv9 && typeof MutationObserver !== 'undefined') { el.__fv9 = 1; new MutationObserver(function () { setTimeout(apply, 0); }).observe(el, { childList: true, characterData: true, subtree: true }); }
  }
  try { var og = window.goPage; if (typeof og === 'function') window.goPage = function (n) { var r = og.apply(this, arguments); if (n === 'scop') { hook(); later(); } return r; }; } catch (e) {}
  try { var ot = window.toggleLang; if (typeof ot === 'function') window.toggleLang = function () { var r = ot.apply(this, arguments); later(); return r; }; } catch (e) {}
  hook(); later();
}
const RT = '<script id="fournisseurs-v9">(' + runtime.toString() + ')(' + JSON.stringify(D) + ');</script>';
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
