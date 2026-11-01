// Thermosys - etape 69f : desenfumage en anglais. Idempotent.
// Usage : node add_enfix69f.js dist\index.html
'use strict';
const fs=require('fs');
const f=process.argv[2]; if(!f){console.log('Usage : node add_enfix69f.js dist\\index.html');process.exit(1);}
let s=fs.readFileSync(f,'utf8');
const DATA="(function(){\nvar E=window.ENFIX=window.ENFIX||{}; E.dict=E.dict||{}; E.words=E.words||[];\nvar D={\n\"Type de local / Room type\": \"Room type\",\n\"Nb. de cantons / Smoke zones\": \"Smoke zones\",\n\"Flow: 500–100,000 m³/h. Axial and centrifugal. : 500 – 100 000 m³/h. Axial et centrifuge.\": \"Flow: 500–100,000 m³/h. Axial and centrifugal.\",\n\"Steel and aluminium SHEV. Area: 0.4–3 m². EI 60 insulated double skin. / Exutoire acier et aluminium. Double peau EI 60.\": \"Steel and aluminium SHEV. Area: 0.4–3 m². EI 60 insulated double skin.\",\n\"🔌 Coffrets de commande et SSI / Control Panels & Fire Safety Systems\": \"🔌 Control Panels & Fire Safety Systems\",\n\"📝 Formules de calcul / Calculation Formulas\": \"📝 Calculation Formulas\",\n\"panache de balcon\": \"balcony plume\",\n\"Flow: 500–100,000 m³/h. Axial and centrifugal. / Débit : 500 – 100 000 m³/h. Axial et centrifuge.\": \"Flow: 500–100,000 m³/h. Axial and centrifugal.\",\n\"ECP 306 — Égypte\": \"ECP 306 — Egypt\"\n};\nObject.keys(D).forEach(function(k){ if(!E.dict.hasOwnProperty(k)) E.dict[k]=D[k]; });\n})();";
const ID='en-fix-data-5';
if(s.indexOf('<script id="'+ID+'">')>=0){ console.log('Deja a jour. Rien a faire.'); process.exit(0); }
if(s.split('\n</body>').length!==2){ console.log('ERREUR : balise </body> introuvable ou multiple. Fichier non modifie.'); process.exit(1); }
const crlf=s.indexOf('\r\n')>=0;
let ins='<script id="'+ID+'">\n'+DATA+'\n</'+'script>';
if(crlf) ins=ins.replace(/\n/g,'\r\n');
const e=s.lastIndexOf('\n</body>');
s=s.slice(0,e)+'\n'+ins+s.slice(e);
fs.writeFileSync(f,s,'utf8');
console.log('OK - desenfumage en anglais (1 bloc ajoute).');
