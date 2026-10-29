/* SHOT Lifestyle & Coffee · concept site by Dolcessi */
const $ = (s, c = document) => c.querySelector(s), $$ = (s, c = document) => [...c.querySelectorAll(s)];
const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const lerp = (a, b, t) => a + (b - a) * t;
const ss = (a, b, v) => { const t = clamp((v - a) / (b - a)); return t * t * (3 - 2 * t); };
const eo = t => 1 - Math.pow(1 - clamp(t), 3);
const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
const TEST = /[?&]test/.test(location.search);
const TZ = "Europe/Amsterdam";
const TAU = Math.PI * 2;

/* ---------- loader in ---------- */
const ldN = $("#ld-n"), ldFill = $("#ld-fill");
// smooth loader: the number always creeps forward (eased toward ~92%) while files arrive, real milestones push it, and it only finishes at 100
let ldMile = 0, ldVal = 0, ldFinal = false, ldResolve; const ldT0 = performance.now();
const ldDoneP = new Promise(r => (ldResolve = r));
const ldTo = v => { if (v >= 100) ldFinal = true; else ldMile = Math.max(ldMile, v); };
(function ldLoop() {
  const t = (performance.now() - ldT0) / 1000;
  const creep = 92 * (1 - Math.exp(-t / 2.6));
  const goal = ldFinal ? 100 : Math.min(94, Math.max(ldMile, creep));
  ldVal += Math.min((goal - ldVal) * (ldFinal ? .085 : .05), ldFinal ? 2.2 : 1.2); // capped, so it never jumps
  if (ldFinal && goal - ldVal < .4) ldVal = 100;
  ldN.textContent = Math.floor(ldVal); ldFill.style.transform = `scaleX(${ldVal / 100})`;
  if (ldVal >= 100) { ldResolve(); return; }
  requestAnimationFrame(ldLoop);
})();
gsap.to(".ld-word span", { yPercent: -105, y: 0, duration: 1.1, stagger: .07, ease: "expo.out", delay: .15 });
ldTo(12);

/* ---------- language ---------- */
const LANG = (() => {
  const q = new URLSearchParams(location.search).get("lang");
  if (q === "nl" || q === "en") { try { localStorage.setItem("shot-lang", q); } catch (e) {} return q; }
  try { const s = localStorage.getItem("shot-lang"); if (s === "nl" || s === "en") return s; } catch (e) {}
  return /^nl\b/i.test(navigator.language || "") ? "nl" : "en";
})();
const NL = LANG === "nl", tr = (en, nl) => (NL ? nl : en);
document.documentElement.lang = LANG;
if (NL) {
  $$("[data-nl]").forEach(el => { el.innerHTML = el.dataset.nl; });
  $$("[data-order]").forEach(a => { a.href = "https://www.thuisbezorgd.nl/menu/shot-lifestyle-coffee"; });
}
$("#lang").querySelector(`[data-l="${LANG}"]`).outerHTML = `<b>${LANG.toUpperCase()}</b>`;
$("#lang").addEventListener("click", () => { const to = NL ? "en" : "nl"; try { localStorage.setItem("shot-lang", to); } catch (e) {} const u = new URL(location.href); u.searchParams.set("lang", to); location.href = u.toString(); });

/* ---------- opening hours (Mon–Thu 08–18, Fri–Sun 09–20) ---------- */
const DAYS = NL ? ["Maandag", "Dinsdag", "Woensdag", "Donderdag", "Vrijdag", "Zaterdag", "Zondag"] : ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
const OPEN = [[480, 1080], [480, 1080], [480, 1080], [480, 1080], [540, 1200], [540, 1200], [540, 1200]];
const hm = m => `${String(Math.floor(m / 60)).padStart(2, "0")}:${String(m % 60).padStart(2, "0")}`;
function amsNow() {
  const p = new Intl.DateTimeFormat("en-GB", { weekday: "short", hour: "2-digit", minute: "2-digit", hour12: false, timeZone: TZ }).formatToParts(new Date());
  const g = k => p.find(x => x.type === k).value;
  return { d: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].indexOf(g("weekday")), m: (+g("hour") % 24) * 60 + +g("minute") };
}
function status() {
  const { d, m } = amsNow(), o = OPEN[d];
  if (m >= o[0] && m < o[1]) return { open: true, text: tr(`Open now · until ${hm(o[1])}`, `Nu open · tot ${hm(o[1])}`), short: tr(`Open · until ${hm(o[1])}`, `Open · tot ${hm(o[1])}`) };
  if (m < o[0]) return { open: false, text: tr(`Closed · opens today at ${hm(o[0])}`, `Gesloten · vandaag open vanaf ${hm(o[0])}`), short: tr(`Opens ${hm(o[0])}`, `Open vanaf ${hm(o[0])}`) };
  const n = OPEN[(d + 1) % 7];
  return { open: false, text: tr(`Closed · opens tomorrow at ${hm(n[0])}`, `Gesloten · morgen open vanaf ${hm(n[0])}`), short: tr(`Opens tomorrow ${hm(n[0])}`, `Morgen open ${hm(n[0])}`) };
}
function renderHours() {
  const { d } = amsNow(), s = status();
  $("#nav-open").textContent = "Amsterdam · " + s.short; $("#nav-dot").classList.toggle("off", !s.open);
  const card = $("#ams"); $(".status span", card).textContent = s.text; $(".status i", card).classList.toggle("off", !s.open);
  const ul = $(".hours", card); ul.textContent = "";
  DAYS.forEach((name, i) => {
    const li = document.createElement("li"); if (i === d) li.className = "today";
    const a = document.createElement("span"); a.textContent = name;
    const b = document.createElement("span"); b.textContent = `${hm(OPEN[i][0])} – ${hm(OPEN[i][1])}`;
    li.append(a, b); ul.appendChild(li);
  });
}
renderHours(); setInterval(renderHours, 60000);

