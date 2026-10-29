/* Taigu 大愚 · concept site by Dolcessi */
const $ = (s, c = document) => c.querySelector(s), $$ = (s, c = document) => [...c.querySelectorAll(s)];
const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const lerp = (a, b, t) => a + (b - a) * t;
const ss = (a, b, v) => { const t = clamp((v - a) / (b - a)); return t * t * (3 - 2 * t); };
const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
const fine = matchMedia("(hover: hover) and (pointer: fine)").matches;
const TEST = /[?&]test/.test(location.search);
const TZ = "Europe/Amsterdam";

/* ---------- loader: an ensō draws itself; the number always moves ---------- */
const ldN = $("#ld-n");
let ensoSVG = "";
const ensoP = fetch("img/enso.svg").then(r => r.text()).then(t => { ensoSVG = t; $(".ld-enso").innerHTML = t; $(".ft-enso").innerHTML = t.replace('id="enso-m"', 'id="enso-f"').replace("url(#enso-m)", "url(#enso-f)"); }).catch(() => {});
let ldMile = 0, ldVal = 0, ldFinal = false, ldResolve; const ldT0 = performance.now();
const ldDone = new Promise(r => (ldResolve = r));
const ldTo = v => { if (v >= 100) ldFinal = true; else ldMile = Math.max(ldMile, v); };
(function ldLoop() {
  const t = (performance.now() - ldT0) / 1000, creep = 92 * (1 - Math.exp(-t / 2.4));
  const goal = ldFinal ? 100 : Math.min(94, Math.max(ldMile, creep));
  ldVal += Math.min((goal - ldVal) * (ldFinal ? .09 : .05), ldFinal ? 2.4 : 1.2);
  if (ldFinal && 100 - ldVal < .4) ldVal = 100;
  ldN.textContent = Math.floor(ldVal);
  const svg = $(".ld-enso svg"); if (svg) svg.style.setProperty("--p", (ldVal / 100 * .985).toFixed(4));
  if (ldVal >= 100) { ldResolve(); return; }
  requestAnimationFrame(ldLoop);
})();
gsap.to(".ld-k", { opacity: 1, duration: 1.4, delay: .3, ease: "power2.out" });

/* ---------- language ---------- */
const LANG = (() => {
  const q = new URLSearchParams(location.search).get("lang");
  if (q === "nl" || q === "en") { try { localStorage.setItem("tg-lang", q); } catch (e) {} return q; }
  try { const s = localStorage.getItem("tg-lang"); if (s === "nl" || s === "en") return s; } catch (e) {}
  return /^nl\b/i.test(navigator.language || "") ? "nl" : "en";
})();
const NL = LANG === "nl", tr = (en, nl) => (NL ? nl : en);
document.documentElement.lang = LANG;
if (NL) $$("[data-nl]").forEach(el => { el.innerHTML = el.dataset.nl; });
$("#lang").querySelector(`[data-l="${LANG}"]`).outerHTML = `<b>${LANG.toUpperCase()}</b>`;
$("#lang").addEventListener("click", () => { const to = NL ? "en" : "nl"; try { localStorage.setItem("tg-lang", to); } catch (e) {} const u = new URL(location.href); u.searchParams.set("lang", to); location.href = u.toString(); });

/* ---------- opening hours ---------- */
const DAYS = NL ? ["Maandag", "Dinsdag", "Woensdag", "Donderdag", "Vrijdag", "Zaterdag", "Zondag"] : ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
const HOUSES = { pijp: { name: "De Pijp", open: [null, null, null, [690, 1200], [690, 1200], [690, 1200], [690, 1140]] }, oost: { name: "Oost", open: Array(7).fill([720, 1200]) } };
const hm = m => `${String(Math.floor(m / 60)).padStart(2, "0")}:${String(m % 60).padStart(2, "0")}`;
function amsNow() {
  const p = new Intl.DateTimeFormat("en-GB", { weekday: "short", hour: "2-digit", minute: "2-digit", hour12: false, timeZone: TZ }).formatToParts(new Date());
  const g = k => p.find(x => x.type === k).value;
  return { d: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].indexOf(g("weekday")), m: (+g("hour") % 24) * 60 + +g("minute") };
}
function houseStatus(h) {
  const { d, m } = amsNow(), o = h.open[d];
  if (o && m >= o[0] && m < o[1]) return { open: true, text: tr(`Open now · until ${hm(o[1])}`, `Nu open · tot ${hm(o[1])}`) };
  if (o && m < o[0]) return { open: false, text: tr(`Closed · opens today at ${hm(o[0])}`, `Gesloten · vandaag open vanaf ${hm(o[0])}`) };
  let nd = (d + 1) % 7; while (!h.open[nd]) nd = (nd + 1) % 7;
  const when = nd === (d + 1) % 7 ? tr("tomorrow", "morgen") : (NL ? DAYS[nd].toLowerCase() : DAYS[nd]);
  return { open: false, text: tr(`Closed · opens ${when} at ${hm(h.open[nd][0])}`, `Gesloten · ${when} open vanaf ${hm(h.open[nd][0])}`) };
}
function renderHours() {
  const { d } = amsNow(); const open = [];
  $$(".house").forEach(card => {
    const h = HOUSES[card.dataset.house], s = houseStatus(h), ul = $(".hours", card);
    if (s.open) open.push(h.name);
    $(".status span", card).textContent = s.text; $(".status i", card).classList.toggle("off", !s.open);
    ul.textContent = "";
    DAYS.forEach((name, i) => {
      const li = document.createElement("li"); if (i === d) li.className = "today";
      const a = document.createElement("span"); a.textContent = name;
      const b = document.createElement("span"); const o = h.open[i];
      if (o) b.textContent = `${hm(o[0])} – ${hm(o[1])}`; else { b.textContent = tr("Closed", "Gesloten"); b.className = "closed"; }
      li.append(a, b); ul.appendChild(li);
    });
  });
  $("#nav-open").textContent = open.length ? tr("Open now · ", "Nu open · ") + open.join(" & ") : tr("Closed right now", "Nu gesloten");
  $("#nav-dot").classList.toggle("off", !open.length);
}
renderHours(); setInterval(renderHours, 60000);

