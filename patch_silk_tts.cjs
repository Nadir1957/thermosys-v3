const fs = require('fs');
const path = require('path');

const distFile = path.join(__dirname, 'dist', 'index.html');
let h = fs.readFileSync(distFile, 'utf8');

if(h.includes('silk-tts-fix')){
  var s=h.lastIndexOf('<script',h.indexOf('silk-tts-fix'));
  var e=h.indexOf('</script>',s)+9;
  h=h.substring(0,s)+h.substring(e);
}

var lines = [
'(function(){',
// Detecter Amazon Silk
'  var isSilk = navigator.userAgent.indexOf("Silk") !== -1;',
'  if(!isSilk) return;',
'  console.log("Silk TTS fix loaded");',

// Attendre que les voix soient chargées puis jouer
'  function speakWhenReady(text, lang, rate, pitch, volume, onStart, onEnd){',
'    var ss = window.speechSynthesis;',
'    if(!ss) return;',
'    function doSpeak(){',
'      var voices = ss.getVoices();',
'      var utt = new SpeechSynthesisUtterance(text);',
'      utt.lang = lang || "en-US";',
'      utt.rate = rate || 0.9;',
'      utt.pitch = pitch || 1;',
'      utt.volume = volume || 1;',
'      // Choisir la meilleure voix disponible',
'      if(voices.length > 0){',
'        var fr = lang && lang.startsWith("fr");',
'        var pool = voices.filter(function(v){return v.lang.startsWith(fr?"fr":"en");});',
'        if(!pool.length) pool = voices;',
'        utt.voice = pool[0];',
'      }',
'      if(onStart) utt.onstart = onStart;',
'      if(onEnd) utt.onend = onEnd;',
'      ss.cancel();',
'      ss.speak(utt);',
'    }',
'    var voices = ss.getVoices();',
'    if(voices.length > 0){',
'      doSpeak();',
'    } else {',
'      // Attendre l\'evenement voiceschanged',
'      var done = false;',
'      ss.onvoiceschanged = function(){',
'        if(done) return;',
'        done = true;',
'        doSpeak();',
'      };',
'      // Fallback: essayer apres 1s meme sans voix',
'      setTimeout(function(){',
'        if(!done){ done=true; doSpeak(); }',
'      }, 1000);',
'    }',
'  }',

// Intercepter rptSpeak pour Silk
'  var origRptSpeak = null;',
'  function patchRptSpeak(){',
'    if(typeof window.rptSpeak === "function" && !window.rptSpeak._silkPatched){',
'      origRptSpeak = window.rptSpeak;',
'      window.rptSpeak = function(text){',
'        var fr = window.lang === "fr";',
'        var speed = parseFloat((document.getElementById("rpt-speed")||{}).value||0.9);',
'        speakWhenReady(',
'          text,',
'          fr ? "fr-FR" : "en-US",',
'          speed,',
'          0.95,',
'          1,',
'          function(){ if(typeof rptUpdateUI==="function")rptUpdateUI("speaking"); },',
'          function(){ if(typeof rptUpdateUI==="function")rptUpdateUI("stopped"); }',
'        );',
'      };',
'      window.rptSpeak._silkPatched = true;',
'      console.log("rptSpeak patched for Silk");',
'    }',
'  }',

// Essayer de patcher au chargement et après
'  document.addEventListener("DOMContentLoaded", function(){',
'    setTimeout(patchRptSpeak, 500);',
'    setTimeout(patchRptSpeak, 2000);',
'    // Precharger les voix au chargement',
'    if(window.speechSynthesis){',
'      window.speechSynthesis.getVoices();',
'      if(window.speechSynthesis.onvoiceschanged !== undefined){',
'        window.speechSynthesis.onvoiceschanged = function(){',
'          window.speechSynthesis.getVoices();',
'        };',
'      }',
'    }',
'  });',
'})();'
];

var scriptContent = lines.join('\n');
var nonAscii = 0;
for(var i=0;i<scriptContent.length;i++) if(scriptContent.charCodeAt(i)>127) nonAscii++;
console.log('Non-ASCII:', nonAscii);

var newScript = '<script id="silk-tts-fix">\n' + scriptContent + '\n</script>';
var insertPos = h.lastIndexOf('</body>');
if(insertPos === -1) insertPos = h.length;
var result = h.substring(0, insertPos) + newScript + '\n' + h.substring(insertPos);
fs.writeFileSync(distFile, result, 'utf8');
console.log('OK - silk-tts-fix applique');