/* ---------- signatures ---------- */
const P = k => `img/photo/${k}.jpg`;
const SIGS = [
  { k: "matcha", name: "Iced Matcha", price: "6,50", d: ["Matcha, cold milk and ice. The clean classic, sealed.", "Matcha, koude melk en ijs. De pure klassieker, verzegeld."], tags: ["Matcha", tr("Milk", "Melk"), tr("Ice", "IJs")], ph: ["matcha-texture", "whisk-foam"], bg: ["#ECEEDD", "#D6DCBE"], acc: "#6E7E2D" },
  { k: "strawberry", name: "Strawberry Cheesecake Matcha", price: "8,85", d: ["Strawberry, a cheesecake layer and matcha, stacked in three colours.", "Aardbei, een laag cheesecake en matcha, gestapeld in drie kleuren."], tags: [tr("Strawberry", "Aardbei"), "Cheesecake", "Matcha"], ph: ["strawberry-macro", "pink-cream"], bg: ["#F6E3E0", "#E9C8C3"], acc: "#B5233A" },
  { k: "creme", name: "Crème Brûlée Matcha", price: "8,85", d: ["Burnt caramel notes over matcha, with collagen added.", "Gebrande karamel over matcha, met collageen."], tags: [tr("Caramel", "Karamel"), "Matcha", tr("Collagen", "Collageen")], ph: ["caramel-spoon", "cream-warm"], bg: ["#F4EAD7", "#E4D0AE"], acc: "#A8732C" },
  { k: "cherry", name: "Creatine Cherry Matcha", price: "7,50", d: ["Dark cherry under matcha, with creatine for the gym bag.", "Donkere kers onder matcha, met creatine voor in je sporttas."], tags: [tr("Cherry", "Kers"), "Matcha", "Creatine"], ph: ["cherry-single", "cherry-wet"], bg: ["#F0E1E2", "#DDC1C5"], acc: "#8E1530" },
  { k: "lavender", name: "Lavender CBD Matcha", price: "7,50", d: ["Lavender and matcha, with CBD. The slow one.", "Lavendel en matcha, met CBD. De rustige."], tags: [tr("Lavender", "Lavendel"), "Matcha", "CBD"], ph: ["lavender-soft", "lavender-single"], bg: ["#EEEBF3", "#D8D1E6"], acc: "#7A64A8" },
  { k: "carrot", name: "Carrot Coconut Cloud", price: "8,20", d: ["Carrot and coconut under a soft cloud. No matcha, all colour.", "Wortel en kokos onder een zachte wolk. Geen matcha, wel kleur."], tags: [tr("Carrot", "Wortel"), tr("Coconut", "Kokos")], ph: ["carrot-hand", "carrot-dark"], bg: ["#F7E8D5", "#EBCFAA"], acc: "#D3590C" },
  { k: "mocca", name: "Protein Mocca Latte", price: "7,50", d: ["Coffee and cocoa, with protein added. Breakfast in a can.", "Koffie en cacao, met proteïne. Ontbijt in een can."], tags: [tr("Coffee", "Koffie"), tr("Cocoa", "Cacao"), tr("Protein", "Proteïne")], ph: ["cocoa-swirl", "espresso-double"], bg: ["#F1E6DC", "#DCC8B6"], acc: "#6B3E26" }
];
const N = SIGS.length;
$("#sig-n").textContent = String(N).padStart(2, "0");
$("#sig-list").innerHTML = SIGS.map((s, i) => `
  <article class="sig" aria-hidden="${i ? "true" : "false"}">
    <h3 class="sig-name">${s.name.split(" ").map(w => `<span class="w"><span>${w}</span></span>`).join(" ")}</h3>
    <p class="sig-desc">${NL ? s.d[1] : s.d[0]}</p>
    <div class="sig-meta"><span class="sig-price">€${s.price}</span><span class="sig-tags">${s.tags.map(t => `<span>${t}</span>`).join("")}</span></div>
  </article>`).join("");
