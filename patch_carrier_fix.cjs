const fs=require('fs');
const d='dist/index.html';
let h=fs.readFileSync(d,'utf8');
var sc='<scr'+'ipt id="carrier-fix">(function(){setInterval(function(){if((window.lang||"fr")!=="en")return;var pg=document.getElementById("pg-rt2025");if(!pg)return;var w=document.createTreeWalker(pg,4,null,false),ns=[],n;while(n=w.nextNode())ns.push(n);ns.forEach(function(nd){var t=nd.textContent,u=t.replace(/Confirmer pompe en marche/g,"Confirm pump is running").replace(/Consigne d\u00e9bit min : param\u00e8tre/g,"Min flow setpoint: parameter").replace(/\(d\u00e9faut = 5 sec\)/g,"(default = 5 sec)").replace(/CTLPNT : consigne eau glac\u00e9e/g,"CTLPNT: chilled water setpoint");if(u!==t)nd.textContent=u;});},300);})()<\/scr'+'ipt>';
h=h.replace('</body>',sc+'\n</body>');
fs.writeFileSync(d,h,'utf8');
console.log('OK carrier-fix');