/* ---------- drinks ---------- */
const DR = [
  { jp: "抹茶ラテ", en: ["Matcha", "latte."], nl: ["Matcha", "latte."], d: ["Stone-milled Uji matcha over cold milk. Strong enough to taste right through the milk.", "Met steen gemalen Uji-matcha over koude melk. Sterk genoeg om door de melk heen te proeven."], ph: "latte",
    tea: "#3F6A16", milk: "#F1EEE6", base: 0, baseCol: "#B3122C", mochi: 0, bg: "#070806", glow: "#1B2A10", c: "#9CC24F", dye: [.05, .1, .016] },
  { jp: "苺抹茶", en: ["Strawberry", "matcha."], nl: ["Aardbei", "matcha."], d: ["Strawberry purée at the bottom, matcha on top. Stir it, or don't.", "Aardbeienpuree onderin, matcha erbovenop. Roeren mag, hoeft niet."], ph: "strawberry",
    tea: "#3F6A16", milk: "#F3ECEA", base: .42, baseCol: "#B3122C", mochi: 0, bg: "#0B0506", glow: "#3A0E18", c: "#F0607A", dye: [.14, .016, .04] },
  { jp: "白玉抹茶", en: ["Matcha with", "shiratama."], nl: ["Matcha met", "shiratama."], d: ["Soft white mochi dango on top. A regular favourite in the reviews.", "Zachte witte mochi-balletjes erbij. Een vaste favoriet in de reviews."], ph: "dango",
    tea: "#3F6A16", milk: "#F1EEE6", base: 0, baseCol: "#B3122C", mochi: 1, bg: "#090908", glow: "#2C2C27", c: "#E9E4D6", dye: [.07, .07, .065] },
  { jp: "ほうじ茶", en: ["Hojicha", "latte."], nl: ["Hojicha", "latte."], d: ["Roasted green tea: toasty, mellow, and naturally lower in caffeine.", "Geroosterde groene thee: toastig, zacht, van nature minder cafeïne."], ph: "hojicha",
    tea: "#74451F", milk: "#EFE6DA", base: 0, baseCol: "#B3122C", mochi: 0, bg: "#0A0705", glow: "#33200F", c: "#D9A06E", dye: [.11, .055, .02] },
  { jp: "小豆抹茶", en: ["Matcha with", "red bean."], nl: ["Matcha met", "rode boon."], d: ["Sweet azuki at the bottom, deep matcha above.", "Zoete azuki onderin, diepe matcha erboven."], ph: "azuki",
    tea: "#3F6A16", milk: "#F0ECE6", base: .36, baseCol: "#4E1A17", mochi: 0, bg: "#0A0606", glow: "#2E1311", c: "#C98A7E", dye: [.1, .022, .02] }
];
const P = k => `img/p/${k}.jpg`;
$("#dr-list").innerHTML = DR.map((d, i) => {
  const t = NL ? d.nl : d.en;
  return `<article class="dr" style="--c:${d.c}" aria-hidden="${i ? "true" : "false"}">
    <p class="dr-tate" aria-hidden="true">${[...d.jp].map(c => `<span>${c}</span>`).join("")}</p>
    <div class="dr-txt"><h2>${t[0].split(" ").map(w => `<span class="w"><span>${w}</span></span>`).join(" ")}<br><em>${t[1].split(" ").map(w => `<span class="w"><span>${w}</span></span>`).join(" ")}</em></h2><p>${NL ? d.d[1] : d.d[0]}</p></div>
    <figure class="dr-ph" style="margin:0"><img src="${P(d.ph)}" alt="" loading="lazy"></figure>
  </article>`;
}).join("");
const drEls = $$(".dr"), drDots = $$(".dr-dots i");