$("#sig-dots").innerHTML = SIGS.map(() => "<i></i>").join("");
const sigEls = $$(".sig"), sigDots = $$("#sig-dots i");

/* ---------- menu ---------- */
const MENU = [
  { id: "specials", t: "Specials", items: [
    ["Lavender CBD Matcha", "", "0,33 l", "7,50", "lavender-soft"], ["Earl Grey Pear Matcha", "", "", "8,20", "matcha-texture"], ["Strawberry Cheesecake Matcha", "", "", "8,85", "strawberry-sliced"],
    ["Cinnamon Bun Matcha", "", "", "8,85", "caramel-swirl"], ["Carrot Coconut Cloud", "", "", "8,20", "carrot-hand"], ["Lychee Sparkling CBD Matcha", "", "", "8,20", "matcha-powder"],
    ["Vanilla Celtic Sea Salt Matcha", "", "", "7,50", "cream-warm"], ["Crème Brûlée Matcha", tr("With collagen", "Met collageen"), "0,4 l", "8,85", "caramel-spoon"], ["Creatine Cherry Matcha", "", "", "7,50", "cherry-single"],
    ["Protein Mocca Latte", "", "", "7,50", "cocoa-swirl"] ] },
  { id: "iced", t: "Iced", items: [["Iced Chai Latte", "", tr("Can", "Can"), "6,50", "caramel-swirl"], ["Iced Americano", "", tr("Can", "Can"), "5,00", "espresso-double"], ["Iced Matcha", "", tr("Can", "Can"), "6,50", "layered-matcha"], ["Iced Latte", "", tr("Can", "Can"), "6,00", "espresso-pour"]] },
  { id: "hot", t: tr("Hot", "Warm"), items: [["Chai latte", "", "", "6,00", "caramel-swirl"], ["Latte", "", "", "4,80", "espresso-pour"], ["Cappuccino", "", "", "4,50", "espresso-double"], ["Matcha latte", "", "", "6,00", "whisk-foam"], ["Flat white", "", "", "4,50", "espresso-portafilter"]] },
  { id: "bakes", t: tr("Bakes", "Gebak"), items: [["Cinnamon Bun", tr("With cream cheese", "Met roomkaas"), "", "6,75", "cream-warm"], ["Pecan Banana Bread", "", "", "4,50", "caramel-spoon"], ["Lemon Poppyseed Cake", "", "", "4,50", "cream-swirl"], ["Matcha White Chocolate Cookie", "", "", "4,50", "matcha-powder"]] },
  { id: "merch", t: "Merch", items: [["Shot tumbler", "", "", "14,95", "life-sip"], ["Shot matcha kit", tr("Whisk, holder, bowl, bamboo scoop", "Garde, houder, kom, bamboe schepje"), "", "44,95", "matcha-sift"], ["Shot koffiebonen", tr("250 g arabica", "250 g arabica"), "", "8,50", "espresso-portafilter"]] }
];
const tabs = $("#tabs"), body = $("#menu-body");
tabs.innerHTML = MENU.map((c, i) => `<button class="tab" role="tab" id="tab-${c.id}" aria-controls="menu-body" aria-selected="${i ? "false" : "true"}" data-i="${i}">${c.t}<sup>${c.items.length}</sup></button>`).join("");
function showMenu(i, anim = true) {
  const c = MENU[i];
  $$(".tab", tabs).forEach((b, n) => b.setAttribute("aria-selected", n === i ? "true" : "false"));
  body.setAttribute("aria-labelledby", `tab-${c.id}`);
  body.innerHTML = c.items.map((it, n) => `<div class="mi" data-ph="${it[4]}"><span class="mi-n">${String(n + 1).padStart(2, "0")}</span><span class="mi-t">${it[0]}${it[1] ? `<small>${it[1]}</small>` : ""}</span><span class="mi-s">${it[2]}</span><span class="mi-p">€${it[3]}</span></div>`).join("");
  if (anim && !reduce) gsap.from($$(".mi", body), { y: 26, autoAlpha: 0, duration: .9, stagger: .045, ease: "expo.out" });
}
tabs.addEventListener("click", e => { const b = e.target.closest(".tab"); if (b) showMenu(+b.dataset.i); });
tabs.addEventListener("keydown", e => { if (!/Arrow(Left|Right)/.test(e.key)) return; const bs = $$(".tab", tabs), i = bs.indexOf(document.activeElement); if (i < 0) return; const j = (i + (e.key === "ArrowRight" ? 1 : -1) + bs.length) % bs.length; bs[j].focus(); showMenu(j); });
showMenu(0, false);

