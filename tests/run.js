// Node regression for the generator. Run: node tests/run.js
// Slices the pure generator out of index.html (between GEN-START / GEN-END) and checks every mode:
// valid closed geometry, no near-miss lines, no dangling ends, deterministic output, no Math.random.
const fs = require('fs'), path = require('path');
const html = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');
const gen = html.split('/*GEN-START*/')[1].split('/*GEN-END*/')[0];
const api = new Function(gen + ';return {generate,buildSVG,scanGeometry,MODES,dSeg};')();
const KNOWN = new Set(['nested|none']); // documented: up to 3 near-misses (min gap 0.86) in Nested without symmetry
let fail = 0;
const say = (ok, msg) => { if (!ok) { fail++; console.log('FAIL', msg); } };
say(!/Math\.random/.test(gen), 'Math.random used in generator');
function dangling(G) {
  const A = G.art, ops = G.ops.filter(o => o.k !== 'text' && o.k !== 'fill'), E = [];
  ops.forEach((o, i) => { for (const r of [o.p].concat(o.holes || [])) { const m = o.k === 'seg' ? r.length - 1 : r.length; for (let j = 0; j < m; j++) E.push([r[j], r[(j + 1) % r.length], i]); } });
  const grid = new Map(), C = 16, key = (x, y) => x * 65536 + y;
  E.forEach((e, k) => { const [a, b] = e; for (let x = Math.floor(Math.min(a[0], b[0]) / C); x <= Math.floor(Math.max(a[0], b[0]) / C); x++) for (let y = Math.floor(Math.min(a[1], b[1]) / C); y <= Math.floor(Math.max(a[1], b[1]) / C); y++) { const q = key(x, y); if (!grid.has(q)) grid.set(q, []); grid.get(q).push(k); } });
  const near = v => grid.get(key(Math.floor(v[0] / C), Math.floor(v[1] / C))) || [];
  let d = 0;
  ops.forEach((o, i) => {
    if (o.k !== 'seg') return; const P = o.p;
    if (Math.hypot(P[0][0] - P[P.length - 1][0], P[0][1] - P[P.length - 1][1]) < 1e-3) return;
    for (const v of [P[0], P[P.length - 1]]) {
      if (v[0] <= A.fx + .01 || v[0] >= A.fx + A.fw - .01 || v[1] <= A.fy + .01 || v[1] >= A.fy + A.fh - .01) continue;
      if ((G.masks || []).some(m => v[0] >= m[0] - .01 && v[0] <= m[2] + .01 && v[1] >= m[1] - .01 && v[1] <= m[3] + .01)) continue;
      if (!near(v).some(k => E[k][2] !== i && api.dSeg(v, E[k][0], E[k][1]) < 1e-3)) d++;
    }
  });
  return d;
}
let n = 0;
for (const mode of api.MODES) for (const sym of ['none', 'mirror', 'tri']) for (const c of [1, 3, 5]) for (const d of ['full', 'simple', 'kids']) {
  if (d !== 'full' && c === 1) continue;
  const st = { mode, seed: 'ci-' + c, c, sym, lw: 3, canvas: c === 5 ? 'square' : 'classic', plate: 'full', d };
  n++;
  try {
    const G = api.generate(st), sc = api.scanGeometry(G, 1.5);
    say(sc.bad === 0, `${mode}/${sym}/c${c}/${d}: ${sc.bad} malformed paths`);
    if (!KNOWN.has(mode + '|' + sym)) say(sc.near === 0, `${mode}/${sym}/c${c}/${d}: ${sc.near} near-misses (min ${sc.minGap.toFixed(2)})`);
    else say(sc.near <= 3, `${mode}/${sym}/c${c}/${d}: ${sc.near} near-misses`);
    say(dangling(G) === 0, `${mode}/${sym}/c${c}/${d}: dangling line ends`);
    say(api.buildSVG(G, st) === api.buildSVG(api.generate(st), st), `${mode}/${sym}/c${c}/${d}: not deterministic`);
  } catch (e) { say(false, `${mode}/${sym}/c${c}/${d}: threw ${e.message}`); }
}
console.log(`${n} cases, ${fail} failures`);
process.exit(fail ? 1 : 0);
