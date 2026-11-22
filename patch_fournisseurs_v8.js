// Thermosys - SCOP/COP : fournisseurs et gestionnaires de reseau, corriges et structures (v8, Moyen-Orient et Asie, fin)
// Usage : node patch_fournisseurs_v8.js dist\index.html
const fs = require('fs');
const f = process.argv[2];
if (!f) { console.log('ARRET : indiquez le fichier'); process.exit(1); }
let s = fs.readFileSync(f, 'utf8');
if (s.indexOf('id="fournisseurs-v8"') >= 0) { console.log('DEJA FAIT'); process.exit(0); }
const a = s.indexOf('<script id="fournisseurs-v7">');
if (a < 0) { console.log('ARRET : appliquez d\'abord patch_fournisseurs_v7.js'); process.exit(1); }
const e = s.indexOf('</script>', a) + 9;
const CHK = ' Vérifiez auprès de votre commune ou sur votre facture.';
const D = {
  BH: ["Sans choix : EWA (Electricity and Water Authority), principal fournisseur d’électricité et d’eau du Bahreïn.",
       "No choice: EWA (Electricity and Water Authority), Bahrain’s principal electricity and water provider.",
       "Sin elección: EWA (Electricity and Water Authority), principal proveedor de electricidad y agua de Baréin."],
  LB: ["Selon la zone, sans choix : EDL (Électricité du Liban) assure la distribution dans la plupart des régions ; des concessions privées desservent certaines zones : Électricité de Zahlé (EDZ), Jbeil et Aley (source datant de plusieurs années ; à revalider). Beaucoup de foyers utilisent aussi des générateurs de quartier.",
       "By area, no choice: EDL (Électricité du Liban) runs distribution in most areas; private concessions serve some zones: Électricité de Zahlé (EDZ), Jbeil and Aley (source several years old; to be re-validated). Many households also rely on neighbourhood generators.",
       "Según la zona, sin elección: EDL (Électricité du Liban) distribuye en la mayoría de las regiones; concesiones privadas sirven algunas zonas: Électricité de Zahlé (EDZ), Jbeil y Aley (fuente de hace varios años; por revalidar). Muchos hogares usan también generadores de barrio."],
  CN: ["Selon le territoire, sans choix pour les ménages : réseaux d’État State Grid, China Southern Power Grid et Inner Mongolia Power, chacun dans sa zone désignée, plus quelques petits réseaux locaux. Les tarifs résidentiels sont fixés par l’État.",
       "By territory, no choice for households: state-owned grids State Grid, China Southern Power Grid and Inner Mongolia Power, each in its designated area, plus a few small local grids. Residential tariffs are set by the government.",
       "Según el territorio, sin elección para los hogares: redes estatales State Grid, China Southern Power Grid e Inner Mongolia Power, cada una en su zona designada, más algunas redes locales pequeñas. Las tarifas residenciales las fija el Estado."],
  NP: ["La distribution est assurée par la Nepal Electricity Authority (NEA) : 129 centres de distribution et sous-distribution, 7 bureaux provinciaux et 2 bureaux divisionnaires.",
       "Distribution is run by the Nepal Electricity Authority (NEA): 129 distribution and sub-distribution centres, 7 provincial and 2 divisional offices.",
       "La distribución la realiza la Nepal Electricity Authority (NEA): 129 centros de distribución y subdistribución, 7 oficinas provinciales y 2 divisionales."]
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
    var sc = $('scopCountry'); if (sc && !sc.__fv8) { sc.__fv8 = 1; sc.addEventListener('change', later); }
    var el = $('costFournisseur');
    if (el && !el.__fv8 && typeof MutationObserver !== 'undefined') { el.__fv8 = 1; new MutationObserver(function () { setTimeout(apply, 0); }).observe(el, { childList: true, characterData: true, subtree: true }); }
  }
  try { var og = window.goPage; if (typeof og === 'function') window.goPage = function (n) { var r = og.apply(this, arguments); if (n === 'scop') { hook(); later(); } return r; }; } catch (e) {}
  try { var ot = window.toggleLang; if (typeof ot === 'function') window.toggleLang = function () { var r = ot.apply(this, arguments); later(); return r; }; } catch (e) {}
  hook(); later();
}
const RT = '<script id="fournisseurs-v8">(' + runtime.toString() + ')(' + JSON.stringify(D) + ');</script>';
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
