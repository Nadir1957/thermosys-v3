// Thermosys - traduction espagnole de l'AIDE, blocs 26 a 29
// Usage : node update_aide_es.js dist\index.html
// Les phrases anglaises sont lues dans le fichier lui-meme (correspondance exacte),
// les traductions existantes du dictionnaire ne sont jamais ecrasees.
const fs = require('fs');
const f = process.argv[2];
if (!f) { console.log('ARRET : indiquez le fichier'); process.exit(1); }
let s = fs.readFileSync(f, 'utf8');
const before = s.length;
if (s.indexOf('id="lang-es-data-34"') >= 0) { console.log('DEJA FAIT'); process.exit(0); }

function dec(x) {
  return x.replace(/&#(\d+);/g, (m, n) => String.fromCodePoint(+n))
    .replace(/&#x([0-9a-f]+);/gi, (m, n) => String.fromCodePoint(parseInt(n, 16)))
    .replace(/&nbsp;/g, ' ').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&amp;/g, '&');
}

/* ---- traductions, dans l'ordre des noeuds de texte de chaque bloc ---- */
const B = {
  '26. RÉSEAUX': {
    es: '26. REDES — Lista de materiales, equilibrado, red mallada, DXF',
    nodes: [
      'Lista de materiales:',
      'tras un cálculo de red ramificada, la lista da los tubos por diámetro (longitudes), los codos, las tes y las válvulas. Botones «Exportar a CSV» y «Enviar a PRESUPUESTO» (las líneas llegan al presupuesto, los precios quedan por rellenar).',
      'Equilibrado de ramales:',
      'para cada ramal, exceso de presión respecto al circuito más desfavorecido y Kv de la válvula de equilibrado necesaria. Estos resultados y la lista de materiales figuran en la página 2 del PDF del cálculo de la red.',
      'Red mallada:',
      'caudales y presiones de una red con bucles (algoritmo del gradiente global de Todini y Pilati, verificado con el programa EPANET).',
      'Exportación DXF:',
      'esquema desarrollado donde cada tramo se dibuja con su longitud real (1 unidad = 1 m, ramales apilados). No es un plano geométrico: úselo como base de dibujo en su programa de CAD.'
    ]
  },
  '27. CHAUFFAGE': {
    es: '27. CALEFACCIÓN — Importación gbXML',
    nodes: [
      '● El botón de importación lee un archivo .gbxml exportado desde un programa de dibujo (Revit, ArchiCAD, SketchUp…). El archivo se lee en su dispositivo y no se envía a ningún sitio.',
      '● Una tabla de control muestra los locales calefactados encontrados (los locales no calefactados se ignoran). Verifíquela y después transfiera los locales a CALEFACCIÓN.',
      '● Compruebe siempre superficies, alturas y paredes tras la transferencia: el resultado depende de la calidad del dibujo importado.'
    ]
  },
  '28. ESTIMATION HORAIRE': {
    es: '28. ESTIMACIÓN HORARIA — Necesidades anuales hora por hora',
    nodes: [
      'Modo de empleo:',
      '1) cargue el archivo meteorológico .epw de la ciudad; 2) describa el edificio (dimensiones, ventanas por fachada, construcción, acristalamiento); 3) fije el uso (renovación de aire, aportes internos, consignas, reducción nocturna); 4) pulse CALCULAR. El botón «Ejemplo» rellena una vivienda tipo; «Nota imprimible» abre la nota de cálculo.',
      'Resultados:',
      'necesidades anuales de calefacción y refrigeración, puntas horarias, necesidades mensuales y temperatura operativa.',
      'Consigna:',
      'por defecto, la consigna se aplica a la temperatura operativa (media del aire y de las superficies, como en la EN 12831). Puede elegir la consigna sobre el aire.',
      'Límites:',
      'una sola zona a temperatura uniforme, regulación ideal sin límite de potencia, sin humedad ni carga latente, sin puentes térmicos, suelo simplificado. Estimación de ingeniería: no es un cálculo reglamentario ni un programa certificado, y no sustituye a la EN 12831 para dimensionar.',
      'Verificaciones:',
      'el motor reproduce 27 de los 28 resultados de referencia de la ASHRAE 140 (rangos de ejemplo, no criterios oficiales). Comparado con EnergyPlus en 6 viviendas (Argel, Denver): calefacción de +1 % a +9 % (una vivienda aislada a +21 % para cantidades pequeñas), frío subestimado de 7 % a 35 %. Causa probable: la convección exterior de muros y cubierta, cuyo modelo hace variar el frío de 5 % a 24 % en la literatura. Comparado con mediciones reales de dos casas de ensayo alemanas (Holzkirchen, proyectos AIE EBC Anexos 58 y 71, sin ajuste a estas mediciones): temperatura a 0,4–0,9 K; calefacción entre −23 % y +13 % según el ensayo. No validado en clima mediterráneo ni argelino.'
    ]
  },
  '29. CYCLE FRIGORIFIQUE': {
    es: '29. CICLO FRIGORÍFICO — Diagrama log p–h, COP, potencias',
    nodes: [
      'Modo de empleo:',
      '1) elija el refrigerante; 2) fije las temperaturas de evaporación y de condensación, el recalentamiento útil y total, el subenfriamiento y la potencia frigorífica; 3) elija el tipo de compresor (genérico, o scroll calibrado con el Copeland ZP54 en R410A); 4) pulse CALCULAR. «Nota imprimible» abre la nota de cálculo en una página A4, con el diagrama log p–h.',
      'Resultados:',
      'COP, potencia absorbida, caudal másico, temperatura de descarga, cilindrada barrida a instalar y diagrama log p–h del ciclo.',
      'Compresor:',
      'en modo genérico, los rendimientos se estiman si no se introducen. En modo scroll ZP54, el rendimiento volumétrico y el rendimiento eléctrico global se calculan a partir de los datos del fabricante (23 puntos de funcionamiento, relaciones de presión de 1,88 a 6,52).',
      'Límites:',
      'ciclo de una sola etapa, pérdidas de carga despreciadas. La calibración solo vale para el Copeland ZP54 con R410A; para cualquier otro compresor, los resultados son indicativos y deben confirmarse con los datos del fabricante. Estimación de ingeniería, no un programa de selección certificado.',
      'Verificaciones:',
      'las propiedades del fluido provienen de CoolProp (desviación comprobada en 680 casos: 0,2 % como máximo). Para el Copeland ZP54, la capacidad calculada está a 0,67 % de media y 2,4 % como máximo de los datos del fabricante.'
    ]
  }
};

const D = {};
for (const key of Object.keys(B)) {
  const hm = s.indexOf(key);
  /* le titre HTML : repere par la police 12px */
  let h = -1, from = 0;
  while ((from = s.indexOf(key, from)) >= 0) {
    const pre = s.slice(Math.max(0, from - 160), from);
    if (pre.indexOf('font-weight:700;font-size:12px">') >= 0) { h = from; break; }
    from += key.length;
  }
  if (h < 0) { console.log('ARRET : titre du bloc "' + key + '" introuvable'); process.exit(1); }
  /* titre */
  const hs = s.lastIndexOf('font-size:12px">', h) + 'font-size:12px">'.length;
  const he = s.indexOf('</div>', h);
  const heading = dec(s.slice(hs, he));
  const parts = heading.split(' / ');
  if (parts.length !== 2) { console.log('ARRET : titre inattendu : ' + heading); process.exit(1); }
  const icon = parts[0].split(' ')[0];
  const en = parts[1].trim();
  const es = B[key].es;
  [icon, icon + '️', icon.replace(/️/g, '')].forEach(ic => { D[ic + ' ' + en] = ic + ' ' + es; });
  D[en] = es;
  D[icon + ' ' + heading.slice(icon.length).trim()] = icon + ' ' + es;
  /* noeuds de la partie anglaise */
  const i0 = s.indexOf('<i>', he), i1 = s.indexOf('</i>', i0);
  const inner = s.slice(i0 + 3, i1);
  const nodes = [];
  inner.split(/<br\s*\/?>/i).forEach(seg => {
    seg = seg.trim(); if (!seg) return;
    let m = seg.match(/^&#9679;\s*<b>([^<]+)<\/b>\s*([\s\S]*)$/);
    if (m) { nodes.push(dec(m[1]).trim()); if (m[2].trim()) nodes.push(dec(m[2]).trim()); return; }
    m = seg.match(/^&#9679;\s*([\s\S]+)$/);
    if (m) { nodes.push('● ' + dec(m[1]).trim()); return; }
    console.log('ARRET : segment inattendu dans le bloc "' + key + '" : ' + seg.slice(0, 80)); process.exit(1);
  });
  if (nodes.length !== B[key].nodes.length) {
    console.log('ARRET : bloc "' + key + '" : ' + nodes.length + ' phrases trouvees, ' + B[key].nodes.length + ' traductions'); process.exit(1);
  }
  nodes.forEach((n, k) => { D[n] = B[key].nodes[k]; });
  console.log('Bloc ' + key + ' : ' + nodes.length + ' phrases + titre');
}

const js = '\n<script id="lang-es-data-34">\n(window.I18N3=window.I18N3||{dict:{}});\nwindow.I18N3.dict=window.I18N3.dict||{};\n(function(){var D=' + JSON.stringify(D) + ';var t=window.I18N3.dict;Object.keys(D).forEach(function(k){if(!(k in t)){t[k]=D[k];}});})();\n</script>';
const a = s.indexOf('<script id="lang-es-data-33">');
if (a < 0) { console.log('ARRET : script lang-es-data-33 introuvable'); process.exit(1); }
const e = s.indexOf('</script>', a) + '</script>'.length;
s = s.slice(0, e) + js + s.slice(e);
fs.writeFileSync(f, s, 'utf8');
console.log('Entrees ajoutees : ' + Object.keys(D).length + ' | taille ' + before + ' -> ' + s.length);
let bad = 0;
(s.match(/<script(?![^>]*\bsrc=)[^>]*>[\s\S]*?<\/script>/g) || []).forEach(function (x, i) {
  try { new Function(x.replace(/<\/?script[^>]*>/g, '')); } catch (er) { bad++; console.log('ATTENTION script ' + i + ' : ' + er.message); }
});
console.log(bad ? 'Syntaxe : ' + bad + ' probleme(s)' : 'Syntaxe JS : OK');
