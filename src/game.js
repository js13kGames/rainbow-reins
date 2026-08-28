/* Rainbow Reins — js13kGames 2026 entry (theme: Unicorns and Rainbows)
   Slim build: campaign only. Engine (sim / reverse-built levels / exact par)
   is shared with the full version and untouched. */
/* ---------- Markup lives in JS so the packer squeezes it all ---------- */
document.head.appendChild(Object.assign(document.createElement('style'), { textContent:
'*{box-sizing:border-box;margin:0;padding:0}html,body{height:100%}' +
'body{background:#fff6fa;color:#8f2b52;overflow:hidden;font:700 16px/1.5 "Comic Sans MS","Chalkboard SE","Segoe UI",sans-serif;touch-action:manipulation;-webkit-tap-highlight-color:transparent}' +
'.v{position:absolute;inset:0;display:none;flex-direction:column;align-items:center;gap:10px;padding:12px}' +
'button{font:inherit;color:#a94a70;background:#fff;border:2px solid #f6cdde;border-radius:14px;padding:9px 16px;cursor:pointer}' +
'button:hover:not(:disabled){color:#c92e6d;border-color:#f04f92}button:disabled{opacity:.4}button:focus-visible{outline:3px solid #f04f92}' +
'.p{color:#fff;background:#d92e74;border-color:#d92e74}.p:hover:not(:disabled){color:#fff;background:#e63d81}' +
'h1{font-size:clamp(30px,9vw,56px);color:#f2307f;text-shadow:0 3px 0 #fff,0 6px 0 #f3b9d3;letter-spacing:.04em}' +
'.rbw{width:150px;height:6px;border-radius:3px;background:linear-gradient(90deg,#ff2571,#ff9725,#ffe325,#5eff25,#2571ff,#5f25ff)}' +
'.tag{color:#a94a70;text-align:center}.mini{font-size:13px;color:#ad5378}' +
'#vtitle{justify-content:center}#vtitle>*{position:relative}' +
'#d{position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);width:min(560px,92vw);height:min(560px,92vw);opacity:.35;pointer-events:none}' +
'.menu{display:flex;flex-direction:column;gap:8px;width:min(280px,90vw)}.row{display:flex;gap:8px;justify-content:center;flex-wrap:wrap}' +
'#stage{flex:1;align-self:stretch;min-height:0;position:relative}#b{display:block;cursor:pointer}' +
'#hud{display:flex;gap:12px;align-items:center;font-size:14px;color:#a94a70;flex-wrap:wrap;justify-content:center}'+
'#chips i{display:inline-block;width:12px;height:12px;transform:rotate(45deg);border:2.5px solid;border-radius:3px;margin:0 3px;opacity:.85}' +
'#lvs{flex:1;overflow-y:auto;align-self:stretch;max-width:640px;margin:0 auto;width:100%}' +
'.chh{margin:12px 0 6px}' +
'.lvg{display:grid;grid-template-columns:repeat(auto-fill,minmax(56px,1fr));gap:7px}' +
'.lv{aspect-ratio:1;display:flex;flex-direction:column;align-items:center;justify-content:center;font-size:16px}' +
'.lv i{font-style:normal;font-size:9px;color:#e8b7cc}.lv.cl{border-color:#f04f92}.lv.cl i{color:#f0a022}' +
'#ov,#how{position:absolute;inset:0;display:none;align-items:center;justify-content:center;background:rgba(253,236,243,.85);z-index:9}' +
'.card{background:#fff;border:2px solid #f6cdde;border-radius:18px;padding:22px;text-align:center;max-width:92vw}' +
'.card h2{color:#f2307f}.card p{font-weight:400;color:#a94a70;font-size:14px;margin:8px 0;text-align:left}.card p b{color:#c92e6d}' +
'#ovStars{font-size:30px;color:#f0a022;margin:6px 0}' +
'#toast{position:absolute;left:50%;bottom:70px;transform:translateX(-50%);background:#fff;border:2px solid #f04f92;border-radius:999px;padding:7px 16px;font-size:14px;opacity:0;transition:opacity .2s;pointer-events:none;z-index:10}'
}));
document.body.innerHTML =
'<div class="v" id="vtitle" style="display:flex"><canvas id="d"></canvas>' +
'<h1>RAINBOW REINS</h1><div class="rbw"></div>' +
'<div class="tag">Bounce the beam, light every cake.</div>' +
'<div class="menu"><button class="p" id="bPlay">Play</button><button id="bLvls">Levels</button><button id="bHow">How to play</button>' +
'<div class="row"><button id="bMus" style="flex:1"></button><button id="bSnd" style="flex:1"></button></div></div>' +
'<div class="mini" id="tStars"></div><div class="mini">Yellow Jasmine &middot; js13k 2026</div></div>' +
'<div class="v" id="vlevels"><div class="row" style="align-self:stretch"><button id="bBack">&larr; Back</button></div><div id="lvs"></div></div>' +
'<div class="v" id="vgame"><div id="hud"><button id="gBack">&larr;</button>' +
'<span>lv <b id="hLv"></b></span><span>moves <b id="hMv"></b></span><span>par <b id="hPar"></b></span>' +
'<span id="hCh" style="color:#c92e6d"></span><span id="chips"></span>' +
'<button id="bUndo">undo</button><button id="bReset">reset</button><button id="bHint">hint</button></div>' +
'<div id="stage"><canvas id="b"></canvas></div><div id="toast"></div>' +
'<div id="ov"><div class="card"><h2>NOM NOM!</h2><div class="mini" id="ovSub"></div><div id="ovStars"></div><div class="mini" id="ovStat"></div>' +
'<div class="row" style="margin-top:12px"><button id="bRetry">Retry</button><button class="p" id="bNext">Next &rarr;</button></div></div></div></div>' +
'<div id="how"><div class="card"><h2>How to play</h2>' +
'<p><b>Tap a plate to spin it.</b> Plates bend the beam 90&deg;, double plates split it.</p>' +
'<p><b>Light every cake with its exact plate color.</b> Beams pass through cakes; crossing beams mix &mdash; red+green=yellow, all three=rainbow.</p>' +
'<p><b>Donuts</b> pass one color. <b>Stars</b> cycle r&rarr;g&rarr;b. <b>Choco blocks</b> eat beams.</p>' +
'<p>Beat par for &starf;&starf;&starf;. Hints cap you at &starf;&starf;.</p>' +
'<div class="row"><button class="p" id="bHowX">Got it</button></div></div></div>';

