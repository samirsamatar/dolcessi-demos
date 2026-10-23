/* Lanzhou Beef Noodles — concept site.
   Hero: one strand of dough is stretched and folded seven times (1 → 128 strands), then dropped into a bowl. */
(() => {
"use strict";
const $ = s => document.querySelector(s), $$ = s => [...document.querySelectorAll(s)];
const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
const mobile = matchMedia("(max-width: 900px)").matches;
const TZ = "Europe/Amsterdam";
const clamp = (a, b, v) => Math.max(a, Math.min(b, v));
const lerp = (a, b, t) => a + (b - a) * t;
const eOut = t => 1 - Math.pow(1 - t, 3);
const eInOut = t => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

/* ---------- language ---------- */
const LANG = (() => {
  const q = new URLSearchParams(location.search).get("lang");
  if (q === "nl" || q === "en") { try { localStorage.setItem("lz-lang", q); } catch (e) {} return q; }
  try { const s = localStorage.getItem("lz-lang"); if (s === "nl" || s === "en") return s; } catch (e) {}
  return /^nl\b/i.test(navigator.language || "") ? "nl" : "en";
})();
const NL = LANG === "nl";
const tr = (en, nl) => (NL ? nl : en);
document.documentElement.lang = LANG;
if (NL) $$("[data-nl]").forEach(el => { el.innerHTML = el.dataset.nl; });
$("#lang").querySelector(`[data-l="${LANG}"]`).outerHTML = `<b>${LANG.toUpperCase()}</b>`;
$("#lang").addEventListener("click", () => { const to = NL ? "en" : "nl"; try { localStorage.setItem("lz-lang", to); } catch (e) {} const u = new URL(location.href); u.searchParams.set("lang", to); location.href = u.toString(); });

/* ---------- opening hours (Mon closed, Tue–Sun 12:00–21:30) ---------- */
const DAYS_EN = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
const DAYS_NL = ["Maandag", "Dinsdag", "Woensdag", "Donderdag", "Vrijdag", "Zaterdag", "Zondag"];
const OPEN = [null, [12, 0, 21, 30], [12, 0, 21, 30], [12, 0, 21, 30], [12, 0, 21, 30], [12, 0, 21, 30], [12, 0, 21, 30]];
function amsNow() {
  const p = new Intl.DateTimeFormat("en-GB", { weekday: "short", hour: "2-digit", minute: "2-digit", hour12: false, timeZone: TZ }).formatToParts(new Date());
  const g = k => p.find(x => x.type === k).value;
  return { d: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].indexOf(g("weekday")), m: (+g("hour") % 24) * 60 + +g("minute") };
}
function status() {
  const { d, m } = amsNow(), o = OPEN[d];
  if (o && m >= o[0] * 60 + o[1] && m < o[2] * 60 + o[3]) return { open: true, text: tr("Open now · until 21:30", "Nu open · tot 21:30") };
  if (o && m < o[0] * 60) return { open: false, text: tr("Closed · opens today at 12:00", "Gesloten · vandaag open vanaf 12:00") };
  let nd = (d + 1) % 7; while (!OPEN[nd]) nd = (nd + 1) % 7;
  const name = (NL ? DAYS_NL : DAYS_EN)[nd];
  return { open: false, text: nd === (d + 1) % 7 ? tr("Closed · opens tomorrow at 12:00", "Gesloten · morgen open vanaf 12:00") : tr(`Closed · opens ${name} at 12:00`, `Gesloten · ${name.toLowerCase()} open vanaf 12:00`) };
}
function renderHours() {
  const { d } = amsNow(), ul = $("#hours"); ul.textContent = "";
  (NL ? DAYS_NL : DAYS_EN).forEach((name, i) => {
    const li = document.createElement("li"); if (i === d) li.className = "today";
    const a = document.createElement("span"); a.textContent = name;
    const b = document.createElement("span"); if (OPEN[i]) b.textContent = "12:00 – 21:30"; else { b.textContent = tr("Closed", "Gesloten"); b.className = "closed"; }
    li.append(a, b); ul.appendChild(li);
  });
  const s = status();
  $("#status-line").textContent = s.text;
  $("#nav-open").textContent = s.open ? tr("Open now", "Nu open") : tr("Closed", "Gesloten");
  $("#nav-dot").classList.toggle("off", !s.open);
}
renderHours(); setInterval(renderHours, 60000);

/* ---------- hero: the pull ---------- */
const cv = $("#pull"), ctx = cv.getContext("2d");
let W = 0, H = 0, DPR = 1;
function size() { DPR = Math.min(devicePixelRatio || 1, mobile ? 2 : 2); W = cv.clientWidth; H = cv.clientHeight; cv.width = W * DPR; cv.height = H * DPR; ctx.setTransform(DPR, 0, 0, DPR, 0, 0); }
size(); addEventListener("resize", size);

const FOLDS = 7, APPEAR = 0.8, HOLD = 0.45, DROP = 1.5;
const cyc = []; { let t = APPEAR; for (let k = 0; k < FOLDS; k++) { const d = 0.66 * Math.pow(0.87, k); cyc.push([t, d]); t += d; } }
const PULL_END = cyc[FOLDS - 1][0] + cyc[FOLDS - 1][1];
const DROP_START = PULL_END + HOLD, DONE = DROP_START + DROP;
let t0 = null, T = 0, skipped = reduce, revealed = false, lastCount = 1, heroVisible = true;

// flour dust, steam and toppings
const flour = []; for (let i = 0; i < (mobile ? 70 : 140); i++) flour.push({ x: Math.random(), y: Math.random(), r: Math.random() * 1.6 + 0.4, v: Math.random() * 0.012 + 0.004, a: Math.random() * 0.4 + 0.1 });
const bursts = [];
function burst(x, y) { for (let i = 0; i < 18; i++) { const a = Math.random() * Math.PI * 2, s = Math.random() * 90 + 30; bursts.push({ x, y, vx: Math.cos(a) * s, vy: Math.sin(a) * s - 40, life: 1, r: Math.random() * 2 + 0.8 }); } }
const steam = [];
const oil = []; for (let i = 0; i < 26; i++) { const a = Math.random() * Math.PI * 2, r = Math.sqrt(Math.random()) * 0.82; oil.push({ x: Math.cos(a) * r, y: Math.sin(a) * r, s: Math.random() * 0.07 + 0.025, ph: Math.random() * 6 }); }
const herbs = []; for (let i = 0; i < 22; i++) { const a = Math.random() * Math.PI * 2, r = Math.sqrt(Math.random()) * 0.75; herbs.push({ x: Math.cos(a) * r, y: Math.sin(a) * r, rot: Math.random() * 3, w: Math.random() * 0.05 + 0.03 }); }
const radish = []; for (let i = 0; i < 6; i++) { const a = Math.random() * Math.PI * 2, r = Math.sqrt(Math.random()) * 0.6; radish.push({ x: Math.cos(a) * r, y: Math.sin(a) * r, rot: Math.random() * 3 }); }
const beef = []; for (let i = 0; i < 5; i++) { const a = i / 5 * Math.PI * 2 + 0.4, r = 0.35 + Math.random() * 0.2; beef.push({ x: Math.cos(a) * r, y: Math.sin(a) * r, rot: Math.random() * 3 }); }

function layout() {
  const pull = { cx: W / 2, cy: mobile ? H * 0.34 : H * 0.47, sMin: Math.min(W, 900) * 0.07, sMax: Math.min(W * (mobile ? 0.44 : 0.36), 560) };
  const brx = mobile ? Math.min(W * 0.36, 170) : Math.min(W * 0.17, 270);
  const bowl = { x: mobile ? W / 2 : W * 0.71, y: mobile ? H * 0.27 : H * 0.5, rx: brx, ry: brx * 0.3 };
  return { pull, bowl };
}

function drawStrands(Lx, Ly, Rx, Ry, count, sag, wave, alpha) {
  const spread = Math.min(30, 4 + Math.log2(count) * 3.6);
  const w = Math.max(0.8, 20 / Math.sqrt(count));
  const N = 30;
  for (let pass = 0; pass < 2; pass++) {
    ctx.lineCap = "round"; ctx.lineJoin = "round";
    ctx.lineWidth = pass ? w * 0.38 : w;
    ctx.strokeStyle = pass ? `rgba(255,236,176,${alpha * 0.75})` : `rgba(214,160,64,${alpha})`;
    for (let j = 0; j < count; j++) {
      const f = count === 1 ? 0 : j / (count - 1) - 0.5, off = f * spread, sj = sag * (1 + 0.16 * Math.sin(j * 2.3)), ph = j * 0.7;
      ctx.beginPath();
      for (let i = 0; i <= N; i++) {
        const p = i / N, bell = 4 * p * (1 - p);
        const x = lerp(Lx, Rx, p);
        const y = lerp(Ly, Ry, p) + sj * bell + off * (0.3 + 0.7 * bell) + wave * Math.sin(p * Math.PI * 2.4 + T * 13 + ph) * bell - (pass ? w * 0.22 : 0);
        i ? ctx.lineTo(x, y) : ctx.moveTo(x, y);
      }
      ctx.stroke();
    }
  }
  // dough ends in the hands
  for (const [x, y] of [[Lx, Ly], [Rx, Ry]]) {
    const g = ctx.createRadialGradient(x, y, 0, x, y, 34); g.addColorStop(0, `rgba(255,230,170,${0.35 * alpha})`); g.addColorStop(1, "rgba(255,230,170,0)");
    ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y, 34, 0, 7); ctx.fill();
    ctx.fillStyle = `rgba(232,186,96,${alpha})`; ctx.beginPath(); ctx.ellipse(x, y + spread * 0.15, 9 + spread * 0.25, 7 + spread * 0.35, 0, 0, 7); ctx.fill();
  }
}

