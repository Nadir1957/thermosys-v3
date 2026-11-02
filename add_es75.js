// Thermosys - etape 75 : espagnol, acceleration du moteur de traduction (la page etait lourde). Idempotent.
// Usage : node add_es75.js dist\index.html
'use strict';
const fs=require('fs');
const f=process.argv[2]; if(!f){console.log('Usage : node add_es75.js dist\\index.html');process.exit(1);}
let s=fs.readFileSync(f,'utf8');
if(s.indexOf('/* perf75 */')>=0){ console.log('Deja a jour. Rien a faire.'); process.exit(0); }
const a=s.indexOf('<script id="lang-i18n3-module">'); const b=s.indexOf('</script>',a);
if(a<0||b<0){ console.log('ERREUR : moteur de langue introuvable. Fichier non modifie.'); process.exit(1); }
let m=s.slice(a,b);
const NL='(\\r?\\n)';
const r1=new RegExp('  var k=Object\\.keys\\(d\\); if\\(norm\\[c\\]&&norm\\[c\\]\\.n===k\\.length\\) return norm\\[c\\]\\.m;'+NL+'  var m=\\{\\}; k\\.forEach\\(function\\(x\\)\\{ m\\[N\\(x\\)\\]=d\\[x\\]; \\}\\); norm\\[c\\]=\\{n:k\\.length,m:m\\}; return m;');
const r2=/function tr\(raw\)\{ \/\* seg68 \*\//;
const r3=/(var SKIP=)/;
const r5=/function sweep\(root\)\{(\r?\n)/;
const r6=/I\.x=function\(s\)\{ if\(!isOv\(\)\) return s;/;
const r4=/I\.add=function\(c,d\)\{ I\.dict\[c\]=I\.dict\[c\]\|\|\{\};/;
if(!r5.test(m)||!r6.test(m)||!r1.test(m)||!r2.test(m)||!r3.test(m)||!r4.test(m)){ console.log('ERREUR : moteur de langue non reconnu. Fichier non modifie.'); process.exit(1); }
m=m.replace(r1,function(x,nl){ return "  /* perf75 */ if(norm[c]&&!chk) return norm[c].m;"+nl+"  chk=false; var k=Object.keys(d); if(norm[c]&&norm[c].n===k.length) return norm[c].m;"+nl+"  var m={}; k.forEach(function(x){ m[N(x)]=d[x]; }); norm[c]={n:k.length,m:m}; memo={}; memoN=0; return m;"; });
m=m.replace(r2,'function tr0(raw){ /* seg68 */');
m=m.replace(r3,function(x){ return "var memo={},memoN=0,chk=true,lastChk=0;\nfunction tr(raw){ var key=cur+'\\u0001'+raw; var h=memo[key]; if(h!==undefined) return h===0?null:h; var v=tr0(raw); if(++memoN>30000){ memo={}; memoN=0; } memo[key]=(v===null?0:v); return v; }\n"+x; });
m=m.replace(r5,function(x,nl){ return 'function sweep(root){'+nl+'  var tn=Date.now(); if(tn-lastChk>30){ chk=true; lastChk=tn; }'+nl; });
m=m.replace(r6,'I.x=function(s){ if(!isOv()) return s; var tn=Date.now(); if(tn-lastChk>30){ chk=true; lastChk=tn; }');
m=m.replace(r4,"I.add=function(c,d){ norm[c]=null; memo={}; memoN=0; I.dict[c]=I.dict[c]||{};");
s=s.slice(0,a)+m+s.slice(b);
fs.writeFileSync(f,s,'utf8');
console.log('OK - moteur de traduction accelere.');
