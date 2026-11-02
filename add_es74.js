// Thermosys - etape 74 : espagnol, selecteur Pays / Ville (CHARGE PRO, CHAMBRE FROIDE), noms de pays. Idempotent.
// Usage : node add_es74.js dist\\index.html
'use strict';
const fs=require('fs');
const f=process.argv[2]; if(!f){console.log('Usage : node add_es74.js dist\\index.html');process.exit(1);}
let s=fs.readFileSync(f,'utf8');
const DATA="(window.I18N3=window.I18N3||{dict:{}});\nwindow.I18N3.dict=window.I18N3.dict||{};\n(function(){var D={\"Country:\": \"País:\", \"Myanmar (Burma)\": \"Myanmar (Birmania)\", \"City (monthly mean temperatures):\": \"Ciudad (temperaturas medias mensuales):\", \"Mean monthly temperatures 1991-2020 (published climate normals). You can edit each month.\": \"Temperaturas medias mensuales 1991-2020 (normales climáticas publicadas). Cada mes se puede modificar.\", \"Latitude and altitude of the city.\": \"Latitud y altitud de la ciudad.\", \"Manual entry: type the 12 monthly mean temperatures.\": \"Entrada manual: indique las 12 temperaturas medias mensuales.\"};\nvar t=window.I18N3.dict.es=window.I18N3.dict.es||{};Object.keys(D).forEach(function(k){t[k]=D[k];});})();\n(function(){\nvar I=window.I18N3; if(!I||!I.rx||I.__rx3) return; I.__rx3=1;\nvar prev=I.rx, cm=null;\nfunction countries(){\n  if(cm) return cm; cm={};\n  try{\n    var e=new Intl.DisplayNames(['en'],{type:'region'}), s=new Intl.DisplayNames(['es'],{type:'region'});\n    var A='ABCDEFGHIJKLMNOPQRSTUVWXYZ';\n    for(var i=0;i<26;i++)for(var j=0;j<26;j++){ var c=A[i]+A[j]; try{ var n=e.of(c), t=s.of(c); if(n&&t&&n!==c&&t!==c&&n!==t) cm[n]=t; }catch(x){} }\n  }catch(x){}\n  return cm;\n}\nI.rx=function(k,m){\n  var a;\n  if((a=/^NOAA station (.+?), (\\S+) km(?: · station altitude (\\S+) m)?( · normals 1991-2020\\. Editable\\.|\\.)$/.exec(k)))\n    return 'Estación NOAA '+a[1]+', a '+a[2]+' km'+(a[3]?' · altitud de la estación '+a[3]+' m':'')+(a[4]==='.'?'.':' · normales 1991-2020. Modificable.');\n  var v=prev(k,m); if(v!==null&&v!==undefined) return v;\n  var c=countries()[k]; if(c) return c;\n  return null;\n};\n})();\n";
const ID='lang-es-data-6';
if(s.indexOf('<script id="'+ID+'">')>=0){ console.log('Deja a jour. Rien a faire.'); process.exit(0); }
if(s.split('\n</body>').length!==2){ console.log('ERREUR : balise </body> introuvable ou multiple. Fichier non modifie.'); process.exit(1); }
if(s.indexOf('<script id="lang-es-data-5">')<0){ console.log('ERREUR : appliquez d abord add_es73.js. Fichier non modifie.'); process.exit(1); }
const crlf=s.indexOf('\r\n')>=0;
/* 2) donnees + traduction de la fenetre d impression */
let ins='<script id="'+ID+'">\n'+DATA+'\n</'+'script>';
if(crlf) ins=ins.replace(/\r?\n/g,'\r\n');
const e=s.lastIndexOf('\n</body>');
s=s.slice(0,e)+'\n'+ins+s.slice(e);
fs.writeFileSync(f,s,'utf8');
console.log('OK - espagnol : selecteur Pays / Ville traduit (1 bloc ajoute).');