function drawBowl(b, a, fill, noodles) {
  if (a <= 0) return;
  const { x, y, rx, ry } = b, depth = rx * 0.92;
  ctx.save(); ctx.globalAlpha = a;
  // shadow
  const sh = ctx.createRadialGradient(x, y + depth + 10, 0, x, y + depth + 10, rx * 1.1); sh.addColorStop(0, "rgba(0,0,0,.55)"); sh.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = sh; ctx.beginPath(); ctx.ellipse(x, y + depth + 10, rx * 1.1, ry * 0.9, 0, 0, 7); ctx.fill();
  // inside of the bowl
  ctx.fillStyle = "#0e0a07"; ctx.beginPath(); ctx.ellipse(x, y, rx, ry, 0, 0, 7); ctx.fill();
  // broth
  if (fill > 0) {
    const by = y + ry * 0.18, brx2 = rx * 0.94, bry2 = ry * 0.82;
    ctx.save(); ctx.beginPath(); ctx.ellipse(x, y, rx * 0.985, ry * 0.97, 0, 0, 7); ctx.clip();
    const g = ctx.createRadialGradient(x - rx * 0.2, by - ry * 0.3, 0, x, by, rx);
    g.addColorStop(0, `rgba(242,214,150,${0.95 * fill})`); g.addColorStop(0.55, `rgba(196,140,58,${0.92 * fill})`); g.addColorStop(1, `rgba(110,62,22,${0.95 * fill})`);
    ctx.fillStyle = g; ctx.beginPath(); ctx.ellipse(x, by, brx2, bry2, 0, 0, 7); ctx.fill();
    // noodles under the surface
    if (noodles) noodles();
    // beef, radish, oil, herbs
    beef.forEach(o => { ctx.save(); ctx.translate(x + o.x * brx2, by + o.y * bry2); ctx.rotate(o.rot); ctx.fillStyle = `rgba(110,58,34,${fill})`; ctx.beginPath(); ctx.ellipse(0, 0, rx * 0.11, ry * 0.2, 0, 0, 7); ctx.fill(); ctx.restore(); });
    radish.forEach(o => { ctx.save(); ctx.translate(x + o.x * brx2, by + o.y * bry2); ctx.rotate(o.rot); ctx.fillStyle = `rgba(244,238,227,${0.9 * fill})`; ctx.beginPath(); ctx.ellipse(0, 0, rx * 0.07, ry * 0.16, 0, 0, Math.PI); ctx.fill(); ctx.restore(); });
    ctx.globalCompositeOperation = "screen";
    oil.forEach(o => { const s = o.s * rx * (1 + 0.15 * Math.sin(T * 2 + o.ph)); ctx.fillStyle = `rgba(215,48,31,${0.75 * fill})`; ctx.beginPath(); ctx.ellipse(x + o.x * brx2, by + o.y * bry2, s, s * ry / rx * 1.4, 0, 0, 7); ctx.fill(); });
    ctx.globalCompositeOperation = "source-over";
    herbs.forEach(o => { ctx.save(); ctx.translate(x + o.x * brx2, by + o.y * bry2); ctx.rotate(o.rot); ctx.fillStyle = `rgba(94,155,72,${fill})`; ctx.beginPath(); ctx.ellipse(0, 0, o.w * rx, o.w * rx * 0.45, 0, 0, 7); ctx.fill(); ctx.restore(); });
    // shine
    ctx.strokeStyle = `rgba(255,255,255,${0.12 * fill})`; ctx.lineWidth = 2; ctx.beginPath(); ctx.ellipse(x - rx * 0.1, by - ry * 0.12, rx * 0.6, ry * 0.42, 0, Math.PI * 1.1, Math.PI * 1.6); ctx.stroke();
    ctx.restore();
  } else if (noodles) { ctx.save(); ctx.beginPath(); ctx.ellipse(x, y, rx * 0.985, ry * 0.97, 0, 0, 7); ctx.clip(); noodles(); ctx.restore(); }
  // body of the bowl (front)
  ctx.beginPath(); ctx.moveTo(x - rx, y);
  ctx.bezierCurveTo(x - rx, y + depth * 0.75, x - rx * 0.5, y + depth, x, y + depth);
  ctx.bezierCurveTo(x + rx * 0.5, y + depth, x + rx, y + depth * 0.75, x + rx, y);
  ctx.ellipse(x, y, rx, ry, 0, 0, Math.PI, false);
  const bg = ctx.createLinearGradient(x - rx, 0, x + rx, 0); bg.addColorStop(0, "#1a130d"); bg.addColorStop(0.35, "#3a2b1f"); bg.addColorStop(0.6, "#2a1f16"); bg.addColorStop(1, "#120d09");
  ctx.fillStyle = bg; ctx.fill();
  // red band, like the rim of a noodle-house bowl
  ctx.strokeStyle = "rgba(215,48,31,.85)"; ctx.lineWidth = 2;
  ctx.beginPath(); ctx.ellipse(x, y + depth * 0.13, rx * 0.985, ry * 1.05, 0, 0.05, Math.PI - 0.05); ctx.stroke();
  ctx.strokeStyle = "rgba(215,48,31,.35)"; ctx.setLineDash([3, 7]);
  ctx.beginPath(); ctx.ellipse(x, y + depth * 0.2, rx * 0.95, ry * 1.08, 0, 0.12, Math.PI - 0.12); ctx.stroke(); ctx.setLineDash([]);
  // rim
  ctx.strokeStyle = "#8a6c4c"; ctx.lineWidth = 2.2; ctx.beginPath(); ctx.ellipse(x, y, rx, ry, 0, 0, 7); ctx.stroke();
  ctx.strokeStyle = "rgba(255,230,180,.25)"; ctx.lineWidth = 1; ctx.beginPath(); ctx.ellipse(x, y - 1.5, rx * 0.99, ry * 0.95, 0, Math.PI * 1.05, Math.PI * 1.95); ctx.stroke();
  ctx.restore();
}