/* ---------- menu: photo peek follows the cursor ---------- */
if (fine) {
  const peek = $("#peek"), [imA, imB] = $$("img", peek); let front = imA, px = 0, py = 0, tx = 0, ty = 0, on = false;
  $$(".mn-col li").forEach(li => {
    li.addEventListener("pointerenter", () => {
      const src = P(li.dataset.ph); const back = front === imA ? imB : imA;
      if (!front.src.endsWith(src)) { back.src = src; back.style.zIndex = 2; front.style.zIndex = 1; back.classList.remove("out"); gsap.fromTo(back, { clipPath: "inset(100% 0 0 0)" }, { clipPath: "inset(0% 0 0 0)", duration: .7, ease: "expo.out" }); front = back; }
      peek.classList.add("on"); on = true;
    });
    li.addEventListener("pointerleave", () => { peek.classList.remove("on"); on = false; });
  });
  addEventListener("pointermove", e => { tx = e.clientX + 30; ty = e.clientY; }, { passive: true });
  gsap.ticker.add(() => { if (!on && !peek.classList.contains("on")) return; px += (tx - px) * .12; py += (ty - py) * .12; peek.style.left = px + "px"; peek.style.top = py + "px"; });
}

/* ---------- voices ---------- */
const quotes = $$("#vc blockquote");
quotes.forEach(q => { const p = $("p", q); p.innerHTML = p.textContent.split(" ").map(w => `<span class="w"><span>${w}</span></span>`).join(" "); });
$("#vc-bars").innerHTML = quotes.map((_, i) => `<button type="button" aria-label="Review ${i + 1}"><i></i></button>`).join("");
const vcBars = $$("#vc-bars button");
let vcI = -1, vcTl = null;
function showQuote(i) {
  if (i === vcI) return;
  const prev = quotes[vcI]; vcI = i;
  if (prev) gsap.to($$(".w > span", prev), { yPercent: -110, duration: .6, stagger: .015, ease: "expo.in", onComplete: () => gsap.set(prev, { visibility: "hidden" }) });
  const q = quotes[i]; gsap.set(q, { visibility: "visible" });
  gsap.fromTo($$(".w > span", q), { yPercent: 110 }, { yPercent: 0, duration: 1.1, stagger: .025, delay: prev ? .45 : 0, ease: "expo.out" });
  gsap.fromTo($("cite", q), { autoAlpha: 0, y: 10 }, { autoAlpha: 1, y: 0, duration: .8, delay: prev ? .8 : .3 });
  vcBars.forEach((b, n) => gsap.set($("i", b), { scaleX: n < i ? 1 : 0 }));
  if (vcTl) vcTl.kill();
  vcTl = gsap.fromTo($("i", vcBars[i]), { scaleX: 0 }, { scaleX: 1, duration: 6, ease: "none", onComplete: () => showQuote((i + 1) % quotes.length) });
  vcTl.pause(); if (vcLive) vcTl.play();
}
let vcLive = false;
vcBars.forEach((b, i) => b.addEventListener("click", () => showQuote(i)));

/* ---------- world ---------- */
const MOB = () => innerWidth < 900;
const LOW = MOB() || (navigator.hardwareConcurrency || 8) <= 4;
await Promise.all([document.fonts.load('400 100px "Instrument Serif"'), document.fonts.load('400 40px "Taigu JP"'), ensoP]).catch(() => {});
ldTo(30);
const { createWorld } = await import("./world.js?v=5");
ldTo(58);
const canvas = $("#world");
const world = await createWorld(canvas, { maxDpr: LOW ? 1.25 : 1.6, low: LOW, keep: TEST, logoUrl: "img/logo.svg", wordUrl: "img/word.svg" });
const st = world.st;
ldTo(84);
addEventListener("resize", () => { world.resize(); ScrollTrigger.refresh(); });

const hex = c => { const n = parseInt(c.slice(1), 16); return [(n >> 16) & 255, (n >> 8) & 255, n & 255]; };
const mixHex = (a, b, t) => { const A = hex(a), B = hex(b); return "#" + A.map((v, i) => Math.round(lerp(v, B[i], clamp(t))).toString(16).padStart(2, "0")).join(""); };
const mix3 = (a, b, t) => a.map((v, i) => lerp(v, b[i], t));

const prog = { hero: 0, dr: 0, wh: 0 };
const root = document.documentElement;
let lastDr = -2, dye = DR[0].dye.slice(), drNow = 0;

