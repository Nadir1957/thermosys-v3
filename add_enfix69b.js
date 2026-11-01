// Thermosys - etape 69b : zone "Resultat SCOP" et quelques libelles en mode anglais. Idempotent.
// Usage : node add_enfix69b.js dist\index.html
'use strict';
const fs=require('fs');
const f=process.argv[2]; if(!f){console.log('Usage : node add_enfix69b.js dist\\index.html');process.exit(1);}
let s=fs.readFileSync(f,'utf8');
const DATA="(function(){\nvar E=window.ENFIX=window.ENFIX||{}; E.dict=E.dict||{};\nvar D={\n\"Resultat SCOP\":\"SCOP result\",\n\"Résultat SCOP\":\"SCOP result\",\n\"Verification RE2020\":\"RE2020 check\",\n\"Vérification RE2020\":\"RE2020 check\",\n\"Alkylbenzène AB\":\"Alkylbenzene AB\",\n\"Valeurs de 0 à 1 pour chaque heure (heure 1 = de 0 h à 1 h) :\":\"Values from 0 to 1 for each hour (hour 1 = 0:00 to 1:00):\"\n};\nObject.keys(D).forEach(function(k){ E.dict[k]=D[k]; });\n})();";
const ID='en-fix-data-2';
if(s.indexOf('<script id="'+ID+'">')>=0){ console.log('Deja a jour. Rien a faire.'); process.exit(0); }
if(s.split('\n</body>').length!==2){ console.log('ERREUR : balise </body> introuvable ou multiple. Fichier non modifie.'); process.exit(1); }
const crlf=s.indexOf('\r\n')>=0;
let ins='<script id="'+ID+'">\n'+DATA+'\n</'+'script>';
if(crlf) ins=ins.replace(/\n/g,'\r\n');
const e=s.lastIndexOf('\n</body>');
s=s.slice(0,e)+'\n'+ins+s.slice(e);
fs.writeFileSync(f,s,'utf8');
console.log('OK - zone Resultat SCOP et libelles anglais corriges (1 bloc ajoute).');