function setStrands(n) { $("#strands").textContent = n; $("#strand-word").textContent = n === 1 ? tr("strand", "streng") : tr("strands", "strengen"); }

function frame(now) {
  requestAnimationFrame(frame);
  if (!heroVisible) return;
  if (t0 === null) t0 = now;
  T = (now - t0) / 1000;
  const t = skipped ? DONE + T : T;
  const { pull, bowl } = layout();
  ctx.clearRect(0, 0, W, H);

  // warm light
  const gl = ctx.createRadialGradient(W / 2, pull.cy, 0, W / 2, pull.cy, Math.max(W, H) * 0.6);
  gl.addColorStop(0, "rgba(120,70,25,.28)"); gl.addColorStop(1, "rgba(18,13,9,0)");
  ctx.fillStyle = gl; ctx.fillRect(0, 0, W, H);

  // flour in the air
  ctx.fillStyle = "#f4eee3";
  flour.forEach(f => { f.y -= f.v * 0.016; if (f.y < -0.02) f.y = 1.02; ctx.globalAlpha = f.a * (0.5 + 0.5 * Math.sin(T * 1.3 + f.x * 20)); ctx.beginPath(); ctx.arc(f.x * W + Math.sin(T * 0.4 + f.y * 9) * 8, f.y * H, f.r, 0, 7); ctx.fill(); });
  ctx.globalAlpha = 1;

  let count = 1, Lx, Ly, Rx, Ry, sag, wave = 0, alpha = 1, bowlA = 0, fill = 0;
  if (t < APPEAR) {
    const k = eOut(t / APPEAR); alpha = k;
    Lx = pull.cx - pull.sMin * k; Rx = pull.cx + pull.sMin * k; Ly = Ry = pull.cy; sag = 6;
  } else if (t < PULL_END) {
    let k = 0; while (k < FOLDS - 1 && t >= cyc[k + 1][0]) k++;
    const u = (t - cyc[k][0]) / cyc[k][1];
    count = Math.pow(2, k);
    let s, lift = 0;
    if (u < 0.62) {
      const v = u / 0.62;
      s = lerp(pull.sMin, pull.sMax, eOut(v)); lift = Math.sin(v * Math.PI) * H * 0.035;
      sag = H * 0.012 + (1 - eOut(v)) * H * 0.03; wave = Math.sin(v * Math.PI) * (mobile ? 10 : 16);
    } else {
      const v = (u - 0.62) / 0.38;
      s = lerp(pull.sMax, pull.sMin, eInOut(v)); sag = H * 0.03 + Math.sin(v * Math.PI) * H * 0.16;
      if (v > 0.5) count *= 2;
    }
    Lx = pull.cx - s; Rx = pull.cx + s; Ly = Ry = pull.cy - lift;
  } else if (t < DROP_START) {
    count = 128; const v = (t - PULL_END) / HOLD;
    Lx = pull.cx - pull.sMax; Rx = pull.cx + pull.sMax; Ly = Ry = pull.cy - Math.sin(v * Math.PI) * 6; sag = H * 0.02; wave = 4;
  } else {
    count = 128; const v = clamp(0, 1, (t - DROP_START) / DROP), e = eInOut(v);
    Lx = lerp(pull.cx - pull.sMax, bowl.x - bowl.rx * 0.78, e); Rx = lerp(pull.cx + pull.sMax, bowl.x + bowl.rx * 0.78, e);
    Ly = Ry = lerp(pull.cy, bowl.y - bowl.ry * 0.15, e);
    sag = lerp(H * 0.02, bowl.ry * 2.2, e); wave = 3 * (1 - e) + 1.5;
    bowlA = clamp(0, 1, v * 2.2); fill = clamp(0, 1, (v - 0.55) / 0.45);
    alpha = 1;
  }
  if (count !== lastCount) { if (count > lastCount && !skipped) { burst(Lx, Ly); burst(Rx, Ry); } lastCount = count; setStrands(count); }

  const inBowl = t >= DROP_START;
  if (inBowl) {
    const settle = clamp(0, 1, (t - DROP_START - DROP * 0.55) / (DROP * 0.45));
    drawBowl(bowl, bowlA, fill, () => drawStrands(Lx, Ly, Rx, Ry, settle > 0.99 ? 64 : 128, sag, wave, 0.95 * (1 - fill * 0.8)));
    // a few strands lifted out of the broth, still steaming
    if (fill > 0.6) {
      const lift = (fill - 0.6) / 0.4;
      ctx.save(); ctx.globalAlpha = lift;
      drawStrandsLifted(bowl, lift);
      ctx.restore();
    }
  } else {
    drawStrands(Lx, Ly, Rx, Ry, count, sag, wave, alpha);
  }

  // flour bursts
  for (let i = bursts.length - 1; i >= 0; i--) {
    const p = bursts[i]; p.life -= 0.016 * 1.4; if (p.life <= 0) { bursts.splice(i, 1); continue; }
    p.x += p.vx * 0.016; p.y += p.vy * 0.016; p.vy += 60 * 0.016;
    ctx.globalAlpha = p.life * 0.8; ctx.fillStyle = "#f4eee3"; ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, 7); ctx.fill();
  }
  ctx.globalAlpha = 1;

  // steam
  if (fill > 0.3) {
    if (steam.length < 34 && Math.random() < 0.35) steam.push({ x: bowl.x + (Math.random() - 0.5) * bowl.rx * 1.2, y: bowl.y, life: 0, sp: 18 + Math.random() * 22, w: 18 + Math.random() * 26, ph: Math.random() * 6 });
    for (let i = steam.length - 1; i >= 0; i--) {
      const s = steam[i]; s.life += 0.016 / 3.2; if (s.life >= 1) { steam.splice(i, 1); continue; }
      const yy = s.y - s.life * (mobile ? 130 : 220), xx = s.x + Math.sin(s.life * 5 + s.ph) * 18;
      const g = ctx.createRadialGradient(xx, yy, 0, xx, yy, s.w * (0.6 + s.life));
      g.addColorStop(0, `rgba(244,238,227,${0.12 * Math.sin(s.life * Math.PI) * fill})`); g.addColorStop(1, "rgba(244,238,227,0)");
      ctx.fillStyle = g; ctx.beginPath(); ctx.arc(xx, yy, s.w * (0.6 + s.life), 0, 7); ctx.fill();
    }
  }

  if (!revealed && t >= DROP_START + DROP * 0.6) reveal();
}

