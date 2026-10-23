/* China Supreme — concept site.
   Hero: a Beijing jianbing is made on the griddle, live: batter spread, egg, spring onion & sesame,
   flip, sauce, crisp cracker, fold. Biang section: slap the noodle three times, then it lands in the bowl. */
(() => {
"use strict";
const $ = s => document.querySelector(s), $$ = s => [...document.querySelectorAll(s)];
const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
const mobile = matchMedia("(max-width: 900px)").matches;
const TZ = "Europe/Amsterdam";
const TAU = Math.PI * 2;
const clamp = (a, b, v) => Math.max(a, Math.min(b, v));
const lerp = (a, b, t) => a + (b - a) * t;
const eOut = t => 1 - Math.pow(1 - t, 3);
const eIn = t => t * t * t;
const eInOut = t => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
const eBack = t => { const c = 1.6; return 1 + (c + 1) * Math.pow(t - 1, 3) + c * Math.pow(t - 1, 2); };
const seg = (t, a, b) => clamp(0, 1, (t - a) / (b - a));
let sd = 7; const rnd = () => ((sd = (sd * 16807) % 2147483647) / 2147483647);

/* ---------- language ---------- */
const LANG = (() => {
  const q = new URLSearchParams(location.search).get("lang");
  if (q === "nl" || q === "en") { try { localStorage.setItem("cs-lang", q); } catch (e) {} return q; }
  try { const s = localStorage.getItem("cs-lang"); if (s === "nl" || s === "en") return s; } catch (e) {}
  return /^nl\b/i.test(navigator.language || "") ? "nl" : "en";
})();
const NL = LANG === "nl";
const tr = (en, nl) => (NL ? nl : en);
document.documentElement.lang = LANG;
if (NL) $$("[data-nl]").forEach(el => { el.innerHTML = el.dataset.nl; });
$("#lang").querySelector(`[data-l="${LANG}"]`).outerHTML = `<b>${LANG.toUpperCase()}</b>`;
$("#lang").addEventListener("click", () => { const to = NL ? "en" : "nl"; try { localStorage.setItem("cs-lang", to); } catch (e) {} const u = new URL(location.href); u.searchParams.set("lang", to); location.href = u.toString(); });

/* ---------- opening hours (Tue closed, other days 12:00–21:00) ---------- */
const DAYS_EN = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
const DAYS_NL = ["Maandag", "Dinsdag", "Woensdag", "Donderdag", "Vrijdag", "Zaterdag", "Zondag"];
const OPEN = [[12, 0, 21, 0], null, [12, 0, 21, 0], [12, 0, 21, 0], [12, 0, 21, 0], [12, 0, 21, 0], [12, 0, 21, 0]];
const hm = (h, m) => `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
function amsNow() {
  const p = new Intl.DateTimeFormat("en-GB", { weekday: "short", hour: "2-digit", minute: "2-digit", hour12: false, timeZone: TZ }).formatToParts(new Date());
  const g = k => p.find(x => x.type === k).value;
  return { d: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].indexOf(g("weekday")), m: (+g("hour") % 24) * 60 + +g("minute") };
}
function status() {
  const { d, m } = amsNow(), o = OPEN[d];
  if (o && m >= o[0] * 60 + o[1] && m < o[2] * 60 + o[3]) {
    const left = o[2] * 60 + o[3] - m;
    return { open: true, text: left <= 45 ? tr(`Open · closes soon (${hm(o[2], o[3])})`, `Open · sluit binnenkort (${hm(o[2], o[3])})`) : tr(`Open now · until ${hm(o[2], o[3])}`, `Nu open · tot ${hm(o[2], o[3])}`) };
  }
  if (o && m < o[0] * 60 + o[1]) return { open: false, text: tr(`Closed · opens today at ${hm(o[0], o[1])}`, `Gesloten · vandaag open vanaf ${hm(o[0], o[1])}`) };
  let nd = (d + 1) % 7; while (!OPEN[nd]) nd = (nd + 1) % 7;
  const n = OPEN[nd], name = (NL ? DAYS_NL : DAYS_EN)[nd];
  return { open: false, text: nd === (d + 1) % 7 ? tr(`Closed · opens tomorrow at ${hm(n[0], n[1])}`, `Gesloten · morgen open vanaf ${hm(n[0], n[1])}`) : tr(`Closed · opens ${name} at ${hm(n[0], n[1])}`, `Gesloten · ${name.toLowerCase()} open vanaf ${hm(n[0], n[1])}`) };
}
function renderHours() {
  const { d } = amsNow(), ul = $("#hours"); ul.textContent = "";
  (NL ? DAYS_NL : DAYS_EN).forEach((name, i) => {
    const li = document.createElement("li"); if (i === d) li.className = "today";
    const a = document.createElement("span"); a.textContent = name;
    const b = document.createElement("span"); const o = OPEN[i];
    if (o) b.textContent = `${hm(o[0], o[1])} – ${hm(o[2], o[3])}`; else { b.textContent = tr("Closed", "Gesloten"); b.className = "closed"; }
    li.append(a, b); ul.appendChild(li);
  });
  const s = status();
  $("#status-line").textContent = s.text;
  $("#st-dot").classList.toggle("off", !s.open);
  $("#nav-open").textContent = s.open ? tr("Open now", "Nu open") : tr("Closed", "Gesloten");
  $("#nav-dot").classList.toggle("off", !s.open);
}
renderHours(); setInterval(renderHours, 60000);

/* ---------- steps (shared by hero ticker and the steps section) ---------- */
const STEPS = [
  { cn: "面糊", en: "Batter", nl: "Beslag", den: "A ladle of thin batter, spread into a wide circle with a wooden spreader.", dnl: "Een soeplepel dun beslag, met een houten spatel rondgestreken tot een grote cirkel." },
  { cn: "鸡蛋", en: "Egg", nl: "Ei", den: "An egg cracked straight on top and spread over the pancake.", dnl: "Een ei er direct op gebroken en over de pannenkoek uitgestreken." },
  { cn: "葱花", en: "Spring onion & sesame", nl: "Lente-ui & sesam", den: "Chopped spring onion and black sesame, scattered while the egg sets.", dnl: "Gehakte lente-ui en zwarte sesam, gestrooid terwijl het ei stolt." },
  { cn: "翻面", en: "Flip", nl: "Omdraaien", den: "One flip. The underside is golden by now.", dnl: "Eén keer omdraaien. De onderkant is nu goudbruin." },
  { cn: "刷酱", en: "Sauce", nl: "Saus", den: "Brushed with a dark savoury sauce and a little chili.", dnl: "Ingesmeerd met een donkere hartige saus en een beetje chili." },
  { cn: "薄脆", en: "Crisp", nl: "Krokant", den: "A thin, crunchy fried cracker goes in the middle.", dnl: "Een dun, krokant gebakken crackertje gaat in het midden." },
  { cn: "折叠", en: "Fold", nl: "Vouwen", den: "Folded into a hot parcel and handed over.", dnl: "Dichtgevouwen tot een heet pakketje en meegegeven." }
];

/* ---------- hero: the jianbing ---------- */
const cv = $("#griddle"), ctx = cv.getContext("2d");
let W = 0, H = 0, DPR = 1, L = null;
const mk = (w, h) => { const c = document.createElement("canvas"); c.width = Math.max(2, Math.ceil(w)); c.height = Math.max(2, Math.ceil(h)); return c; };
const TEX = {};

function layout() {
  // build pose: big and centred while the jianbing is made; final pose: moved aside for the copy
  const R = mobile ? Math.min(W * 0.4, H * 0.23) : Math.min(H * 0.36, W * 0.24);
  const Rf = mobile ? Math.min(W * 0.3, H * 0.145) : Math.min(H * 0.31, W * 0.2);
  const tilt = 0.84;
  return { R, tilt, b: { cx: W / 2, cy: mobile ? H * 0.43 : H * 0.5, sc: 1 },
    f: { cx: mobile ? W / 2 : W * 0.665, cy: mobile ? Rf * 1.17 * tilt + 74 : H * 0.52, sc: Rf / R } };
}
let P = { cx: 0, cy: 0, sc: 1 };
function pose(s) { P = { cx: lerp(L.b.cx, L.f.cx, s), cy: lerp(L.b.cy, L.f.cy, s), sc: lerp(1, L.f.sc, s) }; }

/* textures are drawn in local, untilted coordinates: a square of side 2R (+margin), centre at (S/2,S/2) */
function buildTextures() {
  const R = L.R, k = DPR, S = Math.ceil(R * 2.2 * k), c = S / 2, r = R * k;
  sd = 11;
  // batter
  const bt = mk(S, S), b = bt.getContext("2d");
  let g = b.createRadialGradient(c - r * 0.2, c - r * 0.25, 0, c, c, r);
  g.addColorStop(0, "#F7E8C4"); g.addColorStop(0.75, "#F0DAA8"); g.addColorStop(1, "#E3C281");
  b.fillStyle = g; b.beginPath(); b.arc(c, c, r, 0, TAU); b.fill();
  for (let i = 0; i < 900; i++) { const a = rnd() * TAU, d = Math.sqrt(rnd()) * r * 0.98; b.fillStyle = rnd() > 0.5 ? "rgba(255,250,232,.35)" : "rgba(196,150,80,.18)"; b.beginPath(); b.arc(c + Math.cos(a) * d, c + Math.sin(a) * d, (rnd() * 1.6 + 0.4) * k, 0, TAU); b.fill(); }
  b.strokeStyle = "rgba(190,140,70,.18)"; b.lineWidth = 1.2 * k;
  for (let s = 0; s < 3; s++) { b.beginPath(); for (let a = 0; a < TAU * 5; a += 0.05) { const d = r * (0.12 + a / (TAU * 5) * 0.86) + s * 3 * k; const x = c + Math.cos(a + s) * d, y = c + Math.sin(a + s) * d; a ? b.lineTo(x, y) : b.moveTo(x, y); } b.stroke(); }
  TEX.batter = bt;
  // crisp, browned underside
  const ct = mk(S, S), q = ct.getContext("2d");
  g = q.createRadialGradient(c - r * 0.15, c - r * 0.2, 0, c, c, r);
  g.addColorStop(0, "#EBC27A"); g.addColorStop(0.6, "#DDA457"); g.addColorStop(0.92, "#C27E31"); g.addColorStop(1, "#9E5C1F");
  q.fillStyle = g; q.beginPath(); q.arc(c, c, r, 0, TAU); q.fill();
  for (let i = 0; i < 520; i++) { const a = rnd() * TAU, d = Math.pow(rnd(), 0.55) * r * 0.97, rr = (rnd() * 4 + 1) * k * (0.5 + d / r); q.fillStyle = `rgba(${120 + rnd() * 40 | 0},${62 + rnd() * 30 | 0},${18 + rnd() * 12 | 0},${0.12 + rnd() * 0.3})`; q.beginPath(); q.ellipse(c + Math.cos(a) * d, c + Math.sin(a) * d, rr * (1 + rnd()), rr, a, 0, TAU); q.fill(); }
  for (let i = 0; i < 260; i++) { const a = rnd() * TAU, d = Math.sqrt(rnd()) * r * 0.9; q.fillStyle = "rgba(255,236,190,.22)"; q.beginPath(); q.arc(c + Math.cos(a) * d, c + Math.sin(a) * d, (rnd() * 1.4 + 0.5) * k, 0, TAU); q.fill(); }
  TEX.crisp = ct;
  // egg, marbled
  const et = mk(S, S), e = et.getContext("2d");
  e.save(); e.beginPath();
  for (let i = 0; i <= 120; i++) { const a = i / 120 * TAU, d = r * (0.86 + Math.sin(a * 5) * 0.025 + Math.sin(a * 11 + 1) * 0.015); const x = c + Math.cos(a) * d, y = c + Math.sin(a) * d; i ? e.lineTo(x, y) : e.moveTo(x, y); }
  e.closePath(); e.clip();
  e.fillStyle = "#F7D88A"; e.fillRect(0, 0, S, S);
  const cols = ["#F2A516", "#F6B93A", "#FBEBC4", "#F4C455", "#EE9A12", "#FFF4D8"];
  for (let i = 0; i < 46; i++) {
    e.strokeStyle = cols[i % cols.length]; e.globalAlpha = 0.45 + rnd() * 0.45; e.lineWidth = (6 + rnd() * 16) * k; e.lineCap = "round";
    const a0 = rnd() * TAU, d0 = rnd() * r * 0.8; e.beginPath();
    for (let j = 0; j < 14; j++) { const a = a0 + j * 0.18, d = d0 + Math.sin(j * 0.7 + i) * r * 0.08; const x = c + Math.cos(a) * d, y = c + Math.sin(a) * d; j ? e.lineTo(x, y) : e.moveTo(x, y); }
    e.stroke();
  }
  e.globalAlpha = 1; e.restore();
  TEX.egg = et;
  // spring onion & sesame
  const tt = mk(S, S), t = tt.getContext("2d");
  TEX.tops = []; sd = 23;
  const nS = mobile ? 46 : 70, nB = mobile ? 90 : 150;
  for (let i = 0; i < nS; i++) { const a = rnd() * TAU, d = Math.sqrt(rnd()) * r * 0.78; TEX.tops.push({ type: rnd() > 0.35 ? 0 : 1, x: Math.cos(a) * d / k, y: Math.sin(a) * d / k, rot: rnd() * TAU, s: 0.7 + rnd() * 0.6, dl: rnd() * 0.55 }); }
  for (let i = 0; i < nB; i++) { const a = rnd() * TAU, d = Math.sqrt(rnd()) * r * 0.8; TEX.tops.push({ type: 2, x: Math.cos(a) * d / k, y: Math.sin(a) * d / k, rot: rnd() * TAU, s: 1, dl: rnd() * 0.6 }); }
  TEX.tops.forEach(o => drawTop(t, c + o.x * k, c + o.y * k, o, k));
  TEX.topsC = tt;
  // sauce
  const st = mk(S, S), u = st.getContext("2d");
  u.save(); u.beginPath(); u.arc(c, c, r * 0.95, 0, TAU); u.clip();
  TEX.sauce = sauceStrokes(R);
  TEX.sauce.forEach(s => strokeSauce(u, s, 1, c, k));
  u.restore();
  TEX.sauceC = st;
  // cracker (baocui)
  const cw = R * 0.62, ch = R * 0.44, crk = mk((cw + 10) * k, (ch + 10) * k), z = crk.getContext("2d");
  z.scale(k, k); z.translate(5, 5);
  g = z.createLinearGradient(0, 0, cw, ch); g.addColorStop(0, "#F6CF7A"); g.addColorStop(0.5, "#E9AF4C"); g.addColorStop(1, "#D08A2C");
  z.fillStyle = g; z.beginPath(); z.roundRect(0, 0, cw, ch, 8); z.fill();
  z.strokeStyle = "rgba(140,80,20,.55)"; z.lineWidth = 1.4; z.stroke();
  sd = 41;
  for (let i = 0; i < 26; i++) { const x = 8 + rnd() * (cw - 16), y = 8 + rnd() * (ch - 16), rr = 2 + rnd() * 6; z.fillStyle = "rgba(255,238,190,.55)"; z.beginPath(); z.ellipse(x, y, rr * 1.4, rr, rnd() * 3, 0, TAU); z.fill(); z.strokeStyle = "rgba(160,96,30,.5)"; z.lineWidth = 1; z.stroke(); }
  TEX.cracker = crk; TEX.cw = cw; TEX.ch = ch;
  TEX.S = S; TEX.k = k;
}
function drawTop(t, x, y, o, k) {
  t.save(); t.translate(x, y); t.rotate(o.rot);
  if (o.type === 0) { const r = 4.2 * o.s * k; t.strokeStyle = "#4F9A2F"; t.lineWidth = 2.2 * k; t.beginPath(); t.ellipse(0, 0, r, r * 0.8, 0, 0, TAU); t.stroke(); t.fillStyle = "rgba(170,220,120,.55)"; t.fill(); }
  else if (o.type === 1) { t.fillStyle = "#6FAE3F"; t.beginPath(); t.roundRect(-6 * o.s * k, -1.6 * k, 12 * o.s * k, 3.2 * k, 1.6 * k); t.fill(); t.fillStyle = "rgba(220,255,180,.5)"; t.fillRect(-5 * o.s * k, -0.5 * k, 10 * o.s * k, 1 * k); }
  else { t.fillStyle = "#1a1512"; t.beginPath(); t.ellipse(0, 0, 1.9 * k, 1.1 * k, 0, 0, TAU); t.fill(); }
  t.restore();
}
function sauceStrokes(R) {
  // brushed back and forth: smooth rows joined by rounded turns
  const brush = (rows, x0, x1, w, col, seed) => {
    const pts = [];
    rows.forEach((y, i) => {
      const dir = i % 2 ? -1 : 1, xa = dir > 0 ? x0 : x1, xb = dir > 0 ? x1 : x0;
      const lim = Math.sqrt(Math.max(0, 1 - (y / R) * (y / R))) * 0.92;
      for (let j = 0; j <= 24; j++) { const u = j / 24; pts.push([lerp(xa, xb, u) * lim, y + Math.sin(u * Math.PI * 2 + seed + i) * R * 0.025]); }
      if (i < rows.length - 1) { const yn = rows[i + 1], xe = xb * lim, lim2 = Math.sqrt(Math.max(0, 1 - (yn / R) * (yn / R))) * 0.92, xe2 = xb * lim2; for (let j = 1; j < 8; j++) { const u = j / 8, a = u * Math.PI; pts.push([lerp(xe, xe2, u) + dir * Math.sin(a) * R * 0.06, lerp(y, yn, (1 - Math.cos(a)) / 2)]); } }
    });
    return { pts, w, col, seed };
  };
  return [
    brush([-0.48 * R, -0.16 * R, 0.16 * R, 0.46 * R], -0.95 * R, 0.95 * R, R * 0.3, [110, 36, 20], 1),
    brush([-0.36 * R, 0.24 * R], -0.8 * R, 0.8 * R, R * 0.09, [214, 52, 26], 3)
  ];
}
function strokeSauce(c2, s, p, c, k) {
  // p: 0..1 drawing progress along the polyline. Base wash + bristle lines for a brushed look.
  const pts = s.pts, n = Math.max(2, Math.floor(pts.length * p)); if (p <= 0) return;
  const path = (off, jit) => { c2.beginPath(); for (let i = 0; i < n; i++) { const q = pts[Math.min(pts.length - 1, i + 1)], o = pts[Math.max(0, i - 1)]; let nx = -(q[1] - o[1]), ny = q[0] - o[0]; const l = Math.hypot(nx, ny) || 1; nx /= l; ny /= l; const j = Math.sin(i * 0.9 + jit) * 0.8; const x = c + (pts[i][0] + nx * (off + j)) * k, y = c + (pts[i][1] + ny * (off + j)) * k; i ? c2.lineTo(x, y) : c2.moveTo(x, y); } };
  const [r, g, b] = s.col; c2.lineCap = "round"; c2.lineJoin = "round";
  c2.strokeStyle = `rgba(${r},${g},${b},.26)`; c2.lineWidth = s.w * k; path(0, 0); c2.stroke();
  const N = 15;
  for (let i = 0; i < N; i++) {
    const off = (i / (N - 1) - 0.5) * s.w * 0.9, a = 0.08 + ((i * 7 + s.seed * 3) % 5) / 22;
    c2.strokeStyle = `rgba(${Math.max(0, r - 20)},${Math.max(0, g - 10)},${b},${a})`; c2.lineWidth = (s.w / N) * (0.6 + (i % 3) * 0.3) * k; path(off, i * 1.7 + s.seed); c2.stroke();
  }
  c2.strokeStyle = `rgba(255,190,150,.16)`; c2.lineWidth = s.w * 0.12 * k; path(-s.w * 0.22, 2); c2.stroke();
}

function size() {
  DPR = Math.min(devicePixelRatio || 1, 2); W = cv.clientWidth; H = cv.clientHeight;
  cv.width = W * DPR; cv.height = H * DPR; ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
  L = layout(); buildTextures();
}
size();
let rT = 0; addEventListener("resize", () => { clearTimeout(rT); rT = setTimeout(() => { if (Math.abs(cv.clientWidth - W) > 2 || Math.abs(cv.clientHeight - H) > 80) size(); }, 150); });

// timeline (seconds)
const TL = { in: [0, 0.7], pour: [0.6, 1.3], spread: [1.25, 2.85], egg: [2.85, 3.25], eggSpread: [3.2, 4.1], tops: [4.05, 4.95], flip: [5.0, 5.75], sauce: [5.8, 6.7], crack: [6.75, 7.25], fold1: [7.3, 7.95], fold2: [7.75, 8.4], done: 8.5, settle: [8.2, 9.3] };
const SPEED = 0.86; for (const k in TL) TL[k] = Array.isArray(TL[k]) ? TL[k].map(v => v * SPEED) : TL[k] * SPEED;
const STEP_AT = [TL.pour[0], TL.egg[0], TL.tops[0], TL.flip[0], TL.sauce[0], TL.crack[0], TL.fold1[0]];
let t0 = null, T = 0, skipped = reduce, revealed = false, heroVisible = true, curStep = -1;
const steam = [], sparks = [];

// local -> screen: we draw the food in local coords around the griddle centre, squashed vertically for a 3/4 view
function toLocal() { ctx.translate(P.cx, P.cy); ctx.scale(P.sc, P.sc * L.tilt); }
function texDraw(img, alpha) { const S = TEX.S / TEX.k; ctx.globalAlpha = alpha; ctx.drawImage(img, -S / 2, -S / 2, S, S); ctx.globalAlpha = 1; }
function spiralPath(r0, r1, phi, sat) {
  // area revealed by a spreader that has rotated `phi` radians; its reach grows from r0 to r1 over the first `sat` radians
  ctx.beginPath();
  for (let i = 0; i <= 140; i++) {
    const th = i / 140 * TAU; let rr = r0;
    if (phi > 0) { const k = Math.floor((phi - th) / TAU); if (phi - th >= 0) { const psi = th + TAU * k; rr = Math.max(r0, lerp(r0, r1, clamp(0, 1, psi / sat))); } }
    const wob = 1 + Math.sin(th * 7 + 1.3) * 0.012;
    const x = Math.cos(th) * rr * wob, y = Math.sin(th) * rr * wob; i ? ctx.lineTo(x, y) : ctx.moveTo(x, y);
  }
  ctx.closePath();
}
function drawSpreader(ang, len, a) {
  ctx.save(); ctx.globalAlpha = a; ctx.rotate(ang);
  ctx.fillStyle = "rgba(0,0,0,.35)"; ctx.fillRect(-4, 6, len + 6, 9);
  const g = ctx.createLinearGradient(0, -6, 0, 6); g.addColorStop(0, "#d9a868"); g.addColorStop(0.5, "#b07a3c"); g.addColorStop(1, "#7d5326");
  ctx.fillStyle = g; ctx.beginPath(); ctx.roundRect(-6, -5, len + 12, 10, 5); ctx.fill();
  ctx.fillStyle = "#6a4420"; ctx.beginPath(); ctx.roundRect(-10, -16, 14, 32, 5); ctx.fill();
  ctx.restore();
}
function drawGriddle(a, t) {
  const G = L.R * 1.17;
  ctx.save(); ctx.globalAlpha = a;
  // heat glow
  const gl = ctx.createRadialGradient(P.cx, P.cy + G * 0.25 * P.sc, 0, P.cx, P.cy + G * 0.25 * P.sc, G * 2 * P.sc);
  gl.addColorStop(0, `rgba(242,120,30,${0.2 + 0.05 * Math.sin(t * 1.7)})`); gl.addColorStop(0.5, "rgba(140,50,10,.08)"); gl.addColorStop(1, "rgba(14,13,11,0)");
  ctx.fillStyle = gl; ctx.fillRect(0, 0, W, H);
  ctx.save(); toLocal();
  // body (side of the griddle)
  ctx.fillStyle = "#070706"; ctx.beginPath(); ctx.ellipse(0, G * 0.16, G * 1.02, G * 1.02, 0, 0, TAU); ctx.fill();
  const sd2 = ctx.createLinearGradient(-G, 0, G, 0); sd2.addColorStop(0, "#1c1916"); sd2.addColorStop(0.45, "#3a332c"); sd2.addColorStop(1, "#141210");
  ctx.fillStyle = sd2; ctx.beginPath(); ctx.ellipse(0, G * 0.1, G * 1.01, G * 1.0, 0, 0, Math.PI); ctx.fill();
  // top plate
  const pg = ctx.createRadialGradient(-G * 0.3, -G * 0.35, 0, 0, 0, G);
  pg.addColorStop(0, "#3b352f"); pg.addColorStop(0.55, "#24201c"); pg.addColorStop(1, "#151311");
  ctx.fillStyle = pg; ctx.beginPath(); ctx.arc(0, 0, G, 0, TAU); ctx.fill();
  ctx.strokeStyle = "rgba(255,255,255,.035)"; ctx.lineWidth = 1;
  for (let i = 1; i < 9; i++) { ctx.beginPath(); ctx.arc(0, 0, G * i / 9, 0, TAU); ctx.stroke(); }
  ctx.strokeStyle = "rgba(255,210,150,.22)"; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(0, 0, G - 1, Math.PI * 1.05, Math.PI * 1.75); ctx.stroke();
  ctx.strokeStyle = "#4a4239"; ctx.lineWidth = 2.5; ctx.beginPath(); ctx.arc(0, 0, G, 0, TAU); ctx.stroke();
  ctx.restore(); ctx.restore();
}
function drawFlap(side, ang, topLayers, underLayers, w0) {
  // side -1 = left flap, +1 = right flap. Rotates around the line x = side*w0.
  const R = L.R, c0 = Math.cos(ang), cA = Math.sign(c0 || 1) * Math.max(0.012, Math.abs(c0));
  ctx.save();
  ctx.translate(side * w0, 0); ctx.scale(cA, 1); ctx.translate(-side * w0, 0);
  ctx.beginPath(); if (side < 0) ctx.rect(-R * 1.2, -R * 1.2, R * 1.2 - w0, R * 2.4); else ctx.rect(w0, -R * 1.2, R * 1.2, R * 2.4); ctx.clip();
  ctx.beginPath(); ctx.arc(0, 0, R, 0, TAU); ctx.clip();
  (cA >= 0 ? topLayers : underLayers)();
  // fold shading
  const sh = 1 - Math.abs(cA);
  ctx.fillStyle = `rgba(30,14,4,${0.35 * sh})`; ctx.fillRect(-R * 1.2, -R * 1.2, R * 2.4, R * 2.4);
  ctx.restore();
}

function setStep(i, p) {
  if (i !== curStep) {
    curStep = i; const s = STEPS[i];
    $("#step-n").textContent = String(i + 1).padStart(2, "0"); $("#step-cn").textContent = s.cn; $("#step-t").textContent = tr(s.en, s.nl);
    if (window.gsap && !skipped) gsap.fromTo("#step", { y: 8, opacity: 0.2 }, { y: 0, opacity: 1, duration: 0.4, ease: "expo.out" });
  }
  $("#step-bar").style.width = (p * 100).toFixed(1) + "%";
}

function frame(now) {
  requestAnimationFrame(frame);
  if (!heroVisible) return;
  if (t0 === null) t0 = now;
  T = (now - t0) / 1000;
  const t = skipped ? TL.done + T : T;
  const R = L.R;
  pose(eInOut(seg(t, TL.settle[0], TL.settle[1])));
  ctx.clearRect(0, 0, W, H);
  drawGriddle(eOut(seg(t, TL.in[0], TL.in[1])), t);

  // step label
  let si = 0; for (let i = 0; i < STEP_AT.length; i++) if (t >= STEP_AT[i]) si = i;
  setStep(si, clamp(0, 1, (t - TL.pour[0]) / (TL.done - TL.pour[0])));

  const flipP = seg(t, TL.flip[0], TL.flip[1]);
  const flipped = flipP >= 0.5;
  const sauceP = seg(t, TL.sauce[0], TL.sauce[1]);
  const crackP = seg(t, TL.crack[0], TL.crack[1]);
  const f1 = eInOut(seg(t, TL.fold1[0], TL.fold1[1])), f2 = eInOut(seg(t, TL.fold2[0], TL.fold2[1]));
  const done = seg(t, TL.done, TL.done + 0.8);
  const w0 = R * 0.4;

  ctx.save(); toLocal();
  // parcel slowly turns and lifts once folded
  if (done > 0) { const e = eOut(done); ctx.rotate(-0.22 * e); ctx.translate(0, -R * 0.04 * e); }

  // crepe shadow
  if (t > TL.pour[0]) { ctx.fillStyle = "rgba(0,0,0,.35)"; ctx.beginPath(); ctx.ellipse(0, R * 0.04, R * lerp(1, 0.5, Math.max(f1, f2)), R * 1.0, 0, 0, TAU); ctx.fill(); }

  // layers of the top side (before flip): batter, egg, toppings. After flip: crisp side, sauce, cracker.
  const spreadPhi = eInOut(seg(t, TL.spread[0], TL.spread[1])) * TAU * 2.2, SAT1 = TAU * 1.2;
  const eggPhi = eInOut(seg(t, TL.eggSpread[0], TL.eggSpread[1])) * TAU * 1.6, SAT2 = TAU * 0.6;
  const r0 = R * 0.26 * eOut(seg(t, TL.pour[0], TL.pour[1]));
  const sideA = () => {
    // batter
    if (t >= TL.pour[0]) { ctx.save(); spiralPath(r0, R, spreadPhi, SAT1); ctx.clip(); texDraw(TEX.batter, 1);
      // edges brown a little while the egg cooks
      const br = seg(t, TL.eggSpread[0], TL.flip[0]); if (br > 0) { const g = ctx.createRadialGradient(0, 0, R * 0.7, 0, 0, R); g.addColorStop(0, "rgba(190,120,50,0)"); g.addColorStop(1, `rgba(170,100,35,${0.5 * br})`); ctx.fillStyle = g; ctx.fillRect(-R, -R, R * 2, R * 2); }
      ctx.restore(); }
    // egg
    const eP = seg(t, TL.eggSpread[0], TL.eggSpread[1]);
    if (eP > 0) { ctx.save(); spiralPath(R * 0.16, R * 0.9, eggPhi, SAT2); ctx.clip(); texDraw(TEX.egg, 1); ctx.restore(); }
    // toppings falling
    const tp = seg(t, TL.tops[0], TL.tops[1]);
    if (tp >= 1 || (flipP > 0 && t > TL.tops[1])) texDraw(TEX.topsC, 1);
    else if (tp > 0) TEX.tops.forEach(o => { const p = seg(tp, o.dl * 0.6, o.dl * 0.6 + 0.4); if (p <= 0) return; const e = eOut(p); ctx.save(); ctx.globalAlpha = Math.min(1, p * 3); ctx.translate(0, -(1 - e) * R * 0.5); drawTop(ctx, o.x, o.y, Object.assign({}, o, { s: o.s * (1 + (1 - e) * 0.8) }), 1); ctx.restore(); });
  };
  const sideB = () => {
    texDraw(TEX.crisp, 1);
    if (sauceP >= 1) texDraw(TEX.sauceC, 1);
    else if (sauceP > 0) { ctx.save(); ctx.beginPath(); ctx.arc(0, 0, R * 0.95, 0, TAU); ctx.clip(); TEX.sauce.forEach((s, i) => strokeSauce(ctx, s, clamp(0, 1, sauceP * 1.6 - i * 0.6), 0, 1)); ctx.restore(); }
  };
  const cracker = () => {
    if (crackP <= 0) return;
    const e = eBack(crackP), cw = TEX.cw, ch = TEX.ch;
    ctx.save(); ctx.globalAlpha = Math.min(1, crackP * 4); ctx.translate(0, -(1 - Math.min(1, crackP * 1.4)) * R * 0.6); ctx.scale(lerp(1.3, 1, e), lerp(1.3, 1, e)); ctx.rotate(0.04);
    ctx.fillStyle = "rgba(0,0,0,.25)"; ctx.beginPath(); ctx.roundRect(-cw / 2 + 4, -ch / 2 + 6, cw, ch, 8); ctx.fill();
    ctx.drawImage(TEX.cracker, -cw / 2 - 5, -ch / 2 - 5, cw + 10, ch + 10); ctx.restore();
  };

  if (t >= TL.pour[0]) {
    if (f1 <= 0) {
      // flipping: squash horizontally around the centre, swap faces at the halfway point
      const sx = flipP > 0 ? Math.abs(Math.cos(flipP * Math.PI)) : 1;
      ctx.save(); ctx.scale(Math.max(0.02, sx), 1); if (flipP > 0) ctx.translate(0, -Math.sin(flipP * Math.PI) * R * 0.18);
      ctx.beginPath(); ctx.arc(0, 0, R * 1.02, 0, TAU); ctx.clip();
      flipped ? sideB() : sideA();
      if (flipP > 0 && flipP < 1) { ctx.fillStyle = `rgba(40,20,5,${0.3 * Math.sin(flipP * Math.PI)})`; ctx.fillRect(-R, -R, R * 2, R * 2); }
      ctx.restore();
      cracker();
    } else {
      // middle panel
      ctx.save(); ctx.beginPath(); ctx.rect(-w0, -R * 1.1, w0 * 2, R * 2.2); ctx.clip(); ctx.beginPath(); ctx.arc(0, 0, R, 0, TAU); ctx.clip(); sideB(); ctx.restore();
      cracker();
      // flaps: top side shows sauce, underside shows egg & spring onion (mirrored by the fold)
      const under = () => { texDraw(TEX.batter, 1); texDraw(TEX.egg, 1); texDraw(TEX.topsC, 1); };
      drawFlap(-1, f1 * Math.PI * 0.985, sideB, under, w0);
      if (f2 > 0) drawFlap(1, f2 * Math.PI * 0.985, sideB, under, w0); else { ctx.save(); ctx.beginPath(); ctx.rect(w0, -R * 1.2, R, R * 2.4); ctx.clip(); ctx.beginPath(); ctx.arc(0, 0, R, 0, TAU); ctx.clip(); sideB(); ctx.restore(); }
    }
  }

  // ladle pouring
  const pp = seg(t, TL.pour[0] - 0.25, TL.pour[1] + 0.2);
  if (pp > 0 && pp < 1) {
    const a = Math.sin(pp * Math.PI), x = R * 0.55 * (1 - eOut(Math.min(1, pp * 2))) + 6, y = -R * 0.5 * (1 - eOut(Math.min(1, pp * 2))) - 14;
    ctx.save(); ctx.globalAlpha = a; ctx.translate(x, y); ctx.rotate(-0.5 + pp * 0.6);
    ctx.strokeStyle = "#8b8178"; ctx.lineWidth = 7; ctx.lineCap = "round"; ctx.beginPath(); ctx.moveTo(18, -6); ctx.lineTo(R * 0.9, -R * 0.55); ctx.stroke();
    const lg = ctx.createRadialGradient(-4, -6, 2, 0, 0, 26); lg.addColorStop(0, "#d6cec5"); lg.addColorStop(1, "#6f665e");
    ctx.fillStyle = lg; ctx.beginPath(); ctx.arc(0, 0, 24, 0, TAU); ctx.fill();
    ctx.fillStyle = "#F0DAA8"; ctx.beginPath(); ctx.ellipse(0, 0, 18, 15, 0, 0, TAU); ctx.fill();
    ctx.restore();
  }
  // spreader: batter pass, then egg pass
  const sp1 = seg(t, TL.spread[0] - 0.12, TL.spread[1] + 0.12), sp2 = seg(t, TL.eggSpread[0] - 0.1, TL.eggSpread[1] + 0.1);
  if (sp1 > 0 && sp1 < 1) drawSpreader(spreadPhi - 0.12, lerp(Math.max(r0, R * 0.2), R * 0.98, clamp(0, 1, spreadPhi / SAT1)), Math.min(1, Math.sin(sp1 * Math.PI) * 1.6));
  if (sp2 > 0 && sp2 < 1) drawSpreader(eggPhi - 0.12, lerp(R * 0.2, R * 0.9, clamp(0, 1, eggPhi / SAT2)), Math.min(1, Math.sin(sp2 * Math.PI) * 1.6));
  // the egg dropping in
  const ed = seg(t, TL.egg[0], TL.egg[1]);
  if (ed > 0 && t < TL.eggSpread[0] + 0.25) {
    const e = eOut(Math.min(1, ed * 1.6)), fade = 1 - seg(t, TL.eggSpread[0], TL.eggSpread[0] + 0.25);
    ctx.save(); ctx.globalAlpha = fade; ctx.translate(-R * 0.05, -R * 0.4 * (1 - e));
    ctx.fillStyle = "rgba(255,250,236,.85)"; ctx.beginPath(); ctx.ellipse(0, 0, R * 0.2 * e + 8, R * 0.16 * e + 6, 0.3, 0, TAU); ctx.fill();
    ctx.fillStyle = "#F2A516"; ctx.beginPath(); ctx.arc(R * 0.02, -R * 0.01, R * 0.075, 0, TAU); ctx.fill();
    ctx.fillStyle = "rgba(255,255,255,.6)"; ctx.beginPath(); ctx.arc(-R * 0.01, -R * 0.035, R * 0.022, 0, TAU); ctx.fill();
    // shell halves flying off
    if (ed < 1) { ctx.fillStyle = "#f3ecdf"; for (const s of [-1, 1]) { ctx.save(); ctx.translate(s * R * 0.3 * ed, -R * 0.35 * ed); ctx.rotate(s * ed * 2); ctx.globalAlpha = (1 - ed) * fade; ctx.beginPath(); ctx.arc(0, 0, R * 0.07, 0, Math.PI); ctx.fill(); ctx.restore(); } }
    ctx.restore();
  }
  ctx.restore();

  // sizzle sparks around the crepe edge while cooking
  if (t > TL.pour[1] && t < TL.done + 1.5 && sparks.length < 26 && Math.random() < 0.45) { const a = Math.random() * TAU; sparks.push({ a, d: R * (f2 > 0.9 ? 0.45 : 1.0) * (0.98 + Math.random() * 0.06), life: 1 }); }
  ctx.save(); ctx.translate(P.cx, P.cy);
  for (let i = sparks.length - 1; i >= 0; i--) { const s = sparks[i]; s.life -= 0.05; if (s.life <= 0) { sparks.splice(i, 1); continue; } ctx.fillStyle = `rgba(255,240,200,${s.life * 0.8})`; ctx.beginPath(); ctx.arc(Math.cos(s.a) * s.d * P.sc, Math.sin(s.a) * s.d * L.tilt * P.sc - (1 - s.life) * 6, 1.4, 0, TAU); ctx.fill(); }
  ctx.restore();

  // steam
  const steamOn = clamp(0, 1, (t - TL.eggSpread[0]) / 1.5);
  if (steamOn > 0) {
    const RS = R * P.sc;
    if (steam.length < (mobile ? 12 : 22) && Math.random() < 0.25) steam.push({ x: (Math.random() - 0.5) * (f2 > 0.9 ? 0.6 : 1.3), life: 0, w: 0.08 + Math.random() * 0.1, ph: Math.random() * 6 });
    for (let i = steam.length - 1; i >= 0; i--) {
      const s = steam[i]; s.life += 0.016 / 3.4; if (s.life >= 1) { steam.splice(i, 1); continue; }
      const yy = P.cy - RS * 0.1 - s.life * RS * 1.3, xx = P.cx + s.x * RS + Math.sin(s.life * 5 + s.ph) * RS * 0.08, rr = s.w * RS * (0.6 + s.life);
      const g = ctx.createRadialGradient(xx, yy, 0, xx, yy, rr);
      g.addColorStop(0, `rgba(246,238,223,${0.06 * Math.sin(s.life * Math.PI) * steamOn})`); g.addColorStop(1, "rgba(246,238,223,0)");
      ctx.fillStyle = g; ctx.beginPath(); ctx.arc(xx, yy, rr, 0, TAU); ctx.fill();
    }
  }
  if (!revealed && t >= TL.settle[0] + 0.35) reveal();
}

const io = new IntersectionObserver(es => es.forEach(e => { heroVisible = e.isIntersecting; }), { threshold: 0 });
io.observe($("#hero"));

/* split hero title into words */
const title = $("#hero-title");
(function wrap(node) { [...node.childNodes].forEach(n => { if (n.nodeType === 3) { const f = document.createDocumentFragment(); n.textContent.split(/(\s+)/).forEach(p => { if (!p) return; if (/^\s+$/.test(p)) { f.appendChild(document.createTextNode(" ")); return; } const w = document.createElement("span"); w.className = "w"; const i = document.createElement("span"); i.textContent = p; w.appendChild(i); f.appendChild(w); }); n.replaceWith(f); } else wrap(n); }); })(title);

function reveal() {
  revealed = true;
  const els = ".hero-copy .eyebrow,.hero-sub,.hero-ctas,.hero-cn,.nav";
  if (!window.gsap) { $$(els).forEach(e => e.style.opacity = 1); $$(".hero-title .w>span").forEach(s => s.style.transform = "none"); return; }
  gsap.to(".nav", { opacity: 1, duration: 1, ease: "power2.out" });
  gsap.to(".hero-copy .eyebrow", { opacity: 1, duration: 0.8 });
  gsap.to(".hero-title .w>span", { y: 0, yPercent: 0, duration: 1.1, ease: "expo.out", stagger: 0.06 });
  gsap.fromTo(".hero-sub", { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: 1, delay: 0.3, ease: "expo.out" });
  gsap.fromTo(".hero-ctas", { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: 1, delay: 0.45, ease: "expo.out" });
  gsap.fromTo(".hero-cn", { opacity: 0, y: 40 }, { opacity: 1, y: 0, duration: 1.4, delay: 0.2, ease: "expo.out" });
}
$("#skip").addEventListener("click", () => { skipped = true; t0 = null; if (!revealed) reveal(); });
requestAnimationFrame(frame);

/* ---------- biang: slap the noodle ---------- */
const bc = $("#bcv"), bx = bc.getContext("2d");
let BW = 0, BH = 0, bVisible = false;
function bSize() { const d = Math.min(devicePixelRatio || 1, 2); BW = bc.clientWidth; BH = bc.clientHeight; bc.width = BW * d; bc.height = BH * d; bx.setTransform(d, 0, 0, d, 0, 0); }
bSize(); addEventListener("resize", bSize);
const B = { slaps: 0, anim: -1, a0: 0, width: 0.13, len: 0.66, bowl: -1, words: [], flour: [], shake: 0 };
const wordsEN = ["BIÁNG!", "BIÁNG!!", "BIÁNG!!!"];
function slap() {
  if (B.bowl >= 0) { // reset
    Object.assign(B, { slaps: 0, anim: -1, width: 0.13, len: 0.66, bowl: -1 }); $("#slapn").textContent = "0"; $("#slap-l").textContent = tr("Slap it", "Klap erop"); $$("#tops span").forEach(s => s.classList.remove("on")); return;
  }
  if (B.anim >= 0) return;
  B.anim = 0; B.a0 = performance.now();
}
$("#slap").addEventListener("click", e => { e.stopPropagation(); slap(); });
$("#bstage").addEventListener("click", slap);
$("#bstage").addEventListener("keydown", e => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); slap(); } });
$("#slap-l").textContent = tr("Slap it", "Klap erop");

const rib = { ph: 0 };
function ribbon(pts, w, alpha) {
  // filled strip along a polyline, with a soft highlight
  const up = [], dn = [];
  for (let i = 0; i < pts.length; i++) {
    const p = pts[i], q = pts[Math.min(pts.length - 1, i + 1)], o = pts[Math.max(0, i - 1)];
    let nx = -(q[1] - o[1]), ny = q[0] - o[0]; const l = Math.hypot(nx, ny) || 1; nx /= l; ny /= l;
    const taper = Math.min(1, Math.min(i, pts.length - 1 - i) / 4 + 0.35) * (1 + 0.1 * Math.sin(i * 0.55 + rib.ph));
    const ru = Math.sin(i * 1.9 + rib.ph * 2) * w * 0.035, rd = Math.sin(i * 2.3 + 1 + rib.ph * 2) * w * 0.035;
    up.push([p[0] + nx * (w / 2 * taper + ru), p[1] + ny * (w / 2 * taper + ru)]); dn.push([p[0] - nx * (w / 2 * taper + rd), p[1] - ny * (w / 2 * taper + rd)]);
  }
  bx.save(); bx.globalAlpha = alpha;
  bx.fillStyle = "rgba(70,40,10,.18)"; bx.beginPath(); up.forEach((p, i) => i ? bx.lineTo(p[0] + 4, p[1] + 8) : bx.moveTo(p[0] + 4, p[1] + 8)); dn.reverse().forEach(p => bx.lineTo(p[0] + 4, p[1] + 8)); bx.closePath(); bx.fill(); dn.reverse();
  const g = bx.createLinearGradient(0, pts[0][1] - w, 0, pts[0][1] + w); g.addColorStop(0, "#FBF0D6"); g.addColorStop(0.5, "#F2DDAE"); g.addColorStop(1, "#DDBF85");
  bx.fillStyle = g; bx.beginPath(); up.forEach((p, i) => i ? bx.lineTo(p[0], p[1]) : bx.moveTo(p[0], p[1])); dn.reverse().forEach(p => bx.lineTo(p[0], p[1])); bx.closePath(); bx.fill();
  bx.strokeStyle = "rgba(170,120,60,.45)"; bx.lineWidth = 1.2; bx.stroke();
  bx.strokeStyle = "rgba(190,150,90,.35)"; bx.lineWidth = Math.max(1, w * 0.05); bx.beginPath(); pts.forEach((p, i) => i ? bx.lineTo(p[0], p[1] + w * 0.22) : bx.moveTo(p[0], p[1] + w * 0.22)); bx.stroke();
  bx.strokeStyle = "rgba(255,255,255,.55)"; bx.lineWidth = Math.max(1.5, w * 0.12); bx.lineCap = "round"; bx.beginPath(); pts.forEach((p, i) => i ? bx.lineTo(p[0], p[1] - w * 0.18) : bx.moveTo(p[0], p[1] - w * 0.18)); bx.stroke();
  bx.restore();
}
function bFrame(now) {
  requestAnimationFrame(bFrame);
  if (!bVisible) return;
  const t = now / 1000; rib.ph = t * 0.6;
  bx.clearRect(0, 0, BW, BH);
  // shake
  let sx = 0, sy = 0; if (B.shake > 0) { sx = (Math.random() - 0.5) * B.shake * 10; sy = (Math.random() - 0.5) * B.shake * 10; B.shake *= 0.86; if (B.shake < 0.02) B.shake = 0; }
  bx.save(); bx.translate(sx, sy);
  // wood grain
  bx.strokeStyle = "rgba(120,80,30,.12)"; bx.lineWidth = 1.2;
  for (let i = 0; i < 16; i++) { const y = (i + 0.5) / 16 * BH; bx.beginPath(); for (let x = 0; x <= BW; x += 20) { const yy = y + Math.sin(x * 0.01 + i * 1.7) * 4 + Math.sin(x * 0.033 + i) * 2; x ? bx.lineTo(x, yy) : bx.moveTo(x, yy); } bx.stroke(); }
  // flour patches and dust on the board
  for (const [fx, fy, fr] of [[0.3, 0.62, 0.22], [0.68, 0.55, 0.26], [0.5, 0.7, 0.18]]) { const g = bx.createRadialGradient(BW * fx, BH * fy, 0, BW * fx, BH * fy, BW * fr); g.addColorStop(0, "rgba(255,252,242,.55)"); g.addColorStop(1, "rgba(255,252,242,0)"); bx.fillStyle = g; bx.beginPath(); bx.ellipse(BW * fx, BH * fy, BW * fr, BW * fr * 0.45, 0, 0, TAU); bx.fill(); }
  // rolling pin
  bx.save(); bx.translate(BW * 0.78, BH * 0.18); bx.rotate(-0.18); const rp = bx.createLinearGradient(0, -BH * 0.035, 0, BH * 0.035); rp.addColorStop(0, "#e2b67a"); rp.addColorStop(0.5, "#b98447"); rp.addColorStop(1, "#8c5d2c"); bx.fillStyle = "rgba(70,40,10,.2)"; bx.beginPath(); bx.roundRect(-BW * 0.2 + 6, -BH * 0.03 + 10, BW * 0.4, BH * 0.06, BH * 0.03); bx.fill(); bx.fillStyle = rp; bx.beginPath(); bx.roundRect(-BW * 0.2, -BH * 0.03, BW * 0.4, BH * 0.06, BH * 0.03); bx.fill(); bx.restore();
  bx.fillStyle = "rgba(255,250,235,.5)"; sd = 99; for (let i = 0; i < 70; i++) { bx.globalAlpha = 0.15 + rnd() * 0.35; bx.beginPath(); bx.arc(BW * (0.12 + rnd() * 0.76), BH * (0.42 + rnd() * 0.3), rnd() * 2 + 0.6, 0, TAU); bx.fill(); } bx.globalAlpha = 1;

  const boardY = BH * 0.58, cx = BW / 2;
  if (B.bowl < 0) {
    let lift = 0, extra = 0, wave = 0;
    if (B.anim >= 0) {
      const p = (now - B.a0) / 760;
      if (p < 0.45) { const v = p / 0.45; lift = Math.sin(v * Math.PI * 0.5) * BH * 0.3; extra = 0.1 * eOut(v); wave = Math.sin(v * Math.PI) * 18; }
      else if (p < 0.58) { const v = (p - 0.45) / 0.13; lift = (1 - eIn(v)) * BH * 0.3; extra = 0.1; wave = (1 - v) * 10; }
      else {
        if (B.anim < 1) { // impact
          B.anim = 1; B.slaps++; B.width += 0.035; B.len = Math.min(0.8, B.len + 0.07); B.shake = 1;
          $("#slapn").textContent = B.slaps;
          B.words.push({ txt: tr(wordsEN[B.slaps - 1], wordsEN[B.slaps - 1]), life: 1, x: cx + (Math.random() - 0.5) * BW * 0.2, y: boardY - BH * 0.2, rot: (Math.random() - 0.5) * 0.3 });
          for (let i = 0; i < 46; i++) { const a = Math.PI + Math.random() * Math.PI, s = 80 + Math.random() * 240; B.flour.push({ x: cx + (Math.random() - 0.5) * BW * B.len, y: boardY, vx: Math.cos(a) * s, vy: Math.sin(a) * s * 0.8, life: 1, r: Math.random() * 2.4 + 0.8 }); }
        }
        const v = Math.min(1, (p - 0.58) / 0.42); wave = Math.sin(v * Math.PI * 3) * (1 - v) * 6;
        if (p >= 1) { B.anim = -1; if (B.slaps >= 3) { B.bowl = now; $("#slap-l").textContent = tr("Again", "Nog een keer"); } }
      }
    } else wave = Math.sin(t * 1.6) * 3;
    const half = BW * (B.len + extra) / 2, pts = [];
    for (let i = 0; i <= 40; i++) {
      const u = i / 40, x = cx - half + u * half * 2, bell = Math.sin(u * Math.PI);
      const y = boardY - lift * bell * (0.6 + 0.4 * bell) + Math.sin(u * Math.PI * 3 + t * 6) * wave * bell - (lift > 0 ? 0 : 0);
      pts.push([x, y]);
    }
    // impact ring
    if (B.anim === 1) { const p = (now - B.a0) / 760, v = (p - 0.58) / 0.42; if (v < 1) { bx.strokeStyle = `rgba(90,60,20,${0.35 * (1 - v)})`; bx.lineWidth = 2; bx.beginPath(); bx.ellipse(cx, boardY + 6, BW * (B.len / 2 + 0.1 * v), BH * (0.05 + 0.12 * v), 0, 0, TAU); bx.stroke(); } }
    ribbon(pts, BH * B.width, 1);
  } else {
    // into the bowl
    const p = clamp(0, 1, (now - B.bowl) / 2600);
    const R = Math.min(BW, BH) * 0.36, by = BH * 0.48;
    const bA = eOut(clamp(0, 1, p * 3));
    bx.save(); bx.globalAlpha = bA; bx.translate(cx, by); bx.scale(lerp(0.8, 1, bA), lerp(0.8, 1, bA));
    bx.fillStyle = "rgba(70,40,10,.3)"; bx.beginPath(); bx.ellipse(8, 16, R * 1.08, R * 1.02, 0, 0, TAU); bx.fill();
    let g = bx.createRadialGradient(-R * 0.3, -R * 0.3, 0, 0, 0, R * 1.08); g.addColorStop(0, "#f8f2e8"); g.addColorStop(1, "#d8cbb6");
    bx.fillStyle = g; bx.beginPath(); bx.arc(0, 0, R * 1.08, 0, TAU); bx.fill();
    bx.strokeStyle = "#D9301C"; bx.lineWidth = 3; bx.beginPath(); bx.arc(0, 0, R * 1.0, 0, TAU); bx.stroke();
    bx.setLineDash([3, 8]); bx.lineWidth = 2; bx.beginPath(); bx.arc(0, 0, R * 0.95, 0, TAU); bx.stroke(); bx.setLineDash([]);
    bx.fillStyle = "#7a3216"; bx.beginPath(); bx.arc(0, 0, R * 0.9, 0, TAU); bx.fill();
    bx.save(); bx.beginPath(); bx.arc(0, 0, R * 0.9, 0, TAU); bx.clip();
    // noodles, folded in the bowl
    for (let k = 0; k < 5; k++) { const pts = []; const yy = (-0.55 + k * 0.27) * R; for (let i = 0; i <= 30; i++) { const u = i / 30; pts.push([(-1 + u * 2) * R * 0.95, yy + Math.sin(u * Math.PI * 2 + k) * R * 0.09]); } ribbon(pts, R * 0.2, bA); }
    // toppings appear in order
    const tops = [["pork", 0.25], ["tomato", 0.42], ["bokchoy", 0.58], ["chili", 0.74]];
    tops.forEach(([key, at], i) => {
      const q = clamp(0, 1, (p - at) / 0.16); if (q <= 0) return;
      const chip = $(`#tops span[data-k="${key}"]`); if (chip && !chip.classList.contains("on")) chip.classList.add("on");
      const e = eBack(q); bx.save(); bx.globalAlpha = Math.min(1, q * 2);
      sd = 300 + i * 17;
      if (key === "pork") for (let j = 0; j < 6; j++) { const a = -2.4 + j * 0.32, d = R * (0.45 + rnd() * 0.2); bx.save(); bx.translate(Math.cos(a) * d, Math.sin(a) * d); bx.scale(e, e); bx.rotate(rnd() * 2); bx.fillStyle = "#6e2e17"; bx.beginPath(); bx.roundRect(-R * 0.09, -R * 0.06, R * 0.18, R * 0.12, 4); bx.fill(); bx.fillStyle = "#e9c9a2"; bx.fillRect(-R * 0.09, -R * 0.015, R * 0.18, R * 0.03); bx.restore(); }
      if (key === "tomato") for (let j = 0; j < 9; j++) { const a = 0.2 + j * 0.28, d = R * (0.35 + rnd() * 0.3); bx.save(); bx.translate(Math.cos(a) * d, Math.sin(a) * d); bx.scale(e, e); bx.fillStyle = j % 3 ? "#d8381f" : "#F2B526"; bx.beginPath(); bx.ellipse(0, 0, R * (0.06 + rnd() * 0.04), R * 0.05, rnd() * 3, 0, TAU); bx.fill(); bx.restore(); }
      if (key === "bokchoy") for (let j = 0; j < 3; j++) { const a = 2.6 + j * 0.5; bx.save(); bx.translate(Math.cos(a) * R * 0.5, Math.sin(a) * R * 0.5); bx.rotate(a + 1.4); bx.scale(e, e); bx.fillStyle = "#4f8f2a"; bx.beginPath(); bx.ellipse(0, -R * 0.08, R * 0.11, R * 0.18, 0, 0, TAU); bx.fill(); bx.fillStyle = "#cfe6a8"; bx.beginPath(); bx.ellipse(0, R * 0.1, R * 0.05, R * 0.1, 0, 0, TAU); bx.fill(); bx.restore(); }
      if (key === "chili") { bx.globalCompositeOperation = "multiply"; for (let j = 0; j < 14; j++) { const a = rnd() * TAU, d = Math.sqrt(rnd()) * R * 0.8; bx.fillStyle = "rgba(217,48,28,.45)"; bx.beginPath(); bx.arc(Math.cos(a) * d, Math.sin(a) * d, R * (0.04 + rnd() * 0.07) * e, 0, TAU); bx.fill(); } bx.globalCompositeOperation = "source-over"; bx.fillStyle = "#9a1d0c"; for (let j = 0; j < 40; j++) { const a = rnd() * TAU, d = Math.sqrt(rnd()) * R * 0.85; bx.fillRect(Math.cos(a) * d, Math.sin(a) * d, 3 * e, 2 * e); } }
      bx.restore();
    });
    bx.restore(); bx.restore();
    // steam
    for (let j = 0; j < 3; j++) { const ph = (t * 0.4 + j / 3) % 1; bx.strokeStyle = `rgba(255,255,255,${0.35 * Math.sin(ph * Math.PI) * bA})`; bx.lineWidth = 3; bx.lineCap = "round"; bx.beginPath(); const x0 = cx + (j - 1) * R * 0.35; for (let i = 0; i <= 10; i++) { const u = i / 10; const x = x0 + Math.sin(u * 5 + t * 2 + j) * 8, y = by - R * 0.2 - u * R * 0.9 - ph * 30; i ? bx.lineTo(x, y) : bx.moveTo(x, y); } bx.stroke(); }
  }
  // flour burst
  for (let i = B.flour.length - 1; i >= 0; i--) { const f = B.flour[i]; f.life -= 0.022; if (f.life <= 0) { B.flour.splice(i, 1); continue; } f.x += f.vx * 0.016; f.y += f.vy * 0.016; f.vy += 300 * 0.016; bx.globalAlpha = f.life; bx.fillStyle = "#fffaf0"; bx.beginPath(); bx.arc(f.x, f.y, f.r, 0, TAU); bx.fill(); }
  bx.globalAlpha = 1;
  // BIÁNG! words
  for (let i = B.words.length - 1; i >= 0; i--) {
    const w = B.words[i]; w.life -= 0.012; if (w.life <= 0) { B.words.splice(i, 1); continue; }
    const age = 1 - w.life, s = age < 0.15 ? eBack(age / 0.15) : 1;
    bx.save(); bx.translate(w.x, w.y - age * 30); bx.rotate(w.rot); bx.scale(s, s); bx.globalAlpha = Math.min(1, w.life * 2.5);
    bx.font = `900 ${Math.round(Math.min(BW, 700) * 0.14)}px Shoulders, Impact, sans-serif`; bx.textAlign = "center"; bx.textBaseline = "middle";
    bx.lineWidth = 10; bx.strokeStyle = "#1A1410"; bx.lineJoin = "round"; bx.strokeText(w.txt, 0, 0);
    bx.fillStyle = "#D9301C"; bx.fillText(w.txt, 0, 0);
    bx.restore();
  }
  bx.restore();
}
new IntersectionObserver(es => es.forEach(e => { bVisible = e.isIntersecting; if (e.isIntersecting && !B.hinted && !reduce) { B.hinted = true; setTimeout(slap, 500); } }), { threshold: 0.45 }).observe($("#bstage"));
requestAnimationFrame(bFrame);

