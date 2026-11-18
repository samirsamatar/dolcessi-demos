/* Café CHA CHA, concept 2 · Dolcessi. No libraries. Every loop pauses when it is off screen. */
(function () {
  'use strict';
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var MO = document.documentElement.classList.contains('mo');
  var CC = window.CC || {};
  var wait = function (ms) { return new Promise(function (r) { setTimeout(r, ms); }); };

  /* when is a section on screen */
  function watch(el, cb) {
    if (!el) return;
    if (!('IntersectionObserver' in window)) { cb(true); return; }
    new IntersectionObserver(function (es) { es.forEach(function (x) { cb(x.isIntersecting); }); }, { threshold: 0.15 }).observe(el);
  }

  /* ---------- open now (Europe/Amsterdam) ---------- */
  var OPEN = { 0: [11, 22], 1: [11, 22], 2: [11, 22], 3: [11, 22], 4: [11, 25], 5: [11, 25], 6: [11, 25] };
  var KARAOKE = { 0: 1, 3: 1, 4: 1, 5: 1, 6: 1 };
  var DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  function ams() {
    var p = {};
    try {
      new Intl.DateTimeFormat('en-GB', { timeZone: 'Europe/Amsterdam', weekday: 'short', hour: '2-digit', minute: '2-digit', hour12: false })
        .formatToParts(new Date()).forEach(function (x) { p[x.type] = x.value; });
      return { d: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].indexOf(p.weekday), m: (+p.hour % 24) * 60 + +p.minute };
    } catch (e) { var n = new Date(); return { d: n.getDay(), m: n.getHours() * 60 + n.getMinutes() }; }
  }
  function hh(h) { return (h % 24 < 10 ? '0' : '') + (h % 24) + ':00'; }
  function status() {
    var n = ams(), o = OPEN[n.d], y = OPEN[(n.d + 6) % 7];
    if (y[1] > 24 && n.m < (y[1] - 24) * 60) return { open: true, t: 'Open until ' + hh(y[1]), d: n.d, m: n.m, late: true };
    if (n.m >= o[0] * 60 && n.m < o[1] * 60) return { open: true, t: 'Open now until ' + hh(o[1]), d: n.d, m: n.m };
    if (n.m < o[0] * 60) return { open: false, t: 'Opens today at ' + hh(o[0]), d: n.d, m: n.m };
    return { open: false, t: 'Opens tomorrow at ' + hh(OPEN[(n.d + 1) % 7][0]), d: n.d, m: n.m };
  }
  function paintStatus() {
    var s = status(), el = $('[data-status]');
    if (el) { el.classList.toggle('open', s.open); $('[data-status-text]', el).textContent = s.t; }
    $$('.hours tr').forEach(function (tr) { tr.classList.toggle('today', +tr.getAttribute('data-d') === s.d); });
    var k = $('[data-kar-live]');
    if (k) {
      var night = s.late ? (s.d + 6) % 7 : s.d, live = KARAOKE[night] && s.open && (s.late || s.m >= 21 * 60), txt;
      if (live) txt = 'Karaoke is on right now';
      else if (KARAOKE[s.d] && s.m < 21 * 60) txt = 'Karaoke tonight from 21:00';
      else { var i = 1; while (!KARAOKE[(s.d + i) % 7]) i++; txt = 'Next karaoke: ' + (i === 1 ? 'tomorrow' : DAYS[(s.d + i) % 7]) + ' from 21:00'; }
      k.textContent = txt; k.classList.toggle('live', !!live);
    }
  }
  paintStatus(); setInterval(paintStatus, 60000);

  /* ---------- hero: now playing ---------- */
  (function () {
    var root = $('[data-player]'), deck = $('.deck'), T = CC.tracks;
    if (!root || !T) return;
    var plates = $$('.plate', deck), hero = $('.hero');
    var fill = $('[data-np-fill]'), cur = $('[data-np-cur]'), len = $('[data-np-len]');
    var title = $('[data-np-title]'), side = $('[data-np-side]'), desc = $('[data-np-desc]');
    var heart = $('[data-heart]'), playBtn = $('[data-play]'), qBtn = $('[data-queue]'), q = $('#queue');
    var DUR = 5200, i = 0, order = T.map(function (_, k) { return k; }), pos = 0, playing = MO, visible = true, t0 = 0, elapsed = 0, raf = 0, busy = false;
    var saved = {}; try { saved = JSON.parse(localStorage.getItem('cc2_saved') || '{}'); } catch (e) {}
    function secs(str) { var a = str.split(':'); return +a[0] * 60 + +a[1]; }
    function fmt(s) { s = Math.floor(s); return Math.floor(s / 60) + ':' + ('0' + (s % 60)).slice(-2); }
    function paintText(k) {
      var t = T[k];
      title.textContent = t.n; side.textContent = t.side; desc.textContent = t.d || ''; len.textContent = t.len;
      heart.setAttribute('aria-pressed', saved[t.pic] ? 'true' : 'false');
      $$('li', q).forEach(function (li, n) { li.classList.toggle('cur', n === k); });
    }
    function show(k, dir) {
      if (k === i || busy) return;
      busy = true;
      var a = plates[i], b = plates[k];
      a.classList.remove('is-on'); a.classList.toggle('to-right', dir < 0); a.classList.add('is-out');
      b.classList.remove('is-out', 'to-right'); b.classList.toggle('from-left', dir < 0);
      void b.offsetWidth;
      b.classList.remove('from-left'); b.classList.add('is-on');
      root.classList.add('swap');
      setTimeout(function () { paintText(k); root.classList.remove('swap'); }, 280);
      setTimeout(function () { a.classList.remove('is-out', 'to-right'); busy = false; }, 900);
      i = k; elapsed = 0; t0 = performance.now(); draw(0);
    }
    function step(d) { pos = (pos + d + order.length) % order.length; show(order[pos], d); }
    var last = '';
    function draw(p) {
      fill.style.transform = 'scaleX(' + p + ')';
      var s = fmt(secs(T[i].len) * p); if (s !== last) { cur.textContent = s; last = s; }
    }
    function tick(now) {
      raf = 0;
      if (!playing || !visible) return;
      var p = Math.min(1, (elapsed + now - t0) / DUR);
      draw(p);
      if (p >= 1) { var nb = $('[data-next]'); nb.classList.add('press'); setTimeout(function () { nb.classList.remove('press'); }, 160); step(1); }
      raf = requestAnimationFrame(tick);
    }
    function run() { if (playing && visible && !raf) { t0 = performance.now(); raf = requestAnimationFrame(tick); } }
    function halt() { if (raf) { cancelAnimationFrame(raf); raf = 0; } elapsed += performance.now() - t0; }
    function setPlay(v) {
      if (v === playing) return;
      if (!v) halt();
      playing = v;
      root.classList.toggle('paused', !v); root.classList.toggle('playing', v);
      playBtn.setAttribute('aria-label', v ? 'Pause' : 'Play');
      if (v) run();
    }
    root.classList.toggle('paused', !playing); root.classList.toggle('playing', playing);
    playBtn.setAttribute('aria-label', playing ? 'Pause' : 'Play');
    playBtn.addEventListener('click', function () { setPlay(!playing); });
    $('[data-next]').addEventListener('click', function () { step(1); });
    $('[data-prev]').addEventListener('click', function () { step(-1); });
    $('[data-shuffle]').addEventListener('click', function () {
      var on = this.getAttribute('aria-pressed') !== 'true';
      this.setAttribute('aria-pressed', on);
      order = T.map(function (_, k) { return k; });
      if (on) for (var n = order.length - 1; n > 0; n--) { var r = Math.floor(Math.random() * (n + 1)), x = order[n]; order[n] = order[r]; order[r] = x; }
      pos = order.indexOf(i);
    });
    heart.addEventListener('click', function () {
      var p = T[i].pic; saved[p] = !saved[p];
      heart.setAttribute('aria-pressed', saved[p] ? 'true' : 'false');
      try { localStorage.setItem('cc2_saved', JSON.stringify(saved)); } catch (e) {}
    });
    function toggleQ(open) {
      q.hidden = !open; qBtn.setAttribute('aria-expanded', open);
    }
    qBtn.addEventListener('click', function () { toggleQ(q.hidden); });
    $$('[data-go]', q).forEach(function (b) {
      b.addEventListener('click', function () { var k = +b.getAttribute('data-go'); pos = order.indexOf(k); show(k, k > i ? 1 : -1); toggleQ(false); });
    });
    document.addEventListener('keydown', function (ev) { if (ev.key === 'Escape' && !q.hidden) { toggleQ(false); qBtn.focus(); } });
    document.addEventListener('click', function (ev) { if (!q.hidden && !q.contains(ev.target) && !qBtn.contains(ev.target)) toggleQ(false); });
    /* swipe the plate on touch */
    var sx = null;
    deck.addEventListener('touchstart', function (ev) { sx = ev.touches[0].clientX; }, { passive: true });
    deck.addEventListener('touchend', function (ev) { if (sx === null) return; var dx = ev.changedTouches[0].clientX - sx; if (Math.abs(dx) > 40) step(dx < 0 ? 1 : -1); sx = null; });
    paintText(0); draw(0);
    watch(hero, function (v) { visible = v; if (v) run(); else if (raf) halt(); });
    /* warm the next plates once the first is in */
    setTimeout(function () { plates.forEach(function (f) { var im = $('img', f); if (im.decode) im.decode().catch(function () {}); }); }, 1200);
  })();

  /* ---------- the pass: tickets and plates ---------- */
  (function () {
    var stage = $('[data-pass]'), K = CC.tickets;
    if (!stage || !K) return;
    var ticket = $('[data-ticket]'), slots = $$('.slot', stage), visible = false, running = false, n = 0;
    function fill(t) {
      var rows = t.items.map(function (it, k) { return '<li data-row="' + k + '"><span class="q">1</span><span class="n">' + it.n + '</span><span class="pr">' + it.p + '</span></li>'; }).join('');
      var tot = t.items.reduce(function (s, it) { return s + parseFloat(it.p.replace(',', '.')); }, 0).toFixed(2).replace('.', ',');
      $('.tk-meta', ticket).innerHTML = '<span>TABLE ' + ('0' + t.table).slice(-2) + '</span><span>COVERS ' + t.guests + '</span><span>' + t.t + '</span>';
      $('.tk-rows', ticket).innerHTML = rows;
      $('.tk-tot span:last-child', ticket).textContent = tot;
      slots.forEach(function (s, k) { var im = $('img', s); im.src = 'img/td-' + t.items[k].pic + '.webp'; im.alt = t.items[k].n; });
    }
    function until() { return new Promise(function (r) { (function chk() { if (visible) r(); else setTimeout(chk, 400); })(); }); }
    async function loop() {
      running = true;
      while (true) {
        var t = K[n % K.length];
        if (n > 0) fill(t);
        ticket.classList.remove('up', 'out', 'on'); ticket.classList.add('print');
        slots.forEach(function (s) { s.classList.remove('in', 'gone'); });
        await until(); await wait(120);
        ticket.classList.add('on'); ticket.classList.remove('print');
        await wait(1000);
        for (var k = 0; k < slots.length; k++) {
          await until();
          slots[k].classList.add('in');
          await wait(650);
          var row = $('[data-row="' + k + '"]', ticket); if (row) row.classList.add('done');
          await wait(700);
        }
        ticket.classList.add('up');
        await wait(1800);
        await until();
        for (var j = 0; j < slots.length; j++) { slots[j].classList.add('gone'); await wait(120); }
        await wait(500);
        ticket.classList.remove('on'); ticket.classList.add('out');
        await wait(800);
        n++;
      }
    }
    if (!MO) {
      slots.forEach(function (s) { s.classList.add('in'); });
      $$('.tk-rows li', ticket).forEach(function (li) { li.classList.add('done'); });
      ticket.classList.add('up');
      return;
    }
    watch(stage, function (v) { visible = v; if (v && !running) loop(); });
  })();

  /* ---------- DR(glass)NK ---------- */
  (function () {
    var fr = $('[data-drink]'), D = CC.drinks;
    if (!fr || !D) return;
    var imgs = $$('.dr-img', fr), dots = $$('[data-dr]'), nm = $('[data-dr-name]'), pr = $('[data-dr-price]');
    var i = 0, timer = 0, visible = false;
    function show(k) {
      if (k === i) return;
      imgs[i].classList.remove('is-on'); imgs[k].classList.add('is-on');
      fr.style.setProperty('--gx', D[k].gx); fr.style.setProperty('--gw', D[k].gw);
      nm.textContent = D[k].n; pr.textContent = D[k].p;
      dots.forEach(function (d, n) { d.classList.toggle('on', n === k); });
      i = k;
    }
    function sched() { clearTimeout(timer); if (MO && visible) timer = setTimeout(function () { show((i + 1) % D.length); sched(); }, 3800); }
    dots.forEach(function (d) { d.addEventListener('click', function () { show(+d.getAttribute('data-dr')); sched(); }); });
    watch(fr, function (v) { visible = v; if (v) sched(); else clearTimeout(timer); });
  })();

  /* ---------- karaoke: lyrics light up ---------- */
  (function () {
    var box = $('[data-kar]');
    if (!box) return;
    var lines = $$('.lyrics li', box), fill = $('[data-kar-fill]'), visible = false, running = false;
    if (!MO) { lines.forEach(function (l) { l.classList.add('past'); }); return; }
    async function loop() {
      running = true;
      while (true) {
        lines.forEach(function (l) { l.classList.remove('sing', 'past'); });
        for (var k = 0; k < lines.length; k++) {
          while (!visible) await wait(400);
          var d = Math.max(1.6, lines[k].textContent.length * 0.075);
          lines[k].style.setProperty('--d', d + 's');
          lines[k].classList.add('sing');
          fill.style.transition = 'transform ' + d + 's linear';
          fill.style.transform = 'scaleX(' + ((k + 1) / lines.length) + ')';
          await wait(d * 1000 + 250);
          lines[k].classList.remove('sing'); lines[k].classList.add('past');
        }
        await wait(1600);
        fill.style.transition = 'transform .6s ease'; fill.style.transform = 'scaleX(0)';
        await wait(700);
      }
    }
    watch(box, function (v) { visible = v; if (v && !running) loop(); });
  })();

  /* ---------- menu: the plate follows the cursor ---------- */
  (function () {
    var fp = $('.float-pic');
    if (!fp || !matchMedia('(hover: hover)').matches) return;
    var im = $('img', fp), x = 0, y = 0, on = false, raf = 0;
    function place() { raf = 0; fp.style.transform = 'translate3d(' + (x + 24) + 'px,' + (y - fp.offsetHeight / 2) + 'px,0)'; }
    $$('.menu-page .dish[data-pic]').forEach(function (li) {
      li.addEventListener('mouseenter', function () { im.src = 'img/p-' + li.getAttribute('data-pic') + '.webp'; fp.classList.add('on'); on = true; });
      li.addEventListener('mouseleave', function () { fp.classList.remove('on'); on = false; });
    });
    document.addEventListener('mousemove', function (ev) { x = Math.min(ev.clientX, innerWidth - fp.offsetWidth - 40); y = ev.clientY; if (on && !raf) raf = requestAnimationFrame(place); }, { passive: true });
  })();

  /* ---------- menu tabs follow the scroll ---------- */
  (function () {
    var tabs = $$('.tabs a');
    if (!tabs.length || !('IntersectionObserver' in window)) return;
    var map = {};
    tabs.forEach(function (a) { var id = a.getAttribute('href').slice(1); var el = document.getElementById(id); if (el) map[id] = a; });
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (x) { if (x.isIntersecting) { tabs.forEach(function (a) { a.classList.remove('on'); }); var a = map[x.target.id]; if (a) { a.classList.add('on'); var pr = a.parentNode; pr.scrollTo({ left: a.offsetLeft - pr.clientWidth / 2 + a.clientWidth / 2, behavior: 'smooth' }); } } });
    }, { rootMargin: '-40% 0px -55% 0px' });
    Object.keys(map).forEach(function (id) { io.observe(document.getElementById(id)); });
  })();
})();