function drawStrandsLifted(b, k) {
  // chopstick-height loop of noodles rising from the bowl
  const top = b.y - b.rx * (mobile ? 0.6 : 0.75) * eOut(k);
  ctx.lineCap = "round";
  for (let j = 0; j < 9; j++) {
    const f = j / 8 - 0.5, x0 = b.x + b.rx * 0.18 + f * 16;
    ctx.strokeStyle = j % 2 ? "rgba(255,236,176,.85)" : "rgba(214,160,64,.95)"; ctx.lineWidth = 2.4;
    ctx.beginPath(); ctx.moveTo(x0 + f * 10, b.y + b.ry * 0.1);
    ctx.bezierCurveTo(x0 + f * 26 + Math.sin(T * 2 + j) * 3, b.y - b.ry, x0 + f * 8, top + 30, b.x + b.rx * 0.2 + f * 6, top);
    ctx.stroke();
  }
  // chopsticks
  ctx.strokeStyle = "#3b2a1c"; ctx.lineWidth = 7;
  ctx.beginPath(); ctx.moveTo(b.x + b.rx * 0.05, top + 6); ctx.lineTo(b.x + b.rx * 1.1, top - b.rx * 0.55); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(b.x + b.rx * 0.08, top - 4); ctx.lineTo(b.x + b.rx * 1.18, top - b.rx * 0.48); ctx.stroke();
  ctx.strokeStyle = "rgba(255,220,170,.25)"; ctx.lineWidth = 2;
  ctx.beginPath(); ctx.moveTo(b.x + b.rx * 0.07, top + 3); ctx.lineTo(b.x + b.rx * 1.1, top - b.rx * 0.56); ctx.stroke();
}

