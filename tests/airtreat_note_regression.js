'use strict';
// Thermosys - note de dimensionnement du traitement d'air : le refroidissement sensible d'hiver (charges internes) figure dans la section 4.
const fs=require('fs'),path=require('path');
const f=process.argv[2]||path.join(__dirname,'..','dist','index.html');
const raw=fs.readFileSync(f,'utf8').replace(/\r\n/g,'\n');
const cnt=(h,x)=>h.split(x).length-1;
let nb=0;
function checks(s,bad){
  const ok=(c,m)=>{nb++;if(!c)bad.push(m);};
  const A="[[T('Chauffage', 'Heating'), f1(l.heatTot) + ' kW']].concat(l.cool > 0.05 ? [[T('Refroidissement sensible', 'Sensible cooling'), f1(l.cool) + ' kW']] : []).concat([[c.humType === 'adiab' ? T('Eau (adiabatique)', 'Water (adiabatic)') : T('Vapeur', 'Steam'), humVal(c, res, l)]])) + kv(s[0] === 'sum' ? [";
  ok(cnt(s,A)===1,'ligne de refroidissement d\'hiver dans la note');
  ok(cnt(s,'"Sensible cooling": "Enfriamiento sensible"')===1,'dictionnaire ES de la note');
  // la syntaxe de la page reste valide : on compile le bloc de la note
  const i0=s.indexOf("[['sum', '3. Été : points et puissances'"),i1=s.indexOf("body += h2('5. Ventilateurs et section'");
  ok(i0>0&&i1>i0,'bloc saisons');
  if(i0>0&&i1>i0){try{new Function('o','F','c','sm','wn','body','h2','kv','stTable','chartSVG','PALPRINT','T','f0','f1','f2','fh','humVal',s.slice(i0,i1));ok(true,'');}catch(e){ok(false,'bloc saisons invalide : '+e.message);}}
}
const bad=[];checks(raw,bad);
const muts=[["l.cool > 0.05 ?","l.cool > 500 ?"],["f1(l.cool) + ' kW']] : [])","f1(l.heatTot) + ' kW']] : [])"],["humVal(c, res, l)]])) + kv(","humVal(c, res, l)]]) + kv("],['"Enfriamiento sensible"','"Enfriamiento"']];
let killed=0;
if(!bad.length)for(const [a,b] of muts){if(cnt(raw,a)<1){bad.push('mutation inapplicable : '+a.slice(0,50));continue;}const t=raw.split(a).join(b);const bb=[];const save=nb;checks(t,bb);nb=save;if(bb.length)killed++;else bad.push('mutation survivante : '+a.slice(0,60));}
if(bad.length){console.log('ECHEC : '+bad.join(' | '));process.exit(1);}
console.log('TOUT EST BON : '+nb+' verification(s) reussie(s) (dont '+killed+'/'+muts.length+' mutations detectees), 0 echec(s).');