// hover peek (desktop)
const fine = matchMedia("(hover: hover) and (pointer: fine)").matches;
const peek = $("#peek"), peekImg = $("img", peek);
if (fine) {
  let px = 0, py = 0, tx = 0, ty = 0, on = false;
  body.addEventListener("pointerover", e => { const r = e.target.closest(".mi"); if (!r) return; const src = P(r.dataset.ph); if (!peekImg.src.endsWith(src)) peekImg.src = src; peek.classList.add("on"); on = true; });
  body.addEventListener("pointerleave", () => { peek.classList.remove("on"); on = false; });
  addEventListener("pointermove", e => { tx = e.clientX + 170; ty = e.clientY; }, { passive: true });
  gsap.ticker.add(() => { if (!on && !peek.classList.contains("on")) return; px += (tx - px) * .14; py += (ty - py) * .14; peek.style.left = px + "px"; peek.style.top = py + "px"; });
}

/* ---------- credits ---------- */
fetch("img/photo/credits.json").then(r => r.json()).then(c => {
  $("#credits").innerHTML = Object.keys(c).sort().map(k => `<a href="${c[k]}" target="_blank" rel="noopener">${k.replace(/-/g, " ")}</a>`).join("<br>");
}).catch(() => {});

/* ---------- world ---------- */
await Promise.all([document.fonts.load('600 100px "Bodoni SHOT"'), document.fonts.load('500 100px "Bodoni SHOT"'), document.fonts.load('600 40px "Inter Tight"')]).catch(() => {});
ldTo(38);
const { createWorld } = await import("./world.js?v=2");
const { FLAVOURS, CAN } = await import("./can.js?v=2");
ldTo(64);
const canvas = $("#world");
const MOB = () => innerWidth < 900;
const LOW = MOB() || (navigator.hardwareConcurrency || 8) <= 4;
const world = await createWorld(canvas, { maxDpr: MOB() ? 1.25 : 1.5, keep: TEST, low: LOW });
const st = world.st;
// warm the photo planes so textures start loading now
SIGS.forEach(s => s.ph.forEach(k => world.photo(k, P(k))));
ldTo(86);

const hex = c => { const n = parseInt(c.slice(1, 7), 16); return [(n >> 16) & 255, (n >> 8) & 255, n & 255]; };
const mixHex = (a, b, t) => { const A = hex(a), B = hex(b); return "#" + A.map((v, i) => Math.round(lerp(v, B[i], clamp(t))).toString(16).padStart(2, "0")).join(""); };
const mixArr = (a, b, t) => a.map((v, i) => lerp(v, b[i], t));
const FL = k => FLAVOURS[k];

const prog = { hero: 0, rt: 0, sig: 0 };
const steps = $$(".steps li"), STEP_AT = [.08, .24, .42, .58, .66, .76, .92];
const STATES = NL ? ["Open", "Schenken", "IJs", "Verzegelen", "Verzegeld", "Geschud"] : ["Open", "Pouring", "Icing", "Sealing", "Sealed", "Shaken"];
let lastStep = -2, lastSig = -2, lastState = "";
const root = document.documentElement;

function photoLayout(m, alt) {
  if (m) return alt
    ? [{ x: -.7, y: .95, z: -2.6, w: 1.25, h: 1.6 }, { x: .82, y: .02, z: 1.3, w: .5, h: .64 }]
    : [{ x: .72, y: .95, z: -2.6, w: 1.25, h: 1.6 }, { x: -.82, y: -.05, z: 1.3, w: .5, h: .64 }];
  return alt
    ? [{ x: 3.05, y: -.3, z: -2.6, w: 1.7, h: 2.2 }, { x: 2.2, y: .62, z: 1.4, w: .6, h: .76 }]
    : [{ x: 3.0, y: .45, z: -2.6, w: 1.7, h: 2.25 }, { x: 2.2, y: -1.0, z: 1.4, w: .66, h: .84 }];
}

