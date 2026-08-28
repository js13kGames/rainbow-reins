/* 유니콘 7프레임(fire3·found2·walk2) + 케이크 → dist/u.bin */
import fs from 'node:fs';
import zlib from 'node:zlib';

function decodePNG(path) {
  const b = fs.readFileSync(path); let off = 8, w = 0, h = 0, ct = 0, idat = [], plte = null, trns = null;
  while (off < b.length) {
    const len = b.readUInt32BE(off), t = b.toString('ascii', off + 4, off + 8), d = b.subarray(off + 8, off + 8 + len);
    if (t === 'IHDR') { w = d.readUInt32BE(0); h = d.readUInt32BE(4); ct = d[9]; }
    else if (t === 'IDAT') idat.push(d); else if (t === 'PLTE') plte = d; else if (t === 'tRNS') trns = d;
    off += 12 + len;
  }
  const raw = zlib.inflateSync(Buffer.concat(idat));
  const ch = ct === 6 ? 4 : ct === 2 ? 3 : 1, stride = w * ch, px = new Uint8Array(w * h * 4), prev = new Uint8Array(stride);
  let p = 0;
  for (let y = 0; y < h; y++) {
    const f = raw[p++], row = raw.subarray(p, p + stride); p += stride;
    const cur = new Uint8Array(stride);
    for (let i = 0; i < stride; i++) {
      const a = i >= ch ? cur[i - ch] : 0, u = prev[i], c = i >= ch ? prev[i - ch] : 0; let v = row[i];
      if (f === 1) v += a; else if (f === 2) v += u; else if (f === 3) v += (a + u) >> 1;
      else if (f === 4) { const pa = Math.abs(u - c), pb = Math.abs(a - c), pc = Math.abs(a + u - 2 * c); v += pa <= pb && pa <= pc ? a : pb <= pc ? u : c; }
      cur[i] = v & 255;
    }
    for (let x = 0; x < w; x++) {
      const o = (y * w + x) * 4;
      if (ct === 6) { px[o] = cur[x * 4]; px[o + 1] = cur[x * 4 + 1]; px[o + 2] = cur[x * 4 + 2]; px[o + 3] = cur[x * 4 + 3]; }
      else if (ct === 2) { px[o] = cur[x * 3]; px[o + 1] = cur[x * 3 + 1]; px[o + 2] = cur[x * 3 + 2]; px[o + 3] = 255; }
      else { const i2 = cur[x]; px[o] = plte[i2 * 3]; px[o + 1] = plte[i2 * 3 + 1]; px[o + 2] = plte[i2 * 3 + 2]; px[o + 3] = trns && i2 < trns.length ? trns[i2] : 255; }
    }
    prev.set(cur);
  }
  return { w, h, px };
}

const ani = decodePNG('assets/Uni_Ani.png'), cake = decodePNG('assets/Uni_Cake.png');
const uf = n => ({ sx: (((n - 1) / 3) | 0) * 50, sy: ((n - 1) % 3) * 50 });
const KEEP = [2, 3, 4, 10, 11, 12, 14];        /* fire×3, found×2, walk×2 */

const pal = new Map();
const idx = (r, g, b, a) => {
  if (a < 128) return 0;
  const k = (r << 16) | (g << 8) | b;
  if (!pal.has(k)) pal.set(k, pal.size + 1);
  return pal.get(k);
};
const UW = KEEP.length * 50, up = new Uint8Array(UW * 50);
KEEP.forEach((n, fi) => {
  const { sx, sy } = uf(n);
  for (let y = 0; y < 50; y++) for (let x = 0; x < 50; x++) {
    const o = ((sy + y) * ani.w + sx + x) * 4;
    up[y * UW + fi * 50 + x] = idx(ani.px[o], ani.px[o + 1], ani.px[o + 2], ani.px[o + 3]);
  }
});
const cp = new Uint8Array(48 * 48);
for (let y = 0; y < 48; y++) for (let x = 0; x < 48; x++) {
  const o = (y * 48 + x) * 4;
  cp[y * 48 + x] = idx(cake.px[o], cake.px[o + 1], cake.px[o + 2], cake.px[o + 3]);
}
/* 근접색 병합 — 심볼 수를 줄여 압축률을 올린다 */
let colors = [...pal.keys()];
{
  const remap = new Map();
  const rgb = k => [k >> 16, (k >> 8) & 255, k & 255];
  const merged = [];
  for (const k of colors) {
    const [r, g, b] = rgb(k);
    let hit = -1;
    for (let m = 0; m < merged.length; m++) {
      const [r2, g2, b2] = rgb(merged[m]);
      if (Math.abs(r - r2) + Math.abs(g - g2) + Math.abs(b - b2) <= 30) { hit = m; break; }
    }
    if (hit < 0) { merged.push(k); remap.set(pal.get(k), merged.length); }
    else remap.set(pal.get(k), hit + 1);
  }
  for (let i = 0; i < up.length; i++) if (up[i]) up[i] = remap.get(up[i]);
  for (let i = 0; i < cp.length; i++) if (cp[i]) cp[i] = remap.get(cp[i]);
  colors = merged;
}
if (colors.length > 255) { console.error('팔레트 초과'); process.exit(1); }
/* 70심볼 안전 알파벳 (따옴표·백슬래시·백틱 제외) */
const AL = '!#$%&()*+,-./0123456789:;<=>?@ABCDEFGHIJKLMNOPQRSTUVWXYZ[]^_abcdefghij';
if (colors.length + 1 > AL.length) { console.error('알파벳 부족'); process.exit(1); }
const enc = arr => Array.from(arr, v => AL[v]).join('');
const palHex = colors.map(k => k.toString(16).padStart(6, '0')).join('');
fs.writeFileSync('dist/pix.js',
  'var PAL="' + palHex + '",NF=' + KEEP.length +
  ',PIXU="' + enc(up) + '",PIXC="' + enc(cp) + '";');
console.log('pix.js', fs.statSync('dist/pix.js').size, 'B ·', colors.length, '색 ·', KEEP.length, '프레임');