/* ---------- steps cards ---------- */
const ICONS = [
  '<circle cx="42" cy="42" r="30" fill="#F2DDAE"/><circle cx="42" cy="42" r="30" fill="none" stroke="#C9852E" stroke-width="2" stroke-dasharray="3 5"/>',
  '<circle cx="42" cy="42" r="30" fill="#F2DDAE"/><ellipse cx="42" cy="42" rx="20" ry="16" fill="#fff8e6"/><circle cx="44" cy="41" r="8" fill="#F2A516"/>',
  '<circle cx="42" cy="42" r="30" fill="#F7D88A"/><g fill="#6FAE3F"><circle cx="30" cy="36" r="4"/><circle cx="50" cy="30" r="4"/><circle cx="52" cy="52" r="4"/><circle cx="34" cy="54" r="4"/></g><g fill="#1a1512"><circle cx="42" cy="44" r="1.8"/><circle cx="58" cy="40" r="1.8"/><circle cx="26" cy="46" r="1.8"/><circle cx="44" cy="24" r="1.8"/></g>',
  '<ellipse cx="42" cy="42" rx="12" ry="30" fill="#DDA457"/><path d="M14 22 a30 30 0 0 1 56 0" fill="none" stroke="#F2A516" stroke-width="3" stroke-linecap="round"/><path d="M66 16 l4 6 l-7 1" fill="none" stroke="#F2A516" stroke-width="3" stroke-linecap="round"/>',
  '<circle cx="42" cy="42" r="30" fill="#DDA457"/><path d="M22 30 L62 36 L22 46 L62 54" fill="none" stroke="#5C1C12" stroke-width="7" stroke-linecap="round" stroke-linejoin="round"/>',
  '<circle cx="42" cy="42" r="30" fill="#DDA457"/><rect x="24" y="30" width="36" height="24" rx="4" fill="#F0BE5C" stroke="#a5651f" stroke-width="1.5"/>',
  '<rect x="22" y="18" width="40" height="48" rx="8" fill="#DDA457"/><rect x="22" y="18" width="14" height="48" rx="6" fill="#c9852e"/><rect x="48" y="18" width="14" height="48" rx="6" fill="#b77322"/>'
];
$("#srow").innerHTML = STEPS.map((s, i) => `<div class="scard"><svg viewBox="0 0 84 84" aria-hidden="true">${ICONS[i]}</svg><span class="k">${String(i + 1).padStart(2, "0")}</span><span class="cn">${s.cn}</span><b>${tr(s.en, s.nl)}</b><p>${tr(s.den, s.dnl)}</p></div>`).join("");