function choreograph() {
  const m = MOB();
  const h = prog.hero, r = prog.rt, f = prog.sig;
  const shots = [];

  // ===== hero: espresso stage, the word behind the can
  let x = 0, y = m ? .3 : .06, s = m ? .82 : 1.0, tiltZ = -.05, tiltX = 0, rotY = -.35, spin = 1;
  let bgA = "#2F2321", bgB = "#191210", glow = "#4A3329", ink = "#F9F5EE", word = 1, wordY = m ? .63 : .56, wordW = m ? 1.2 : .94, glowY = .5;
  let level = CAN.FILL, pour = 0, pourCol = "#ffffff", ripple = 0, ice = 1, iceDrop = 1, lid = 0, lidSpin = 0, cond = 1, mix = 0, shake = 0;
  let layers = FL("matcha").layers, tops = FL("matcha").tops, soft = FL("matcha").soft;
  let camY = .35, camZ = 8.6, lookY = 0, fov = 26;
  const out = ss(.3, 1, h);
  y += out * 4.6; spin = 1 + out * 3;
  wordY += ss(.15, .85, h) * .12; word = 1 - ss(.22, .62, h);
  const toCream = ss(.42, .95, h);
  bgA = mixHex(bgA, "#F9F5EE", toCream); bgB = mixHex(bgB, "#EAE1D3", toCream); glow = mixHex(glow, "#FFFFFF", toCream);

  // ===== ritual: empty can comes down, pour, ice, seal, condense, shake
  if (r > 0) {
    const S = FL("strawberry");
    layers = S.layers; tops = S.tops; soft = S.soft;
    bgA = "#F9F5EE"; bgB = "#E8DECF"; glow = "#FFFFFF"; word = 0;
    const inn = eo(ss(0, .075, r));
    x = m ? 0 : lerp(0, .95, inn); y = lerp(4.4, m ? .5 : 0, inn); s = m ? .74 : 1.08; spin = 0; rotY = -.3; tiltZ = 0;
    const F0 = .06, Lv = t => F0 + (CAN.FILL - F0) * t;
    // four pours, each with its own stream
    const seg = [[.08, .22, 0, .2], [.24, .4, .2, .52], [.42, .56, .52, .87], [.58, .64, .87, 1]];
    level = 0; pour = 0;
    seg.forEach(([a, b, l0, l1], i) => {
      if (r >= a) level = Lv(lerp(l0, l1, ss(a + .005, b - .005, r)));
      const on = ss(a - .01, a + .008, r) * (1 - ss(b - .008, b + .01, r));
      if (on > pour) { pour = on; pourCol = layers[i]; }
    });
    ripple = clamp(pour * 1.2);
    ice = ss(.68, .78, r); iceDrop = ss(.655, .77, r);
    const lidIn = eo(ss(.76, .845, r));
    lid = lerp(3.4, 0, lidIn); lidSpin = lidIn * 3 + ss(.84, .885, r) * 22;
    cond = ss(.86, .95, r);
    shake = ss(.92, .935, r) * (1 - ss(.975, .995, r)); mix = ss(.925, .99, r) * .6;
    camY = lerp(lerp(.35, 1.3, ss(.03, .1, r)), .7, ss(.74, .82, r)); lookY = lerp(lerp(0, .18, ss(.03, .1, r)), .05, ss(.74, .82, r));
    camZ = lerp(lerp(8.6, 8.1, ss(.03, .1, r)), 8.4, ss(.74, .82, r));
    if (m) { camZ += 1.6; lookY -= .05; }
    rotY = -.3 + ss(.86, .99, r) * .6;
    // HUD
    const frac = clamp((level - F0) / (CAN.FILL - F0));
    $("#ml").textContent = Math.round(frac * 330); $("#ml-bar").style.transform = `scaleX(${frac})`;
    const stt = r < .08 ? 0 : r < .655 ? 1 : r < .76 ? 2 : r < .885 ? 3 : r < .925 ? 4 : 5;
    if (STATES[stt] !== lastState) { lastState = STATES[stt]; $("#hud-state").textContent = lastState; }
    let k = -1; STEP_AT.forEach((t, i) => { if (r >= t) k = i; });
    if (k !== lastStep) { lastStep = k; steps.forEach((li, i) => { li.classList.toggle("on", i === k); li.classList.toggle("done", i < k); }); }
    gsap.set(".rt-stamp", { autoAlpha: ss(.865, .9, r) * (1 - ss(.97, 1, r)), x: (1 - ss(.865, .92, r)) * 30 });
  }

  // ===== signatures: one can, seven drinks
  if (f > 0) {
    const e = ss(0, .05, f);
    const fi = clamp(f * 1.02 * N - .12, 0, N - .0001), i = Math.floor(fi), t = fi - i, k = ss(.62, .96, t), j = Math.min(N - 1, i + 1);
    const A = SIGS[i], B = SIGS[j], FA = FL(A.k), FB = FL(B.k);
    const L = FA.layers.map((c, n) => mixHex(c, FB.layers[n], k));
    const T = mixArr(FA.tops, FB.tops, k), Sx = mixArr(FA.soft, FB.soft, k);
    const S = FL("strawberry");
    layers = S.layers.map((c, n) => mixHex(c, L[n], e)); tops = mixArr(S.tops, T, e); soft = mixArr(S.soft, Sx, e);
    mix = .6 * (1 - e); shake = 0; level = CAN.FILL; ice = 1; iceDrop = 1; lid = 0; lidSpin = 25; cond = 1; pour = 0;
    x = m ? 0 : lerp(.95, 1.05, e); y = m ? lerp(.5, .48, e) : 0; s = m ? .76 : lerp(1.08, 1.0, e);
    rotY = -.3 + .6 + (i + k) * TAU + e * .2; spin = 0;
    camY = m ? .55 : .5; lookY = m ? .3 : .05; camZ = m ? 9.4 : 8.6;
    const bA = mixHex(A.bg[0], B.bg[0], k), bB = mixHex(A.bg[1], B.bg[1], k);
    bgA = mixHex("#F9F5EE", bA, e); bgB = mixHex("#E8DECF", bB, e); glow = mixHex("#FFFFFF", mixHex(bA, "#FFFFFF", .6), e);
    word = e; ink = mixHex(bA, "#2D2220", .035); wordY = m ? .5 : .5; wordW = m ? 1.3 : .98;
    // photos: current wipe out, next wipe in
    const outT = i < N - 1 ? ss(.5, .7, t) : 0, inT = ss(.72, .95, t);
    const endOut = ss(.95, 1, f);
    [[A, i, 1 - outT], [B, j, inT]].forEach(([sg, n, rv], q) => {
      if (q === 1 && j === i) return;
      const lay = photoLayout(m, n % 2 === 1);
      sg.ph.forEach((key, pi) => { const pl = lay[pi], dl = pi * .12; shots.push({ key, url: P(key), ...pl, y: pl.y + (1 - rv) * (pi ? -.15 : .15), reveal: clamp(rv * e * (1 - endOut) * (1 + dl) - dl), dim: 0 }); });
    });
    const cur = f < .02 ? -1 : (t > .8 && i < N - 1 ? j : i);
    if (cur !== lastSig) {
      lastSig = cur;
      sigEls.forEach((el, n) => {
        const on = n === cur; el.setAttribute("aria-hidden", on ? "false" : "true");
        gsap.killTweensOf(el); gsap.killTweensOf($$(".w > span, .sig-desc, .sig-meta", el));
        if (on) {
          gsap.set(el, { autoAlpha: 1 });
          gsap.fromTo($$(".w > span", el), { yPercent: 110 }, { yPercent: 0, duration: 1.05, stagger: .06, ease: "expo.out" });
          gsap.fromTo($$(".sig-desc, .sig-meta", el), { y: 18, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: .9, delay: .18, stagger: .07, ease: "expo.out" });
        } else gsap.to(el, { autoAlpha: 0, duration: .35, ease: "power2.out" });
      });
      sigDots.forEach((d, n) => d.classList.toggle("on", n === cur));
      $("#sig-i").textContent = String(Math.max(cur, 0) + 1).padStart(2, "0");
      if (cur >= 0) root.style.setProperty("--accent", SIGS[cur].acc);
    }
    // leave: the can sinks away as the statement rises
    const lv = ss(.955, 1, f); y -= lv * 3.4;
  }

  Object.assign(st, { x, y, s, rotY, tiltX, tiltZ, spin, bgA, bgB, glow, ink, word, wordY, wordW, glowY, level, pour, pourCol, ripple, ice, iceDrop, lid, lidSpin, cond, mix, shake, layers, tops, soft, camY, camZ, lookY, fov, shots });
}

