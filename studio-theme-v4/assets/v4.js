/*! Dolcessi v4.3 "Reed" — page orchestration (i18n, intake banner, scroll scenes, glass light, Phone Test, dialog). */
(function () {
  'use strict';
  var d = document, html = d.documentElement, W = window;
  var $ = function (s, r) { return (r || d).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || d).querySelectorAll(s)); };
  var clamp = function (v, a, b) { return v < a ? a : v > b ? b : v; };
  var mq = function (q) { return W.matchMedia(q).matches; };

  var REDUCE = mq('(prefers-reduced-motion: reduce)');
  var FINE = mq('(hover: hover) and (pointer: fine)');
  var narrow = function () { return innerWidth <= 860; };
  var lenis = null;
  html.classList.remove('no-js');

  /* ───────── i18n ───────── */
  var LANG = html.classList.contains('is-nl') ? 'nl' : 'en';
  var ATTRS = ['aria-label', 'alt', 'placeholder', 'title', 'href'];
  var T = {
    title: { en: 'Dolcessi — Websites for cafés & restaurants in Amsterdam', nl: 'Dolcessi — Websites voor cafés & restaurants in Amsterdam' },
    desc: { en: ($('meta[name=description]') || {}).content || '', nl: 'Dolcessi bouwt websites van topniveau voor zelfstandige cafés en restaurants in Amsterdam. Wij bouwen je site voordat je erom vraagt: jouw menu, jouw openingstijden, jouw straat. Jij zegt ja, of niet. Binnen dagen live.' },
    errRest: { en: 'What’s the name of your business?', nl: 'Hoe heet je zaak?' },
    errPick: { en: 'Pick one to continue.', nl: 'Kies er een om verder te gaan.' },
    errPick2: { en: 'Pick one in each list.', nl: 'Kies er in elke lijst een.' },
    errGoal: { en: 'Pick at least one.', nl: 'Kies er minstens één.' },
    errOther: { en: 'Tell us in a few words.', nl: 'Vertel het in een paar woorden.' },
    errName: { en: 'What should we call you?', nl: 'Hoe mogen we je noemen?' },
    errEmail: { en: 'That email doesn’t look right.', nl: 'Dat e-mailadres klopt niet helemaal.' },
    sending: { en: 'Sending…', nl: 'Versturen…' },
    send: { en: 'Show me my site', nl: 'Laat mijn site zien' },
    open: { en: 'Open now · until 18:00', nl: 'Nu open · tot 18:00' },
    closed: { en: 'Closed · opens 08:00', nl: 'Gesloten · open om 08:00' },
    serverErr: { en: 'Something went wrong sending that. Check your details and try again.', nl: 'Er ging iets mis bij het versturen. Check je gegevens en probeer het opnieuw.' },
    menuClose: { en: 'Close menu', nl: 'Menu sluiten' },
    left: { en: '%s of %n left', nl: 'nog %s van %n' },
    full: { en: 'Full', nl: 'Vol' },
    ptResult: { en: 'Result', nl: 'Uitslag' },
    ptFix: { en: 'What to fix', nl: 'Wat je kunt verbeteren' },
    ptDay: { en: 'What yours needs on day one', nl: 'Wat jouw site vanaf dag één nodig heeft' },
    ptPassed: { en: 'Already right', nl: 'Al goed' },
    ptAll: { en: 'All ten checks passed.', nl: 'Alle tien de checks zijn goed.' },
    ptWa: { en: 'Hi Dolcessi, I did the Phone Test: %s/10. Can you show me what my site could look like?', nl: 'Hoi Dolcessi, ik heb de telefoontest gedaan: %s/10. Kun je laten zien hoe mijn site eruit kan zien?' },
    ptWaNone: { en: 'Hi Dolcessi, I did the Phone Test. I don’t have a website yet. Can you show me what mine could look like?', nl: 'Hoi Dolcessi, ik heb de telefoontest gedaan. Ik heb nog geen website. Kun je laten zien hoe die eruit kan zien?' }
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
    LANG = l; html.lang = l; html.classList.toggle('is-nl', l === 'nl');
    nlEls.forEach(function (el) { var v = l === 'nl' ? el.getAttribute('data-nl') : el._en; if (el.innerHTML !== v) el.innerHTML = v; });
    attrEls.forEach(function (p) { p[0].setAttribute(p[1], l === 'nl' ? p[0].getAttribute('data-nl-' + p[1]) : p[0]._enA[p[1]]); });
    d.title = t('title');
    var md = $('meta[name=description]'); if (md) md.content = t('desc');
    $$('[data-lang]').forEach(function (b) { b.setAttribute('aria-pressed', b.getAttribute('data-lang') === l ? 'true' : 'false'); });
    if (save) { try { localStorage.setItem('dolcessi_lang', l); } catch (e) { } }
    $$('[data-split]').forEach(function (el) { split(el); });
    d.dispatchEvent(new CustomEvent('lang', { detail: l }));
  }
  $$('[data-lang]').forEach(function (b) {
    b.addEventListener('click', function () { var l = b.getAttribute('data-lang'); if (l !== LANG) applyLang(l, true); });
  });
  $$('[data-lang]').forEach(function (b) { b.setAttribute('aria-pressed', b.getAttribute('data-lang') === LANG ? 'true' : 'false'); });
  if (LANG === 'nl') { d.title = t('title'); }

  /* ───────── intake banner: switches by date (Amsterdam time) ─────────
     The one value to edit by hand: places left in the current intake.
     null = no count shown · 2 = "2 left" · 0 = "Full". Reset it when an intake closes. */
  var PLACES_LEFT = null;
  var INTAKE = [
    { id: 'founding', until: Date.parse('2026-12-19T23:59:59+01:00'), n: 3,
      k: ['Founding 3', 'De eerste 3'],
      h: ['€495 setup <em>instead of €995.</em>', '€495 eenmalig <em>in plaats van €995.</em>'],
      p: ['In return: a filmed testimonial, 90 days of Google stats and 3 introductions.', 'In ruil voor: een gefilmde testimonial, 90 dagen Google-statistieken en 3 introducties.'],
      d: ['Closes 19 December', 'Sluit 19 december'],
      line: ['€495 setup · closes 19 December', '€495 eenmalig · sluit 19 december'],
      tag: ['Founding 3 · closes 19 December', 'De eerste 3 · sluit 19 december'],
      spot: ['We’re taking on our first three <em>cafés &amp; restaurants.</em>', 'We nemen onze eerste drie <em>cafés &amp; restaurants</em> aan.'],
      cta: ['Claim a spot', 'Pak een plek'] },
    { id: 'winter', until: Date.parse('2027-01-31T23:59:59+01:00'), n: 5,
      k: ['Winter Cohort', 'Winterronde'],
      h: ['5 places. <em>Last intake before Japan.</em>', '5 plekken. <em>De laatste ronde vóór Japan.</em>'],
      p: ['After these five, the next intake is after Japan.', 'Na deze vijf is de volgende ronde pas na Japan.'],
      d: ['Closes 31 January', 'Sluit 31 januari'],
      line: ['5 places · closes 31 January', '5 plekken · sluit 31 januari'],
      line2: ['closes 31 January', 'sluit 31 januari'],
      tag: ['Winter Cohort · closes 31 January', 'Winterronde · sluit 31 januari'],
      spot: ['Five places this winter. <em>The last before Japan.</em>', 'Vijf plekken deze winter. <em>De laatste vóór Japan.</em>'],
      cta: ['Claim a spot', 'Pak een plek'] },
    { id: 'after', until: Infinity, n: 0,
      k: ['Next intake after Japan', 'Volgende ronde na Japan'],
      h: ['Register now. <em>Registered places hear first.</em>', 'Schrijf je nu in. <em>Ingeschreven zaken horen het eerst.</em>'],
      p: ['', ''], d: ['', ''],
      line: ['Registered places hear first', 'Ingeschreven zaken horen het eerst'],
      tag: ['Next intake after Japan · register now', 'Volgende ronde na Japan · schrijf je nu in'],
      spot: ['Next intake <em>after Japan.</em>', 'Volgende ronde <em>na Japan.</em>'],
      cta: ['Register now', 'Schrijf je in'] }
  ];
  var intake = INTAKE.filter(function (p) { return Date.now() <= p.until; })[0] || INTAKE[INTAKE.length - 1];
  var placesLeft = intake.n && typeof PLACES_LEFT === 'number' ? clamp(Math.round(PLACES_LEFT), 0, intake.n) : null;
  function intakeText(key, l) {
    var i = l === 'nl' ? 1 : 0, v = intake[key][i];
    if (placesLeft === null || !v || ['d', 'line', 'tag'].indexOf(key) < 0) return v;
    var c = placesLeft ? T.left[l].replace('%s', placesLeft).replace('%n', intake.n) : T.full[l];
    if (key === 'tag') { var at = v.indexOf(' · '); return at < 0 ? v + ' · ' + c : v.slice(0, at) + ' · ' + c + v.slice(at); }
    if (key === 'line' && intake.line2) v = intake.line2[i];
    return c + ' · ' + v;
  }
  (function applyIntake() {
    html.setAttribute('data-intake', intake.id);
    $$('[data-cohort-only]').forEach(function (el) { el.hidden = el.getAttribute('data-cohort-only') !== intake.id; });
    $$('[data-cohort]').forEach(function (el) {
      var k = el.getAttribute('data-cohort'), en = intakeText(k, 'en'), nl = intakeText(k, 'nl'), v = LANG === 'nl' ? nl : en;
      el._en = en; el.setAttribute('data-nl', nl);
      if (el.innerHTML !== v) el.innerHTML = v;
      el.hidden = !v;
    });
    $$('[data-cohort-dots]').forEach(function (el) {
      var taken = placesLeft === null ? 0 : intake.n - placesLeft, h = '';
      for (var k = 0; k < intake.n; k++) h += k < taken ? '<i class="is-taken"></i>' : '<i></i>';
      el.innerHTML = h; el.hidden = !intake.n;
    });
  })();

  /* ───────── split headings into words ───────── */
  function split(el) {
    var i = 0;
    (function walk(node) {
      Array.prototype.slice.call(node.childNodes).forEach(function (n) {
        if (n.nodeType === 3) {
          var parts = n.nodeValue.split(/(\s+)/), frag = d.createDocumentFragment();
          parts.forEach(function (p) {
            if (!p) return;
            if (/^\s+$/.test(p)) { frag.appendChild(d.createTextNode(' ')); return; }
            var w = d.createElement('span'); w.className = 'w';
            var inn = d.createElement('span'); inn.textContent = p; inn.style.setProperty('--i', i++);
            w.appendChild(inn); frag.appendChild(w);
          });
          node.replaceChild(frag, n);
        } else if (n.nodeType === 1 && n.tagName !== 'BR' && !n.classList.contains('w')) walk(n);
      });
    })(el);
  }
  $$('[data-split]').forEach(split);

  /* ───────── clock + live hours tile ───────── */
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
    var pill = $('[data-open]'), bar = $('[data-open-bar]');
    if (pill) { // example schedule: daily 08:00–18:00
      var m = hm[0] * 60 + hm[1], open = m >= 480 && m < 1080;
      pill.classList.toggle('is-closed', !open);
      var tx = $('[data-open-t]'); if (tx) tx.textContent = open ? t('open') : t('closed');
      if (bar) bar.style.setProperty('--p', (clamp((m - 480) / 600, 0, 1) * 100).toFixed(1) + '%');
    }
  }
  tickClock(); setInterval(tickClock, 15000);
  d.addEventListener('lang', tickClock);

  /* ───────── form state from a Shopify post ───────── */
  var postedOk = !!$('#ask-form [data-sent]') || (/[?&]contact_posted=true/.test(location.search) && !$('#ask-form [data-err]'));
  var sentOrErr = postedOk || !!$('#ask-form [data-err]');
  var seen = html.classList.contains('seen');
  var pre = $('#pre');
  var preActive = !!pre && !seen && !REDUCE && !sentOrErr && getComputedStyle(pre).display !== 'none';
  try { sessionStorage.setItem('dolcessi_seen', '1'); } catch (e) { }

  /* ───────── smooth scroll ───────── */
  if (!REDUCE && W.Lenis) {
    try {
      lenis = new W.Lenis({ lerp: 0.1, smoothWheel: true, wheelMultiplier: 1, touchMultiplier: 1.4, prevent: function (node) { return !!(node && node.closest && node.closest('.ask, .mnav, .dck')); } });
      (function raf(time) { lenis.raf(time); requestAnimationFrame(raf); })(performance.now());
    } catch (e) { lenis = null; }
  }
  function scrollToTarget(el) {
    if (!el) return;
    if (lenis) lenis.scrollTo(el, { duration: 1.5, easing: function (x) { return x < .5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2; } });
    else el.scrollIntoView({ behavior: REDUCE ? 'auto' : 'smooth' });
  }
  d.addEventListener('click', function (e) {
    var a = e.target.closest && e.target.closest('a[href^="#"]');
    if (!a) return;
    var id = a.getAttribute('href');
    if (id.length < 2) return;
    var el = $(id); if (!el) return;
    e.preventDefault();
    scrollToTarget(el);
    if (id === '#main') { el.setAttribute('tabindex', '-1'); el.focus({ preventScroll: true }); }
  });

  /* ───────── reveals ───────── */
  function stagger(scope) {
    var groups = {};
    $$('[data-rv]', scope).forEach(function (el) {
      var p = el.parentElement, k = p ? (p._sid || (p._sid = Math.random())) : 0;
      groups[k] = groups[k] || []; groups[k].push(el);
    });
    Object.keys(groups).forEach(function (k) { groups[k].forEach(function (el, i) { el.style.setProperty('--d', Math.min(i, 6) * 80 + 'ms'); }); });
  }
  stagger(d);
  var onIn = [];
  function whenIn(el, fn) { onIn.push([el, fn]); if (io) io.observe(el); }
  var io = null;
  if ('IntersectionObserver' in W && !REDUCE) {
    io = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (!e.isIntersecting) return;
        var el = e.target; el.classList.add('is-in'); io.unobserve(el);
        onIn.forEach(function (p) { if (p[0] === el) p[1](el); });
      });
    }, { rootMargin: '0px 0px -12% 0px', threshold: 0.01 });
  }
  var heroEls = $$('.hero [data-rv], .hero [data-split]');
  function observeAll() {
    $$('[data-rv], [data-split], .tile, .step').forEach(function (el) {
      if (heroEls.indexOf(el) > -1) return;
      if (io) io.observe(el); else el.classList.add('is-in');
    });
    onIn.forEach(function (p) { if (io) io.observe(p[0]); else p[1](p[0]); });
  }
  function revealHero(delay) {
    heroEls.forEach(function (el) { el.style.setProperty('--h', (delay || 0) + 'ms'); });
    requestAnimationFrame(function () { heroEls.forEach(function (el) { el.classList.add('is-in'); }); });
  }

  /* counters */
  function countUp(el) {
    var to = +el.getAttribute('data-count'), t0 = performance.now(), dur = 1700;
    if (REDUCE) { el.textContent = to; return; }
    el.textContent = '0';
    (function step(now) {
      var p = clamp((now - t0) / dur, 0, 1), e = 1 - Math.pow(2, -10 * p);
      el.textContent = Math.round(to * (p >= 1 ? 1 : e));
      if (p < 1) requestAnimationFrame(step);
    })(t0);
  }
  $$('[data-count]').forEach(function (el) { whenIn(el, countUp); });
  var arc = $('[data-lh-arc]');
  if (arc) whenIn(arc.closest('.lh'), function () { arc.style.strokeDashoffset = (326.7 * (1 - .96)).toFixed(1); });

  /* ───────── hero: search card ───────── */
  var SC = [
    { slug: 'gentle-place', name: 'Gentle Place Coffee', q: { en: 'coffee near me', nl: 'koffie in de buurt' }, area: { en: 'Noord · Specialty coffee', nl: 'Noord · Specialty koffie' } },
    { slug: 'miyabi', name: 'Miyabi Matcha', q: { en: 'matcha latte zeedijk', nl: 'matcha latte zeedijk' }, area: { en: 'Zeedijk · Matcha bar', nl: 'Zeedijk · Matchabar' } },
    { slug: 'mokafe', name: 'MOKAFE', q: { en: 'breakfast rivierenbuurt', nl: 'ontbijt rivierenbuurt' }, area: { en: 'Rivierenbuurt · Café', nl: 'Rivierenbuurt · Café' } },
    { slug: 'osakaball', name: 'Osakaball', q: { en: 'takoyaki near me', nl: 'takoyaki in de buurt' }, area: { en: 'De Pijp · Osaka street food', nl: 'De Pijp · Osaka street food' } },
    { slug: 'meili', name: 'Meili Bakery', q: { en: 'bakery haarlemmerdijk', nl: 'bakkerij haarlemmerdijk' }, area: { en: 'Haarlemmerdijk · Bakery', nl: 'Haarlemmerdijk · Bakkerij' } }
  ];
  var scEl = $('[data-sc]');
  if (scEl) (function () {
    var typed = $('[data-typed]', scEl), img = $('[data-sc-img]', scEl), link = $('[data-sc-link]', scEl);
    var nameEl = $('[data-sc-name]', scEl), areaEl = $('[data-sc-area]', scEl), slugEl = $('[data-sc-slug]', scEl), nEl = $('[data-sc-n]', scEl);
    var idx = 0, timer = 0, vis = true;
    var srcFor = function (slug) {
      var im = $$('.card img.ph-a').filter(function (i) { return (i.getAttribute('src') || '').indexOf('work-' + slug + '.webp') > -1; })[0];
      return im ? im.getAttribute('src') : img.getAttribute('src');
    };
    SC.forEach(function (r) { var im = new Image(); im.decoding = 'async'; im.src = srcFor(r.slug); });
    function set(r, i) {
      img.src = srcFor(r.slug); nameEl.textContent = r.name; areaEl.textContent = r.area[LANG];
      slugEl.textContent = r.slug; nEl.textContent = '0' + (i + 1);
      link.href = 'https://concept.dolcessi.com/' + r.slug + '/';
    }
    function typeTo(txt, done) {
      var cur = typed.textContent, k = cur.length;
      (function del() {
        if (k > 0) { k--; typed.textContent = cur.slice(0, k); timer = setTimeout(del, 22); return; }
        var j = 0;
        (function add() { j++; typed.textContent = txt.slice(0, j); if (j < txt.length) timer = setTimeout(add, 48 + Math.random() * 46); else done(); })();
      })();
    }
    function next() {
      if (!vis || d.hidden) { timer = setTimeout(next, 1200); return; }
      idx = (idx + 1) % SC.length;
      var r = SC[idx];
      scEl.classList.add('is-swap');
      typeTo(r.q[LANG], function () {
        timer = setTimeout(function () { set(r, idx); scEl.classList.remove('is-swap'); timer = setTimeout(next, 4200); }, 260);
      });
    }
    if (!REDUCE) timer = setTimeout(next, 4800);
    if ('IntersectionObserver' in W) new IntersectionObserver(function (es) { vis = es[0].isIntersecting; }).observe(scEl);
    d.addEventListener('lang', function () { var r = SC[idx]; typed.textContent = r.q[LANG]; areaEl.textContent = r.area[LANG]; });
  })();

  /* feature strip: the coral line walks across */
  var feats = $$('.feats li');
  if (feats.length && !REDUCE) {
    var fi = 0;
    setInterval(function () {
      if (d.hidden || scrollY > innerHeight) return;
      feats[fi].classList.remove('on'); fi = (fi + 1) % feats.length; feats[fi].classList.add('on');
    }, 2600);
  }

  /* ───────── why: open → closed sign ───────── */
  var sign = $('[data-sign]');
  if (sign) {
    var flip = function (on) {
      sign.classList.toggle('is-flipped', on);
      sign.classList.remove('is-swing'); void sign.offsetWidth; if (!REDUCE) sign.classList.add('is-swing');
    };
    if ('IntersectionObserver' in W) {
      var sio = new IntersectionObserver(function (es) {
        if (es[0].isIntersecting) { setTimeout(function () { flip(true); }, 700); sio.disconnect(); }
      }, { threshold: .9 });
      sio.observe(sign);
    } else flip(true);
    sign.addEventListener('click', function () { flip(!sign.classList.contains('is-flipped')); });
  }

  /* ───────── bento details ───────── */
  var flipW = $('[data-flip]');
  if (flipW && !REDUCE) {
    var words = flipW.getAttribute('data-flip').split('|'), wi = 0;
    setInterval(function () {
      if (d.hidden) return;
      flipW.classList.add('is-out');
      setTimeout(function () { wi = (wi + 1) % words.length; flipW.textContent = words[wi]; flipW.classList.remove('is-out'); }, 360);
    }, 1900);
  }
  var gT = $('[data-g-typed]');
  if (gT && !REDUCE) {
    var gq = ['cappuccino de pijp', 'brunch oost', 'matcha near me', 'croissant open now'], gi = 0;
    setInterval(function () {
      if (d.hidden) return;
      gi = (gi + 1) % gq.length; var s = gq[gi], k = 0; gT.textContent = '';
      (function add() { k++; gT.textContent = s.slice(0, k); if (k < s.length) setTimeout(add, 55); })();
    }, 3600);
  }

  /* ───────── before / after ───────── */
  var ba = $('[data-ba]');
  if (ba) (function () {
    var ph = $('.ba__phone', ba), range = $('[data-ba-range]', ba), dragging = false, hint = null;
    var setBA = function (p) { p = clamp(p, 0, 100); ph.style.setProperty('--pv', (p / 100).toFixed(4)); range.value = Math.round(p); };
    var fromEvt = function (e) { var r = ph.getBoundingClientRect(); return (e.clientX - r.left) / r.width * 100; };
    var stopHint = function () { if (hint) { cancelAnimationFrame(hint); hint = null; } };
    ph.addEventListener('pointerdown', function (e) { dragging = true; stopHint(); try { ph.setPointerCapture(e.pointerId); } catch (x) { } setBA(fromEvt(e)); });
    ph.addEventListener('pointermove', function (e) { if (dragging) setBA(fromEvt(e)); });
    ph.addEventListener('pointerup', function () { dragging = false; });
    ph.addEventListener('pointercancel', function () { dragging = false; });
    range.addEventListener('input', function () { stopHint(); setBA(+range.value); });
    range.addEventListener('change', function () { range.setAttribute('aria-valuetext', range.value + '%'); });
    setBA(50);
    if (!REDUCE) whenIn(ba, function () {
      var keys = [[0, 50], [1100, 14], [2500, 84], [3500, 50]], t0 = performance.now();
      var e = function (x) { return x < .5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2; };
      (function step(now) {
        var t = now - t0, i = 1;
        while (i < keys.length && t > keys[i][0]) i++;
        if (i >= keys.length) { setBA(50); hint = null; return; }
        var a = keys[i - 1], b = keys[i], p = (t - a[0]) / (b[0] - a[0]);
        setBA(a[1] + (b[1] - a[1]) * e(clamp(p, 0, 1)));
        hint = requestAnimationFrame(step);
      })(t0);
    });
  })();

  /* ───────── take-off scene ───────── */
  var tk = $('[data-tk]'), TK = null;
  if (tk) (function () {
    var chart = $('[data-tk-chart]', tk), paths = $$('[data-tk-path]', tk), base = $('[data-tk-base]', tk);
    var tip = $('[data-tk-tip]', tk), flat = $('[data-tk-flat]', tk), nodes = $$('[data-tk-node]', tk);
    var FR = [.06, .36, .66, .985];
    var pts = nodes.map(function () { var p = d.createElement('i'); p.className = 'tk__pt'; chart.appendChild(p); return p; });
    TK = { len: 0, cw: 0, ch: 0, at: [], lastDraw: -1 };
    TK.layout = function () {
      var cw = chart.clientWidth, ch = chart.clientHeight; TK.cw = cw; TK.ch = ch;
      var m = narrow();
      var yb = ch * (m ? .86 : .9), yt = ch * (m ? .08 : .05);
      var P0 = [cw * .005, yb], P1 = [cw * (m ? .42 : .46), yb], P2 = [cw * (m ? .66 : .64), yb - (yb - yt) * .06], P3 = [cw * .985, yt];
      var dd = 'M' + P0.join(' ') + ' C' + P1.join(' ') + ' ' + P2.join(' ') + ' ' + P3.join(' ');
      paths.forEach(function (p) { p.setAttribute('d', dd); });
      base.setAttribute('d', 'M' + (cw * .005) + ' ' + yb + ' L' + cw + ' ' + yb);
      var L = paths[0].getTotalLength(); TK.len = L;
      paths.forEach(function (p) { p.style.strokeDasharray = L.toFixed(1) + ' ' + (L + 10).toFixed(1); });
      flat.style.top = yb + 'px';
      TK.at = FR.map(function (f) { var q = paths[0].getPointAtLength(L * f); return [q.x, q.y]; });
      pts.forEach(function (p, k) { p.style.left = TK.at[k][0] + 'px'; p.style.top = TK.at[k][1] + 'px'; });
      if (!m) {
        nodes.forEach(function (n, k) {
          n.style.removeProperty('transform');
          var w = n.offsetWidth, h = n.offsetHeight, x = TK.at[k][0], y = TK.at[k][1], l, tp;
          if (k === 0) { l = x - 18; tp = y - h - 26; }
          else if (k === 1) { l = x - w * .5; tp = y - h - 30; }
          else if (k === 2) { l = x + 26; tp = y + 8; }
          else { l = x - w - 34; tp = y - 6; }
          l = clamp(l, 0, cw - w); tp = clamp(tp, 0, ch - h);
          n.style.left = l + 'px'; n.style.top = tp + 'px';
        });
      } else nodes.forEach(function (n) { n.style.left = ''; n.style.top = ''; });
      TK.lastDraw = -1;
    };
    TK.frame = function (vh) {
      var r = tk.getBoundingClientRect();
      var p = clamp(-r.top / Math.max(1, r.height - vh), 0, 1);
      var draw = REDUCE ? 1 : clamp((p - .04) / .8, 0, 1);
      if (Math.abs(draw - TK.lastDraw) > .0005) {
        TK.lastDraw = draw;
        var off = TK.len * (1 - draw);
        paths.forEach(function (pth) { pth.style.strokeDashoffset = off.toFixed(1); });
        var q = paths[0].getPointAtLength(Math.max(.01, TK.len * draw));
        tip.style.transform = 'translate(' + q.x.toFixed(1) + 'px,' + q.y.toFixed(1) + 'px)';
        tip.style.opacity = draw > .005 && draw < .999 ? 1 : draw >= .999 ? 1 : 0;
        nodes.forEach(function (n, k) { var on = draw >= FR[k] - .005; n.classList.toggle('is-on', on); pts[k].classList.toggle('is-on', on); });
        flat.style.opacity = draw > .42 ? .35 : 1;
        TK.tipPt = [q.x, q.y];
      }
      var cr = chart.getBoundingClientRect();
      var tp = TK.tipPt || [0, TK.ch];
      return { x: (cr.left + tp[0]) / innerWidth, y: (cr.top + tp[1]) / vh, draw: draw };
    };
    TK.layout();
  })();

  /* ───────── work: horizontal track ───────── */
  var work = $('[data-work]'), track = $('[data-track]'), WK = null;
  if (work && track) (function () {
    var cards = $$('.card', track), fill = $('[data-work-fill]'), nEl = $('[data-work-n]');
    var phones = cards.map(function (c) { return $('.phone, .more__in', c); });
    WK = { dist: 0, last: -1 };
    WK.layout = function () {
      if (narrow()) { work.style.height = ''; track.style.transform = ''; phones.forEach(function (p) { p.style.transform = ''; }); WK.dist = 0; return; }
      var last = cards[cards.length - 1];
      var padR = parseFloat(getComputedStyle(track).paddingRight) || 0;
      WK.dist = Math.max(0, last.offsetLeft + last.offsetWidth + padR - innerWidth);
      work.style.height = (innerHeight + WK.dist * 1.05) + 'px';
      WK.last = -1;
    };
    WK.frame = function (vh) {
      if (narrow()) return;
      var r = work.getBoundingClientRect();
      var p = clamp(-r.top / Math.max(1, r.height - vh), 0, 1);
      if (Math.abs(p - WK.last) < .0002) return;
      WK.last = p;
      var x = -WK.dist * p;
      track.style.transform = 'translate3d(' + x.toFixed(1) + 'px,0,0)';
      if (fill) fill.style.transform = 'scaleX(' + p.toFixed(4) + ')';
      var n = Math.min(10, Math.round(p * 9) + 1); if (nEl) nEl.textContent = (n < 10 ? '0' : '') + n;
      if (!REDUCE) {
        var vw = innerWidth;
        cards.forEach(function (c, i) {
          var cx = c.offsetLeft + x + c.offsetWidth / 2, dx = (cx - vw / 2) / vw;
          var y = dx * dx * 70, rot = dx * -7;
          phones[i].style.transform = 'translate3d(0,' + y.toFixed(1) + 'px,0) rotateY(' + rot.toFixed(2) + 'deg)';
        });
      }
    };
    var phoneBar = function () {
      if (!narrow()) return;
      var m = track.scrollWidth - track.clientWidth, p = m > 0 ? track.scrollLeft / m : 0;
      if (fill) fill.style.transform = 'scaleX(' + p.toFixed(4) + ')';
      var n = Math.min(10, Math.round(p * 9) + 1); if (nEl) nEl.textContent = (n < 10 ? '0' : '') + n;
    };
    track.addEventListener('scroll', phoneBar, { passive: true });
    // the phone tilt stops while hovering one card so the hover lift reads clearly
    cards.forEach(function (c, i) { c.addEventListener('pointerenter', function () { if (FINE) phones[i].style.transition = 'transform .6s cubic-bezier(.16,1,.3,1),box-shadow .6s,border-color .4s'; }); });
    WK.layout();
  })();

  /* ───────── scroll loop: glass light, header, nav, dock ───────── */
  var glassSecs = $$('[data-glow]').map(function (el) {
    var g = el.getAttribute('data-glow'), v = g === 'tk' ? null : g.split(',').map(Number);
    return { el: el, v: v, tk: g === 'tk' };
  });
  var panels = $$('.panel');
  var hdr = $('#hdr'), navLinks = $$('[data-nav]'), navPill = $('.nav__pill');
  var navSecs = navLinks.map(function (a) { return $(a.getAttribute('href')); });
  var dock = $('.dock'), dockBlocked = true, askOpen = false, ptOpen = false;
  var cursor = $('.cursor');
  var lastNav = null, lastY = -1, lastVH = 0, frameN = 0;

  function moveNavPill(a) {
    if (!navPill) return;
    if (!a) { navPill.style.opacity = 0; return; }
    navPill.style.opacity = 1;
    navPill.style.width = a.offsetWidth + 'px';
    navPill.style.transform = 'translateX(' + a.offsetLeft + 'px)';
  }
  function frame() {
    var vh = innerHeight, y = scrollY;
    frameN++;
    var tkg = TK ? TK.frame(vh) : null;
    if (WK) WK.frame(vh);
    if (y === lastY && vh === lastVH && frameN % 20) return;
    lastY = y; lastVH = vh;

    // which glass section owns the light?
    var best = null, bestV = 0;
    glassSecs.forEach(function (s) {
      var r = s.el.getBoundingClientRect();
      var v = Math.min(vh, r.bottom) - Math.max(0, r.top);
      if (v > bestV) { bestV = v; best = s; }
    });
    var ftr = $('.ftr'), fr = ftr && ftr.getBoundingClientRect();
    if (W.REED && best) {
      var port = innerWidth < innerHeight ? .72 : 1;
      if (best.tk && tkg) {
        W.REED.target({ x: clamp(tkg.x, 0, 1), y: clamp(tkg.y, -.1, 1.1), r: (.2 + .14 * tkg.draw) * port, i: .45 + .75 * tkg.draw, haze: .75 });
      } else if (best.v) {
        W.REED.target({ x: best.v[0], y: best.v[1] + (port < 1 && best.v[1] > .9 ? .08 : 0), r: best.v[2] * port, i: best.v[3], haze: best.v[4] });
      }
      // a cream panel filling the screen hides the glass: skip drawing it
      var covered = panels.some(function (p) { var r = p.getBoundingClientRect(); return r.top <= 0 && r.bottom >= vh; });
      W.REED.skip(covered);
    }

    // header on cream?
    var onCream = panels.some(function (p) { var r = p.getBoundingClientRect(); return r.top <= 34 && r.bottom >= 34; });
    if (hdr) hdr.classList.toggle('is-cream', onCream);

    // nav state
    var mid = vh * .45, act = null;
    navSecs.forEach(function (s, i) { if (!s) return; var r = s.getBoundingClientRect(); if (r.top <= mid && r.bottom > mid) act = navLinks[i]; });
    if (act !== lastNav) {
      navLinks.forEach(function (a) { a.classList.toggle('is-on', a === act); });
      moveNavPill(act); lastNav = act;
    }

    // dock
    if (dock) {
      var inTk = false;
      if (tk) { var tr = tk.getBoundingClientRect(); inTk = tr.top < vh * .5 && tr.bottom > vh * .5; }
      var show = narrow() && y > vh * .7 && !dockBlocked && !askOpen && !ptOpen && !inTk && !(fr && fr.top < vh);
      dock.classList.toggle('is-on', show);
      dock.setAttribute('aria-hidden', show ? 'false' : 'true');
      dock.tabIndex = show ? 0 : -1;
    }
  }
  if (dock && 'IntersectionObserver' in W) {
    var blockers = $$('[data-ask],[data-test]').filter(function (b) { return b !== dock && !b.closest('.mnav') && !b.closest('.hdr') && !b.closest('.ask'); });
    var dio = new IntersectionObserver(function (es) {
      es.forEach(function (e) { e.target._vis = e.isIntersecting; });
      dockBlocked = blockers.some(function (b) { return b._vis; });
    });
    blockers.forEach(function (b) { dio.observe(b); });
  } else dockBlocked = false;
  (function loop() { frame(); requestAnimationFrame(loop); })();

  var rT;
  function relayout() { if (TK) TK.layout(); if (WK) WK.layout(); moveNavPill(lastNav); lastY = -1; if (lenis) lenis.resize(); }
  W.addEventListener('resize', function () { clearTimeout(rT); rT = setTimeout(relayout, 140); });
  if (d.fonts && d.fonts.ready) d.fonts.ready.then(relayout);
  W.addEventListener('load', relayout);
  d.addEventListener('lang', function () { setTimeout(relayout, 30); $$('[data-split]').forEach(function (el) { if (el.classList.contains('is-in')) el.classList.add('is-in'); }); });

  /* pointer → light + cursor */
  if (FINE) {
    var cx = innerWidth / 2, cy = innerHeight / 2, rx = cx, ry = cy;
    var dot = cursor && $('.cursor__dot', cursor), ring = cursor && $('.cursor__ring', cursor), lbl = cursor && $('.cursor__lbl', cursor);
    W.addEventListener('pointermove', function (e) {
      cx = e.clientX; cy = e.clientY;
      if (W.REED) W.REED.pointer(cx, cy, true);
      if (!cursor) return;
      cursor.classList.remove('is-hidden'); cursor.classList.add('is-live');
      var lab = e.target.closest && e.target.closest('[data-cursor]');
      var txt = lab ? lab.getAttribute('data-cursor') : '';
      if (lbl && lbl.textContent !== txt) lbl.textContent = txt;
      cursor.classList.toggle('has-lbl', !!txt);
      cursor.classList.toggle('on-cream', !!(e.target.closest && e.target.closest('.panel')));
    }, { passive: true });
    d.addEventListener('mouseleave', function () { if (cursor) cursor.classList.add('is-hidden'); if (W.REED) W.REED.pointer(cx, cy, false); });
    if (cursor) (function follow() {
      rx += (cx - rx) * .2; ry += (cy - ry) * .2;
      dot.style.transform = 'translate3d(' + cx + 'px,' + cy + 'px,0)';
      ring.style.transform = 'translate3d(' + rx.toFixed(1) + 'px,' + ry.toFixed(1) + 'px,0)';
      requestAnimationFrame(follow);
    })();
    if (!REDUCE) $$('[data-magnetic]').forEach(function (b) {
      b.addEventListener('pointermove', function (e) { var r = b.getBoundingClientRect(); b.style.transform = 'translate(' + ((e.clientX - r.left - r.width / 2) * .18).toFixed(1) + 'px,' + ((e.clientY - r.top - r.height / 2) * .28).toFixed(1) + 'px)'; });
      b.addEventListener('pointerleave', function () { b.style.transform = ''; });
    });
  }

  /* ───────── dialog ───────── */
  var ask = $('#ask'), form = $('#ask-form'), step = 1, lastFocus = null;
  var panes = ask ? $$('[data-pane]', ask) : [], panesEl = ask && $('[data-panes]', ask);
  var LAST = 6, DONE = 7, KEEP_KEY = 'dolcessi_ask2', askSrc = 'Site';
  function focusables(root) {
    return $$('a[href],button:not([disabled]),input:not([type=hidden]),select,textarea,[tabindex]:not([tabindex="-1"])', root || ask)
      .filter(function (el) { return el.offsetParent !== null && !el.closest('[hidden]') && !el.closest('.is-leaving'); });
  }
  function goStep(n, back, instant) {
    step = n;
    var cur = panes.filter(function (p) { return !p.hidden && !p.classList.contains('is-leaving'); })[0];
    var nxt = panes.filter(function (p) { return +p.getAttribute('data-pane') === n; })[0];
    var animate = !instant && !REDUCE && cur && nxt && cur !== nxt && panesEl && nxt.animate;
    if (animate) {
      var h0 = panesEl.offsetHeight, dir = back ? -1 : 1;
      cur.classList.add('is-leaving'); nxt.hidden = false;
      var h1 = panesEl.offsetHeight;
      panesEl.style.overflow = 'hidden';
      var ha = panesEl.animate([{ height: h0 + 'px' }, { height: h1 + 'px' }], { duration: 320, easing: 'cubic-bezier(.2,.7,.1,1)' });
      ha.onfinish = ha.oncancel = function () { panesEl.style.overflow = ''; };
      var out = cur.animate([{ opacity: 1, transform: 'none' }, { opacity: 0, transform: 'translateX(' + (-14 * dir) + 'px)' }], { duration: 170, easing: 'cubic-bezier(.4,0,1,1)', fill: 'forwards' });
      out.onfinish = function () { cur.hidden = true; cur.classList.remove('is-leaving'); out.cancel(); };
      cur.style.position = 'absolute'; cur.style.left = 0; cur.style.right = 0; cur.style.top = 0;
      setTimeout(function () { cur.style.position = ''; cur.style.left = ''; cur.style.right = ''; cur.style.top = ''; }, 200);
      nxt.animate([{ opacity: 0, transform: 'translateX(' + (16 * dir) + 'px)' }, { opacity: 1, transform: 'none' }], { duration: 300, delay: 30, easing: 'cubic-bezier(.2,.7,.1,1)', fill: 'backwards' });
    } else {
      panes.forEach(function (p) { p.hidden = +p.getAttribute('data-pane') !== n; p.classList.remove('is-leaving'); });
    }
    $('[data-stepn]', ask).textContent = '0' + Math.min(n, LAST);
    $('.ask__step', ask).style.visibility = n === DONE ? 'hidden' : '';
    $('[data-bar]', ask).style.width = (Math.min(n, LAST) / LAST * 100) + '%';
    ask.setAttribute('aria-labelledby', 'ask-h' + n);
    setTimeout(function () {
      var pane = panes.filter(function (p) { return +p.getAttribute('data-pane') === n; })[0], f = null;
      if (n === LAST) f = $('[data-err-msg]:not([hidden])') || $('#f-name').value ? $('#f-email') : $('#f-name');
      else if (n === 5) f = $('#f-rest');
      else if (n === DONE) f = $('[data-close]', pane);
      else if (pane) { f = $('.ask__h', pane); if (f) f.setAttribute('tabindex', '-1'); }
      if (f && (FINE || n >= 4 || n <= 3)) f.focus({ preventScroll: true });
    }, 60);
  }
  function setInert(on) { $$('main, .hdr, .ftr, .skip, .mnav, .dock').forEach(function (el) { if ('inert' in el) el.inert = on; else if (on) el.setAttribute('aria-hidden', 'true'); else el.removeAttribute('aria-hidden'); }); }
  // one page-level state for both dialogs (the Phone Test hands over to the question flow)
  function modalSync() {
    var on = askOpen || ptOpen;
    html.classList.toggle('ask-open', on); setInert(on);
    if (lenis) { if (on) lenis.stop(); else lenis.start(); }
  }
  function openAsk(n, back) {
    if (!ask || askOpen) return;
    setMenu(false);
    askOpen = true; lastFocus = back || d.activeElement;
    ask.hidden = false;
    requestAnimationFrame(function () { requestAnimationFrame(function () { if (askOpen) ask.classList.add('is-open'); }); });
    modalSync();
    goStep(n || 1, false, true);
  }
  function closeAsk() {
    if (!askOpen) return;
    askOpen = false;
    ask.classList.remove('is-open'); modalSync();
    setTimeout(function () { if (!askOpen) ask.hidden = true; }, 520);
    if (lastFocus && lastFocus.focus && lastFocus !== d.body) lastFocus.focus({ preventScroll: true });
  }
  W.openAsk = openAsk;
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
    if (o) { e.preventDefault(); askSrc = o.getAttribute('data-ask') || 'Site'; openAsk(1); return; }
    var tb = e.target.closest && e.target.closest('[data-test]');
    if (tb) { e.preventDefault(); openTest(); return; }
    if (askOpen && e.target.closest && e.target.closest('[data-close]')) { e.preventDefault(); closeAsk(); }
  });
  function setErr(input, key) {
    var f = input.closest('.fld'), em = $('.fld__err', f);
    f.classList.toggle('is-bad', !!key); em.textContent = key ? t(key) : '';
    input.setAttribute('aria-invalid', key ? 'true' : 'false');
  }
  function optErr(n, key) { var e = $('#e-' + n); if (e) e.textContent = key ? t(key) : ''; }
  function vPick(n, name) {
    var c = $('input[name="' + name + '"]:checked', form);
    if (!c) { optErr(n, 'errPick'); return false; }
    var xo = c.getAttribute('data-other'), x = xo && $('#' + xo);
    if (x && !x.value.trim()) { optErr(n, 'errOther'); x.focus(); return false; }
    optErr(n, null); return true;
  }
  function vGoal() {
    var g = $$('[data-goal]:checked', form).map(function (i) { return i.value; });
    $('#f-goal').value = g.join(' · ');
    if (!g.length) { optErr(3, 'errGoal'); return false; }
    optErr(3, null); return true;
  }
  function vPlan() {
    var ok = !!$('input[name="contact[timing]"]:checked', form) && !!$('input[name="contact[option]"]:checked', form);
    optErr(4, ok ? null : 'errPick2'); return ok;
  }
  function v1() { var r = $('#f-rest'), ok = r.value.trim().length > 0; setErr(r, ok ? null : 'errRest'); if (!ok) r.focus(); return ok; }
  function vStep(n) { return n === 1 ? vPick(1, 'contact[help]') : n === 2 ? vPick(2, 'contact[business_type]') : n === 3 ? vGoal() : n === 4 ? vPlan() : n === 5 ? v1() : n === 6 ? v2() : true; }
  function firstBad() { for (var i = 1; i < LAST; i++) if (!vStep(i)) return i; return 0; }
  function v2() {
    var n = $('#f-name'), m = $('#f-email'), ok = true, first = null;
    if (!n.value.trim()) { setErr(n, 'errName'); ok = false; first = first || n; } else setErr(n, null);
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(m.value.trim())) { setErr(m, 'errEmail'); ok = false; first = first || m; } else setErr(m, null);
    if (first) first.focus();
    return ok;
  }
  function saveForm() {
    try {
      var v = { t: {}, c: [] };
      $$('input', form).forEach(function (i) {
        if (i.type === 'radio' || i.type === 'checkbox') { if (i.checked) v.c.push((i.name || 'goal') + '=' + i.value); }
        else if (i.id && i.type !== 'hidden') v.t[i.id] = i.value;
      });
      sessionStorage.setItem(KEEP_KEY, JSON.stringify(v));
    } catch (e) { }
  }
  function restoreForm() {
    try {
      var v = JSON.parse(sessionStorage.getItem(KEEP_KEY) || 'null'); if (!v) return;
      Object.keys(v.t || {}).forEach(function (id) { var i = d.getElementById(id); if (i && !i.value) i.value = v.t[id]; });
      $$('input[type=radio],input[type=checkbox]', form).forEach(function (i) { if ((v.c || []).indexOf((i.name || 'goal') + '=' + i.value) > -1) i.checked = true; });
      syncOpts();
    } catch (e) { }
  }
  function syncOpts() {
    $$('[data-x]', form).forEach(function (box) {
      var r = $('[data-other="' + box.getAttribute('data-x') + '"]', form);
      box.hidden = !(r && r.checked);
      $$('input', box).forEach(function (i) { i.disabled = box.hidden; });
    });
  }
  function clearForm() { ptRes = null; try { sessionStorage.removeItem(KEEP_KEY); sessionStorage.removeItem(PT_KEY); } catch (e) { } }
  if (ask && form) {
    syncOpts();
    $$('[data-next]', ask).forEach(function (b) { b.addEventListener('click', function () { if (vStep(step)) goStep(step + 1); }); });
    $$('[data-back]', ask).forEach(function (b) { b.addEventListener('click', function () { goStep(Math.max(1, step - 1), true); }); });
    var autoT = 0;
    form.addEventListener('change', function (e) {
      var i = e.target; if (!i || !i.matches) return;
      if (i.type === 'radio') {
        syncOpts(); optErr(step, null);
        clearTimeout(autoT);
        if (i.hasAttribute('data-auto')) { var at = step; autoT = setTimeout(function () { if (step === at && i.checked) goStep(at + 1); }, REDUCE ? 60 : 380); }
        else if (i.hasAttribute('data-pair')) {
          // two single-choice lists on one step: move on once both are answered
          var ps = step, all = $$('.opts', i.closest('.pane')).every(function (g) { return !!$('input:checked', g); });
          if (all) autoT = setTimeout(function () { if (step === ps) goStep(ps + 1); }, REDUCE ? 60 : 420);
        }
        else if (i.getAttribute('data-other')) setTimeout(function () { var x = $('#' + i.getAttribute('data-other')); if (x) x.focus({ preventScroll: true }); }, 60);
      }
      if (i.hasAttribute('data-goal')) { $('#f-goal').value = $$('[data-goal]:checked', form).map(function (c) { return c.value; }).join(' · '); optErr(3, null); }
    });
    form.addEventListener('keydown', function (e) {
      if (e.key !== 'Enter' || step >= LAST) return;
      var tg = e.target; if (tg && tg.tagName === 'BUTTON') return;
      e.preventDefault(); if (vStep(step)) goStep(step + 1);
    });
    ['#f-rest', '#f-name', '#f-email'].forEach(function (s) { $(s).addEventListener('input', function () { if ($(s).closest('.fld').classList.contains('is-bad')) setErr($(s), null); }); });
    form.addEventListener('submit', function (e) {
      if (step !== LAST) { e.preventDefault(); if (step < LAST && vStep(step)) goStep(step + 1); return; }
      var bad = firstBad();
      if (bad) { e.preventDefault(); goStep(bad, true); return; }
      if (!v2()) { e.preventDefault(); return; }
      var g = function (s) { return ($(s).value || '').trim(); };
      var pick = function (name, other) { var c = $('input[name="' + name + '"]:checked', form); if (!c) return '—'; return c.getAttribute('data-other') ? c.value + ': ' + g('#' + other) : c.value; };
      var ptS = g('#f-pt-score'), ptF = g('#f-pt-fails'), subj = $('input[name="contact[subject]"]', form);
      if (subj) subj.value = 'Show me my site' + (ptS ? ' · Phone Test ' + ptS : '');
      $('#f-body').value = ['Show me my site', '',
        'Needs help with: ' + pick('contact[help]', 'f-help-x'),
        'Business type: ' + pick('contact[business_type]', 'f-type-x'),
        'Goals: ' + (g('#f-goal') || '—'),
        'When live: ' + pick('contact[timing]'),
        'Option: ' + pick('contact[option]'),
        'Business: ' + g('#f-rest'),
        'Neighbourhood / city: ' + (g('#f-area') || '—'),
        'Current site / Instagram: ' + (g('#f-site') || '—'),
        '',
        'Phone Test: ' + (ptS || 'not taken'),
        'Phone Test fails: ' + (ptF || '—'),
        '',
        'Name: ' + g('#f-name'), 'Email: ' + g('#f-email'), 'WhatsApp / phone: ' + (g('#f-phone') || '—'),
        'Via: ' + askSrc + ' · ' + intake.id + ' intake',
        'Language: ' + LANG.toUpperCase(), 'Page: ' + location.href.split('#')[0].split('?')[0]].join('\n');
      saveForm();
      var sb = $('button[type=submit]', form);
      sb.disabled = true; sb.setAttribute('aria-busy', 'true'); $('span', sb).textContent = t('sending');
    });
    W.addEventListener('pageshow', function () {
      var sb = $('button[type=submit]', form);
      if (sb && sb.disabled) { sb.disabled = false; sb.removeAttribute('aria-busy'); $('span', sb).textContent = t('send'); }
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


  /* ───────── Phone Test: 10 yes/no checks, a score, a fix per no ───────── */
  // s: short name (index 0 goes into the email, in English) · h: question · p: how to check · f: the fix
  var PTQ = [
    { s: ['Menu as a web page', 'Menu als webpagina'],
      h: ['Is your menu a real web page, <em>not a PDF or a photo?</em>', 'Staat je menu als echte webpagina online, <em>niet als pdf of foto?</em>'],
      p: ['Open it on your phone. A PDF download or a photo of the menu card counts as no.', 'Open het op je telefoon. Een pdf-download of een foto van de menukaart telt als nee.'],
      f: ['Put the menu on the page as text: readable with one thumb, and easy to update.', 'Zet het menu als tekst op de pagina: leesbaar met één duim en makkelijk aan te passen.'] },
    { s: ['Opens within 3 seconds', 'Opent binnen 3 seconden'],
      h: ['Does your site open <em>within 3 seconds</em> on your phone?', 'Opent je site <em>binnen 3 seconden</em> op je telefoon?'],
      p: ['Try it on 4G, not on your Wi-Fi. Count: one, two, three.', 'Probeer het op 4G, niet op je wifi. Tel: één, twee, drie.'],
      f: ['Make it fast: 53% of people on their phone leave a page that takes longer than 3 seconds to load (Google, 2016).', 'Maak hem snel: 53% van de mensen op hun telefoon haakt af als een pagina langer dan 3 seconden laadt (Google, 2016).'] },
    { s: ['One-tap call', 'Bellen met één tik'],
      h: ['Can people call you <em>with one tap?</em>', 'Kunnen mensen je bellen <em>met één tik?</em>'],
      p: ['Tap the phone number on your site. Does your phone start dialling?', 'Tik op het telefoonnummer op je site. Gaat je telefoon bellen?'],
      f: ['Turn your number into a call button, right at the top.', 'Maak van je nummer een belknop, bovenaan.'] },
    { s: ['Route button', 'Routeknop'],
      h: ['Is there a <em>route button</em> that opens maps?', 'Is er een <em>routeknop</em> die kaarten opent?'],
      p: ['One tap from your site to directions to your door.', 'Eén tik van je site naar de route naar je deur.'],
      f: ['Add a Route button that opens Google or Apple Maps to your door.', 'Voeg een Route-knop toe die Google Maps of Apple Kaarten naar je deur opent.'] },
    { s: ['Booking or ordering on a phone', 'Reserveren of bestellen op de telefoon'],
      h: ['Can guests book or order <em>on their phone?</em>', 'Kunnen gasten reserveren of bestellen <em>op hun telefoon?</em>'],
      p: ['Try it yourself, start to finish. Don’t take bookings or orders? Tap yes.', 'Probeer het zelf, van begin tot eind. Geen reserveringen of bestellingen? Tik ja.'],
      f: ['One clear Book or Order button, linked to the system you already use and tested on a phone.', 'Eén duidelijke knop Reserveren of Bestellen, gekoppeld aan het systeem dat je al gebruikt en getest op een telefoon.'] },
    { s: ['Google hours and link', 'Google-tijden en link'],
      h: ['Are your hours on Google right, <em>and linked to your site?</em>', 'Kloppen je tijden op Google, <em>met een link naar je site?</em>'],
      p: ['Search your name in Google Maps. Are today’s hours right, and is there a Website button?', 'Zoek je zaak op in Google Maps. Kloppen de tijden van vandaag, en is er een knop Website?'],
      f: ['Correct your Google hours (holidays too) and add your website to the profile.', 'Zet je tijden op Google goed (ook feestdagen) en zet je website in je profiel.'] },
    { s: ['Dutch and English', 'Nederlands en Engels'],
      h: ['Is your site in Dutch <em>and English?</em>', 'Is je site in het Nederlands <em>én het Engels?</em>'],
      p: ['For the neighbours and for the tourists.', 'Voor de buurt en voor de toerist.'],
      f: ['Offer both, with one tap to switch.', 'Bied allebei aan, met één tik om te wisselen.'] },
    { s: ['Allergens marked', 'Allergenen vermeld'],
      h: ['Are allergens <em>marked on your menu?</em>', 'Staan de allergenen <em>bij je menu?</em>'],
      p: ['Gluten, nuts, milk: next to each dish, not only “ask our staff”.', 'Gluten, noten, melk: bij elk gerecht, niet alleen ‘vraag het ons personeel’.'],
      f: ['Mark allergens next to each dish, so guests don’t have to ask.', 'Zet allergenen bij elk gerecht, zodat gasten het niet hoeven te vragen.'] },
    { s: ['Recent photos', 'Recente foto’s'],
      h: ['Do your photos show your place <em>as it is today?</em>', 'Laten je foto’s je zaak zien <em>zoals hij nu is?</em>'],
      p: ['Same room, same dishes. Not the opening-day shots.', 'Zelfde inrichting, zelfde gerechten. Niet de foto’s van de opening.'],
      f: ['Swap in recent photos of today’s dishes and today’s room.', 'Zet er recente foto’s op van de gerechten en de zaak van nu.'] },
    { s: ['Instagram links to the site', 'Instagram linkt naar je site'],
      h: ['Does your Instagram <em>link to your site?</em>', 'Linkt je Instagram <em>naar je site?</em>'],
      p: ['Check your bio: is the link there, and does it open your site?', 'Check je bio: staat de link erin, en opent hij je site?'],
      f: ['Put your site in your Instagram bio, so followers find the menu, the route and the booking.', 'Zet je site in je Instagram-bio, zodat volgers het menu, de route en reserveren vinden.'] }
  ];
  var PTV = {
    none: { k: ['No website yet', 'Nog geen website'], h: ['Starting <em>from zero.</em>', 'We beginnen <em>bij nul.</em>'],
      p: ['No old site to fix, so we start clean. Right now, guests only see what Google and Instagram show them.', 'Geen oude site om te repareren, dus we beginnen schoon. Nu zien gasten alleen wat Google en Instagram laten zien.'] },
    top: { k: ['Every check passed', 'Alles in orde'], h: ['Your site <em>works.</em>', 'Je site <em>werkt.</em>'],
      p: ['Ten out of ten. Honestly: you don’t need us for the basics. Want a site people remember? Ask for a free preview anyway.', 'Tien uit tien. Eerlijk is eerlijk: voor de basis heb je ons niet nodig. Wil je een site die mensen onthouden? Vraag gerust een gratis preview aan.'] },
    good: { k: ['Nearly there', 'Bijna'], h: ['Almost there. <em>Fix the last bits.</em>', 'Bijna klaar. <em>Nog even afmaken.</em>'],
      p: ['The basics are in place. What’s left are quick wins, and some you can fix yourself today.', 'De basis staat. Wat overblijft zijn snelle winsten, en een paar kun je vandaag zelf regelen.'] },
    mid: { k: ['Works, with gaps', 'Werkt, met gaten'], h: ['It works. <em>With gaps.</em>', 'Hij werkt. <em>Met gaten.</em>'],
      p: ['Guests can find you, but they hit walls on the way in. Every no below is a point where someone can give up and go next door.', 'Gasten vinden je, maar lopen onderweg tegen muren aan. Elke nee hieronder is een moment waarop iemand kan afhaken en naar de buren gaat.'] },
    low: { k: ['Looks closed', 'Lijkt gesloten'], h: ['On a phone, it looks <em>closed.</em>', 'Op een telefoon lijkt hij <em>gesloten.</em>'],
      p: ['Most of the basics are missing, and that’s what guests see first. The good news: every one of these can be fixed, and fast.', 'Het meeste van de basis ontbreekt, en dat zien gasten als eerste. Goed nieuws: alles hieronder is op te lossen, en snel.'] }
  };
  var pt = $('#pt'), ptBox = pt && $('[data-pt-panes]', pt), ptPanes = pt ? $$('[data-tp]', pt) : [];
  var ptIdx = 0, ptAns = [], ptRes = null, ptLast = null, ptBusy = false, ptT = 0, ptOvT = 0, PT_KEY = 'dolcessi_pt', PT_C = 289.03;
  var ptL = function () { return LANG === 'nl' ? 1 : 0; };
  function ptPane() { var p = ptPanes.filter(function (x) { return !x.hidden; })[0]; return p ? p.getAttribute('data-tp') : ''; }
  function ptHead(name) {
    var st = $('[data-pt-step]', pt), bar = $('[data-pt-bar]', pt);
    if (name === 'q') { st.innerHTML = '<b>' + pad(ptIdx + 1) + '</b> / 10'; bar.style.width = ((ptIdx + 1) * 10) + '%'; }
    else if (name === 'r') { st.textContent = t('ptResult'); bar.style.width = '100%'; }
    else { st.textContent = '60 sec'; bar.style.width = '0%'; }
  }
  function ptShow(name, dir, instant, render) {
    var go = function () {
      ptPanes.forEach(function (p) { p.hidden = p.getAttribute('data-tp') !== name; });
      if (render) render();
      ptHead(name);
      pt.setAttribute('aria-labelledby', name === 'q' ? 'pt-hq' : name === 'r' ? 'pt-hr' : 'pt-h0');
      var pnl = $('.ask__panel', pt); if (pnl) pnl.scrollTop = 0;
    };
    var focusIt = function () { var p = ptPanes.filter(function (x) { return !x.hidden; })[0], h = p && $('.ask__h', p); if (h && ptOpen && !askOpen) h.focus({ preventScroll: true }); };
    if (instant || REDUCE || !ptBox.animate) { go(); setTimeout(focusIt, 60); return; }
    // timers, not animation events, drive the swap: answers never wait on a slow frame
    ptBusy = true;
    var h0 = ptBox.offsetHeight;
    ptBox.style.overflow = 'hidden';
    var out = ptBox.animate([{ opacity: 1, transform: 'none' }, { opacity: 0, transform: 'translateX(' + (-12 * dir) + 'px)' }], { duration: 150, easing: 'cubic-bezier(.4,0,1,1)', fill: 'forwards' });
    setTimeout(function () {
      go();
      var h1 = ptBox.offsetHeight;
      out.cancel();
      ptBox.animate([{ opacity: 0, transform: 'translateX(' + (14 * dir) + 'px)', height: h0 + 'px' }, { opacity: 1, transform: 'none', height: h1 + 'px' }], { duration: 320, easing: 'cubic-bezier(.2,.7,.1,1)' });
      clearTimeout(ptOvT); ptOvT = setTimeout(function () { ptBox.style.overflow = ''; }, 340);
      ptBusy = false;
      setTimeout(focusIt, 40);
    }, 150);
  }
  function ptMark() {
    $$('[data-pt-a]', pt).forEach(function (b) {
      var on = ptAns[ptIdx] === (b.getAttribute('data-pt-a') === '1');
      b.classList.toggle('is-on', on); b.setAttribute('aria-pressed', on ? 'true' : 'false');
    });
  }
  function ptRenderQ() {
    var q = PTQ[ptIdx], L = ptL();
    $('[data-pt-k]', pt).textContent = pad(ptIdx + 1) + ' · ' + q.s[L];
    $('[data-pt-h]', pt).innerHTML = q.h[L];
    $('[data-pt-p]', pt).textContent = q.p[L];
    ptMark();
  }
  function ptAnswer(v) {
    if (ptBusy || !ptOpen || ptPane() !== 'q') return;
    ptAns[ptIdx] = v; ptMark();
    ptBusy = true; clearTimeout(ptT);
    ptT = setTimeout(function () {
      ptBusy = false;
      if (ptIdx < PTQ.length - 1) ptShow('q', 1, false, function () { ptIdx++; ptRenderQ(); });
      else ptFinish(false);
    }, REDUCE ? 0 : 170);
  }
  function ptStore() {
    var r = ptRes, a = $('#f-pt-score'), b = $('#f-pt-fails');
    if (!r) { if (a) a.value = ''; if (b) b.value = ''; return; }
    if (a) a.value = r.noSite ? '0/10 (no website)' : r.score + '/10';
    if (b) b.value = r.noSite ? 'No website yet' : r.fails.length ? r.fails.map(function (i) { return PTQ[i].s[0]; }).join('; ') : 'None, all 10 passed';
  }
  function ptFinish(noSite) {
    var fails = [], score = 0;
    PTQ.forEach(function (q, i) { if (!noSite && ptAns[i]) score++; else fails.push(i); });
    ptRes = { score: score, noSite: !!noSite, fails: fails };
    ptStore();
    try { sessionStorage.setItem(PT_KEY, JSON.stringify(ptRes)); } catch (e) { }
    ptShow('r', 1, false, function () { ptRenderR(false); });
  }
  function ptRenderR(still) {
    var r = ptRes, L = ptL(), s = r.score;
    var V = PTV[r.noSite ? 'none' : s === 10 ? 'top' : s >= 8 ? 'good' : s >= 5 ? 'mid' : 'low'];
    $('[data-pt-tier]', pt).textContent = V.k[L];
    $('[data-pt-vh]', pt).innerHTML = V.h[L];
    $('[data-pt-vp]', pt).textContent = V.p[L];
    $('[data-pt-fix]', pt).hidden = !r.fails.length;
    $('[data-pt-fixlbl]', pt).textContent = (r.noSite ? t('ptDay') : t('ptFix')) + ' · ' + r.fails.length;
    $('[data-pt-fails]', pt).innerHTML = r.fails.map(function (i) {
      return '<li><span class="pt__i mono">' + pad(i + 1) + '</span><span><b>' + PTQ[i].s[L] + '</b><small>' + PTQ[i].f[L] + '</small></span></li>';
    }).join('');
    var ok = r.noSite ? [] : PTQ.filter(function (q, i) { return r.fails.indexOf(i) < 0; }).map(function (q) { return q.s[L]; });
    var pass = $('[data-pt-pass]', pt);
    pass.hidden = !ok.length;
    pass.innerHTML = ok.length === PTQ.length ? '<b>✓ ' + t('ptAll') + '</b>' : '<b>✓ ' + t('ptPassed') + '</b> ' + ok.join(' · ');
    $('[data-pt-wa]', pt).href = 'https://wa.me/31640421118?text=' + encodeURIComponent(r.noSite ? t('ptWaNone') : t('ptWa').replace('%s', s));
    var arc = $('[data-pt-arc]', pt), n = $('[data-pt-n]', pt), off = (PT_C * (1 - s / 10)).toFixed(1);
    if (still || REDUCE) { arc.style.transition = 'none'; arc.style.strokeDashoffset = off; n.textContent = s; return; }
    arc.style.transition = 'none'; arc.style.strokeDashoffset = PT_C; n.textContent = '0';
    void arc.getBoundingClientRect();
    var t0 = performance.now() + 220;
    setTimeout(function () { arc.style.transition = ''; arc.style.strokeDashoffset = off; }, 220);
    (function step(now) {
      var p = clamp((now - t0) / 1300, 0, 1), e = 1 - Math.pow(2, -10 * p);
      n.textContent = Math.round(s * (p >= 1 ? 1 : e));
      if (p < 1) requestAnimationFrame(step);
    })(performance.now());
  }
  function openTest() {
    if (!pt || ptOpen || askOpen) return;
    setMenu(false);
    ptOpen = true; ptLast = d.activeElement;
    pt.hidden = false;
    requestAnimationFrame(function () { requestAnimationFrame(function () { if (ptOpen) pt.classList.add('is-open'); }); });
    modalSync();
    if (ptRes) ptShow('r', 1, true, function () { ptRenderR(true); });
    else { ptAns = []; ptIdx = 0; ptShow('0', 1, true); }
  }
  function closeTest(silent) {
    if (!ptOpen) return;
    ptOpen = false; clearTimeout(ptT); ptBusy = false;
    pt.classList.remove('is-open'); modalSync();
    setTimeout(function () { if (!ptOpen) pt.hidden = true; }, 520);
    if (/^#test$/i.test(location.hash)) { try { history.replaceState(null, '', location.pathname + location.search); } catch (e) { } }
    if (!silent && ptLast && ptLast.focus && ptLast !== d.body) ptLast.focus({ preventScroll: true });
  }
  // result → question flow, with the score and the fails in hidden fields
  function ptPreview() {
    if (!ptRes || !form) return;
    ptStore();
    if (!$('input[name="contact[help]"]:checked', form)) {
      var v = ptRes.noSite ? 'A new website' : ptRes.score <= 7 ? 'Redesign my website' : '', o = v && $('input[name="contact[help]"][value="' + v + '"]', form);
      if (o) { o.checked = true; syncOpts(); }
    }
    askSrc = 'Phone Test result';
    openAsk(1, ptLast);
    // the question flow fades in over the test; close the test once it's fully covered
    (function wait(n) {
      if (ask.classList.contains('is-open') || n > 40) setTimeout(function () { closeTest(true); }, REDUCE ? 0 : 520);
      else requestAnimationFrame(function () { wait(n + 1); });
    })(0);
  }
  W.openTest = openTest;
  if (pt) {
    try { var pr = JSON.parse(sessionStorage.getItem(PT_KEY) || 'null'); if (pr && pr.fails && typeof pr.score === 'number') { ptRes = pr; ptStore(); } } catch (e) { }
    pt.addEventListener('click', function (e) {
      var tg = e.target; if (!tg || !tg.closest) return;
      if (tg.closest('[data-pt-close]')) { e.preventDefault(); closeTest(); return; }
      var a = tg.closest('[data-pt-a]'); if (a) { ptAnswer(a.getAttribute('data-pt-a') === '1'); return; }
      if (ptBusy) return;
      if (tg.closest('[data-pt-start]')) { ptIdx = 0; ptAns = []; ptShow('q', 1, false, ptRenderQ); }
      else if (tg.closest('[data-pt-nosite]')) { ptAns = []; ptFinish(true); }
      else if (tg.closest('[data-pt-back]')) { if (ptIdx > 0) ptShow('q', -1, false, function () { ptIdx--; ptRenderQ(); }); else ptShow('0', -1); }
      else if (tg.closest('[data-pt-preview]')) ptPreview();
      else if (tg.closest('[data-pt-redo]')) {
        ptRes = null; ptAns = []; ptIdx = 0; ptStore();
        try { sessionStorage.removeItem(PT_KEY); } catch (x) { }
        ptShow('q', -1, false, ptRenderQ);
      }
    });
    d.addEventListener('keydown', function (e) {
      if (!ptOpen || askOpen) return;
      if (e.key === 'Escape') { e.preventDefault(); closeTest(); return; }
      if (e.key === 'Tab') {
        var f = focusables(pt); if (!f.length) return;
        var a = f[0], z = f[f.length - 1];
        if (e.shiftKey && (d.activeElement === a || !pt.contains(d.activeElement))) { e.preventDefault(); z.focus(); }
        else if (!e.shiftKey && (d.activeElement === z || !pt.contains(d.activeElement))) { e.preventDefault(); a.focus(); }
        return;
      }
      if (ptPane() !== 'q' || e.metaKey || e.ctrlKey || e.altKey) return;
      var k = (e.key || '').toLowerCase();
      if (k === 'y' || k === 'j') { e.preventDefault(); ptAnswer(true); }
      else if (k === 'n') { e.preventDefault(); ptAnswer(false); }
    });
    d.addEventListener('lang', function () {
      if (!ptOpen) return;
      var n = ptPane();
      if (n === 'q') ptRenderQ(); else if (n === 'r' && ptRes) ptRenderR(true);
      ptHead(n);
    });
    // QR cards and messages link to dolcessi.com/#test
    W.addEventListener('hashchange', function () { if (/^#test$/i.test(location.hash)) openTest(); });
  }

  /* ───────── mobile menu ───────── */
  var mbtn = $('[data-menu]'), mnav = $('#mnav'), menuOpen = false;
  function setMenu(on) {
    if (!mnav || !mbtn || on === menuOpen) return;
    menuOpen = on;
    mbtn.setAttribute('aria-expanded', on ? 'true' : 'false');
    mbtn.setAttribute('aria-label', on ? t('menuClose') : 'Menu');
    html.classList.toggle('menu-open', on);
    $$('main, .ftr, .dock').forEach(function (el) { if ('inert' in el) el.inert = on; });
    if (on) {
      mnav.hidden = false;
      if (lenis) lenis.stop();
      if (hdr) hdr.classList.remove('is-cream');
      requestAnimationFrame(function () { requestAnimationFrame(function () { if (menuOpen) mnav.classList.add('is-open'); }); });
      setTimeout(function () { var a = $('a', mnav); if (menuOpen && a) a.focus({ preventScroll: true }); }, 90);
    } else {
      mnav.classList.remove('is-open');
      if (lenis && !askOpen && !ptOpen) lenis.start();
      setTimeout(function () { if (!menuOpen) mnav.hidden = true; }, 380);
    }
  }
  if (mbtn && mnav) {
    mbtn.addEventListener('click', function () { setMenu(!menuOpen); });
    mnav.addEventListener('click', function (e) { if (e.target.closest('a[href^="#"]')) setMenu(false); });
    d.addEventListener('keydown', function (e) { if (menuOpen && e.key === 'Escape') { setMenu(false); mbtn.focus(); } });
    W.addEventListener('resize', function () { if (menuOpen && innerWidth > 1180) setMenu(false); });
  }

  /* ───────── boot ───────── */
  function startGlass(intro) {
    var h = glassSecs[0] && glassSecs[0].v;
    if (W.REED) {
      if (h) W.REED.jump({ x: h[0], y: h[1], r: h[2], i: h[3], haze: h[4] });
      W.REED.start(intro);
    }
  }
  function ignite(intro) {
    if (pre && preActive) { pre.classList.add('is-out'); setTimeout(function () { pre.style.display = 'none'; }, 900); }
    requestAnimationFrame(function () { requestAnimationFrame(function () { startGlass(intro); }); });
    revealHero(intro ? 350 : 0);
    observeAll();
  }
  function boot() {
    if (sentOrErr) {
      ignite(false);
      var errEl = !postedOk && $('#ask-form [data-err]');
      if (errEl) {
        restoreForm();
        var msg = (errEl.textContent || '').trim(), m = $('[data-err-msg]');
        m.hidden = false; m.textContent = LANG === 'nl' || !msg ? t('serverErr') : msg;
        if (/mail/i.test(msg)) setErr($('#f-email'), 'errEmail');
        openAsk(LAST);
      } else {
        clearForm(); openAsk(DONE);
        try { if (/contact_posted/.test(location.search)) history.replaceState(null, '', location.pathname + location.search.replace(/[?&]contact_posted=true/, '').replace(/^&/, '?') + location.hash.replace(/^#(ask-form|contact_form)$/, '')); } catch (e) { }
      }
      return;
    }
    if (preActive) setTimeout(function () { ignite(true); }, Math.max(150, 1450 - performance.now()));
    else ignite(!seen && !REDUCE);
    if (/^#test$/i.test(location.hash)) setTimeout(openTest, REDUCE ? 0 : 260);
  }
  boot();
})();