/* ---------- English display names (engine ships Korean labels) ---------- */
'Trot,Split,Sift,Spin,Stampede'.split(',').forEach(function (nm, ci) { CHAPTERS[ci].name = nm; });

var MIX = { 1: '#ff2571', 2: '#5eff25', 3: '#ffe325', 4: '#2571ff', 5: '#ff25d7', 6: '#25d7ff', 7: '#c77dff' };
var RB = ['#ff2571', '#ff9725', '#ffe325', '#5eff25', '#2571ff', '#5f25ff', '#ff25d7'];
var TUBE = {};                      /* 밝음/본색/어두움 — MIX 에서 파생 */
for (var tm = 1; tm < 7; tm++) TUBE[tm] = [.5, 0, .28].map(function (f, j) {
  var h = parseInt(MIX[tm].slice(1), 16), c = i2 => (h >> i2) & 255;
  var v = i2 => j ? (j === 2 ? c(i2) * .72 : c(i2)) : c(i2) + (255 - c(i2)) * f;
  return 'rgb(' + [v(16) | 0, v(8) | 0, v(0) | 0] + ')';
});

/* ---------- Sprites: one packed indexed-palette bin ---------- */
var UNI = null, CAKE = null;
var FIRE = [0, 1, 2], FOUND = [3, 4], WALK = [5, 6];
(function () {
  /*PIX*/
  var AL = '!#$%&()*+,-./0123456789:;<=>?@ABCDEFGHIJKLMNOPQRSTUVWXYZ[]^_abcdefghij';
  var rev = {};
  for (var i = 0; i < AL.length; i++) rev[AL[i]] = i;
  function sheet(str, w, h) {
    var cv = document.createElement('canvas'); cv.width = w; cv.height = h;
    var c = cv.getContext('2d'), im = c.createImageData(w, h), d = im.data;
    for (var i = 0; i < w * h; i++) {
      var v = rev[str[i]];
      if (!v) continue;
      var o = i * 4, ci = (v - 1) * 6;
      d[o] = parseInt(PAL.substr(ci, 2), 16);
      d[o + 1] = parseInt(PAL.substr(ci + 2, 2), 16);
      d[o + 2] = parseInt(PAL.substr(ci + 4, 2), 16);
      d[o + 3] = 255;
    }
    c.putImageData(im, 0, 0); return cv;
  }
  UNI = sheet(PIXU, NF * 50, 50);
  CAKE = sheet(PIXC, 48, 48);
})();

/* ---------- Save (namespaced per js13k shared-origin rule) ---------- */
var KEY = 'rainbowreins.v1';
var save = { stars: {}, max: 1, snd: 1, mus: 1 };
try { var _r = localStorage.getItem(KEY); if (_r) { var _p = JSON.parse(_r); for (var _k in _p) save[_k] = _p[_k]; } } catch (e) { }
function persist() { try { localStorage.setItem(KEY, JSON.stringify(save)); } catch (e) { } }
function stars() { var t = 0; for (var k in save.stars) t += save.stars[k]; return t; }