/* ---------- motion ---------- */
gsap.registerPlugin(ScrollTrigger);
let lenis = null;
if (!reduce && !TEST && window.Lenis) {
  lenis = new Lenis({ lerp: .09, smoothWheel: true });
  lenis.on("scroll", ScrollTrigger.update);
  gsap.ticker.add(tm => lenis.raf(tm * 1000)); gsap.ticker.lagSmoothing(0);
  lenis.stop();
}
$$('a[href^="#"]').forEach(a => a.addEventListener("click", ev => {
  const id = a.getAttribute("href"); if (id.length < 2 || !$(id)) return; ev.preventDefault();
  const target = id === "#top" ? 0 : id === "#signatures" ? $("#signatures").offsetTop + innerHeight * .9 : id;
  if (lenis) lenis.scrollTo(target, { duration: 2 }); else scrollTo({ top: typeof target === "number" ? target : $(id).offsetTop, behavior: reduce ? "auto" : "smooth" });
}));
const track = (sel, key) => ScrollTrigger.create({ trigger: sel, start: "top top", end: "bottom bottom", onUpdate: s => { prog[key] = s.progress; } });
track("#hero", "hero"); track("#ritual", "rt"); track("#signatures", "sig");

// render only while the 3D chapters are on screen
let live = true;
ScrollTrigger.create({ trigger: "#statement", start: "top top", onEnter: () => { live = false; canvas.style.visibility = "hidden"; }, onLeaveBack: () => { live = true; canvas.style.visibility = "visible"; } });
window.__step = () => { choreograph(); world.frame(); };
// phones: full rate while scrolling, half rate when the page is still (the can only idles then)
let lastSY = -1, idleN = 0;
gsap.ticker.add(() => {
  if (!live || TEST) return;
  const y = scrollY; if (y !== lastSY) { lastSY = y; idleN = 0; } else idleN++;
  if (LOW && idleN > 2 && (idleN & 1)) return;
  choreograph(); world.frame();
});

