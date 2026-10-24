/* Damso 담소 · concept site by Dolcessi */
import { createWorld } from "./world.js?v=2";
const $ = (s, c = document) => c.querySelector(s), $$ = (s, c = document) => [...c.querySelectorAll(s)];
const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const lerp = (a, b, t) => a + (b - a) * t;
const ss = (a, b, v) => { const t = clamp((v - a) / (b - a)); return t * t * (3 - 2 * t); };
const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
const TZ = "Europe/Amsterdam";

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

/* ---------- reviews (verbatim, public sources) ---------- */
const REVIEWS = [
  { q: "This small restaurant in Amstelveen is a bit like a home away from home, always full of locals (ie Korean guests), which is always a good sign.", who: "travelwise24", src: "Tripadvisor" },
  { q: "It was very delicious served in a hot stone bowl.", who: "KatGdny", src: "Tripadvisor" },
  { q: "Authentic Korean food and very friendly staff.", who: "Claes", src: "Tripadvisor" },
  { q: "…eet je hier in een low key sfeer het beste Koreaanse eten dat je buiten Korea zal proeven.", who: "Your Little Black Book", src: "NL" },
  { q: "Best Korean I've ever had", who: "Flynn L", src: "Tripadvisor" }
];
$("#vc-list").innerHTML = REVIEWS.map(r => `<figure class="vc"><q>${r.q}</q><cite>${r.who} · ${r.src}</cite></figure>`).join("");

/* ---------- opening hours (Google listing): Wed–Mon 17:30–22:00, Tue closed ---------- */
const DAYS = NL ? ["Maandag", "Dinsdag", "Woensdag", "Donderdag", "Vrijdag", "Zaterdag", "Zondag"] : ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
const OPEN = [[1050, 1320], null, [1050, 1320], [1050, 1320], [1050, 1320], [1050, 1320], [1050, 1320]];
const hm = m => `${String(Math.floor(m / 60)).padStart(2, "0")}:${String(m % 60).padStart(2, "0")}`;
function amsNow() {
  const p = new Intl.DateTimeFormat("en-GB", { weekday: "short", hour: "2-digit", minute: "2-digit", hour12: false, timeZone: TZ }).formatToParts(new Date());
  const g = k => p.find(x => x.type === k).value;
  return { d: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].indexOf(g("weekday")), m: (+g("hour") % 24) * 60 + +g("minute") };
}
function status() {
  const { d, m } = amsNow(), o = OPEN[d];
  if (o && m >= o[0] && m < o[1]) return { open: true, text: tr(`Open now · until ${hm(o[1])}`, `Nu open · tot ${hm(o[1])}`), short: tr("Open now", "Nu open") };
  if (o && m < o[0]) return { open: false, text: tr(`Closed · opens today at ${hm(o[0])}`, `Gesloten · vandaag open vanaf ${hm(o[0])}`), short: tr(`Opens ${hm(o[0])}`, `Open vanaf ${hm(o[0])}`) };
  let nd = (d + 1) % 7; while (!OPEN[nd]) nd = (nd + 1) % 7;
  const when = nd === (d + 1) % 7 ? tr("tomorrow", "morgen") : (NL ? DAYS[nd].toLowerCase() : DAYS[nd]);
  return { open: false, text: tr(`Closed · opens ${when} at ${hm(OPEN[nd][0])}`, `Gesloten · ${when} open vanaf ${hm(OPEN[nd][0])}`), short: tr("Closed now", "Nu gesloten") };
}
function renderHours() {
  const { d } = amsNow(), s = status(), ul = $("#hours");
  $(".status span").textContent = s.text; $(".status i").classList.toggle("off", !s.open);
  $("#nav-open").textContent = s.short; $("#nav-dot").classList.toggle("off", !s.open);
  ul.textContent = "";
  DAYS.forEach((name, i) => {
    const li = document.createElement("li"); if (i === d) li.className = "today";
    const a = document.createElement("span"); a.textContent = name;
    const b = document.createElement("span"); const o = OPEN[i];
    if (o) b.textContent = `${hm(o[0])} – ${hm(o[1])}`; else { b.textContent = tr("Closed", "Gesloten"); b.className = "closed"; }
    li.append(a, b); ul.appendChild(li);
  });
}
renderHours(); setInterval(renderHours, 60000);

