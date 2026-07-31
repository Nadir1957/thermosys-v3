const fs = require('fs');
const path = require('path');

const distFile = path.join(__dirname, 'dist', 'index.html');
let h = fs.readFileSync(distFile, 'utf8');

// Supprimer ancien patch
if(h.includes('tewi-trad-v1')) {
  var s=h.lastIndexOf('<script',h.indexOf('tewi-trad-v1'));
  var e=h.indexOf('</script>',s)+9;
  h=h.substring(0,s)+h.substring(e);
}

// DICT TEWI en ASCII pur
var DICT = [
  ["R\u00e9frig\u00e9rant :","Refrigerant:"],
  ["Taux de fuite %/an :","Leak rate %/yr:"],
  ["R\u00e9cup. fin vie % :","End of life recovery %:"],
  ["R\u00e9seau \u00e9lectrique :","Electrical grid:"],
  ["kgCO2/an","kgCO2/yr"],
  ["tCO2/kWfroid","tCO2/kWcold"],
  ["Inspection annuelle","Annual inspection"],
  ["TEWI = Impact direct (fuites frigorig\u00e8nes) + Impact indirect (consommation \u00e9lectrique)","TEWI = Direct impact (refrigerant leaks) + Indirect impact (electricity consumption)"],
  ["Statut F-Gas","F-Gas Status"],
  ["Algeria / Alg\u00e9rie","Algeria"],
  ["Morocco / Maroc","Morocco"],
  ["Tunisia / Tunisie","Tunisia"],
  ["Saudi Arabia / Arabie Saoudite","Saudi Arabia"],
  ["UAE / Emirats Arabes","UAE"],
  ["EU-27 avg. / UE-27 moy.","EU-27 avg."],
  ["Germany / Allemagne","Germany"],
  ["Italy / Italie","Italy"],
  ["Spain / Espagne","Spain"],
  ["United Kingdom / Royaume-Uni","United Kingdom"],
  ["China / Chine","China"],
  ["Japan / Japon","Japan"],
  ["Brazil / Br\u00e9sil","Brazil"],
  ["Australia / Australie","Australia"],
  ["Taiwan","Taiwan"],
];

var lines = [
'(function(){',
'  var D='+JSON.stringify(DICT)+';',
'  var busy=false,last=null;',
'  function isEN(){return(window.lang||document.documentElement.getAttribute("lang")||"fr")==="en";}',
'  function applyTEWI(root){',
'    if(!root)return;',
'    var w=document.createTreeWalker(root,NodeFilter.SHOW_TEXT,null,false),nodes=[],n;',
'    while(n=w.nextNode())nodes.push(n);',
'    nodes.forEach(function(nd){',
'      var o=nd.textContent,t=o;',
'      D.forEach(function(p){if(t.indexOf(p[0])!==-1)t=t.split(p[0]).join(p[1]);});',
'      if(t!==o)nd.textContent=t;',
'    });',
'  }',
'  function doTrad(){',
'    if(!isEN()||busy)return;',
'    busy=true;',
'    var pf=document.getElementById("pg-fluides");',
'    if(pf)applyTEWI(pf);',
'    setTimeout(function(){busy=false;},200);',
'  }',
'  function poll(){',
'    var c=window.lang||document.documentElement.getAttribute("lang")||"fr";',
'    if(c!==last){last=c;if(c==="en")doTrad();}',
'  }',
'  function hookBtn(){',
'    var btn=document.getElementById("mn-fluides");',
'    if(btn&&!btn._tewiHook){',
'      btn.addEventListener("click",function(){',
'        setTimeout(doTrad,600);',
'        setTimeout(doTrad,1500);',
'      });',
'      btn._tewiHook=true;',
'    }',
'  }',
'  // Hook sur bouton Calculate TEWI',
'  function hookCalc(){',
'    var pf=document.getElementById("pg-fluides");',
'    if(!pf)return;',
'    pf.querySelectorAll("button").forEach(function(btn){',
'      if(!btn._tewiCalcHook){',
'        btn.addEventListener("click",function(){',
'          setTimeout(doTrad,400);',
'        });',
'        btn._tewiCalcHook=true;',
'      }',
'    });',
'  }',
'  document.addEventListener("DOMContentLoaded",function(){',
'    setInterval(poll,400);',
'    setInterval(hookBtn,1000);',
'    setInterval(hookCalc,2000);',
'    [1000,2000,4000].forEach(function(t){setTimeout(doTrad,t);});',
'  });',
'})();'
];

var scriptContent = lines.join('\n');

// Verifier non-ASCII
var nonAscii=0;
for(var i=0;i<scriptContent.length;i++) if(scriptContent.charCodeAt(i)>127) nonAscii++;
console.log('Non-ASCII:', nonAscii);

var newScript='<script id="tewi-trad-v1">\n'+scriptContent+'\n</script>';
var insertPos=h.lastIndexOf('</body>');
if(insertPos===-1) insertPos=h.length;
var result=h.substring(0,insertPos)+newScript+'\n'+h.substring(insertPos);
fs.writeFileSync(distFile,result,'utf8');
console.log('OK - tewi-trad-v1 applique');
