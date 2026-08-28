/* ============================================================================
   PRISM — 엔진
   광선 시뮬레이션 / 역방향 레벨 생성 / 최소 이동 수 완전탐색
   DOM에 의존하지 않는다. test-engine.mjs 가 이 파일을 그대로 평가해 검증한다.
   ========================================================================= */
/*===ENGINE_START===*/
'use strict';

/* 방향: 0=위 1=오른쪽 2=아래 3=왼쪽 */
var DX = [0, 1, 0, -1];
var DY = [-1, 0, 1, 0];
var OPP = [2, 3, 0, 1];

/* 칸 종류 */
var T_EMPTY = 0, T_MIRROR = 1, T_SPLIT = 2, T_FILTER = 3,
    T_SHIFT = 4, T_WALL = 5, T_TARGET = 6, T_EMIT = 7;

/* 색 = 3비트 마스크. 1=R 2=G 4=B */
var C_R = 1, C_G = 2, C_B = 4, C_W = 7;

var COLOR_HEX = [
  '#3a3a52', // 0 없음
  '#ff2d55', // 1 R
  '#2dff88', // 2 G
  '#ffd93d', // 3 R+G 노랑
  '#3b9bff', // 4 B
  '#e458ff', // 5 R+B 마젠타
  '#4de8ff', // 6 G+B 시안
  '#ffffff'  // 7 흰빛
];

var COLOR_NAME = ['', '빨강', '초록', '노랑', '파랑', '마젠타', '시안', '흰빛'];

