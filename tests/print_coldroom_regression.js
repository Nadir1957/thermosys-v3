'use strict';
// Thermosys - impression de la chambre froide : les deux grands panneaux peuvent passer d'une page a l'autre (premiere page non vide).
const fs=require('fs'),path=require('path');
const f=process.argv[2]||path.join(__dirname,'..','dist','index.html');
const raw=fs.readFileSync(f,'utf8').replace(/\r\n/g,'\n');
const cnt=(h,x)=>h.split(x).length-1;
let nb=0;
function checks(s,bad){
  const ok=(c,m)=>{nb++;if(!c)bad.push(m);};
  ok(/@media print\{[^\n]*\.footer-copy\{color:#555!important\}#cr_in,#cr_out\{break-inside:auto!important\}\.no-print-creator\{display:none!important\}/.test(s),'regle dans le bloc d\'impression');
  ok(cnt(s,'class="panel" id="cr_in"')===1&&cnt(s,'class="panel" id="cr_out"')===1,'panneaux de la chambre froide');
  ok(/\.panel\{break-inside:avoid;/.test(s),'regle generale conservee pour les autres panneaux');
  ok(cnt(s,'#at_in,#at_out{break-inside:auto!important}')===1,'regle du traitement d\'air conservee');
}
const bad=[];checks(raw,bad);
const muts=[['#cr_in,#cr_out{break-inside:auto!important}',''],['#cr_in,#cr_out{break-inside:auto!important}','#cr_in{break-inside:auto!important}'],['#cr_in,#cr_out{break-inside:auto!important}','#cr_in,#cr_out{break-inside:avoid!important}'],['.panel{break-inside:avoid;','.panel{break-inside:auto;'],['class="panel" id="cr_out"','class="panel" id="cr_x"']];
let killed=0;
if(!bad.length)for(const [a,b] of muts){if(cnt(raw,a)<1){bad.push('mutation inapplicable : '+a.slice(0,50));continue;}const t=raw.split(a).join(b);const bb=[];const save=nb;checks(t,bb);nb=save;if(bb.length)killed++;else bad.push('mutation survivante : '+a.slice(0,60));}
if(bad.length){console.log('ECHEC : '+bad.join(' | '));process.exit(1);}
console.log('TOUT EST BON : '+nb+' verification(s) reussie(s) (dont '+killed+'/'+muts.length+' mutations detectees), 0 echec(s).');
