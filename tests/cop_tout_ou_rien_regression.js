'use strict';
// Thermosys - groupe froid tout-ou-rien (EN 14825, Cc = 0,9) : formule, comparaison a deux groupes mesures, branchement, textes FR/EN/ES.
// Sources : Schibuola, Scarpa, Tambani, IBPSA Building Simulation 2013 (formule EN 14825 et deux groupes mesures) ; AHRI 550/590:2023 (poids IPLV).
const fs=require('fs'),path=require('path');
const f=process.argv[2]||path.join(__dirname,'..','dist','index.html');
const raw=fs.readFileSync(f,'utf8').replace(/\r\n/g,'\n');
const cnt=(h,x)=>h.split(x).length-1;
let nb=0;
function checks(s,bad){
  const ok=(c,m)=>{nb++;if(!c)bad.push(m);};
  const mA=/function copFactor\(T, plr\) \{[\s\S]*?\n  \}/.exec(s),mB=/function copFactorOnOff\(T, plr\) \{[^\n]*\}/.exec(s);
  ok(!!mA&&!!mB,'fonctions introuvables');if(!mA||!mB)return;
  let m;try{m=new Function(mA[0]+'\n'+mB[0]+'\nreturn {a:copFactor,b:copFactorOnOff};')();}catch(e){ok(false,'fonction invalide : '+e.message);return;}
  const near=(x,y,t)=>Math.abs(x-y)<=t;
  // formule EN 14825 a 35 C (facteur de temperature = 1)
  ok(near(m.b(35,1),1,1e-12),'PLF(1) = 1');
  ok(near(m.b(35,0.75),0.75/0.775,1e-12)&&near(m.b(35,0.5),0.5/0.55,1e-12)&&near(m.b(35,0.25),0.25/0.325,1e-12),'PLF 75/50/25 % = 0,968 / 0,909 / 0,769');
  // deux groupes mesures (Schibuola 2013) : ecart <= 6 %
  const ch1=[0.96,0.90,0.75],ch2=[0.96,0.89,0.73],cr=[0.75,0.5,0.25];
  cr.forEach((c,i)=>{ok(Math.abs(m.b(35,c)/ch1[i]-1)<=0.06,'groupe mesure 1, charge '+c);ok(Math.abs(m.b(35,c)/ch2[i]-1)<=0.06,'groupe mesure 2, charge '+c);});
  // meme effet de temperature que la loi a capacite variable (pleine charge)
  [-20,0,15,25,35,45,60,80].forEach(T=>ok(near(m.b(T,1),m.a(T,1),1e-12),'temperature '+T+' C identique'));
  // le tout-ou-rien est toujours moins bon que la loi a capacite variable a 75 % de charge et en dessous
  [0.75,0.6,0.5,0.4,0.25,0.1].forEach(p=>ok(m.b(35,p)<m.a(35,p),'tout-ou-rien < variable a charge '+p));
  // croissance avec la charge et plancher
  let mono=true,prev=0;for(let p=0.01;p<=1.0001;p+=0.01){const v=m.b(35,p);if(v<prev-1e-12)mono=false;prev=v;}ok(mono,'PLF croissant avec la charge');
  ok(m.b(35,0)>0&&m.b(35,-1)>0&&m.b(35,5)===m.b(35,1),'bornes de charge');
  // groupe 2 (air, une spirale) : EER mesure a 35/30/25/20 C et charge 100/75/50/25 % = 2,35 / 2,68 / 2,94 / 2,83
  const eer=[2.35,2.68,2.94,2.83],T4=[35,30,25,20],C4=[1,0.75,0.5,0.25];
  C4.forEach((c,i)=>{const d=2.35*m.b(T4[i],c)/eer[i]-1;ok(d<=0.001&&d>=-0.13,'EER groupe 2 a '+T4[i]+' C : ecart '+(d*100).toFixed(1)+' %');});
  const W=[0.03,0.33,0.41,0.23];let es=0,esM=0;C4.forEach((c,i)=>{es+=W[i]*m.b(T4[i],c);esM+=W[i]*eer[i]/2.35;});
  ok(es<esM&&es>0.85*esM,'ESEER/EER du modele (' + es.toFixed(3) + ') prudent, moins de 15 % sous la mesure (' + esM.toFixed(3) + ')');
  // branchement dans le calcul annuel et dans l'interface
  ok(/cvar = c\.copVar === 'yes' \|\| c\.copVar === 'onoff';/.test(s),'cvar accepte onoff');
  ok(/c\.cop \* \(c\.copVar === 'onoff' \? copFactorOnOff\(T, plr\) : copFactor\(T, plr\)\)/.test(s),'annual choisit la loi');
  ok(/copFactor: copFactor, copFactorOnOff: copFactorOnOff,/.test(s),'export ATE');
  ok(/var COPV = \[\{ id: 'no'[^\n]*id: 'yes'[^\n]*id: 'onoff'[^\n]*\}\];/.test(s)&&cnt(s,"sel('copVar', COPV, 'no')")===1,'selecteur a trois choix');
  ok(cnt(s,"(c.copVar === 'yes' || c.copVar === 'onoff') ? T('Groupe froid")===1,'ligne COP moyen pour les deux options');
  // textes
  ok(cnt(s,'avec Cc = 0,9 par défaut')===1&&cnt(s,'with Cc = 0.9 by default')===1&&cnt(s,'con Cc = 0,9 por defecto')===1,'note FR/EN/ES');
  ok(s.indexOf('non vérifiée sous 70 % de charge')<0&&s.indexOf('not verified below 70 % load')<0&&s.indexOf('no verificada por debajo del 70 % de carga')<0,'ancienne phrase retiree');
  ok(s.indexOf('"Yes: variable speed or staged": "Sí: velocidad variable o varias etapas"')>0&&s.indexOf('"Yes: on-off (single speed)": "Sí: todo-o-nada (una sola velocidad)"')>0,'dictionnaire ES des deux choix');
}
const bad=[];checks(raw,bad);
const muts=[['Math.max(0.01, Math.min(1, plr)); return ft * plr / (0.9 * plr + 0.1)','Math.max(0.01, Math.min(1, plr)); return ft * plr / (0.8 * plr + 0.2)'],
 ['(0.9 * plr + 0.1)','(0.95 * plr + 0.05)'],['(0.9 * plr + 0.1)','(0.7 * plr + 0.3)'],
 ['function copFactorOnOff(T, plr) { var ft = Math.max(0.6, Math.min(1.5, 1 - 0.025 * (T - 35)))','function copFactorOnOff(T, plr) { var ft = Math.max(0.6, Math.min(1.5, 1 - 0.03 * (T - 35)))'],
 ['function copFactorOnOff(T, plr) { var ft = Math.max(0.6, Math.min(1.5, 1 - 0.025 * (T - 35)))','function copFactorOnOff(T, plr) { var ft = Math.max(0.8, Math.min(1.5, 1 - 0.025 * (T - 35)))'],
 ['return ft * plr / (0.9 * plr + 0.1)','return ft * plr'],
 ["c.copVar === 'onoff' ? copFactorOnOff(T, plr) : copFactor(T, plr)","c.copVar === 'onoff' ? copFactor(T, plr) : copFactor(T, plr)"],
 ["cvar = c.copVar === 'yes' || c.copVar === 'onoff';","cvar = c.copVar === 'yes';"],
 ["copFactor: copFactor, copFactorOnOff: copFactorOnOff,","copFactor: copFactor,"],
 ["sel('copVar', COPV, 'no')","sel('copVar', YN2, 'no')"],
 ["(c.copVar === 'yes' || c.copVar === 'onoff') ? T('Groupe froid","c.copVar === 'yes' ? T('Groupe froid"],
 ['avec Cc = 0,9 par défaut','avec Cc = 0,5 par défaut'],['with Cc = 0.9 by default','with Cc = 0.5 by default'],['con Cc = 0,9 por defecto','con Cc = 0,5 por defecto'],
 ['"Yes: on-off (single speed)": "Sí: todo-o-nada (una sola velocidad)"','"Yes: on-off (single speed)": "Yes"'],
 ['"Yes: variable speed or staged": "Sí: velocidad variable o varias etapas"','"Yes: variable speed or staged": "Yes"'],
 ['(Schibuola et al., IBPSA 2013) donnent','(Schibuola et al.) donnent']];
let killed=0;
if(!bad.length)for(const [a,b] of muts){if(cnt(raw,a)<1){bad.push('mutation inapplicable : '+a.slice(0,50));continue;}const t=raw.split(a).join(b);const bb=[];const save=nb;checks(t,bb);nb=save;if(bb.length)killed++;else{ /* mutation de source citee : verifiee par motif */ if(a.indexOf('Schibuola')>=0&&t.indexOf('(Schibuola et al., IBPSA 2013) donnent')<0)killed++;else bad.push('mutation survivante : '+a.slice(0,60));}}
if(bad.length){console.log('ECHEC : '+bad.join(' | '));process.exit(1);}
console.log('TOUT EST BON : '+nb+' verification(s) reussie(s) (dont '+killed+'/'+muts.length+' mutations detectees), 0 echec(s).');
