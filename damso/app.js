/* Damso 담소 · concept site by Dolcessi */
(() => {
const $ = (s, c = document) => c.querySelector(s), $$ = (s, c = document) => [...c.querySelectorAll(s)];
const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
const MOB = () => innerWidth < 900;
const TZ = "Europe/Amsterdam", TEL = "tel:+31206401877";

/* ---------- language ---------- */
const LANG = (() => {
  const q = new URLSearchParams(location.search).get("lang");
  if (q === "nl" || q === "en") { try { localStorage.setItem("ds-lang", q); } catch (e) {} return q; }
  try { const s = localStorage.getItem("ds-lang"); if (s === "nl" || s === "en") return s; } catch (e) {}
  return /^nl\b/i.test(navigator.language || "") ? "nl" : "en";
})();
const NL = LANG === "nl", tr = (en, nl) => (NL ? nl : en);
document.documentElement.lang = LANG;
if (NL) $$("[data-nl]").forEach(el => { el.innerHTML = el.dataset.nl; });
$("#lang").querySelector(`[data-l="${LANG}"]`).outerHTML = `<b>${LANG.toUpperCase()}</b>`;
$("#lang").addEventListener("click", () => { const to = NL ? "en" : "nl"; try { localStorage.setItem("ds-lang", to); } catch (e) {} const u = new URL(location.href); u.searchParams.set("lang", to); location.href = u.toString(); });

/* ---------- hours: Wed–Mon 17:30–22:00, Tuesday closed ---------- */
const DAYS = NL ? ["Maandag", "Dinsdag", "Woensdag", "Donderdag", "Vrijdag", "Zaterdag", "Zondag"] : ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
const SHORT = NL ? ["ma", "di", "wo", "do", "vr", "za", "zo"] : ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const OPEN = [[1050, 1320], null, [1050, 1320], [1050, 1320], [1050, 1320], [1050, 1320], [1050, 1320]];
const hm = m => `${String(Math.floor(m / 60)).padStart(2, "0")}:${String(m % 60).padStart(2, "0")}`;
function now() {
  const p = new Intl.DateTimeFormat("en-GB", { weekday: "short", day: "numeric", hour: "2-digit", minute: "2-digit", hour12: false, timeZone: TZ }).formatToParts(new Date());
  const g = k => p.find(x => x.type === k).value;
  return { d: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].indexOf(g("weekday")), m: (+g("hour") % 24) * 60 + +g("minute") };
}
function status() {
  const { d, m } = now(), o = OPEN[d];
  if (o && m >= o[0] && m < o[1]) return { open: true, big: tr("Open now", "Nu open"), sub: tr(`Kitchen until ${hm(o[1])}`, `Tot ${hm(o[1])}`), line: tr(`Open now · until ${hm(o[1])}`, `Nu open · tot ${hm(o[1])}`) };
  if (o && m < o[0]) return { open: false, big: tr(`Opens ${hm(o[0])}`, `Open om ${hm(o[0])}`), sub: tr("Today", "Vandaag"), line: tr(`Opens today at ${hm(o[0])}`, `Vandaag open vanaf ${hm(o[0])}`) };
  let nd = (d + 1) % 7; while (!OPEN[nd]) nd = (nd + 1) % 7;
  const when = nd === (d + 1) % 7 ? tr("tomorrow", "morgen") : DAYS[nd].toLowerCase();
  return { open: false, big: tr("Closed now", "Nu gesloten"), sub: tr(`Opens ${when} ${hm(OPEN[nd][0])}`, `Open ${when} ${hm(OPEN[nd][0])}`), line: tr(`Closed · opens ${when} at ${hm(OPEN[nd][0])}`, `Gesloten · ${when} open vanaf ${hm(OPEN[nd][0])}`) };
}
function renderHours() {
  const s = status(), { d } = now();
  $("#now").textContent = s.big; $("#now-sub").textContent = s.sub; $("#dot").classList.toggle("off", !s.open);
  $(".status span").textContent = s.line; $(".status i").classList.toggle("off", !s.open);
  $("#hours").innerHTML = DAYS.map((n, i) => `<li${i === d ? ' class="today"' : ""}><span>${n}</span><span>${OPEN[i] ? `${hm(OPEN[i][0])} – ${hm(OPEN[i][1])}` : tr("Closed", "Gesloten")}</span></li>`).join("");
}
renderHours(); setInterval(renderHours, 60000);

/* ---------- signature dishes (guest photos) ---------- */
const DISHES = [
  ["p100", "돌솥비빔밥", "Dolsot bibimbap", "", ["Rice, vegetables, beef and an egg in a sizzling stone bowl. Mix it at the table.", "Rijst, groenten, rundvlees en een ei in een sissende stenen kom. Aan tafel mengen."]],
  ["p31", "해물파전", "Haemul pajeon", "€15 / €19", ["Savoury pancake with leek and seafood.", "Hartige pannenkoek met prei en zeevruchten."]],
  ["p40", "닭강정", "Dak gangjeong", tr("from €12", "vanaf €12"), ["Fried drumsticks in honey sauce with sesame oil.", "Gefrituurde kippenboutjes in honingsaus met sesamolie."]],
  ["p137", "육회", "Yukhoe", "€15", ["Thinly sliced beef tartare with pear and a raw egg.", "Dun gesneden rundertartaar met peer en rauw ei."]],
  ["p27", "잡채", "Japchae", "", ["Glass noodles stir-fried with vegetables.", "Glasnoedels geroerbakt met groenten."]],
  ["p7", "짜장면", "Jjajangmyeon", "", ["Noodles in a rich black bean sauce.", "Noedels in een rijke zwarte-bonensaus."]],
  ["p52", "떡볶이", "Tteokbokki", "", ["Rice cakes in red chilli sauce.", "Rijstcakejes in rode pepersaus."]],
  ["p26", "불고기", "Bulgogi", "", ["Marinated beef on a sizzling plate.", "Gemarineerd rundvlees op een sissende plaat."]],
  ["p28", "치킨", tr("Korean fried chicken", "Koreaanse kip"), "", ["Crisp-fried, for the table to share.", "Krokant gefrituurd, om te delen."]],
  ["p116", "반찬", "Banchan", "", ["The little side dishes on the table.", "De kleine bijgerechtjes op tafel."]]
];
$("#sig-track").innerHTML = DISHES.map(([ph, kr, name, pr, d]) => `<figure class="dish"><div class="ph"><img src="img/p/${ph}.jpg" alt="${name}" loading="lazy"></div><figcaption><h3>${name}</h3>${pr ? `<span class="pr">${pr}</span>` : ""}<span class="kr">${kr}</span><p>${NL ? d[1] : d[0]}</p></figcaption></figure>`).join("");

/* ---------- starters with prices (Damso's current menu) ---------- */
const STARTERS = [
  ["치킨만두", "Chicken mandu", false, ["Fried dumplings with chicken", "Gefrituurde dumplings met kip"], "8 · €12<br>12 · €16<br>20 · €24"],
  ["야채만두", "Yachae mandu", true, ["Fried dumplings with vegetables", "Gefrituurde dumplings met groente"], "8 · €12<br>12 · €16<br>20 · €24"],
  ["새우튀김", "Saeu twigim", false, ["Fried prawns with house-made sauce, 4 pcs", "Gefrituurde garnalen met huisgemaakte saus, 4 st."], "€10"],
  ["닭강정", "Dak gangjeong", false, ["Fried drumsticks in honey sauce with sesame oil", "Kippenboutjes in honingsaus met sesamolie"], "8 · €12<br>12 · €16<br>20 · €23"],
  ["해물파전", "Haemul pajeon", false, ["Savoury pancake with leek and seafood", "Hartige pannenkoek met prei en zeevruchten"], tr("Small €15<br>Large €19", "Klein €15<br>Groot €19")],
  ["김치전", "Kimchi jeon", true, ["Traditional kimchi pancake", "Traditionele kimchi-pannenkoek"], tr("Small €15<br>Large €19", "Klein €15<br>Groot €19")],
  ["게살전", "Gesal jeon", false, ["Crab pancakes, 3 pcs", "Krabpannenkoekjes, 3 st."], "€12"],
  ["육회", "Yukhoe", false, ["Beef tartare with pear and raw egg", "Rundertartaar met peer en rauw ei"], "€15"]
];
$("#mn-list").innerHTML = STARTERS.map(([kr, n, v, d, p]) => `<li><b>${n}${v ? "<small>V</small>" : ""}</b><span class="pr">${p}</span><span class="kr">${kr}</span><span class="d">${NL ? d[1] : d[0]}</span></li>`).join("");

/* ---------- pick your seat + book: the room, the size, the day, the time, the spot ---------- */
const SPOTS = [
  [tr("Tables along the wall", "Tafels langs de muur"), tr("Tables for two to four. Good for a quiet dinner.", "Tafels voor twee tot vier. Fijn voor een rustig diner."), tr("Wall table", "Aan de muur"), tr("by the wall", "aan de muur")],
  [tr("The middle of the room", "Midden in de zaal"), tr("Where the room gets lively. Good for groups.", "Waar het gezellig druk wordt. Fijn voor groepen."), tr("Middle", "Midden"), tr("in the middle of the room", "midden in de zaal")],
  [tr("The yellow booth", "De gele bank"), tr("Bench seating along the wall, the comfiest seats in the room.", "Bankjes langs de muur, de lekkerste plekken in de zaal."), tr("Yellow booth", "Gele bank"), tr("in the yellow booth", "op de gele bank")]
];
const card = $("#spot-card"), spots = $$(".spot");
const daysEl = $("#days"), sizeEl = $("#size"), timesEl = $("#times"), areasEl = $("#areas");
const t0 = now(); const opts = [];
for (let k = 0; k < 7; k++) { const d = (t0.d + k) % 7; opts.push({ d, k, label: k === 0 ? tr("Today", "Vandaag") : k === 1 ? tr("Tomorrow", "Morgen") : SHORT[d] }); }
const SLOTS = []; for (let m = 1050; m <= 1290; m += 30) SLOTS.push(m);   // 17:30 … 21:30
const slotsFor = o => o.k === 0 ? SLOTS.filter(m => m >= t0.m + 30) : SLOTS;
// a day only counts if it's open and still has a slot left
daysEl.innerHTML = opts.map((o, i) => `<button type="button" data-i="${i}"${OPEN[o.d] && slotsFor(o).length ? "" : " disabled"}>${o.label}</button>`).join("");
areasEl.innerHTML = SPOTS.map((sp, i) => `<button type="button" data-a="${i}">${sp[2]}</button>`).join("") + `<button type="button" data-a="-1">${tr("No preference", "Maakt niet uit")}</button>`;
let size = "2", day = opts.findIndex(o => OPEN[o.d] && slotsFor(o).length), time = null, area = 2;
function setSpot(k, fromRoom) {
  area = k;
  spots.forEach((s, i) => s.classList.toggle("on", i === k));
  if (k >= 0) { $("b", card).textContent = SPOTS[k][0]; $("span", card).textContent = SPOTS[k][1]; if (window.gsap && !reduce && fromRoom) gsap.fromTo(card, { y: 10, autoAlpha: .4 }, { y: 0, autoAlpha: 1, duration: .5, ease: "expo.out" }); }
  upd();
}
spots.forEach((s, i) => { s.addEventListener("click", () => setSpot(i, true)); s.addEventListener("mouseenter", () => setSpot(i, true)); });
function upd() {
  const o = opts[day], sl = slotsFor(o);
  if (!sl.includes(time)) time = sl.includes(1140) ? 1140 : sl[0];
  timesEl.innerHTML = sl.map(m => `<button type="button" data-t="${m}"${m === time ? ' class="on"' : ""}>${hm(m)}</button>`).join("");
  $$("button", sizeEl).forEach(b => b.classList.toggle("on", b.dataset.v === size));
  $$("button", daysEl).forEach(b => b.classList.toggle("on", +b.dataset.i === day));
  $$("button", areasEl).forEach(b => b.classList.toggle("on", +b.dataset.a === area));
  const who = { 2: tr("1–2", "1–2"), 4: tr("3–4", "3–4"), 6: tr("5–6", "5–6"), 8: tr("7+", "7+") }[size];
  const when = day === 0 ? tr("today", "vandaag") : day === 1 ? tr("tomorrow", "morgen") : DAYS[o.d];
  const where = area >= 0 ? `, ${SPOTS[area][3]}` : "";
  $("#bk-msg").innerHTML = tr(`A table for <em>${who}</em>, <em>${when}</em> at <em>${hm(time)}</em>${where}.`, `Een tafel voor <em>${who}</em>, <em>${when}</em> om <em>${hm(time)}</em>${where}.`)
    + (size === "8" ? `<br><small style="font:400 13px/1.4 var(--sans);opacity:.75">${tr("Groups of 7+: a quick call helps set up the table.", "Groepen van 7+: even bellen helpt om de tafel klaar te zetten.")}</small>` : "");
}
sizeEl.addEventListener("click", e => { const b = e.target.closest("button"); if (b) { size = b.dataset.v; upd(); } });
daysEl.addEventListener("click", e => { const b = e.target.closest("button"); if (b && !b.disabled) { day = +b.dataset.i; upd(); } });
timesEl.addEventListener("click", e => { const b = e.target.closest("button"); if (b) { time = +b.dataset.t; upd(); } });
areasEl.addEventListener("click", e => { const b = e.target.closest("button"); if (b) setSpot(+b.dataset.a, true); });
setSpot(2);

/* ---------- reviews ---------- */
const REVIEWS = [
  ["It was very delicious served in a hot stone bowl.", "KatGdny · Tripadvisor"],
  ["Authentic Korean food and very friendly staff.", "Claes · Tripadvisor"],
  ["…eet je hier in een low key sfeer het beste Koreaanse eten dat je buiten Korea zal proeven.", "Your Little Black Book"],
  ["Best Korean I've ever had", "Flynn L · Tripadvisor"],
  ["A bit like a home away from home, always full of locals.", "travelwise24 · Tripadvisor"]
];
const row = $("#vc-row"); row.innerHTML = REVIEWS.map(([q, c]) => `<figure class="vc"><q>${q}</q><cite>${c}</cite></figure>`).join(""); row.innerHTML += row.innerHTML;

/* ---------- motion ---------- */
if (!window.gsap) return;
gsap.registerPlugin(ScrollTrigger);
const TEST = /[?&]test/.test(location.search);
if (!reduce && !TEST && window.Lenis) {
  const lenis = new Lenis({ lerp: .1, smoothWheel: true });
  lenis.on("scroll", ScrollTrigger.update); gsap.ticker.add(t => lenis.raf(t * 1000)); gsap.ticker.lagSmoothing(0);
  $$('a[href^="#"]').forEach(a => a.addEventListener("click", e => { const id = a.getAttribute("href"); if (id.length > 1 && $(id)) { e.preventDefault(); lenis.scrollTo(id, { offset: id === "#menu" ? 0 : -60, duration: 1.4 }); } }));
}
if (TEST) gsap.ticker.lagSmoothing(0);

// hero: the stone bowl opens out to fill the screen, then the words rise
if (!reduce) {
  const C = MOB() ? "50% 40%" : "62% 52%";
  gsap.fromTo(".hero-img", { clipPath: `circle(${MOB() ? 30 : 17}% at ${C})` }, { clipPath: `circle(150% at ${C})`, duration: 2.1, ease: "expo.inOut", delay: .25 });
  gsap.fromTo(".hero-img img", { scale: 1.32, rotate: -8 }, { scale: 1.02, rotate: 0, duration: 2.8, ease: "expo.inOut", delay: .25 });
  gsap.from(".hero h1 .ln, .hero .eyebrow, .hero-cta", { y: 50, autoAlpha: 0, duration: 1.4, stagger: .1, ease: "expo.out", delay: 1.6 });
  gsap.from(".fact", { y: 20, autoAlpha: 0, duration: 1, stagger: .06, ease: "expo.out", delay: 1.9 });
  gsap.to(".hero-img img", { yPercent: 8, ease: "none", scrollTrigger: { trigger: ".hero", start: "top top", end: "bottom top", scrub: true } });
}
// nav + phone bar
ScrollTrigger.create({ trigger: ".hero", start: "bottom 80px", end: "max", toggleClass: { targets: "#nav", className: "solid" } });
ScrollTrigger.create({ trigger: ".hero", start: "60% top", end: "max", onToggle: s => $("#mbar").classList.toggle("on", s.isActive) });

// signature dishes: a short sideways run on desktop (native swipe on phones)
ScrollTrigger.matchMedia({
  "(min-width: 900px)": () => {
    const trk = $("#sig-track");
    gsap.to(trk, { x: () => -(trk.scrollWidth - innerWidth), ease: "none", scrollTrigger: { trigger: ".sig", start: "top top", end: "bottom bottom", scrub: .6, invalidateOnRefresh: true, onUpdate: s => { $("#sig-prog").style.transform = `scaleX(${s.progress})`; } } });
  }
});
// reveals
$$(".mn-head, .mn-list li, .st-head, .room, .book, .sy-text > *, .vs-info > *, .vs-map").forEach(el => gsap.from(el, { y: 36, autoAlpha: 0, duration: 1.1, ease: "expo.out", scrollTrigger: { trigger: el, start: "top 90%" } }));
$$(".sy-photos figure").forEach((f, i) => gsap.from(f, { y: 80 + i * 30, rotate: i === 1 ? 3 : -2, autoAlpha: 0, duration: 1.4, ease: "expo.out", scrollTrigger: { trigger: ".sy-photos", start: "top 85%" } }));
// steam rising off the hot stone bowl (WebGL, light), bending away from the cursor
(() => {
  const cv = $("#steam"); if (!cv || reduce) return;
  const gl = cv.getContext("webgl", { premultipliedAlpha: true, alpha: true, antialias: false }); if (!gl) return;
  const VS = "attribute vec2 p; void main(){ gl_Position = vec4(p,0.,1.); }";
  const FS = `precision mediump float; uniform vec2 R; uniform float T; uniform vec2 M; uniform float A; uniform vec2 S;
    float h(vec2 p){ return fract(sin(dot(p, vec2(127.1,311.7))) * 43758.5453); }
    float n(vec2 p){ vec2 i = floor(p), f = fract(p); f = f*f*(3.-2.*f); return mix(mix(h(i), h(i+vec2(1,0)), f.x), mix(h(i+vec2(0,1)), h(i+vec2(1,1)), f.x), f.y); }
    float fbm(vec2 p){ float v = 0., a = .5; for (int i = 0; i < 5; i++){ v += a*n(p); p = p*2.03 + 7.1; a *= .5; } return v; }
    void main(){
      vec2 uv = gl_FragCoord.xy / R, asp = vec2(R.x/R.y, 1.);
      vec2 p = uv * asp;
      vec2 m = M * asp, d = p - m; float md = length(d);
      p += normalize(d + 1e-4) * .16 * exp(-md*md*9.);                 // the cursor pushes the steam aside
      float t = T * .16;
      vec2 q = vec2(fbm(p*1.7 + vec2(0., -t*1.6)), fbm(p*1.7 + vec2(4.3, -t*1.3)));
      float s = fbm(p*2.3 + q*2.2 + vec2(t*.2, -t*2.4));
      vec2 src = S * asp; float dx = (p.x - src.x);
      float col = exp(-dx*dx*2.2) * smoothstep(S.y - .25, S.y + .05, uv.y) * (1. - smoothstep(.62, 1.02, uv.y));
      float a = smoothstep(.34, .78, s) * col * A * .9;
      gl_FragColor = vec4(vec3(a), a);
    }`;
  const sh = (t, src) => { const o = gl.createShader(t); gl.shaderSource(o, src); gl.compileShader(o); return o; };
  const pr = gl.createProgram(); gl.attachShader(pr, sh(gl.VERTEX_SHADER, VS)); gl.attachShader(pr, sh(gl.FRAGMENT_SHADER, FS)); gl.linkProgram(pr);
  if (!gl.getProgramParameter(pr, gl.LINK_STATUS)) return;
  gl.useProgram(pr);
  const b = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, b); gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
  const loc = gl.getAttribLocation(pr, "p"); gl.enableVertexAttribArray(loc); gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
  const U = k => gl.getUniformLocation(pr, k), uR = U("R"), uT = U("T"), uM = U("M"), uA = U("A"), uS = U("S");
  const scale = MOB() ? .35 : .5;
  function size() { cv.width = Math.round(cv.clientWidth * scale); cv.height = Math.round(cv.clientHeight * scale); gl.viewport(0, 0, cv.width, cv.height); }
  size(); addEventListener("resize", size);
  let mx = -1, my = -1, tx = -1, ty = -1;
  addEventListener("pointermove", e => { const r = cv.getBoundingClientRect(); tx = (e.clientX - r.left) / r.width; ty = 1 - (e.clientY - r.top) / r.height; }, { passive: true });
  let on = true, amt = 0, t0s = performance.now();
  new IntersectionObserver(es => { on = es[0].isIntersecting; }).observe(cv);
  (function loop() {
    requestAnimationFrame(loop); if (!on) return;
    const t = (performance.now() - t0s) / 1000; amt = Math.min(1, Math.max(0, (t - 1.2) / 2));
    mx += (tx - mx) * .08; my += (ty - my) * .08;
    gl.uniform2f(uR, cv.width, cv.height); gl.uniform1f(uT, t); gl.uniform2f(uM, mx, my); gl.uniform1f(uA, amt);
    gl.uniform2f(uS, MOB() ? .5 : .62, MOB() ? .42 : .35);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
  })();
})();
window.__ready = true;
})();
