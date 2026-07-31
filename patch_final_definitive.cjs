const fs = require('fs');
const path = require('path');

const distFile = path.join(__dirname, 'dist', 'index.html');
let h = fs.readFileSync(distFile, 'utf8');

// Supprimer anciens scripts re2020/bilingual injectés
['re2020-trad-v2','re2020-trad-v3','bilingual-carrier-proto'].forEach(function(id){
  while(h.includes(id)){
    var s=h.lastIndexOf('<script',h.indexOf(id));
    var e=h.indexOf('</script>',s)+9;
    h=h.substring(0,s)+h.substring(e);
  }
});

// Nouveau script compact avec UNIQUEMENT les paires manquantes
// Toutes les clés en \uXXXX - encodage ASCII pur
var MISSING = [
["\u0043\u006F\u006E\u0066\u0069\u0072\u006D\u0065\u0072\u0020\u0071\u0075\u0065\u0020\u006C\u0061\u0020\u0070\u006F\u006D\u0070\u0065\u0020\u0074\u006F\u0075\u0072\u006E\u0065\u0020\u0028\u0061\u006D\u0070\u00E8\u0072\u0065\u006D\u00E8\u0074\u0072\u0065\u0020\u006F\u0075\u0020\u0062\u006F\u0072\u006E\u0069\u0065\u0072\u0029","Confirm pump is running (ammeter or terminal block)"],
["\u0056\u00E9\u0072\u0069\u0066\u0069\u0065\u0072\u0020\u0070\u0072\u0065\u0073\u0073\u0069\u006F\u006E\u0020\u006D\u0061\u006E\u006F\u006D\u00E8\u0074\u0072\u0065\u0020\u0063\u00F4\u0074\u00E9\u0020\u0061\u0073\u0070\u0069\u0072\u0061\u0074\u0069\u006F\u006E\u0020\u0070\u006F\u006D\u0070\u0065","Check pressure gauge on pump suction side"],
["\u0043\u006F\u006E\u0073\u0069\u0067\u006E\u0065\u0020\u0064\u00E9\u0062\u0069\u0074\u0020\u006D\u0069\u006E\u0020\u003A\u0020\u0070\u0061\u0072\u0061\u006D\u00E8\u0074\u0072\u0065\u0020\u0046\u004C\u0057\u0053\u0045\u0054\u0020\u0069\u006E\u0020\u0043\u0043\u004E","Min flow setpoint: parameter FLWSET in CCN"],
["FLWSET\u0020\u0064\u0061\u006E\u0073\u0020\u0043\u0043\u004E","FLWSET in CCN"],
["\u0070\u0061\u0072\u0061\u006D\u00E8\u0074\u0072\u0065\u0020\u0046\u004C\u0057\u0053\u0045\u0054\u0020\u0064\u0061\u006E\u0073\u0020\u0043\u0043\u004E","parameter FLWSET in CCN"],
["jj/mm/aaaa","dd/mm/yyyy"],
["\u004D\u0045\u0053\u0020\u0048\u0059\u0044\u0052\u0041\u0055\u004C\u0049\u0051\u0055\u0045","Hydraulic Commissioning"],
["\u004D\u0069\u0073\u0065\u0020\u0065\u006E\u0020\u0053\u0065\u0072\u0076\u0069\u0063\u0065\u0020\u0048\u0079\u0064\u0072\u0061\u0075\u006C\u0069\u0071\u0075\u0065","Hydraulic Commissioning"],
["\u0050\u0052\u00C9\u002D\u004D\u0049\u0053\u0045\u0020\u0045\u004E\u0020\u0053\u0045\u0052\u0056\u0049\u0043\u0045","PRE-COMMISSIONING"],
["\u004D\u0049\u0053\u0045\u0020\u0045\u004E\u0020\u0053\u0045\u0052\u0056\u0049\u0043\u0045\u0020\u0050\u004F\u004D\u0050\u0045","PUMP COMMISSIONING"]
];

var scriptContent = [
'(function(){',
'var M='+JSON.stringify(MISSING)+';',
'var busy=false,last=null,snap=null;',
'function isEN(){return(window.lang||document.documentElement.getAttribute("lang")||"fr")==="en";}',
'function applyM(root,fwd){',
'  if(!root)return;',
'  var w=document.createTreeWalker(root,NodeFilter.SHOW_TEXT,null,false),nodes=[],n;',
'  while(n=w.nextNode())nodes.push(n);',
'  nodes.forEach(function(nd){',
'    var o=nd.textContent,t=o;',
'    M.forEach(function(p){var s=fwd?p[0]:p[1],d=fwd?p[1]:p[0];if(t.indexOf(s)!==-1)t=t.split(s).join(d);});',
'    if(t!==o)nd.textContent=t;',
'  });',
'}',
'function toEN(){',
'  if(!isEN()||busy)return;',
'  busy=true;',
'  var pg=document.getElementById("pg-rt2025");',
'  if(pg){if(!snap)snap=pg.innerHTML;applyM(pg,true);}',
'  setTimeout(function(){busy=false;},200);',
'}',
'function toFR(){',
'  if(isEN()||busy)return;',
'  busy=true;',
'  var pg=document.getElementById("pg-rt2025");',
'  if(pg&&snap)pg.innerHTML=snap;',
'  setTimeout(function(){busy=false;},200);',
'}',
'function poll(){',
'  var c=window.lang||document.documentElement.getAttribute("lang")||"fr";',
'  if(c!==last){last=c;if(c==="en")toEN();else toFR();}',
'}',
'document.addEventListener("DOMContentLoaded",function(){',
'  setTimeout(function(){var pg=document.getElementById("pg-rt2025");if(pg&&!snap)snap=pg.innerHTML;},4000);',
'  setInterval(poll,400);',
'  [2000,3000,5000,7000].forEach(function(t){setTimeout(toEN,t);});',
'});',
'})();'
].join('\n');

var newScript = '<script id="re2020-missing-v4">\n' + scriptContent + '\n</script>';

var insertPos = h.lastIndexOf('</body>');
if(insertPos === -1) insertPos = h.length;
var result = h.substring(0,insertPos) + newScript + '\n' + h.substring(insertPos);

fs.writeFileSync(distFile, result, 'utf8');
console.log('OK - patch_final_definitive applique');
console.log('re2020-missing-v4:', (result.match(/re2020-missing-v4/g)||[]).length, 'occurrence(s)');