/* ---------- Audio: blips + a little gallop chiptune ---------- */
var AC = null;
function actx() {
  if (!AC) { try { AC = new (window.AudioContext || window.webkitAudioContext)(); } catch (e) { AC = 0; } }
  if (AC && AC.state === 'suspended') AC.resume();
  return AC || null;
}
function blip(f, f2, d, type, g, at) {
  if (!save.snd) return;
  var c = actx(); if (!c) return;
  var t = c.currentTime + (at || 0), o = c.createOscillator(), v = c.createGain();
  o.type = type || 'sine'; o.frequency.setValueAtTime(f, t);
  if (f2) o.frequency.exponentialRampToValueAtTime(f2, t + d);
  v.gain.setValueAtTime(.0001, t);
  v.gain.linearRampToValueAtTime(g || .08, t + .006);
  v.gain.exponentialRampToValueAtTime(.0001, t + d);
  o.connect(v); v.connect(c.destination); o.start(t); o.stop(t + d + .03);
}
var sSpin = function () { blip(420, 250, .085, 'triangle', .09); };
var sNo = function () { blip(120, 0, .1, 'sawtooth', .03); };
var sLit = function () { blip(784, 0, .3, 'sine', .09); blip(1176, 0, .26, 'sine', .04, .015); };
var sWin = function () { [523, 659, 784, 1047].forEach(function (f, i) { blip(f, 0, .4, 'sine', .08, i * .085); }); };
var sCrunch = function () { blip(170, 78, .09, 'sawtooth', .13); };
/* cake eating: every cake gets eaten — unicorns split the work and tour their share */
var FH = .8, FW = .6, FB = .22, _bcv = null;   /* hearts / walk / per-bite */
function planFeast(g) {
  var ems = [], cakes = [], i, X = i => i % g.w, Y = i => i / g.w | 0;
  for (i = 0; i < g.cells.length; i++) {
    if (g.cells[i].t === T_EMIT) ems.push(i);
    else if (g.cells[i].t === T_TARGET) cakes.push(i);
  }
  var bk = ems.map(() => []), leg = FW + 3 * FB, mx = 0, cr = [];
  var near = (arr, fx, fy, pen) => {
    var b = 0, bd = 1e9;
    arr.forEach((v, k) => {
      var d = Math.abs(X(v) - fx) + Math.abs(Y(v) - fy) + (pen ? pen(k) : 0);
      if (d < bd) { bd = d; b = k; }
    });
    return b;
  };
  cakes.forEach(ci => bk[near(ems, X(ci), Y(ci), k => bk[k].length * 2)].push(ci));
  ems.forEach((ei, k) => {
    var px = X(ei), py = Y(ei), list = bk[k].slice(), legs = [];
    while (list.length) {
      var ci = list.splice(near(list, px, py), 1)[0], dr = px >= X(ci) ? 1 : -1;
      var t0 = FH + legs.length * leg;
      legs.push({ i: ci, d: dr });
      g.cells[ci]._eat = { s: t0 + FW, d: dr };
      for (var b2 = 0; b2 < 3; b2++) cr.push(t0 + FW + b2 * FB);
      px = X(ci) + dr * .8; py = Y(ci);
    }
    g.cells[ei]._legs = legs;
    if (legs.length > mx) mx = legs.length;
  });
  return { dur: FH + mx * leg + .5, cr: cr };
}
function drawEaten(c2, cx, cy, u, bites, dir) {
  if (!_bcv) { _bcv = document.createElement('canvas'); _bcv.width = _bcv.height = 48; }
  var b2 = _bcv.getContext('2d');
  b2.setTransform(1, 0, 0, 1, 0, 0);
  b2.clearRect(0, 0, 48, 48);
  b2.imageSmoothingEnabled = false;
  b2.drawImage(CAKE, 0, 0);
  b2.globalCompositeOperation = 'destination-out';
  var ex = dir > 0 ? 40 : 8, into = dir > 0 ? Math.PI : 0;
  [[ex, 15, 9], [ex - dir * 5, 30, 11], [24, 22, 15]].slice(0, bites).forEach(function (B) {
    b2.beginPath(); b2.arc(B[0], B[1], B[2], 0, 7); b2.fill();
    for (var k = -2; k <= 2; k++) {
      var a = into + k * .42;
      b2.beginPath(); b2.arc(B[0] + Math.cos(a) * B[2], B[1] + Math.sin(a) * B[2], B[2] * .26, 0, 7); b2.fill();
    }
  });
  b2.globalCompositeOperation = 'source-over';
  c2.drawImage(_bcv, cx - 24 * u, cy - 22 * u, 48 * u, 48 * u);
}

/* Gallop loop: clip-clop noise + triangle bass + square lead. 2 bars, 4 chords. */
var musTimer = 0, musNext = 0;
function clop(t) {
  var c = AC, buf = c.createBuffer(1, c.sampleRate * .05, c.sampleRate), d = buf.getChannelData(0);
  for (var i = 0; i < d.length; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / d.length);
  var src = c.createBufferSource(), f = c.createBiquadFilter(), g = c.createGain();
  src.buffer = buf; f.type = 'bandpass'; f.frequency.value = 1800; f.Q.value = 6;
  g.gain.value = .12;
  src.connect(f); f.connect(g); g.connect(c.destination); src.start(t);
}
function note(t, f, d, type, g) {
  var c = AC, o = c.createOscillator(), v = c.createGain();
  o.type = type; o.frequency.value = f;
  v.gain.setValueAtTime(.0001, t);
  v.gain.linearRampToValueAtTime(g, t + .01);
  v.gain.exponentialRampToValueAtTime(.0001, t + d);
  o.connect(v); v.connect(c.destination); o.start(t); o.stop(t + d + .02);
}
var CHORDS = [[262, 330, 392], [196, 294, 392], [220, 262, 330], [175, 262, 349]];
function schedule() {
  if (!save.mus || !AC) return;
  var beat = 60 / 132, bar = beat * 3;                 /* 12/8 gallop */
  while (musNext < AC.currentTime + .6) {
    for (var b = 0; b < 4; b++) {                      /* 4 chords = 1 loop */
      var t0 = musNext + b * bar, ch = CHORDS[b];
      note(t0, ch[0] / 2, bar * .9, 'triangle', .07);  /* bass */
      for (var s = 0; s < 3; s++) {                    /* lead arp */
        note(t0 + s * beat, ch[(s + b) % 3] * 2, beat * .7, 'square', .022);
      }
      clop(t0); clop(t0 + beat * .66); clop(t0 + beat);  /* da-da-DUM */
    }
    musNext += bar * 4;
  }
}
function music(on) {
  save.mus = on ? 1 : 0; persist();
  var b = document.getElementById('bMus');
  if (b) b.textContent = on ? '♪ music: on' : '♪ music: off';
  if (on) { if (actx()) { musNext = Math.max(musNext, AC.currentTime + .05); if (!musTimer) musTimer = setInterval(schedule, 250); } }
  else if (musTimer) { clearInterval(musTimer); musTimer = 0; }
}

/* ---------- State ---------- */
var $ = function (s) { return document.querySelector(s); };
var RED = matchMedia('(prefers-reduced-motion: reduce)').matches;
var S = { view: 'title', id: 1, lv: null, g: null, sim: null, L: null,
  moves: 0, hints: 0, undo: [], done: false, winAt: 0, ang: null, angTo: null,
  parts: [], cur: -1, W: 0, H: 0 };

