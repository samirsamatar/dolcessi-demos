/* Haku 白 · concept site by Dolcessi */
(() => {
const $ = (s, c = document) => c.querySelector(s), $$ = (s, c = document) => [...c.querySelectorAll(s)];
const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
const MOB = () => innerWidth <= 960;
const TEST = /[?&]test/.test(location.search);
const page = document.body.dataset.page;
if (reduce) document.documentElement.classList.add("reduce");

/* ---------- hours, live (Amsterdam time) ---------- */
const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
const WK = [480, 1020];
const HOURS = { j: [WK, WK, WK, WK, WK, [540, 1080], [540, 1080]], e: [WK, WK, WK, WK, WK, [540, 1020], [540, 1020]] };
const NAME = { j: "Jordaan", e: "Oost" };
const hm = m => `${String(Math.floor(m / 60)).padStart(2, "0")}:${String(m % 60).padStart(2, "0")}`;
function now() {
  const p = new Intl.DateTimeFormat("en-GB", { weekday: "short", hour: "2-digit", minute: "2-digit", hour12: false, timeZone: "Europe/Amsterdam" }).formatToParts(new Date());
  const g = k => p.find(x => x.type === k).value;
  return { d: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].indexOf(g("weekday")), m: (+g("hour") % 24) * 60 + +g("minute") };
}
function st(k) {
  const { d, m } = now(), o = HOURS[k][d];
  if (m >= o[0] && m < o[1]) return { open: true, short: `Open · until ${hm(o[1])}`, long: `Open now · until ${hm(o[1])}` };
  if (m < o[0]) return { open: false, short: `Opens ${hm(o[0])}`, long: `Closed · opens today at ${hm(o[0])}` };
  const n = HOURS[k][(d + 1) % 7];
  return { open: false, short: `Opens tomorrow ${hm(n[0])}`, long: `Closed · opens tomorrow at ${hm(n[0])}` };
}
function paintHours() {
  const J = st("j"), E = st("e");
  $$("[data-st]").forEach(el => {
    const k = el.dataset.st, span = $("span", el) || el, dot = $(".dot", el);
    let txt, open;
    if (k === "both") {
      open = J.open || E.open;
      txt = J.open && E.open ? `Both cafés open · until ${J.long.slice(-5)}` : J.open ? `Jordaan open · Oost closed` : E.open ? `Oost open · Jordaan closed` : J.short.replace(/^Opens (tomorrow )?/, (m, t) => t ? "Both open tomorrow " : "Both open at ");
    } else {
      const s = st(k); open = s.open;
      txt = el.closest(".hx-locs, .dr-foot") ? `${NAME[k]} · ${k === "j" ? "Rozengracht 69" : "Pontanusstraat 276"} · ${s.short}` : el.matches("li") ? s.short : el.matches(".loc-st") ? s.long : s.short;
    }
    span.textContent = txt; if (dot) dot.classList.toggle("off", !open);
  });
  const { d } = now();
  $$("[data-hours]").forEach(ul => { const k = ul.dataset.hours; ul.innerHTML = DAYS.map((n, i) => `<li${i === d ? ' class="today"' : ""}><span>${n}</span><span>${hm(HOURS[k][i][0])} – ${hm(HOURS[k][i][1])}</span></li>`).join(""); });
}
paintHours(); setInterval(paintHours, 60000);

/* ---------- nav + drawer ---------- */
const nav = $("#nav");
const onScroll = () => nav.classList.toggle("solid", scrollY > 30);
addEventListener("scroll", onScroll, { passive: true }); onScroll();
$("#burger").addEventListener("click", () => {
  const open = document.body.classList.toggle("menu-open");
  $("#burger").setAttribute("aria-expanded", open); $("#drawer").setAttribute("aria-hidden", !open);
});

/* ---------- signature: a milk drop where you click ---------- */
if (!reduce) addEventListener("pointerdown", e => {
  if (e.button !== 0 || e.target.closest("a, button, input, iframe, .ticket")) return;
  const d = document.createElement("span"); d.className = "drop"; d.style.left = e.clientX + "px"; d.style.top = e.clientY + "px";
  d.innerHTML = "<i></i><i></i><b></b>"; document.body.appendChild(d); setTimeout(() => d.remove(), 1100);
}, { passive: true });

/* ---------- signature: cookies with your coffee? ---------- */
(() => {
  const t = $("#ticket"); let seen = null;
  try { seen = localStorage.getItem("haku-cookies"); } catch (e) {}
  if (seen || TEST) { t.remove(); return; }
  $("#t-time").textContent = hm(now().m);
  setTimeout(() => t.classList.add("on"), page === "home" ? 2600 : 1200);
  t.addEventListener("click", e => { const b = e.target.closest("button"); if (!b) return;
    try { localStorage.setItem("haku-cookies", b.dataset.c); } catch (er) {}
    $("h4", t).innerHTML = b.dataset.c === "yes" ? "Enjoy your<br>coffee." : "Just the<br>coffee, then.";
    setTimeout(() => { t.classList.remove("on"); setTimeout(() => t.remove(), 1000); }, 900); });
})();

/* ---------- reveals ---------- */
const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } }), { rootMargin: "0px 0px -8% 0px" });
$$(".rv").forEach((el, i) => { el.style.transitionDelay = (i % 4) * 70 + "ms"; io.observe(el); });