/* ---------- world ---------- */
const canvas = $("#world");
const MOB = () => innerWidth < 900;
const lite = MOB() || (navigator.hardwareConcurrency || 8) <= 4;
const world = await createWorld(canvas, { maxDpr: MOB() ? 1.6 : 1.4, lite });
const st = world.st;
addEventListener("resize", () => { world.resize(); ScrollTrigger.refresh(); });

const prog = { hero: 0, mix: 0, table: 0 };
const obang = $$(".obang li");
// which colour lights up with which ingredient: greens 청, carrot 황, sprouts 백, mushroom 흑, gochujang 적
const LIGHT = [0, 1, 2, 3];

function choreograph(t) {
  const m = MOB(), h = prog.hero, x = prog.mix, tt = prog.table;
  // 01 · the bowl builds: five toppings fall into their wedges, then gochujang, egg, sesame
  for (let k = 0; k < 5; k++) st.drop[k] = ss(.06 + k * .1, .06 + k * .1 + .2, h);
  st.gochu = ss(.6, .72, h); st.egg = ss(.7, .84, h); st.seeds = ss(.82, .95, h);
  st.sizzle = st.egg;
  obang.forEach((li, i) => li.classList.toggle("on", i < 4 ? st.drop[LIGHT[i]] > .5 : st.gochu > .5));
  // camera: low three-quarter view that rises as the bowl fills
  const camH0 = m ? 6.2 : 4.4, camR0 = m ? 9.4 : 8.6;
  let camH = lerp(camH0, m ? 7.6 : 6.4, ss(0, 1, h)), camR = lerp(camR0, m ? 8.2 : 7.6, ss(0, 1, h)), look = lerp(.3, .55, h);
  let bx = 0, by = 0, bs = m ? .98 : 1;
  st.rotY = h * 1.1 + x * .4 + tt * .5;
  // 02 · the mix: camera swings overhead, the spoon dips in, everything is stirred through
  const e = ss(0, .14, x);
  camH = lerp(camH, m ? 10.6 : 9.0, e); camR = lerp(camR, m ? 2.2 : 3.6, e); look = lerp(look, .5, e);
  bx = lerp(bx, m ? 0 : 1.7, e); st.camZ = m ? lerp(0, -1.45, e) : 0;
  st.spoon = ss(.12, .3, x) * (1 - ss(.9, 1, x));
  st.mix = ss(.26, .9, x);
  st.steam = 1 - e * .4; st.exposure = lerp(1, .82, e);
  // 03 · the table: camera climbs straight up, banchan slide in around the bowl
  const e2 = ss(0, .4, tt);
  camH = lerp(camH, m ? 17.5 : 13.2, e2); camR = lerp(camR, m ? .6 : 1.1, e2);
  bx = lerp(bx, m ? 0 : 2.3, e2); st.camZ = m ? lerp(st.camZ, -2.0, e2) : 0; bs = lerp(bs, m ? .86 : 1, e2);
  st.table = ss(.1, .78, tt); st.steam *= 1 - e2 * .5; st.exposure = lerp(st.exposure, .95, e2);
  st.bowlX = bx; st.bowlY = by; st.bowlS = bs; st.camH = camH; st.camR = camR; st.camLook = look;
  st.glow = x > 0 ? "#33241a" : "#2b221b";
  $("#mix-pct").textContent = Math.round(st.mix * 100) + "%";
  $("#mix-fill").style.transform = `scaleX(${st.mix})`;
}

/* ---------- motion ---------- */
gsap.registerPlugin(ScrollTrigger);
let lenis = null;
if (!reduce && window.Lenis) {
  lenis = new Lenis({ lerp: .085, smoothWheel: true });
  lenis.on("scroll", ScrollTrigger.update);
  gsap.ticker.add(tm => lenis.raf(tm * 1000)); gsap.ticker.lagSmoothing(0);
  $$('a[href^="#"]').forEach(a => a.addEventListener("click", ev => { const id = a.getAttribute("href"); if (id.length > 1 && $(id)) { ev.preventDefault(); lenis.scrollTo(id === "#top" ? 0 : id, { duration: 1.8 }); } }));
}
const track = (sel, key) => ScrollTrigger.create({ trigger: sel, start: "top top", end: "bottom bottom", onUpdate: s => { prog[key] = s.progress; } });
track("#hero", "hero"); track("#mix", "mix");