var cv = $('#b'), ctx = null;

function layout(cw, chh, w, h) {
  var cs = Math.max(24, Math.floor(Math.min(cw / (w + .7), chh / (h + .7))));
  return { cs: cs, ox: Math.round((cw - cs * w) / 2), oy: Math.round((chh - cs * h) / 2), bw: cs * w, bh: cs * h };
}
function fit() {
  if (!S.g) return;
  var r = $('#stage').getBoundingClientRect();
  S.W = Math.max(100, r.width | 0); S.H = Math.max(100, r.height | 0);
  var dpr = Math.min(2, devicePixelRatio || 1);
  cv.style.width = S.W + 'px'; cv.style.height = S.H + 'px';
  cv.width = S.W * dpr; cv.height = S.H * dpr;
  ctx = cv.getContext('2d'); ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  S.L = layout(S.W, S.H, S.g.w, S.g.h);
}

function show(v) {
  S.view = v;
  ['title', 'levels', 'game'].forEach(function (n) { $('#v' + n).style.display = n === v ? 'flex' : 'none'; });
  if (v === 'game') { requestAnimationFrame(fit); setTimeout(fit, 120); }
  if (v === 'levels') buildLevels();
  if (v === 'title') menu();
}

/* ---------- Level flow ---------- */
function load(id) {
  var lv = campaignLevel(id);
  if (!lv) return false;
  S.id = id; S.lv = lv;
  S.g = { w: lv.w, h: lv.h, cells: cloneCells(lv.cells) };
  S.g0 = cloneCells(lv.cells);
  S.moves = 0; S.hints = 0; S.undo = []; S.done = false; S.winAt = 0;
  S.parts = []; S.cur = -1;
  S.ang = []; S.angTo = [];
  for (var i = 0; i < S.g.cells.length; i++) {
    var a = S.g.cells[i].s ? Math.PI / 4 : -Math.PI / 4;
    S.ang[i] = a; S.angTo[i] = a;
  }
  $('#ov').style.display = 'none';
  sim(true); hud(); fit();
  return true;
}
function sim(silent) {
  var prev = S.sim && S.sim.lit;
  S.sim = simulate(S.g, false);
  var tl = targetList(S.g), lit = 0;
  tl.forEach(function (i) {
    if (S.sim.lit[i] === S.g.cells[i].req) {
      lit++;
      if (!silent && prev && prev[i] !== S.g.cells[i].req) { burst(i); sLit(); }
    }
  });
  chips();
  if (!S.done && lit === tl.length && tl.length) win();
}
function burst(i) {
  if (RED || !S.L) return;
  var cs = S.L.cs, x = S.L.ox + (i % S.g.w) * cs + cs / 2, y = S.L.oy + ((i / S.g.w) | 0) * cs + cs / 2;
  for (var k = 0; k < 14; k++) {
    var a = Math.random() * 6.28, sp = cs * (.6 + Math.random() * 1.6);
    S.parts.push({ x: x, y: y, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp,
      l: .5 + Math.random() * .35, m: .85, r: cs * (.03 + Math.random() * .04), c: RB[k % 7] });
  }
}
function spin(i, count) {
  var c = S.g.cells[i];
  if (!isRotatable(c)) return;
  c.s ^= 1; S.angTo[i] += Math.PI / 2;
  if (count !== false) { S.undo.push(i); S.moves++; }
  sSpin(); sim(false); hud();
}
function undo() {
  if (!S.undo.length || S.done) return;
  var i = S.undo.pop();
  S.g.cells[i].s ^= 1; S.angTo[i] -= Math.PI / 2;
  S.moves--; blip(230, 160, .09, 'sine', .07); sim(true); hud();
}
function reset() {
  if (S.done) return;
  S.g.cells = cloneCells(S.g0);
  S.moves = 0; S.undo = []; S.parts = [];
  for (var i = 0; i < S.g.cells.length; i++) {
    var a = S.g.cells[i].s ? Math.PI / 4 : -Math.PI / 4;
    S.ang[i] = a; S.angTo[i] = a;
  }
  S.sim = null; sim(true); hud();
}
function hint() {
  if (S.done) return;
  var wrong = S.lv.rot.filter(function (i) { return S.g.cells[i].s !== S.lv.solution[i]; });
  if (!wrong.length) { toast('Already solved!'); return; }
  S.hints++; S.cur = wrong[0];
  spin(S.cur);
  toast('Hint! capped at ★★');
}
function starsFor() {
  var p = S.lv.par, s = S.moves <= p ? 3 : S.moves <= p + Math.max(2, Math.ceil(p * .6)) ? 2 : 1;
  if (S.hints) s = Math.min(s, S.hints >= 2 ? 1 : 2);
  return s;
}
function win() {
  S.done = true; S.winAt = performance.now() / 1000;
  sWin();
  targetList(S.g).forEach(burst);
  var st = starsFor();
  save.stars[S.id] = Math.max(save.stars[S.id] || 0, st);
  if (S.id + 1 > save.max) save.max = Math.min(TOTAL_LEVELS, S.id + 1);
  persist(); hud();
  S.feast = planFeast(S.g);
  S.feast.cr.forEach(function (ct) {
    setTimeout(function () { if (S.done) sCrunch(); }, ct * 1000);
  });
  setTimeout(function () {
    $('#ovSub').textContent = 'lv ' + S.id;
    $('#ovStars').textContent = '★'.repeat(st) + '☆'.repeat(3 - st);
    $('#ovStat').textContent = S.moves + ' moves · par ' + S.lv.par + ' · ★ ' + stars();
    $('#bNext').textContent = S.id >= TOTAL_LEVELS ? 'All clear!' : 'Next →';
    $('#ov').style.display = 'flex';
  }, S.feast.dur * 1000 + 200);
}