// nav colour by chapter
const nav = $("#nav");
ScrollTrigger.create({ trigger: "#ritual", start: "top 10%", endTrigger: "#signatures", end: "bottom top", toggleClass: { targets: nav, className: "dark" } });
ScrollTrigger.create({ trigger: "#statement", start: "top 60px", end: "max", toggleClass: { targets: nav, className: "solid" } });
ScrollTrigger.create({ trigger: "#ritual", start: "top 60%", end: "max", onToggle: s => $(".mbar").classList.toggle("on", s.isActive) });

// hero text leaves, chapter text arrives
gsap.to([".hero-b", ".hero-tl", ".hero-tr", ".scroll-cue"], { autoAlpha: 0, y: -30, ease: "none", scrollTrigger: { trigger: "#hero", start: "4% top", end: "30% top", scrub: true } });
gsap.fromTo(".rt-l, .rt-hud", { autoAlpha: 0, y: 40 }, { autoAlpha: 1, y: 0, ease: "none", scrollTrigger: { trigger: "#ritual", start: "top top", end: "5% top", scrub: true } });
gsap.to(".rt-l, .rt-hud", { autoAlpha: 0, y: -30, ease: "none", scrollTrigger: { trigger: "#ritual", start: "96% bottom", end: "bottom bottom", scrub: true } });
gsap.fromTo(".sig-head, .sig-dots", { autoAlpha: 0 }, { autoAlpha: 1, ease: "none", scrollTrigger: { trigger: "#signatures", start: "top top", end: "4% top", scrub: true } });
gsap.to(".sc-sig .pin > *", { autoAlpha: 0, ease: "none", scrollTrigger: { trigger: "#signatures", start: "bottom 104%", end: "bottom bottom", scrub: true } });
gsap.set(sigEls, { autoAlpha: 0 });

// split headings into masked lines
$$(".sc-menu h2, .sc-shop h2, .sc-visit h2, .sc-brands h2, .craft-intro h2, .rt-h").forEach(h => {
  h.innerHTML = h.innerHTML.split(/<br\s*\/?>/i).map(l => `<span class="reveal-line"><span>${l}</span></span>`).join("");
  if (h.classList.contains("rt-h")) return;
  gsap.from($$(".reveal-line > span", h), { yPercent: 115, duration: 1.3, stagger: .1, ease: "expo.out", scrollTrigger: { trigger: h, start: "top 86%" } });
});
// eyebrows + small copy
$$(".sc-menu .eyebrow, .sc-shop .eyebrow, .sc-visit .eyebrow, .sc-brands .eyebrow, .menu-note, .br-r > *, .shop-note").forEach(el => gsap.from(el, { y: 24, autoAlpha: 0, duration: 1.1, ease: "expo.out", scrollTrigger: { trigger: el, start: "top 90%" } }));

// statement: words light up as you read
{
  const el = $("#stm"), words = el.textContent.trim().split(/\s+/);
  const itals = NL ? ["heldere", "can:"] : ["clear", "can:"];
  el.innerHTML = words.map(w => `<span class="wd${itals.includes(w) ? " it" : ""}">${w}</span>`).join(" ");
  const ws = $$(".wd", el);
  ScrollTrigger.create({ trigger: el, start: "top 80%", end: "bottom 45%", scrub: true, onUpdate: s => { const n = Math.round(s.progress * ws.length); ws.forEach((w, i) => w.classList.toggle("lit", i < n)); } });
}

// craft: horizontal track with masked reveals and inner parallax
{
  const trk = $("#craft-track");
  const hz = gsap.to(trk, { x: () => -(trk.scrollWidth - innerWidth), ease: "none", scrollTrigger: { trigger: "#craft", start: "top top", end: "bottom bottom", scrub: true, invalidateOnRefresh: true, onUpdate: s => { $("#craft-prog").style.transform = `scaleX(${s.progress})`; } } });
  $$(".cr").forEach(fig => {
    const wrap = $(".cr-img", fig), img = $("img", fig), d = +fig.dataset.d || 1;
    gsap.fromTo(wrap, { clipPath: "inset(100% 0% 0% 0%)" }, { clipPath: "inset(0% 0% 0% 0%)", ease: "none", scrollTrigger: { trigger: fig, containerAnimation: hz, start: "left 95%", end: "left 55%", scrub: true } });
    gsap.fromTo(img, { scale: 1.3, xPercent: 6 * d }, { scale: 1.08, xPercent: -6 * d, ease: "none", scrollTrigger: { trigger: fig, containerAnimation: hz, start: "left right", end: "right left", scrub: true } });
    gsap.from($("figcaption", fig), { y: 20, autoAlpha: 0, ease: "none", scrollTrigger: { trigger: fig, containerAnimation: hz, start: "left 70%", end: "left 50%", scrub: true } });
  });
  $$(".cr-word").forEach(w => gsap.fromTo(w, { xPercent: 30 * (+w.dataset.d || 1) }, { xPercent: -30 * (+w.dataset.d || 1), ease: "none", scrollTrigger: { trigger: w, containerAnimation: hz, start: "left right", end: "right left", scrub: true } }));
}

