const fs = require('fs');
let h = fs.readFileSync('dist/index.html', 'utf8');
const PATCH_ID = 'protect-v1';
if(h.indexOf(PATCH_ID) !== -1){
  h = h.replace(new RegExp('<script id="' + PATCH_ID + '">[\\s\\S]*?<\\/script>\\s*'), '');
  fs.writeFileSync('dist/index.html', h, 'utf8');
  console.log('OK - protection anti-copie retiree');
} else {
  console.log('Protection deja absente, rien a faire');
}