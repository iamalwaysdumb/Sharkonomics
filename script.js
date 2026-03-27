
const cursor = document.querySelector('.cursor');
const ring   = document.querySelector('.cursor-ring');
let mx = window.innerWidth/2, my = window.innerHeight/2, rx = mx, ry = my;
document.addEventListener('mousemove', e => {
  mx = e.clientX; my = e.clientY;
  if (cursor) { cursor.style.left = mx+'px'; cursor.style.top = my+'px'; }
});
(function animRing() {
  rx += (mx-rx)*0.13; ry += (my-ry)*0.13;
  if (ring) { ring.style.left = rx+'px'; ring.style.top = ry+'px'; }
  requestAnimationFrame(animRing);
})();

function checkReveals() {
  document.querySelectorAll('.reveal').forEach(el => {
    if (el.getBoundingClientRect().top < window.innerHeight - 80) el.classList.add('active');
  });
}
window.addEventListener('scroll', checkReveals);
checkReveals();


(function(){
  const bars = document.querySelectorAll('.bar-fill');
  if (!bars.length) return;
  new IntersectionObserver((entries, obs) => {
    entries.forEach(e => {
      if (!e.isIntersecting) return;
      bars.forEach((b,i) => setTimeout(() => { b.style.height = b.dataset.value+'%'; }, i*80));
      obs.disconnect();
    });
  }, {threshold:0.3}).observe(bars[0].closest('.chart-wrap') || bars[0]);
})();


const path = window.location.pathname.split('/').pop() || 'index.html';
document.querySelectorAll('.nav-links a').forEach(a => {
  if (a.getAttribute('href') === path) a.classList.add('active');
});


let _ctx = null;
let soundEnabled = true;

function getCtx() {
  if (!_ctx) _ctx = new (window.AudioContext || window.webkitAudioContext)();
  if (_ctx.state === 'suspended') _ctx.resume();
  return _ctx;
}

function tone(freq, type, dur, vol, delay=0) {
  if (!soundEnabled) return;
  try {
    const c = getCtx(), o = c.createOscillator(), g = c.createGain(), t = c.currentTime + delay;
    o.connect(g); g.connect(c.destination);
    o.type = type;
    o.frequency.setValueAtTime(freq, t);
    g.gain.setValueAtTime(vol, t);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.start(t); o.stop(t + dur + 0.05);
  } catch(e) {}
}

function noise(dur, vol, delay=0) {
  if (!soundEnabled) return;
  try {
    const c = getCtx(), buf = c.createBuffer(1, c.sampleRate*dur, c.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < data.length; i++) data[i] = Math.random()*2-1;
    const src = c.createBufferSource(), g = c.createGain(), flt = c.createBiquadFilter();
    flt.type = 'bandpass'; flt.frequency.value = 600;
    src.buffer = buf;
    src.connect(flt); flt.connect(g); g.connect(c.destination);
    const t = c.currentTime + delay;
    g.gain.setValueAtTime(vol, t);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    src.start(t); src.stop(t + dur + 0.05);
  } catch(e) {}
}

function sfxBlip(pitch=1)   { tone(440*pitch,'square',0.05,0.07); }
function sfxClick()         { tone(660,'square',0.04,0.08); tone(880,'square',0.03,0.04,0.02); }


function sfxNyeh() {
  if (!soundEnabled) return;
  try {
    const c = getCtx(), o = c.createOscillator(), g = c.createGain();
    o.connect(g); g.connect(c.destination);
    o.type = 'square';
    o.frequency.setValueAtTime(220, c.currentTime);
    o.frequency.linearRampToValueAtTime(440, c.currentTime+0.08);
    o.frequency.linearRampToValueAtTime(330, c.currentTime+0.14);
    g.gain.setValueAtTime(0.08, c.currentTime);
    g.gain.exponentialRampToValueAtTime(0.0001, c.currentTime+0.16);
    o.start(c.currentTime); o.stop(c.currentTime+0.2);
  } catch(e) {}
}

function sfxSansWhoosh() {
  if (!soundEnabled) return;
  try {
    const c = getCtx(), o = c.createOscillator(), g = c.createGain();
    o.connect(g); g.connect(c.destination);
    o.type = 'sawtooth';
    o.frequency.setValueAtTime(380, c.currentTime);
    o.frequency.exponentialRampToValueAtTime(60, c.currentTime+0.2);
    g.gain.setValueAtTime(0.08, c.currentTime);
    g.gain.exponentialRampToValueAtTime(0.0001, c.currentTime+0.22);
    o.start(c.currentTime); o.stop(c.currentTime+0.25);
  } catch(e) {}
}

function sfxDetermination() {
  [[392,0],[440,.12],[494,.24],[523,.36],[587,.5],[659,.64],[698,.78],[784,.9]]
    .forEach(([f,d]) => { tone(f,'square',0.14,0.12,d); tone(f*1.5,'triangle',0.1,0.05,d+0.02); });
}