/* ---------- HUD ---------- */
function hud() {
  $('#hLv').textContent = S.id;
  $('#hMv').textContent = S.moves;
  $('#hPar').textContent = S.lv.par;
  $('#hCh').textContent = CHAPTERS[Math.min(4, Math.ceil(S.id / LEVELS_PER_CH) - 1)].name;
  $('#bUndo').disabled = !S.undo.length || S.done;
}
function chips() {
  var el = $('#chips'), tl = targetList(S.g), h = '';
  tl.forEach(function (i) {
    var ok = S.sim.lit[i] === S.g.cells[i].req;
    h += '<i style="color:' + MIX[S.g.cells[i].req] + (ok ? ';background:currentColor;box-shadow:0 0 8px currentColor;opacity:1' : '') + '"></i>';
  });
  el.innerHTML = h;
}
var toastT = 0;
function toast(m) {
  var t = $('#toast'); t.textContent = m; t.style.opacity = 1;
  clearTimeout(toastT); toastT = setTimeout(function () { t.style.opacity = 0; }, 1900);
}
function menu() {
  $('#bPlay').textContent = (save.max > 1 ? 'Continue' : 'Play') + ' · lv ' + Math.min(TOTAL_LEVELS, save.max);
  $('#tStars').textContent = '★ ' + stars() + ' / ' + TOTAL_LEVELS * 3;
  music(save.mus);
}
function buildLevels() {
  var h = '';
  for (var c = 0; c < 5; c++) {
    h += '<div class="chh">' + CHAPTERS[c].name + '</div><div class="lvg">';
    for (var q = 1; q <= LEVELS_PER_CH; q++) {
      var id = c * LEVELS_PER_CH + q, st = save.stars[id] || 0, lock = id > save.max;
      h += '<button class="lv' + (st ? ' cl' : '') + '"' + (lock ? ' disabled' : '') +
        ' data-id="' + id + '">' + id + '<i>' +
        '★'.repeat(st) + '☆'.repeat(3 - st) + '</i></button>';
    }
    h += '</div>';
  }
  $('#lvs').innerHTML = h;
}

/* ---------- Render ---------- */
function beamFrame(t) { return RED ? 0 : (t * 7 | 0) % 3; }