/* ---------- smooth scroll ---------- */
let lenis = null;
if (window.gsap) { gsap.registerPlugin(ScrollTrigger); ScrollTrigger.config({ ignoreMobileResize: true }); }
if (!reduce && !TEST && window.Lenis) {
  lenis = new Lenis({ lerp: .09, smoothWheel: true, wheelMultiplier: .9 });
  if (window.gsap) { lenis.on("scroll", ScrollTrigger.update); gsap.ticker.add(t => lenis.raf(t * 1000)); gsap.ticker.lagSmoothing(0); }
  else (function raf(t) { lenis.raf(t); requestAnimationFrame(raf); })(0);
}
if (TEST && window.gsap) gsap.ticker.lagSmoothing(0);
const goTo = y => lenis ? lenis.scrollTo(y, { duration: 1.1 }) : scrollTo({ top: y, behavior: reduce ? "auto" : "smooth" });
$$('a[href^="#"]').forEach(a => a.addEventListener("click", e => { const el = $(a.getAttribute("href")); if (!el) return; e.preventDefault(); goTo(el.getBoundingClientRect().top + scrollY - (page === "menu" ? 150 : 80)); }));
if (location.hash && $(location.hash)) addEventListener("load", () => setTimeout(() => goTo($(location.hash).getBoundingClientRect().top + scrollY - (page === "menu" ? 150 : 80)), 300));

/* ===================== HOME ===================== */
if (page === "home") {
  // the 白 window: a hole in the plaster that the café zooms through
  const svg = $("#hx-mask"), r = $("#hxm-r"), paper = $("#hx-paper"), gl = $("#hxm-g");
  const ui = $("#hx-ui"), shade = $("#hx-shade"), title = $("#hx-title"), imgs = $$(".hx-photo img");
  let W = 0, Hh = 0, base = null;
  function layout() {
    W = innerWidth; Hh = innerHeight;
    svg.setAttribute("viewBox", `0 0 ${W} ${Hh}`);
    [r, paper].forEach(el => { el.setAttribute("width", W); el.setAttribute("height", Hh); });
    const gh = Math.min(Hh * (MOB() ? .46 : .6), W * (MOB() ? .62 : .5) * 946 / 761), k = gh / 946, gw = 761 * k;
    const gx = (W - gw) / 2, gy = Hh * (MOB() ? .44 : .47) - gh / 2;
    base = { k, gx, gy, ox: gx + 73 * k, oy: gy + 426 * k };
    draw(lastP, true);
  }
  let lastP = -1;
  const ease = t => t * t * t;
  function draw(p, force) {
    if (!base || (!force && p === lastP)) return; lastP = p;
    const zp = Math.min(1, Math.max(0, p / .6)), z = 1 + 70 * ease(zp);
    const { k, gx, gy, ox, oy } = base;
    gl.setAttribute("transform", `translate(${ox} ${oy}) scale(${z}) translate(${-ox} ${-oy}) translate(${gx - 137 * k} ${gy}) scale(${k}) translate(0 861) scale(1 -1)`);
    svg.style.display = zp >= 1 ? "none" : "";
    ui.style.opacity = Math.max(0, 1 - p / .14);
    ui.style.visibility = p > .15 ? "hidden" : "";
    shade.style.opacity = Math.min(1, Math.max(0, (p - .4) / .25));
    const ts = Math.min(1, Math.max(0, (p - .58) / .2));
    title.style.visibility = ts > 0 ? "visible" : "hidden";
    title.style.opacity = ts; title.style.transform = `translateY(${(1 - ts) * 40}px)`;
    imgs.forEach(im => im.style.transform = `scale(${1.08 - .08 * zp})`);
  }
  layout(); addEventListener("resize", layout);
  if (window.gsap) ScrollTrigger.create({ trigger: ".hx", start: "top top", end: "bottom bottom", onUpdate: s => draw(s.progress) });
  else addEventListener("scroll", () => { const h = $(".hx"); draw(Math.min(1, scrollY / (h.offsetHeight - innerHeight))); }, { passive: true });
  if (!reduce && window.gsap) gsap.from(gl, { opacity: 0, duration: 1.6, ease: "power2.out" });
  // the window cycles drinks until you scroll
  const mid = $$("#hx-mid picture"); let mi = 0; mid[0].classList.add("on");
  const cyc = setInterval(() => { if (lastP > .02 || document.hidden) return; mid[mi].classList.remove("on"); mi = (mi + 1) % mid.length; mid[mi].classList.add("on"); }, 2600);

  // intro sentence fills in as you read
  const it = $("#intro-t");
  it.innerHTML = it.innerHTML.replace(/(<em>.*?<\/em>)|([^\s<]+)/g, (m, em, w) => `<span class="w">${em || w}</span>`);
  if (window.gsap && !reduce) gsap.to($$(".w", it), { opacity: 1, stagger: .1, ease: "none", scrollTrigger: { trigger: it, start: "top 80%", end: "bottom 50%", scrub: lenis ? true : .3 } });
  else $$(".w", it).forEach(w => w.style.opacity = 1);

  // at the bar: a short sideways run on desktop
  const bar = $("#bar"), trk = $("#bar-track"), prog = $("#bar-prog");
  if (window.gsap) ScrollTrigger.matchMedia({
    "(min-width: 961px)": () => {
      const dist = () => Math.max(0, trk.scrollWidth - innerWidth);
      const setH = () => { bar.style.height = `${dist() + innerHeight}px`; };
      setH(); ScrollTrigger.addEventListener("refreshInit", setH);
      const tw = gsap.to(trk, { x: () => -dist(), ease: "none", scrollTrigger: { trigger: bar, start: "top top", end: "bottom bottom", scrub: lenis ? true : .3, invalidateOnRefresh: true, onUpdate: s => prog.style.transform = `scaleX(${s.progress})` } });
      const step = d => { const st = tw.scrollTrigger, card = trk.children[0].offsetWidth + 24; goTo(Math.min(st.end, Math.max(st.start, scrollY + d * card * (st.end - st.start) / Math.max(1, dist())))); };
      $("#bar-prev").onclick = () => step(-1); $("#bar-next").onclick = () => step(1);
      return () => { bar.style.height = ""; ScrollTrigger.removeEventListener("refreshInit", setH); };
    },
    "(max-width: 960px)": () => {
      const f = () => prog.style.transform = `scaleX(${trk.scrollLeft / Math.max(1, trk.scrollWidth - trk.clientWidth)})`;
      trk.addEventListener("scroll", f, { passive: true });
    }
  });
}

