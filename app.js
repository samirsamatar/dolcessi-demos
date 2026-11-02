/* Dolcessi studio — one particle field that travels the whole scroll.
   Shapes per section: sphere → crowd card outline → chart that becomes a rocket → stars →
   orbit around the work → tile outlines → proof outlines → stars → rising sun. */
(() => {
"use strict";
document.documentElement.classList.add("js");
const $ = s => document.querySelector(s), $$ = s => [...document.querySelectorAll(s)];
const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
const mobile = matchMedia("(max-width: 900px)").matches;
const fine = matchMedia("(hover: hover) and (pointer: fine)").matches;
const TZ = "Europe/Amsterdam";

/* ---------------- language: Dutch for Dutch browsers, English otherwise, switchable ---------------- */
const LANG = (() => {
  const q = new URLSearchParams(location.search).get("lang");
  if (q === "nl" || q === "en") { try { localStorage.setItem("dol-lang", q); } catch (e) {} return q; }
  try { const s = localStorage.getItem("dol-lang"); if (s === "nl" || s === "en") return s; } catch (e) {}
  return /^nl\b/i.test(navigator.language || "") ? "nl" : "en";
})();
const NLg = LANG === "nl";
const tr = (en, nl) => (NLg ? nl : en);
const NL_TEXT = {
  "Work": "Werk", "How": "Aanpak", "Proof": "Bewijs", "FAQ": "Vragen",
  "Show me my site": "Laat mijn site zien", "See the work ↓": "Bekijk het werk ↓",
  "High-end websites for Amsterdam restaurants": "High-end websites voor Amsterdamse restaurants",
  "3 concepts live": "3 concepten live", "Built in Amsterdam": "Gemaakt in Amsterdam",
  "02 · Why it matters": "02 · Waarom het ertoe doet",
  "of diners check a restaurant’s website before they come.": "van de gasten bekijkt de website van een restaurant voordat ze komen.",
  "of them say a website has put them off a restaurant.": "van hen zegt dat een website ze weleens heeft afgeschrikt.",
  "of phone visitors leave if a page takes over 3 seconds.": "van de mobiele bezoekers haakt af als een pagina langer dan 3 seconden laadt.",
  "MGH survey of 1,101 US diners, 2019 · Google mobile speed research, 2016": "MGH-onderzoek onder 1.101 Amerikaanse gasten, 2019 · Google-onderzoek naar mobiele snelheid, 2016",
  "100 hungry people nearby": "100 hongerige mensen in de buurt",
  "Every dot is someone deciding where to eat tonight.": "Elke stip is iemand die kiest waar hij vanavond eet.",
  "03 · What a good site does": "03 · Wat een goede site doet",
  "Found": "Gevonden", "on Google, at last": "op Google, eindelijk", "Clicked": "Geklikt", "because it looks the part": "omdat het er goed uitziet",
  "Called": "Gebeld", "one tap, no hunting": "één tik, niet zoeken", "Booked": "Geboekt", "“table for four, Friday?”": "“tafel voor vier, vrijdag?”",
  "04 · How it works": "04 · Hoe het werkt",
  "Your place": "Jouw zaak", "Designing…": "Ontwerpen…", "We build it first.": "Wij bouwen het eerst.",
  "A real concept of your restaurant: your menu, your hours, your street. We walk in and show it to you on a phone.": "Een echt concept van jouw restaurant: je menukaart, je openingstijden, je straat. We lopen binnen en laten het zien op een telefoon.",
  "Your restaurant": "Jouw restaurant", "Est. today": "Sinds vandaag", "Make it mine": "Maak het van mij", "✓ It’s yours": "✓ Het is van jou",
  "You say yes. Or you don’t.": "Jij zegt ja. Of niet.",
  "Like it? It’s yours. Don’t? You lost five minutes and got a free look at your own restaurant.": "Bevalt het? Dan is het van jou. Niet? Dan ben je vijf minuten kwijt en heb je gratis een blik op je eigen restaurant gehad.",
  "Incoming call": "Inkomend gesprek", "Route to you": "Route naar jou", "Table for 4 · Fri": "Tafel voor 4 · vr",
  "Live within days.": "Binnen dagen live.",
  "Domain, Google, call and route buttons, all connected. You keep cooking.": "Domein, Google, bel- en routeknoppen, alles gekoppeld. Jij blijft gewoon koken.",
  "Fast": "Snel", "Found on Google": "Gevonden op Google", "Made for phones": "Gemaakt voor mobiel", "Fully booked": "Volgeboekt", "Yours in days": "In dagen van jou",
  "05 · Work": "05 · Werk",
  "We pick restaurants we love and design the site they deserve. Tap one. It’s live.": "We kiezen restaurants waar we van houden en ontwerpen de site die ze verdienen. Tik er een aan. Hij staat live.",
  "Monastery cloth & steam": "Kloosterdoek & stoom", "Red lacquer & northern winter": "Rood lakwerk & noordelijke winter", "Lotus on still water": "Lotus op stil water",
  "Unofficial concept designs. Not the restaurants’ own websites.": "Onofficiële conceptontwerpen. Niet de eigen websites van de restaurants.",
  "06 · What’s inside": "06 · Wat je krijgt",
  "A menu you can read with one thumb.": "Een menukaart die je met één duim leest.", "Not a PDF. Prices, allergens, photos.": "Geen PDF. Prijzen, allergenen, foto’s.",
  "Tap": "Tik", "Call. Route. Book.": "Bellen. Route. Reserveren.", "One tap each.": "Eén tik per stuk.",
  "Hours that are actually right.": "Openingstijden die gewoon kloppen.", "Speed": "Snelheid", "Fast on a phone.": "Snel op je telefoon.",
  "Ours": "Van ons", "Old site": "Oude site", "Dutch and English. Locals and tourists.": "Nederlands en Engels. Buurtbewoners en toeristen.",
  "Found when they search.": "Gevonden als ze zoeken.",
  "Your own domain": "Je eigen domein", "Changes by WhatsApp": "Wijzigingen via WhatsApp", "Your photos, your story": "Jouw foto’s, jouw verhaal",
  "Made for phones first": "Eerst gemaakt voor mobiel", "Google profile set up": "Google-profiel ingericht", "Allergens clearly marked": "Allergenen duidelijk aangegeven",
  "07 · Proof": "07 · Bewijs", "Typical restaurant site": "Typische restaurantsite", "Mobile performance": "Mobiele prestaties",
  "“This spot is saved for our first client’s words.”": "“Deze plek is gereserveerd voor de woorden van onze eerste klant.”",
  "Could be you · Amsterdam": "Misschien jij · Amsterdam", "Next on the wall": "Straks aan de muur", "This spot is waiting for a name": "Deze plek wacht op een naam",
  "“We only publish real quotes. Every one will be checkable.”": "“We plaatsen alleen echte quotes. Elke quote is te controleren.”",
  "Dolcessi house rule": "Huisregel van Dolcessi",
  "“Your Google review about your new site goes here.”": "“Hier komt jouw Google-review over je nieuwe site.”",
  "Linked to Google": "Gelinkt aan Google",
  "3 concepts built · Zeedijk · De Pijp · Oost": "3 concepten gebouwd · Zeedijk · De Pijp · Oost",
  "“First three restaurants get the front row.”": "“De eerste drie restaurants krijgen de eerste rij.”", "Ask us how": "Vraag ons hoe",
  "Founding clients": "Eerste klanten", "3 of 3 spots open": "3 van 3 plekken vrij", "Claim a spot": "Claim een plek",
  "08 · Questions": "08 · Vragen",
  "Do I have to do anything?": "Moet ik er iets voor doen?", "Send us your menu and a few photos. We do the rest.": "Stuur ons je menukaart en een paar foto’s. Wij doen de rest.",
  "Who owns it?": "Van wie is het?", "You. Your domain, your content, always.": "Van jou. Je domein, je content, altijd.",
  "How fast is it live?": "Hoe snel staat het live?", "Days, not months.": "Dagen, geen maanden.",
  "I already have a website.": "Ik heb al een website.", "Then let us show you a better one. Free.": "Dan laten we je een betere zien. Gratis.",
  "Reservations or delivery?": "Reserveringen of bezorging?", "We link the system you already use, so nothing changes in your kitchen.": "We koppelen het systeem dat je al gebruikt, dus in je keuken verandert niets.",
  "What does it cost?": "Wat kost het?", "Less than you think. We show you your site first, then we talk. No surprises.": "Minder dan je denkt. We laten eerst je site zien, dan praten we. Geen verrassingen.",
  "Send us your restaurant’s name. We’ll send you its new site.": "Stuur ons de naam van je restaurant. Wij sturen je de nieuwe site.",
  "Step 1 of 2": "Stap 1 van 2", "Neighbourhood": "Buurt", "optional": "optioneel", "Next": "Volgende", "Step 2 of 2": "Stap 2 van 2",
  "We’ll start sketching right away.": "We beginnen meteen met schetsen.", "Your name": "Je naam", "Email": "E-mail", "WhatsApp / phone": "WhatsApp / telefoon",
  "← Back": "← Terug", "Send it": "Versturen",
  "We only use this to send you your site. No spam, no newsletter.": "We gebruiken dit alleen om je je site te sturen. Geen spam, geen nieuwsbrief.",
  "Received": "Ontvangen", "We’ll get back to you soon with your concept. Keep an eye on your inbox.": "We komen snel bij je terug met je concept. Houd je inbox in de gaten.",
  "Back to the site": "Terug naar de site"
};
const NL_ATTR = { "e.g. Hoi Tin Café": "bijv. Hoi Tin Café", "e.g. De Pijp": "bijv. De Pijp", "First name is fine": "Voornaam is prima", "Switch language": "Taal wisselen", "Close": "Sluiten" };
document.documentElement.lang = LANG;
if (NLg) {
  $$("[data-nl]").forEach(el => { el.innerHTML = el.dataset.nl; });
  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, { acceptNode: n => n.parentElement && !n.parentElement.closest("script,style,.old-site,.menu-list,[data-nl]") ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT });
  const nodes = []; while (walker.nextNode()) nodes.push(walker.currentNode);
  nodes.forEach(n => { const k = n.nodeValue.trim(); if (k && NL_TEXT[k]) n.nodeValue = n.nodeValue.replace(k, NL_TEXT[k]); });
  $$("[placeholder],[aria-label]").forEach(el => { ["placeholder", "aria-label"].forEach(a => { const v = el.getAttribute(a); if (v && NL_ATTR[v]) el.setAttribute(a, NL_ATTR[v]); }); });
  const d = $('meta[name="description"]'); if (d) d.content = "Dolcessi bouwt high-end websites voor Amsterdamse restaurants. Wij bouwen die van jou voordat je erom vraagt.";
  document.title = "Dolcessi — websites voor Amsterdamse restaurants";
}
{ const sw = $("#lang"); if (sw) { sw.querySelector(`[data-l="${LANG}"]`).classList.add("on"); sw.addEventListener("click", () => { const to = NLg ? "en" : "nl"; try { localStorage.setItem("dol-lang", to); } catch (e) {} const u = new URL(location.href); u.searchParams.set("lang", to); location.href = u.toString(); }); } }

const clamp = (a, b, v) => Math.max(a, Math.min(b, v));
const lerp = (a, b, t) => a + (b - a) * t;
const ease = t => t * t * (3 - 2 * t);
const easeIn3 = t => t * t * t;
const easeOut3 = t => 1 - Math.pow(1 - t, 3);

gsap.registerPlugin(ScrollTrigger);

/* ---------------- smooth scroll ---------------- */
let lenis = null;
if (!reduce && window.Lenis) {
  lenis = new Lenis({ lerp: 0.09, smoothWheel: true, wheelMultiplier: 0.95 });
  lenis.on("scroll", ScrollTrigger.update);
  gsap.ticker.add(t => lenis.raf(t * 1000));
  gsap.ticker.lagSmoothing(0);
  lenis.stop();
}
const scrollPos = () => (lenis ? lenis.scroll : window.scrollY);
$$('a[href^="#"]').forEach(a => a.addEventListener("click", e => {
  const id = a.getAttribute("href");
  const target = id === "#top" ? 0 : $(id);
  if (target === null) return;
  e.preventDefault();
  if (lenis) lenis.scrollTo(target, { duration: 1.8, easing: t => 1 - Math.pow(1 - t, 4) });
  else if (target === 0) window.scrollTo({ top: 0, behavior: "smooth" });
  else target.scrollIntoView({ behavior: "smooth" });
}));

/* ---------------- text helpers ---------------- */
function split(el) {
  const walk = node => {
    [...node.childNodes].forEach(n => {
      if (n.nodeType === 3) {
        const frag = document.createDocumentFragment();
        n.textContent.split(/(\s+)/).forEach(part => {
          if (!part) return;
          if (/^\s+$/.test(part)) { frag.appendChild(document.createTextNode(" ")); return; }
          const w = document.createElement("span"); w.className = "w";
          [...part].forEach(ch => { const c = document.createElement("span"); c.className = "c"; c.textContent = ch; w.appendChild(c); });
          frag.appendChild(w);
        });
        n.replaceWith(frag);
      } else if (n.nodeType === 1) walk(n);
    });
  };
  walk(el);
  return el.querySelectorAll(".c");
}
const GLYPHS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789_/·";
function typeOut(el) {
  const text = el.dataset.text || el.textContent;
  el.dataset.text = text;
  let f = 0; const total = text.length + 8;
  const id = setInterval(() => {
    f++;
    let out = "";
    for (let i = 0; i < text.length; i++) {
      if (i < f - 6) out += text[i];
      else if (i < f) out += text[i] === " " ? " " : GLYPHS[(Math.random() * GLYPHS.length) | 0];
    }
    el.textContent = out;
    if (f >= total) { clearInterval(id); el.textContent = text; }
  }, 28);
}

/* ---------------- clock ---------------- */
function amsHour() { return +new Intl.DateTimeFormat("en-GB", { hour: "2-digit", hour12: false, timeZone: TZ }).format(new Date()) % 24; }
function tickClock() {
  const t = new Date().toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit", timeZone: TZ });
  const h = amsHour(), open = h >= 12 && h < 22;
  $("#clock").textContent = "AMS " + t;
  { const cd = $(".clock .live-dot"); if (cd) cd.classList.toggle("off", !open); }
  $("#kitchen").textContent = open ? tr("· kitchens open", "· keukens open") : tr("· kitchens closed", "· keukens dicht");
  $("#foot-clock").textContent = "AMS " + t;
  $("#foot-kitchen").textContent = open ? tr("most kitchens are open", "de meeste keukens zijn open") : tr("most kitchens are closed", "de meeste keukens zijn dicht");
  const ko = h >= 17 && h < 22;
  $("#open-word").textContent = ko ? tr("Open now", "Nu open") : tr("Closed", "Gesloten");
  $("#open-dot").classList.toggle("off", !ko);
  $("#open-line").textContent = ko ? tr("Kitchen 17:00–22:00 · closes in ", "Keuken 17:00–22:00 · sluit over ") + (22 - h - 1 > 0 ? (22 - h - 1) + tr("h+", " uur+") : tr("<1h", "<1 uur")) : tr("Kitchen 17:00–22:00 · opens at 17:00", "Keuken 17:00–22:00 · open vanaf 17:00");
}
tickClock(); setInterval(tickClock, 20000);

/* =====================================================================
   PARTICLE FIELD
   ===================================================================== */
const cv = $("#field"), ctx = cv.getContext("2d");
let W = innerWidth, H = innerHeight, DPR = 1;
function resize() {
  DPR = Math.min(devicePixelRatio || 1, mobile ? 2 : 3);
  W = innerWidth; H = innerHeight;
  cv.width = Math.round(W * DPR); cv.height = Math.round(H * DPR);
  ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
}
resize();
addEventListener("resize", resize);

const N = reduce ? 700 : mobile ? 900 : 2600;          // allocated maximum
let NA = reduce ? 700 : mobile ? 560 : 2000;           // active now; adapts to the device
const NMIN = mobile ? 360 : 1100;
const X = new Float32Array(N), Y = new Float32Array(N), VX = new Float32Array(N), VY = new Float32Array(N), AL = new Float32Array(N), SZ = new Float32Array(N);
const R1 = new Float32Array(N), R2 = new Float32Array(N), R3 = new Float32Array(N), K = new Float32Array(N);
const perm = new Uint32Array(N);
// deterministic random so the field looks the same each visit
let seed = 7; const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
for (let i = 0; i < N; i++) {
  R1[i] = rnd(); R2[i] = rnd(); R3[i] = rnd(); K[i] = 0.7 + rnd() * 0.6; perm[i] = i;
  X[i] = rnd() * W; Y[i] = rnd() * H; AL[i] = 0; SZ[i] = 1;
}
for (let i = N - 1; i > 0; i--) { const j = (rnd() * (i + 1)) | 0; const t = perm[i]; perm[i] = perm[j]; perm[j] = t; }
const ROLE = new Float32Array(N); for (let i = 0; i < N; i++) ROLE[i] = perm[i] / N; // uniform 0..1, shuffled

// unit sphere (Fibonacci), shuffled so morphs swirl instead of peeling
const SPH = new Float32Array(N * 3);
for (let k = 0; k < N; k++) {
  const i = perm[k], y = 1 - (k / (N - 1)) * 2, r = Math.sqrt(1 - y * y), th = k * 2.399963229728653;
  SPH[i * 3] = Math.cos(th) * r; SPH[i * 3 + 1] = y; SPH[i * 3 + 2] = Math.sin(th) * r;
}

// rocket silhouette, unit height ~1, nose up (−y)
const ROCK = new Float32Array(N * 3); // x, y, edge-ness
(function buildRocket() {
  const inside = (x, y) => {
    const ax = Math.abs(x);
    if (y >= -0.5 && y <= 0.34) { // body + nose
      let hw = 0.115;
      if (y < -0.18) { const k = (y + 0.5) / 0.32; hw = 0.115 * Math.sqrt(Math.max(0, 1 - Math.pow(1 - k, 2))); }
      if (y > 0.22) hw = 0.115 - (y - 0.22) * 0.25;
      if (ax <= hw) return true;
    }
    if (y > 0.08 && y < 0.42) { // fins
      const k = (y - 0.08) / 0.34; const reach = 0.115 + 0.14 * k;
      if (ax <= reach && ax > 0.08 && y < 0.42 - (ax - 0.115) * 0.4) return true;
    }
    return false;
  };
  let n = 0, guard = 0;
  while (n < N && guard++ < N * 60) {
    const x = (rnd() - 0.5) * 0.6, y = -0.55 + rnd() * 1.02;
    if (inside(x, y)) {
      const edge = (!inside(x + 0.018, y) || !inside(x - 0.018, y) || !inside(x, y + 0.018) || !inside(x, y - 0.018)) ? 1 : 0;
      ROCK[n * 3] = x; ROCK[n * 3 + 1] = y; ROCK[n * 3 + 2] = edge; n++;
    }
  }
  // porthole ring
  for (let i = 0; i < Math.min(80, N); i++) { const a = i / 80 * Math.PI * 2; ROCK[i * 3] = Math.cos(a) * 0.045; ROCK[i * 3 + 1] = -0.16 + Math.sin(a) * 0.045; ROCK[i * 3 + 2] = 1; }
})();

const rectOf = el => el.getBoundingClientRect();
const field = (x, y, z, t) => Math.sin(x * 2.1 + t * 1.3) * Math.cos(y * 1.8 - t * 0.9) * 0.5 + Math.sin(y * 3.2 + z * 2.3 + t * 1.7) * 0.3 + Math.sin(z * 4.3 - x * 3.1 - t * 2.4) * 0.2;

let T = 0, vel = 0, energy = 0, mouseX = -9999, mouseY = -9999;

/* ---- shape: sphere (out: x, y, alpha, size per particle) ---- */
function sphere(out, cx, cy, R, rot, amp, alphaMul) {
  const cr = Math.cos(rot), sr = Math.sin(rot), tl = 0.38, ct = Math.cos(tl), st = Math.sin(tl), t = T;
  for (let i = 0, j = 0; i < NA; i++, j += 4) {
    const x0 = SPH[i * 3], y0 = SPH[i * 3 + 1], z0 = SPH[i * 3 + 2];
    const d = 1 + field(x0, y0, z0, t) * amp;
    const x = x0 * d, y = y0 * d, z = z0 * d;
    const x1 = x * cr + z * sr, z1 = -x * sr + z * cr;
    const y2 = y * ct - z1 * st, z2 = y * st + z1 * ct;
    const depth = (z2 + 1.3) / 2.6, bulge = Math.max(0, d - 1) * 4;
    out[j] = cx + x1 * R; out[j + 1] = cy + y2 * R;
    out[j + 2] = (0.07 + depth * 0.93) * alphaMul * (1 + bulge * 0.5);
    out[j + 3] = (0.5 + depth * 1.05) * (1 + bulge * 0.3);
  }
}
const loaderShape = out => { const R = Math.min(W, H) * (mobile ? 0.36 : 0.27); sphere(out, W / 2, H * 0.46, R, T * 0.25, 0.06 + energy * 0.25, 1); };
const anchorSphere = (sel, spin, ampBase, alphaMul) => out => {
  const r = rectOf($(sel)); const R = Math.min(r.width, r.height) / 2;
  sphere(out, r.left + r.width / 2, r.top + r.height / 2, R * 0.9, T * spin + vel * 0.002, ampBase + energy * 0.3 + Math.min(0.2, Math.abs(vel) * 0.004), alphaMul);
};

/* ---- shape: outlines of DOM rects (with aura) ---- */
function rects(out, list, radius) {
  let total = 0; const per = list.map(r => { const p = 2 * (r.width + r.height); total += p; return p; });
  for (let i = 0, j = 0; i < NA; i++, j += 4) {
    const role = ROLE[i];
    const outline = role < 0.72;
    let s = (outline ? role / 0.72 : (role - 0.72) / 0.28) * total;
    let k = 0; while (k < list.length - 1 && s > per[k]) { s -= per[k]; k++; }
    const r = list[k]; let x, y, nx, ny;
    if (s < r.width) { x = r.left + s; y = r.top; nx = 0; ny = -1; }
    else if (s < r.width + r.height) { x = r.right; y = r.top + s - r.width; nx = 1; ny = 0; }
    else if (s < 2 * r.width + r.height) { x = r.right - (s - r.width - r.height); y = r.bottom; nx = 0; ny = 1; }
    else { x = r.left; y = r.bottom - (s - 2 * r.width - r.height); nx = -1; ny = 0; }
    // round the corners a little
    const cxr = clamp(r.left + radius, r.right - radius, x), cyr = clamp(r.top + radius, r.bottom - radius, y);
    const dx = x - cxr, dy = y - cyr, dl = Math.hypot(dx, dy);
    if (dl > radius) { x = cxr + dx / dl * radius; y = cyr + dy / dl * radius; }
    const tw = 0.6 + 0.4 * Math.sin(T * 2 + R1[i] * 20);
    if (outline) {
      const off = (R2[i] - 0.5) * 3;
      out[j] = x + nx * off; out[j + 1] = y + ny * off; out[j + 2] = 0.75 * tw; out[j + 3] = 0.9;
    } else {
      const off = 6 + R2[i] * R2[i] * 46;
      out[j] = x + nx * off + Math.sin(T + R3[i] * 9) * 3; out[j + 1] = y + ny * off + Math.cos(T * 0.8 + R3[i] * 9) * 3;
      out[j + 2] = 0.22 * tw * (1 - R2[i] * 0.6); out[j + 3] = 0.7;
    }
  }
}
const rectShape = (sels, radius) => out => rects(out, sels.flatMap(s => $$(s)).map(rectOf), radius);

/* ---- shape: drifting stars ---- */
function stars(out, alphaMul = 1) {
  for (let i = 0, j = 0; i < NA; i++, j += 4) {
    const y = ((R2[i] * (H + 80) - T * (6 + R3[i] * 18) - vel * 0.0) % (H + 80) + (H + 80)) % (H + 80) - 40;
    out[j] = R1[i] * W + Math.sin(T * 0.3 + R3[i] * 30) * 12; out[j + 1] = y;
    out[j + 2] = (0.06 + 0.3 * Math.pow(0.5 + 0.5 * Math.sin(T * 1.6 + R1[i] * 40), 3)) * alphaMul * (R3[i] > 0.92 ? 2.2 : 1);
    out[j + 3] = 0.5 + R3[i] * 0.8;
  }
}
const starShape = out => stars(out, 1);

/* ---- shape: orbit ring around the work deck ---- */
function orbit(out) {
  const r = rectOf($("#deck")); const cx = r.left + r.width / 2, cy = r.top + r.height * 0.55;
  const rx = Math.max(r.width * 0.56, 280), ry = Math.max(70, r.height * 0.16);
  for (let i = 0, j = 0; i < NA; i++, j += 4) {
    if (ROLE[i] < 0.8) {
      const th = R1[i] * Math.PI * 2 + T * (0.12 + R3[i] * 0.06);
      const band = (R2[i] - 0.5) * 2;
      const spread = 1 + band * 0.12;
      const x = Math.cos(th) * rx * spread, y = Math.sin(th) * ry * spread;
      const rot = -0.12, xr = x * Math.cos(rot) - y * Math.sin(rot), yr = x * Math.sin(rot) + y * Math.cos(rot);
      out[j] = cx + xr; out[j + 1] = cy + yr + band * 6;
      const front = Math.sin(th) > 0 ? 1 : 0.35;
      out[j + 2] = (0.15 + 0.6 * (1 - Math.abs(band))) * front; out[j + 3] = 0.6 + (1 - Math.abs(band)) * 0.7;
    } else {
      out[j] = R1[i] * W; out[j + 1] = R2[i] * H; out[j + 2] = 0.08; out[j + 3] = 0.6;
    }
  }
}

/* ---- shape: the chart that becomes a rocket ---- */
let takeP = 0;
const chartBox = $("#chart-box");
function curvePt(s, b) { // s 0..1 along the line
  const f = 0.03 + 0.92 * Math.pow(s, 2.5) + 0.025 * Math.sin(s * 15) * s;
  return [b.left + s * b.width * 0.88, b.bottom - f * b.height];
}
function chartRocket(out) {
  const b = rectOf(chartBox), p = takeP;
  const drawn = easeOut3(clamp(0, 1, p / 0.5));             // phase A: draw the line
  const form = ease(clamp(0, 1, (p - 0.5) / 0.12));         // phase B: line tip becomes a rocket
  const fly = clamp(0, 1, (p - 0.62) / 0.3);                // phase C: launch
  const tip = curvePt(drawn, b), tip2 = curvePt(Math.max(0, drawn - 0.01), b);
  const end = curvePt(1, b), endB = curvePt(0.985, b);
  let ang0 = Math.atan2(end[0] - endB[0], -(end[1] - endB[1])); // tilt from vertical
  const ang = lerp(ang0, 0, ease(clamp(0, 1, fly * 1.6)));
  const hRock = Math.min(W, H) * (mobile ? 0.34 : 0.3);
  const up = [Math.sin(ang), -Math.cos(ang)];
  const dist = easeIn3(fly) * (H * 1.7);
  const cx = end[0] + up[0] * (hRock * 0.45 + dist), cy = end[1] + up[1] * (hRock * 0.45 + dist);
  const ca = Math.cos(ang), sa = Math.sin(ang);
  const tail = [cx - up[0] * hRock * 0.42, cy - up[1] * hRock * 0.42];
  let rk = 0;
  for (let i = 0, j = 0; i < NA; i++, j += 4) {
    const role = ROLE[i];
    if (role < 0.75) {
      // on the line
      const s = role / 0.75;
      let lx, ly, la, lz;
      if (s <= drawn) { [lx, ly] = curvePt(s, b); la = 0.55 + 0.45 * (s / Math.max(0.001, drawn)); lz = 0.9 + (s > drawn - 0.04 ? 1.2 : 0); }
      else { lx = tip[0] + (R1[i] - 0.5) * 18; ly = tip[1] + (R2[i] - 0.5) * 18; la = 0.9; lz = 1.4; } // bright head waiting at the tip
      lx += (R1[i] - 0.5) * 2.5; ly += (R2[i] - 0.5) * 2.5;
      if (role < 0.45) {
        // these become the rocket
        const q = (i * 7919) % N; const rx = ROCK[q * 3], ry = ROCK[q * 3 + 1], edge = ROCK[q * 3 + 2];
        const X0 = rx * hRock, Y0 = ry * hRock;
        const px = cx + X0 * ca - Y0 * sa, py = cy + X0 * sa + Y0 * ca;
        out[j] = lerp(lx, px, form); out[j + 1] = lerp(ly, py, form);
        out[j + 2] = lerp(la, edge ? 1 : 0.45, form); out[j + 3] = lerp(lz, edge ? 1.3 : 0.9, form);
      } else {
        // these become the exhaust: from the tail back down the line
        const q = (role - 0.45) / 0.3;
        let ex, ey;
        if (q < 0.5) { const k = q / 0.5; ex = lerp(tail[0], end[0], k); ey = lerp(tail[1], end[1], k); }
        else { [ex, ey] = curvePt(1 - (q - 0.5) / 0.5 * 0.5, b); }
        const spread = 2 + q * 34 * (0.3 + fly);
        ex += Math.sin(T * 9 + R1[i] * 40) * spread * (R2[i] - 0.5) * 2;
        ey += Math.cos(T * 7 + R2[i] * 40) * spread * 0.4 + (fly > 0 ? q * 20 * fly : 0);
        const flick = 0.6 + 0.4 * Math.sin(T * 20 + R3[i] * 50);
        const ea = (1 - q) * flick * (1 - fly * 0.55) + 0.06;
        const k2 = form;
        out[j] = lerp(lx, ex, k2); out[j + 1] = lerp(ly, ey, k2);
        out[j + 2] = lerp(la, ea, k2); out[j + 3] = lerp(lz, 0.7 + (1 - q) * 1.2, k2);
      }
    } else {
      // faint grid → stars once we fly
      const g = (role - 0.75) / 0.25; const row = (g * 4) | 0; const gx = b.left + R1[i] * b.width, gy = b.bottom - (row / 3) * b.height;
      const sx = R1[i] * W, sy = R2[i] * H;
      out[j] = lerp(gx, sx, fly); out[j + 1] = lerp(gy, sy, fly);
      out[j + 2] = row === 0 ? 0.32 : 0.1 + fly * 0.15; out[j + 3] = 0.7;
    }
    rk++;
  }
}

/* ---------------- stations: which shape for which part of the scroll ---------------- */
const STATIONS = [];
function station(el, shape, opts = {}) { STATIONS.push({ el, shape, ...opts }); }
const bufA = new Float32Array(N * 4), bufB = new Float32Array(N * 4), bufL = new Float32Array(N * 4);
let intro = 0, loaded = false;

function currentTargets() {
  const sp = scrollPos();
  let a = 0, b = 0, m = 0;
  for (let i = 0; i < STATIONS.length; i++) {
    const s = STATIONS[i].st; if (!s) continue;
    if (sp >= s.start && sp <= s.end) { a = b = i; m = 0; break; }
    const nx = STATIONS[i + 1] && STATIONS[i + 1].st;
    if (sp > s.end && (!nx || sp < nx.start)) {
      if (!nx) { a = b = i; m = 0; break; }
      a = i; b = i + 1; m = ease(clamp(0, 1, (sp - s.end) / Math.max(1, nx.start - s.end))); break;
    }
    if (i === 0 && sp < s.start) { a = b = 0; break; }
  }
  STATIONS[a].shape(bufA);
  if (b !== a) STATIONS[b].shape(bufB);
  return { m, same: a === b };
}

/* sprites: soft glow dots */
function sprite(r, g, bl) {
  // 96px sprite: a crisp solid core with a soft halo, so dots stay sharp on 3x phone screens
  const S = 96, c = document.createElement("canvas"); c.width = c.height = S; const x = c.getContext("2d"), m = S / 2;
  const halo = x.createRadialGradient(m, m, 0, m, m, m);
  halo.addColorStop(0, `rgba(${r},${g},${bl},0.35)`); halo.addColorStop(0.35, `rgba(${r},${g},${bl},0.16)`); halo.addColorStop(1, `rgba(${r},${g},${bl},0)`);
  x.fillStyle = halo; x.fillRect(0, 0, S, S);
  x.beginPath(); x.arc(m, m, S * 0.17, 0, Math.PI * 2); x.fillStyle = `rgb(${r},${g},${bl})`; x.fill();
  x.beginPath(); x.arc(m, m, S * 0.09, 0, Math.PI * 2); x.fillStyle = `rgb(255,${Math.min(255, g + 90)},${Math.min(255, bl + 110)})`; x.fill();
  return c;
}
const SP_EMBER = sprite(255, 90, 31), SP_HOT = sprite(255, 150, 80);

const waves = []; // shockwaves {x,y,t0}
function shock(x, y, power = 1) { waves.push({ x, y, t0: performance.now(), power }); }

let last = performance.now(), perfF = 0, perfT = 0;
function frame(now) {
  const dt = Math.min(0.05, (now - last) / 1000); last = now; T += reduce ? dt * 0.25 : dt;
  // adapt the particle count to what this device can carry (checked every 45 frames)
  if (loaded && !reduce && !document.hidden) {
    perfF++; perfT += dt;
    if (perfF >= 45) {
      const avg = perfT / perfF; perfF = 0; perfT = 0;
      if (avg > 0.021 && NA > NMIN) NA = Math.max(NMIN, (NA * 0.8) | 0);
      else if (avg < 0.0145 && NA < N) NA = Math.min(N, (NA * 1.08) | 0);
    }
  }
  const lv = lenis ? lenis.velocity : 0; vel = lerp(vel, lv, 0.1);
  energy *= 0.94;

  // targets
  let m = 0, same = true;
  if (STATIONS.length && STATIONS[0].st) ({ m, same } = currentTargets());
  if (intro < 1) loaderShape(bufL);

  ctx.clearRect(0, 0, W, H);
  ctx.globalCompositeOperation = "lighter";
  const base = mobile ? 4.2 : 4.4;
  const spring = loaded ? 0.055 : 0.028, damp = 0.8;
  const mr = mobile ? 0 : 130;
  const nowW = performance.now();
  for (let i = waves.length - 1; i >= 0; i--) if (nowW - waves[i].t0 > 1600) waves.splice(i, 1);

  for (let i = 0, j = 0; i < NA; i++, j += 4) {
    let tx, ty, ta, ts;
    if (STATIONS.length && STATIONS[0].st) {
      if (same) { tx = bufA[j]; ty = bufA[j + 1]; ta = bufA[j + 2]; ts = bufA[j + 3]; }
      else {
        // staggered blend: each particle leaves at a slightly different moment
        const mi = ease(clamp(0, 1, m * 1.5 - R3[i] * 0.5));
        tx = lerp(bufA[j], bufB[j], mi); ty = lerp(bufA[j + 1], bufB[j + 1], mi);
        ta = lerp(bufA[j + 2], bufB[j + 2], mi); ts = lerp(bufA[j + 3], bufB[j + 3], mi);
        // a little swirl while travelling
        const sw = Math.sin(mi * Math.PI) * 60 * (R1[i] - 0.5);
        tx += sw; ty += sw * 0.6;
      }
    } else { tx = bufL[j]; ty = bufL[j + 1]; ta = bufL[j + 2]; ts = bufL[j + 3]; }
    if (intro < 1) {
      const k = ease(clamp(0, 1, intro * 1.4 - R3[i] * 0.4));
      tx = lerp(bufL[j], tx, k); ty = lerp(bufL[j + 1], ty, k); ta = lerp(bufL[j + 2], ta, k); ts = lerp(bufL[j + 3], ts, k);
    }
    let vx = VX[i], vy = VY[i];
    vx = vx * damp + (tx - X[i]) * spring * K[i];
    vy = vy * damp + (ty - Y[i]) * spring * K[i];
    if (mr) {
      const dx = X[i] - mouseX, dy = Y[i] - mouseY, d2 = dx * dx + dy * dy;
      if (d2 < mr * mr && d2 > 1) { const d = Math.sqrt(d2), f = Math.pow(1 - d / mr, 2) * 3.2; vx += dx / d * f; vy += dy / d * f; }
    }
    for (let w = 0; w < waves.length; w++) {
      const wv = waves[w], age = (nowW - wv.t0) / 1000, rad = age * 1300, dx = X[i] - wv.x, dy = Y[i] - wv.y, d = Math.hypot(dx, dy);
      const band = Math.abs(d - rad);
      if (band < 90 && d > 1) { const f = (1 - band / 90) * 14 * wv.power * (1 - age / 1.6); vx += dx / d * f; vy += dy / d * f; }
    }
    VX[i] = vx; VY[i] = vy; X[i] += vx; Y[i] += vy;
    AL[i] = lerp(AL[i], ta, 0.08); SZ[i] = lerp(SZ[i], ts, 0.1);
    const a = Math.min(1, AL[i] * (loaded ? 1 : 0.4 + intro * 0.6 + 0.0));
    if (a < 0.02) continue;
    const x = X[i], y = Y[i]; if (x < -20 || x > W + 20 || y < -20 || y > H + 20) continue;
    const s = base * SZ[i];
    ctx.globalAlpha = a;
    ctx.drawImage(R3[i] > 0.86 ? SP_HOT : SP_EMBER, x - s, y - s, s * 2, s * 2);
  }
  ctx.globalAlpha = 1; ctx.globalCompositeOperation = "source-over";
  requestAnimationFrame(frame);
}

/* ---------------- cursor + magnetic ---------------- */
if (fine) {
  const cur = $(".cursor"), dot = $(".cur-dot"), ring = $(".cur-ring"), label = $(".cur-label");
  let rx = 0, ry = 0, tx = 0, ty = 0;
  addEventListener("pointermove", e => { tx = e.clientX; ty = e.clientY; mouseX = e.clientX; mouseY = e.clientY; dot.style.transform = `translate(${tx}px,${ty}px)`; }, { passive: true });
  addEventListener("pointerleave", () => { mouseX = mouseY = -9999; });
  gsap.ticker.add(() => { rx = lerp(rx, tx, 0.18); ry = lerp(ry, ty, 0.18); ring.style.transform = `translate(${rx}px,${ry}px)`; });
  document.addEventListener("pointerover", e => {
    const el = e.target.closest("[data-cursor]");
    if (el) { label.textContent = el.dataset.cursor; cur.classList.add("has-label"); } else cur.classList.remove("has-label");
  });
  $$(".magnetic").forEach(el => {
    const qx = gsap.quickTo(el, "x", { duration: 0.5, ease: "power3.out" }), qy = gsap.quickTo(el, "y", { duration: 0.5, ease: "power3.out" });
    el.addEventListener("pointermove", e => { const r = el.getBoundingClientRect(); qx((e.clientX - r.left - r.width / 2) * 0.35); qy((e.clientY - r.top - r.height / 2) * 0.45); });
    el.addEventListener("pointerleave", () => { gsap.to(el, { x: 0, y: 0, duration: 1, ease: "elastic.out(1,0.35)" }); });
  });
}
addEventListener("pointerdown", e => { if (e.target.closest("a,button,summary,#ba")) return; shock(e.clientX, e.clientY, 0.6); energy = Math.min(1, energy + 0.4); });

/* =====================================================================
   SCROLL CHOREOGRAPHY
   ===================================================================== */
const heroChars = split($(".hero-title"));
const splitMap = new Map();
$$(".split").forEach(el => { if (!el.classList.contains("hero-title")) splitMap.set(el, split(el)); });

const live = id => { const el = document.getElementById(id); return !el || el.classList.contains("is-live"); };
const io = new IntersectionObserver(es => es.forEach(e => e.target.classList.toggle("is-live", e.isIntersecting)), { rootMargin: "200px 0px" });
$$("main > section").forEach(s => io.observe(s));

function setupScroll() {
  // generic: split headings, reveals, typed labels
  splitMap.forEach((chars, el) => {
    if (el.id === "liftoff") return;
    gsap.from(chars, { yPercent: 115, rotate: 7, opacity: 0, filter: "blur(10px)", stagger: 0.016, duration: 1.15, ease: "expo.out",
      scrollTrigger: { trigger: el, start: "top 85%" } });
  });
  $$(".reveal").forEach(el => {
    if (el.closest(".hero")) return;
    gsap.to(el, { opacity: 1, y: 0, duration: 1.1, ease: "expo.out", scrollTrigger: { trigger: el, start: "top 88%" } });
  });
  $$(".label.type").forEach(el => { if (el.closest(".hero")) return; el.dataset.text = el.textContent; el.textContent = ""; ScrollTrigger.create({ trigger: el, start: "top 88%", once: true, onEnter: () => typeOut(el) }); });

  /* ---- 02 problem ---- */
  const words = (() => { const h = $(".scrub-words"); const out = []; const walk = node => { [...node.childNodes].forEach(n => { if (n.nodeType === 3) { const f = document.createDocumentFragment(); n.textContent.split(/(\s+)/).forEach(p => { if (!p) return; if (/^\s+$/.test(p)) { f.appendChild(document.createTextNode(" ")); return; } const s = document.createElement("span"); s.className = "sw"; s.textContent = p; out.push(s); f.appendChild(s); }); n.replaceWith(f); } else walk(n); }); }; walk(h); return out; })();
  const stats = $$(".stat");
  const counted = new Set();
  const countUp = (st) => { if (counted.has(st)) return; counted.add(st); const n = st.querySelector("[data-to]"); const o = { v: 0 }; gsap.to(st, { opacity: 1, y: 0, duration: 0.9, ease: "expo.out" }); gsap.to(o, { v: +n.dataset.to, duration: 1.6, ease: "expo.out", onUpdate: () => n.textContent = Math.round(o.v) }); };
  // the crowd: 100 dots = 100 hungry people
  const grid = $("#crowd-grid"), dots = [];
  for (let i = 0; i < 100; i++) { const d = document.createElement("i"); d.style.setProperty("--d", (Math.random() * 0.45).toFixed(2) + "s"); grid.appendChild(d); dots.push(d); }
  let sd = 11; const srnd = () => ((sd = (sd * 16807) % 2147483647) / 2147483647);
  const pick = n => { const idx = [...Array(100).keys()]; for (let i = 99; i > 0; i--) { const j = (srnd() * (i + 1)) | 0; [idx[i], idx[j]] = [idx[j], idx[i]]; } return new Set(idx.slice(0, n)); };
  const S77 = pick(77), S70 = pick(70), S53 = pick(53);
  dots.forEach((d, i) => { d.style.setProperty("--gx", ((srnd() - 0.5) * 120).toFixed(0) + "px"); d.style.setProperty("--gy", (-60 - srnd() * 140).toFixed(0) + "px"); });
  const CROWD = [
    { n: 100, tag: tr("100 hungry people nearby", "100 hongerige mensen in de buurt"), cap: tr("Every dot is someone deciding where to eat tonight.", "Elke stip is iemand die kiest waar hij vanavond eet.") },
    { n: 77, tag: tr("Look you up first", "Zoeken je eerst op"), cap: tr("77 of them check your website before they come.", "77 van hen bekijken je website voordat ze komen.") },
    { n: 70, tag: tr("Turned away by a website", "Afgeschrikt door een website"), cap: tr("~70 have skipped a restaurant because of its site. Empty seats.", "~70 sloegen weleens een restaurant over door de website. Lege stoelen.") },
    { n: 53, tag: tr("Gone after 3 seconds", "Weg na 3 seconden"), cap: tr("53 leave if your page takes more than 3 seconds to load. Never coming in.", "53 haken af als je pagina langer dan 3 seconden laadt. Die komen nooit binnen.") }
  ];
  let cState = -1; const cnt = { v: 100 };
  const setCrowd = k => {
    if (k === cState) return; cState = k;
    dots.forEach((d, i) => {
      d.className = "";
      if (k === 1 && S77.has(i)) d.className = "lit";
      if (k === 2) d.className = S70.has(i) ? "off" : "lit";
      if (k === 3) d.className = S53.has(i) ? "gone" : "lit";
    });
    $("#crowd").dataset.state = k;
    $("#crowd-tag").textContent = CROWD[k].tag; $("#crowd-cap").textContent = CROWD[k].cap;
    gsap.to(cnt, { v: CROWD[k].n, duration: 0.9, ease: "expo.out", onUpdate: () => $("#crowd-n").textContent = Math.round(cnt.v) });
    if (k === 3) { const r = $("#crowd").getBoundingClientRect(); shock(r.left + r.width / 2, r.top + r.height * 0.4, 0.45); energy = Math.min(1, energy + 0.5); }
  };
  setCrowd(0);
  const problemUpdate = p => {
    const lit = Math.floor(clamp(0, 1, p / 0.3) * words.length);
    words.forEach((w, i) => { w.style.opacity = i < lit ? 1 : 0.16; });
    if (p > 0.32) countUp(stats[0]);
    if (p > 0.5) countUp(stats[1]);
    if (p > 0.68) countUp(stats[2]);
    setCrowd(p > 0.68 ? 3 : p > 0.5 ? 2 : p > 0.32 ? 1 : 0);
  };
  if (!mobile) {
    ScrollTrigger.create({ trigger: "#why", start: "top top", end: "+=220%", pin: true, scrub: true, onUpdate: s => problemUpdate(s.progress) });
  } else {
    words.forEach(w => w.style.opacity = 1);
    stats.forEach((st, i) => ScrollTrigger.create({ trigger: st, start: "top 85%", once: true, onEnter: () => countUp(st) }));
    // phones: hold the crowd card in the middle of the screen; scrolling steps it 100 → 77 → 70 → 53,
    // then the last state stays up for a beat before the page lets go
    ScrollTrigger.config({ ignoreMobileResize: true });
    const steps = document.createElement("div"); steps.className = "crowd-steps"; steps.setAttribute("aria-hidden", "true");
    steps.innerHTML = "<i></i><i></i><i></i>"; $("#crowd").appendChild(steps);
    const ticks = [...steps.children];
    ScrollTrigger.create({ trigger: ".problem-right", pin: ".problem-right", start: "center center", end: "+=180%", pinSpacing: true, anticipatePin: 1, scrub: true,
      onUpdate: s => { const p = s.progress; const k = p > 0.66 ? 3 : p > 0.4 ? 2 : p > 0.12 ? 1 : 0; setCrowd(k); ticks.forEach((t, i) => t.classList.toggle("on", i < k)); } });
  }

  /* ---- 03 takeoff ---- */
  const ms = $$(".ms"), liftChars = splitMap.get($("#liftoff"));
  const box = $("#chart-box");
  const placeMs = () => { const b = box.getBoundingClientRect(); ms.forEach(m => { const s = clamp(0, 1, +m.dataset.at / 0.5); const [x, y] = curvePt(s, b); m.style.left = (x - b.left) + "px"; m.style.top = (y - b.top) + "px"; }); };
  placeMs(); addEventListener("resize", placeMs);
  let shook = false;
  const takeUpdate = p => {
    takeP = p;
    ms.forEach(m => { const on = p > +m.dataset.at && p < 0.53; m.style.opacity = on ? 1 : 0; m.style.transform = `translate(-50%,${on ? -130 : -100}%)`; });
    $(".takeoff-copy").style.opacity = 1 - clamp(0, 1, (p - 0.62) / 0.1);
    const l = clamp(0, 1, (p - 0.8) / 0.12);
    $("#liftoff").style.opacity = l > 0 ? 1 : 0;
    liftChars.forEach((c, i) => { const k = clamp(0, 1, l * 1.6 - i / liftChars.length * 0.6); c.style.transform = `translateY(${(1 - easeOut3(k)) * 110}%)`; c.style.opacity = k; });
    if (p > 0.62 && !shook) { shook = true; gsap.fromTo(".takeoff-inner", { x: -3 }, { x: 3, duration: 0.05, repeat: 9, yoyo: true, clearProps: "x" }); energy = 1; }
    if (p < 0.55) shook = false;
  };
  ms.forEach(m => m.style.transition = "opacity .5s, transform .6s cubic-bezier(.2,.8,.2,1)");
  ScrollTrigger.create({ trigger: "#takeoff", start: "top top", end: mobile ? "+=220%" : "+=280%", pin: true, scrub: true, onUpdate: s => takeUpdate(s.progress) });

  /* ---- 04 how: horizontal ---- */
  const track = $("#how-track");
  if (!mobile) {
    const dist = () => Math.max(0, track.scrollWidth - innerWidth);
    const steps = $$(".step");
    const lightSteps = () => steps.forEach(st => { const r = st.getBoundingClientRect(), c = r.left + r.width / 2; st.classList.toggle("on", c > innerWidth * 0.08 && c < innerWidth * 0.92 && r.left < innerWidth * 0.72); });
    const tl = gsap.timeline({ scrollTrigger: { trigger: ".how-pin", start: "top top", end: () => "+=" + (dist() * 1.3 + innerHeight * 0.9), pin: true, scrub: 0.6, invalidateOnRefresh: true,
      onUpdate: s => { $("#how-bar").style.transform = `scaleX(${s.progress})`; lightSteps(); }, onRefresh: lightSteps } });
    tl.to({}, { duration: 0.22 }).to(track, { x: () => -dist(), ease: "none", duration: 1 }).to({}, { duration: 0.14 });
    lightSteps();
  } else {
    $$(".step").forEach(st => ScrollTrigger.create({ trigger: st, start: "top 70%", end: "bottom 30%", toggleClass: "on" }));
  }
  // marquee driven by scroll velocity
  const marq = $("#marq"); let mx = 0, skew = 0, half = marq.scrollWidth / 2;
  addEventListener("resize", () => { half = marq.scrollWidth / 2; });
  document.fonts && document.fonts.ready.then(() => { half = marq.scrollWidth / 2; });
  gsap.ticker.add(() => {
    if (!live("how")) return; mx -= 0.6 + Math.abs(vel) * 0.06; if (-mx > half) mx += half;
    skew = lerp(skew, clamp(-14, 14, vel * 0.35), 0.1);
    marq.style.transform = `translateX(${mx}px) skewX(${-skew}deg)`;
  });

  /* ---- 05 work deck ---- */
  const cards = $$(".card");
  gsap.from(cards, { y: 260, rotate: i => (i - 1) * 16, rotationY: i => (i - 1) * -30, opacity: 0, stagger: 0.12, duration: 1.6, ease: "expo.out", scrollTrigger: { trigger: "#deck", start: "top 85%" } });
  if (fine) cards.forEach(c => {
    const rx = gsap.quickTo(c, "rotationX", { duration: 0.6, ease: "power3.out" }), ry = gsap.quickTo(c, "rotationY", { duration: 0.6, ease: "power3.out" }), ty = gsap.quickTo(c, "y", { duration: 0.6, ease: "power3.out" });
    c.addEventListener("pointermove", e => { const r = c.getBoundingClientRect(); const px = (e.clientX - r.left) / r.width - 0.5, py = (e.clientY - r.top) / r.height - 0.5; ry(px * 22); rx(-py * 16); ty(-16); });
    c.addEventListener("pointerleave", () => { rx(0); ry(0); ty(0); });
  });

  /* ---- 06 bento micro-animations ---- */
  // tiles rise in; transforms are cleared at the end so nothing can be left half-moved.
  // phones stack the tiles in one tall column, so each tile gets its own trigger there.
  if (!mobile) gsap.from(".tile", { y: 80, opacity: 0, scale: 0.94, stagger: 0.07, duration: 1.2, ease: "expo.out", clearProps: "transform", scrollTrigger: { trigger: "#bento", start: "top 80%" } });
  else $$(".tile").forEach(t => gsap.from(t, { y: 40, opacity: 0, duration: 0.9, ease: "expo.out", clearProps: "transform", scrollTrigger: { trigger: t, start: "top 92%" } }));
  ScrollTrigger.create({ trigger: ".t-speed", start: "top 80%", once: true, onEnter: () => {
    const o = { a: 0, b: 0 };
    gsap.to(".r-ours", { width: "100%", duration: 0.9, ease: "power2.out" });
    gsap.to(o, { a: 0.9, duration: 0.9, ease: "power2.out", onUpdate: () => $("#race-ours").textContent = o.a.toFixed(1) + "s" });
    gsap.to(".r-old", { width: "41%", duration: 4.5, ease: "power1.out" });
    gsap.to(o, { b: 6.8, duration: 6.8, ease: "none", onUpdate: () => $("#race-old").textContent = o.b.toFixed(1) + "s" });
  } });
  const flipWords = ["Welkom.", "Welcome.", "Proost.", "Cheers.", "Eet smakelijk.", "Enjoy."]; let fw = 0;
  setInterval(() => { if (!live("inside")) return; const el = $("#flip"); gsap.to(el, { rotationX: 90, opacity: 0, duration: 0.25, ease: "power2.in", onComplete: () => { fw = (fw + 1) % flipWords.length; el.textContent = flipWords[fw]; gsap.fromTo(el, { rotationX: -90, opacity: 0 }, { rotationX: 0, opacity: 1, duration: 0.4, ease: "back.out(2)" }); } }); }, 2000);
  const queries = ["matcha zeedijk", "coffee de pijp", "matcha latte near me", "hong kong milk tea amsterdam"]; let qi = 0;
  (function typeLoop() {
    if (!live("inside")) { setTimeout(typeLoop, 800); return; }
    const el = $("#typed"), q = queries[qi]; let k = 0;
    const tIn = setInterval(() => { el.textContent = q.slice(0, ++k); if (k >= q.length) { clearInterval(tIn); setTimeout(() => { const tOut = setInterval(() => { el.textContent = q.slice(0, --k); if (k <= 0) { clearInterval(tOut); qi = (qi + 1) % queries.length; setTimeout(typeLoop, 300); } }, 30); }, 1500); } }, 70);
  })();

  /* ---- 07 proof: before / after + score ---- */
  const ba = $("#ba"), baNew = $("#ba-new"), seam = $("#ba-seam");
  const setBA = pct => { pct = clamp(0, 100, pct); baNew.style.clipPath = `inset(0 0 0 ${pct}%)`; seam.style.left = pct + "%"; };
  let dragging = false, lastShock = 0;
  const fromEvent = e => { const r = ba.getBoundingClientRect(); return (e.clientX - r.left) / r.width * 100; };
  ba.addEventListener("pointerdown", e => { dragging = true; ba.setPointerCapture(e.pointerId); gsap.killTweensOf(baObj); setBA(fromEvent(e)); });
  ba.addEventListener("pointermove", e => { if (!dragging) return; setBA(fromEvent(e)); const n = performance.now(); if (n - lastShock > 120) { lastShock = n; const r = seam.getBoundingClientRect(); shock(r.left, e.clientY, 0.25); } });
  ba.addEventListener("pointerup", () => dragging = false);
  const baObj = { v: 50 };
  ScrollTrigger.create({ trigger: ba, start: "top 70%", once: true, onEnter: () => {
    gsap.timeline().to(baObj, { v: 88, duration: 1, ease: "power3.inOut", onUpdate: () => setBA(baObj.v) })
      .to(baObj, { v: 8, duration: 1.4, ease: "power3.inOut", onUpdate: () => setBA(baObj.v) })
      .to(baObj, { v: 40, duration: 1, ease: "power3.inOut", onUpdate: () => setBA(baObj.v) });
  } });
  const SCORE = window.DOLCESSI_SCORE || null; // set from a real Lighthouse run
  const scoreEl = $("#score");
  if (SCORE) {
    ScrollTrigger.create({ trigger: ".score", start: "top 85%", once: true, onEnter: () => {
      const o = { v: 0 };
      gsap.to(o, { v: SCORE.value, duration: 2.2, ease: "expo.out", onUpdate: () => { scoreEl.textContent = Math.round(o.v); $("#ring").style.strokeDashoffset = 326.7 * (1 - o.v / 100); } });
    } });
    $("#score-src").textContent = tr(SCORE.label, "Lighthouse mobiel · labtest van ons RELOAD-concept · nov 2026");
  } else { scoreEl.textContent = "—"; $("#score-src").textContent = tr("Measured with Lighthouse at launch", "Gemeten met Lighthouse bij lancering"); }

  /* ---- 08 faq: smooth open ---- */
  $$("#acc details").forEach(d => d.addEventListener("toggle", () => { if (d.open) gsap.fromTo(d.querySelector("p"), { opacity: 0, y: -8 }, { opacity: 1, y: 0, duration: 0.5, ease: "expo.out" }); setTimeout(() => ScrollTrigger.refresh(), 60); }));

  /* ---- 09 ask ---- */
  /* ---- the "Show me my site" form (opens from every CTA) ---- */
  const askm = $("#askm"), form = $("#ask-form"), steps = $$("#ask-form .fstep"), bar = $("#askm-bar"), err = $("#askm-err");
  const shopifyMode = form.dataset.mode === "shopify";
  let lastFocus = null;
  const showStep = n => {
    steps.forEach(s => s.classList.toggle("is-on", +s.dataset.step === n));
    bar.style.width = n === 1 ? "50%" : "100%";
    const on = steps.find(s => +s.dataset.step === n);
    gsap.fromTo(on.children, { y: 18, opacity: 0 }, { y: 0, opacity: 1, stagger: 0.05, duration: 0.6, ease: "expo.out" });
    const first = on.querySelector("input:not([type=hidden]),button"); if (first && fine) setTimeout(() => first.focus(), 80);
    err.hidden = true;
  };
  const openAsk = (step = 1, from) => {
    lastFocus = document.activeElement;
    askm.hidden = false; if (lenis) lenis.stop(); document.documentElement.style.overflow = "hidden";
    gsap.fromTo(".askm-bg", { opacity: 0 }, { opacity: 1, duration: 0.4 });
    gsap.fromTo(".askm-panel", { y: 60, opacity: 0, scale: 0.96 }, { y: 0, opacity: 1, scale: 1, duration: 0.8, ease: "expo.out" });
    showStep(step);
    if (from) { const r = from.getBoundingClientRect(); shock(r.left + r.width / 2, r.top + r.height / 2, 1.2); } energy = 1;
  };
  const closeAsk = () => {
    gsap.to(".askm-panel", { y: 40, opacity: 0, duration: 0.35, ease: "power2.in" });
    gsap.to(".askm-bg", { opacity: 0, duration: 0.35, onComplete: () => { askm.hidden = true; document.documentElement.style.overflow = ""; if (lenis) lenis.start(); if (lastFocus) lastFocus.focus({ preventScroll: true }); } });
  };
  $$("[data-open-ask]").forEach(b => b.addEventListener("click", e => { e.preventDefault(); e.stopImmediatePropagation(); openAsk(1, b); }, true));
  askm.addEventListener("click", e => { if (e.target.closest("[data-close]")) closeAsk(); });
  addEventListener("keydown", e => { if (e.key === "Escape" && !askm.hidden) closeAsk(); });
  const bad = (el, msg) => { const f = el.closest(".fld"); f.classList.add("bad"); f.classList.remove("shake"); void f.offsetWidth; f.classList.add("shake"); err.textContent = msg; err.hidden = false; el.focus(); return false; };
  $$("#ask-form input").forEach(i => i.addEventListener("input", () => { const f = i.closest(".fld"); if (f) f.classList.remove("bad"); err.hidden = true; }));
  const restName = () => $("#f-rest").value.trim();
  const toStep2 = () => {
    if (!restName()) return bad($("#f-rest"), tr("Tell us the restaurant’s name first.", "Vul eerst de naam van het restaurant in."));
    $("#askm-hint").innerHTML = tr("We’ll start sketching <b></b> right away.", "We beginnen meteen met schetsen voor <b></b>.");
    $("#askm-hint b").textContent = restName();
    showStep(2);
  };
  $("#to2").addEventListener("click", toStep2);
  $("#f-rest").addEventListener("keydown", e => { if (e.key === "Enter") { e.preventDefault(); toStep2(); } });
  $("#f-area").addEventListener("keydown", e => { if (e.key === "Enter") { e.preventDefault(); toStep2(); } });
  $("#back1").addEventListener("click", () => showStep(1));
  form.addEventListener("submit", e => {
    if (!steps[1].classList.contains("is-on")) { e.preventDefault(); toStep2(); return; }
    const name = $("#f-name").value.trim(), email = $("#f-email").value.trim(), phone = $("#f-phone").value.trim();
    if (!name) { e.preventDefault(); return bad($("#f-name"), tr("What should we call you?", "Hoe mogen we je noemen?")); }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) { e.preventDefault(); return bad($("#f-email"), tr("That email doesn’t look right yet.", "Dat e-mailadres klopt nog niet helemaal.")); }
    const area = $("#f-area").value.trim();
    $("#f-body").value = `Show me my site\nRestaurant: ${restName()}${area ? "\nNeighbourhood: " + area : ""}\nName: ${name}\nEmail: ${email}${phone ? "\nPhone/WhatsApp: " + phone : ""}`;
    try { sessionStorage.setItem("dol-rest", restName()); } catch (x) {}
    if (shopifyMode) { $("#send").disabled = true; $("#send").textContent = tr("Sending…", "Versturen…"); return; } // real submit to Shopify
    e.preventDefault();
    location.href = "mailto:info@dolcessi.com?subject=" + encodeURIComponent(tr("Show me my site: ", "Laat mijn site zien: ") + restName()) + "&body=" + encodeURIComponent($("#f-body").value);
    $("#askm-done").textContent = tr("Your email app should open with everything filled in. Just hit send. No email app? Write to info@dolcessi.com.", "Je mailapp opent met alles al ingevuld. Druk op versturen. Geen mailapp? Mail naar info@dolcessi.com.");
    showStep(3); energy = 1; shock(innerWidth / 2, innerHeight / 2, 1.5);
  });
  // coming back from Shopify after sending
  const sent = form.querySelector("[data-sent]") || /contact_posted=true/.test(location.search);
  const sendErr = form.querySelector("[data-err]");
  window.__askReturn = () => {
    let r = ""; try { r = sessionStorage.getItem("dol-rest") || ""; } catch (x) {}
    if (sent) { openAsk(3); if (r) { $("#askm-done").innerHTML = tr("We’ll get back to you soon with the concept for <b></b>. Keep an eye on your inbox.", "We komen snel bij je terug met het concept voor <b></b>. Houd je inbox in de gaten."); $("#askm-done b").textContent = r; } shock(innerWidth / 2, innerHeight / 2, 1.8); }
    else if (sendErr) { openAsk(2); err.textContent = sendErr.textContent.trim() || tr("Something went wrong. Please try again.", "Er ging iets mis. Probeer het nog eens."); err.hidden = false; }
  };

  // the ghost card: a name waiting to be written
  const ghostNames = NLg ? ["Jouw restaurant", "Jouw eethuis", "Jouw café", "Jouw bistro", "Jouw dumplingbar", "Jouw noedelzaak"] : ["Your restaurant", "Your eethuis", "Your café", "Your bistro", "Your dumpling bar", "Your noodle place"];
  let gi = 0;
  (function ghostLoop() {
    if (!live("proof")) { setTimeout(ghostLoop, 800); return; }
    const els = $$(".ghost-name"), word = ghostNames[gi]; let k = word.length;
    const del = setInterval(() => { k--; els.forEach(el => el.textContent = word.slice(0, k)); if (k <= 0) { clearInterval(del); gi = (gi + 1) % ghostNames.length; const nw = ghostNames[gi]; let j = 0;
      const add = setInterval(() => { j++; els.forEach(el => el.textContent = nw.slice(0, j)); if (j >= nw.length) { clearInterval(add); setTimeout(ghostLoop, 1800); } }, 70); } }, 35);
  })();

  /* ---- particle stations (after pins so spacers exist) ---- */
  const spacer = el => (el.parentElement && el.parentElement.classList.contains("pin-spacer")) ? el.parentElement : el;
  station($("#hero"), anchorSphere("#a-hero", 0.18, 0.05, 1));
  station($("#why"), rectShape(["#crowd"], 26));
  station($("#takeoff"), chartRocket);
  station($("#how"), starShape);
  station($("#work"), orbit);
  station($("#inside"), rectShape(["#bento .tile"], 20));
  station($("#proof"), rectShape(["#ba", ".score"], 30));
  station($("#faq"), starShape);
  station($("#ask"), anchorSphere("#a-sun", 0.06, 0.035, 0.85));
  STATIONS.forEach(s => {
    const pinned = s.el.id === "takeoff" || (s.el.id === "why" && !mobile);
    s.st = ScrollTrigger.create({ trigger: spacer(s.el.id === "how" && !mobile ? $(".how-pin") : s.el), start: pinned ? "top top" : "top 35%", end: pinned ? "bottom bottom" : "bottom 65%" });
  });
  ScrollTrigger.refresh();
}

