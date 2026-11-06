// Thermosys - etape 79 : espagnol - RE2020 : resultats multi-lignes (Analizar la direccion CCN...) traduits ligne par ligne. Idempotent.
// Usage : node add_es79.js dist\index.html
'use strict';
const fs=require('fs');
const f=process.argv[2]; if(!f){console.log('Usage : node add_es79.js dist\\index.html');process.exit(1);}
let s=fs.readFileSync(f,'utf8');
const crlf=s.indexOf('\r\n')>=0;
if(s.indexOf('/* esml79 */')>=0){ console.log('Deja a jour. Rien a faire.'); process.exit(0); }
if(s.indexOf('/* esml78 */')<0){ console.log('ERREUR : appliquez d abord add_es78.js. Fichier non modifie.'); process.exit(1); }
let n=0;
function rep(a,b){
  if(crlf){ a=a.replace(/\r?\n/g,'\r\n'); b=b.replace(/\r?\n/g,'\r\n'); }
  const i=s.indexOf(a);
  if(i<0){ console.log('ERREUR : ancre introuvable : '+a.slice(0,70)+' (fichier non modifie)'); process.exit(1); }
  if(s.indexOf(a,i+1)>=0){ console.log('ERREUR : ancre non unique : '+a.slice(0,70)+' (fichier non modifie)'); process.exit(1); }
  s=s.split(a).join(b); n++; }
rep("var v=(raw.indexOf('\\n')>0&&I.ml)?I.ml(raw,tr):tr(raw); /* esml78 */","var v=I.ml?I.ml(raw,tr):tr(raw); /* esml79 */");
rep("I.rxs.push(function(k){ return runR(k); });\n","");
rep("I.ml=function(raw,tr){\n  var w=tr(raw); if(w!==null) return w;","I.ml=function(raw,tr){\n  var t1=raw.replace(/^\\s+/,'').replace(/\\s+$/,'');\n  if(t1.indexOf('\\n')<0){ var r1=runR(t1.replace(/\\s+/g,' ')); return r1!==null?r1:tr(raw); }\n  var w=tr(raw); if(w!==null) return w;");
rep(" function(k){ var a; if((a=/^(\\d+) \\/ (\\d+) (?:points validated|points validés|puntos validados)"," function(k){ var a; if((a=/^(Puntuación de la auditoría : .*) — ✅ COMPLIANT$/.exec(k))) return a[1]+' — ✅ CONFORME'; },\n function(k){ var a; if((a=/^(\\d+) \\/ (\\d+) (?:points validated|points validés|puntos validados)");
fs.writeFileSync(f,s,'utf8');
console.log('OK - espagnol : resultats RE2020 multi-lignes corriges ('+n+' corrections).');