/* ===================== MENU ===================== */
if (page === "menu") {
  const peek = $$("#peek img"), cap = $("#peek-cap");
  const idx = {}; peek.forEach(im => { const n = im.getAttribute("src").split("/").pop().replace(".jpg", ""); idx[n] = im; });
  const show = (n, label) => { peek.forEach(im => im.classList.toggle("on", im === idx[n])); if (label) cap.textContent = label; };
  show("carafe", "Hover a drink");
  $$(".it").forEach(it => it.addEventListener("mouseenter", () => show(it.dataset.ph, $("b", it).firstChild.textContent.trim())));
  // hot / iced filter
  $("#seg").addEventListener("click", e => { const b = e.target.closest("button"); if (!b) return;
    $$("#seg button").forEach(x => x.classList.toggle("on", x === b));
    const f = b.dataset.f; $$(".grp:not(#pourover):not(#bakes) .it").forEach(it => it.classList.toggle("hide", f !== "all" && it.dataset.t !== f));
    if (window.ScrollTrigger) ScrollTrigger.refresh(); });
  // tabs follow the section you're in
  const tabs = $$("#tabs a"), grps = tabs.map(a => $(a.getAttribute("href")));
  const spy = () => { let k = 0; grps.forEach((g, i) => { if (g && g.getBoundingClientRect().top < innerHeight * .35) k = i; });
    tabs.forEach((t, i) => t.classList.toggle("on", i === k)); };
  addEventListener("scroll", spy, { passive: true }); spy();
}

/* ===================== STORY ===================== */
if (page === "story") {
  const ims = $$("#ch-ph img"), yr = $("#ch-yr"), chs = $$(".ch");
  const set = i => { ims.forEach((im, k) => im.classList.toggle("on", k === i)); chs.forEach((c, k) => c.classList.toggle("on", k === i)); yr.textContent = $(".num", chs[i]).textContent; };
  set(0);
  const cio = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) set(+e.target.dataset.i); }), { rootMargin: "-45% 0px -45% 0px" });
  chs.forEach(c => cio.observe(c));
  // farm to cup: drifts sideways as you scroll past
  const ft = $("#farm-track");
  if (window.gsap && !reduce) gsap.fromTo(ft, { x: 0 }, { x: () => -Math.max(0, ft.scrollWidth - innerWidth), ease: "none", scrollTrigger: { trigger: ".farm", start: "top 70%", end: "bottom 20%", scrub: lenis ? true : .3, invalidateOnRefresh: true } });
}

addEventListener("load", () => window.ScrollTrigger && ScrollTrigger.refresh());
window.__ready = true;
})();