/* ---------------- preloader → hero ---------------- */
requestAnimationFrame(frame);
function start() {
  setupScroll();
  const count = $("#count"), bar = $("#loadbar"), o = { v: 0 };
  let seen = false; try { seen = sessionStorage.getItem("dol-seen") === "1"; sessionStorage.setItem("dol-seen", "1"); } catch (e) {}
  const dur = reduce ? 0.3 : seen ? 0.6 : 1.7;
  gsap.to(o, { v: 100, duration: dur, ease: "power2.inOut", onUpdate: () => { count.textContent = String(Math.round(o.v)).padStart(2, "0"); bar.style.transform = `scaleX(${o.v / 100})`; },
    onComplete: () => {
      energy = 1;
      const tl = gsap.timeline();
      tl.to(".loader-count", { yPercent: -100, opacity: 0, duration: 0.7, ease: "expo.in" })
        .to(".loader-line,.loader-word", { opacity: 0, duration: 0.4 }, "<")
        .add(() => {
          document.body.classList.remove("is-loading"); $("#loader").style.display = "none";
          loaded = true; if (lenis) lenis.start(); ScrollTrigger.refresh();
          gsap.to({ v: 0 }, { v: 1, duration: 1.8, ease: "expo.inOut", onUpdate() { intro = this.targets()[0].v; } });
          $$(".hero .label.type").forEach(typeOut);
          gsap.from(heroChars, { yPercent: 120, rotate: 8, opacity: 0, filter: "blur(12px)", stagger: 0.022, duration: 1.3, ease: "expo.out", delay: 0.15,
            onComplete: () => {
              // on scroll-out the headline comes apart, letter by letter
              if (reduce) return;
              gsap.to(heroChars, { y: () => -60 - Math.random() * 220, x: () => (Math.random() - 0.5) * 160, rotationZ: () => (Math.random() - 0.5) * 70, opacity: 0, filter: "blur(6px)", ease: "none", stagger: { each: 0.01, from: "random" },
                scrollTrigger: { trigger: "#hero", start: "top top", end: "bottom 25%", scrub: 0.8 } });
              gsap.to(".hero-sub,.hero-ctas,.hero .label", { y: -60, opacity: 0, ease: "none", scrollTrigger: { trigger: "#hero", start: "10% top", end: "bottom 35%", scrub: 0.8 } });
            } });
          gsap.to(".hero .reveal", { opacity: 1, y: 0, stagger: 0.12, duration: 1.2, ease: "expo.out", delay: 0.6 });
          gsap.fromTo(".nav", { y: -30, opacity: 0 }, { y: 0, opacity: 1, duration: 1, ease: "expo.out", delay: 0.4 });
          gsap.fromTo(".hero-foot", { opacity: 0 }, { opacity: 1, duration: 1, delay: 1 });
          if (window.__askReturn) setTimeout(window.__askReturn, 900);
        });
    } });
}
let started = false; const go = () => { if (!started) { started = true; start(); } };
if (document.fonts && document.fonts.ready) document.fonts.ready.then(go); setTimeout(go, 1500);

window.__dolcessi = { stations: STATIONS, lenis, get takeP() { return takeP; } };
})();

