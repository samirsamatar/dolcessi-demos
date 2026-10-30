/* Damso 담소 · concept site by Dolcessi */
(() => {
const $ = (s, c = document) => c.querySelector(s), $$ = (s, c = document) => [...c.querySelectorAll(s)];
const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
const MOB = () => innerWidth < 900;
const TZ = "Europe/Amsterdam";
const TEST = /[?&]test/.test(location.search);

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
const OPEN = [[1050, 1320], null, [1050, 1320], [1050, 1320], [1050, 1320], [1050, 1320], [1050, 1320]];
const hm = m => `${String(Math.floor(m / 60)).padStart(2, "0")}:${String(m % 60).padStart(2, "0")}`;
function now() {
  const p = new Intl.DateTimeFormat("en-GB", { weekday: "short", hour: "2-digit", minute: "2-digit", hour12: false, timeZone: TZ }).formatToParts(new Date());
  const g = k => p.find(x => x.type === k).value;
  return { d: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].indexOf(g("weekday")), m: (+g("hour") % 24) * 60 + +g("minute") };
}
function status() {
  const { d, m } = now(), o = OPEN[d];
  if (o && m >= o[0] && m < o[1]) return { open: true, big: tr("Open tonight", "Vanavond open"), sub: tr(`Kitchen until ${hm(o[1])}`, `Keuken tot ${hm(o[1])}`), line: tr(`Open now · until ${hm(o[1])}`, `Nu open · tot ${hm(o[1])}`) };
  if (o && m < o[0]) return { open: false, big: tr(`Tonight from ${hm(o[0])}`, `Vanavond vanaf ${hm(o[0])}`), sub: tr(`Until ${hm(o[1])}`, `Tot ${hm(o[1])}`), line: tr(`Opens today at ${hm(o[0])}`, `Vandaag open vanaf ${hm(o[0])}`) };
  let nd = (d + 1) % 7; while (!OPEN[nd]) nd = (nd + 1) % 7;
  const when = nd === (d + 1) % 7 ? tr("tomorrow", "morgen") : DAYS[nd].toLowerCase();
  return { open: false, big: tr("Closed now", "Nu gesloten"), sub: tr(`Opens ${when} at ${hm(OPEN[nd][0])}`, `Open ${when} om ${hm(OPEN[nd][0])}`), line: tr(`Closed · opens ${when} at ${hm(OPEN[nd][0])}`, `Gesloten · ${when} open vanaf ${hm(OPEN[nd][0])}`) };
}
function renderHours() {
  const s = status(), { d } = now();
  $("#now").textContent = s.big; $("#now-sub").textContent = s.sub; $("#dot").classList.toggle("off", !s.open);
  $(".status span").textContent = s.line; $(".status i").classList.toggle("off", !s.open);
  $("#hours").innerHTML = DAYS.map((n, i) => `<li${i === d ? ' class="today"' : ""}><span>${n}</span><span>${OPEN[i] ? `${hm(OPEN[i][0])} – ${hm(OPEN[i][1])}` : tr("Closed", "Gesloten")}</span></li>`).join("");
}
renderHours(); setInterval(renderHours, 60000);

/* ---------- the table: eight dishes (guest photos, graded) ---------- */
const MAIN = tr("Main", "Hoofdgerecht"), START = tr("Starter", "Voorgerecht"), SIDE = tr("On the side", "Erbij");
const DISHES = [
  ["d1", "돌솥비빔밥", "Dolsot bibimbap", MAIN, "", ["Rice, vegetables, beef and an egg yolk in a stone bowl hot enough to crisp the rice. Mix it at the table.", "Rijst, groenten, rundvlees en een eidooier in een stenen kom die zo heet is dat de rijst knapperig wordt. Aan tafel mengen."]],
  ["d2", "해물파전", "Haemul pajeon", START, "€15 / €19", ["A pancake of spring onion and seafood, crisp at the edges. Small or large, for the table.", "Pannenkoek met lente-ui en zeevruchten, knapperig aan de randen. Klein of groot, voor de tafel."]],
  ["d3", "닭강정", "Dak gangjeong", START, tr("from €12", "vanaf €12"), ["Fried chicken drumsticks, glazed in honey sauce with sesame oil.", "Gefrituurde kippenboutjes, geglaceerd in honingsaus met sesamolie."]],
  ["d4", "육회", "Yukhoe", START, "€15", ["Korean beef tartare, finely cut, with pear and a raw egg yolk.", "Koreaanse rundertartaar, fijn gesneden, met peer en een rauwe eidooier."]],
  ["d5", "잡채", "Japchae", MAIN, "", ["Glass noodles stir-fried with vegetables, glossy with sesame.", "Glasnoedels geroerbakt met groenten, glanzend van de sesam."]],
  ["d6", "짜장면", "Jjajangmyeon", MAIN, "", ["Wheat noodles under a rich black bean sauce.", "Tarwenoedels onder een rijke zwarte-bonensaus."]],
  ["d7", "치킨", tr("Korean fried chicken", "Koreaanse kip"), START, "", ["Crisp-fried and piled high, made for sharing.", "Krokant gefrituurd en hoog opgestapeld, om te delen."]],
  ["d8", "반찬", "Banchan", SIDE, "", ["The little side dishes that come to the table first: kimchi, bean sprouts and more.", "De kleine bijgerechtjes die als eerste op tafel komen: kimchi, taugé en meer."]]
];
const N = DISHES.length, pad = i => String(i + 1).padStart(2, "0");
const split = s => s.split(" ").map(w => `<span class="w"><span>${w}</span></span>`).join(" ");
$(".cat").style.setProperty("--n", N);
$("#cat-n").textContent = pad(N - 1);
$("#cat-text").innerHTML = DISHES.map(([, kr, name, kind, pr, d], i) => `<article class="ct${i ? "" : " on"}" aria-hidden="${i ? "true" : "false"}"><p class="ct-kind"><span>${kind}</span><span class="kr">${kr}</span></p><h3>${split(name)}</h3><p>${NL ? d[1] : d[0]}</p>${pr ? `<p class="pr">${pr}</p>` : ""}</article>`).join("");
$("#cat-frame").innerHTML = DISHES.map(([img, , name], i) => `<div class="cf${i ? "" : " first"}"><img src="img/g/${img}.jpg" alt="${name} at Damso" ${i > 1 ? 'loading="lazy"' : ""}></div>`).join("") + `<p class="cf-kr" id="cf-kr" aria-hidden="true">${DISHES[0][1]}</p>`;
$("#cat-index").innerHTML = DISHES.map(([, , name], i) => `<li${i ? "" : ' class="on"'}><button type="button" data-i="${i}"><small>${pad(i)}</small>${name}</button></li>`).join("");
$("#cat-ticks").innerHTML = DISHES.map((_, i) => `<i${i ? "" : ' class="on"'}></i>`).join("");

/* ---------- starters with prices (Damso's current menu) ---------- */
const STARTERS = [
  ["치킨만두", "Chicken mandu", false, ["Fried dumplings with chicken", "Gefrituurde dumplings met kip"], "<small>8</small>€12<br><small>12</small>€16<br><small>20</small>€24"],
  ["야채만두", "Yachae mandu", true, ["Fried dumplings with vegetables", "Gefrituurde dumplings met groente"], "<small>8</small>€12<br><small>12</small>€16<br><small>20</small>€24"],
  ["새우튀김", "Saeu twigim", false, ["Fried prawns with house-made sauce, four pieces", "Gefrituurde garnalen met huisgemaakte saus, vier stuks"], "€10"],
  ["닭강정", "Dak gangjeong", false, ["Fried drumsticks in honey sauce with sesame oil", "Kippenboutjes in honingsaus met sesamolie"], "<small>8</small>€12<br><small>12</small>€16<br><small>20</small>€23"],
  ["해물파전", "Haemul pajeon", false, ["Savoury pancake with spring onion and seafood", "Hartige pannenkoek met lente-ui en zeevruchten"], tr("<small>S</small>€15<br><small>L</small>€19", "<small>K</small>€15<br><small>G</small>€19")],
  ["김치전", "Kimchi jeon", true, ["Traditional kimchi pancake", "Traditionele kimchi-pannenkoek"], tr("<small>S</small>€15<br><small>L</small>€19", "<small>K</small>€15<br><small>G</small>€19")],
  ["게살전", "Gesal jeon", false, ["Crab pancakes, three pieces", "Krabpannenkoekjes, drie stuks"], "€12"],
  ["육회", "Yukhoe", false, ["Beef tartare with pear and raw egg yolk", "Rundertartaar met peer en rauwe eidooier"], "€15"]
];
$("#mn-list").innerHTML = STARTERS.map(([kr, n, v, d, p]) => `<li><b>${n}${v ? "<small>V</small>" : ""}</b><span class="pr">${p}</span><span class="kr">${kr}</span><span class="d">${NL ? d[1] : d[0]}</span></li>`).join("");

/* ---------- reserve: the room (four real zones), guests, date, time ---------- */
const SPOTS = [
  [tr("The long wall", "De lange muur"), tr("A row of tables along the left wall, from two seats up.", "Een rij tafels langs de linkermuur, vanaf twee personen."), tr("Long wall", "Lange muur"), tr("along the long wall", "langs de lange muur")],
  [tr("By the counter", "Bij de bar"), tr("At the back of the room, close to the counter and the open kitchen.", "Achterin de zaal, dicht bij de bar en de keuken."), tr("By the counter", "Bij de bar"), tr("by the counter", "bij de bar")],
  [tr("The yellow booth", "De gele bank"), tr("Upholstered bench seating along the right wall. The comfiest seats in the room.", "Gestoffeerde bank langs de rechtermuur. De lekkerste plekken van de zaal."), tr("Yellow booth", "Gele bank"), tr("in the yellow booth", "op de gele bank")],
  [tr("Up front", "Voorin"), tr("Wooden tables at the front of the room, under the arc lamps.", "Houten tafels voorin de zaal, onder de booglampen."), tr("Up front", "Voorin"), tr("up front", "voorin")]
];
const card = $("#spot-card"), spots = $$(".spot");
const daysEl = $("#days"), sizeEl = $("#size"), timesEl = $("#times"), areasEl = $("#areas");
const t0 = now(), opts = [];
const fmt = (k, o) => new Intl.DateTimeFormat(NL ? "nl-NL" : "en-GB", Object.assign({ timeZone: TZ }, o)).format(new Date(Date.now() + k * 864e5));
for (let k = 0; k < 7; k++) opts.push({ k, d: (t0.d + k) % 7, wd: k === 0 ? tr("Today", "Vandaag") : fmt(k, { weekday: "short" }).replace(".", ""), n: fmt(k, { day: "numeric" }), long: fmt(k, { weekday: "long", day: "numeric", month: "long" }) });
const SLOTS = []; for (let m = 1050; m <= 1290; m += 30) SLOTS.push(m);   // 17:30 … 21:30
const slotsFor = o => o.k === 0 ? SLOTS.filter(m => m >= t0.m + 30) : SLOTS;
sizeEl.innerHTML = [1, 2, 3, 4, 5, 6, 7, 8].map(n => `<button type="button" data-v="${n}" aria-label="${n}${n === 8 ? "+" : ""} ${tr("guests", "gasten")}">${n === 8 ? "8+" : n}</button>`).join("");
daysEl.innerHTML = opts.map((o, i) => `<button type="button" data-i="${i}"${OPEN[o.d] && slotsFor(o).length ? "" : " disabled"}><small>${o.wd}</small><b>${o.n}</b></button>`).join("");
areasEl.innerHTML = SPOTS.map((sp, i) => `<button type="button" data-a="${i}">${sp[2]}</button>`).join("") + `<button type="button" data-a="-1">${tr("No preference", "Maakt niet uit")}</button>`;
let size = 2, day = opts.findIndex(o => OPEN[o.d] && slotsFor(o).length), time = null, area = 2;
function setSpot(k, anim) {
  area = k;
  spots.forEach((s, i) => s.classList.toggle("on", i === k));
  const sp = SPOTS[k >= 0 ? k : 2];
  card.style.opacity = k >= 0 ? "" : ".55";
  $("small", card).textContent = k >= 0 ? `${pad(k)} / ${pad(SPOTS.length - 1)}` : tr("No preference", "Geen voorkeur");
  $("b", card).textContent = k >= 0 ? sp[0] : tr("Anywhere is fine", "Overal goed");
  $("span", card).textContent = k >= 0 ? sp[1] : tr("We'll seat you wherever there's room.", "Je krijgt een plek waar ruimte is.");
  if (anim && window.gsap && !reduce) gsap.fromTo(card.children, { y: 12, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: .6, stagger: .05, ease: "expo.out" });
  upd();
}
spots.forEach((s, i) => { s.setAttribute("aria-label", SPOTS[i][0]); s.addEventListener("click", () => setSpot(i, true)); s.addEventListener("mouseenter", () => { if (area !== i) setSpot(i, true); }); });
function upd() {
  if (day < 0) day = 0;
  const o = opts[day], sl = slotsFor(o);
  if (!sl.includes(time)) time = sl.includes(1140) ? 1140 : sl[0];
  timesEl.innerHTML = sl.map(m => `<button type="button" data-t="${m}"${m === time ? ' class="on"' : ""}>${hm(m)}</button>`).join("");
  $$("button", sizeEl).forEach(b => b.classList.toggle("on", +b.dataset.v === size));
  $$("button", daysEl).forEach(b => b.classList.toggle("on", +b.dataset.i === day));
  $$("button", areasEl).forEach(b => b.classList.toggle("on", +b.dataset.a === area));
  const when = day === 0 ? tr("Tonight", "Vanavond") : o.long.charAt(0).toUpperCase() + o.long.slice(1);
  const who = size === 8 ? tr("8 or more", "8 of meer") : size === 1 ? tr("one", "één") : String(size);
  const where = area >= 0 ? `, ${SPOTS[area][3]}` : "";
  $("#bk-msg").innerHTML = tr(`<span>${when}</span> at <span>${hm(time)}</span>, a table for <span>${who}</span>${where}.`, `<span>${when}</span> om <span>${hm(time)}</span>, een tafel voor <span>${who}</span>${where}.`)
    + (size === 8 ? `<small>${tr("For eight or more, a quick call helps the team set up the table.", "Voor acht of meer helpt een belletje om de tafel klaar te zetten.")}</small>` : "");
}
sizeEl.addEventListener("click", e => { const b = e.target.closest("button"); if (b) { size = +b.dataset.v; upd(); } });
daysEl.addEventListener("click", e => { const b = e.target.closest("button"); if (b && !b.disabled) { day = +b.dataset.i; upd(); } });
timesEl.addEventListener("click", e => { const b = e.target.closest("button"); if (b) { time = +b.dataset.t; upd(); } });
areasEl.addEventListener("click", e => { const b = e.target.closest("button"); if (b) setSpot(+b.dataset.a, true); });
setSpot(2);

/* ---------- voices ---------- */
const REVIEWS = [
  ["It was very delicious, served in a hot stone bowl.", "KatGdny · Tripadvisor"],
  ["Authentic Korean food and very friendly staff.", "Claes · Tripadvisor"],
  ["Het beste Koreaanse eten dat je buiten Korea zal proeven.", "Your Little Black Book"],
  ["Best Korean I've ever had.", "Flynn L · Tripadvisor"],
  ["A bit like a home away from home.", "travelwise24 · Tripadvisor"]
];
$("#vc").innerHTML = REVIEWS.map(([q, c]) => `<figure class="vq"><q>${q}</q><cite>${c}</cite></figure>`).join("");

/* ---------- motion ---------- */
const vqs = $$(".vq");
if (!window.gsap) { $$(".ct, .cf").forEach(e => e.style.cssText = "visibility:visible;clip-path:none;position:relative;transform:none"); vqs[0].style.cssText = "opacity:1;visibility:visible"; return; }
gsap.registerPlugin(ScrollTrigger);
let lenis = null;
if (!reduce && !TEST && window.Lenis) {
  lenis = new Lenis({ lerp: .1, smoothWheel: true });
  lenis.on("scroll", ScrollTrigger.update); gsap.ticker.add(t => lenis.raf(t * 1000)); gsap.ticker.lagSmoothing(0);
}
if (TEST) gsap.ticker.lagSmoothing(0);
const goTo = y => lenis ? lenis.scrollTo(y, { duration: 1.2 }) : scrollTo({ top: y, behavior: reduce ? "auto" : "smooth" });
$$('a[href^="#"]').forEach(a => a.addEventListener("click", e => { const id = a.getAttribute("href"); const el = id.length > 1 && $(id); if (!el) return; e.preventDefault(); goTo(id === "#top" ? 0 : el.getBoundingClientRect().top + scrollY - (id === "#table" || id === "#story" ? 0 : 40)); }));

// hero: the stone bowl opens out to fill the screen, then the words rise
if (!reduce) {
  const C = MOB() ? "50% 42%" : "56% 50%";
  gsap.fromTo(".hero-img", { clipPath: `circle(${MOB() ? 28 : 16}% at ${C})` }, { clipPath: `circle(150% at ${C})`, duration: 2.1, ease: "expo.inOut", delay: .2 });
  gsap.fromTo(".hero-img img", { scale: 1.35, rotate: -7 }, { scale: 1.04, rotate: 0, duration: 2.8, ease: "expo.inOut", delay: .2 });
  gsap.from(".hero h1 .ln > *", { yPercent: 110, duration: 1.5, stagger: .12, ease: "expo.out", delay: 1.55 });
  gsap.from(".hero-in .lbl, .hero-side .hs-row, .nav", { y: 20, autoAlpha: 0, duration: 1.2, stagger: .07, ease: "expo.out", delay: 1.85 });
  gsap.to(".hero-img img", { yPercent: 7, ease: "none", scrollTrigger: { trigger: ".hero", start: "top top", end: "bottom top", scrub: true } });
}
ScrollTrigger.create({ trigger: ".hero", start: "bottom 80px", end: "max", toggleClass: { targets: "#nav", className: "solid" } });
ScrollTrigger.create({ trigger: ".hero", start: "60% top", end: "max", onToggle: s => $("#mbar").classList.toggle("on", s.isActive) });

// the sentence fills in as you read it
const it = $("#intro-t"); it.innerHTML = it.textContent.split(" ").map(w => `<span class="w">${w}</span>`).join(" ");
gsap.to($$(".w", it), { opacity: 1, stagger: .08, ease: "none", scrollTrigger: { trigger: it, start: "top 78%", end: "bottom 45%", scrub: true } });

// ===== the table: one dish at a time, like turning pages
const cts = $$(".ct"), cfs = $$(".cf"), lis = $$("#cat-index li"), ticks = $$("#cat-ticks i"), cat = $(".cat");
let cur = 0, z = 1;
gsap.set(cfs[0], { zIndex: 1 });
function show(i) {
  if (i === cur) return;
  const prev = cur, dir = i > prev ? 1 : -1; cur = i;
  // photo: the new one wipes in over the old
  const f = cfs[i], im = $("img", f); gsap.killTweensOf([f, im]);
  gsap.set(f, { zIndex: ++z });
  gsap.fromTo(f, { clipPath: dir > 0 ? "inset(100% 0% 0% 0%)" : "inset(0% 0% 100% 0%)" }, { clipPath: "inset(0% 0% 0% 0%)", duration: 1.1, ease: "expo.inOut" });
  gsap.fromTo(im, { scale: 1.28, yPercent: 6 * dir }, { scale: 1, yPercent: 0, duration: 1.5, ease: "expo.out" });
  gsap.to($("img", cfs[prev]), { scale: 1.06, yPercent: -4 * dir, duration: 1.1, ease: "expo.inOut" });
  // words: the old name slides out, the new one rises in
  const o = cts[prev], n = cts[i];
  gsap.killTweensOf([$$(".w > span", o), $$(".w > span", n), $$(".ct-kind, p", o), $$(".ct-kind, p", n)]);
  gsap.to($$(".w > span", o), { yPercent: -110 * dir, duration: .5, stagger: .03, ease: "power3.in" });
  gsap.to($$(".ct-kind, p", o), { y: -14 * dir, autoAlpha: 0, duration: .4, ease: "power2.in", onComplete: () => { o.classList.remove("on"); o.setAttribute("aria-hidden", "true"); } });
  n.classList.add("on"); n.setAttribute("aria-hidden", "false");
  gsap.fromTo($$(".w > span", n), { yPercent: 110 * dir }, { yPercent: 0, duration: 1.1, stagger: .06, ease: "expo.out", delay: .32 });
  gsap.fromTo($$(".ct-kind, p", n), { y: 16 * dir, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: .9, stagger: .06, ease: "expo.out", delay: .45 });
  // counter, index, ticks, the vertical hangul
  const b = $("#cat-i"); gsap.fromTo(b, { yPercent: 60 * dir, autoAlpha: 0 }, { yPercent: 0, autoAlpha: 1, duration: .6, ease: "expo.out", onStart: () => { b.textContent = pad(i); } });
  lis.forEach((l, k) => l.classList.toggle("on", k === i));
  ticks.forEach((t, k) => t.classList.toggle("on", k <= i));
  const kr = $("#cf-kr"); gsap.to(kr, { autoAlpha: 0, duration: .25, onComplete: () => { kr.textContent = DISHES[i][1]; gsap.to(kr, { autoAlpha: 1, duration: .6, delay: .3 }); } });
}
gsap.set($$(".ct:not(.on) .ct-kind, .ct:not(.on) p"), { autoAlpha: 0 });
gsap.set($$(".ct:not(.on) .w > span"), { yPercent: 110 });
const catST = ScrollTrigger.create({ trigger: cat, start: "top top", end: "bottom bottom", onUpdate: s => show(Math.min(N - 1, Math.floor(s.progress * N * .999))), onToggle: s => document.body.classList.toggle("in-cat", s.isActive) });
const jump = i => goTo(catST.start + (i + .5) / N * (catST.end - catST.start));
$("#cat-index").addEventListener("click", e => { const b = e.target.closest("button"); if (b) jump(+b.dataset.i); });
$("#cat-prev").addEventListener("click", () => cur > 0 ? jump(cur - 1) : goTo(catST.start - innerHeight * .8));
$("#cat-next").addEventListener("click", () => cur < N - 1 ? jump(cur + 1) : goTo(catST.end + 10));
gsap.from(".cat-top, .cat-index, .cat-ctl", { autoAlpha: 0, y: 20, duration: 1, stagger: .08, ease: "expo.out", scrollTrigger: { trigger: cat, start: "top 40%" } });
gsap.from("#cf-kr", { autoAlpha: 0, duration: 1, delay: .6, scrollTrigger: { trigger: cat, start: "top 55%" } });
gsap.from(cfs[0], { clipPath: "inset(100% 0% 0% 0%)", duration: 1.3, ease: "expo.inOut", scrollTrigger: { trigger: cat, start: "top 55%" } });

// ===== story: a short sideways film strip
const sy = $(".story"), trk = $("#sy-track");
const dist = () => Math.max(0, trk.scrollWidth - innerWidth);
const setH = () => { sy.style.height = `${dist() + innerHeight}px`; };
setH(); ScrollTrigger.addEventListener("refreshInit", setH);
const strip = gsap.to(trk, { x: () => -dist(), ease: "none", scrollTrigger: { trigger: sy, start: "top top", end: "bottom bottom", scrub: .5, invalidateOnRefresh: true, onUpdate: s => { $("#sy-prog").style.transform = `scaleX(${s.progress})`; } } });
$$(".sy-f img").forEach(im => gsap.fromTo(im, { xPercent: 6 }, { xPercent: -6, ease: "none", scrollTrigger: { trigger: im.closest(".sy-f"), containerAnimation: strip, start: "left right", end: "right left", scrub: true } }));
gsap.from(".yr", { y: 60, autoAlpha: 0, duration: 1.4, ease: "expo.out", scrollTrigger: { trigger: ".sy-year", containerAnimation: strip, start: "left 80%" } });

// reveals
$$(".mn-head > *, .rs-head > *, .vs-info > *, .book, .voices .lbl, .vc-meta").forEach(el => gsap.from(el, { y: 34, autoAlpha: 0, duration: 1.2, ease: "expo.out", scrollTrigger: { trigger: el, start: "top 90%" } }));
gsap.from(".mn-list li", { y: 30, autoAlpha: 0, duration: 1.1, stagger: .06, ease: "expo.out", scrollTrigger: { trigger: ".mn-list", start: "top 85%" } });
$$(".room, .vs-map").forEach(el => gsap.from(el, { clipPath: "inset(0% 0% 100% 0%)", duration: 1.5, ease: "expo.inOut", scrollTrigger: { trigger: el, start: "top 85%" } }));
gsap.from(".room img", { scale: 1.2, duration: 2, ease: "expo.out", scrollTrigger: { trigger: ".room", start: "top 85%" } });
gsap.from(".spot", { scale: 0, autoAlpha: 0, duration: .8, stagger: .1, ease: "back.out(2)", delay: .8, scrollTrigger: { trigger: ".room", start: "top 85%" } });
gsap.from(".ft-kr", { yPercent: 30, autoAlpha: 0, duration: 1.6, ease: "expo.out", scrollTrigger: { trigger: ".foot", start: "top 90%" } });

// voices: one at a time
let vi = 0; gsap.set(vqs[0], { autoAlpha: 1 });
setInterval(() => { if (document.hidden) return; const a = vqs[vi]; vi = (vi + 1) % vqs.length; const b = vqs[vi];
  gsap.to(a, { autoAlpha: 0, y: -20, duration: .8, ease: "power2.in" }); gsap.fromTo(b, { autoAlpha: 0, y: 24 }, { autoAlpha: 1, y: 0, duration: 1.2, delay: .7, ease: "expo.out" }); }, 5600);

addEventListener("load", () => ScrollTrigger.refresh());

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
      p += normalize(d + 1e-4) * .16 * exp(-md*md*9.);
      float t = T * .16;
      vec2 q = vec2(fbm(p*1.7 + vec2(0., -t*1.6)), fbm(p*1.7 + vec2(4.3, -t*1.3)));
      float s = fbm(p*2.3 + q*2.2 + vec2(t*.2, -t*2.4));
      vec2 src = S * asp; float dx = (p.x - src.x);
      float col = exp(-dx*dx*2.2) * smoothstep(S.y - .25, S.y + .05, uv.y) * (1. - smoothstep(.62, 1.02, uv.y));
      float a = smoothstep(.34, .78, s) * col * A * .8;
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
  let on = true, amt = 0; const ts = performance.now();
  new IntersectionObserver(es => { on = es[0].isIntersecting; }).observe(cv);
  (function loop() {
    requestAnimationFrame(loop); if (!on) return;
    const t = (performance.now() - ts) / 1000; amt = Math.min(1, Math.max(0, (t - 1.4) / 2));
    mx += (tx - mx) * .08; my += (ty - my) * .08;
    gl.uniform2f(uR, cv.width, cv.height); gl.uniform1f(uT, t); gl.uniform2f(uM, mx, my); gl.uniform1f(uA, amt);
    gl.uniform2f(uS, MOB() ? .5 : .56, MOB() ? .42 : .35);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
  })();
})();
window.__ready = true;
})();
