const fs = require('fs');
const path = require('path');

const distFile = path.join(__dirname, 'dist', 'index.html');
let h = fs.readFileSync(distFile, 'utf8');

// Supprimer ancien patch si présent
if(h.includes('scop-countries-en')) {
  var s=h.lastIndexOf('<script',h.indexOf('scop-countries-en'));
  var e=h.indexOf('</script>',s)+9;
  h=h.substring(0,s)+h.substring(e);
}

// Dictionnaire code ISO -> nom EN pour les pays encore en FR
var EN_NAMES = {
  "SN":"Senegal",
  "CI":"Ivory Coast",
  "CZ":"Czech Republic",
  "SI":"Slovenia",
  "BA":"Bosnia-Herzegovina",
  "ME":"Montenegro",
  "MK":"North Macedonia",
  "GR":"Greece",
  "BY":"Belarus",
  "MN":"Mongolia",
  "KP":"North Korea",
  "TW":"Taiwan",
  "NP":"Nepal",
  "TH":"Thailand",
  "ID":"Indonesia",
  "PG":"Papua New Guinea",
  "SB":"Solomon Islands",
  "FM":"Micronesia",
  "MH":"Marshall Islands",
  "NZ":"New Zealand",
  "UZ":"Uzbekistan",
  "TM":"Turkmenistan",
  "KW":"Kuwait",
  "BH":"Bahrain",
  "YE":"Yemen",
  "ET":"Ethiopia",
  "GQ":"Equatorial Guinea",
  "CF":"Central African Republic",
  "BJ":"Benin",
  "GN":"Guinea",
  "GW":"Guinea-Bissau",
  "ST":"Sao Tome and Principe",
  "ER":"Eritrea",
  "PE":"Peru",
  "EC":"Ecuador",
  "DO":"Dominican Republic",
  "HT":"Haiti",
  "JM":"Jamaica",
  "TT":"Trinidad and Tobago",
  "GF":"French Guiana",
  "NC":"New Caledonia",
  "PF":"French Polynesia",
  "RE":"Reunion Island"
};

var lines = [
'(function(){',
'  var EN=' + JSON.stringify(EN_NAMES) + ';',
'  var lastLang=null;',

'  function translateCountries(lang){',
'    var sc=document.getElementById("scopCountry");',
'    if(!sc)return;',
'    Array.from(sc.options).forEach(function(o){',
'      var code=o.value;',
'      if(lang==="en"&&EN[code]){',
'        // Garder le drapeau emoji, remplacer le nom
'        var flag=o.text.replace(/[^\\uD800-\\uDFFF\\uDC00-\\uDFFF]/g,"").trim();',
'        // Extraire uniquement les surrogate pairs (drapeaux)',
'        var matches=o.text.match(/[\\uD83C][\\uDDE0-\\uDDFF][\\uD83C][\\uDDE0-\\uDDFF]/g);',
'        var flagStr=matches?matches.join(""):"";',
'        o.text=EN[code]+(flagStr?" "+flagStr:"");',
'      }',
'    });',
'  }',

'  function poll(){',
'    var cur=window.lang||document.documentElement.getAttribute("lang")||"fr";',
'    if(cur!==lastLang){',
'      lastLang=cur;',
'      translateCountries(cur);',
'    }',
'  }',

'  document.addEventListener("DOMContentLoaded",function(){',
'    setInterval(poll,500);',
'    setTimeout(function(){translateCountries(window.lang||"fr");},1000);',
'  });',
'})();'
];

var scriptContent = lines.join('\n');

// Verifier non-ASCII
var nonAscii=0;
for(var i=0;i<scriptContent.length;i++) if(scriptContent.charCodeAt(i)>127) nonAscii++;
console.log('Non-ASCII:', nonAscii);

var newScript='<script id="scop-countries-en">\n'+scriptContent+'\n</script>';
var insertPos=h.lastIndexOf('</body>');
if(insertPos===-1) insertPos=h.length;
var result=h.substring(0,insertPos)+newScript+'\n'+h.substring(insertPos);
fs.writeFileSync(distFile,result,'utf8');
console.log('OK - scop-countries-en applique');
console.log('Pays traduits:', Object.keys(EN_NAMES).length);