/* pointer: stirs the ink, whisks the bowl */
const ptr = { x: .5, y: .5, px: .5, py: .5, cx: 0, cy: 0, moved: 0, inside: false, t: 0 };
function onPtr(cx, cy) {
  ptr.cx = cx; ptr.cy = cy; ptr.x = cx / innerWidth; ptr.y = 1 - cy / innerHeight; ptr.moved = performance.now();
}
addEventListener("pointermove", e => onPtr(e.clientX, e.clientY), { passive: true });
addEventListener("touchmove", e => { const t = e.touches[0]; if (t) onPtr(t.clientX, t.clientY); }, { passive: true });
addEventListener("touchstart", e => { const t = e.touches[0]; if (t) { onPtr(t.clientX, t.clientY); ptr.px = ptr.x; ptr.py = ptr.y; } }, { passive: true });

let tPrev = performance.now(), wander = 0, foamEnergy = 0, chX = 0, chZ = 0, chPX = 0, chPZ = 0, plumeT = 0, lastScrollY = scrollY;
function inkFrame(now, dt) {
  const fl = world.fluid, m = MOB();
  // the cursor drags ink through the backdrop
  const dx = ptr.x - ptr.px, dy = ptr.y - ptr.py, idle = now - ptr.moved > 1600;
  if (st.ink > .05 && (Math.abs(dx) + Math.abs(dy) > .0004) && !idle) {
    const sp = Math.min(1, Math.hypot(dx, dy) * 30);
    fl.splat(ptr.x, ptr.y, dx * fl.opt.force, dy * fl.opt.force, dye.map(c => c * (.3 + sp * .7)));
  }
  ptr.px = ptr.x; ptr.py = ptr.y;
  // ink plumes rise from behind the cup (more while pouring, and on every drink change)
  plumeT -= dt;
  const pouring = st.pour > .3, inDrinks = prog.dr > 0 && prog.dr < 1;
  if (st.ink > .05 && plumeT <= 0 && (pouring || inDrinks || idle)) {
    plumeT = pouring ? .06 : inDrinks ? .12 : .2;
    const c = world.cupUV(pouring ? 2.2 : 1.2);
    wander += .37;
    const ox = Math.sin(wander * 1.7) * (m ? .1 : .06), up = (pouring ? 520 : 300) + Math.random() * 200;
    fl.splat(clamp(c.u + ox), clamp(c.v + .02), Math.sin(wander) * 140, up, dye.map(x => x * (pouring ? .38 : .26)), m ? .26 : .2);
  }
  // scrolling stirs it upward a little
  const sdy = scrollY - lastScrollY; lastScrollY = scrollY;
  if (st.ink > .05 && Math.abs(sdy) > 2 && Math.random() < .35) fl.splat(Math.random(), .02, (Math.random() - .5) * 200, Math.min(900, Math.abs(sdy) * 30), [0, 0, 0], .5);

  // whisk: the chasen follows the pointer over the bowl, or whisks by itself
  if (st.whisk > .3) {
    const hit = (now - ptr.moved < 900) ? world.bowlHit(ptr.cx, ptr.cy) : null;
    let tx, tz, auto = !hit;
    if (hit) { const r = Math.hypot(hit.x, hit.z), k = r > 1.05 ? 1.05 / r : 1; tx = hit.x * k; tz = hit.z * k; }
    else { const sp = st.whiskSpeed; tx = Math.sin(now / 1000 * 13) * .62 * sp; tz = Math.sin(now / 1000 * 3.1) * .3 * sp; }
    chX += (tx - chX) * (auto ? .5 : .35); chZ += (tz - chZ) * (auto ? .5 : .35);
    const vx = (chX - chPX) / Math.max(dt, .001), vz = (chZ - chPZ) / Math.max(dt, .001); chPX = chX; chPZ = chZ;
    const speed = Math.hypot(vx, vz);
    if (st.chLift < .5 && speed > .2) {
      const u = chX / 3 + .5, v = -chZ / 3 + .5;
      world.bowlFluid.splat(u, v, vx * 140, -vz * 140, [Math.min(.5, speed * .05), 0, 0], .9);
      if (!auto) foamEnergy = Math.min(1, foamEnergy + Math.min(speed, 12) * dt * .028);
    }
    st.chX = chX; st.chZ = chZ;
  }
}