// render only while the 3D chapters are on screen
let live = true;
track("#table", "table");
ScrollTrigger.create({ trigger: "#menu", start: "top top", onEnter: () => { live = false; canvas.style.visibility = "hidden"; }, onLeaveBack: () => { live = true; canvas.style.visibility = "visible"; } });
// nav turns light on the paper sections
const nav = $("#nav"), menuEl = $("#menu"), visitEl = $("#visit");
const navTone = () => { const a = menuEl.getBoundingClientRect().top, b = visitEl.getBoundingClientRect().bottom; nav.classList.toggle("light", a < 72 && b > 72); };
addEventListener("scroll", navTone, { passive: true }); gsap.ticker.add(navTone);
// phone bar appears after the first chapter
ScrollTrigger.create({ trigger: "#mix", start: "top 80%", onEnter: () => $("#mbar").classList.add("show"), onLeaveBack: () => $("#mbar").classList.remove("show") });

const TEST = /[?&]test/.test(location.search);
window.__step = () => { choreograph(); world.frame(); };
gsap.ticker.add(() => { if (!live || TEST) return; choreograph(); world.frame(); });

// text
gsap.to([".hero-line", ".hero-br", ".hero-tl"], { autoAlpha: 0, y: -20, ease: "none", scrollTrigger: { trigger: "#hero", start: "88% bottom", end: "bottom bottom", scrub: true } });
gsap.to(".obang", { autoAlpha: 0, ease: "none", scrollTrigger: { trigger: "#hero", start: "92% bottom", end: "bottom bottom", scrub: true } });
gsap.fromTo([".mx-text", ".mx-meter", ".mx-hint"], { autoAlpha: 0, y: 40 }, { autoAlpha: 1, y: 0, ease: "none", scrollTrigger: { trigger: "#mix", start: "6% top", end: "18% top", scrub: true } });
gsap.fromTo([".tb-eye", ".tb-mean", ".tb-stats", ".tb-hint"], { autoAlpha: 0, y: 30 }, { autoAlpha: 1, y: 0, ease: "none", stagger: .05, scrollTrigger: { trigger: "#table", start: "8% top", end: "26% top", scrub: true } });
gsap.fromTo(".tb-kr", { clipPath: "inset(0 100% 0 0)" }, { clipPath: "inset(0 0% 0 0)", ease: "none", scrollTrigger: { trigger: "#table", start: "4% top", end: "24% top", scrub: true } });
gsap.to(".sc-mix .pin", { autoAlpha: 0, ease: "none", scrollTrigger: { trigger: "#mix", start: "bottom 115%", end: "bottom bottom", scrub: true } });

// headings reveal line by line
$$(".sc-menu h2, .sc-visit h2").forEach(h => {
  h.innerHTML = h.innerHTML.split(/<br\s*\/?>/i).map(l => `<span style="display:block;overflow:hidden;padding-bottom:.08em"><span style="display:inline-block">${l}</span></span>`).join("");
  gsap.from($$("span > span", h), { yPercent: 110, duration: 1.2, stagger: .1, ease: "expo.out", scrollTrigger: { trigger: h, start: "top 85%" } });
});
// the name: the big hangul wipes in like a brush stroke
gsap.utils.toArray(".dish, .vc, .card").forEach((el, i) => gsap.from(el, { y: 36, autoAlpha: 0, duration: 1, delay: (i % 4) * .06, ease: "expo.out", scrollTrigger: { trigger: el, start: "top 92%" } }));
gsap.fromTo(".ft-kr", { clipPath: "inset(0 100% 0 0)" }, { clipPath: "inset(0 0% 0 0)", duration: 1.6, ease: "expo.out", scrollTrigger: { trigger: ".foot", start: "top 85%" } });

// loader out
choreograph(); world.frame();
$("#ld-fill").style.transform = "scaleX(1)";
document.documentElement.classList.remove("loading");
gsap.timeline({ delay: .5 })
  .to("#loader", { autoAlpha: 0, duration: .8, ease: "power2.out", onComplete: () => $("#loader").remove() })
  .from(".hero-line, .hero-tl, .hero-br, .obang, .nav", { y: 24, autoAlpha: 0, duration: 1.2, stagger: .06, ease: "expo.out" }, "-=.3");
ScrollTrigger.refresh();
window.__ready = true;