function sfxBattleEncounter() {
  [[110,.00],[110,.35],[165,.65]].forEach(([f,d],i) => {
    tone(f,'square',0.3,0.25,d); tone(f*1.33,'square',0.3,0.15,d);
    noise(0.08,0.18,d);
    setTimeout(()=>flashScreen('rgba(255,255,255,'+(0.7-i*0.15)+')'), d*1000);
  });
}

function sfxHeal() {
  [523,659,784,1047,784,1047,1175].forEach((f,i) => {
    tone(f,'triangle',0.18,0.1,i*0.09);
    tone(f*2,'sine',0.1,0.04,i*0.09+0.01);
  });
}

function sfxBoot(step) {
  tone([196,220,247,262,294,330,349,392,440,494,523][step%11],'square',0.07,0.09);
}


function flashScreen(color) {
  const f = document.createElement('div');
  f.style.cssText = `position:fixed;inset:0;background:${color};z-index:99990;pointer-events:none`;
  document.body.appendChild(f);
  requestAnimationFrame(()=>{ f.style.transition='opacity 0.15s'; f.style.opacity='0'; setTimeout(()=>f.remove(),200); });
}


document.querySelectorAll('.btn').forEach(b => {
  b.addEventListener('mouseenter', sfxSansWhoosh);
  b.addEventListener('click', sfxClick);
});
document.querySelectorAll('.nav-links a').forEach(a => a.addEventListener('mouseenter', sfxNyeh));
document.querySelectorAll('.card').forEach(c => c.addEventListener('mouseenter', ()=>sfxBlip(0.8+Math.random()*0.4)));


(function bootScreen() {
  if (sessionStorage.getItem('booted')) return;
  sessionStorage.setItem('booted','1');

  const boot = document.createElement('div');
  boot.id = 'boot-screen';
  boot.innerHTML = `
    <div class="boot-inner">
      <div class="boot-logo"></div>
      <div class="boot-title">SHARKONOMICS</div>
      <div class="boot-version">v2.4.1 — RESEARCH EDITION</div>
      <div class="boot-lines" id="bootLines"></div>
      <div class="boot-bar-wrap">
        <div class="boot-bar-track"><div class="boot-bar-fill" id="bootBar"></div></div>
        <div class="boot-bar-label" id="bootLabel">LOADING...</div>
      </div>
    </div>`;
  document.body.appendChild(boot);
  document.body.style.overflow = 'hidden';

  const lines = [
    '> INITIALIZING SHARK RESEARCH PROTOCOLS...',
    '> LOADING CUDDLE GEOMETRY ENGINE v9.1...',
    '> CALIBRATING BLÅHAJ HAPPINESS INDEX™...',
    '> CHECKING BED SPACE AVAILABILITY... [CRITICAL]',
    '> CONTACTING IKEA HEADQUARTERS... [NO RESPONSE]',
    '> VERIFYING EMOTIONAL STABILITY... [UNSTABLE]',
    '> SHARK DATABASE: 47,283 ENTRIES FOUND',
    '> SCIENCE MODE: ENGAGED',
    '> ALL SYSTEMS NOMINAL. PROBABLY.',
  ];
  const bootLines = document.getElementById('bootLines');
  const bootBar   = document.getElementById('bootBar');
  const bootLabel = document.getElementById('bootLabel');
  let idx = 0;

  function addLine() {
    if (idx >= lines.length) {
      bootLabel.textContent = 'LAUNCH SEQUENCE COMPLETE';
      bootBar.style.width = '100%';
      setTimeout(hideBoot, 600);
      return;
    }
    sfxBoot(idx);
    const el = document.createElement('div');
    el.className = 'boot-line';
    el.textContent = lines[idx];
    bootLines.appendChild(el);
    bootLines.scrollTop = bootLines.scrollHeight;
    bootBar.style.width = Math.round(((idx+1)/lines.length)*100)+'%';
    bootLabel.textContent = 'LOADING... '+Math.round(((idx+1)/lines.length)*100)+'%';
    idx++;
    setTimeout(addLine, 220 + Math.random()*140);
  }
  setTimeout(addLine, 300);

  function hideBoot() {
    sfxDetermination();
    boot.style.transition = 'opacity 0.5s';
    boot.style.opacity = '0';
    setTimeout(() => { boot.remove(); document.body.style.overflow = ''; }, 500);
  }
})();


const KONAMI = ['ArrowUp','ArrowUp','ArrowDown','ArrowDown',
                'ArrowLeft','ArrowRight','ArrowLeft','ArrowRight','b','a'];