function choreograph() {
  const m = MOB(), h = prog.hero, f = prog.dr, w = prog.wh;
  // --- 一 the pour
  const pourT = ss(.04, .8, h);
  st.fill = lerp(1.25, 2.55, pourT); st.mix = ss(.06, .9, h);
  st.pour = h < .84 ? ss(0, .04, h) : 1 - ss(.84, .94, h);
  st.ice = 1;
  let x = m ? 0 : .55, y = m ? -.2 : -.38, s = m ? 1.0 : 1.14, tilt = -.13, rotY = Math.sin(performance.now() / 4000) * .15;
  const word = 1 - ss(0, .08, f);
  // --- 二 drinks: the cup moves aside, morphs per drink, the ink takes the drink's colour
  const e = ss(0, .1, f);
  x = lerp(x, m ? 0 : 1.15, e); y = lerp(y, m ? .3 : -.36, e); s = lerp(s, m ? .74 : 1.12, e); tilt = lerp(tilt, 0, e);
  const fi = clamp(f * 5.2 - .3, 0, 4.999), i = Math.floor(fi), t = fi - i, k = ss(.6, .96, t), j = Math.min(4, i + 1);
  const A = DR[i], B = DR[j];
  st.tea = mixHex(A.tea, B.tea, k); st.milk = mixHex(A.milk, B.milk, k); st.baseCol = mixHex(A.baseCol, B.baseCol, k);
  st.base = lerp(A.base, B.base, k); st.mochi = lerp(A.mochi, B.mochi, k);
  rotY = lerp(rotY, (i + k) * Math.PI * 2, e);
  const bgA = mixHex(A.bg, B.bg, k);
  st.bg = mixHex("#070707", bgA, e); st.glow = mixHex("#2a2927", mixHex(A.glow, B.glow, k), e);
  const tdye = f > .02 ? mix3(A.dye, B.dye, k) : DR[0].dye; dye = mix3(dye, tdye, .08);
  const cur = f < .03 ? -1 : (t > .8 && i < 4 ? j : i);
  if (cur !== lastDr) {
    lastDr = cur;
    drEls.forEach((el, n) => {
      const on = n === cur; el.setAttribute("aria-hidden", on ? "false" : "true");
      gsap.killTweensOf([el, ...$$(".w > span, .dr-tate span, .dr-txt p, .dr-ph", el)]);
      if (on) {
        gsap.set(el, { autoAlpha: 1 });
        gsap.fromTo($$(".w > span", el), { yPercent: 115 }, { yPercent: 0, duration: 1.1, stagger: .06, ease: "expo.out" });
        gsap.fromTo($$(".dr-tate span", el), { autoAlpha: 0, y: -30 }, { autoAlpha: 1, y: 0, duration: 1.2, stagger: .08, ease: "expo.out" });
        gsap.fromTo($(".dr-txt p", el), { autoAlpha: 0, y: 16 }, { autoAlpha: 1, y: 0, duration: 1, delay: .2, ease: "expo.out" });
        gsap.fromTo($(".dr-ph", el), { clipPath: "inset(100% 0 0 0)" }, { clipPath: "inset(0% 0 0 0)", duration: 1.2, delay: .25, ease: "expo.out" });
      } else gsap.to(el, { autoAlpha: 0, duration: .35 });
    });
    drDots.forEach((d, n) => d.classList.toggle("on", n === cur));
    $("#dr-i").textContent = String(Math.max(cur, 0) + 1).padStart(2, "0");
    if (cur >= 0) {
      root.style.setProperty("--accent", DR[cur].c); drNow = cur;
      // a bloom of the new colour behind the cup
      const c = world.cupUV(1.6);
      for (let n = 0; n < 5; n++) world.fluid.splat(clamp(c.u + (n - 2) * .035), c.v, (n - 2) * 160, 520 + Math.random() * 300, DR[cur].dye.map(x => x * .8), m ? .3 : .22);
    } else root.style.setProperty("--accent", "#9CC24F");
  }
  // --- 三 whisk: the cup lifts away, the bowl rises in, camera looks down
  const out = ss(0, .14, w);
  y = lerp(y, 6.5, out); st.cupVis = 1 - ss(.1, .14, w);
  st.whisk = ss(.05, .2, w);
  const autoW = ss(.24, .34, w) * (1 - ss(.9, .98, w));
  st.whiskSpeed = autoW;
  st.chLift = 1 - ss(.16, .26, w) + ss(.92, .99, w);
  const autoFoam = ss(.26, .92, w) * (fine ? .85 : 1);
  st.foam = Math.max(autoFoam, foamEnergy) * ss(.16, .26, w);
  st.whiskX = m ? 0 : .85; st.whiskS = m ? .6 : .78; st.bowlTilt = lerp(.38, 0, ss(.05, .25, w));
  if (w > 0) {
    st.bg = mixHex(st.bg, "#070707", ss(0, .12, w)); st.glow = mixHex(st.glow, "#1d2a12", ss(0, .2, w));
    dye = mix3(dye, [.06, .12, .02], ss(0, .1, w) * .1);
  }
  st.ink = 1 - ss(.05, .25, w) * .75;
  st.cupX = x; st.cupY = y; st.scale = s; st.tilt = tilt; st.rotY = rotY; st.word = word; st.tiltX = .3 * e * (1 - out); st.wordS = m ? .62 : 1;
  const wv = ss(.04, .26, w);
  st.camX = 0;
  st.camY = lerp(lerp(2.1, 2.9, e * (1 - out)), m ? 9.2 : 8.6, wv);
  st.camZ = lerp(12.5, m ? 7.2 : 6.6, wv);
  st.lookY = lerp(1.5 + (st.camY - 2.1) * .25, m ? .3 : .6, wv);
  // HUD
  $("#pour-pct").textContent = Math.round(st.mix * 100);
  const fp = Math.round(st.foam * 100);
  $("#foam-pct").textContent = fp + "%"; $("#foam-fill").style.transform = `scaleX(${st.foam})`;
  $("#foam-done").classList.toggle("on", st.foam > .985);
}

