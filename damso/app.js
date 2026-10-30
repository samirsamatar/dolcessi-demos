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

/* ---------- pick your seat ---------- */
const SPOTS = [
  [tr("Tables along the wall", "Tafels langs de muur"), tr("Tables for two to four. Good for a quiet dinner.", "Tafels voor twee tot vier. Fijn voor een rustig diner.")],
  [tr("The middle of the room", "Midden in de zaal"), tr("Where the room gets lively. Good for groups.", "Waar het gezellig druk wordt. Fijn voor groepen.")],
  [tr("The yellow booth", "De gele bank"), tr("Bench seating along the wall, the comfiest seats in the room.", "Bankjes langs de muur, de lekkerste plekken in de zaal.")]
];
const card = $("#spot-card"), spots = $$(".spot");
function setSpot(k) { spots.forEach((s, i) => s.classList.toggle("on", i === k)); $("b", card).textContent = SPOTS[k][0]; $("span", card).textContent = SPOTS[k][1]; if (window.gsap && !reduce) gsap.fromTo(card, { y: 10, autoAlpha: .4 }, { y: 0, autoAlpha: 1, duration: .5, ease: "expo.out" }); }
spots.forEach((s, i) => { s.addEventListener("click", () => setSpot(i)); s.addEventListener("mouseenter", () => setSpot(i)); });
setSpot(2);

// booking helper: party size + day → the right message and a call button
const daysEl = $("#days"), sizeEl = $("#size");
const t0 = now(); const opts = [];
for (let k = 0; k < 7; k++) { const d = (t0.d + k) % 7; opts.push({ d, label: k === 0 ? tr("Today", "Vandaag") : k === 1 ? tr("Tomorrow", "Morgen") : SHORT[d] }); }
daysEl.innerHTML = opts.map((o, i) => `<button type="button" data-i="${i}"${OPEN[o.d] ? "" : " disabled"}>${o.label}</button>`).join("");
let size = "2", day = opts.findIndex(o => OPEN[o.d]);
function upd() {
  $$("button", sizeEl).forEach(b => b.classList.toggle("on", b.dataset.v === size));
  $$("button", daysEl).forEach(b => b.classList.toggle("on", +b.dataset.i === day));
  const o = opts[day], who = { 2: tr("1–2 people", "1–2 personen"), 4: tr("3–4 people", "3–4 personen"), 6: tr("5–6 people", "5–6 personen"), 8: tr("7 or more", "7 of meer") }[size];
  const when = day === 0 ? tr("today", "vandaag") : day === 1 ? tr("tomorrow", "morgen") : DAYS[o.d];
  $("#bk-msg").textContent = size === "8"
    ? tr(`A group of 7 or more, ${when}: call ahead so a table can be set up. Open 17:30–22:00.`, `Een groep van 7 of meer, ${when}: bel even vooraf, dan kan er een tafel klaargezet worden. Open 17:30–22:00.`)
    : tr(`A table for ${who}, ${when}. Open 17:30–22:00.`, `Een tafel voor ${who}, ${when}. Open 17:30–22:00.`);
}
sizeEl.addEventListener("click", e => { const b = e.target.closest("button"); if (b) { size = b.dataset.v; upd(); } });
daysEl.addEventListener("click", e => { const b = e.target.closest("button"); if (b && !b.disabled) { day = +b.dataset.i; upd(); } });
upd();

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

// hero: the photo settles in, the lines rise
if (!reduce) {
  gsap.fromTo(".hero-img img", { scale: 1.14 }, { scale: 1.02, duration: 2.4, ease: "expo.out" });
  gsap.from(".hero h1 .ln, .hero .eyebrow, .hero-cta", { y: 40, autoAlpha: 0, duration: 1.3, stagger: .1, ease: "expo.out", delay: .15 });
  gsap.from(".fact", { y: 20, autoAlpha: 0, duration: 1, stagger: .06, ease: "expo.out", delay: .5 });
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
window.__ready = true;
})();
