/* World of Karaoke, concept 3 "Now Singing" · Dolcessi. Vanilla JS, no dependencies. */
(function () {
  'use strict';
  var d = document, h = d.documentElement;
  var $ = function (s, r) { return (r || d).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || d).querySelectorAll(s)); };
  var ROOMS = [{"id":"paris","name":"Paris","min":2,"max":3,"m2":8,"start":990,"ktv":null,"pic":false,"wall":null},{"id":"istanbul","name":"Istanbul","min":2,"max":3,"m2":9,"start":1005,"ktv":null,"pic":false,"wall":null},{"id":"tokyo","name":"Tokyo","min":2,"max":6,"m2":10,"start":1005,"ktv":"only","pic":true,"wall":{"en":"Tokyo Tower after dark and a round Karaoke Night neon","nl":"de Tokyo Tower bij nacht en een ronde neon met Karaoke Night"}},{"id":"barcelona","name":"Barcelona","min":2,"max":6,"m2":10,"start":1020,"ktv":null,"pic":false,"wall":null},{"id":"singapore","name":"Singapore","min":4,"max":8,"m2":10,"start":1020,"ktv":"plus","pic":false,"wall":null},{"id":"los-angeles","name":"Los Angeles","min":4,"max":8,"m2":10,"start":990,"ktv":null,"pic":false,"wall":null},{"id":"rio","name":"Rio de Janeiro","min":4,"max":10,"m2":11,"start":1020,"ktv":null,"pic":true,"wall":{"en":"the bay at night, a parrot in neon colours and a mirror ball overhead","nl":"de baai bij nacht, een papegaai in neonkleuren en een spiegelbol erboven"}},{"id":"sydney","name":"Sydney","min":4,"max":10,"m2":12,"start":1035,"ktv":null,"pic":true,"wall":{"en":"the Harbour Bridge at sunset","nl":"de Harbour Bridge bij zonsondergang"}},{"id":"hongkong","name":"Hongkong","min":4,"max":10,"m2":12,"start":1035,"ktv":"plus","pic":false,"wall":null},{"id":"london","name":"London","min":6,"max":12,"m2":12,"start":1035,"ktv":null,"pic":true,"wall":{"en":"the city's name in tall letters","nl":"de naam van de stad in grote letters"}},{"id":"berlin","name":"Berlin","min":6,"max":12,"m2":12,"start":1035,"ktv":"only","pic":true,"wall":{"en":"BERLIJN, spelled the Dutch way","nl":"BERLIJN, op z'n Nederlands gespeld"}},{"id":"dubai","name":"Dubai","min":6,"max":12,"m2":12,"start":1005,"ktv":null,"pic":true,"wall":{"en":"the Dubai skyline and a Karaoke Night neon","nl":"de skyline van Dubai en een neon met Karaoke Night"}},{"id":"amsterdam","name":"Amsterdam","min":12,"max":15,"m2":17,"start":1020,"ktv":null,"pic":true,"wall":{"en":"AMSTERDAM in tall letters","nl":"AMSTERDAM in grote letters"}},{"id":"new-york","name":"New York","min":16,"max":25,"m2":29,"start":990,"ktv":"plus","pic":false,"wall":null}];
  var ROOM = {}; ROOMS.forEach(function (r, i) { r.no = i + 1; ROOM[r.id] = r; });
  var LANG = h.lang === 'nl' ? 'nl' : 'en';
  var RM = h.classList.contains('rm'), NOSDA = h.classList.contains('nosda');
  var PAGE = h.getAttribute('data-page');
  var BOOK = { en: 'https://worldofkaraoke.nl/en/book-your-experience-2/', nl: 'https://worldofkaraoke.nl/boek-jouw-ervaring/' };
  var MENU_EXT = { en: 'https://worldofkaraoke.nl/en/our-menu/', nl: 'https://worldofkaraoke.nl/menu/' };
  var PRICE = { wed: 19, thu: 19, fri: 23, sat: 23, sun: 19 };
  var DAYS = ['wed', 'thu', 'fri', 'sat', 'sun'];
  var WD = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];
  var OPEN = { 0: [960, 1440], 3: [960, 1440], 4: [960, 1440], 5: [960, 1560], 6: [960, 1560] }; // minutes; 1560 = 02:00 next day
  var MINP = 2, MAXP = 25;
  var EXT = '<svg class="ic ic-ext" viewBox="0 0 24 24" width="18" height="18" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M8 16 16 8M9.5 8H16v6.5"/></svg>';
  var XIC = '<svg class="ic" viewBox="0 0 24 24" width="16" height="16" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M7 7l10 10M17 7 7 17"/></svg>';

  var DAYN = {
    en: { mon: 'Monday', tue: 'Tuesday', wed: 'Wednesday', thu: 'Thursday', fri: 'Friday', sat: 'Saturday', sun: 'Sunday' },
    nl: { mon: 'maandag', tue: 'dinsdag', wed: 'woensdag', thu: 'donderdag', fri: 'vrijdag', sat: 'zaterdag', sun: 'zondag' }
  };
  var S = {
    en: {
      people: 'people', fits: function (n) { return 'Fits ' + n; }, from: function (n) { return 'From ' + n + ' people'; }, upto: function (n) { return 'Up to ' + n + ' people'; },
      count: function (k, n, ktv) { return '<b>' + k + '</b> of ' + (ktv ? (ktv + ' rooms with <span lang="zh-Hans">中文</span> KTV') : '14 rooms') + ' fit ' + n + ' people'; },
      pick: 'Pick a room from the list', pickSub: function (n, day) { return 'Then you see its session times for ' + day + '. The price per person is the same for every room.'; },
      sessOn: function (day) { return 'Sessions on ' + day; }, late: 'late',
      pp: 'Per person', ppl: 'People', total: 'Total', vat: 'Two hours, incl. 21% VAT, paid online in advance.',
      book: function (n) { return n ? 'Book ' + n : 'Book on worldofkaraoke.nl'; },
      fine: 'Opens worldofkaraoke.nl in a new tab. There you choose the exact session and how many you are, and pay. This concept can’t see availability.',
      onwall: 'On the wall:', photo: 'Photo of this room', noPhoto: 'No photo of this room yet',
      ktvOnly: 'Chinese KTV only: choose Chinese KTV when you book.', ktvPlus: 'Regular karaoke and <span lang="zh-Hans">中文</span> KTV.',
      ktv4: 'Chinese KTV is available for groups of 4 or more.', ktvRow: 'Chinese KTV: from 4',
      said: function (tot, n, day) { return tot + ' in total for ' + n + ' people on ' + day + '.'; },
      notfit: function (r) { return r.name + ' is for ' + r.min + '–' + r.max + ' people. Change the number above or pick another room.'; },
      upnext: function (r) { return r.name + ' is up next.'; },
      alt: function (r) { return 'Inside the ' + r.name + ' room' + (r.wall ? ': ' + r.wall.en : ''); },
      round: 'Round', roomFor: function (n, day) { return n + ' people · ' + day; },
      emptyRound: 'Nothing yet. Tap + next to a drink to add it.', remove: 'Remove',
      score: 'score', ktvMin: 'Chinese KTV is for groups of 4 or more.',
      openNow: function (t) { return 'Open now, until ' + t; }, opensToday: 'Opens today at 16:00', opensTom: 'Closed now · opens tomorrow at 16:00',
      opensOn: function (day) { return 'Closed today · opens ' + day + ' at 16:00'; },
      nowSinging: ''
    },
    nl: {
      people: 'personen', fits: function (n) { return 'Past voor ' + n; }, from: function (n) { return 'Vanaf ' + n + ' personen'; }, upto: function (n) { return 'Max. ' + n + ' personen'; },
      count: function (k, n, ktv) { return '<b>' + k + '</b> van de ' + (ktv ? (ktv + ' kamers met <span lang="zh-Hans">中文</span> KTV') : '14 kamers') + ' passen bij ' + n + ' personen'; },
      pick: 'Kies een kamer uit de lijst', pickSub: function (n, day) { return 'Dan zie je de sessietijden op ' + day + '. De prijs per persoon is in elke kamer gelijk.'; },
      sessOn: function (day) { return 'Sessies op ' + day; }, late: 'laat',
      pp: 'Per persoon', ppl: 'Personen', total: 'Totaal', vat: 'Twee uur, incl. 21% btw, vooraf online betaald.',
      book: function (n) { return n ? 'Boek ' + n : 'Boek op worldofkaraoke.nl'; },
      fine: 'Opent worldofkaraoke.nl in een nieuw tabblad. Daar kies je de precieze sessie en met hoeveel je bent, en betaal je. Dit concept ziet geen beschikbaarheid.',
      onwall: 'Op de muur:', photo: 'Foto van deze kamer', noPhoto: 'Nog geen foto van deze kamer',
      ktvOnly: 'Alleen Chinese KTV: kies Chinese KTV als je boekt.', ktvPlus: 'Gewone karaoke en <span lang="zh-Hans">中文</span> KTV.',
      ktv4: 'Chinese KTV is er voor groepen vanaf 4 personen.', ktvRow: 'Chinese KTV: vanaf 4',
      said: function (tot, n, day) { return 'Totaal ' + tot + ' voor ' + n + ' personen op ' + day + '.'; },
      notfit: function (r) { return r.name + ' is voor ' + r.min + '–' + r.max + ' personen. Pas het aantal hierboven aan of kies een andere kamer.'; },
      upnext: function (r) { return r.name + ' staat klaar als volgende.'; },
      alt: function (r) { return 'In de kamer ' + r.name + (r.wall ? ': ' + r.wall.nl : ''); },
      round: 'Rondje', roomFor: function (n, day) { return n + ' personen · ' + day; },
      emptyRound: 'Nog niks. Tik op + naast een drankje om het toe te voegen.', remove: 'Verwijder',
      score: 'punten', ktvMin: 'Chinese KTV is voor groepen vanaf 4 personen.',
      openNow: function (t) { return 'Nu open, tot ' + t; }, opensToday: 'Vandaag open vanaf 16:00', opensTom: 'Nu gesloten · morgen open vanaf 16:00',
      opensOn: function (day) { return 'Vandaag gesloten · ' + day + ' open vanaf 16:00'; }
    }
  };
  var L = function () { return S[LANG]; };
  var esc = function (s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); };
  var pad2 = function (n) { return (n < 10 ? '0' : '') + n; };
  var tfmt = function (m) { m %= 1440; return pad2(Math.floor(m / 60)) + ':' + pad2(m % 60); };
  var eur = function (v, dec) {
    var s = dec || v % 1 ? v.toFixed(2) : String(v);
    return '€' + (LANG === 'nl' ? s.replace('.', ',') : s);
  };
  function store(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} }
  function load(k) { try { return JSON.parse(localStorage.getItem(k) || 'null'); } catch (e) { return null; } }

  /* ------------------------------------------------------------ Amsterdam clock */
  function ams() {
    var o = { wd: new Date().getDay(), m: new Date().getHours() * 60 + new Date().getMinutes() };
    try {
      var p = new Intl.DateTimeFormat('en-GB', { timeZone: 'Europe/Amsterdam', weekday: 'short', hour: '2-digit', minute: '2-digit', hourCycle: 'h23' }).formatToParts(new Date());
      var g = {}; p.forEach(function (x) { g[x.type] = x.value; });
      o.wd = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].indexOf(g.weekday);
      o.m = (+g.hour % 24) * 60 + (+g.minute);
    } catch (e) {}
    return o;
  }
  function status() {
    var t = ams(), wd = t.wd, m = t.m, y = (wd + 6) % 7;
    if (OPEN[y] && OPEN[y][1] > 1440 && m < OPEN[y][1] - 1440) return { open: true, until: tfmt(OPEN[y][1]) };
    if (OPEN[wd] && m >= OPEN[wd][0] && m < OPEN[wd][1]) return { open: true, until: tfmt(OPEN[wd][1]) };
    for (var k = 0; k < 8; k++) { var dd = (wd + k) % 7; if (OPEN[dd] && (k > 0 || m < OPEN[dd][0])) return { open: false, k: k, day: WD[dd] }; }
    return { open: false, k: 1, day: 'wed' };
  }
  function defaultNight() {
    var t = ams();
    for (var k = 0; k < 8; k++) {
      var dd = (t.wd + k) % 7;
      if (OPEN[dd] && (k > 0 || t.m < OPEN[dd][1] - 135)) return WD[dd];
    }
    return 'wed';
  }
  function updHours() {
    var t = ams(), s = status(), today = WD[t.wd];
    $$('.hrs li').forEach(function (li) { li.classList.toggle('today', li.getAttribute('data-day') === today); });
    var txt = s.open ? L().openNow(s.until) : s.k === 0 ? L().opensToday : s.k === 1 ? L().opensTom : L().opensOn(DAYN[LANG][s.day]);
    $$('[data-open]').forEach(function (p) { p.textContent = txt; p.classList.toggle('is-open', !!s.open); });
  }

  /* ------------------------------------------------------------ state (shared between pages) */
  var st = { ppl: 4, night: defaultNight(), room: null, sess: 0, ktv: false };
  var saved = load('wok3_s');
  if (saved) { if (saved.ppl >= MINP && saved.ppl <= MAXP) st.ppl = saved.ppl; if (PRICE[saved.night]) st.night = saved.night; }
  function persist() { store('wok3_s', { ppl: st.ppl, night: st.night }); }

  /* ------------------------------------------------------------ lyric lines (signature 1) */
  var kfStyle = d.createElement('style'); d.head.appendChild(kfStyle);
  var hop = 0;
  function hopKF(name, fr) {
    var k = ['0%{opacity:0;transform:translateY(0)}', '1.5%{opacity:1}', '95%{opacity:1}', '100%{opacity:0}'];
    var pts = fr.concat([1]);
    for (var j = 0; j < pts.length; j++) {
      k.push((pts[j] * 100).toFixed(2) + '%{transform:translateY(0);animation-timing-function:cubic-bezier(.33,.75,.6,1)}');
      if (j < pts.length - 1) k.push(((pts[j] + pts[j + 1]) * 50).toFixed(2) + '%{transform:translateY(-.17em);animation-timing-function:cubic-bezier(.45,0,.7,.3)}');
    }
    return '@keyframes ' + name + '{' + k.join('') + '}';
  }
  function split(el, rules) {
    if (!el._src) el._src = $$('.seg', el).map(function (s) { return s.textContent.trim().replace(/\s+/g, ' '); });
    el.classList.remove('is-split', 'zz');
    el.innerHTML = el._src.map(function (seg) {
      return '<span class="seg">' + seg.split(' ').map(function (w) { return '<span class="w">' + esc(w) + '</span>'; }).join(' ') + '</span>';
    }).join('');
    var lines = [];
    $$('.seg', el).forEach(function (seg) {
      var cur = null, top = 0;
      $$('.w', seg).forEach(function (w) {
        var t = w.offsetTop, l = w.offsetLeft, r = l + w.offsetWidth;
        if (!cur || Math.abs(t - top) > 4) { cur = { w: [], x: [], l: l, r: r }; lines.push(cur); top = t; }
        cur.w.push(w.textContent); cur.x.push(l); cur.r = r;
      });
    });
    var em = parseFloat(getComputedStyle(el).fontSize) || 32, pad = 0.12 * em, n = lines.length, html = '';
    lines.forEach(function (ln, i) {
      var W = (ln.r - ln.l) + 2 * pad, name = 'hop' + (hop++);
      rules.push(hopKF(name, ln.x.map(function (x) { return (x - ln.l + pad) / W; })));
      var t = esc(ln.w.join(' '));
      html += '<span class="ln" style="--i:' + i + ';--n:' + n + ';--hop:' + name + '"><span class="ln-b">' + t + ' </span>' +
        '<span class="ln-s" aria-hidden="true"><span>' + t + '</span></span><span class="ln-ball" aria-hidden="true"><i></i></span></span>';
    });
    el.innerHTML = html;
    el.classList.add('is-split');
    if (n === 2 || n === 3) el.classList.add('zz');
  }
  var lastW = 0;
  function splitAll() {
    var rules = []; hop = 0;
    $$('.ly').forEach(function (el) { if (el.getClientRects().length) split(el, rules); });
    kfStyle.textContent = rules.join('');
    lastW = innerWidth;
    if (NOSDA) $$('.lyw').forEach(updLy);
  }
  // fallback for browsers without scroll-driven animations: --p per visible heading, one rAF per scroll
  var vis = [], raf = 0;
  function updLy(w) {
    if (w.classList.contains('hero-ly')) return;
    var r = w.getBoundingClientRect(), vh = innerHeight;
    if (w._a == null) { w._a = parseFloat(w.style.getPropertyValue('--a')) || 12; w._b = parseFloat(w.style.getPropertyValue('--b')) || 46; }
    var y = vh - r.top, a = w._a / 100 * vh, b = w._b / 100 * vh;
    w.style.setProperty('--p', Math.min(1, Math.max(0, (y - a) / b)).toFixed(3));
    w.style.setProperty('--q', Math.min(1, Math.max(0, y / a)).toFixed(3));
  }
  function tick() { if (!raf) raf = requestAnimationFrame(function () { raf = 0; vis.forEach(updLy); }); }
  if (NOSDA && !RM && 'IntersectionObserver' in window) {
    var lio = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        var i = vis.indexOf(e.target);
        if (e.isIntersecting) { if (i < 0) vis.push(e.target); } else { if (i >= 0) vis.splice(i, 1); updLy(e.target); }
      });
      tick();
    }, { rootMargin: '15% 0px' });
    $$('.lyw:not(.hero-ly)').forEach(function (w) { lio.observe(w); });
    addEventListener('scroll', tick, { passive: true });
  }
  var rT = 0;
  addEventListener('resize', function () {
    clearTimeout(rT);
    rT = setTimeout(function () { if (innerWidth !== lastW) { splitAll(); placeUN(); } else if (NOSDA) tick(); }, 160);
  });

  /* ------------------------------------------------------------ title card loader (signature 2) */
  if (h.classList.contains('tc')) {
    var ov = $('.tco');
    var end = function () { h.classList.add('tc-end'); };
    var skip = function () { h.classList.add('tc-skip'); };
    if (ov) {
      ov.addEventListener('animationend', function (e) { if (e.target === ov) end(); });
      ov.addEventListener('pointerdown', skip);
    }
    d.addEventListener('keydown', skip, { once: true });
    setTimeout(end, 1700);
  }

  /* ------------------------------------------------------------ NOW SINGING (header) */
  var nowEl = $('[data-now]'), nowSec = null;
  function updNow() { if (nowEl && nowSec) nowEl.textContent = nowSec.getAttribute('data-now-' + LANG) || ''; }
  if (nowEl && 'IntersectionObserver' in window) {
    var nio = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { nowSec = e.target; updNow(); } });
    }, { rootMargin: '-40% 0px -55% 0px' });
    $$('[data-now-en]').forEach(function (s) { nio.observe(s); });
  }

  /* ------------------------------------------------------------ keypads (people + night) */
  var kpListeners = [];
  function renderKP() {
    $$('[data-kp]').forEach(function (kp) {
      $$('[data-ppl]', kp).forEach(function (b) { if (b.textContent !== String(st.ppl)) { b.textContent = st.ppl; roll(b); } });
      var bs = $$('[data-step]', kp);
      bs[0].disabled = st.ppl <= MINP; bs[1].disabled = st.ppl >= MAXP;
      $$('[data-night]', kp).forEach(function (b) { b.setAttribute('aria-pressed', String(b.getAttribute('data-night') === st.night)); });
    });
  }
  d.addEventListener('click', function (e) {
    var b = e.target.closest('[data-step]');
    if (b && b.closest('[data-kp]')) {
      st.ppl = Math.max(MINP, Math.min(MAXP, st.ppl + (+b.getAttribute('data-step'))));
      persist(); renderKP(); kpListeners.forEach(function (f) { f(); }); return;
    }
    var n = e.target.closest('[data-night]');
    if (n) { st.night = n.getAttribute('data-night'); st.sess = Math.min(st.sess, 2); persist(); renderKP(); kpListeners.forEach(function (f) { f(); }); }
  });
  function roll(el) {
    if (RM || !el) return;
    el.classList.remove('tick'); void el.offsetWidth; el.classList.add('tick');
  }

  /* ------------------------------------------------------------ song list + UP NEXT (home) */
  var finder = $('[data-finder]');
  var un = $('[data-upnext]'), side = $('[data-side]'), songs = $('[data-songs]');
  var say = d.createElement('p'); say.className = 'vh'; say.setAttribute('aria-live', 'polite'); d.body.appendChild(say);
  var mqD = matchMedia('(min-width: 1100px)');
  var unLi = d.createElement('li'); unLi.className = 'un-li';
  function sessions(r, day) {
    var late = (day === 'fri' || day === 'sat') && r.start !== 1035, out = [];
    for (var k = 0; k < (late ? 4 : 3); k++) { var s = r.start + k * 135; out.push({ t: tfmt(s) + '–' + tfmt(s + 120), s: s, late: k === 3 }); }
    return out;
  }
  function fits(r) { return st.ppl >= r.min && st.ppl <= r.max; }
  function renderList() {
    if (!finder) return;
    var k = 0, nk = 0;
    $$('.song', songs).forEach(function (li) {
      var r = ROOM[li.getAttribute('data-room')], ok = fits(r), hide = st.ktv && !r.ktv;
      li.classList.toggle('off', !ok); li.classList.toggle('hide', hide);
      if (!hide) { nk++; if (ok) k++; }
      var stEl = $('[data-st]', li);
      stEl.innerHTML = (ok ? '<span class="ok">' + L().fits(st.ppl) + '</span>' : '<span class="no">' + (st.ppl < r.min ? L().from(r.min) : L().upto(r.max)) + '</span>') +
        (ok && r.ktv === 'only' && st.ppl < 4 ? '<span class="no st-ktv">' + L().ktvRow + '</span>' : '');
      $('[data-times]', li).textContent = sessions(r, st.night).map(function (s) { return s.t.split('–')[0]; }).join(' · ');
      $('.song-b', li).setAttribute('aria-pressed', String(st.room === r.id));
    });
    $('[data-count]').innerHTML = L().count(k, st.ppl, st.ktv ? nk : 0) + (st.ktv && st.ppl < 4 ? ' · ' + L().ktvMin : '');
    var kb = $('[data-ktv-filter]'); if (kb) kb.setAttribute('aria-pressed', String(st.ktv));
  }
  var mediaFor = null;
  function renderUN() {
    if (!un) return;
    var r = st.room && ROOM[st.room], day = DAYN[LANG][st.night], price = PRICE[st.night], tot = price * st.ppl;
    var strip = '<p class="un-strip"><span>UP NEXT</span><span>' + (r ? '♪ ' + pad2(r.no) + ' · ' + esc(r.name) : day.charAt(0).toUpperCase() + day.slice(1)) + '</span></p>';
    var priceDl = '<dl class="un-price"><div><dt>' + L().pp + '</dt><dd>' + eur(price) + '</dd></div><div><dt>' + L().ppl + '</dt><dd>' + st.ppl +
      '</dd></div><div class="tot"><dt>' + L().total + '</dt><dd class="roll" data-tot>' + eur(tot) + '</dd></div></dl><p class="un-vat">' + L().vat + '</p>';
    var book = '<a class="key key-pink" href="' + BOOK[LANG] + '" target="_blank" rel="noopener" data-book><span>' + esc(L().book(r && r.name)) + '</span>' + EXT + '</a>';
    if (!r) {
      mediaFor = null;
      un.innerHTML = strip + '<div class="un-empty"><p class="un-big">' + L().pick + '</p><p class="un-meta">' + L().pickSub(st.ppl, day) + '</p>' + priceDl + book + '</div>';
      return;
    }
    var keep = mediaFor === r.id + LANG ? $('.un-media', un) : null;
    var media = keep ? '<div data-keep></div>' : r.pic
      ? '<div class="un-media"><img src="img/room-' + r.id + '-800.webp" srcset="img/room-' + r.id + '-800.webp 800w, img/room-' + r.id + '-1400.webp 1400w" sizes="(min-width: 1100px) 410px, 94vw" width="800" height="550" decoding="async" alt="' + esc(L().alt(r)) + '"><span class="un-cap">' + L().photo + '</span><p class="un-city" aria-hidden="true">' + esc(r.name) + '</p></div>'
      : '<div class="un-media no-pic"><p class="un-city" aria-hidden="true">' + esc(r.name) + '</p></div>';
    mediaFor = r.id + LANG;
    var ss = sessions(r, st.night); if (st.sess >= ss.length) st.sess = 0;
    var chips = ss.map(function (s, k) {
      return '<button type="button" data-sess="' + k + '" aria-pressed="' + (st.sess === k) + '">' + s.t + (s.late ? '<span class="late">' + L().late + '</span>' : '') + '</button>';
    }).join('');
    var ktv = r.ktv === 'only' ? '<p class="un-wall">' + L().ktvOnly + '</p>' : r.ktv === 'plus' ? '<p class="un-wall">' + L().ktvPlus + '</p>' : '';
    var body = '<div class="un-body">' +
      '<p class="un-meta"><b>' + r.min + '–' + r.max + '</b> ' + L().people + ' · <b>' + r.m2 + ' m²</b></p>' +
      (r.wall ? '<p class="un-wall">' + L().onwall + ' ' + esc(r.wall[LANG]) + '.</p>' : '') + ktv +
      (r.ktv && st.ppl < 4 && fits(r) ? '<p class="un-warn">' + L().ktv4 + '</p>' : '') +
      (!fits(r) ? '<p class="un-warn">' + esc(L().notfit(r)) + '</p>' : '') +
      '<div><p class="un-l">' + L().sessOn(day) + '</p><div class="un-chips" role="group" aria-label="' + esc(L().sessOn(day)) + '">' + chips + '</div></div>' +
      priceDl + book + '<p class="un-fine">' + L().fine + '</p></div>';
    un.innerHTML = strip + media + body;
    if (keep) un.replaceChild(keep, $('[data-keep]', un));
  }
  function placeUN() {
    if (!un) return;
    if (mqD.matches) { if (un.parentNode !== side) side.appendChild(un); if (unLi.parentNode) unLi.parentNode.removeChild(unLi); return; }
    var sel = st.room && $('.song[data-room="' + st.room + '"]', songs);
    var after = sel && !sel.classList.contains('hide') ? sel : null;
    if (after) after.parentNode.insertBefore(unLi, after.nextSibling); else songs.appendChild(unLi);
    if (un.parentNode !== unLi) unLi.appendChild(un);
  }
  function renderFinder() { renderList(); renderUN(); placeUN(); }
  if (finder) {
    songs.addEventListener('click', function (e) {
      var b = e.target.closest('.song-b'); if (!b) return;
      var id = b.closest('.song').getAttribute('data-room');
      st.room = st.room === id ? null : id; st.sess = 0;
      renderFinder();
      if (st.room) say.textContent = L().upnext(ROOM[id]);
    });
    un.addEventListener('click', function (e) {
      var b = e.target.closest('[data-sess]'); if (!b) return;
      st.sess = +b.getAttribute('data-sess');
      $$('[data-sess]', un).forEach(function (x) { x.setAttribute('aria-pressed', String(x === b)); });
    });
    $('[data-ktv-filter]').addEventListener('click', function () { st.ktv = !st.ktv; renderFinder(); });
    var showK = $('[data-show-ktv]');
    if (showK) showK.addEventListener('click', function () {
      st.ktv = true; if (st.ppl < 4) st.ppl = 4; if (st.room && !ROOM[st.room].ktv) st.room = null;
      persist(); renderKP(); renderFinder();
      $('#rooms').scrollIntoView({ behavior: RM ? 'auto' : 'smooth', block: 'start' });
    });
    kpListeners.push(function () {
      renderList(); renderUN(); var t = $('[data-tot]', un); roll(t);
      say.textContent = L().said(eur(PRICE[st.night] * st.ppl), st.ppl, DAYN[LANG][st.night]);
    });
    (mqD.addEventListener ? mqD.addEventListener('change', placeUN) : mqD.addListener(placeUN));
  }

  /* ------------------------------------------------------------ round planner (menu) */
  var plan = $('[data-plan]');
  var round = {};
  function vById(id) { return $('.v[data-id="' + id + '"]'); }
  function updRow(id) {
    var v = vById(id); if (!v) return;
    var q = round[id] || 0, out = $('.sq', v), m = $('.sb-m', v);
    m.hidden = !q; out.hidden = !q; if (out.textContent !== String(q)) { out.textContent = q; roll(out); }
    $('.stp', v).classList.toggle('has', !!q);
  }
  function setQ(id, q) {
    q = Math.max(0, Math.min(30, q));
    var isNew = q && !round[id];
    if (q) round[id] = q; else delete round[id];
    store('wok3_round', round); updRow(id); renderPlan(true);
    var it = $('[data-items]', plan); if (isNew && it.scrollHeight > it.clientHeight) { it.scrollTop = it.scrollHeight; moreHint(); }
  }
  // the drinks list scrolls on its own on desktop: fade its bottom edge while there is more below
  function moreHint() { var it = $('[data-items]', plan); if (!it) return; it.classList.toggle('more', it.scrollTop + it.clientHeight < it.scrollHeight - 2); it.classList.toggle('less', it.scrollTop > 2); }
  function setNum(el, txt, anim) { if (!el) return; if (el.textContent !== txt) { el.textContent = txt; if (anim) roll(el); } }
  function renderPlan(anim) {
    if (!plan) return;
    var sum = 0, cnt = 0, rows = '';
    Object.keys(round).forEach(function (id) {
      var v = vById(id); if (!v) { delete round[id]; return; }
      var p = +v.getAttribute('data-p'), q = round[id], nm = v.getAttribute('data-' + LANG);
      sum += p * q; cnt += q;
      rows += '<div class="pi"><span class="pi-q">' + q + '×</span><span class="pi-n">' + esc(nm) + '</span><span class="pi-p">' + eur(p * q, true) +
        '</span><button type="button" class="pi-x" data-rm="' + id + '"><span class="vh">' + L().remove + ' ' + esc(nm) + '</span>' + XIC + '</button></div>';
    });
    $('[data-items]', plan).innerHTML = rows || '<p class="plan-empty">' + L().emptyRound + '</p>';
    moreHint();
    var room = PRICE[st.night] * st.ppl, tot = room + sum;
    setNum($('[data-round]', plan), eur(sum, true), anim);
    $('[data-room-l]', plan).textContent = L().roomFor(st.ppl, DAYN[LANG][st.night]) + ' · ' + eur(PRICE[st.night]) + ' × ' + st.ppl;
    setNum($('[data-room]', plan), eur(room, true), anim);
    setNum($('[data-total]', plan), eur(tot, true), anim);
    setNum($('[data-pp]', plan), eur(Math.round(tot / st.ppl * 100) / 100, true), anim);
    setNum($('[data-cart-n]'), String(cnt), anim);
    setNum($('[data-cart-p]'), eur(sum, true), anim);
  }
  if (plan) {
    round = load('wok3_round') || {};
    Object.keys(round).forEach(updRow);
    d.addEventListener('click', function (e) {
      var b = e.target.closest('.sb');
      if (b) {
        var id = b.closest('.v').getAttribute('data-id'), dlt = +b.getAttribute('data-d');
        setQ(id, (round[id] || 0) + dlt);
        if (dlt > 0 && !RM) { b.classList.remove('beep'); void b.offsetWidth; b.classList.add('beep'); }
        if (dlt < 0 && !round[id]) { var p = $('.sb-p', vById(id)); if (p) p.focus(); }
        return;
      }
      var a = e.target.closest('[data-add]');
      if (a) { var id2 = a.getAttribute('data-add'); setQ(id2, (round[id2] || 0) + 1); roll($('[data-cart-n]')); return; }
      var x = e.target.closest('[data-rm]');
      if (x) { setQ(x.getAttribute('data-rm'), 0); return; }
      if (e.target.closest('[data-clear]')) { Object.keys(round).forEach(function (id) { delete round[id]; updRow(id); }); store('wok3_round', round); renderPlan(true); }
    });
    kpListeners.push(function () { renderPlan(true); });
    $('[data-items]', plan).addEventListener('scroll', moreHint, { passive: true });
    addEventListener('resize', moreHint);
    // tabs follow the list (scrollspy) and keep the active tab in view
    var tabs = $('[data-tabs]'), cur = null;
    if (tabs && 'IntersectionObserver' in window) {
      var tio = new IntersectionObserver(function (es) {
        es.forEach(function (e) {
          if (!e.isIntersecting) return;
          var k = e.target.getAttribute('data-cat'); if (k === cur) return; cur = k;
          $$('.tab', tabs).forEach(function (t) { t.classList.toggle('on', t.getAttribute('data-tab') === k); if (t.getAttribute('data-tab') === k) t.setAttribute('aria-current', 'true'); else t.removeAttribute('aria-current'); });
          var on = $('.tab.on', tabs);
          if (on) tabs.scrollTo({ left: on.offsetLeft - 12, behavior: RM ? 'auto' : 'smooth' });
        });
      }, { rootMargin: '-30% 0px -65% 0px' });
      $$('.cat-s').forEach(function (s) { tio.observe(s); });
      var endT = function () { tabs.classList.toggle('end', tabs.scrollLeft + tabs.clientWidth >= tabs.scrollWidth - 4); };
      tabs.addEventListener('scroll', endT, { passive: true }); endT();
    }
  }

  /* ------------------------------------------------------------ in-page links scroll smoothly (only those) */
  d.addEventListener('click', function (e) {
    var a = e.target.closest('a[href^="#"]'); if (!a || e.defaultPrevented) return;
    var id = a.getAttribute('href').slice(1), t = id && d.getElementById(id); if (!t) return;
    e.preventDefault();
    t.scrollIntoView({ behavior: RM ? 'auto' : 'smooth', block: 'start' });
    if (history.replaceState) history.replaceState(null, '', '#' + id);
    if (id === 'main') { t.setAttribute('tabindex', '-1'); t.focus({ preventScroll: true }); }
  });

  /* ------------------------------------------------------------ Book: a little "100" score */
  d.addEventListener('click', function (e) {
    var a = e.target.closest('[data-book]'); if (!a || RM) return;
    var r = a.getBoundingClientRect(), p = d.createElement('span');
    p.className = 'pop'; p.setAttribute('aria-hidden', 'true');
    p.innerHTML = '100<small>' + L().score + '</small>';
    p.style.setProperty('--x', Math.round(Math.min(innerWidth - 70, Math.max(10, (e.clientX || r.left + r.width / 2) - 28))) + 'px');
    p.style.setProperty('--y', Math.round(r.top - 20) + 'px');
    d.body.appendChild(p);
    setTimeout(function () { p.remove(); }, 800);
  });

  /* ------------------------------------------------------------ language */
  var titleEn = d.title, descEl = $('meta[name="description"]'), descEn = descEl ? descEl.content : '';
  function setLang(l, initial) {
    LANG = l; h.lang = l;
    $$('[data-set-lang]').forEach(function (b) { b.setAttribute('aria-pressed', String(b.getAttribute('data-set-lang') === l)); });
    $$('[data-book]').forEach(function (a) { a.href = BOOK[l]; });
    $$('[data-menu-ext]').forEach(function (a) { a.href = MENU_EXT[l]; });
    $$('[data-alt-nl]').forEach(function (im) { if (im._en == null) im._en = im.alt; im.alt = l === 'nl' ? im.getAttribute('data-alt-nl') : im._en; });
    d.title = l === 'nl' ? (h.getAttribute('data-title-nl') || titleEn).replace(/&amp;/g, '&') : titleEn;
    if (descEl) descEl.content = l === 'nl' ? (h.getAttribute('data-desc-nl') || descEn) : descEn;
    if (!initial) { splitAll(); mediaFor = null; }
    updHours(); updNow(); renderKP();
    if (finder) renderFinder();
    if (plan) renderPlan(false);
  }
  $$('[data-set-lang]').forEach(function (b) {
    b.addEventListener('click', function () { var l = b.getAttribute('data-set-lang'); if (l !== LANG) { try { localStorage.setItem('wok3_lang', l); } catch (e) {} setLang(l); } });
  });

  /* ------------------------------------------------------------ images: fade in, then a quiet preload */
  function ok(im) { im.classList.add('ok'); }
  $$('img.lz').forEach(function (im) {
    if (im.complete && im.naturalWidth) ok(im);
    else { im.addEventListener('load', function () { ok(im); }); im.addEventListener('error', function () { ok(im); }); }
  });
  addEventListener('load', function () {
    var idle = window.requestIdleCallback || function (f) { return setTimeout(f, 300); };
    setTimeout(function () {
      var q = $$('img[loading="lazy"]').filter(function (im) { return !im.complete; });
      if (finder) ROOMS.forEach(function (r) { if (r.pic) q.push('img/room-' + r.id + '-800.webp'); });
      (function next() {
        var it = q.shift(); if (!it) return;
        idle(function () {
          if (typeof it === 'string') { var im = new Image(); im.onload = im.onerror = next; im.src = it; }
          else { it.loading = 'eager'; if (it.complete) next(); else { it.addEventListener('load', next, { once: true }); it.addEventListener('error', next, { once: true }); } }
        }, { timeout: 2000 });
      })();
    }, 1800);
  });

  /* ------------------------------------------------------------ go */
  setLang(LANG, true);
  var fontsDone = false;
  function firstSplit() { if (fontsDone) return; fontsDone = true; splitAll(); }
  if (d.fonts && d.fonts.ready) { d.fonts.ready.then(firstSplit); setTimeout(firstSplit, 1200); } else firstSplit();
})();
