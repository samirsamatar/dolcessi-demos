/* WOK International · concept 2 for World of Karaoke · Dolcessi. Vanilla JS, no dependencies. */
(function () {
  'use strict';
  var D = document, H = D.documentElement, W = window;
  var $ = function (s, r) { return (r || D).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || D).querySelectorAll(s)); };
  var mq = function (q) { return W.matchMedia ? W.matchMedia(q) : { matches: false, addEventListener: function () {} }; };
  var RM = mq('(prefers-reduced-motion: reduce)');
  var MOTION = !RM.matches;
  var LANG = H.lang === 'nl' ? 'nl' : 'en';
  var ROOT = (function () { var s = $('script[src*="assets/app.js"]'); return s ? s.getAttribute('src').replace(/assets\/app\.js.*$/, '') : ''; })();
  var listeners = [];
  function store(k, v) { try { if (v === undefined) return W.localStorage.getItem(k); W.localStorage.setItem(k, v); } catch (e) { return null; } }

  /* ================================================================ language */
  function swapAttrs() {
    $$('[data-i]').forEach(function (el) {
      var p = 'data-' + LANG + '-';
      for (var i = 0; i < el.attributes.length; i++) {
        var a = el.attributes[i];
        if (a.name.indexOf(p) === 0) el.setAttribute(a.name.slice(p.length), a.value);
      }
    });
  }
  function setLang(l, user) {
    LANG = l === 'nl' ? 'nl' : 'en';
    H.lang = LANG; H.classList.toggle('nl', LANG === 'nl');
    var t = H.getAttribute('data-title-' + LANG); if (t) D.title = t;
    swapAttrs();
    $$('[data-lang]').forEach(function (b) { b.setAttribute('aria-pressed', String(b.getAttribute('data-lang') === LANG)); });
    if (user) store('wok2-lang', LANG);
    listeners.forEach(function (fn) { fn(LANG); });
  }
  D.addEventListener('click', function (e) {
    var b = e.target.closest && e.target.closest('[data-lang]');
    if (b) setLang(b.getAttribute('data-lang'), true);
  });

  /* ================================================================ flap engine (canvas)
     Each strip of cells is one small <canvas> (aria-hidden; the real text lives in buttons/labels).
     A cell shows .up (upper half) and .dn (lower half). One step: the old upper half folds down from the hinge,
     then the new lower half folds in, with a little shading. Only cells that change are redrawn, one rAF loop runs
     while something moves and then stops. No DOM, layout or layer changes per frame. */
  var HALF = 42;
  var RND = 'ABCDEFGHIJKLMNOPRSTUVWXYZ0123456789';
  var CJK = /[\u2e80-\u9fff\uff00-\uffef]/;
  var COL = { '': '#F3F0E6', y: '#FFD100', cy: '#8DF4F2' };
  var TOP = '#25282B', BOT = '#1C1E20', FTOP = '#2F3236', FBOT = '#17181A';
  var CAP = 60, queue = [], running = false, strips = [];
  /* Device pixel ratio is read on every measure (zoom, moving the window to another screen), up to 4x,
     so the flaps stay crisp on 2x and 3x phones. */
  function dpr() { return Math.max(1, Math.min(4, W.devicePixelRatio || 1)); }
  var RO = W.ResizeObserver ? new ResizeObserver(function () { RO_cb(); }) : null;
  if (!RO) W.addEventListener('resize', function () { RO_cb(); });
  /* Canvas text drawn before its webfont has loaded falls back silently, so nothing is drawn with text
     until "Barlow Condensed" is ready (or 2.5 s have passed on a very slow connection); every strip is
     redrawn again when the face arrives. */
  var FACE = '600 20px "Barlow Condensed"';
  var fontOk = !(D.fonts && D.fonts.load), fontQ = [];
  function fontReady(fn) { if (fontOk) fn(); else fontQ.push(fn); }
  function redrawAll() { strips.forEach(function (st) { st.cells.forEach(draw); }); }
  (function () {
    if (fontOk) return;
    function go() { if (fontOk) return; fontOk = true; var q = fontQ; fontQ = []; q.forEach(function (f) { f(); }); }
    try { if (D.fonts.check(FACE)) { go(); return; } } catch (e) {}
    D.fonts.load(FACE, 'WORLD 0123456789:€–').then(function () { go(); redrawAll(); }, go);
    setTimeout(go, 2500);
  })();
  function strip(host, groups) {
    var cv = D.createElement('canvas'), n = 0, gi, i, st = { cv: cv, cells: [], groups: [], ctx: null, ok: false, w: 0, h: 0 };
    groups.forEach(function (k) { n += k; });
    cv.className = 'strip'; cv.setAttribute('aria-hidden', 'true');
    cv.style.width = 'calc(var(--cw) * ' + n + ' + var(--g) * ' + (n - groups.length) + ' + var(--G) * ' + (groups.length - 1) + ')';
    host.appendChild(cv);
    for (gi = 0; gi < groups.length; gi++) {
      var arr = [];
      for (i = 0; i < groups[gi]; i++) { var c = { s: st, gi: gi, x: 0, up: ' ', dn: ' ', cur: ' ', tgt: ' ', col: '', seq: null, on: false, busy: false, at: 0, t0: 0, nx: ' ' }; arr.push(c); st.cells.push(c); }
      st.groups.push(arr);
    }
    st.n = n; strips.push(st); measure(st);
    if (RO) RO.observe(cv);
    return st;
  }
  function measure(st) {
    var cv = st.cv, r = cv.getBoundingClientRect(), w = r.width, h = r.height;
    if (!w || !h) { st.ok = false; return; }
    var cs = getComputedStyle(cv), g = parseFloat(cs.getPropertyValue('--g')) || 2, G = parseFloat(cs.getPropertyValue('--G')) || 12;
    var ng = st.groups.length, cw = (w - (st.n - ng) * g - (ng - 1) * G) / st.n, x = 0;
    st.groups.forEach(function (arr, k) { arr.forEach(function (c) { c.x = x; x += cw + g; }); x += G - g; });
    var k = dpr(), bw = Math.max(1, Math.round(w * k)), bh = Math.max(1, Math.round(h * k));
    if (st.ok && st.bw === bw && st.bh === bh && Math.abs(st.w - w) < .01) return;   // nothing changed
    st.w = w; st.h = h; st.cw = cw; st.fs = cw * 1.2; st.bw = bw; st.bh = bh;
    cv.width = bw; cv.height = bh;   // resizing the bitmap also resets the context state
    st.ctx = cv.getContext('2d'); st.ctx.setTransform(bw / w, 0, 0, bh / h, 0, 0);
    st.ctx.textAlign = 'center'; st.ctx.textBaseline = 'middle';
    st.ok = true;
    st.cells.forEach(draw);
  }
  function half(ctx, st, c, ch, top, s, shade) {
    var x = c.x, w = st.cw, hh = st.h / 2, y = top ? 0 : hh, hy = hh, r = Math.min(2.5, w / 8);
    ctx.save();
    if (s !== 1) { ctx.translate(0, hy); ctx.scale(1, Math.max(s, .001)); ctx.translate(0, -hy); }
    ctx.beginPath();
    if (ctx.roundRect) ctx.roundRect(x, y, w, hh, top ? [r, r, 0, 0] : [0, 0, r, r]); else ctx.rect(x, y, w, hh);
    ctx.fillStyle = s !== 1 ? (top ? FTOP : FBOT) : (top ? TOP : BOT); ctx.fill(); ctx.clip();
    if (ch !== ' ') {
      var k = CJK.test(ch);
      ctx.font = '600 ' + (k ? st.fs * .74 : st.fs).toFixed(1) + 'px ' + (k ? '"PingFang SC","Hiragino Sans GB","Noto Sans CJK SC","Microsoft YaHei",sans-serif' : '"Barlow Condensed","Arial Narrow",sans-serif');
      ctx.fillStyle = COL[c.col] || COL[''];
      ctx.fillText(ch, x + w / 2, hy + st.fs * .04);
    }
    if (shade) { ctx.fillStyle = 'rgba(0,0,0,' + shade.toFixed(2) + ')'; ctx.fillRect(x, y, w, hh); }
    ctx.restore();
  }
  function draw(c) {
    var st = c.s; if (!st.ok) return;
    var ctx = st.ctx, x = c.x, w = st.cw, h = st.h;
    ctx.clearRect(x - .5, 0, w + 1, h);
    half(ctx, st, c, c.up, true, 1, 0);
    half(ctx, st, c, c.dn, false, 1, 0);
    if (c.busy) {
      var p = c.p;
      if (p < 1) { half(ctx, st, c, c.cur, true, 1 - p * p, p * .35); }
      else { var q = p - 1; half(ctx, st, c, c.nx, false, 1 - (1 - q) * (1 - q), (1 - q) * .3); }
    }
    ctx.fillStyle = '#060607'; ctx.fillRect(x, h / 2 - .5, w, 1);
  }
  function setNow(c, ch, col) {
    c.tgt = ch; c.col = col || ''; c.seq = null; c.on = false; c.busy = false;
    c.up = c.dn = c.cur = ch; draw(c);
  }
  function flipTo(c, ch, delay, col, instant) {
    col = col || '';
    if (c.tgt === ch && c.col === col) return;
    if (!MOTION || instant || !c.s.ok) { setNow(c, ch, col); return; }
    c.tgt = ch;
    if (c.cur === ch && !c.on) { c.col = col; draw(c); return; }
    c.ncol = col;
    var seq = [], k = Math.random() < .5 ? 1 : 2;
    if (c.cur === ' ' || ch === ' ') k = 1;
    for (var i = 0; i < k; i++) seq.push(RND.charAt(Math.random() * RND.length | 0));
    seq.push(ch); c.seq = seq;
    if (!c.on) {
      c.on = true; c.at = performance.now() + (delay || 0); queue.push(c);
      if (!running) { running = true; requestAnimationFrame(tick); }
    }
  }
  function tick(t) {
    var keep = [], busy = 0, i, c;
    for (i = 0; i < queue.length; i++) if (queue[i].busy) busy++;
    for (i = 0; i < queue.length; i++) {
      c = queue[i];
      if (!c.on) continue;
      if (c.busy) {
        c.p = (t - c.t0) / HALF;
        if (c.p < 2) { draw(c); keep.push(c); continue; }
        c.dn = c.cur = c.nx; c.busy = false; busy--;
        if (!(c.seq && c.seq.length)) { c.on = false; draw(c); continue; }
        c.at = t;
      }
      if (t < c.at || busy >= CAP) { keep.push(c); continue; }
      c.nx = c.seq.shift();
      if (!c.seq.length) c.col = c.ncol;
      c.up = c.nx; c.busy = true; busy++; c.t0 = t; c.p = 0; draw(c); keep.push(c);
    }
    queue = keep;
    if (queue.length) requestAnimationFrame(tick); else running = false;
  }
  /* Re-measure a strip whenever its own box changes size (resize, rotation, breakpoint, zoom), at most once a
     frame, and when the screen's pixel ratio changes without a resize (window moved to another display). */
  function remeasure() {
    strips = strips.filter(function (st) { if (D.contains(st.cv)) return true; if (RO) RO.unobserve(st.cv); return false; });
    strips.forEach(measure);
  }
  var roF = 0;
  function RO_cb() { if (!roF) roF = requestAnimationFrame(function () { roF = 0; remeasure(); }); }
  (function watchDpr() {
    if (!W.matchMedia) return;
    var m = W.matchMedia('(resolution: ' + (W.devicePixelRatio || 1) + 'dppx)');
    var on = function () { if (m.removeEventListener) m.removeEventListener('change', on); RO_cb(); watchDpr(); };
    if (m.addEventListener) m.addEventListener('change', on);
  })();
  W.addEventListener('orientationchange', RO_cb);
  function chars(s) { return Array.from ? Array.from(s) : s.split(''); }
  function pad(s, n, right) {
    var a = chars(s); if (a.length > n) a = a.slice(0, n);
    while (a.length < n) { if (right) a.unshift(' '); else a.push(' '); }
    return a;
  }
  function cellRow(host, n) { return strip(host, [n]).cells; }
  function write(cells, s, base, step, col, right, instant) {
    var a = pad(s, cells.length, right);
    for (var i = 0; i < cells.length; i++) flipTo(cells[i], a[i], base + i * step, col, instant);
  }

  /* ================================================================ loader (first page of a session) */
  /* The board's first flip waits for this: right away without the loader, ~120 ms before the loader lifts with it. */
  var revealQ = [], revealed = false;
  function whenRevealed(fn) { if (revealed) fn(); else revealQ.push(fn); }
  function reveal() { if (revealed) return; revealed = true; revealQ.forEach(function (f) { f(); }); revealQ = []; }
  (function loader() {
    var L = $('.ldr');
    var on = L && H.classList.contains('ldr-on');
    try { W.sessionStorage.setItem('wok2-seen', '1'); } catch (e) {}
    if (!on) { reveal(); return; }
    var t0 = Date.now();
    function lift() {
      reveal();
      setTimeout(function () {
        L.classList.add('out');
        setTimeout(function () { if (L.parentNode) L.parentNode.removeChild(L); }, 420);
      }, 120);
    }
    /* The two rows flip only if the board face is ready within 260 ms; otherwise the loader is just the mic
       swing and the yellow line (never fallback glyphs). It lifts at 700 ms either way (gone by ~1.2 s). */
    fontReady(function () {
      if (Date.now() - t0 > 260) return;
      $$('.lr', L).forEach(function (row, r) {
        var t = row.getAttribute('data-t');
        write(cellRow(row, chars(t).length), t, 40 + r * 120, 20, r ? 'y' : '', false);
      });
    });
    setTimeout(lift, 700);
  })();

  /* ================================================================ header menu */
  (function menu() {
    var b = $('.menu-b'), d = $('#dir');
    if (!b || !d) return;
    function set(open) { b.setAttribute('aria-expanded', String(open)); d.hidden = !open; }
    b.addEventListener('click', function () { set(d.hidden); });
    D.addEventListener('keydown', function (e) { if (e.key === 'Escape' && !d.hidden) { set(false); b.focus(); } });
    D.addEventListener('click', function (e) { if (!d.hidden && !e.target.closest('.hd')) set(false); });
    mq('(min-width:1100px)').addEventListener('change', function () { set(false); });
  })();

  /* ================================================================ images: fade in, then quiet preload */
  function seen(img) { img.classList.add('in'); }
  $$('.ph img, .ck img').forEach(function (img) {
    if (img.complete && img.naturalWidth) seen(img);
    else { img.addEventListener('load', function () { seen(img); }); img.addEventListener('error', function () { seen(img); }); }
  });
  W.addEventListener('load', function () {
    var ric = W.requestIdleCallback || function (f) { return setTimeout(function () { f({ timeRemaining: function () { return 8; } }); }, 200); };
    var list = $$('img[loading="lazy"]');
    setTimeout(function next() {
      ric(function (dl) {
        var k = 0;
        while (list.length && k < 4 && dl.timeRemaining() > 4) { list.shift().loading = 'eager'; k++; }
        if (list.length) setTimeout(next, 120);
      }, { timeout: 1500 });
    }, 1800);
  });

  /* ================================================================ reveal (sign panels slide in once) */
  (function reveal() {
    var els = $$('.rv');
    if (!els.length) return;
    if (!('IntersectionObserver' in W) || !MOTION) { H.classList.add('no-io'); return; }
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
    }, { rootMargin: '0px 0px -8% 0px' });
    els.forEach(function (el) { io.observe(el); });
  })();

  /* ================================================================ time in Amsterdam */
  var DAYK = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];
  function ams() {
    var o = { wd: DAYK[new Date().getDay()], h: new Date().getHours(), m: new Date().getMinutes() };
    try {
      var p = new Intl.DateTimeFormat('en-GB', { timeZone: 'Europe/Amsterdam', weekday: 'short', hour: '2-digit', minute: '2-digit', hourCycle: 'h23' }).formatToParts(new Date());
      p.forEach(function (x) { if (x.type === 'weekday') o.wd = x.value.slice(0, 3).toLowerCase(); if (x.type === 'hour') o.h = +x.value % 24; if (x.type === 'minute') o.m = +x.value; });
    } catch (e) {}
    return o;
  }
  var OPEN = ['wed', 'thu', 'fri', 'sat', 'sun'];
  var NOW, TONIGHT;
  /* "Tonight" = an open day in Amsterdam between 04:00 and 21:45 (the last first-session start is 17:15, the
     last session of the night starts at 21:45 or later). Between midnight and 04:00 the coming evening is
     today's, so it is the next night, but not called "tonight". */
  function updateNow() {
    NOW = ams();
    TONIGHT = OPEN.indexOf(NOW.wd) > -1 && NOW.h >= 4 && NOW.h * 60 + NOW.m < 21 * 60 + 45 ? NOW.wd : null;
  }
  updateNow();
  function defaultNight() {
    if (TONIGHT) return TONIGHT;
    var i = DAYK.indexOf(NOW.wd);
    for (var k = NOW.h < 4 ? 0 : 1; k <= 7; k++) { var d = DAYK[(i + k) % 7]; if (OPEN.indexOf(d) > -1) return d; }
    return 'wed';
  }

  /* opening-hours tables: mark today */
  function markToday() {
    $$('.hrs tr[data-d]').forEach(function (tr) {
      var on = tr.getAttribute('data-d') === NOW.wd;
      tr.classList.toggle('today', on);
      var th = tr.querySelector('th'); if (th) th.setAttribute('data-today', LANG === 'nl' ? 'vandaag' : 'today');
    });
  }
  markToday(); listeners.push(markToday);

  /* ================================================================ lounge: directory follows the scroll */
  (function loungeDir() {
    var nav = $('.mdir'); if (!nav || !('IntersectionObserver' in W)) return;
    var links = $$('a', nav), ul = $('ul', nav), cur = null;
    function setCur(id) {
      if (id === cur) return; cur = id;
      links.forEach(function (a) {
        var on = a.getAttribute('href') === '#' + id;
        if (on) { a.setAttribute('aria-current', 'true'); if (ul.scrollWidth > ul.clientWidth) ul.scrollTo({ left: a.offsetLeft - 16, behavior: MOTION ? 'smooth' : 'auto' }); }
        else a.removeAttribute('aria-current');
      });
    }
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) setCur(e.target.id); });
    }, { rootMargin: '-30% 0px -60% 0px' });
    $$('.mg').forEach(function (s) { io.observe(s); });
  })();

  /* ================================================================ info desk search */
  (function find() {
    var inp = $('#find'); if (!inp) return;
    var qs = $$('.q'), groups = $$('.qg'), none = $('#nores');
    function norm(s) { return s.toLowerCase().normalize ? s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '') : s.toLowerCase(); }
    var texts = qs.map(function (q) { return norm(q.textContent); });
    inp.addEventListener('input', function () {
      var v = norm(inp.value.trim()), any = false;
      qs.forEach(function (q, i) { var hit = !v || texts[i].indexOf(v) > -1; q.hidden = !hit; if (hit) any = true; });
      groups.forEach(function (g) { g.hidden = !$$('.q', g).some(function (q) { return !q.hidden; }); });
      none.hidden = any;
    });
  })();

  /* ================================================================ departures board */
  var ROOMS = [{"id":"paris","name":"Paris","iata":"PAR","min":2,"max":3,"m2":8,"start":990},{"id":"istanbul","name":"Istanbul","iata":"IST","min":2,"max":3,"m2":9,"start":1005},{"id":"tokyo","name":"Tokyo","iata":"TYO","min":2,"max":6,"m2":10,"start":1005,"ktv":"only","pic":1},{"id":"barcelona","name":"Barcelona","iata":"BCN","min":2,"max":6,"m2":10,"start":1020},{"id":"singapore","name":"Singapore","iata":"SIN","min":4,"max":8,"m2":10,"start":1020,"ktv":"plus"},{"id":"los-angeles","name":"Los Angeles","iata":"LAX","min":4,"max":8,"m2":10,"start":990},{"id":"rio","name":"Rio de Janeiro","short":"Rio","iata":"RIO","min":4,"max":10,"m2":11,"start":1020,"pic":1},{"id":"sydney","name":"Sydney","iata":"SYD","min":4,"max":10,"m2":12,"start":1035,"pic":1},{"id":"hongkong","name":"Hongkong","iata":"HKG","min":4,"max":10,"m2":12,"start":1035,"ktv":"plus"},{"id":"london","name":"London","iata":"LON","min":6,"max":12,"m2":12,"start":1035,"pic":1},{"id":"berlin","name":"Berlin","iata":"BER","min":6,"max":12,"m2":12,"start":1035,"ktv":"only","pic":1},{"id":"dubai","name":"Dubai","iata":"DXB","min":6,"max":12,"m2":12,"start":1005,"pic":1},{"id":"amsterdam","name":"Amsterdam","iata":"AMS","min":12,"max":15,"m2":17,"start":1020,"pic":1},{"id":"new-york","name":"New York","iata":"NYC","min":16,"max":25,"m2":29,"start":990,"ktv":"plus"}];
  var BOARD = $('#board');
  if (BOARD && ROOMS.length) departures();

  function departures() {
    var PRICE = { wed: 19, thu: 19, fri: 23, sat: 23, sun: 19 };
    var BOOK = { en: 'https://worldofkaraoke.nl/en/book-your-experience-2/', nl: 'https://worldofkaraoke.nl/boek-jouw-ervaring/' };
    var T = {
      en: {
        cols: { time: 'Time', dest: 'Destination', pax: 'Passengers', fare: 'Fare p.p.', rem: 'Remarks' }, colsS: 'Fare',
        night: { wed: 'WEDNESDAY', thu: 'THURSDAY', fri: 'FRIDAY', sat: 'SATURDAY', sun: 'SUNDAY' },
        nightL: { wed: 'Wednesday', thu: 'Thursday', fri: 'Friday', sat: 'Saturday', sun: 'Sunday' },
        tonight: 'TONIGHT', tonightS: 'tonight', only: '中文 KTV ONLY', plus: '+ 中文 KTV', late: 'LAST ',
        any: 'Any', anyP: 'any group', paxS: 'passengers', sets: 'sets the board', pp: 'Per person, two hours', forN: function (n) { return n + ' × ' }, total: 'Total, two hours',
        live: function (n, p, nt, tn) { return n + (n === 1 ? ' destination' : ' destinations') + (p ? ' for ' + p + ' passengers' : '') + (tn ? ' tonight.' : ' on ' + nt + '.'); },
        row: function (r, t, f, rem) { return r.name + '. First departure ' + t + '. ' + r.min + ' to ' + r.max + ' people. ' + f + ' per person.' + (rem ? ' ' + rem + '.' : '') + ' Show boarding pass.'; },
        remSr: { only: 'Chinese KTV only', plus: 'Also Chinese KTV', late: 'Last departure ' },
        pass: 'BOARDING PASS', passS: 'Instapkaart', dom: 'domestic', close: 'Close boarding pass', from: 'From', to: 'To', nightK: 'Night', room: 'Room',
        people: 'people', dep: 'Departure · two hours', paxK: 'Passengers', fewer: 'Fewer passengers', more: 'More passengers', cat: 'Catalogue',
        catR: 'Regular: 100,000+ songs', catO: 'Chinese KTV only', catP: 'Regular + Chinese KTV', ktv4: 'Chinese KTV: groups of 4 or more.',
        fare: 'Fare', vat: 'incl. 21% VAT', book: 'Book on worldofkaraoke.nl', newtab: '(opens in a new tab)',
        note: 'This pass is a summary, not a booking. On worldofkaraoke.nl you pick the date, session and number of people and pay in advance.',
        lateN: 'Running late? Call <a href="tel:+31622955004">+31 6 22 95 50 04</a>. Your room is held for up to 15 minutes after the start.',
        tear: 'Tear here', tearL: 'Tear off the stub', see: 'See you at La Guardiaweg 53', again: 'Print again', lateS: 'late', pax: 'PAX',
        h: function (r, n) { return 'Boarding pass: ' + r.name + ', ' + n; }
      },
      nl: {
        cols: { time: 'Tijd', dest: 'Bestemming', pax: 'Personen', fare: 'Prijs p.p.', rem: 'Opmerkingen' }, colsS: 'Prijs',
        night: { wed: 'WOENSDAG', thu: 'DONDERDAG', fri: 'VRIJDAG', sat: 'ZATERDAG', sun: 'ZONDAG' },
        nightL: { wed: 'woensdag', thu: 'donderdag', fri: 'vrijdag', sat: 'zaterdag', sun: 'zondag' },
        tonight: 'VANAVOND', tonightS: 'vanavond', only: 'ALLEEN 中文 KTV', plus: '+ 中文 KTV', late: 'LAATSTE ',
        any: 'Alle', anyP: 'elke groep', paxS: 'passagiers', sets: 'stelt het bord in', pp: 'Per persoon, twee uur', forN: function (n) { return n + ' × ' }, total: 'Totaal, twee uur',
        live: function (n, p, nt, tn) { return n + (n === 1 ? ' bestemming' : ' bestemmingen') + (p ? ' voor ' + p + ' passagiers' : '') + (tn ? ' vanavond.' : ' op ' + nt + '.'); },
        row: function (r, t, f, rem) { return r.name + '. Eerste vertrek ' + t + '. ' + r.min + ' tot ' + r.max + ' personen. ' + f + ' per persoon.' + (rem ? ' ' + rem + '.' : '') + ' Toon instapkaart.'; },
        remSr: { only: 'Alleen Chinese KTV', plus: 'Ook Chinese KTV', late: 'Laatste vertrek ' },
        pass: 'INSTAPKAART', passS: 'Boarding pass', dom: 'binnenland', close: 'Instapkaart sluiten', from: 'Van', to: 'Naar', nightK: 'Avond', room: 'Kamer',
        people: 'personen', dep: 'Vertrek · twee uur', paxK: 'Passagiers', fewer: 'Minder passagiers', more: 'Meer passagiers', cat: 'Catalogus',
        catR: 'Standaard: 100.000+ nummers', catO: 'Alleen Chinese KTV', catP: 'Standaard + Chinese KTV', ktv4: 'Chinese KTV: groepen vanaf 4 personen.',
        fare: 'Prijs', vat: 'incl. 21% btw', book: 'Boek op worldofkaraoke.nl', newtab: '(opent in een nieuw tabblad)',
        note: 'Deze instapkaart is een samenvatting, geen boeking. Op worldofkaraoke.nl kies je de datum, sessie en het aantal personen en betaal je vooraf.',
        lateN: 'Te laat? Bel <a href="tel:+31622955004">+31 6 22 95 50 04</a>. Je kamer blijft tot 15 minuten na de starttijd voor je vrij.',
        tear: 'Hier afscheuren', tearL: 'Scheur de strook af', see: 'Tot straks aan de La Guardiaweg 53', again: 'Opnieuw printen', lateS: 'laat', pax: 'PERS',
        h: function (r, n) { return 'Instapkaart: ' + r.name + ', ' + n; }
      }
    };
    var COLS = {
      phone: [['time', 5], ['dest', 11], ['fare', 3]],
      mid: [['time', 5], ['dest', 14], ['pax', 5], ['fare', 3]],
      full: [['time', 5], ['dest', 14], ['pax', 5], ['fare', 3], ['rem', 13]]
    };
    var MQ_DESK = mq('(min-width:1200px)'), BI = $('.bi', BOARD);
    var byId = {}; ROOMS.forEach(function (r) { byId[r.id] = r; });
    var st = { night: defaultNight(), pax: null, sel: null, ppax: 2, sess: 0, alt: 0 };
    var mode = '', rows = [], nightCells = [], clockCells = [], visible = true, first = true;
    var rowsEl = $('#rows'), colsEl = $('.cols', BOARD), live = $('#bd-live');
    var printer = $('#printer'), pass = $('#pass'), scrim = $('#scrim'), lastFocus = null;
    var t = function () { return T[LANG]; };

    function tm(m) { m = m % 1440; return ('0' + (m / 60 | 0)).slice(-2) + ':' + ('0' + m % 60).slice(-2); }
    function money(v) { var s = v % 1 ? v.toFixed(2) : String(v); return '€' + (LANG === 'nl' ? s.replace('.', ',') : s); }
    function sessions(r, n) {
      var late = (n === 'fri' || n === 'sat') && r.start !== 1035, out = [];
      for (var k = 0; k < (late ? 4 : 3); k++) out.push({ s: r.start + k * 135, late: k === 3 });
      return out;
    }
    function fits(r) { return st.pax == null || (st.pax >= r.min && st.pax <= r.max); }
    function list() {
      return ROOMS.filter(fits).sort(function (a, b) { return a.start - b.start || (a.name < b.name ? -1 : 1); });
    }
    function remarks(r) {
      var out = [];
      if (r.ktv === 'only') out.push({ k: 'only', s: t().only, c: 'cy' });
      if (r.ktv === 'plus') out.push({ k: 'plus', s: t().plus, c: 'cy' });
      var ss = sessions(r, st.night), last = ss[ss.length - 1];
      out.push({ k: 'late', s: t().late + tm(last.s), c: '', at: tm(last.s) });
      return out;
    }
    function getMode() { var n = parseInt(getComputedStyle(BI).getPropertyValue('--n'), 10); return n >= 40 ? 'full' : n >= 27 ? 'mid' : 'phone'; }

    /* ---- build the grid (only on load and when the breakpoint mode changes) */
    function build() {
      mode = getMode();
      var cols = COLS[mode];
      rowsEl.textContent = ''; rows = []; strips = strips.filter(function (st) { return D.contains(st.cv); });
      for (var r = 0; r < 14; r++) {
        var li = D.createElement('li'), b = D.createElement('button');
        b.type = 'button'; b.className = 'row'; b.disabled = true; b.setAttribute('aria-pressed', 'false');
        var row = { li: li, btn: b, room: null, g: {} };
        li.appendChild(b); rowsEl.appendChild(li);
        var sp = strip(b, cols.map(function (c) { return c[1]; }));
        cols.forEach(function (c, k) { row.g[c[0]] = sp.groups[k]; });
        rows.push(row);
        b.addEventListener('click', onRow.bind(null, row));
      }
      labels();
    }
    function labels() {
      colsEl.textContent = '';
      COLS[mode].forEach(function (c) {
        var s = D.createElement('span');
        s.style.width = 'calc(var(--cw) * ' + c[1] + ' + var(--g) * ' + (c[1] - 1) + ')';
        s.textContent = mode === 'phone' && c[0] === 'fare' ? t().colsS : t().cols[c[0]]; colsEl.appendChild(s);
      });
    }

    /* ---- write the board (flips only what changes) */
    function render(base, instant) {
      var L = list(), cols = COLS[mode], price = PRICE[st.night], ROWD = 34, CELLD = mode === 'full' ? 15 : 19;
      for (var r = 0; r < 14; r++) {
        var row = rows[r], room = L[r] || null, d0 = base + r * ROWD, off = 0;
        row.room = room ? room.id : null;
        var rem = room ? remarks(room) : [], ri = rem.length ? rem[st.alt % rem.length] : null;
        cols.forEach(function (c) {
          var k = c[0], cells = row.g[k], s = '', col = '', right = false;
          if (room) {
            if (k === 'time') s = tm(room.start);
            else if (k === 'dest') { s = room.name.toUpperCase(); if (s.length > cells.length && room.short) s = room.short.toUpperCase(); }
            else if (k === 'pax') s = room.min + '–' + room.max;
            else if (k === 'fare') { s = '€' + price; col = 'y'; }
            else if (k === 'rem' && ri) { s = ri.s; col = ri.c; }
          }
          write(cells, s, d0 + off * CELLD, CELLD, col, right, instant || !visible);
          off += cells.length;
        });
        row.btn.disabled = !room;
        row.li.setAttribute('aria-hidden', room ? 'false' : 'true');
        row.btn.setAttribute('aria-pressed', String(!!room && room.id === st.sel));
        if (room) {
          var sr = rem.map(function (x) { return x.k === 'late' ? t().remSr.late + x.at : t().remSr[x.k]; }).join('. ');
          row.btn.setAttribute('aria-label', t().row(room, tm(room.start), money(price), sr));
        } else row.btn.removeAttribute('aria-label');
      }
      header(base, instant);
      live.textContent = t().live(L.length, st.pax, nightName(false), st.night === TONIGHT);
      checkin();
    }
    function nightName(upper) {
      if (st.night === TONIGHT) return upper ? t().tonight : t().tonightS;
      return upper ? t().night[st.night] : t().nightL[st.night];
    }
    function header(base, instant) {
      write(nightCells, nightName(true), base, 24, 'y', false, instant || !visible);
    }
    function remTick() {
      if (!MOTION || !visible || D.hidden) return;
      var any = false;
      rows.forEach(function (row) { if (row.room && remarks(byId[row.room]).length > 1) any = true; });
      if (!any || !rows[0].g.rem) return;
      st.alt++;
      rows.forEach(function (row, r) {
        if (!row.room) return;
        var rem = remarks(byId[row.room]); if (rem.length < 2) return;
        var x = rem[st.alt % rem.length];
        write(row.g.rem, x.s, r * 20, 22, x.c, false, false);
      });
    }
    setInterval(remTick, 4200);

    /* ---- clock (Amsterdam time via Intl, minute ticks). Fixed flap cells, so no layout shift; it only runs
       while the board is on screen and the tab is visible, and catches up (flipping the changed digits) when
       it comes back. "Tonight" is re-evaluated on each tick. */
    var clockT = 0, clockRun = false;
    function clock() {
      clearTimeout(clockT); clockT = 0;
      if (!visible || D.hidden) { clockRun = false; return; }
      clockRun = true;
      var was = TONIGHT, wasDay = NOW.wd;
      updateNow();
      write(clockCells, ('0' + NOW.h).slice(-2) + ':' + ('0' + NOW.m).slice(-2), 0, 40, '', false, first);
      if (was !== TONIGHT || wasDay !== NOW.wd) { if (!first) { header(0); checkin(); } markToday(); }
      clockT = setTimeout(clock, 60250 - Date.now() % 60000);
    }
    function wake() { if (!clockRun && visible && !D.hidden && !first) clock(); }
    D.addEventListener('visibilitychange', function () { if (D.hidden) { clearTimeout(clockT); clockRun = false; } else wake(); });

    /* ---- check-in */
    var paxO = $('#pax-o'), dec = $('#pax-dec'), inc = $('#pax-inc'), tot = $('#ci-tot');
    var heroG = $('.hero-g'), ciEdit = $('#ci-edit'), ciSum = $('#ci-sum');
    ciEdit.addEventListener('click', function () {
      var open = !heroG.classList.contains('ci-open');
      heroG.classList.toggle('ci-open', open); ciEdit.setAttribute('aria-expanded', String(open));
    });
    function checkin() {
      var printing = heroG.classList.contains('printing');
      ciSum.textContent = printing ? cap(nightName(false)) + ' · ' + (st.pax == null ? t().anyP : st.pax + ' ' + t().paxS) : t().sets;
      paxO.textContent = st.pax == null ? t().any : String(st.pax);
      dec.disabled = st.pax == null; inc.disabled = st.pax === 25;
      $$('#cal .d[data-n]').forEach(function (b) {
        var n = b.getAttribute('data-n');
        b.setAttribute('aria-pressed', String(n === st.night));
        var m = $('.tn2', b); if (m) m.textContent = n === TONIGHT ? t().tonightS : '';
      });
      var p = PRICE[st.night];
      if (st.pax == null) tot.innerHTML = '<span>' + t().pp + '</span><b>' + money(p) + '</b>';
      else tot.innerHTML = '<span>' + t().total + ' · ' + st.pax + ' × ' + money(p) + '</span><b>' + money(p * st.pax) + '</b>';
    }
    dec.addEventListener('click', function () { st.pax = st.pax == null ? null : st.pax <= 2 ? null : st.pax - 1; changed(); });
    inc.addEventListener('click', function () { st.pax = st.pax == null ? 2 : Math.min(25, st.pax + 1); changed(); });
    $$('#cal .d[data-n]').forEach(function (b) {
      b.addEventListener('click', function () { st.night = b.getAttribute('data-n'); changed(); });
    });
    function changed() {
      if (st.sel && !fits(byId[st.sel])) closePass(true);
      render(0);
      if (st.sel) { if (st.pax != null) st.ppax = st.pax; fixSess(); renderPass(false); }
    }

    /* ---- boarding pass */
    function fixSess() { var n = sessions(byId[st.sel], st.night).length; if (st.sess >= n) st.sess = 0; }
    function bars(seed) {
      var h = 7, x = 0, out = '';
      for (var i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) | 0;
      while (x < 130) { h = (h * 1103515245 + 12345) & 0x7fffffff; var w = 1 + (h >> 16) % 3; if ((h >> 9) & 1 || w === 3) out += '<rect x="' + x + '" width="' + w + '" height="40"/>'; x += w + 1; }
      return '<svg class="bc" viewBox="0 0 ' + x + ' 40" preserveAspectRatio="none" aria-hidden="true" fill="currentColor">' + out + '</svg>';
    }
    function pic(n) { return '<svg class="pi" aria-hidden="true" focusable="false"><use href="#p-' + n + '"/></svg>'; }
    function renderPass(feed) {
      var r = byId[st.sel]; if (!r) return;
      var tt = t(), ss = sessions(r, st.night), p = PRICE[st.night], s0 = ss[st.sess];
      var cat = r.ktv === 'only' ? tt.catO : r.ktv === 'plus' ? tt.catP : tt.catR;
      var chips = ss.map(function (s, i) {
        return '<button type="button" data-s="' + i + '" aria-pressed="' + (i === st.sess) + '">' + tm(s.s) + (s.late ? '<small>' + tt.lateS + '</small>' : '<small>– ' + tm(s.s + 120) + '</small>') + '</button>';
      }).join('');
      pass.innerHTML =
        '<div class="ps-h"><img src="' + ROOT + 'img/logo.svg" alt="World of Karaoke" width="2000" height="833"><div class="tt"><b>' + tt.pass + '</b><small>' + tt.passS + '</small></div>' +
        '<button type="button" class="ps-x" data-a="close">' + pic('close') + '<span class="sr">' + tt.close + '</span></button></div>' +
        '<div class="ps-b"><h2 class="sr" id="ps-t" tabindex="-1">' + tt.h(r, nightName(false)) + '</h2>' +
        '<div class="route"><div><span class="k">' + tt.from + '</span><span class="code">AMS</span><span class="nm">La Guardiaweg 53</span></div>' +
        '<div class="via">' + pic('dep') + (r.iata === 'AMS' ? '<small>' + tt.dom + '</small>' : '') + '</div>' +
        '<div class="to"><span class="k">' + tt.to + '</span><span class="code">' + r.iata + '</span><span class="nm">' + r.name + '</span></div></div>' +
        '<div class="fields">' +
        '<div><span class="k">' + tt.nightK + '</span><span class="v">' + cap(nightName(false)) + '</span></div>' +
        '<div><span class="k">' + tt.room + '</span><span class="v">' + r.m2 + ' m² <small>· ' + r.min + '–' + r.max + ' ' + tt.people + '</small></span></div>' +
        '<div class="wide"><span class="k" id="ps-sl">' + tt.dep + '</span><div class="sess" role="group" aria-labelledby="ps-sl">' + chips + '</div></div>' +
        '<div><span class="k" id="ps-pl">' + tt.paxK + '</span><div class="pst"><button type="button" data-a="pm"' + (st.ppax <= r.min ? ' disabled' : '') + '>' + pic('minus') + '<span class="sr">' + tt.fewer + '</span></button><output aria-labelledby="ps-pl" aria-live="polite">' + st.ppax + '</output><button type="button" data-a="pp"' + (st.ppax >= r.max ? ' disabled' : '') + '>' + pic('plus') + '<span class="sr">' + tt.more + '</span></button></div></div>' +
        '<div><span class="k">' + tt.cat + '</span><span class="v">' + cat + (r.ktv ? '<small class="zhs" lang="zh-Hans">中文 KTV</small>' : '') + '</span></div>' +
        '</div>' +
        '<div class="fare-b"><div><span class="k">' + tt.fare + '</span><span class="pp2">' + st.ppax + ' × ' + money(p) + '</span></div><div class="tot"><b>' + money(p * st.ppax) + '</b><small>' + tt.vat + '</small></div></div>' +
        '<a class="btn" href="' + BOOK[LANG] + '" target="_blank" rel="noopener">' + tt.book + pic('ext') + '<span class="sr">' + tt.newtab + '</span></a>' +
        (r.ktv ? '<p class="ps-n">' + tt.ktv4 + '</p>' : '') +
        '<p class="ps-n">' + tt.note + '</p><p class="ps-n">' + tt.lateN + '</p></div>' +
        '<div class="perf" aria-hidden="true"><i></i></div>' +
        '<div class="stub-w"><button type="button" class="stub" data-a="tear"><span class="sc"><b>' + r.iata + '</b>' + nightName(true).slice(0, 3) + ' · ' + tm(s0.s) + ' · ' + st.ppax + ' ' + tt.pax + '</span>' + bars(r.id + st.night + st.sess + st.ppax) + '<span class="tear" aria-hidden="true">' + tt.tear + '</span><span class="sr">' + tt.tearL + '</span></button>' +
        '<p class="seeyou" aria-live="polite"></p><button type="button" class="redo" data-a="redo">' + tt.again + '</button></div>';
      if (feed && MOTION && MQ_DESK.matches) { pass.classList.remove('feedin'); void pass.offsetWidth; pass.classList.add('feedin'); }
    }
    function cap(s) { return s.charAt(0).toUpperCase() + s.slice(1); }

    function onRow(row) { if (row.room) openPass(row.room, row.btn); }
    function openPass(id, from) {
      var r = byId[id]; if (!r) return;
      var same = st.sel === id && printer.classList.contains('has');
      st.sel = id; st.sess = 0;
      st.ppax = Math.max(r.min, Math.min(r.max, st.pax == null ? r.min : st.pax));
      lastFocus = from || null;
      rows.forEach(function (row) { row.btn.setAttribute('aria-pressed', String(row.room === id)); });
      renderPass(!same);
      printer.classList.add('has'); heroG.classList.add('printing'); checkin();
      if (!MQ_DESK.matches) {
        printer.classList.add('open'); scrim.classList.add('on');
        printer.setAttribute('role', 'dialog'); printer.setAttribute('aria-modal', 'true');
        printer.scrollTop = 0;
      } else {
        var rc = printer.getBoundingClientRect();
        if (rc.top < 60 || rc.top > innerHeight * .6) {
          var y = scrollY + BOARD.getBoundingClientRect().top - 90;
          W.scrollTo({ top: y, behavior: MOTION ? 'smooth' : 'auto' });
        }
      }
      var h = $('#ps-t'); if (h) h.focus({ preventScroll: true });
    }
    function closePass(silent) {
      st.sel = null;
      printer.classList.remove('has', 'open'); scrim.classList.remove('on');
      heroG.classList.remove('printing', 'ci-open'); ciEdit.setAttribute('aria-expanded', 'false'); checkin();
      printer.removeAttribute('role'); printer.removeAttribute('aria-modal');
      rows.forEach(function (row) { row.btn.setAttribute('aria-pressed', 'false'); });
      if (!silent && lastFocus && D.contains(lastFocus)) lastFocus.focus({ preventScroll: !MQ_DESK.matches ? true : false });
    }
    pass.addEventListener('click', function (e) {
      var b = e.target.closest('button'); if (!b) return;
      var a = b.getAttribute('data-a'), r = byId[st.sel];
      if (b.hasAttribute('data-s')) { st.sess = +b.getAttribute('data-s'); renderPass(false); var c = $('.sess [data-s="' + st.sess + '"]', pass); if (c) c.focus(); return; }
      if (a === 'close') return closePass();
      if (a === 'pm' || a === 'pp') {
        st.ppax = Math.max(r.min, Math.min(r.max, st.ppax + (a === 'pp' ? 1 : -1)));
        renderPass(false); var nb = $('[data-a="' + a + '"]', pass); if (nb && !nb.disabled) nb.focus(); else { var o = $('.pst output', pass); if (o) o.parentNode.querySelector('button:not([disabled])').focus(); }
        return;
      }
      if (a === 'tear') {
        var w = b.parentNode; b.classList.add('torn'); w.classList.add('torn');
        $('.seeyou', w).innerHTML = pic('pin') + '<span>' + t().see + '</span>';
        setTimeout(function () { var rd = $('.redo', w); if (rd) rd.focus({ preventScroll: true }); }, MOTION ? 650 : 0);
        return;
      }
      if (a === 'redo') { renderPass(true); var s = $('.stub', pass); if (s) s.focus({ preventScroll: true }); }
    });
    scrim.addEventListener('click', function () { closePass(); });
    D.addEventListener('keydown', function (e) {
      if (!printer.classList.contains('open')) return;
      if (e.key === 'Escape') { e.preventDefault(); closePass(); return; }
      if (e.key === 'Tab') {
        var f = $$('button:not([disabled]), a[href], [tabindex="-1"]', pass).filter(function (x) { return x.offsetParent !== null || x.id === 'ps-t'; });
        if (!f.length) return;
        var a0 = f[0], z = f[f.length - 1];
        if (e.shiftKey && (D.activeElement === a0 || !pass.contains(D.activeElement))) { e.preventDefault(); z.focus(); }
        else if (!e.shiftKey && (D.activeElement === z || !pass.contains(D.activeElement))) { e.preventDefault(); a0.focus(); }
      }
    });
    MQ_DESK.addEventListener('change', function () {
      if (!st.sel) return;
      if (MQ_DESK.matches) { printer.classList.remove('open'); scrim.classList.remove('on'); printer.removeAttribute('role'); printer.removeAttribute('aria-modal'); }
      else closePass(true);
    });
    $$('[data-room]').forEach(function (b) { b.addEventListener('click', function () { openPass(b.getAttribute('data-room'), b); }); });

    /* ---- visibility: animate only when the board is on screen */
    if ('IntersectionObserver' in W) {
      new IntersectionObserver(function (es) {
        visible = es[es.length - 1].isIntersecting;
        if (visible) wake(); else { clearTimeout(clockT); clockRun = false; }
      }).observe(BOARD);
    }
    function relayout() { if (getMode() !== mode) { build(); if (!first) render(0, true); } }
    if (W.ResizeObserver) new ResizeObserver(relayout).observe(BOARD); else W.addEventListener('resize', relayout);

    /* ---- go: the grid is built now (empty flaps), text is first drawn once the board face is ready */
    nightCells = cellRow($('.bh .night', BOARD), 9);
    clockCells = cellRow($('.bh .clk', BOARD), 5);
    build();
    checkin();
    whenRevealed(function () {
      fontReady(function () {
        clock(); first = false;
        render(0);
      });
    });
    listeners.push(function () { labels(); if (!first) render(0); if (st.sel) renderPass(false); });
  }

  if (LANG === 'nl') swapAttrs();
  $$('[data-lang]').forEach(function (b) { b.setAttribute('aria-pressed', String(b.getAttribute('data-lang') === LANG)); });
  H.classList.remove('no-js');
})();
