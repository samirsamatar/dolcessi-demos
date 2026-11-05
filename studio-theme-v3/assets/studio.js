/*! Dolcessi studio v3 — page orchestration (i18n, stages, motion, dialog). */
(function () {
  'use strict';
  var d = document, html = d.documentElement, W = window;
  var $ = function (s, r) { return (r || d).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || d).querySelectorAll(s)); };
  var clamp = function (v, a, b) { return v < a ? a : v > b ? b : v; };
  var lerp = function (a, b, t) { return a + (b - a) * t; };
  var sstep = function (t) { t = clamp(t, 0, 1); return t * t * (3 - 2 * t); };
  var mq = function (q) { return W.matchMedia(q).matches; };

  var REDUCE = mq('(prefers-reduced-motion: reduce)');
  var FINE = mq('(hover: hover) and (pointer: fine)');
  var isNarrow = function () { return innerWidth <= 860; };
  var gsap = W.gsap, ST = W.ScrollTrigger;
  var HAS_GSAP = !!(gsap && ST) && !REDUCE;
  var params = new URLSearchParams(location.search);
  var lenis = null;

  html.classList.remove('no-js');

  /* ───────────────────────── i18n ───────────────────────── */
  var LANG = html.classList.contains('is-nl') ? 'nl' : 'en';
  var ATTRS = ['aria-label', 'alt', 'placeholder', 'title'];
  var T = {
    title: { en: 'Dolcessi — Websites for cafés & restaurants in Amsterdam', nl: 'Dolcessi — Websites voor cafés & restaurants in Amsterdam' },
    desc: { en: d.querySelector('meta[name=description]').content, nl: 'Dolcessi bouwt websites van topniveau voor zelfstandige cafés en restaurants in Amsterdam. Wij bouwen je site voordat je erom vraagt: jouw menu, jouw openingstijden, jouw straat. Jij zegt ja, of niet. Binnen dagen live.' },
    errRest: { en: 'Tell us the name of your café or restaurant.', nl: 'Vul de naam van je café of restaurant in.' },
    errName: { en: 'What should we call you?', nl: 'Hoe mogen we je noemen?' },
    errEmail: { en: "That email doesn’t look right.", nl: 'Dat e-mailadres klopt niet helemaal.' },
    sending: { en: 'Sending…', nl: 'Versturen…' },
    open: { en: 'Open now · until 22:00', nl: 'Nu open · tot 22:00' },
    closed: { en: 'Closed · opens 10:00', nl: 'Gesloten · open om 10:00' },
    serverErr: { en: 'Something went wrong sending that. Check your details and try again.', nl: 'Er ging iets mis bij het versturen. Check je gegevens en probeer het opnieuw.' }
  };
  var t = function (k) { return T[k][LANG]; };

  var nlEls = $$('[data-nl]');
  nlEls.forEach(function (el) { if (el._en === undefined) el._en = el.innerHTML; });
  var attrEls = [];
  ATTRS.forEach(function (a) {
    $$('[data-nl-' + a + ']').forEach(function (el) {
      el._enA = el._enA || {};
      if (el._enA[a] === undefined) el._enA[a] = el.getAttribute(a) || '';
      attrEls.push([el, a]);
    });
  });

  function applyLang(l, save) {
    LANG = l;
    html.lang = l;
    html.classList.toggle('is-nl', l === 'nl');
    nlEls.forEach(function (el) {
      var v = l === 'nl' ? el.getAttribute('data-nl') : el._en;
      if (el.innerHTML !== v) el.innerHTML = v;
    });
    attrEls.forEach(function (p) { p[0].setAttribute(p[1], l === 'nl' ? p[0].getAttribute('data-nl-' + p[1]) : p[0]._enA[p[1]]); });
    d.title = t('title');
    var md = $('meta[name=description]'); if (md) md.content = t('desc');
    $$('[data-lang]').forEach(function (b) { b.setAttribute('aria-pressed', b.getAttribute('data-lang') === l ? 'true' : 'false'); });
    if (save) { try { localStorage.setItem('dolcessi_lang', l); } catch (e) { } }
    $$('[data-echo]').forEach(buildGhosts);
    d.dispatchEvent(new CustomEvent('lang', { detail: l }));
  }
  $$('[data-lang]').forEach(function (b) {
    b.addEventListener('click', function () { var l = b.getAttribute('data-lang'); if (l !== LANG) applyLang(l, true); });
  });

  /* ───────────────────────── clock ───────────────────────── */
  var fmt;
  try { fmt = new Intl.DateTimeFormat('en-GB', { timeZone: 'Europe/Amsterdam', hour: '2-digit', minute: '2-digit', hour12: false }); } catch (e) { fmt = null; }
  function amsNow() {
    if (!fmt) { var n = new Date(); return [n.getHours(), n.getMinutes()]; }
    var p = fmt.format(new Date()).split(':'); return [parseInt(p[0], 10) % 24, parseInt(p[1], 10)];
  }
  function pad(n) { return (n < 10 ? '0' : '') + n; }
  function tickClock() {
    var hm = amsNow(), s = pad(hm[0]) + ':' + pad(hm[1]);
    $$('[data-clock]').forEach(function (el) { if (el.textContent !== s) el.textContent = s; el.setAttribute('datetime', s); });
    // live opening-hours tile (example schedule: daily 10:00–22:00)
    var pill = $('[data-open]'), bar = $('[data-open-bar]');
    if (pill) {
      var m = hm[0] * 60 + hm[1], open = m >= 600 && m < 1320;
      pill.classList.toggle('is-closed', !open);
      var tx = $('[data-open-t]'); if (tx) tx.textContent = open ? t('open') : t('closed');
      if (bar) bar.style.setProperty('--p', (clamp((m - 600) / 720, 0, 1) * 100).toFixed(1) + '%');
    }
  }
  tickClock(); setInterval(tickClock, 15000);
  d.addEventListener('lang', tickClock);

  /* ───────────────────────── echo ghosts ───────────────────────── */
  // The echo copies live in a sibling layer (.echo wrapper), never inside the heading,
  // so the heading's text stays clean for search engines, Reader mode and copy-paste.
  function buildGhosts(h) {
    var wrap = h.parentNode;
    if (!wrap.classList || !wrap.classList.contains('echo')) {
      wrap = d.createElement('div'); wrap.className = 'echo';
      h.parentNode.insertBefore(wrap, h); wrap.appendChild(h);
    }
    $$('.ghost', wrap).forEach(function (g) { g.remove(); });
    var inner = h.innerHTML, cls = h.className;
    h._ghosts = [];
    for (var i = 1; i <= 4; i++) {
      var g = d.createElement('div');
      g.className = cls + ' ghost g' + i; g.setAttribute('aria-hidden', 'true'); g.innerHTML = inner;
      wrap.appendChild(g); h._ghosts.push(g);
    }
    placeGhosts(h);
  }
  function placeGhosts(h) {
    var w = h.offsetWidth + 'px', l = h.offsetLeft + 'px', tp = h.offsetTop + 'px';
    (h._ghosts || []).forEach(function (g) { g.style.width = w; g.style.left = l; g.style.top = tp; });
  }
  var echoes = $$('[data-echo]');
  echoes.forEach(buildGhosts);

  // Headline arrival: 4 translucent copies trail behind and converge onto the type (the Relay reel's echo).
  function playEcho(h, dx, dy, delay) {
    if (!HAS_GSAP) return;
    var gs = h._ghosts || [];
    delay = delay || 0;
    placeGhosts(h);
    h._busy = true;
    var dist = clamp(h.offsetHeight * .26, 30, 96);
    gsap.killTweensOf(gs);
    gsap.set(gs, { opacity: function (i) { return [.9, .7, .52, .4][i]; }, x: function (i) { return dx * dist * (i + 1); }, y: function (i) { return dy * dist * (i + 1); } });
    gsap.to(gs, { x: 0, y: 0, duration: 1.1, delay: delay, ease: 'power3.out', stagger: { each: .07, from: 'end' } });
    gsap.to(gs, { opacity: 0, duration: .55, delay: delay + .36, ease: 'power1.in', stagger: { each: .06, from: 'start' }, onComplete: function () { h._busy = false; } });
    gsap.fromTo(h, { opacity: h.id === 'hero-h' ? 1 : 0, y: dy * dist * .45, x: dx * dist * .45, filter: 'blur(5px)' },
      { opacity: 1, x: 0, y: 0, filter: 'blur(0px)', duration: .95, delay: delay + .14, ease: 'power3.out', clearProps: 'filter,transform' });
  }

  /* ───────────────────────── preloader ───────────────────────── */
  var pre = $('#pre');
  var preActive = !!pre && getComputedStyle(pre).display !== 'none' && !REDUCE;
  // Shopify marks a post with [data-sent] / [data-err] in the form; ?contact_posted=true is the fallback
  var postedOk = !!$('#ask-form [data-sent]') || (/[?&]contact_posted=true/.test(location.search) && !$('#ask-form [data-err]'));
  var sentOrErr = postedOk || !!$('#ask-form [data-err]');
  try { sessionStorage.setItem('dolcessi_seen', '1'); } catch (e) { }
  var ignited = false;
  function ignite() {
    if (ignited) return; ignited = true;
    if (pre && preActive) { pre.classList.add('is-out'); setTimeout(function () { pre.classList.add('is-gone'); }, 900); }
    if (W.Aurora && W.Aurora.ok) W.Aurora.ignite(!preActive);
    html.classList.add('is-in');
    var h1 = $('#hero-h'); if (h1) playEcho(h1, -1, .42, preActive ? .12 : 0);
    if (HAS_GSAP && preActive) {
      gsap.fromTo('.hdr', { y: -20, opacity: 0 }, { y: 0, opacity: 1, duration: 1, ease: 'expo.out', delay: .2, clearProps: 'transform,opacity' });
      gsap.to('.hero .label, .hero .lede, .hero .ctas, .hero .facts', { opacity: 1, y: 0, duration: 1.1, ease: 'expo.out', stagger: .08, delay: .28 });
      gsap.fromTo('.sc', { opacity: 0, y: 50, rotationY: -22, rotationX: 10, transformPerspective: 1600 }, { opacity: 1, y: 0, rotationY: isNarrow() ? 0 : -5, rotationX: isNarrow() ? 4 : 2.5, duration: 1.6, ease: 'expo.out', delay: .42 });
    }
  }
  if (sentOrErr && pre) { pre.classList.add('is-gone'); preActive = false; }

  /* ───────────────────────── smooth scroll + GSAP ───────────────────────── */
  if (HAS_GSAP) {
    gsap.registerPlugin(ST);
    ST.config({ ignoreMobileResize: true });
    html.classList.add('anim');
    if (W.Lenis) {
      try {
        // wheel/trackpad only: touch scrolling stays fully native (no scroll-jacking on phones/iOS)
        lenis = new W.Lenis({ lerp: .095, smoothWheel: true, wheelMultiplier: .95, syncTouch: false, smoothTouch: false });
        W.lenis = lenis;
        lenis.on('scroll', ST.update);
        gsap.ticker.add(function (time) { lenis.raf(time * 1000); });
        gsap.ticker.lagSmoothing(0);
      } catch (e) { lenis = null; }
    }
  }
  function scrollToTarget(target) {
    var el = target === '#top' ? 0 : (typeof target === 'string' ? $(target) : target);
    if (lenis) lenis.scrollTo(el, { duration: 1.6, easing: function (x) { return x < .5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2; } });
    else if (el === 0) W.scrollTo({ top: 0, behavior: REDUCE ? 'auto' : 'smooth' });
    else if (el) el.scrollIntoView({ behavior: REDUCE ? 'auto' : 'smooth' });
  }
  d.addEventListener('click', function (e) {
    var a = e.target.closest && e.target.closest('a[href^="#"]');
    if (!a) return;
    var h = a.getAttribute('href'); if (h.length < 2) return;
    if (h !== '#top' && !$(h)) return;
    e.preventDefault(); scrollToTarget(h);
    if (h === '#main') { var m = $('#main'); m.setAttribute('tabindex', '-1'); m.focus({ preventScroll: true }); }
  });

  /* ───────────────────────── reveals, counters ───────────────────────── */
  function countUp(el) {
    var to = parseFloat(el.getAttribute('data-count')), o = { v: 0 };
    if (!HAS_GSAP) { el.textContent = to; return; }
    gsap.to(o, { v: to, duration: 1.8, ease: 'expo.out', onUpdate: function () { el.textContent = Math.round(o.v); } });
  }
  if (HAS_GSAP) {
    ST.batch('[data-reveal]', {
      start: 'top 88%', once: true,
      onEnter: function (els) { gsap.to(els, { opacity: 1, y: 0, duration: 1.1, ease: 'expo.out', stagger: .07, overwrite: true }); }
    });
    echoes.forEach(function (h) {
      if (h.id === 'hero-h') return;
      gsap.set(h, { opacity: 0 });
      ST.create({ trigger: h, start: 'top 84%', once: true, onEnter: function () { playEcho(h, 0, 1, 0); } });
    });
    $$('[data-count]').forEach(function (el) {
      el.textContent = '0';
      ST.create({ trigger: el, start: 'top 90%', once: true, onEnter: function () { countUp(el); } });
    });
    var neon = $('.neon');
    if (neon) ST.create({ trigger: '#why', start: 'top 45%', onEnter: function () { var n = $('.neon'); n.classList.remove('is-flick'); void n.offsetWidth; n.classList.add('is-flick'); } });
    var arc = $('[data-lh-arc]');
    if (arc) ST.create({ trigger: arc, start: 'top 85%', once: true, onEnter: function () { gsap.to(arc, { strokeDashoffset: 326.7 * (1 - .96), duration: 2, ease: 'expo.out' }); } });
  } else {
    var arc2 = $('[data-lh-arc]'); if (arc2) arc2.style.strokeDashoffset = (326.7 * .04).toFixed(1);
  }

  /* ───────────────────────── hero search card ───────────────────────── */
  var SC = [
    { q: { en: 'takoyaki near me', nl: 'takoyaki in de buurt' }, name: 'Osakaball', area: { en: 'De Pijp · Osaka street food', nl: 'De Pijp · Osaka street food' }, slug: 'osakaball' },
    { q: { en: 'matcha zeedijk', nl: 'matcha zeedijk' }, name: 'Miyabi Matcha', area: { en: 'Zeedijk · Matcha bar', nl: 'Zeedijk · Matchabar' }, slug: 'miyabi' },
    { q: { en: 'noodles open now', nl: 'noedels nu open' }, name: 'Mala Wang', area: { en: 'Oosterdok · Sichuan noodles', nl: 'Oosterdok · Sichuan-noedels' }, slug: 'mala-wang' }
  ];
  var scEl = $('[data-sc]');
  if (scEl) {
    var typed = $('[data-typed]', scEl), scImg = $('[data-sc-img]', scEl), scI = 0, scTimer = 0, scVisible = true;
    var srcFor = function (slug) {
      var im = $$('.card img.ph-a').filter(function (i) { return i.getAttribute('src').indexOf('work-' + slug + '.webp') > -1; })[0];
      return im ? im.getAttribute('src') : scImg.getAttribute('src').replace(/work-[a-z-]+\.webp/, 'work-' + slug + '.webp');
    };
    var setRes = function (r, i) {
      $('[data-sc-name]', scEl).textContent = r.name;
      $('[data-sc-area]', scEl).textContent = r.area[LANG];
      $('[data-sc-slug]', scEl).textContent = r.slug;
      $('[data-sc-n]', scEl).textContent = pad(i + 1);
      $('[data-sc-link]', scEl).href = 'https://concept.dolcessi.com/' + r.slug + '/';
      scImg.src = srcFor(r.slug);
    };
    typed.textContent = SC[0].q[LANG];
    $('[data-sc-area]', scEl).textContent = SC[0].area[LANG];
    var typeTo = function (txt, done) {
      if (REDUCE) { typed.textContent = txt; done(); return; }
      var cur = typed.textContent;
      (function del() {
        if (cur.length) { cur = cur.slice(0, -1); typed.textContent = cur; scTimer = setTimeout(del, 22); return; }
        var k = 0;
        (function add() { k++; typed.textContent = txt.slice(0, k); if (k < txt.length) scTimer = setTimeout(add, 45 + Math.random() * 50); else done(); })();
      })();
    };
    // warm the three thumbnails so a swap never shows an empty frame
    var scPre = SC.map(function (r) { var im = new Image(); im.decoding = 'async'; im.src = srcFor(r.slug); return im; });
    // The result stays crisp while the next query is typed; the swap itself is a ~0.3 s crossfade.
    var nextSc = function () {
      if (!scVisible || d.hidden) { scTimer = setTimeout(nextSc, 1200); return; }
      scI = (scI + 1) % SC.length; var r = SC[scI], k = scI;
      typeTo(r.q[LANG], function () {
        scEl.classList.add('is-swap');
        scTimer = setTimeout(function () {
          setRes(r, k);
          var back = function () { scEl.classList.remove('is-swap'); scTimer = setTimeout(nextSc, 5200); };
          var im = scPre[k];
          if (im && im.decode) im.decode().then(back, back); else back();
        }, 290);
      });
    };
    if (!REDUCE) scTimer = setTimeout(nextSc, 5200);
    if ('IntersectionObserver' in W) new IntersectionObserver(function (es) { scVisible = es[0].isIntersecting; }).observe(scEl);
    d.addEventListener('lang', function () { var r = SC[scI]; typed.textContent = r.q[LANG]; $('[data-sc-area]', scEl).textContent = r.area[LANG]; });
    if (HAS_GSAP) gsap.set(scEl, { transformPerspective: 1600 });
    if (FINE && HAS_GSAP) {
      var rx = gsap.quickTo(scEl, 'rotationY', { duration: 1.2, ease: 'power3' }), ry = gsap.quickTo(scEl, 'rotationX', { duration: 1.2, ease: 'power3' });
      W.addEventListener('pointermove', function (e) {
        if (scrollY > innerHeight) return;
        rx(-5 + (e.clientX / innerWidth - .5) * 7); ry(2.5 - (e.clientY / innerHeight - .5) * 5);
      }, { passive: true });
    }
  }

  /* ───────────────────────── path / node graph ───────────────────────── */
  var graph = $('[data-graph]'), nodes = $$('[data-node]'), svg = graph && $('.graph__lines', graph);
  var segs = [], pathProg = 0;
  var NODE_AT = [.06, .3, .54, .78];
  function iconCenter(n, ref) {
    var r = $('.node__ic', n).getBoundingClientRect();
    return [r.left + r.width / 2 - (ref ? ref.left : 0), r.top + r.height / 2 - (ref ? ref.top : 0)];
  }
  function drawGraph() {
    if (!graph) return;
    var gr = graph.getBoundingClientRect(), vertical = isNarrow();
    $$('path,circle', svg).forEach(function (e) { e.remove(); });
    segs = [];
    var pts = nodes.map(function (n) { return iconCenter(n, gr); });
    for (var i = 0; i < pts.length - 1; i++) {
      var a = pts[i], b = pts[i + 1], dx = b[0] - a[0], dy = b[1] - a[1], dd;
      if (vertical) dd = 'M' + a[0] + ',' + (a[1] + 30) + ' C' + a[0] + ',' + (a[1] + dy * .5) + ' ' + b[0] + ',' + (b[1] - dy * .5) + ' ' + b[0] + ',' + (b[1] - 30);
      else dd = 'M' + (a[0] + 30) + ',' + a[1] + ' C' + (a[0] + dx * .55) + ',' + a[1] + ' ' + (b[0] - dx * .55) + ',' + b[1] + ' ' + (b[0] - 30) + ',' + b[1];
      var base = d.createElementNS('http://www.w3.org/2000/svg', 'path'); base.setAttribute('d', dd); base.setAttribute('class', 'base');
      var lit = d.createElementNS('http://www.w3.org/2000/svg', 'path'); lit.setAttribute('d', dd); lit.setAttribute('class', 'lit');
      var sp = d.createElementNS('http://www.w3.org/2000/svg', 'circle'); sp.setAttribute('r', '3'); sp.setAttribute('class', 'spark');
      svg.appendChild(base); svg.appendChild(lit); svg.appendChild(sp);
      var len = lit.getTotalLength(); lit.style.strokeDasharray = len; lit.style.strokeDashoffset = len;
      segs.push({ lit: lit, sp: sp, len: len });
    }
    setPath(pathProg);
  }
  function setPath(p) {
    pathProg = p;
    nodes.forEach(function (n, i) { n.classList.toggle('is-lit', p >= NODE_AT[i]); });
    segs.forEach(function (s, i) {
      var f = sstep((p - NODE_AT[i]) / (NODE_AT[i + 1] - NODE_AT[i]));
      s.lit.style.strokeDashoffset = (s.len * (1 - f)).toFixed(1);
      var pt = s.lit.getPointAtLength(s.len * f);
      s.sp.setAttribute('cx', pt.x.toFixed(1)); s.sp.setAttribute('cy', pt.y.toFixed(1));
      s.sp.style.opacity = f > .01 && f < .99 ? 1 : 0;
    });
  }
  if (graph) {
    drawGraph();
    if (!HAS_GSAP) setPath(1);
  }

  /* ───────────────────────── work track ───────────────────────── */
  var track = $('[data-track]'), wbar = $('.work__bar i'), wn = $('[data-work-n]'), nCards = track ? $$('.card:not(.card--more)', track).length : 0;
  function workProgress(p) {
    if (wbar) wbar.style.transform = 'scaleX(' + clamp(p, 0, 1).toFixed(3) + ')';
    if (wn) { var k = pad(Math.min(nCards, 1 + Math.floor(clamp(p, 0, .999) * nCards))); if (wn.textContent !== k) wn.textContent = k; }
  }
  function phoneBar() { if (!track) return; var m = track.scrollWidth - track.clientWidth; workProgress(m > 0 ? track.scrollLeft / m : 0); }
  if (track) track.addEventListener('scroll', phoneBar, { passive: true });

  /* ───────────────────────── responsive scroll scenes ───────────────────────── */
  if (HAS_GSAP) {
    var mm = gsap.matchMedia();
    mm.add('(min-width: 861px)', function () {
      // path: pinned stage; the node graph lights up as you pass it
      ST.create({ trigger: '.path__pin', pin: true, start: 'top top', end: '+=130%', scrub: true, onUpdate: function (s) { setPath(s.progress * 1.04); }, onRefresh: drawGraph });
      // work: pinned horizontal run under a fixed headline row; phones fly in out of the warp
      var cards = $$('.card', track);
      var dist = function () { var l = cards[cards.length - 1]; return Math.max(0, l.offsetLeft + l.offsetWidth + (parseFloat(getComputedStyle(track).paddingRight) || 0) - innerWidth); };
      gsap.fromTo(cards, { x: function (i) { return 260 + i * 140; }, opacity: 0, scale: .82, rotationY: -28, transformPerspective: 1200 },
        { x: 0, opacity: 1, scale: 1, rotationY: 0, ease: 'power3.out', stagger: .04,
          scrollTrigger: { trigger: '.work', start: 'top 92%', end: 'top 8%', scrub: .6 } });
      gsap.to(track, { x: function () { return -dist(); }, ease: 'none',
        scrollTrigger: { trigger: '.work__pin', pin: true, start: 'top top', end: function () { return '+=' + Math.round(dist() * 1.5); }, scrub: .8, invalidateOnRefresh: true,
          onUpdate: function (s) { workProgress(s.progress); } } });
      return function () { gsap.set(track, { clearProps: 'transform' }); };
    });
    mm.add('(max-width: 860px)', function () {
      ST.create({ trigger: graph, start: 'top 78%', end: 'bottom 88%', scrub: true, onUpdate: function (s) { setPath(s.progress * 1.05); }, onRefresh: drawGraph });
      gsap.fromTo($$('.card', track), { x: 120, opacity: 0 }, { x: 0, opacity: 1, duration: 1.2, ease: 'expo.out', stagger: .08, scrollTrigger: { trigger: track, start: 'top 85%', once: true } });
    });
    // hero leaves the stage: copy drifts up and dims, the card floats away faster
    gsap.to('.hero__copy', { y: -110, opacity: .15, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true } });
    gsap.to('.sc', { yPercent: -38, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true } });
    W.addEventListener('load', function () { ST.refresh(); });
    if (d.fonts && d.fonts.ready) d.fonts.ready.then(function () { ST.refresh(); });
  } else {
    setPath(1);
  }
  var rT = 0;
  W.addEventListener('resize', function () { clearTimeout(rT); rT = setTimeout(function () { drawGraph(); phoneBar(); echoes.forEach(placeGhosts); }, 150); });
  if (d.fonts && d.fonts.ready) d.fonts.ready.then(function () { echoes.forEach(placeGhosts); });

  /* ───────────────────────── bento: language flip ───────────────────────── */
  var flip = $('[data-flip]');
  if (flip && !REDUCE) {
    var words = flip.getAttribute('data-flip').split('|'), fi = 0;
    setInterval(function () {
      if (d.hidden) return;
      flip.classList.add('is-out');
      setTimeout(function () { fi = (fi + 1) % words.length; flip.textContent = words[fi]; flip.classList.remove('is-out'); }, 380);
    }, 1700);
  }

  /* ───────────────────────── before / after ───────────────────────── */
  var ba = $('[data-ba]');
  if (ba) {
    var ph = $('.ba__phone', ba), range = $('[data-ba-range]', ba), dragging = false;
    var setBA = function (p) { p = clamp(p, 0, 100); ph.style.setProperty('--p', p + '%'); range.value = Math.round(p); };
    var fromEvt = function (e) { var r = ph.getBoundingClientRect(); return (e.clientX - r.left) / r.width * 100; };
    ph.addEventListener('pointerdown', function (e) { dragging = true; ph.setPointerCapture(e.pointerId); setBA(fromEvt(e)); if (ba._hint) ba._hint.kill(); });
    ph.addEventListener('pointermove', function (e) { if (dragging) setBA(fromEvt(e)); });
    ph.addEventListener('pointerup', function () { dragging = false; });
    ph.addEventListener('pointercancel', function () { dragging = false; });
    range.addEventListener('input', function () { setBA(+range.value); if (ba._hint) ba._hint.kill(); });
    range.style.pointerEvents = 'none';
    range.setAttribute('aria-valuetext', '50%');
    range.addEventListener('change', function () { range.setAttribute('aria-valuetext', range.value + '%'); });
    if (HAS_GSAP) {
      var o = { p: 50 };
      ST.create({ trigger: ba, start: 'top 70%', once: true, onEnter: function () {
        ba._hint = gsap.timeline().to(o, { p: 16, duration: 1.1, ease: 'power3.inOut', onUpdate: function () { setBA(o.p); } })
          .to(o, { p: 80, duration: 1.4, ease: 'power3.inOut', onUpdate: function () { setBA(o.p); } })
          .to(o, { p: 50, duration: 1, ease: 'power3.inOut', onUpdate: function () { setBA(o.p); } });
      } });
    }
  }

  /* ───────────────────────── FAQ accordion ───────────────────────── */
  var faqRT = 0;
  $$('.q').forEach(function (q) {
    var sum = $('summary', q), body = $('.q__a', q);
    sum.addEventListener('click', function (e) {
      if (REDUCE || !body.animate) return;
      e.preventDefault();
      if (q._anim) q._anim.cancel();
      if (!q.open) {
        q.open = true;
        var h = body.scrollHeight;
        q._anim = body.animate([{ height: '0px', opacity: 0 }, { height: h + 'px', opacity: 1 }], { duration: 520, easing: 'cubic-bezier(.2,.7,.1,1)' });
      } else {
        var h2 = body.scrollHeight;
        q._anim = body.animate([{ height: h2 + 'px', opacity: 1 }, { height: '0px', opacity: 0 }], { duration: 380, easing: 'cubic-bezier(.7,0,.2,1)' });
        q._anim.onfinish = function () { q.open = false; };
      }
      q._anim.addEventListener('finish', function () { if (ST && HAS_GSAP) { clearTimeout(faqRT); faqRT = setTimeout(function () { ST.refresh(); }, 160); } });
    });
  });

  /* ───────────────────────── cursor + magnetic ───────────────────────── */
  if (FINE && !REDUCE) {
    html.classList.add('has-cursor');
    var cur = $('.cursor'), dot = $('.cursor__dot'), ring = $('.cursor__ring'), lbl = $('.cursor__lbl');
    var mx = -100, my = -100, rx2 = -100, ry2 = -100, CUR_NL = { 'VIEW ↗': 'BEKIJK ↗', 'DRAG': 'SLEEP', 'ALL ↗': 'ALLES ↗', 'HI': 'HOI' };
    W.addEventListener('pointermove', function (e) {
      if (e.pointerType !== 'mouse') return;
      mx = e.clientX; my = e.clientY;
      dot.style.transform = 'translate(' + mx + 'px,' + my + 'px)';
      var el = e.target.closest ? e.target : null;
      var lab = el && el.closest('[data-cursor]'), txt = el && el.closest('input,textarea'), hov = el && el.closest('a,button,summary,label,[data-ba]');
      cur.classList.toggle('is-label', !!lab && !txt);
      if (lab) { var lt = lab.getAttribute('data-cursor'); if (LANG === 'nl') lt = CUR_NL[lt] || lt; if (lbl.textContent !== lt) lbl.textContent = lt; }
      cur.classList.toggle('is-text', !!txt);
      cur.classList.toggle('is-hover', !!hov && !lab && !txt);
      cur.classList.remove('is-hidden');
    }, { passive: true });
    d.addEventListener('mouseleave', function () { cur.classList.add('is-hidden'); });
    (function follow() {
      rx2 = lerp(rx2, mx, .2); ry2 = lerp(ry2, my, .2);
      ring.style.transform = 'translate(' + rx2.toFixed(1) + 'px,' + ry2.toFixed(1) + 'px)';
      requestAnimationFrame(follow);
    })();
    if (HAS_GSAP) {
      $$('[data-magnetic]').forEach(function (b) {
        var qx = gsap.quickTo(b, 'x', { duration: .6, ease: 'power3' }), qy = gsap.quickTo(b, 'y', { duration: .6, ease: 'power3' });
        b.addEventListener('pointermove', function (e) { var r = b.getBoundingClientRect(); qx((e.clientX - r.left - r.width / 2) * .22); qy((e.clientY - r.top - r.height / 2) * .32); });
        b.addEventListener('pointerleave', function () { qx(0); qy(0); });
      });
    }
  }

  /* ───────────────────────── header, rail, dock ───────────────────────── */
  var hdr = $('#hdr'), dock = $('.dock'), railEl = $('.rail'), railItems = $$('.rail li'), navA = $$('.nav a'), railIdx = -1, railShow = -1e4;
  var stages = $$('[data-stage]'), seq = stages.map(function (s) { return s.getAttribute('data-stage'); });
  var dockBlocked = true;
  if (dock && 'IntersectionObserver' in W) {
    var blockers = $$('[data-ask]').filter(function (b) { return b !== dock && !b.closest('.mnav') && !b.closest('.hdr') && !b.closest('.ask'); });
    var ftrEl = $('.ftr'); if (ftrEl) blockers.push(ftrEl);
    var dio = new IntersectionObserver(function (es) {
      es.forEach(function (e) { e.target._vis = e.isIntersecting; });
      dockBlocked = blockers.some(function (b) { return b._vis; });
    }, { rootMargin: '0px 0px 24px 0px' });
    blockers.forEach(function (b) { dio.observe(b); });
  } else dockBlocked = false;
  var lastY = W.scrollY, lastT = performance.now(), vel = 0, hdrHidden = false, upAcc = 0, echoLive = false, stillAt = 0, stillDone = false, frameN = 0, lastDy = 0;

  function stageFloat(vh) {
    var s = 0;
    for (var i = 1; i < stages.length; i++) {
      var top = stages[i].getBoundingClientRect().top;
      s += sstep((vh * .9 - top) / (vh * .75));
    }
    return s;
  }

  /* ───────────────────────── aurora bridge ───────────────────────── */
  var A = null, canvas = $('#aurora');
  var scrimEls = $$('[data-scrim]');
  var laneEls = $$('[data-lane]');
  var baPhone = $('.ba__phone'), ctaBtn = $('.cta .btn--xl');
  var nodeGlow = [0, 0, 0, 0];

  function startAurora() {
    if (!W.Aurora || !canvas) { html.classList.add('no-gl'); return; }
    var q = params.get('aq');
    var ok = W.Aurora.start(canvas, { reduce: REDUCE, sequence: seq, quality: q !== null ? +q : undefined });
    if (!ok) { html.classList.add('no-gl'); return; }
    A = W.Aurora;
    A.jump(stageFloat(innerHeight));
    if (preActive && !ignited) A.thread();
    else A.ignite(true);
    if (askOpen) A.overlay(true);
  }

  function pushScrims(vh) {
    var list = [], y = lenis ? lenis.animatedScroll : W.scrollY;
    for (var i = 0; i < scrimEls.length; i++) {
      var r = scrimEls[i].getBoundingClientRect();
      if (r.bottom < 0 || r.top > vh || r.width === 0) continue;
      var vis = Math.min(r.bottom, vh) - Math.max(r.top, 0);
      list.push([r.left + r.width / 2, r.top + r.height / 2, r.width / 2 + 28, r.height / 2 + 22, scrimEls[i]._k || .74, vis * r.width]);
    }
    list.sort(function (a, b) { return b[5] - a[5]; });
    list = list.slice(0, 3);
    if (hdr && !hdrHidden) { var hr = hdr.getBoundingClientRect(); list.push([hr.left + hr.width / 2, hr.height / 2, hr.width / 2, hr.height / 2 - 4, y > 30 ? .2 : .42, 0]); }
    A.scrims(list);
  }

  function trailEcho(vh) {
    // headline motion trail: fast scrolling smears visible headlines into ghosted echoes
    if (HAS_GSAP) {
      var ve = clamp(vel / 4200, -1, 1), av = Math.abs(ve);
      if (Math.abs(lastDy) > innerHeight * .6) ve = av = 0; // a jump, not a scroll
      if (av > .04 || echoLive) {
        echoLive = av > .04;
        var vis = echoes.filter(function (h) { if (h._busy || !h._ghosts) return false; var hr = h.getBoundingClientRect(); return hr.bottom > -50 && hr.top < vh + 50; });
        for (var e = 0; e < vis.length; e++) {
          var h = vis[e];
          for (var gi = 0; gi < h._ghosts.length; gi++) {
            var g = h._ghosts[gi];
            g.style.transform = echoLive ? 'translate3d(0,' + (ve * 16 * (gi + 1)).toFixed(1) + 'px,0)' : '';
            g.style.opacity = echoLive ? (Math.min(.42, av * 1.1) * (1 - gi * .22)).toFixed(3) : '0';
          }
        }
      }
    }

  }

  function frame() {
    var now = performance.now(), dt = Math.max(1, now - lastT); lastT = now;
    var y = lenis ? lenis.animatedScroll : W.scrollY, vh = innerHeight;
    var dy = y - lastY; lastY = y; lastDy = dy;
    vel = Math.abs(dy) > vh * .6 ? 0 : lerp(vel, dy / dt * 1000, .25);
    var sf = stageFloat(vh);

    // header state
    if (hdr) {
      hdr.classList.toggle('is-solid', y > 30);
      if (dy > 6 && y > vh * .9 && !hdrHidden) { hdrHidden = true; hdr.classList.add('is-hidden'); upAcc = 0; }
      if (dy < 0) { upAcc += -dy; if (hdrHidden && upAcc > 40) { hdrHidden = false; hdr.classList.remove('is-hidden'); } }
      if (y < 40 && hdrHidden) { hdrHidden = false; hdr.classList.remove('is-hidden'); }
    }
    var si = Math.round(sf);
    if (si !== railIdx || Math.abs(dy) > 2) { railIdx = si; railShow = now; }
    railItems.forEach(function (li, i) { li.classList.toggle('is-on', i === si); });
    if (railEl) { railEl.classList.toggle('is-talk', now - railShow < 1400); railEl.classList.toggle('is-off', seq[si] === 'warp' && !isNarrow()); }
    var curName = seq[si];
    navA.forEach(function (a) {
      if (a._st === undefined) a._st = ($(a.getAttribute('href')) || { getAttribute: function () { return ''; } }).getAttribute('data-stage');
      a.classList.toggle('is-on', a._st === curName);
    });
    if (dock) {
      // the dock only shows when no other "Show me my site" button (or the footer) is on screen
      var on = y > vh * .6 && !dockBlocked && !askOpen && !menuOpen;
      if (dock._on !== on) { dock._on = on; dock.classList.toggle('is-on', on); dock.setAttribute('aria-hidden', on ? 'false' : 'true'); dock.tabIndex = on ? 0 : -1; }
    }

    if (!A) { trailEcho(vh); return; }
    A.stage(sf);
    A.velocity(vel / 2600);

    var busy = Math.abs(dy) > .01 || (frameN++ & 3) === 0;
    if (busy) pushScrims(vh);

    // node graph → light path anchors and node glows
    if (graph && busy) {
      var gr = graph.getBoundingClientRect();
      if (gr.bottom > -vh && gr.top < vh * 2) {
        var pts = nodes.map(function (n) { return iconCenter(n); });
        A.anchors(pts);
        var gl = [];
        for (var k = 0; k < 4; k++) { nodeGlow[k] = lerp(nodeGlow[k], nodes[k].classList.contains('is-lit') ? 1 : 0, .08); gl.push([pts[k][0], pts[k][1], nodeGlow[k] * .32, 46]); }
        A.nodes(gl);
      } else { A.nodes([]); }
    }
    if (busy && baPhone && A.focus) { var bp = baPhone.getBoundingClientRect(); A.focus('proof', bp.left + bp.width / 2, bp.top + bp.height / 2); }
    if (busy && ctaBtn && A.focus) { var cb = ctaBtn.getBoundingClientRect(); A.focus('cta', cb.left + cb.width / 2, cb.top + cb.height / 2); }
    if (busy && laneEls.length && A.lanes) {
      A.lanes(laneEls.map(function (el) { var r = el.getBoundingClientRect(); return [r.left + r.width / 2, r.top + r.height / 2]; }));
    }
    if (REDUCE) {
      // no motion: when scrolling settles, swap to that section's still composition
      if (Math.abs(dy) > .5) stillAt = now; else if (!stillDone && !stillAt) stillAt = now;
      if (stillAt && now - stillAt > 180) { stillAt = 0; stillDone = true; A.jump(Math.round(sf)); pushScrims(vh); A.still(); }
    }
    trailEcho(vh);
  }
  if (HAS_GSAP) gsap.ticker.add(frame);
  else (function loop() { frame(); requestAnimationFrame(loop); })();

  if (FINE) W.addEventListener('pointermove', function (e) { if (A) A.pointer(e.clientX, e.clientY); }, { passive: true });
  else W.addEventListener('pointerdown', function (e) { if (A) A.pointer(e.clientX, e.clientY); }, { passive: true });

  /* ───────────────────────── dialog ───────────────────────── */
  var ask = $('#ask'), form = $('#ask-form'), askOpen = false, step = 1, lastFocus = null;
  var panes = ask ? $$('[data-pane]', ask) : [], panesEl = ask && $('[data-panes]', ask);
  var KEEP = ['#f-rest', '#f-area', '#f-name', '#f-email', '#f-phone'], KEEP_KEY = 'dolcessi_ask';
  function focusables() {
    return $$('a[href],button:not([disabled]),input:not([type=hidden]),select,textarea,[tabindex]:not([tabindex="-1"])', ask)
      .filter(function (el) { return el.offsetParent !== null && !el.closest('[hidden]') && !el.closest('.is-leaving'); });
  }
  // Step change: the old pane slides out while the new one slides in (crossfade, never an empty card),
  // and the panel eases to the new height. ≤ 340 ms in total.
  function goStep(n, back, instant) {
    step = n;
    var cur = panes.filter(function (p) { return !p.hidden && !p.classList.contains('is-leaving'); })[0];
    var next = panes.filter(function (p) { return +p.getAttribute('data-pane') === n; })[0];
    var animate = !instant && !REDUCE && cur && next && cur !== next && panesEl && next.animate;
    if (animate) {
      var h0 = panesEl.offsetHeight, dir = back ? -1 : 1;
      cur.classList.add('is-leaving');
      next.hidden = false;
      var h1 = panesEl.offsetHeight;
      panesEl.style.overflow = 'hidden';
      var ha = panesEl.animate([{ height: h0 + 'px' }, { height: h1 + 'px' }], { duration: 320, easing: 'cubic-bezier(.2,.7,.1,1)' });
      ha.onfinish = ha.oncancel = function () { panesEl.style.overflow = ''; };
      var out = cur.animate([{ opacity: 1, transform: 'none' }, { opacity: 0, transform: 'translateX(' + (-14 * dir) + 'px)' }], { duration: 170, easing: 'cubic-bezier(.4,0,1,1)', fill: 'forwards' });
      out.onfinish = function () { cur.hidden = true; cur.classList.remove('is-leaving'); out.cancel(); };
      next.animate([{ opacity: 0, transform: 'translateX(' + (16 * dir) + 'px)' }, { opacity: 1, transform: 'none' }], { duration: 300, delay: 30, easing: 'cubic-bezier(.2,.7,.1,1)', fill: 'backwards' });
    } else {
      panes.forEach(function (p) { p.hidden = +p.getAttribute('data-pane') !== n; p.classList.remove('is-leaving'); });
    }
    $('[data-stepn]', ask).textContent = '0' + Math.min(n, 2);
    $('.ask__step', ask).style.visibility = n === 3 ? 'hidden' : '';
    $('[data-bar]', ask).style.width = n === 1 ? '50%' : '100%';
    ask.setAttribute('aria-labelledby', n === 3 ? 'ask-h3' : 'ask-h1');
    setTimeout(function () {
      var f = n === 1 ? $('#f-rest') : n === 2 ? ($('[data-err-msg]:not([hidden])') ? $('#f-email') : $('#f-name')) : $('[data-pane="3"] [data-close]', ask);
      if (n === 2 && !$('[data-err-msg]:not([hidden])') && $('#f-name').value) f = $('#f-email');
      if (f) f.focus({ preventScroll: true });
    }, 60);
  }
  function setInert(on) { $$('main, .hdr, .ftr, .skip, .mnav').forEach(function (el) { if ('inert' in el) el.inert = on; else if (on) el.setAttribute('aria-hidden', 'true'); else el.removeAttribute('aria-hidden'); }); }
  function openAsk(n) {
    if (!ask || askOpen) return;
    setMenu(false);
    askOpen = true; lastFocus = d.activeElement;
    ask.hidden = false;
    requestAnimationFrame(function () { requestAnimationFrame(function () { if (askOpen) ask.classList.add('is-open'); }); });
    html.classList.add('ask-open');
    setInert(true);
    if (lenis) lenis.stop();
    if (A) A.overlay(true);
    goStep(n || 1, false, true);
  }
  function closeAsk() {
    if (!askOpen) return;
    askOpen = false;
    ask.classList.remove('is-open');
    html.classList.remove('ask-open');
    setInert(false);
    if (lenis) lenis.start();
    if (A) A.overlay(false);
    setTimeout(function () { if (!askOpen) ask.hidden = true; }, 520);
    if (lastFocus && lastFocus.focus && lastFocus !== d.body) lastFocus.focus({ preventScroll: true });
  }
  W.openAsk = openAsk;
  // phones: keep the sheet inside the visible area when the on-screen keyboard is up (iOS/Android)
  var vv = W.visualViewport;
  if (vv && ask) {
    var fitVV = function () {
      if (!askOpen) { ask.style.removeProperty('top'); ask.style.removeProperty('height'); return; }
      var kb = innerHeight - vv.height > 80;
      if (kb) { ask.style.top = vv.offsetTop + 'px'; ask.style.height = vv.height + 'px'; }
      else { ask.style.removeProperty('top'); ask.style.removeProperty('height'); }
    };
    vv.addEventListener('resize', fitVV); vv.addEventListener('scroll', fitVV);
  }
  d.addEventListener('click', function (e) {
    var o = e.target.closest && e.target.closest('[data-ask]');
    if (o) { e.preventDefault(); openAsk(1); return; }
    if (askOpen && e.target.closest && e.target.closest('[data-close]')) { e.preventDefault(); closeAsk(); }
  });
  function setErr(input, key) {
    var f = input.closest('.fld'), em = $('.fld__err', f);
    f.classList.toggle('is-bad', !!key);
    em.textContent = key ? t(key) : '';
    input.setAttribute('aria-invalid', key ? 'true' : 'false');
  }
  function v1() {
    var r = $('#f-rest'), ok = r.value.trim().length > 0;
    setErr(r, ok ? null : 'errRest'); if (!ok) r.focus(); return ok;
  }
  function v2() {
    var n = $('#f-name'), m = $('#f-email'), ok = true, first = null;
    if (!n.value.trim()) { setErr(n, 'errName'); ok = false; first = first || n; } else setErr(n, null);
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(m.value.trim())) { setErr(m, 'errEmail'); ok = false; first = first || m; } else setErr(m, null);
    if (first) first.focus();
    return ok;
  }
  // Shopify reloads the page after a post: keep what was typed for this tab only, so an error never wipes the form.
  function saveForm() { try { sessionStorage.setItem(KEEP_KEY, JSON.stringify(KEEP.map(function (s) { return $(s).value; }))); } catch (e) { } }
  function restoreForm() {
    try {
      var v = JSON.parse(sessionStorage.getItem(KEEP_KEY) || 'null');
      if (v) KEEP.forEach(function (s, i) { if (v[i] && !$(s).value) $(s).value = v[i]; });
    } catch (e) { }
  }
  function clearForm() { try { sessionStorage.removeItem(KEEP_KEY); } catch (e) { } }
  if (ask && form) {
    $('[data-next]', ask).addEventListener('click', function () { if (v1()) goStep(2); });
    $('[data-back]', ask).addEventListener('click', function () { goStep(1, true); });
    ['#f-rest', '#f-area'].forEach(function (s) {
      $(s).addEventListener('keydown', function (e) { if (e.key === 'Enter') { e.preventDefault(); if (v1()) goStep(2); } });
    });
    ['#f-rest', '#f-name', '#f-email'].forEach(function (s) {
      $(s).addEventListener('input', function () { if ($(s).closest('.fld').classList.contains('is-bad')) setErr($(s), null); });
    });
    form.addEventListener('submit', function (e) {
      if (step !== 2) { e.preventDefault(); if (step === 1 && v1()) goStep(2); return; }
      if (!v1()) { e.preventDefault(); goStep(1, true); return; }
      if (!v2()) { e.preventDefault(); return; }
      var g = function (s) { return ($(s).value || '').trim(); };
      $('#f-body').value = [
        'Show me my site',
        '',
        'Café / restaurant: ' + g('#f-rest'),
        'Neighbourhood: ' + (g('#f-area') || '—'),
        'Name: ' + g('#f-name'),
        'Email: ' + g('#f-email'),
        'WhatsApp / phone: ' + (g('#f-phone') || '—'),
        'Language: ' + LANG.toUpperCase(),
        'Page: ' + location.href.split('#')[0].split('?')[0]
      ].join('\n');
      saveForm();
      var sb = $('button[type=submit]', form);
      sb.disabled = true; sb.setAttribute('aria-busy', 'true');
      $('span', sb).textContent = t('sending');
      // native POST continues (Shopify may show its captcha page first)
    });
    // back/forward cache: never come back to a stuck "Sending…" button
    W.addEventListener('pageshow', function () {
      var sb = $('button[type=submit]', form);
      if (sb && sb.disabled) { sb.disabled = false; sb.removeAttribute('aria-busy'); $('span', sb).textContent = LANG === 'nl' ? $('span', sb).getAttribute('data-nl') : 'Show me my site'; }
    });
    d.addEventListener('keydown', function (e) {
      if (!askOpen) return;
      if (e.key === 'Escape') { e.preventDefault(); closeAsk(); return; }
      if (e.key === 'Tab') {
        var f = focusables(); if (!f.length) return;
        var a = f[0], z = f[f.length - 1];
        if (e.shiftKey && d.activeElement === a) { e.preventDefault(); z.focus(); }
        else if (!e.shiftKey && d.activeElement === z) { e.preventDefault(); a.focus(); }
        else if (!ask.contains(d.activeElement)) { e.preventDefault(); a.focus(); }
      }
    });
  }

  /* ───────────────────────── mobile menu ───────────────────────── */
  var mbtn = $('[data-menu]'), mnav = $('#mnav'), menuOpen = false;
  function setMenu(on) {
    if (!mnav || !mbtn || on === menuOpen) return;
    menuOpen = on;
    mbtn.setAttribute('aria-expanded', on ? 'true' : 'false');
    mbtn.setAttribute('aria-label', on ? (LANG === 'nl' ? 'Menu sluiten' : 'Close menu') : 'Menu');
    html.classList.toggle('menu-open', on);
    $$('main, .ftr, .dock').forEach(function (el) { if ('inert' in el) el.inert = on; });
    if (on) {
      mnav.hidden = false;
      if (lenis) lenis.stop();
      setTimeout(function () { if (menuOpen && A && A.hold) A.hold(true); }, 400);
      if (hdr) { hdr.classList.remove('is-hidden'); hdrHidden = false; }
      requestAnimationFrame(function () { requestAnimationFrame(function () { if (menuOpen) mnav.classList.add('is-open'); }); });
      setTimeout(function () { var a = $('a', mnav); if (menuOpen && a) a.focus({ preventScroll: true }); }, 90);
    } else {
      mnav.classList.remove('is-open');
      if (A && A.hold) A.hold(false);
      if (lenis && !askOpen) lenis.start();
      setTimeout(function () { if (!menuOpen) mnav.hidden = true; }, 380);
    }
  }
  if (mbtn && mnav) {
    mbtn.addEventListener('click', function () { setMenu(!menuOpen); });
    mnav.addEventListener('click', function (e) { if (e.target.closest('a[href^="#"]')) setMenu(false); });
    d.addEventListener('keydown', function (e) { if (menuOpen && e.key === 'Escape') { setMenu(false); mbtn.focus(); } });
    W.addEventListener('resize', function () { if (menuOpen && innerWidth > 1100) setMenu(false); });
  }

  /* ───────────────────────── boot ───────────────────────── */
  function boot() {
    // aurora after first paint so the headline is never waiting on WebGL
    // (two frames: the first one has been painted before any WebGL work starts)
    requestAnimationFrame(function () { requestAnimationFrame(function () { setTimeout(startAurora, 0); }); });
    if (sentOrErr) {
      ignite();
      var errEl = !postedOk && $('#ask-form [data-err]');
      if (errEl) {
        restoreForm();
        var msg = (errEl.textContent || '').trim(), m = $('[data-err-msg]');
        m.hidden = false; m.textContent = LANG === 'nl' || !msg ? t('serverErr') : msg;
        if (/mail/i.test(msg)) setErr($('#f-email'), 'errEmail');
        openAsk(2);
      } else {
        clearForm();
        openAsk(3);
        // a reload shouldn't re-open the "received" state
        try { if (/contact_posted/.test(location.search)) history.replaceState(null, '', location.pathname + location.search.replace(/[?&]contact_posted=true/, '').replace(/^&/, '?') + location.hash.replace(/^#(ask-form|contact_form)$/, '')); } catch (e) { }
      }
      return;
    }
    if (preActive) {
      var el = performance.now(), wait = Math.max(120, 1380 - el);
      setTimeout(ignite, wait);
    } else ignite();
  }
  if (HAS_GSAP && preActive && !sentOrErr) {
    // initial hidden states for the hero entrance (covered by the preloader, so no flash)
    gsap.set('.hero .label, .hero .lede, .hero .ctas, .hero .facts', { opacity: 0, y: 24 });
    gsap.set('.sc', { opacity: 0 });
  }
  boot();
})();