/* ---------- motion ---------- */
gsap.registerPlugin(ScrollTrigger);
let lenis = null;
if (!reduce && !TEST && window.Lenis) {
  lenis = new Lenis({ lerp: .085, smoothWheel: true });
  lenis.on("scroll", ScrollTrigger.update);
  gsap.ticker.add(tm => lenis.raf(tm * 1000)); gsap.ticker.lagSmoothing(0);
  lenis.stop();
}
$$('a[href^="#"]').forEach(a => a.addEventListener("click", ev => {
  const id = a.getAttribute("href"); if (id.length < 2 || !$(id)) return; ev.preventDefault();
  const tgt = id === "#top" ? 0 : id === "#drinks" ? $("#drinks").offsetTop + innerHeight * .7 : id === "#whisk" ? $("#whisk").offsetTop + innerHeight * 1.2 : id;
  if (lenis) lenis.scrollTo(tgt, { duration: 2.2 }); else scrollTo({ top: typeof tgt === "number" ? tgt : $(id).offsetTop, behavior: reduce ? "auto" : "smooth" });
}));
const track = (sel, key) => ScrollTrigger.create({ trigger: sel, start: "top top", end: "bottom bottom", onUpdate: s => { prog[key] = s.progress; } });
track("#hero", "hero"); track("#drinks", "dr"); track("#whisk", "wh");

// the 3D stage runs only while its chapters are on screen
let live = true;
ScrollTrigger.create({ trigger: "#origin", start: "top top", onEnter: () => { live = false; canvas.style.visibility = "hidden"; }, onLeaveBack: () => { live = true; canvas.style.visibility = "visible"; } });
let idleN = 0, lastSY = -1;
function tick(fixed) {
  const now = performance.now(); let dt = Math.min(.05, (now - tPrev) / 1000); tPrev = now; if (fixed) dt = fixed;
  inkFrame(now, dt); choreograph(); world.frame(fixed);
}
window.__step = (n = 3) => { for (let i = 0; i < n; i++) tick(TEST ? 1 / 60 : 0); };
if (TEST) gsap.ticker.lagSmoothing(0);
gsap.ticker.add(() => {
  if (!live || TEST) return;
  const y = scrollY; if (y !== lastSY) { lastSY = y; idleN = 0; } else idleN++;
  if (LOW && idleN > 30 && performance.now() - ptr.moved > 1500 && (idleN & 1)) return;   // phones: half rate when nothing moves
  tick();
});

// chapter text in the pinned scenes
gsap.to([".hero-h", ".hero-hint", ".hero-tate", ".hero-kick"], { autoAlpha: 0, y: -24, ease: "none", scrollTrigger: { trigger: "#hero", start: "84% bottom", end: "bottom bottom", scrub: true } });
gsap.set(drEls, { autoAlpha: 0 });
gsap.fromTo([".dr-head", ".dr-note", ".dr-dots"], { autoAlpha: 0 }, { autoAlpha: 1, ease: "none", scrollTrigger: { trigger: "#drinks", start: "top top", end: "5% top", scrub: true } });
gsap.to(".sc-drinks .pin", { autoAlpha: 0, ease: "none", scrollTrigger: { trigger: "#drinks", start: "bottom 108%", end: "bottom bottom", scrub: true } });
gsap.fromTo(".wh-text, .wh-meter", { autoAlpha: 0, y: 40 }, { autoAlpha: 1, y: 0, ease: "none", scrollTrigger: { trigger: "#whisk", start: "12% top", end: "22% top", scrub: true } });