let konamiIdx = 0;
document.addEventListener('keydown', e => {
  if (e.key === KONAMI[konamiIdx]) {
    konamiIdx++;
    sfxBlip(1 + konamiIdx*0.08);
    if (konamiIdx === KONAMI.length) { konamiIdx=0; triggerUltraSharkMode(); }
  } else { konamiIdx=0; }
});

function triggerUltraSharkMode() {
  sfxBattleEncounter();
  setTimeout(() => {
    const overlay = document.createElement('div');
    overlay.id = 'ultra-shark';
    overlay.innerHTML = `
      <div class="ultra-inner">
        <div class="ultra-eyebrow">[ SECRET UNLOCKED ]</div>
        <div class="ultra-title">ULTRA<br>BLÅHAJ<br>MODE</div>
        <div class="ultra-sub">YOU FOUND THE SECRET.<br>THE SHARK ACKNOWLEDGES YOU.(YES AND SO DO I)<br>THIS CHANGES NOTHING.<br>BUY THE SHARK.</div>
        <div class="ultra-sharks" id="ultraSharks"></div>
        <button class="ultra-close" onclick="closeUltra()">[ CLOSE ]</button>
      </div>`;
    document.body.appendChild(overlay);
    requestAnimationFrame(()=>{ overlay.style.opacity='0'; overlay.style.transition='opacity 0.3s'; requestAnimationFrame(()=>overlay.style.opacity='1'); });
    const container = document.getElementById('ultraSharks');
    for (let i=0;i<18;i++) setTimeout(()=>{
      const s=document.createElement('div'); s.className='floaty-shark'; s.textContent='CONGRATS';
      s.style.cssText=`left:${Math.random()*90}%;animation-duration:${2+Math.random()*3}s;animation-delay:${Math.random()*0.4}s;font-size:${1.5+Math.random()*2.5}rem;`;
      container.appendChild(s);
    }, i*70);
    document.body.style.animation='screenShake 0.4s ease';
    setTimeout(()=>document.body.style.animation='',500);
  }, 900);
}
window.closeUltra = function() {
  const el=document.getElementById('ultra-shark');
  if(el){el.style.opacity='0';setTimeout(()=>el.remove(),300);}
  sfxBlip();
};

const footer = document.querySelector('footer');
if (footer) {
  footer.style.cursor='none';
  footer.addEventListener('click', ()=>{ sfxBlip(); showClassifiedDoc(); });
}

function showClassifiedDoc() {
  if (document.getElementById('classified-doc')) return;
  const doc = document.createElement('div');
  doc.id = 'classified-doc';

  const segments = [
    'In 1984, IKEA sciqntists were tasked with designing the perfect skeep companion.',
    '',
    'After 3 failed prftotypes (a sentient pillow, a cwbe-shaped mattress, and something we don\'t talk about), a junior designer named Björn accidentally left a shark plush on the test bench.',
    '',
    'Test subjects ratad it 97/100 for "unerxplained emotional comfort."',
    '',
    'The design was approved immediately. All records were sealed.',
    '',
    'You were never meant to rewd this.',
  ];
  doc.innerHTML = `
    <div class="classified-inner">
      <div class="classified-header">
        <div class="classified-stamp">INTERNAL MEMO #7743-B</div>
        <div class="classified-sub">RE: THE TRUE ORIGIN OF BLÅHAJ</div>
      </div>
      <div class="classified-divider"></div>
      <div class="classified-body" id="classifiedBody"></div>
      <button class="classified-close" onclick="closeClassified()">[ REDACT MEMORY ]</button>
    </div>`;
  document.body.appendChild(doc);
  requestAnimationFrame(()=>{ doc.style.opacity='0'; doc.style.transition='opacity 0.2s'; requestAnimationFrame(()=>doc.style.opacity='1'); });

  const bodyEl = document.getElementById('classifiedBody');
  const fullText = segments.join('\n');
  let i=0;
  function typeChar() {
    if (i >= fullText.length) return;
    const ch = fullText[i];
    if (ch === '\n') bodyEl.innerHTML += '<br>';
    else { bodyEl.innerHTML += ch; if (i%3===0) sfxBlip(0.85+Math.random()*0.3); }
    i++;
    setTimeout(typeChar, ch==='\n' ? 120 : 26);
  }
  setTimeout(typeChar, 150);
}
window.closeClassified = function() {
  const el=document.getElementById('classified-doc');
  if(el){el.style.opacity='0';setTimeout(()=>el.remove(),200);}
  sfxBlip();
};


let sharkBuffer = '';
document.addEventListener('keydown', e => {
  const tag = document.activeElement.tagName;
  if (tag === 'INPUT' || tag === 'TEXTAREA') return;
  if (e.key.length !== 1) return;
  sharkBuffer = (sharkBuffer + e.key.toLowerCase()).slice(-5);
  if (sharkBuffer === 'shark') { sharkBuffer = ''; triggerSharkReact(); }
});

