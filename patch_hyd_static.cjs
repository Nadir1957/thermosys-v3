const fs = require('fs');
const path = require('path');
const distFile = path.join(__dirname, 'dist', 'index.html');
let h = fs.readFileSync(distFile, 'utf8');

// Supprimer ancien hyd-btn-fix si present
if(h.indexOf('hyd-btn-fix') !== -1){
  h = h.replace(/<script id="hyd-btn-fix">[\s\S]*?<\/script>\s*/, '');
}

var btnScript = '<script id="hyd-btn-fix">\n' +
'(function(){\n' +
'  function fix(){\n' +
'    var lang=window.lang||"fr";\n' +
'    var pg=document.getElementById("pg-hydraulique");\n' +
'    if(!pg)return;\n' +
'    // Boutons hyd2/hyd4/hyd5\n' +
'    ["hyd2","hyd4","hyd5"].forEach(function(id){\n' +
'      var div=document.getElementById(id);\n' +
'      if(!div)return;\n' +
'      div.querySelectorAll(".btn.bp").forEach(function(b){\n' +
'        if(lang==="en"&&b.textContent.trim()==="Calculer")b.textContent="Calculate";\n' +
'        if(lang==="fr"&&b.textContent.trim()==="Calculate")b.textContent="Calculer";\n' +
'      });\n' +
'    });\n' +
'    // TH Vitesse/Velocity\n' +
'    var ptc=document.getElementById("preregl-table-cont");\n' +
'    if(ptc)ptc.querySelectorAll("th").forEach(function(el){\n' +
'      if(lang==="en"&&el.textContent==="Vitesse")el.textContent="Velocity";\n' +
'      if(lang==="fr"&&el.textContent==="Velocity")el.textContent="Vitesse";\n' +
'    });\n' +
'    // TH Palier/Setting\n' +
'    var prc=document.getElementById("prc-palier");\n' +
'    if(prc)prc.querySelectorAll("th").forEach(function(el){\n' +
'      if(lang==="en"&&el.textContent==="Palier")el.textContent="Setting";\n' +
'      if(lang==="fr"&&el.textContent==="Setting")el.textContent="Palier";\n' +
'    });\n' +
'    // palier-result\n' +
'    var pr=document.getElementById("palier-result");\n' +
'    if(pr){\n' +
'      if(lang==="en"&&pr.textContent.indexOf("disponible")!==-1)\n' +
'        pr.textContent=pr.textContent.replace(/\u0394P disponible:/g,"Available \u0394P:").replace(/Q nominal:/g,"Nominal flow:");\n' +
'      if(lang==="fr"&&pr.textContent.indexOf("Available")!==-1)\n' +
'        pr.textContent=pr.textContent.replace(/Available \u0394P:/g,"\u0394P disponible:").replace(/Nominal flow:/g,"Q nominal:");\n' +
'    }\n' +
'  }\n' +
'  document.addEventListener("DOMContentLoaded",function(){\n' +
'    setInterval(fix,300);\n' +
'    [500,1000,2000].forEach(function(t){setTimeout(fix,t);});\n' +
'  });\n' +
'})();\n' +
'</script>';

var bidx = h.lastIndexOf('</body>');
if(bidx === -1) bidx = h.length;
h = h.slice(0, bidx) + btnScript + '\n' + h.slice(bidx);
fs.writeFileSync(distFile, h, 'utf8');
console.log('OK - patch_hyd_static applique');