/* ---------- everything below the hero needs GSAP ---------- */
function init() {
  gsap.registerPlugin(ScrollTrigger);
  let lenis = null;
  if (!reduce && window.Lenis && !mobile) { lenis = new Lenis({ lerp: 0.1 }); lenis.on("scroll", ScrollTrigger.update); gsap.ticker.add(t => lenis.raf(t * 1000)); gsap.ticker.lagSmoothing(0); }
  $$('a[href^="#"]').forEach(a => a.addEventListener("click", e => { const id = a.getAttribute("href"); const el = id === "#top" ? 0 : $(id); if (el === null) return; e.preventDefault(); lenis ? lenis.scrollTo(el, { duration: 1.6 }) : (el === 0 ? scrollTo({ top: 0, behavior: "smooth" }) : el.scrollIntoView({ behavior: "smooth" })); }));

  gsap.to("#griddle", { opacity: 0.3, ease: "none", scrollTrigger: { trigger: "#hero", start: "top top", end: "bottom top", scrub: true } });
  gsap.to(".hero-copy", { y: -80, opacity: 0, ease: "none", scrollTrigger: { trigger: "#hero", start: "35% top", end: "bottom top", scrub: true } });
  ScrollTrigger.create({ trigger: "#hero", start: "bottom 70px", onEnter: () => $("#nav").classList.add("solid"), onLeaveBack: () => $("#nav").classList.remove("solid") });

  $$(".reveal").forEach(el => gsap.to(el, { opacity: 1, y: 0, duration: 1.1, ease: "expo.out", scrollTrigger: { trigger: el, start: "top 90%" } }));
  ScrollTrigger.batch(".scard", { start: "top 90%", onEnter: b => gsap.to(b, { opacity: 1, y: 0, duration: 0.9, stagger: 0.08, ease: "expo.out", overwrite: true }) });
  ScrollTrigger.create({ trigger: "#hero", start: "bottom 80%", onEnter: () => $("#mbar").classList.add("show"), onLeaveBack: () => $("#mbar").classList.remove("show") });

  ScrollTrigger.create({ trigger: "#score", start: "top 85%", once: true, onEnter: () => {
    const o = { v: 0 }; gsap.to(o, { v: 4.5, duration: 2, ease: "expo.out", onUpdate: () => $("#score").textContent = o.v.toFixed(1) });
    $$("#stars i").forEach((s, i) => { s.style.setProperty("--dl", (0.15 * i) + "s"); s.style.setProperty("--f", i < 4 ? 1 : 0.5); });
  } });
  const q = $("#qrow"); q.innerHTML += q.innerHTML;
  const tk = $("#ticker"); tk.innerHTML += tk.innerHTML;

  if (matchMedia("(hover:hover)").matches) $$(".dish").forEach(c => {
    c.addEventListener("pointermove", e => { const r = c.getBoundingClientRect(); gsap.to(c, { rotationY: ((e.clientX - r.left) / r.width - 0.5) * 7, rotationX: -((e.clientY - r.top) / r.height - 0.5) * 7, transformPerspective: 900, duration: 0.4 }); });
    c.addEventListener("pointerleave", () => gsap.to(c, { rotationY: 0, rotationX: 0, duration: 0.6 }));
  });
  if (!mobile) gsap.to(".dish.big .art", { rotation: 40, ease: "none", scrollTrigger: { trigger: "#menu", start: "top bottom", end: "bottom top", scrub: true } });
  ScrollTrigger.refresh();
}
let started = false; const go = () => { if (!started && window.gsap && window.ScrollTrigger) { started = true; init(); } else if (!window.gsap) document.documentElement.classList.add("noanim"); };
addEventListener("DOMContentLoaded", go); addEventListener("load", go);
window.__cs = { get t() { return T; }, skip: () => $("#skip").click() };
})();