const io = new IntersectionObserver(es => es.forEach(e => { heroVisible = e.isIntersecting; }), { threshold: 0 });
io.observe($("#hero"));

/* split hero title into words */
const title = $("#hero-title");
(function wrap(node) { [...node.childNodes].forEach(n => { if (n.nodeType === 3) { const f = document.createDocumentFragment(); n.textContent.split(/(\s+)/).forEach(p => { if (!p) return; if (/^\s+$/.test(p)) { f.appendChild(document.createTextNode(" ")); return; } const w = document.createElement("span"); w.className = "w"; const i = document.createElement("span"); i.textContent = p; w.appendChild(i); f.appendChild(w); }); n.replaceWith(f); } else wrap(n); }); })(title);

function reveal() {
  revealed = true;
  if (!window.gsap) { $$(".hero-copy .eyebrow,.hero-sub,.hero-ctas,.hero-cn,.nav").forEach(e => e.style.opacity = 1); $$(".hero-title .w>span").forEach(s => s.style.transform = "none"); return; }
  gsap.to(".nav", { opacity: 1, duration: 1, ease: "power2.out" });
  gsap.to(".hero-copy .eyebrow", { opacity: 1, duration: 0.8 });
  gsap.to(".hero-title .w>span", { y: 0, yPercent: 0, duration: 1.2, ease: "expo.out", stagger: 0.07 });
  gsap.fromTo(".hero-sub", { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: 1, delay: 0.35, ease: "expo.out" });
  gsap.fromTo(".hero-ctas", { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: 1, delay: 0.5, ease: "expo.out" });
  gsap.fromTo(".hero-cn", { opacity: 0, letterSpacing: "0.6em" }, { opacity: 1, letterSpacing: "0.18em", duration: 1.6, delay: 0.2, ease: "expo.out" });
  $("#counter").animate([{ opacity: 1 }, { opacity: 0.55 }], { duration: 1200, fill: "forwards" });
}
$("#skip").addEventListener("click", () => { skipped = true; t0 = null; lastCount = 128; setStrands(128); if (!revealed) reveal(); });
requestAnimationFrame(frame);