function drawBoard(c2, L, g, smRes, t, alpha) {
  var cs = L.cs, ox = L.ox, oy = L.oy, u = cs / 48, x, y, i, d;
  /* plate + checker */
  var pad = Math.round(cs * .18);
  c2.fillStyle = '#fff0f6';
  c2.beginPath(); c2.roundRect(ox - pad, oy - pad, L.bw + pad * 2, L.bh + pad * 2, cs * .3); c2.fill();
  c2.strokeStyle = '#f2b9d1'; c2.lineWidth = 2; c2.stroke();
  for (y = 0; y < g.h; y++) for (x = 0; x < g.w; x++) {
    c2.fillStyle = (x + y) % 2 ? '#ffe9f2' : '#fff';
    c2.fillRect(ox + x * cs, oy + y * cs, cs, cs);
  }
  c2.strokeStyle = '#eba7c6'; c2.lineWidth = Math.max(2, cs * .05);
  c2.strokeRect(ox, oy, L.bw, L.bh);

  /* beams */
  if (alpha <= 0) { /* skip */ } else {
    c2.save();
    c2.globalAlpha = alpha;
    var bw2 = 7 * u, half = cs / 2 + u, fr = beamFrame(t);
    function band(cx0, cy0, d, m) {
      var hz = d === 1 || d === 3, sh = 1.5 * u;
      var x0 = d === 1 ? cx0 : cx0 - half, y0 = d === 2 ? cy0 : cy0 - half;
      c2.fillStyle = 'rgba(236,140,180,.32)';
      if (hz) c2.fillRect(d === 1 ? cx0 : cx0 - half, cy0 - bw2 / 2 - sh, half, bw2 + sh * 2);
      else c2.fillRect(cx0 - bw2 / 2 - sh, d === 2 ? cy0 : cy0 - half, bw2 + sh * 2, half);
      var rows = [];
      if (m === 7) { for (var r = 0; r < 7; r++) rows.push(r === 0 || r === 6 ? '#fff' : RB[(r - 1 + fr * 2) % 7]); }
      else { var tb = TUBE[m] || TUBE[1];
        rows = ['#fff', tb[0], tb[(0 + fr) % 3], tb[(1 + fr) % 3], tb[(2 + fr) % 3], tb[0], '#fff']; }
      var rh = bw2 / 7;
      for (var r2 = 0; r2 < 7; r2++) {
        c2.fillStyle = rows[r2];
        if (hz) c2.fillRect(x0, cy0 - bw2 / 2 + r2 * rh, half, rh + .5);
        else c2.fillRect(cx0 - bw2 / 2 + r2 * rh, y0, rh + .5, half);
      }
    }
    for (y = 0; y < g.h; y++) for (x = 0; x < g.w; x++) {
      i = y * g.w + x;
      var cx0 = ox + x * cs + cs / 2, cy0 = oy + y * cs + cs / 2, hH = 0, hV = 0;
      for (d = 0; d < 4; d++) {
        var m = smRes.edge[i * 4 + d];
        if (!m) continue;
        band(cx0, cy0, d, m);
        if (d === 1 || d === 3) hH |= m; else hV |= m;
      }
      if (hH && hV && g.cells[i].t === T_EMPTY) {
        star(c2, cx0, cy0, (4 + (RED ? 0 : Math.sin(t * 6) * 1.2)) * u, MIX[hH | hV] || '#fff');
        c2.fillStyle = '#fff';
        c2.beginPath(); c2.arc(cx0, cy0, 2 * u, 0, 7); c2.fill();
      }
    }
    c2.restore();
  }
}
function star(c2, x, y, r, col) {
  c2.fillStyle = col;
  c2.beginPath();
  c2.moveTo(x, y - r * 1.7); c2.quadraticCurveTo(x, y, x + r * 1.7, y);
  c2.quadraticCurveTo(x, y, x, y + r * 1.7);
  c2.quadraticCurveTo(x, y, x - r * 1.7, y);
  c2.quadraticCurveTo(x, y, x, y - r * 1.7);
  c2.fill();
}
function plateStick(c2, cx, cy, u, ang) {
  c2.save(); c2.translate(cx, cy); c2.rotate(ang + Math.PI / 4);
  c2.lineCap = 'round';
  c2.lineWidth = 7 * u; c2.strokeStyle = '#fb7fa4';
  c2.beginPath(); c2.moveTo(-16 * u, 0); c2.lineTo(16 * u, 0); c2.stroke();
  c2.lineWidth = 3.4 * u; c2.strokeStyle = '#fff';
  c2.beginPath(); c2.moveTo(-15 * u, 0); c2.lineTo(15 * u, 0); c2.stroke();
  c2.restore();
}
function uni(c2, fi, x, y, u, dir, eye) {
  if (!UNI) return;
  c2.save(); c2.translate(x, y);
  if (dir === 3) c2.scale(-1, 1);
  if (dir === 2) c2.rotate(Math.PI / 2);
  if (dir === 0) c2.rotate(-Math.PI / 2);
  c2.imageSmoothingEnabled = u < 1;
  c2.drawImage(UNI, fi * 50, 0, 50, 50, -25 * u, (-25 + (eye ? 7 : 0)) * u, 50 * u, 50 * u);
  c2.restore();
}
function drawCellSlim(c2, g, i, c, cx, cy, cs, ang, lit, t, winAt) {
  var u = cs / 48, k;
  switch (c.t) {
    case T_MIRROR:
      plateStick(c2, cx, cy, u, ang - Math.PI / 4);
      break;
    case T_SPLIT:
      c2.save(); c2.translate(cx, cy); c2.rotate(ang - Math.PI / 4); c2.translate(-cx, -cy);
      plateStick(c2, cx + 3 * u, cy - 3 * u, u * .9, 0);
      plateStick(c2, cx - 3 * u, cy + 3 * u, u * .9, 0);
      c2.restore();
      break;
    case T_FILTER:
      c2.lineWidth = 8 * u;
      c2.strokeStyle = '#f3e2c7';
      c2.beginPath(); c2.arc(cx, cy + u, 15 * u, 0, 7); c2.stroke();
      c2.strokeStyle = MIX[c.c];
      c2.beginPath(); c2.arc(cx, cy - u, 15 * u, 0, 7); c2.stroke();
      c2.fillStyle = '#fff';
      for (k = 0; k < 4; k++) {
        var aa = k * 1.57 + .4;
        c2.fillRect(cx + Math.cos(aa) * 15 * u - 1.5 * u, cy - u + Math.sin(aa) * 15 * u - u, 3 * u, 1.6 * u);
      }
      break;
    case T_SHIFT:
      var sr = 16 * u, sp = RED ? 0 : t * .8;
      c2.save(); c2.translate(cx, cy);
      c2.fillStyle = '#fff6fb'; c2.strokeStyle = '#e5a8c6'; c2.lineWidth = 2 * u;
      c2.beginPath();
      for (k = 0; k < 10; k++) {
        var ra = k % 2 ? sr * .45 : sr, ka = -Math.PI / 2 + k * Math.PI / 5;
        c2[k ? 'lineTo' : 'moveTo'](Math.cos(ka) * ra, Math.sin(ka) * ra);
      }
      c2.closePath(); c2.fill(); c2.stroke();
      [1, 2, 4].forEach(function (m, j) {
        var da = sp + j * 2.09 - Math.PI / 2;
        c2.fillStyle = MIX[m];
        c2.beginPath(); c2.arc(Math.cos(da) * sr * .42, Math.sin(da) * sr * .42, 2.6 * u, 0, 7); c2.fill();
      });
      c2.restore();
      break;
    case T_WALL: {
      /* pixel choco bar — same pixel grid as the sprites (1px = u) */
      var P = (x, y, w2, h2, col) => {
        c2.fillStyle = col;
        c2.fillRect(cx + (x - 24) * u, cy + (y - 24) * u, w2 * u, h2 * u);
      };
      P(9, 7, 30, 2, '#8f544e'); P(9, 39, 30, 2, '#8f544e');
      P(7, 9, 2, 30, '#8f544e'); P(39, 9, 2, 30, '#8f544e');
      P(9, 9, 30, 30, '#b97770');
      P(9, 9, 30, 2, '#d9a49b'); P(9, 9, 2, 30, '#d9a49b');
      P(23, 9, 2, 30, '#8f544e'); P(9, 23, 30, 2, '#8f544e');
      [[12, 12], [26, 12], [12, 26], [26, 26]].forEach(st => P(st[0], st[1], 4, 2, '#d9a49b'));
      break;
    }
    case T_EMIT: {
      var feasting = false;
      if (winAt && c._legs) {
        var wt = t - winAt;
        if (wt > 0) {
          feasting = true;
          var leg = FW + 3 * FB, legs = c._legs;
          var st = L2 => [S.L.ox + ((L2.i % g.w) + .5 + L2.d * .8) * cs,
                          S.L.oy + ((L2.i / g.w | 0) + .5) * cs];
          var px = cx, py = cy, fi2, flip = c.s === 3;
          if (wt < FH || !legs.length) {
            fi2 = FOUND[(t * 4 | 0) % 2];
            if (legs.length) flip = st(legs[0])[0] < cx - 2;
          } else {
            var k2 = Math.min(legs.length - 1, (wt - FH) / leg | 0);
            var lt = wt - FH - k2 * leg;
            var fr2 = k2 ? st(legs[k2 - 1]) : [cx, cy], to = st(legs[k2]);
            if (lt < FW) {
              var wp = Math.min(1, lt / FW); wp = wp * wp * (3 - 2 * wp);
              px = fr2[0] + (to[0] - fr2[0]) * wp; py = fr2[1] + (to[1] - fr2[1]) * wp;
              fi2 = WALK[(t * 8 | 0) % 2];
              flip = to[0] < fr2[0] - 2;
            } else {
              px = to[0]; py = to[1];
              fi2 = FOUND[(t * 4 | 0) % 2];
              flip = legs[k2].d > 0;
              var bp = lt - FW;
              if (bp < 3 * FB && bp % FB < .1) px += (flip ? -1 : 1) * 5 * u;
            }
          }
          uni(c2, fi2, px, py, u, flip ? 3 : 1, false);
        }
      }
      if (!feasting) uni(c2, FIRE[beamFrame(t)], cx, cy, u, c.s, true);
      break;
    }
    case T_TARGET: {
      var good = lit === c.req, rr = 19 * u;
      c2.lineWidth = 3 * u;
      if (c.req === 7) for (k = 0; k < 6; k++) {
        c2.strokeStyle = RB[k];
        c2.beginPath(); c2.arc(cx, cy + 2 * u, rr, k * 1.047 - 1.571, (k + 1) * 1.047 - 1.571); c2.stroke();
      } else {
        c2.strokeStyle = MIX[c.req];
        c2.beginPath(); c2.arc(cx, cy + 2 * u, rr, 0, 7); c2.stroke();
      }
      var bites = 0;
      if (winAt && c._eat) {
        var et = t - winAt - c._eat.s;
        if (et > 0) bites = Math.min(3, 1 + (et / FB | 0));
      }
      if (bites >= 3) {
        [['#b97770', -6, 6], ['#e97071', 2, 8], ['#b97770', 8, 5], ['#f8f5d6', -2, 9]].forEach(function (cr) {
          c2.fillStyle = cr[0];
          c2.fillRect(cx + cr[1] * u, cy + cr[2] * u, 2.5 * u, 2 * u);
        });
      } else if (bites > 0 && CAKE) {
        c2.imageSmoothingEnabled = u < 1;
        drawEaten(c2, cx, cy, u, bites, c._eat.d);
      } else if (CAKE) {
        c2.imageSmoothingEnabled = u < 1;
        c2.globalAlpha = good ? 1 : .82;
        c2.drawImage(CAKE, cx - 19 * u, cy - 17 * u, 38 * u, 38 * u);
        c2.globalAlpha = 1;
      }
      if (good) for (k = 0; k < 4; k++) {
        var sa = (RED ? 0 : t * 1.6) + k * 1.571;
        star(c2, cx + Math.cos(sa) * rr * 1.25, cy + 2 * u + Math.sin(sa) * rr * 1.25,
          (2.4 + (RED ? 0 : Math.sin(t * 5 + k) * .8)) * u, '#ff8fc0');
      } else if (lit) {
        c2.strokeStyle = '#e8963c'; c2.lineWidth = 2 * u;
        c2.setLineDash([4 * u, 4 * u]);
        c2.beginPath(); c2.arc(cx, cy + 2 * u, rr + 5 * u, 0, 7); c2.stroke();
        c2.setLineDash([]);
        c2.fillStyle = MIX[lit] || '#fff';
        c2.beginPath(); c2.arc(cx, cy - rr - 2 * u, 3 * u, 0, 7); c2.fill();
      }
      break;
    }
  }
}