// products, cities: rise + inner image parallax
$$(".prod").forEach((p, i) => gsap.from(p, { y: 70, autoAlpha: 0, duration: 1.3, delay: i * .08, ease: "expo.out", scrollTrigger: { trigger: ".shop-grid", start: "top 85%" } }));
$$(".city").forEach((c, i) => {
  gsap.from(c, { y: 70, autoAlpha: 0, duration: 1.3, delay: i * .1, ease: "expo.out", scrollTrigger: { trigger: ".cities", start: "top 85%" } });
  gsap.fromTo($(".city-img img", c), { yPercent: -9 }, { yPercent: 0, ease: "none", scrollTrigger: { trigger: c, start: "top bottom", end: "bottom top", scrub: true } });
});
// footer word rises letter by letter
{
  const fw = $(".ft-word"); fw.innerHTML = [...fw.textContent].map(c => `<span style="display:inline-block">${c}</span>`).join("");
  gsap.from($$("span", fw), { yPercent: 60, autoAlpha: 0, duration: 1.6, stagger: .08, ease: "expo.out", scrollTrigger: { trigger: fw, start: "top 95%" } });
}
// marquee: duplicate for a seamless loop
{ const mq = $(".mq-track"); mq.innerHTML += mq.innerHTML; }

/* ---------- cursor + magnetic buttons ---------- */
if (fine && !reduce) {
  const cur = $(".cursor"), ct = $("#cursor-t"); let cx = innerWidth / 2, cy = innerHeight / 2, tx = cx, ty = cy;
  addEventListener("pointermove", e => { tx = e.clientX; ty = e.clientY; }, { passive: true });
  gsap.ticker.add(() => { cx += (tx - cx) * .2; cy += (ty - cy) * .2; cur.style.transform = `translate(${cx}px, ${cy}px)`; });
  document.addEventListener("pointerover", e => {
    const a = e.target.closest("a, button, .mi, summary");
    cur.classList.toggle("link", !!a && !a.classList.contains("mi"));
    const big = e.target.closest(".mi, .cr");
    cur.classList.toggle("big", !!big); ct.textContent = big ? (big.classList.contains("mi") ? tr("Order", "Bestel") : tr("Drag on", "Scroll")) : "";
  });
  $$(".mag").forEach(b => {
    b.addEventListener("pointermove", e => { const r = b.getBoundingClientRect(); gsap.to(b, { x: (e.clientX - r.left - r.width / 2) * .22, y: (e.clientY - r.top - r.height / 2) * .3, duration: .6, ease: "power3.out" }); });
    b.addEventListener("pointerleave", () => gsap.to(b, { x: 0, y: 0, duration: .9, ease: "elastic.out(1, .4)" }));
  });
  $("#menu-body").addEventListener("click", e => { if (e.target.closest(".mi")) window.open(NL ? "https://www.thuisbezorgd.nl/menu/shot-lifestyle-coffee" : "https://www.thuisbezorgd.nl/en/menu/shot-lifestyle-coffee", "_blank", "noopener"); });
}

/* ---------- loader out ---------- */
choreograph(); await world.warm(); world.frame();
ldTo(100);
ScrollTrigger.refresh();
if (!TEST) await ldDoneP;
const heroLines = $$(".hero-h .ln").map(l => { l.innerHTML = `<span>${l.innerHTML}</span>`; return $("span", l); });
const intro = gsap.timeline({ delay: TEST ? 0 : .25, onComplete: () => { $("#loader").remove(); document.body.classList.remove("loading"); if (lenis) lenis.start(); } });
intro.to(".ld-word span", { yPercent: -210, duration: .8, stagger: .05, ease: "expo.in" })
  .to(".ld-meta, .ld-bar", { autoAlpha: 0, duration: .4 }, "<")
  .to(".ld-top", { yPercent: -100, duration: 1.2, ease: "expo.inOut" }, "-=.15")
  .to(".ld-bot", { yPercent: 100, duration: 1.2, ease: "expo.inOut" }, "<")
  .from(heroLines, { yPercent: 115, duration: 1.4, stagger: .1, ease: "expo.out" }, "-=.55")
  .from(".hero-side, .hero-tl, .hero-tr, .nav, .scroll-cue", { y: 22, autoAlpha: 0, duration: 1.2, stagger: .05, ease: "expo.out" }, "<+.15");
if (TEST) intro.progress(1);
window.__ready = true;