// 四 origin: the field opens up, then the mill wipes in
{
  const mill = $("#mill"); let millLoaded = false;
  const loadMill = () => { if (millLoaded) return; millLoaded = true; const s = $("source", mill); s.src = MOB() ? s.dataset.srcSm : s.dataset.src; mill.load(); };
  const tl = gsap.timeline({ scrollTrigger: { trigger: "#origin", start: "top top", end: "bottom bottom", scrub: true, onEnter: loadMill,
    onUpdate: s => { const vis = s.progress > .4 && s.progress < 1; if (vis && mill.paused) mill.play().catch(() => {}); else if (!vis && !mill.paused) mill.pause(); } } });
  tl.fromTo(".or-field", { clipPath: MOB() ? "inset(20% 12% 34% 12% round 10px)" : "inset(16% 30% 16% 30% round 10px)" }, { clipPath: "inset(0% 0% 0% 0% round 0px)", duration: .25, ease: "none" }, 0)
    .fromTo(".or-field img", { scale: 1.25 }, { scale: 1.05, duration: .5, ease: "none" }, 0)
    .fromTo(".or-t1", { autoAlpha: 0, y: 40 }, { autoAlpha: 1, y: 0, duration: .1, ease: "none" }, .14)
    .to(".or-t1", { autoAlpha: 0, y: -40, duration: .08, ease: "none" }, .42)
    .fromTo(".or-video", { clipPath: "inset(100% 0% 0% 0%)" }, { clipPath: "inset(0% 0% 0% 0%)", duration: .14, ease: "none" }, .44)
    .fromTo(".or-video video", { scale: 1.2 }, { scale: 1, duration: .4, ease: "none" }, .44)
    .fromTo(".or-t2", { autoAlpha: 0, y: 40 }, { autoAlpha: 1, y: 0, duration: .1, ease: "none" }, .58)
    .fromTo(".or-facts", { autoAlpha: 0, y: 20 }, { autoAlpha: 1, y: 0, duration: .1, ease: "none" }, .7)
    .to({}, { duration: .1 }, .9);
  ScrollTrigger.create({ trigger: "#origin", start: "top 120%", onEnter: loadMill });
}

// 五 the name: the kanji is painted in, top to bottom
gsap.fromTo(".nm-kanji img", { clipPath: "inset(0 0 100% 0)" }, { clipPath: "inset(0 0 0% 0)", ease: "none", scrollTrigger: { trigger: ".sc-name", start: "top 70%", end: "top 5%", scrub: true } });
gsap.fromTo(".nm-bg", { yPercent: -8 }, { yPercent: 8, ease: "none", scrollTrigger: { trigger: ".sc-name", start: "top bottom", end: "bottom top", scrub: true } });
gsap.from(".nm-verse .tate", { clipPath: "inset(0 0 100% 0)", duration: 2.2, ease: "power2.out", scrollTrigger: { trigger: ".nm-verse", start: "top 82%" } });
gsap.from(".nm-tr", { autoAlpha: 0, y: 20, duration: 1.4, delay: .5, ease: "expo.out", scrollTrigger: { trigger: ".nm-verse", start: "top 82%" } });

// headings: masked line reveals
$$(".sc-name h2, .sc-menu h2, .sc-visit h2, .wh-text h2, .or-t h2").forEach(h => {
  h.innerHTML = h.innerHTML.split(/<br\s*\/?>/i).map(l => `<span class="reveal-line"><span>${l}</span></span>`).join("");
  if (h.closest(".pin, .or-pin")) return;
  gsap.from($$(".reveal-line > span", h), { yPercent: 115, duration: 1.3, stagger: .1, ease: "expo.out", scrollTrigger: { trigger: h, start: "top 86%" } });
});
$$(".sc-menu .eyebrow, .mn-sub, .sc-visit .eyebrow, .sc-name .eyebrow, .nm-copy > p:not(.eyebrow), .nm-stats span").forEach(el => gsap.from(el, { y: 24, autoAlpha: 0, duration: 1.2, ease: "expo.out", scrollTrigger: { trigger: el, start: "top 92%" } }));
$$(".mn-col li").forEach((li, n) => gsap.from(li, { y: 30, autoAlpha: 0, duration: 1.1, ease: "expo.out", scrollTrigger: { trigger: li, start: "top 94%" } }));
$$(".house").forEach((c, i) => {
  gsap.from(c, { y: 70, autoAlpha: 0, duration: 1.3, delay: i * .1, ease: "expo.out", scrollTrigger: { trigger: ".houses", start: "top 85%" } });
  gsap.fromTo($(".h-img img", c), { yPercent: -10 }, { yPercent: 0, ease: "none", scrollTrigger: { trigger: c, start: "top bottom", end: "bottom top", scrub: true } });
});
ScrollTrigger.create({ trigger: ".sc-voices", start: "top 70%", end: "bottom 20%", onToggle: s => { vcLive = s.isActive; if (vcI < 0 && s.isActive) showQuote(0); else if (vcTl) s.isActive ? vcTl.play() : vcTl.pause(); } });
// footer: the ensō paints itself closed
ScrollTrigger.create({ trigger: ".foot", start: "top 85%", end: "bottom bottom", scrub: true, onUpdate: s => { const svg = $(".ft-enso svg"); if (svg) svg.style.setProperty("--p", (ss(0, .85, s.progress) * .985).toFixed(4)); } });

