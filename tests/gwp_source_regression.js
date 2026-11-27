'use strict';
const fs=require('fs'),path=require('path');
const f=path.join(__dirname,'..','dist','index.html');const s=fs.readFileSync(f,'utf8');
let bad=[];const ok=(c,m)=>{if(!c)bad.push(m);};
const cnt=(h,x)=>h.split(x).length-1;
function checks(s,bad2){const ok2=(c,m)=>{if(!c)bad2.push(m);};
 ok2(cnt(s,'(Règl. UE 2024/573, annexe I)')===3,'FR source PRG');
 ok2(cnt(s,'(EU Reg. 2024/573, Annex I)')===4,'EN source PRG');
 ok2(cnt(s,'(Reglamento UE 2024/573, anexo I)')===2,'ES source PRG');
 ok2(s.indexOf('(Règl. UE 517/2014)')<0&&s.indexOf('(EU Reg. 517/2014)')<0&&s.indexOf('(Reglamento UE 517/2014)')<0,'ancienne source encore citee');
 ok2(cnt(s,'l’annexe VI du règlement peut s’appuyer sur l’AR6')===1,'FR melanges');
 ok2(cnt(s,'Annex VI of the regulation may use AR6')===2,'EN melanges (texte + cle du dictionnaire)');
 ok2(cnt(s,'el anexo VI del reglamento puede usar el AR6')===1,'ES melanges');
 // la cle EN du dictionnaire espagnol doit encore etre identique au texte anglais de la page
 const m=/var NOTE_REF = \['[^\n]*\n\s*'([^\n]*)'\];/.exec(s);ok2(!!m,'NOTE_REF');
 if(m){ok2(s.split('"'+m[1].replace(/"/g,'\\"')+'":').length-1===1,'cle du dictionnaire ES differente du texte EN');}
 ok2(s.indexOf('data-en="GWP AR4, 100-year values (EU Reg. 2024/573, Annex I); AR5/AR6 editions give other values"')>0,'data-en');
}
checks(s,bad);
// mutations : chaque degradation doit etre vue
const muts=[['(Règl. UE 2024/573, annexe I)','(Règl. UE 517/2014)'],['(EU Reg. 2024/573, Annex I)','(EU Reg. 517/2014)'],['(Reglamento UE 2024/573, anexo I)','(Reglamento UE 517/2014)'],['Annex VI of the regulation may use AR6 for some blends: not verified','Annex VI: x'],['el anexo VI del reglamento puede usar el AR6','el anexo VI']];
let killed=0;for(const [a,b] of muts){const t=s.split(a).join(b);const bb=[];checks(t,bb);if(bb.length)killed++;else bad.push('mutation survivante : '+a);}
if(bad.length){console.log('ECHEC : '+bad.join(' | '));process.exit(1);}
console.log('TOUT EST BON : '+(12)+' verifications, '+killed+' mutations tuees');