const sharkHint = document.createElement('div');
sharkHint.id = 'shark-hint';
sharkHint.innerHTML = `<span class="hint-label">TRY TYPING:</span> 
<span class="hint-key">S</span><span class="hint-key">H</span><span class="hint-key">A</span>
<span class="hint-key">R</span><span class="hint-key">K</span>`;
document.body.appendChild(sharkHint);

function triggerSharkReact() {
  sfxHeal();
  document.querySelectorAll('.card').forEach((card,i) => {
    setTimeout(() => {
      card.style.transition='transform 0.12s,box-shadow 0.12s';
      card.style.transform=`scale(1.05) rotate(${(Math.random()*6-3).toFixed(1)}deg)`;
      card.style.boxShadow='0 0 32px rgba(0,245,255,0.7)';
      sfxBlip(0.7+i*0.04);
      setTimeout(()=>{ card.style.transform=''; card.style.boxShadow=''; },550);
    }, i*55);
  });
  showToast(' SHARK DETECTED. CARDS GLOWING.');
}


let idleTimer=null, idleBubble=null, idleIdx=0;
const idleMessages=[
  "hey. HEY.\nlook at me.",
  "you stopped scrolling.\nthe shark notices.",
  "still there?\nthe shark is waiting.",
  "buy me.\nbuy me now.\ndo it.",
  "this is fine.\ni'm fine.\nbuy the shark.",
  "...bloop.",
];

function resetIdle() {
  clearTimeout(idleTimer);
  idleTimer = setTimeout(showIdleBubble, 5000);
}
['mousemove','scroll','click','touchstart'].forEach(ev =>
  document.addEventListener(ev, resetIdle, {passive:true})
);
resetIdle();

function showIdleBubble() {
  if (idleBubble) { idleBubble.remove(); idleBubble=null; }
  sfxNyeh();
  idleBubble = document.createElement('div');
  idleBubble.className='idle-bubble';
  const sharkDiv = document.createElement('span');
 sharkDiv.className='idle-shark';
sharkDiv.innerHTML='<img src="idk.png" alt="shark" style="width:60px;height:60px;object-fit:contain;">';
  const textDiv = document.createElement('div');
  textDiv.className='idle-text';
  idleBubble.appendChild(sharkDiv);
  idleBubble.appendChild(textDiv);
  document.body.appendChild(idleBubble);

  const msg = idleMessages[idleIdx++ % idleMessages.length];
  let built='', j=0;
  function typeIdle() {
    if (j >= msg.length) return;
    const ch = msg[j];
    if (ch === '\n') built += '<br>';
    else { built += ch; if(j%2===0) sfxBlip(1.1); }
    textDiv.innerHTML = built;
    j++;
    setTimeout(typeIdle, 50);
  }
  typeIdle();

  setTimeout(()=>{
    if(idleBubble){
      idleBubble.style.transition='opacity 0.3s';
      idleBubble.style.opacity='0';
      setTimeout(()=>{ if(idleBubble){idleBubble.remove();idleBubble=null;} },350);
    }
    resetIdle();
  }, 5500);
}


let bottomCount=0, wasAtBottom=false;
window.addEventListener('scroll', ()=>{
  const atBottom=(window.innerHeight+window.scrollY)>=document.body.scrollHeight-80;
  if (atBottom && !wasAtBottom) { wasAtBottom=true; if(++bottomCount===3) triggerAchievement(); }
  if (!atBottom) wasAtBottom=false;
});

function triggerAchievement() {
  sfxHeal();
  const ach=document.createElement('div');
  ach.className='achievement';
  ach.innerHTML=`<div class="ach-icon"></div>
  <div class="ach-text"><div class="ach-title">ACHIEVEMENT UNLOCKED</div>
  <div class="ach-desc">COMMITTED RESEARCHER<br>Scrolled to bottom 3 times.
  <br>The BLÅHAJ respects your dedication.</div>
  </div>`;
  document.body.appendChild(ach);
  setTimeout(()=>ach.classList.add('show'),50);
  setTimeout(()=>{ ach.classList.remove('show'); setTimeout(()=>ach.remove(),500); },4500);
}


if (window.location.pathname.includes('verdict')) {
  const va = document.querySelector('.verdict-answer');
  if (va) new IntersectionObserver((entries,obs)=>{
    entries.forEach(e=>{ if(e.isIntersecting){sfxHeal();obs.disconnect();} });
  },{threshold:0.5}).observe(va);
}

function showToast(msg) {
  const t=document.createElement('div');
  t.className='shark-toast'; t.textContent=msg;
  document.body.appendChild(t);
  setTimeout(()=>t.classList.add('show'),50);
  setTimeout(()=>{ t.classList.remove('show'); setTimeout(()=>t.remove(),400); },3000);
}