/* ---------------------------------------------------------------- 난수 */
function mulberry32(a) {
  a = a | 0;
  return function () {
    a = (a + 0x6D2B79F5) | 0;
    var t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
function rint(rnd, n) { return Math.floor(rnd() * n); }
function rpick(rnd, arr) { return arr[rint(rnd, arr.length)]; }
function rshuffle(rnd, arr) {
  for (var i = arr.length - 1; i > 0; i--) {
    var j = rint(rnd, i + 1), t = arr[i]; arr[i] = arr[j]; arr[j] = t;
  }
  return arr;
}

/* ---------------------------------------------------------------- 격자 */
function makeGrid(w, h) {
  var cells = new Array(w * h);
  for (var i = 0; i < w * h; i++) cells[i] = { t: T_EMPTY, s: 0, c: 0, req: 0 };
  return { w: w, h: h, cells: cells };
}
function cloneCells(cells) {
  var out = new Array(cells.length);
  for (var i = 0; i < cells.length; i++) {
    var c = cells[i];
    out[i] = { t: c.t, s: c.s, c: c.c, req: c.req };
  }
  return out;
}
/* s=0 → "/" 거울, s=1 → "\" 거울 */
function reflect(dir, s) { return s === 0 ? (dir ^ 1) : (3 - dir); }
function isRotatable(c) { return c.t === T_MIRROR || c.t === T_SPLIT; }

/* --------------------------------------------------- 광선 시뮬레이션 */
/* 재사용 스크래치 — 탐색 루프에서 GC 압력을 없앤다 */
var _scr = null;
function _scratch(n) {
  if (!_scr || _scr.n < n) {
    _scr = {
      n: n,
      edge: new Uint8Array(n * 4),
      edist: new Uint16Array(n * 4),
      lit: new Uint8Array(n),
      seen: new Uint8Array(n * 32)
    };
  }
  return _scr;
}
var _rq = new Int32Array(16384 * 5);

/**
 * 광선을 전파한다.
 * @param g       격자
 * @param litOnly true면 결정 점등만 계산(탐색용, 버퍼 재사용)
 * 반환 {edge, edist, lit} — edge[i*4+d] = 칸 i 의 d 방향 변을 지나는 색 마스크
 */
function simulate(g, litOnly) {
  var w = g.w, h = g.h, cells = g.cells, n = w * h;
  var edge, edist, lit, seen;
  if (litOnly) {
    var s = _scratch(n);
    edge = s.edge; edist = s.edist; lit = s.lit; seen = s.seen;
    lit.fill(0, 0, n); seen.fill(0, 0, n * 32);
  } else {
    edge = new Uint8Array(n * 4);
    edist = new Uint16Array(n * 4);
    lit = new Uint8Array(n);
    seen = new Uint8Array(n * 32);
  }
  if (!litOnly) { edge.fill(0); edist.fill(0); }

  var top = 0;
  for (var i = 0; i < n; i++) {
    var c = cells[i];
    if (c.t === T_EMIT && c.c) {
      _rq[top] = i % w; _rq[top + 1] = (i / w) | 0;
      _rq[top + 2] = c.s; _rq[top + 3] = c.c; _rq[top + 4] = 0;
      top += 5;
    }
  }

  var guard = 0;
  while (top > 0) {
    if (++guard > 40000) break;
    top -= 5;
    var x = _rq[top], y = _rq[top + 1], d = _rq[top + 2], col = _rq[top + 3], dist = _rq[top + 4];

    /* 출발 칸의 진행 방향 변 */
    var fe = (y * w + x) * 4 + d;
    if (!litOnly) {
      edge[fe] |= col;
      if (edist[fe] === 0 || edist[fe] > dist) edist[fe] = dist;
    }

    var nx = x + DX[d], ny = y + DY[d];
    if (nx < 0 || ny < 0 || nx >= w || ny >= h) continue;
    var ni = ny * w + nx, nd = dist + 1;

    /* 도착 칸의 진입 변 */
    if (!litOnly) {
      var te = ni * 4 + OPP[d];
      edge[te] |= col;
      if (edist[te] === 0 || edist[te] > nd) edist[te] = nd;
    }

    /* 상태 중복 차단 — 분광기 루프를 유한하게 만든다 */
    var key = (ni * 4 + d) * 8 + col;
    if (seen[key]) continue;
    seen[key] = 1;

    var cc = cells[ni], c2;
    switch (cc.t) {
      case T_TARGET:
        lit[ni] |= col;
        /* 결정은 통과형 — 그대로 진행 */
        _rq[top] = nx; _rq[top + 1] = ny; _rq[top + 2] = d; _rq[top + 3] = col; _rq[top + 4] = nd; top += 5;
        break;
      case T_EMPTY:
        _rq[top] = nx; _rq[top + 1] = ny; _rq[top + 2] = d; _rq[top + 3] = col; _rq[top + 4] = nd; top += 5;
        break;
      case T_MIRROR:
        _rq[top] = nx; _rq[top + 1] = ny; _rq[top + 2] = reflect(d, cc.s); _rq[top + 3] = col; _rq[top + 4] = nd; top += 5;
        break;
      case T_SPLIT:
        _rq[top] = nx; _rq[top + 1] = ny; _rq[top + 2] = d; _rq[top + 3] = col; _rq[top + 4] = nd; top += 5;
        _rq[top] = nx; _rq[top + 1] = ny; _rq[top + 2] = reflect(d, cc.s); _rq[top + 3] = col; _rq[top + 4] = nd; top += 5;
        break;
      case T_FILTER:
        c2 = col & cc.c;
        if (c2) { _rq[top] = nx; _rq[top + 1] = ny; _rq[top + 2] = d; _rq[top + 3] = c2; _rq[top + 4] = nd; top += 5; }
        break;
      case T_SHIFT:
        c2 = ((col << 1) | (col >> 2)) & 7;
        _rq[top] = nx; _rq[top + 1] = ny; _rq[top + 2] = d; _rq[top + 3] = c2; _rq[top + 4] = nd; top += 5;
        break;
      /* T_WALL, T_EMIT → 흡수 */
    }
    if (top > _rq.length - 16) break; /* 안전판 */
  }
  return { edge: edge, edist: edist, lit: lit };
}

function isSolved(g, sim) {
  var cells = g.cells;
  for (var i = 0; i < cells.length; i++) {
    if (cells[i].t === T_TARGET && sim.lit[i] !== cells[i].req) return false;
  }
  return true;
}
function checkSolved(g) { return isSolved(g, simulate(g, true)); }

function targetList(g) {
  var out = [];
  for (var i = 0; i < g.cells.length; i++) if (g.cells[i].t === T_TARGET) out.push(i);
  return out;
}
function rotList(g) {
  var out = [];
  for (var i = 0; i < g.cells.length; i++) if (isRotatable(g.cells[i])) out.push(i);
  return out;
}

/* ------------------------------------------------- 최소 이동 수 탐색 */
/* 회전 조각이 전부 2상태이므로 "어떤 부분집합을 뒤집을까" 문제.
   k=0,1,2,… 순으로 전수 조사 → 처음 풀리는 k 가 진짜 최소값. */
function findPar(g, rot, known, cap) {
  var n = rot.length, nodes = 0, over = false;
  for (var k = 0; k <= known; k++) {
    var combo = new Array(k), found = false;
    (function rec(start, depth) {
      if (found || over) return;
      if (depth === k) {
        if (++nodes > cap) { over = true; return; }
        var j;
        for (j = 0; j < k; j++) g.cells[rot[combo[j]]].s ^= 1;
        var ok = checkSolved(g);
        for (j = 0; j < k; j++) g.cells[rot[combo[j]]].s ^= 1;
        if (ok) found = true;
        return;
      }
      /* 남은 자리보다 후보가 적으면 가지치기 */
      for (var i = start; i <= n - (k - depth) && !found && !over; i++) {
        combo[depth] = i;
        rec(i + 1, depth + 1);
      }
    })(0, 0);
    if (over) return { par: known, exact: false };
    if (found) return { par: k, exact: true };
  }
  return { par: known, exact: true };
}

/* ------------------------------------------------------- 레벨 생성 */
/* 역방향 구축: 정답을 먼저 만들고 → 결정을 심고 → 흐트러뜨린다.
   정답 배치가 반드시 존재하므로 생성된 레벨은 항상 풀린다. */
function tryGen(rnd, cfg) {
  var w = cfg.w, h = cfg.h, n = w * h, i, k;
  var g = makeGrid(w, h);

  /* 1. 테두리에 광원 */
  var border = [];
  for (var x = 0; x < w; x++) { border.push([x, 0, 2]); border.push([x, h - 1, 0]); }
  for (var y = 1; y < h - 1; y++) { border.push([0, y, 1]); border.push([w - 1, y, 3]); }
  rshuffle(rnd, border);
  var pool = rshuffle(rnd, cfg.colors.slice());
  var placed = [], bi = 0;
  for (i = 0; i < cfg.emitters; i++) {
    var b = null;
    while (bi < border.length) {                 /* 광원끼리 너무 붙지 않게 */
      var cnd = border[bi++], tooClose = false;
      for (k = 0; k < placed.length; k++) {
        if (Math.abs(placed[k][0] - cnd[0]) + Math.abs(placed[k][1] - cnd[1]) < 3) { tooClose = true; break; }
      }
      if (!tooClose) { b = cnd; break; }
    }
    if (!b) return null;
    placed.push(b);
    var ec = g.cells[b[1] * w + b[0]];
    ec.t = T_EMIT; ec.s = b[2]; ec.c = pool[i % pool.length];
  }

  /* 2. 조각 배치 = 이것이 정답 상태 */
  var free = [];
  for (i = 0; i < n; i++) if (g.cells[i].t === T_EMPTY) free.push(i);
  rshuffle(rnd, free);
  var fp = 0;
  function place(t, count, fn) {
    for (var q = 0; q < count; q++) {
      if (fp >= free.length) return false;
      var c = g.cells[free[fp++]];
      c.t = t; if (fn) fn(c);
    }
    return true;
  }
  place(T_MIRROR, cfg.mirrors, function (c) { c.s = rint(rnd, 2); });
  place(T_SPLIT, cfg.splitters, function (c) { c.s = rint(rnd, 2); });
  place(T_FILTER, cfg.filters, function (c) { c.c = rpick(rnd, [1, 2, 4, 3, 5, 6]); });
  place(T_SHIFT, cfg.shifters, null);
  place(T_WALL, cfg.walls, null);

  /* 3. 빔이 지나간 칸 수집 → 결정 심기 (통과형이라 광선이 변하지 않는다) */
  var sim = simulate(g, false);
  var cand = [];
  for (i = 0; i < n; i++) {
    if (g.cells[i].t !== T_EMPTY) continue;
    var col = 0, dmin = 65535;
    for (var d = 0; d < 4; d++) {
      var e = sim.edge[i * 4 + d];
      if (e) { col |= e; if (sim.edist[i * 4 + d] < dmin) dmin = sim.edist[i * 4 + d]; }
    }
    if (col && dmin >= 2) cand.push({ i: i, col: col, d: dmin });
  }
  if (cand.length < cfg.targets + 1) return null;

  /* 깊은 곳(광원에서 먼) 우선 + 무작위성 + 서로 떨어뜨리기 */
  rshuffle(rnd, cand);
  cand.sort(function (a, b) { return (b.d + rnd() * 3) - (a.d + rnd() * 3); });
  var chosen = [];
  for (k = 0; k < cand.length && chosen.length < cfg.targets; k++) {
    var c0 = cand[k], cx = c0.i % w, cy = (c0.i / w) | 0, ok = true;
    for (var m = 0; m < chosen.length; m++) {
      var ox = chosen[m].i % w, oy = (chosen[m].i / w) | 0;
      if (Math.abs(ox - cx) + Math.abs(oy - cy) < 2) { ok = false; break; }
    }
    if (ok) chosen.push(c0);
  }
  if (chosen.length < cfg.targets) return null;
  for (k = 0; k < chosen.length; k++) {
    g.cells[chosen[k].i].t = T_TARGET;
    g.cells[chosen[k].i].req = chosen[k].col;
  }

  sim = simulate(g, false);
  if (!isSolved(g, sim)) return null; /* 있을 수 없지만 안전판 */

  /* 색 다양성 요구 */
  if (cfg.needMix) {
    var set = {}, cnt = 0, mixed = false;
    for (k = 0; k < chosen.length; k++) {
      if (!set[chosen[k].col]) { set[chosen[k].col] = 1; cnt++; }
      var cv = chosen[k].col;
      if (cv === 3 || cv === 5 || cv === 6 || cv === 7) mixed = true;
    }
    if (chosen.length >= 2 && cnt < 2) return null;   /* 결정 1개면 다색 요구 자체가 불가 */
    if (cfg.needMixed && !mixed) return null;
  }

  /* 4. 필수 조각 판별 — 혼자 뒤집었을 때 정답이 깨지는 것 */
  var rot = rotList(g);
  var essential = [], touched = {};
  for (k = 0; k < rot.length; k++) {
    var idx = rot[k], t = false;
    for (var dd = 0; dd < 4; dd++) if (sim.edge[idx * 4 + dd]) { t = true; break; }
    if (t) touched[idx] = 1;
    g.cells[idx].s ^= 1;
    if (!checkSolved(g)) essential.push(idx);
    g.cells[idx].s ^= 1;
  }
  if (essential.length < cfg.scramble) return null;

  /* 5. 빔이 닿지 않는 잉여 거울 정리 — 미끼는 몇 개만 남긴다 */
  var idle = [];
  for (k = 0; k < rot.length; k++) if (!touched[rot[k]]) idle.push(rot[k]);
  rshuffle(rnd, idle);
  for (k = (cfg.decoys || 0); k < idle.length; k++) {
    g.cells[idle[k]].t = T_EMPTY; g.cells[idle[k]].s = 0;
  }

  rot = rotList(g);
  if (rot.length > 20) return null; /* par 탐색이 감당 못 할 규모는 버린다 */
  var solution = {};
  for (k = 0; k < rot.length; k++) solution[rot[k]] = g.cells[rot[k]].s;

  /* 6. 출제 — 필수 조각 중 N개를 뒤집는다 */
  var scram = null;
  for (var tries = 0; tries < 60; tries++) {
    var sel = rshuffle(rnd, essential.slice()).slice(0, cfg.scramble);
    for (k = 0; k < sel.length; k++) g.cells[sel[k]].s ^= 1;
    if (!checkSolved(g)) { scram = sel; break; }
    for (k = 0; k < sel.length; k++) g.cells[sel[k]].s ^= 1;
  }
  if (!scram) return null;

  /* 7. 최소 이동 수 */
  var pr = findPar(g, rot, cfg.scramble, 20000);
  if (pr.par < (cfg.minPar || 1)) return null;

  var sim2 = simulate(g, false);
  var tg = targetList(g), litOK = 0;
  for (k = 0; k < tg.length; k++) if (sim2.lit[tg[k]] === g.cells[tg[k]].req) litOK++;
  if (litOK === tg.length) return null;
  /* 출제 상태에서 너무 많이 켜져 있으면 심심하다 */
  if (tg.length > 1 && litOK > tg.length - 1) { /* 허용 */ }

  return {
    w: w, h: h,
    cells: cloneCells(g.cells),
    solution: solution,
    rot: rot,
    par: pr.par,
    parExact: pr.exact,
    scrambled: cfg.scramble
  };
}

function genLevel(seed, cfg, attempts) {
  var A = attempts || 300;
  for (var a = 0; a < A; a++) {
    var rnd = mulberry32((seed * 7919 + a * 104729 + 1013904223) | 0);
    var lv = null;
    try { lv = tryGen(rnd, cfg); } catch (e) { lv = null; }
    if (lv) { lv.attempts = a + 1; return lv; }
  }
  return null;
}

/* -------------------------------------------------------- 난이도 표 */
var CHAPTERS = [
  { n: 'I',   name: '정렬', desc: '거울과 결정' },
  { n: 'II',  name: '분광', desc: '빛을 가른다' },
  { n: 'III', name: '여과', desc: '색을 거른다' },
  { n: 'IV',  name: '변조', desc: '채널을 돌린다' },
  { n: 'V',   name: '간섭', desc: '모든 것' }
];
var LEVELS_PER_CH = 12;
var TOTAL_LEVELS = CHAPTERS.length * LEVELS_PER_CH;

function levelCfg(id) {
  var ch = Math.min(CHAPTERS.length, Math.ceil(id / LEVELS_PER_CH));
  var k = ((id - 1) % LEVELS_PER_CH) / (LEVELS_PER_CH - 1);
  function r(a, b) { return Math.round(a + (b - a) * k); }
  switch (ch) {
    case 1: return {
      w: 5, h: 5, emitters: 1, colors: [C_W],
      mirrors: r(3, 6), splitters: 0, filters: 0, shifters: 0, walls: 0,
      targets: id <= 3 ? 1 : r(1, 2), scramble: r(1, 3), decoys: 1,
      needMix: false, minPar: 1
    };
    case 2: return {
      w: 6, h: 6, emitters: 1, colors: [C_W],
      mirrors: r(4, 7), splitters: r(1, 2), filters: 0, shifters: 0, walls: r(0, 1),
      targets: r(2, 3), scramble: r(2, 4), decoys: 1,
      needMix: false, minPar: 2
    };
    case 3: return {
      w: k < 0.5 ? 6 : 7, h: k < 0.5 ? 6 : 7, emitters: 2, colors: [C_R, C_G, C_B],
      mirrors: r(5, 8), splitters: r(1, 2), filters: r(1, 2), shifters: 0, walls: r(0, 1),
      targets: r(2, 3), scramble: r(3, 5), decoys: 2,
      needMix: true, needMixed: k > 0.3, minPar: 2
    };
    case 4: return {
      w: 7, h: 7, emitters: 2, colors: [C_R, C_G, C_B, C_W],
      mirrors: r(5, 8), splitters: r(1, 2), filters: 1, shifters: r(1, 2), walls: r(0, 2),
      targets: r(2, 3), scramble: r(4, 6), decoys: 2,
      needMix: true, needMixed: true, minPar: 3
    };
    default: return {
      w: k < 0.4 ? 7 : 8, h: k < 0.4 ? 7 : 8, emitters: k < 0.6 ? 2 : 3,
      colors: [C_R, C_G, C_B, C_W],
      mirrors: r(6, 9), splitters: 2, filters: r(1, 2), shifters: 1, walls: r(1, 3),
      targets: r(3, 4), scramble: r(5, 7), decoys: 2,
      needMix: true, needMixed: true, minPar: 3
    };
  }
}

/* 생성 실패 시 조건을 한 단계씩 풀어 반드시 레벨을 만들어낸다 */
function relax(cfg, step) {
  var c = {}; for (var k in cfg) c[k] = cfg[k];
  if (step >= 1) { c.minPar = Math.max(1, c.minPar - 1); c.needMixed = false; }
  if (step >= 2) { c.needMix = false; c.walls = 0; c.mirrors = c.mirrors + 1; }
  if (step >= 3) { c.minPar = 1; c.scramble = Math.max(1, c.scramble - 1); c.decoys = 0; }
  if (step >= 4) { c.targets = Math.max(2, c.targets - 1); c.shifters = 0; }
  if (step >= 5) { c.targets = 1; c.filters = 0; c.emitters = Math.max(1, c.emitters - 1);
                   c.splitters = Math.min(1, c.splitters); c.mirrors = c.mirrors + 2; }
  return c;
}
function buildLevel(seed, cfg) {
  for (var step = 0; step <= 5; step++) {
    var lv = genLevel(seed + step * 6151, relax(cfg, step), step === 0 ? 600 : 220);
    if (lv) { lv.relaxed = step; return lv; }
  }
  return null;
}

function campaignLevel(id) {
  var lv = buildLevel(id * 131 + 7, levelCfg(id));
  if (lv) { lv.id = id; lv.mode = 'campaign'; }
  return lv;
}

/* 무한 모드 — 난이도가 계속 오른다 */
function endlessCfg(n) {
  var t = Math.min(1, (n - 1) / 26);
  function r(a, b) { return Math.round(a + (b - a) * t); }
  var size = n < 4 ? 6 : n < 10 ? 7 : 8;
  return {
    w: size, h: size, emitters: n < 6 ? 1 : n < 14 ? 2 : 3,
    colors: n < 4 ? [C_W] : [C_R, C_G, C_B, C_W],
    mirrors: r(4, 9), splitters: n < 3 ? 1 : 2, filters: n < 6 ? 0 : r(1, 2),
    shifters: n < 12 ? 0 : 1, walls: r(0, 3),
    targets: r(2, 4), scramble: Math.min(8, r(2, 7)), decoys: 2,
    needMix: n >= 6, needMixed: n >= 10, minPar: Math.min(3, r(1, 3))
  };
}
function endlessLevel(n, seedBase) {
  var lv = buildLevel((seedBase | 0) + n * 7919, endlessCfg(n));
  if (lv) { lv.id = n; lv.mode = 'endless'; }
  return lv;
}

/* 일일 도전 — 날짜 시드, 전 세계 동일 문제 */
function dailySeed(d) {
  return d.getFullYear() * 10000 + (d.getMonth() + 1) * 100 + d.getDate();
}
function dailyLevel(seed) {
  var cfg = {
    w: 7, h: 7, emitters: 2, colors: [C_R, C_G, C_B, C_W],
    mirrors: 7, splitters: 2, filters: 1, shifters: 1, walls: 1,
    targets: 3, scramble: 5, decoys: 2, needMix: true, needMixed: true, minPar: 3
  };
  var lv = buildLevel(seed, cfg);
  if (lv) { lv.id = seed; lv.mode = 'daily'; }
  return lv;
}
/*===ENGINE_END===*/
