'use strict';
// Thermosys - traitement d'air : refroidissement sensible d'hiver affiche, impression sans premiere page vide, colonnes des etats de l'air espacees, etiquette du selecteur de COP raccourcie.
// Controle aussi le moteur : en hiver, air melange plus chaud que la cible avant humidificateur => batterie froide (5,6 kW sur l'exemple salle blanche).
const fs=require('fs'),path=require('path');
const f=process.argv[2]||path.join(__dirname,'..','dist','index.html');
const raw=fs.readFileSync(f,'utf8').replace(/\r\n/g,'\n');
const cnt=(h,x)=>h.split(x).length-1;
let nb=0;
function engine(s){const i0=s.indexOf('<script id="airtreat-module">'),a=s.indexOf('(function () {',i0),j=s.indexOf('  var ATE = {',a),k=s.indexOf('};',j)+2;
  return new Function('window','document','return (function(){'+s.slice(a+14,k)+'\nreturn ATE;})()')({},{getElementById(){return null}});}
function checks(s,bad){
  const ok=(c,m)=>{nb++;if(!c)bad.push(m);};
  let A;try{A=engine(s);}catch(e){ok(false,'moteur illisible : '+e.message);return;}
  const P=101.325,M=A.sW(21.7,0.00803,P),r=A.treat(M,18.5,0.00803+0.00014,1.71,0.12,P,{type:'steam'});
  ok(Math.abs(r.cool-5.62)<0.05&&Math.abs(r.coolS-r.cool)<1e-9&&r.heat===0,'moteur : refroidissement sensible d\'hiver 5,6 kW');
  const r2=A.treat(A.sW(10,0.00803,P),18.5,0.00803+0.00014,1.71,0.12,P,{type:'steam'});
  ok(r2.cool===0&&r2.heat>10,'moteur : air mélangé froid => chauffage, pas de froid');
  ok(cnt(s,"(l.cool > 0.05 ? '<tr style=\"border-top:1px solid var(--border)\"><td>' + T('Refroidissement sensible (hiver, charges internes)', 'Sensible cooling (winter, internal gains)') + '</td><td style=\"text-align:right\"><b>' + f1(l.cool) + ' kW</b></td></tr>' : '') +")===1,'ligne hiver affichee si froid > 0,05 kW');
  const wi=s.indexOf("T('Batterie chaude / préchauffage'"),su=s.indexOf("T('Batterie froide : puissance totale'");
  ok(wi>su&&s.indexOf('Refroidissement sensible (hiver',wi)>wi&&s.indexOf('Refroidissement sensible (hiver',wi)<wi+1500,'ligne placee dans la branche hiver');
  ok(cnt(s,"var tdS = pr ? '' : ' style=\"text-align:right;padding-left:8px\"';")===1,'colonnes espacees');
  ok(cnt(s,"row('COP du groupe froid selon la charge :', 'Chiller COP versus load:',")===1&&s.indexOf('selon la charge et la température :')<0,'etiquette courte FR/EN');
  ok(s.indexOf('"Chiller COP versus load:": "COP de la enfriadora según la carga:"')>0&&s.indexOf('"Sensible cooling (winter, internal gains)": "Enfriamiento sensible (invierno, cargas internas)"')>0,'dictionnaire ES');
  ok(s.indexOf('"Chiller COP versus load and temperature:"')<0,'ancienne cle ES retiree');
  ok(/@media print\{[^\n]*\.no-print-creator\{display:none!important\}#at_in,#at_out\{break-inside:auto!important\}\}/.test(s),'impression : panneaux du traitement d air coupables (premiere page non vide)');
}
const bad=[];checks(raw,bad);
const muts=[["#at_in,#at_out{break-inside:auto!important}",""],["#at_in,#at_out{break-inside:auto!important}","#at_in{break-inside:auto!important}"],["l.cool > 0.05 ?","l.cool > 500 ?"],["f1(l.cool) + ' kW</b></td></tr>' : '') +","f1(l.heatTot) + ' kW</b></td></tr>' : '') +"],
 ["padding-left:8px","padding-left:0px"],["'Chiller COP versus load:',","'Chiller COP versus load and temperature:',"],
 ['"Enfriamiento sensible (invierno, cargas internas)"','"Enfriamiento"'],['"COP de la enfriadora según la carga:"','"COP"'],
 ["M.T - 0.01) { o.cool = m * (M.h - Bs.h); o.coolS = o.cool;","M.T - 0.01) { o.cool = 0; o.coolS = 0;"],
 ["if (Tb > M.T + 0.01) { o.heat = m * (Bs.h - M.h);","if (Tb > M.T + 0.01) { o.heat = 0;"]];
let killed=0;
if(!bad.length)for(const [a,b] of muts){if(cnt(raw,a)<1){bad.push('mutation inapplicable : '+a.slice(0,50));continue;}const t=raw.split(a).join(b);const bb=[];const save=nb;checks(t,bb);nb=save;if(bb.length)killed++;else bad.push('mutation survivante : '+a.slice(0,60));}
if(bad.length){console.log('ECHEC : '+bad.join(' | '));process.exit(1);}
console.log('TOUT EST BON : '+nb+' verification(s) reussie(s) (dont '+killed+'/'+muts.length+' mutations detectees), 0 echec(s).');
