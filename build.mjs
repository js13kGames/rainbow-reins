/* Rainbow Reins js13k build:
   engine(엔드리스·데일리 제거) + game.js → esbuild 최소화 → index.html 인라인
   → dist/{index.html, u.bin} → rainbow-reins.zip (≤ 13,312 bytes 검증)      */
import fs from 'node:fs';
import zlib from 'node:zlib';
import { execSync } from 'node:child_process';

const read = p => fs.readFileSync(p, 'utf8');
fs.mkdirSync('dist', { recursive: true });
if (!fs.existsSync('dist/pix.js')) {
  console.error('dist/pix.js 없음 — 먼저 node pack.mjs 를 실행하세요');
  process.exit(1);
}

/* ── 엔진: ENGINE 구간만 + 무한/일일 블록 제거 ── */
let eng = read('src/engine.js')
  .split('/*===ENGINE_START===*/')[1].split('/*===ENGINE_END===*/')[0];
const cut = eng.indexOf('/* 무한 모드');
if (cut < 0) throw new Error('무한 모드 마커 없음');
eng = eng.slice(0, cut);

/* ── 속성명 축약 (cfg/레벨 객체 — 식별자는 esbuild 가 처리) ── */
const REN = [['needMixed','nx'],['needMix','nm'],['emitters','em'],['colors','co'],
  ['mirrors','mi'],['splitters','sl'],['filters','fl'],['shifters','sf'],['walls','wa'],
  ['targets','tg'],['scrambled','sd'],['scramble','sc'],['decoys','dc'],['minPar','mp'],
  ['solution','so'],['parExact','pe'],['attempts','at2'],['relaxed','rx'],['cells','ce'],['edge','eg'],['edist','ed2'],['seen','sn']];
function ren(t) {
  for (const [a, b] of REN)
    t = t.replace(new RegExp('\\.' + a + '\\b', 'g'), '.' + b)
         .replace(new RegExp('\\b' + a + '(\\s*:)', 'g'), b + '$1');
  return t;
}
eng = ren(eng);
let game = ren(read('src/game.js'));
if (!game.includes('/*PIX*/')) throw new Error('PIX 자리표시자 없음');
game = game.replace('/*PIX*/', () => read('dist/pix.js'));

/* ── 스모크: 변환된 엔진이 여전히 60판을 올바르게 생성하는지 ── */
{
  const E = new Function(eng + 'return {campaignLevel, checkSolved, cloneCells};')();
  let bad = 0;
  for (let id = 1; id <= 60; id++) {
    const lv = E.campaignLevel(id);
    if (!lv) { bad++; continue; }
    const g = { w: lv.w, h: lv.h, ce: E.cloneCells(lv.ce) };
    if (E.checkSolved(g)) bad++;
    lv.rot.forEach(i => { g.ce[i].s = lv.so[i]; });
    if (!E.checkSolved(g)) bad++;
  }
  if (bad) { console.error('스모크 실패:', bad); process.exit(1); }
  console.log('스모크: 60판 생성·해답 검증 통과 (속성 축약 후)');
}

const js = eng + String.fromCharCode(10) + game;
fs.writeFileSync('dist/_bundle.js', js);

/* ── 최소화 (esbuild) ── */
execSync('npx --yes esbuild dist/_bundle.js --bundle --minify --format=iife --outfile=dist/_min.js', { stdio: 'inherit' });
/* Roadroller — js13k 표준 자가해제 패커 */
execSync('npx --yes roadroller -O2 dist/_min.js -o dist/_pack.js', { stdio: 'inherit' });
let min = read('dist/_pack.js').trim();
const NL = String.fromCharCode(10);
min = min.split('</' + 'script').join('<\\/' + 'script');

/* HTML/CSS 공백 압축 */
let shell = read('src/index.html');
shell = shell.split(NL).map(l => l.trim()).filter(Boolean).join(NL);
const html = shell.replace('/*JS*/', () => min);
fs.writeFileSync('dist/index.html', html);
fs.rmSync('dist/_bundle.js'); fs.rmSync('dist/_min.js'); fs.rmSync('dist/_pack.js');

/* ── zip (deflate 9) ── */
const CRC = (() => { const t = new Int32Array(256);
  for (let n = 0; n < 256; n++) { let c = n; for (let k = 0; k < 8; k++) c = c & 1 ? 0xEDB88320 ^ (c >>> 1) : c >>> 1; t[n] = c; }
  return t; })();
const crc32 = b => { let c = -1; for (let i = 0; i < b.length; i++) c = CRC[(c ^ b[i]) & 255] ^ (c >>> 8); return (c ^ -1) >>> 0; };

function makeZip(files) {
  const locals = [], centrals = []; let off = 0;
  for (const [name, data] of files) {
    const defl = zlib.deflateRawSync(data, { level: 9 });
    const nm = Buffer.from(name), crc = crc32(data);
    const lh = Buffer.alloc(30);
    lh.writeUInt32LE(0x04034b50, 0); lh.writeUInt16LE(20, 4); lh.writeUInt16LE(0, 6);
    lh.writeUInt16LE(8, 8); lh.writeUInt32LE(0, 10);
    lh.writeUInt32LE(crc, 14); lh.writeUInt32LE(defl.length, 18); lh.writeUInt32LE(data.length, 22);
    lh.writeUInt16LE(nm.length, 26); lh.writeUInt16LE(0, 28);
    locals.push(lh, nm, defl);
    const ch = Buffer.alloc(46);
    ch.writeUInt32LE(0x02014b50, 0); ch.writeUInt16LE(20, 4); ch.writeUInt16LE(20, 6);
    ch.writeUInt16LE(0, 8); ch.writeUInt16LE(8, 10); ch.writeUInt32LE(0, 12);
    ch.writeUInt32LE(crc, 16); ch.writeUInt32LE(defl.length, 20); ch.writeUInt32LE(data.length, 24);
    ch.writeUInt16LE(nm.length, 28); ch.writeUInt32LE(off, 42);
    centrals.push(ch, nm);
    off += 30 + nm.length + defl.length;
  }
  const cd = Buffer.concat(centrals);
  const end = Buffer.alloc(22);
  end.writeUInt32LE(0x06054b50, 0); end.writeUInt16LE(files.length, 8); end.writeUInt16LE(files.length, 10);
  end.writeUInt32LE(cd.length, 12); end.writeUInt32LE(off, 16);
  return Buffer.concat([...locals, cd, end]);
}

const zip = makeZip([['index.html', Buffer.from(html)]]);
fs.writeFileSync('rainbow-reins.zip', zip);

const LIMIT = 13312;
console.log(`index.html  ${html.length} bytes (raw)`);
console.log(`zip         ${zip.length} / ${LIMIT} bytes  (${zip.length <= LIMIT ? '✓ 통과' : '✗ 초과 ' + (zip.length - LIMIT)})`);
process.exit(zip.length <= LIMIT ? 0 : 1);