/* ---------- Loop ---------- */
var last = 0;
function loop(ts) {
  requestAnimationFrame(loop);
  var t = ts / 1000, dt = last ? Math.min(.05, (ts - last) / 1000) : .016;
  last = ts;
  if (S.view === 'game' && S.g && ctx) frame(t, dt);
  else if (S.view === 'title') demoFrame(t);
}
function frame(t, dt) {
  var g = S.g, L = S.L, i;
  ctx.clearRect(0, 0, S.W, S.H);
  var alpha = 1;
  if (S.done && S.winAt) alpha = Math.max(0, 1 - (t - S.winAt - .9) / .6);
  drawBoard(ctx, L, g, S.sim, t, alpha);
  for (i = 0; i < g.cells.length; i++) {
    if (isRotatable(g.cells[i])) {
      var d = S.angTo[i] - S.ang[i];
      S.ang[i] += RED ? d : d * Math.min(1, dt * 14);
    }
  }
  for (i = 0; i < g.cells.length; i++) {
    var c = g.cells[i];
    if (c.t === T_EMPTY) continue;
    drawCellSlim(ctx, g, i, c, L.ox + (i % g.w) * L.cs + L.cs / 2,
      L.oy + ((i / g.w) | 0) * L.cs + L.cs / 2, L.cs, S.ang[i], S.sim.lit[i], t, S.done ? S.winAt : 0);
  }
  if (S.cur >= 0) bracket(S.cur);
  for (i = S.parts.length - 1; i >= 0; i--) {
    var p = S.parts[i];
    p.l -= dt; if (p.l <= 0) { S.parts.splice(i, 1); continue; }
    p.x += p.vx * dt; p.y += p.vy * dt; p.vx *= .94; p.vy *= .94;
    ctx.globalAlpha = Math.max(0, p.l / p.m);
    star(ctx, p.x, p.y, p.r, p.c);
    ctx.globalAlpha = 1;
  }
}
function bracket(i) {
  var cs = S.L.cs, x = S.L.ox + (i % S.g.w) * cs, y = S.L.oy + ((i / S.g.w) | 0) * cs;
  ctx.strokeStyle = '#e5588c'; ctx.lineWidth = Math.max(2, cs * .05);
  ctx.setLineDash([cs * .14, cs * .1]);
  ctx.strokeRect(x + 2, y + 2, cs - 4, cs - 4);
  ctx.setLineDash([]);
}