/* ---------- everything below the hero needs GSAP ---------- */
function init() {
  gsap.registerPlugin(ScrollTrigger);
  let lenis = null;
  if (!reduce && window.Lenis && !mobile) { lenis = new Lenis({ lerp: 0.1 }); lenis.on("scroll", ScrollTrigger.update); gsap.ticker.add(t => lenis.raf(t * 1000)); gsap.ticker.lagSmoothing(0); }
  $$('a[href^="#"]').forEach(a => a.addEventListener("click", e => { const id = a.getAttribute("href"); const el = id === "#top" ? 0 : $(id); if (el === null) return; e.preventDefault(); lenis ? lenis.scrollTo(el, { duration: 1.6 }) : (el === 0 ? scrollTo({ top: 0, behavior: "smooth" }) : el.scrollIntoView({ behavior: "smooth" })); }));

  // hero fades as you leave it
  gsap.to("#pull", { opacity: 0.25, ease: "none", scrollTrigger: { trigger: "#hero", start: "top top", end: "bottom top", scrub: true } });
  gsap.to(".hero-copy", { y: -80, opacity: 0, ease: "none", scrollTrigger: { trigger: "#hero", start: "30% top", end: "bottom top", scrub: true } });

  // reveals
  $$(".reveal").forEach(el => gsap.to(el, { opacity: 1, y: 0, duration: 1.1, ease: "expo.out", scrollTrigger: { trigger: el, start: "top 88%" } }));

  // mobile action bar after the hero
  ScrollTrigger.create({ trigger: "#hero", start: "bottom 80%", onEnter: () => $("#mbar").classList.add("show"), onLeaveBack: () => $("#mbar").classList.remove("show") });

  /* five colours: build the toppings */
  const NS = "http://www.w3.org/2000/svg", mk = (tag, a, parent) => { const e = document.createElementNS(NS, tag); for (const k in a) e.setAttribute(k, a[k]); parent.appendChild(e); return e; };
  let sd = 5; const rnd = () => ((sd = (sd * 16807) % 2147483647) / 2147483647);
  const pos = (max) => { const a = rnd() * Math.PI * 2, r = Math.sqrt(rnd()) * max; return [Math.cos(a) * r, Math.sin(a) * r]; };
  const L2 = $("#L2"), L3 = $("#L3"), L4 = $("#L4"), L5 = $("#L5");
  for (let i = 0; i < 9; i++) { const [x, y] = pos(140); const g = mk("g", { transform: `translate(${x.toFixed(1)} ${y.toFixed(1)}) rotate(${(rnd() * 360).toFixed(0)})` }, L2); mk("path", { d: "M-26 0 A26 26 0 0 1 26 0 Z", fill: "#F4EEE3", "fill-opacity": ".92" }, g); mk("path", { d: "M-18 -2 A18 18 0 0 1 18 -2", stroke: "#d9cfbf", "stroke-width": "1.2", fill: "none" }, g); }
  for (let i = 0; i < 46; i++) { const [x, y] = pos(170); const r = 3 + rnd() * rnd() * 16; mk("circle", { cx: x.toFixed(1), cy: y.toFixed(1), r: r.toFixed(1), fill: "#D7301F", "fill-opacity": (0.55 + rnd() * 0.35).toFixed(2) }, L3); }
  for (let i = 0; i < 34; i++) { const [x, y] = pos(165); mk("ellipse", { cx: x.toFixed(1), cy: y.toFixed(1), rx: (5 + rnd() * 5).toFixed(1), ry: (2.4 + rnd() * 2).toFixed(1), fill: rnd() > 0.35 ? "#5E9B48" : "#8DBB5A", transform: `rotate(${(rnd() * 180).toFixed(0)} ${x.toFixed(1)} ${y.toFixed(1)})` }, L4); }
  for (let k = 0; k < 15; k++) {
    const R = 24 + k * 10.5, pts = [];
    for (let i = 0; i <= 64; i++) { const a = i / 64 * Math.PI * 2 + k * 0.4, w = Math.sin(a * 5 + k) * 5 + Math.sin(a * 3 - k) * 3; pts.push([(Math.cos(a) * (R + w)).toFixed(1), (Math.sin(a) * (R + w)).toFixed(1)]); }
    const d = "M" + pts.map(p => p.join(" ")).join(" L") + "Z";
    mk("path", { d, fill: "none", stroke: "#9d6e25", "stroke-width": "5", "stroke-opacity": ".55" }, L5);
    mk("path", { d, fill: "none", stroke: "#EBC46A", "stroke-width": "3.2", "stroke-linejoin": "round" }, L5);
  }
  const layers = ["#L1", "#L2", "#L3", "#L4", "#L5"], items = $$("#five-list li");
  const tl = gsap.timeline({ defaults: { ease: "power2.out" } });
  tl.fromTo("#L1", { opacity: 0, scale: 0.6, transformOrigin: "0px 0px" }, { opacity: 1, scale: 1, duration: 1 })
    .fromTo("#L2", { opacity: 0, y: -30 }, { opacity: 1, y: 0, duration: 1 })
    .fromTo("#L3", { opacity: 0, scale: 0.3, transformOrigin: "0px 0px" }, { opacity: 1, scale: 1, duration: 1 })
    .fromTo("#L4", { opacity: 0, rotation: -40, transformOrigin: "0px 0px" }, { opacity: 1, rotation: 0, duration: 1 })
    .fromTo("#L5", { opacity: 0, rotation: 120, scale: 0.5, transformOrigin: "0px 0px" }, { opacity: 1, rotation: 0, scale: 1, duration: 1 })
    .to({}, { duration: 0.4 });
  const stepOf = p => Math.min(4, Math.floor(p * 5.4));
  const markList = p => items.forEach((li, i) => li.classList.toggle("on", i <= stepOf(p) && p > 0.02));
  if (!mobile) ScrollTrigger.create({ trigger: ".five-pin", start: "top top", end: "+=220%", pin: true, scrub: 0.6, animation: tl, onUpdate: s => markList(s.progress) });
  else ScrollTrigger.create({ trigger: ".five-pin", start: "top 75%", end: "bottom 60%", scrub: 0.6, animation: tl, onUpdate: s => markList(s.progress) });

  /* widths */
  const WIDTHS = [
    { cn: "毛细", py: "Maoxi", en: "hair-thin", nl: "haardun", w: 1.4 },
    { cn: "细", py: "Xi", en: "thin", nl: "dun", w: 2.4 },
    { cn: "二细", py: "Erxi", en: "second-thin, the classic choice", nl: "tweede dun, de klassieke keuze", w: 3.6 },
    { cn: "三细", py: "Sanxi", en: "third-thin", nl: "derde dun", w: 5.2 },
    { cn: "韭叶", py: "Jiuye", en: "flat as a chive leaf", nl: "plat als een bieslookblad", w: 8.5 },
    { cn: "宽", py: "Kuan", en: "wide", nl: "breed", w: 14 },
    { cn: "大宽", py: "Dakuan", en: "extra wide, like a belt", nl: "extra breed, als een riem", w: 24 }
  ];
  const wsvg = $("#wsvg"), paths = [];
  for (let i = 0; i < 8; i++) { const under = mk("path", { fill: "none", stroke: "#9d6e25", "stroke-linecap": "round", "stroke-opacity": ".6" }, wsvg); const top = mk("path", { fill: "none", stroke: "#EBC46A", "stroke-linecap": "round" }, wsvg); paths.push([under, top]); }
  const cur = { w: 3.6 };
  let wVisible = false;
  new IntersectionObserver(es => es.forEach(e => wVisible = e.isIntersecting)).observe($("#wstage"));
  gsap.ticker.add(() => {
    if (!wVisible) return;
    const t = performance.now() / 1000, n = paths.length;
    paths.forEach(([u, p], i) => {
      const y0 = 196 + (i - (n - 1) / 2) * Math.max(10, cur.w * 1.15 + 8), pts = [];
      for (let k = 0; k <= 40; k++) { const x = -20 + k * 31; const y = y0 + Math.sin(k * 0.35 + t * 1.6 + i * 0.6) * 14 + Math.sin(k * 0.12 - t * 0.7 + i) * 10; pts.push(x.toFixed(1) + " " + y.toFixed(1)); }
      const d = "M" + pts.join(" L");
      u.setAttribute("d", d); p.setAttribute("d", d);
      u.setAttribute("stroke-width", (cur.w + 1.6).toFixed(2)); p.setAttribute("stroke-width", cur.w.toFixed(2));
      p.setAttribute("stroke-linecap", cur.w > 7 ? "butt" : "round"); u.setAttribute("stroke-linecap", cur.w > 7 ? "butt" : "round");
    });
  });
  const wb = $("#wbtns");
  WIDTHS.forEach((o, i) => {
    const b = document.createElement("button"); b.type = "button"; b.setAttribute("aria-pressed", String(i === 2));
    const c = document.createElement("span"); c.className = "cn"; c.textContent = o.cn;
    b.append(c, document.createTextNode(o.py));
    b.addEventListener("click", () => {
      $$("#wbtns button").forEach(x => x.setAttribute("aria-pressed", String(x === b)));
      gsap.to(cur, { w: o.w, duration: 0.9, ease: "elastic.out(1,0.5)" });
      $("#w-cn").textContent = o.cn; $("#w-desc").textContent = `${o.py} · ${NL ? o.nl : o.en}`;
      gsap.fromTo("#w-cn", { y: 14, opacity: 0 }, { y: 0, opacity: 1, duration: 0.5, ease: "expo.out" });
    });
    wb.appendChild(b);
  });
  $("#w-desc").textContent = `Erxi · ${NL ? WIDTHS[2].nl : WIDTHS[2].en}`;

  /* reviews */
  ScrollTrigger.create({ trigger: "#score", start: "top 85%", once: true, onEnter: () => {
    const o = { v: 0 }; gsap.to(o, { v: 4.7, duration: 2, ease: "expo.out", onUpdate: () => $("#score").textContent = o.v.toFixed(1) });
    $$("#stars i").forEach((s, i) => { s.style.setProperty("--dl", (0.15 * i) + "s"); s.style.setProperty("--f", i < 4 ? 1 : 0.7); });
  } });
  const q = $("#qrow"); q.innerHTML += q.innerHTML;

  /* menu cards tilt */
  if (matchMedia("(hover:hover)").matches) $$(".card").forEach(c => {
    c.addEventListener("pointermove", e => { const r = c.getBoundingClientRect(); gsap.to(c, { rotationY: ((e.clientX - r.left) / r.width - 0.5) * 8, rotationX: -((e.clientY - r.top) / r.height - 0.5) * 8, transformPerspective: 900, duration: 0.4 }); });
    c.addEventListener("pointerleave", () => gsap.to(c, { rotationY: 0, rotationX: 0, duration: 0.6 }));
  });
  ScrollTrigger.refresh();
}
let started = false; const go = () => { if (!started && window.gsap && window.ScrollTrigger) { started = true; init(); } };
addEventListener("DOMContentLoaded", go); addEventListener("load", go);
window.__lz = { get t() { return T; } };
})();
