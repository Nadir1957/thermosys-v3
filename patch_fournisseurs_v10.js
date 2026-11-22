// Thermosys - SCOP/COP : fournisseurs et gestionnaires de reseau, corriges et structures (v10, Afrique du Nord)
// Usage : node patch_fournisseurs_v10.js dist\index.html
const fs = require('fs');
const f = process.argv[2];
if (!f) { console.log('ARRET : indiquez le fichier'); process.exit(1); }
let s = fs.readFileSync(f, 'utf8');
if (s.indexOf('id="fournisseurs-v10"') >= 0) { console.log('DEJA FAIT'); process.exit(0); }
const a = s.indexOf('<script id="fournisseurs-v9">');
if (a < 0) { console.log('ARRET : appliquez d\'abord patch_fournisseurs_v9.js'); process.exit(1); }
const e = s.indexOf('</script>', a) + 9;
const CHK = ' Vérifiez auprès de votre commune ou sur votre facture.';
const D = {
  DZ: ["Sans choix : Sonelgaz Distribution (Société algérienne de distribution de l’électricité et du gaz) détient la concession de distribution (CREG). Elle résulte de la réorganisation de 2017 (fusion des anciennes SDE et SDO ; la SDA, Alger, reste filiale).",
       "No choice: Sonelgaz Distribution (Algerian Electricity and Gas Distribution Company) holds the distribution concession (CREG). It results from the 2017 reorganisation (former SDE and SDO merged; SDA, Algiers, remains a subsidiary).",
       "Sin elección: Sonelgaz Distribution (Sociedad argelina de distribución de electricidad y gas) tiene la concesión de distribución (CREG). Resulta de la reorganización de 2017 (fusión de las antiguas SDE y SDO; SDA, Argel, sigue como filial)."],
  MA: ["Selon la ville, sans choix : ONEE (distribution directe dans les zones rurales et vente aux distributeurs urbains), 7 régies municipales (Marrakech, El Jadida, Safi, Fès, Meknès, Kénitra, Larache) et 4 opérateurs privés délégués (Casablanca, Rabat, Tanger, Tétouan). Réforme de la distribution en cours.",
       "By city, no choice: ONEE (direct distribution in rural areas and supply to urban distributors), 7 municipal régies (Marrakech, El Jadida, Safi, Fès, Meknès, Kenitra, Larache) and 4 private delegated operators (Casablanca, Rabat, Tangier, Tétouan). Distribution reform under way.",
       "Según la ciudad, sin elección: ONEE (distribución directa en zonas rurales y suministro a los distribuidores urbanos), 7 regies municipales (Marrakech, El Jadida, Safi, Fez, Mequinez, Kenitra, Larache) y 4 operadores privados delegados (Casablanca, Rabat, Tánger, Tetuán). Reforma de la distribución en curso."],
  TN: ["Sans choix : la STEG (Société tunisienne de l’électricité et du gaz) assure la distribution locale et la vente d’électricité, en monopole légal. Le transport relève aussi de la STEG.",
       "No choice: STEG (Tunisian Company of Electricity and Gas) runs local distribution and sales of electricity under a legal monopoly. Transmission is also with STEG.",
       "Sin elección: STEG (Sociedad tunecina de electricidad y gas) realiza la distribución local y la venta de electricidad, en monopolio legal. El transporte también corresponde a STEG."],
  EG: ["Selon le gouvernorat, sans choix : 9 sociétés de distribution : Nord du Caire, Sud du Caire (Le Caire, Gizeh), Alexandrie, Buhaira, Delta Nord, Delta Sud, Moyenne-Égypte, Haute-Égypte et Canal (Charqiya, Sinaï, Ismaïlia, Port-Saïd, Suez). Régulateur : EgyptERA.",
       "By governorate, no choice: 9 distribution companies: North Cairo, South Cairo (Cairo, Giza), Alexandria, Buhaira, North Delta, South Delta, Middle Egypt, Upper Egypt and Canal (Sharqia, Sinai, Ismailia, Port Said, Suez). Regulator: EgyptERA.",
       "Según la gobernación, sin elección: 9 empresas de distribución: Norte de El Cairo, Sur de El Cairo (El Cairo, Guiza), Alejandría, Buhaira, Delta Norte, Delta Sur, Egipto Medio, Alto Egipto y Canal (Sharqia, Sinaí, Ismailía, Port Said, Suez). Regulador: EgyptERA."]
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
    var sc = $('scopCountry'); if (sc && !sc.__fv10) { sc.__fv10 = 1; sc.addEventListener('change', later); }
    var el = $('costFournisseur');
    if (el && !el.__fv10 && typeof MutationObserver !== 'undefined') { el.__fv10 = 1; new MutationObserver(function () { setTimeout(apply, 0); }).observe(el, { childList: true, characterData: true, subtree: true }); }
  }
  try { var og = window.goPage; if (typeof og === 'function') window.goPage = function (n) { var r = og.apply(this, arguments); if (n === 'scop') { hook(); later(); } return r; }; } catch (e) {}
  try { var ot = window.toggleLang; if (typeof ot === 'function') window.toggleLang = function () { var r = ot.apply(this, arguments); later(); return r; }; } catch (e) {}
  hook(); later();
}
const RT = '<script id="fournisseurs-v10">(' + runtime.toString() + ')(' + JSON.stringify(D) + ');</script>';
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