/* ---------- Title banner ---------- */
var dcv = $('#d'), dctx = null, dsz = 0;
function fitDemo() {
  var r = dcv.getBoundingClientRect();
  dsz = Math.max(120, Math.min(r.width, r.height) | 0);
  dcv.width = dcv.height = dsz; dctx = dcv.getContext('2d');
}
function demoFrame(t) {
  if (!dsz) { fitDemo(); if (!dsz) return; }
  var u = dsz / 190, cy = dsz / 2, fr = beamFrame(t), bw2 = 14 * u;
  dctx.clearRect(0, 0, dsz, dsz);
  for (var r = 0; r < 7; r++) {
    dctx.fillStyle = r === 0 || r === 6 ? '#fff' : RB[(r - 1 + fr * 2) % 7];
    dctx.fillRect(dsz * .3, cy - bw2 / 2 + r * bw2 / 7, dsz * .7, bw2 / 7 + .5);
  }
  uni(dctx, FIRE[fr], dsz * .26, cy, u * 1.9, 1, true);
}

/* ---------- Input ---------- */
function cellAt(ev) {
  var r = cv.getBoundingClientRect();
  var x = (ev.clientX - r.left - S.L.ox) / S.L.cs | 0, y = (ev.clientY - r.top - S.L.oy) / S.L.cs | 0;
  if (ev.clientX - r.left < S.L.ox || ev.clientY - r.top < S.L.oy || x >= S.g.w || y >= S.g.h || x < 0 || y < 0) return -1;
  return y * S.g.w + x;
}
cv.addEventListener('pointerdown', function (ev) {
  if (S.done || !S.g) return;
  ev.preventDefault();
  var i = cellAt(ev);
  if (i < 0) return;
  S.cur = i;
  if (isRotatable(S.g.cells[i])) spin(i); else sNo();
});

addEventListener('keydown', function (ev) {
  if (S.view !== 'game') return;
  var k = ev.key;
  if (k === 'Escape') { show('levels'); return; }
  if (S.done) { if (k === 'Enter' || k === ' ') { ev.preventDefault(); $('#bNext').click(); } return; }
  if (k === 'z' || k === 'Z') { undo(); return; }
  if (k === 'r' || k === 'R') { reset(); return; }
  if (k === 'h' || k === 'H') { hint(); return; }
  if (k === 'm' || k === 'M') { music(!save.mus); return; }
  var dx = k === 'ArrowLeft' ? -1 : k === 'ArrowRight' ? 1 : 0;
  var dy = k === 'ArrowUp' ? -1 : k === 'ArrowDown' ? 1 : 0;
  if (dx || dy) {
    ev.preventDefault();
    if (S.cur < 0) S.cur = 0;
    var x = Math.max(0, Math.min(S.g.w - 1, S.cur % S.g.w + dx));
    var y = Math.max(0, Math.min(S.g.h - 1, (S.cur / S.g.w | 0) + dy));
    S.cur = y * S.g.w + x;
  }
  if (k === ' ' || k === 'Enter') {
    ev.preventDefault();
    if (S.cur >= 0 && isRotatable(S.g.cells[S.cur])) spin(S.cur);
  }
});
var rsT = 0;
addEventListener('resize', function () { clearTimeout(rsT); rsT = setTimeout(function () { fit(); fitDemo(); }, 90); });

/* ---------- Wire up ---------- */
$('#bPlay').onclick = function () { if (load(Math.min(TOTAL_LEVELS, save.max))) show('game'); };
$('#bLvls').onclick = function () { show('levels'); };
$('#bHow').onclick = function () { $('#how').style.display = 'flex'; };
$('#bHowX').onclick = function () { $('#how').style.display = 'none'; };
$('#bMus').onclick = function () { music(!save.mus); };
$('#bSnd').onclick = function () {
  save.snd = save.snd ? 0 : 1; persist();
  this.textContent = save.snd ? 'sfx: on' : 'sfx: off';
};
$('#bBack').onclick = function () { show('title'); };
$('#gBack').onclick = function () { show('levels'); };
$('#bUndo').onclick = undo;
$('#bReset').onclick = reset;
$('#bHint').onclick = hint;
$('#lvs').onclick = function (ev) {
  var b = ev.target.closest('button[data-id]');
  if (b && load(+b.dataset.id)) show('game');
};
$('#bRetry').onclick = function () { load(S.id); };
$('#bNext').onclick = function () {
  if (S.id >= TOTAL_LEVELS) { show('levels'); return; }
  load(S.id + 1);
};
addEventListener('pointerdown', function first() {
  removeEventListener('pointerdown', first);
  actx(); music(save.mus);
});

menu();
$('#bSnd').textContent = save.snd ? 'sfx: on' : 'sfx: off';
requestAnimationFrame(function () { fitDemo(); });
requestAnimationFrame(loop);
