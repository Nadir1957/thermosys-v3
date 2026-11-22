// Thermosys - SCOP/COP : fournisseurs et gestionnaires de reseau, corriges et structures (v14, LU, KW, RU)
// Usage : node patch_fournisseurs_v14.js dist\index.html
const fs = require('fs');
const f = process.argv[2];
if (!f) { console.log('ARRET : indiquez le fichier'); process.exit(1); }
let s = fs.readFileSync(f, 'utf8');
if (s.indexOf('id="fournisseurs-v14"') >= 0) { console.log('DEJA FAIT'); process.exit(0); }
const a = s.indexOf('<script id="fournisseurs-v13">');
if (a < 0) { console.log('ARRET : appliquez d\'abord patch_fournisseurs_v13.js'); process.exit(1); }
const e = s.indexOf('</script>', a) + 9;
const CHK = ' Vérifiez auprès de votre commune ou sur votre facture.';
const D = {
  LU: ["Fournisseur au choix pour tout consommateur (12 fournisseurs actifs sur 19 autorisés ; résidentiels : Enovos, Eida, LEO, NordENERGIE, Steinergy, Electris, Sudstroum). Réseau selon la commune : Creos (la plus grande partie du pays), Ville de Diekirch, Ville d’Ettelbruck, Sudstroum (Esch-sur-Alzette) et Hoffmann Frères (Mersch). Régulateur : ILR.",
       "Free choice of supplier for every consumer (12 active suppliers out of 19 authorised; residential: Enovos, Eida, LEO, NordENERGIE, Steinergy, Electris, Sudstroum). Grid by municipality: Creos (most of the country), City of Diekirch, City of Ettelbruck, Sudstroum (Esch-sur-Alzette) and Hoffmann Frères (Mersch). Regulator: ILR.",
       "Libre elección de suministrador para todo consumidor (12 suministradores activos de 19 autorizados; residenciales: Enovos, Eida, LEO, NordENERGIE, Steinergy, Electris, Sudstroum). Red según el municipio: Creos (la mayor parte del país), Ciudad de Diekirch, Ciudad de Ettelbruck, Sudstroum (Esch-sur-Alzette) y Hoffmann Frères (Mersch). Regulador: ILR."],
  KW: ["Sans choix : le secteur est sous contrôle de l’État. Le ministère de l’Électricité, de l’Eau et des Énergies renouvelables (MEW) assure l’approvisionnement, la facturation et la tarification. Il n’existe pas de marché de détail libéralisé.",
       "No choice: the sector is state-controlled. The Ministry of Electricity, Water and Renewable Energy (MEW) handles supply, billing and tariffs. There is no liberalised retail market.",
       "Sin elección: el sector está bajo control estatal. El Ministerio de Electricidad, Agua y Energías Renovables (MEW) gestiona el suministro, la facturación y las tarifas. No existe un mercado minorista liberalizado."],
  RU: ["Selon le territoire : chaque région a un fournisseur garanti (désigné par appel d’offres, tous les trois ans) qui doit contracter avec tout client de sa zone. Le choix d’un autre fournisseur est possible en principe, mais les tarifs résidentiels restent régulés. Réseaux : groupe Rosseti (filiales régionales) et sociétés de réseau territoriales ; haute tension : Federal Grid Company. Source ancienne, à revalider.",
       "By territory: each region has a guaranteeing supplier (chosen by tender every three years) that must contract with any customer in its area. Choosing another supplier is possible in principle, but residential tariffs remain regulated. Grids: Rosseti group (regional subsidiaries) and territorial grid companies; high voltage: Federal Grid Company. Older source, to be re-validated.",
       "Según el territorio: cada región tiene un suministrador garante (elegido por licitación cada tres años) que debe contratar con cualquier cliente de su zona. Elegir otro suministrador es posible en principio, pero las tarifas residenciales siguen reguladas. Redes: grupo Rosseti (filiales regionales) y empresas de red territoriales; alta tensión: Federal Grid Company. Fuente antigua, por revalidar."]
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
    var sc = $('scopCountry'); if (sc && !sc.__fv14) { sc.__fv14 = 1; sc.addEventListener('change', later); }
    var el = $('costFournisseur');
    if (el && !el.__fv14 && typeof MutationObserver !== 'undefined') { el.__fv14 = 1; new MutationObserver(function () { setTimeout(apply, 0); }).observe(el, { childList: true, characterData: true, subtree: true }); }
  }
  try { var og = window.goPage; if (typeof og === 'function') window.goPage = function (n) { var r = og.apply(this, arguments); if (n === 'scop') { hook(); later(); } return r; }; } catch (e) {}
  try { var ot = window.toggleLang; if (typeof ot === 'function') window.toggleLang = function () { var r = ot.apply(this, arguments); later(); return r; }; } catch (e) {}
  hook(); later();
}
const RT = '<script id="fournisseurs-v14">(' + runtime.toString() + ')(' + JSON.stringify(D) + ');</script>';
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
