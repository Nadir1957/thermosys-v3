// Thermosys - etape 70 : espagnol en APERCU PRIVE. Idempotent.
// L'espagnol n'apparait dans le menu des langues que sur l'appareil ou l'on ouvre l'adresse  .../?es=1  (retour a la normale avec  .../?es=0 ).
// Usage : node add_es70.js dist\index.html
'use strict';
const fs=require('fs');
const f=process.argv[2]; if(!f){console.log('Usage : node add_es70.js dist\\index.html');process.exit(1);}
let s=fs.readFileSync(f,'utf8');
const OLD="var ORDER=['fr','en'];";
const NEW="var ORDER=(function(){try{if(/[?&]es=1(&|$)/.test(location.search))localStorage.setItem('thermosys_es','1');if(/[?&]es=0(&|$)/.test(location.search))localStorage.removeItem('thermosys_es');return localStorage.getItem('thermosys_es')==='1'?['fr','en','es']:['fr','en'];}catch(e){return ['fr','en'];}})();";
if(s.indexOf("thermosys_es")>=0){ console.log('Deja a jour. Rien a faire.'); process.exit(0); }
if(s.split(OLD).length!==2){ console.log('ERREUR : ligne ORDER introuvable ou multiple. Fichier non modifie. (add_lang_off.js a-t-il ete applique ?)'); process.exit(1); }
s=s.replace(OLD,()=>NEW);
fs.writeFileSync(f,s,'utf8');
console.log('OK - espagnol en apercu prive : ouvrir .../?es=1 pour l activer sur cet appareil.');
