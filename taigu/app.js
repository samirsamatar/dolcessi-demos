/* Taigu 大愚 · concept site by Dolcessi */
import { createWorld } from "./world.js?v=4";
const $ = (s, c = document) => c.querySelector(s), $$ = (s, c = document) => [...c.querySelectorAll(s)];
const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const lerp = (a, b, t) => a + (b - a) * t;
const ss = (a, b, v) => { const t = clamp((v - a) / (b - a)); return t * t * (3 - 2 * t); };
const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
const TZ = "Europe/Amsterdam";

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

/* ---------- flavours ---------- */
const FL = [
  { tea: "#3F6A16", milk: "#F1EEE6", base: 0, baseCol: "#B3122C", mochi: 0, bg: "#070906", glow: "#1B2A10", accent: "#9CC24F" },
  { tea: "#3F6A16", milk: "#F3ECEA", base: .42, baseCol: "#B3122C", mochi: 0, bg: "#0D0507", glow: "#3A0E18", accent: "#F0607A" },
  { tea: "#3F6A16", milk: "#F1EEE6", base: 0, baseCol: "#B3122C", mochi: 1, bg: "#0A0A09", glow: "#2C2C27", accent: "#E9E4D6" },
  { tea: "#74451F", milk: "#EFE6DA", base: 0, baseCol: "#B3122C", mochi: 0, bg: "#0C0805", glow: "#33200F", accent: "#D9A06E" },
  { tea: "#3F6A16", milk: "#F0ECE6", base: .36, baseCol: "#4E1A17", mochi: 0, bg: "#0B0606", glow: "#2E1311", accent: "#C98A7E" }
];
const hex = c => { const n = parseInt(c.slice(1), 16); return [(n >> 16) & 255, (n >> 8) & 255, n & 255]; };
const mixHex = (a, b, t) => { const A = hex(a), B = hex(b); return "#" + A.map((v, i) => Math.round(lerp(v, B[i], t)).toString(16).padStart(2, "0")).join(""); };

/* ---------- world ---------- */
const canvas = $("#world");
const MOB = () => innerWidth < 900;
const world = await createWorld(canvas, { maxDpr: MOB() ? 1.5 : 1.35, logoUrl: "img/logo.svg", wordUrl: "img/word.svg" });
const st = world.st;
addEventListener("resize", () => { world.resize(); ScrollTrigger.refresh(); });

const prog = { hero: 0, fl: 0, wh: 0 };
const flTexts = $$(".fl"), dots = $$(".fl-dots i"), root = document.documentElement;
let lastFl = -1;