// mood river: rows drift, and lean into fast scrolling
{
  const rows = $$(".rv-row"); rows.forEach(r => { r.innerHTML += r.innerHTML; });
  let skew = 0, off = 0;
  const vel = ScrollTrigger.create({ trigger: ".sc-river", start: "top bottom", end: "bottom top" });
  gsap.ticker.add(() => {
    if (!vel.isActive) return;
    const v = clamp(vel.getVelocity() / 3000, -1, 1); skew += (v * 6 - skew) * .1; off += .35 + Math.abs(v) * 6;
    rows.forEach(r => { const d = +r.dataset.dir, w = r.scrollWidth / 2; let x = (off * d) % w; if (d > 0) x -= w; r.style.transform = `translate3d(${x}px,0,0) skewX(${skew * d}deg)`; });
  });
}

// chapter index + phone bar
const chapA = $$(".chap a");
[["#hero", 0], ["#drinks", 1], ["#whisk", 2], ["#origin", 3], ["#name", 4], ["#menu", 5], ["#visit", 6]].forEach(([sel, n]) =>
  ScrollTrigger.create({ trigger: sel, start: "top 50%", end: "bottom 50%", onToggle: s => { if (s.isActive) chapA.forEach((a, k) => a.classList.toggle("on", k === n)); } }));
ScrollTrigger.create({ trigger: "#drinks", start: "top 60%", end: "max", onToggle: s => $(".mbar").classList.toggle("on", s.isActive) });

/* ---------- cursor ---------- */
if (fine && !reduce) {
  const cur = $(".cursor"), ct = $("#cursor-t"); let cx = innerWidth / 2, cy = innerHeight / 2;
  gsap.ticker.add(() => { cx += (ptr.cx - cx) * .22; cy += (ptr.cy - cy) * .22; cur.style.transform = `translate(${cx}px, ${cy}px)`; });
  document.addEventListener("pointerover", e => {
    const a = e.target.closest("a, button");
    cur.classList.toggle("link", !!a);
    let label = "";
    if (!a && live) { if (prog.wh > .2 && prog.wh < .95) label = tr("Whisk", "Klop"); else if (prog.hero < .95 || (prog.dr > 0 && prog.dr < 1)) label = tr("Stir", "Roer"); }
    cur.classList.toggle("big", !!label); ct.textContent = label;
  });
  addEventListener("scroll", () => { const label = live && !(prog.wh > 0 && prog.wh < .2) ? (prog.wh > .2 && prog.wh < .95 ? tr("Whisk", "Klop") : (prog.hero < .95 || (prog.dr > 0 && prog.dr < 1)) ? tr("Stir", "Roer") : "") : ""; if (!document.querySelector("a:hover, button:hover")) { cur.classList.toggle("big", !!label); ct.textContent = label; } }, { passive: true });
}

/* ---------- loader out: the ensō closes, the ink opens the page ---------- */
const heroLines = $$(".hero-h .ln > *");
await world.warm(); tick(); tick();
ldTo(100);
ScrollTrigger.refresh();
if (!TEST) await ldDone;
// a first bloom of ink behind the cup
for (let n = 0; n < 6; n++) { const c = world.cupUV(1.4); world.fluid.splat(c.u + (n - 2.5) * .03, c.v, (n - 2.5) * 120, 600 + n * 60, DR[0].dye.map(x => x * .8), .3); }
const intro = gsap.timeline({ delay: TEST ? 0 : .15, onComplete: () => { $("#loader").remove(); root.classList.remove("loading"); if (lenis) lenis.start(); } });
intro.to(".ld-mid, .ld-cap", { autoAlpha: 0, duration: .5, ease: "power2.in" })
  .to(".ld-enso", { scale: 9, autoAlpha: 0, duration: 1.4, ease: "expo.in" }, 0)
  .to("#loader", { autoAlpha: 0, duration: .7, ease: "power2.out" }, 1.0)
  .from(heroLines, { yPercent: 115, duration: 1.5, stagger: .12, ease: "expo.out" }, 1.15)
  .from(".hero-tate", { clipPath: "inset(0 0 100% 0)", duration: 1.8, ease: "power3.out" }, 1.2)
  .from(".hero-kick, .hero-hint, .nav, .chap", { y: 20, autoAlpha: 0, duration: 1.2, stagger: .06, ease: "expo.out" }, 1.35);
if (TEST) intro.progress(1);
window.__ready = true;