function choreograph() {
  const m = MOB();
  const h = prog.hero, f = prog.fl, w = prog.wh;
  // --- 01 pour
  const pourT = ss(.02, .82, h);
  st.fill = lerp(1.25, 2.55, pourT);
  st.mix = ss(.06, .92, h);
  st.pour = h < .86 ? ss(0, .04, h) : 1 - ss(.86, .95, h);
  st.ice = 1;
  // hero framing: big, tilted, centred
  const hs = m ? 1.0 : 1.18;
  let x = 0, y = m ? -.35 : -.38, s = hs, tilt = -.13, rotY = 0, word = 1 - ss(.0, .07, f);
  // --- 02 flavours: cup moves right (desktop) / down (phone), spins on each change
  const e = ss(0, .12, f);
  x = lerp(x, m ? 0 : 1.95, e); y = lerp(y, m ? -1.05 : -.42, e); s = lerp(s, m ? .86 : 1.16, e); tilt = lerp(tilt, 0, e);
  const fi = clamp(f * 4.9 - .3, 0, 4.999), i = Math.floor(fi), t = fi - i, k = ss(.62, 1, t), j = Math.min(4, i + 1);
  const A = FL[i], B = FL[j];
  st.tea = mixHex(A.tea, B.tea, k); st.milk = mixHex(A.milk, B.milk, k); st.baseCol = mixHex(A.baseCol, B.baseCol, k);
  st.base = lerp(A.base, B.base, k); st.mochi = lerp(A.mochi, B.mochi, k);
  rotY = (i + k) * Math.PI * 2;
  const bgA = f > 0 ? mixHex(A.bg, B.bg, k) : "#070707";
  st.bg = mixHex("#070707", bgA, e); st.glow = mixHex("#2a2927", mixHex(A.glow, B.glow, k), e);
  const cur = f < .045 ? -1 : (t > .81 && i < 4 ? j : i);
  if (cur !== lastFl) {
    lastFl = cur;
    flTexts.forEach((el, n) => gsap.to(el, { autoAlpha: n === cur ? 1 : 0, y: n === cur ? 0 : (n < cur ? -30 : 30), duration: .7, ease: "expo.out", overwrite: true }));
    dots.forEach((d, n) => d.classList.toggle("on", n === cur));
    $("#fl-i").textContent = String(Math.max(cur, 0) + 1).padStart(2, "0");
    if (cur >= 0) root.style.setProperty("--accent", FL[cur].accent);
  }
  // --- 03 whisk: the cup lifts away, the bowl rises in
  const out = ss(0, .16, w);
  y = lerp(y, 6, out); st.cupVis = 1 - ss(.1, .16, w);
  st.whisk = ss(.06, .2, w);
  st.whiskSpeed = Math.min(ss(.18, .3, w), 1 - ss(.86, .96, w));
  st.foam = ss(.22, .88, w); st.whiskX = m ? 0 : 1.9; st.whiskS = m ? .8 : .78;
  if (w > 0) { st.bg = mixHex(st.bg, "#070707", ss(0, .12, w)); st.glow = mixHex(st.glow, "#1d2a12", ss(0, .2, w)); }
  st.cupX = x; st.cupY = y; st.scale = s; st.tilt = tilt; st.rotY = rotY; st.word = word; st.tiltX = .3 * e * (1 - out); st.wordS = m ? .62 : 1;
  st.camY = lerp(lerp(2.1, 2.9, e * (1 - out)), m ? 3.0 : 3.2, st.whisk); st.camZ = lerp(12.5, m ? 10.5 : 9.5, st.whisk);
  // HUD
  $("#pour-pct").textContent = Math.round(st.mix * 100);
  $("#foam-pct").textContent = Math.round(st.foam * 100) + "%";
  $("#foam-fill").style.transform = `scaleX(${st.foam})`;
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
track("#hero", "hero"); track("#flavours", "fl"); track("#whisk", "wh");

// render only while the 3D chapters are on screen
let live = true;
ScrollTrigger.create({ trigger: "#brand", start: "top top", onEnter: () => { live = false; canvas.style.visibility = "hidden"; }, onLeaveBack: () => { live = true; canvas.style.visibility = "visible"; } });
const TEST = /[?&]test/.test(location.search);
window.__step = () => { choreograph(); world.frame(); };
gsap.ticker.add(() => { if (!live || TEST) return; choreograph(); world.frame(); });

// text in the first chapters
gsap.set(flTexts, { autoAlpha: 0 });
gsap.to([".hero-line", ".hero-br", ".hero-tl", ".pour-meter"], { autoAlpha: 0, y: -20, ease: "none", scrollTrigger: { trigger: "#hero", start: "85% bottom", end: "bottom bottom", scrub: true } });
gsap.fromTo(".wh-text", { autoAlpha: 0, y: 40 }, { autoAlpha: 1, y: 0, ease: "none", scrollTrigger: { trigger: "#whisk", start: "top top", end: "18% top", scrub: true } });
gsap.fromTo([".fl-count", ".fl-note", ".fl-dots"], { autoAlpha: 0 }, { autoAlpha: 1, ease: "none", scrollTrigger: { trigger: "#flavours", start: "top top", end: "6% top", scrub: true } });
gsap.to(".sc-flavours .pin", { autoAlpha: 0, ease: "none", scrollTrigger: { trigger: "#flavours", start: "bottom 110%", end: "bottom bottom", scrub: true } });

// headings reveal line by line
$$(".sc-menu h2, .sc-visit h2").forEach(h => {
  h.innerHTML = h.innerHTML.split(/<br\s*\/?>/i).map(l => `<span style="display:block;overflow:hidden;padding-bottom:.06em"><span style="display:inline-block">${l}</span></span>`).join("");
  gsap.from($$("span > span", h), { yPercent: 110, duration: 1.2, stagger: .1, ease: "expo.out", scrollTrigger: { trigger: h, start: "top 85%" } });
});
// the name: kanji wipes in like ink, the wordmark rises
gsap.fromTo(".br-kanji", { clipPath: "inset(0 0 100% 0)" }, { clipPath: "inset(0 0 0% 0)", duration: 1.8, ease: "expo.out", scrollTrigger: { trigger: ".sc-brand", start: "top 70%" } });
gsap.from(".br-meaning", { y: 40, autoAlpha: 0, duration: 1.2, ease: "expo.out", scrollTrigger: { trigger: ".sc-brand", start: "top 65%" } });
gsap.fromTo(".br-word", { clipPath: "inset(100% 0 0 0)", y: 60 }, { clipPath: "inset(0% 0 0 0)", y: 0, duration: 1.6, ease: "expo.out", scrollTrigger: { trigger: ".br-word", start: "top 92%" } });
gsap.utils.toArray(".mn-col li, .house").forEach(el => gsap.from(el, { y: 30, autoAlpha: 0, duration: 1, ease: "expo.out", scrollTrigger: { trigger: el, start: "top 92%" } }));
// marquee: duplicate for a seamless loop
const mq = $(".mq-track"); mq.innerHTML += mq.innerHTML;

// loader out
choreograph(); world.frame();
$("#ld-fill").style.transform = "scaleX(1)";
document.documentElement.classList.remove("loading");
gsap.timeline({ delay: .5 })
  .to("#loader", { autoAlpha: 0, duration: .8, ease: "power2.out", onComplete: () => $("#loader").remove() })
  .from(".hero-line, .hero-tl, .hero-br, .pour-meter, .nav", { y: 24, autoAlpha: 0, duration: 1.2, stagger: .06, ease: "expo.out" }, "-=.3");
ScrollTrigger.refresh();
window.__ready = true;
