/* World of Karaoke concept v5 · Dolcessi */
(function () {
  'use strict';
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var root = document.documentElement;
  var MOTION = root.classList.contains('pre');
  var PAGE = document.body.getAttribute('data-page');
  var NL = window.WOK_NL || {};

  /* ------------------------------------------------------------------ data */
  var BOOK = { en: 'https://worldofkaraoke.nl/en/book-your-experience-2/', nl: 'https://worldofkaraoke.nl/boek-jouw-ervaring/' };
  var PRICE = { wed: 19, thu: 19, fri: 23, sat: 23, sun: 19 };
  var DAYS = ['wed', 'thu', 'fri', 'sat', 'sun'];
  var DAY_IDX = { sun: 0, wed: 3, thu: 4, fri: 5, sat: 6 };
  var HOURS = { 0: [16, 24], 3: [16, 24], 4: [16, 24], 5: [16, 26], 6: [16, 26] };
  var ROOMS = [
    { id: 'paris', name: 'Paris', min: 2, max: 3, m2: 8, start: 990, hue: '#ff5fa2', script: 1, s: 1.9 },
    { id: 'istanbul', name: 'Istanbul', min: 2, max: 3, m2: 9, start: 1005, hue: '#ffb24d', s: 1.75 },
    { id: 'tokyo', name: 'Tokyo', min: 2, max: 6, m2: 10, start: 1005, hue: '#ff4d67', ktv: 'only', pic: 1, wall: { en: 'Tokyo Tower after dark and a round Karaoke Night neon', nl: 'de Tokyo Tower bij nacht en een ronde neon met Karaoke Night' }, s: 2.3 },
    { id: 'barcelona', name: 'Barcelona', min: 2, max: 6, m2: 10, start: 1020, hue: '#ffd84a', script: 1, s: 2.1 },
    { id: 'singapore', name: 'Singapore', min: 4, max: 8, m2: 10, start: 1020, hue: '#5dffb4', ktv: 'plus', s: 2.1 },
    { id: 'los-angeles', name: 'Los Angeles', min: 4, max: 8, m2: 10, start: 990, hue: '#ff8a5c', script: 1, s: 2.2 },
    { id: 'rio', name: 'Rio de Janeiro', min: 4, max: 10, m2: 11, start: 1020, hue: '#7dff7a', pic: 1, wall: { en: 'the bay at night, a parrot in neon colours and a mirror ball overhead', nl: 'de baai bij nacht, een papegaai in neonkleuren en een spiegelbol erboven' }, s: 2.2 },
    { id: 'sydney', name: 'Sydney', min: 4, max: 10, m2: 12, start: 1035, hue: '#5ecbff', pic: 1, wall: { en: 'the Harbour Bridge at sunset', nl: 'de Harbour Bridge bij zonsondergang' }, s: 2.5 },
    { id: 'hongkong', name: 'Hongkong', min: 4, max: 10, m2: 12, start: 1035, hue: '#ff4fd0', ktv: 'plus', s: 2.4 },
    { id: 'london', name: 'London', min: 6, max: 12, m2: 12, start: 1035, hue: '#8f9bff', pic: 1, wall: { en: "the city's name in tall letters", nl: 'de naam van de stad in grote letters' }, s: 2.7 },
    { id: 'berlin', name: 'Berlin', min: 6, max: 12, m2: 12, start: 1035, hue: '#fff36b', ktv: 'only', pic: 1, wall: { en: 'BERLIJN, spelled the Dutch way', nl: "BERLIJN, op z'n Nederlands gespeld" }, s: 2.7 },
    { id: 'dubai', name: 'Dubai', min: 6, max: 12, m2: 12, start: 1005, hue: '#ffc46b', script: 1, pic: 1, wall: { en: 'the Dubai skyline and a Karaoke Night neon', nl: 'de skyline van Dubai en een neon met Karaoke Night' }, s: 2.6 },
    { id: 'amsterdam', name: 'Amsterdam', min: 12, max: 15, m2: 17, start: 1020, hue: '#8df4f2', pic: 1, wall: { en: 'AMSTERDAM in tall letters', nl: 'AMSTERDAM in grote letters' }, s: 3.1 },
    { id: 'new-york', name: 'New York', min: 16, max: 25, m2: 29, start: 990, hue: '#c9a2ff', ktv: 'plus', s: 3.7 }
  ];
  var BYID = {}; ROOMS.forEach(function (r) { BYID[r.id] = r; });

  /* ------------------------------------------------------------------ strings built from data */
  var T = {
    en: {
      dshort: { wed: 'Wed', thu: 'Thu', fri: 'Fri', sat: 'Sat', sun: 'Sun' },
      dlong: { wed: 'Wednesday', thu: 'Thursday', fri: 'Friday', sat: 'Saturday', sun: 'Sunday' },
      rooms: function (n) { return n + (n === 1 ? ' room' : ' rooms'); },
      fit: function (n, p) { return (n === 1 ? 'fits ' : 'fit ') + p + ' people'; },
      count: function (n, p) { return T.en.rooms(n) + ' ' + T.en.fit(n, p) + '.'; },
      price: function (e) { return '€' + e + ' per person'; },
      ktvOnly: '中文 KTV only', ktvPlus: '+ 中文 KTV',
      wall: 'On the wall',
      recap: function (d, room, t, p) { return 'Opens worldofkaraoke.nl. Choose there: ' + [T.en.dlong[d], room].concat(t ? [t] : []).concat([p + ' people']).join(', ') + '.'; },
      showRoom: function (n) { return 'Show the ' + n + ' room'; },
      upTo: ' to ',
      eur: function (v) { return '€' + (Math.round(v) === v ? v.toLocaleString('en-GB') : v.toFixed(2)); },
      go: function (n) { return n === 1 ? 'Show me the room' : 'Show me the ' + n + ' rooms'; },
      bar: function (n, p, d, e) { return T.en.rooms(n) + ' ' + T.en.fit(n, p) + ' on ' + T.en.dlong[d] + '. <b>€' + e + ' per person</b> for two hours.'; },
      barShort: function (n, p) { return '<b>' + T.en.rooms(n) + '</b> ' + T.en.fit(n, p) + '.'; },
      people: 'People', size: 'Size', system: 'Catalogue',
      sys: { std: 'Regular', only: 'Chinese KTV only', plus: 'Regular and Chinese KTV' },
      range: function (r) { return r.min + ' to ' + r.max; },
      sess: function (d) { return 'Sessions on ' + T.en.dlong[d]; },
      pp: function (e) { return '€' + e + ' per person'; },
      total: function (e, p) { return '€' + e * p + ' for ' + p + ' people, two hours'; },
      check: function (n) { return 'Check availability for ' + n; },
      move: 'Plans change? You can move your booking once, up to 72 hours before your session.',
      warn: function (r) { return r.name + ' is for ' + r.min + ' to ' + r.max + ' people. '; },
      warnBtn: function (p) { return 'Show a room for ' + p; },
      inside: function (n) { return 'Inside ' + n; },
      dock: function (e, d) { return 'From €' + e + ' per person on ' + T.en.dlong[d]; },
      open: 'Open',
      until: function (t) { return 'until ' + t; },
      opens: function (day, t) { return 'opens ' + day + ' ' + t; },
      wk: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
      today: 'today',
      less: 'One person fewer', more: 'One person more', lang: 'Schakel naar Nederlands',
      num: function (v) { return v.toLocaleString('en-GB'); },
      // groups calculator
      gFit: function (n, p) { return n + (n === 1 ? ' room fits ' : ' rooms fit ') + p + ' people'; },
      gTotal: function (e, p, d) { return '€' + (e * p).toLocaleString('en-GB'); },
      gTotalNote: function (e, p, d) { return 'for ' + p + ' people on ' + T.en.dlong[d] + ', two hours (€' + e + ' per person)'; },
      gKtv: function (k) { return k === 1 ? 'One of them runs on Chinese KTV only.' : k + ' of them run on Chinese KTV only.'; },
      gBig: function (p) { return p + ' people, more than one room'; },
      gBigP: 'Our biggest room, New York, holds 25. All fourteen rooms together hold 140, and the bar area another 80. Groups this size are arranged by email or phone, so the team can put the rooms together for you.',
      gRate: function (e, p, d) { return 'At the regular €' + e + ' per person on ' + T.en.dlong[d] + ', that is about €' + (e * p).toLocaleString('en-GB') + ' for two hours. The final price comes from the team.'; },
      gMail: 'Email us about your group', gBook: 'Book a room',
      vPause: 'Pause the background video', vPlay: 'Play the background video'
    },
    nl: {
      dshort: { wed: 'wo', thu: 'do', fri: 'vr', sat: 'za', sun: 'zo' },
      dlong: { wed: 'woensdag', thu: 'donderdag', fri: 'vrijdag', sat: 'zaterdag', sun: 'zondag' },
      rooms: function (n) { return n + (n === 1 ? ' kamer' : ' kamers'); },
      fit: function (n, p) { return (n === 1 ? 'past bij ' : 'passen bij ') + p + ' personen'; },
      count: function (n, p) { return T.nl.rooms(n) + ' ' + T.nl.fit(n, p) + '.'; },
      price: function (e) { return '€' + e + ' per persoon'; },
      ktvOnly: 'alleen 中文 KTV', ktvPlus: '+ 中文 KTV',
      wall: 'Op de muur',
      recap: function (d, room, t, p) { return 'Opent worldofkaraoke.nl. Kies daar: ' + [T.nl.dlong[d], room].concat(t ? [t] : []).concat([p + ' personen']).join(', ') + '.'; },
      showRoom: function (n) { return 'Toon de kamer ' + n; },
      upTo: ' tot ',
      eur: function (v) { return '€' + (Math.round(v) === v ? v.toLocaleString('nl-NL') : v.toFixed(2).replace('.', ',')); },
      go: function (n) { return n === 1 ? 'Laat de kamer zien' : 'Laat de ' + n + ' kamers zien'; },
      bar: function (n, p, d, e) { return T.nl.rooms(n) + ' ' + T.nl.fit(n, p) + ' op ' + T.nl.dlong[d] + '. <b>€' + e + ' per persoon</b> voor twee uur.'; },
      barShort: function (n, p) { return '<b>' + T.nl.rooms(n) + '</b> ' + T.nl.fit(n, p) + '.'; },
      people: 'Personen', size: 'Grootte', system: 'Catalogus',
      sys: { std: 'Regulier', only: 'Alleen Chinese KTV', plus: 'Regulier en Chinese KTV' },
      range: function (r) { return r.min + ' tot ' + r.max; },
      sess: function (d) { return 'Sessies op ' + T.nl.dlong[d]; },
      pp: function (e) { return '€' + e + ' per persoon'; },
      total: function (e, p) { return '€' + e * p + ' voor ' + p + ' personen, twee uur'; },
      check: function (n) { return 'Bekijk beschikbaarheid ' + n; },
      move: 'Verandert er iets? Je kunt je boeking één keer verplaatsen, tot 72 uur voor je sessie.',
      warn: function (r) { return r.name + ' is voor ' + r.min + ' tot ' + r.max + ' personen. '; },
      warnBtn: function (p) { return 'Toon een kamer voor ' + p; },
      inside: function (n) { return 'Binnen in ' + n; },
      dock: function (e, d) { return 'Vanaf €' + e + ' per persoon op ' + T.nl.dlong[d]; },
      open: 'Open',
      until: function (t) { return 'tot ' + t; },
      opens: function (day, t) { return 'open vanaf ' + day + ' ' + t; },
      wk: ['zondag', 'maandag', 'dinsdag', 'woensdag', 'donderdag', 'vrijdag', 'zaterdag'],
      today: 'vandaag',
      less: 'Eén persoon minder', more: 'Eén persoon meer', lang: 'Switch to English',
      num: function (v) { return v.toLocaleString('nl-NL'); },
      gFit: function (n, p) { return n + (n === 1 ? ' kamer past bij ' : ' kamers passen bij ') + p + ' personen'; },
      gTotal: function (e, p) { return '€' + (e * p).toLocaleString('nl-NL'); },
      gTotalNote: function (e, p, d) { return 'voor ' + p + ' personen op ' + T.nl.dlong[d] + ', twee uur (€' + e + ' per persoon)'; },
      gKtv: function (k) { return k === 1 ? 'Eén daarvan werkt alleen met Chinese KTV.' : k + ' daarvan werken alleen met Chinese KTV.'; },
      gBig: function (p) { return p + ' personen, meer dan één kamer'; },
      gBigP: 'Onze grootste kamer, New York, past bij 25. Alle veertien kamers samen bieden plek aan 140, en de bar nog eens aan 80. Groepen van deze grootte regel je per mail of telefoon, zodat het team de kamers voor je kan combineren.',
      gRate: function (e, p, d) { return 'Tegen het gewone tarief van €' + e + ' per persoon op ' + T.nl.dlong[d] + ' is dat ongeveer €' + (e * p).toLocaleString('nl-NL') + ' voor twee uur. De uiteindelijke prijs hoor je van het team.'; },
      gMail: 'Mail ons over je groep', gBook: 'Boek een kamer',
      vPause: 'Pauzeer de achtergrondvideo', vPlay: 'Speel de achtergrondvideo af'
    }
  };

  /* ------------------------------------------------------------------ state: URL > this visit > defaults */
  var state = { lang: 'en', people: 4, day: null, room: null, sess: null, gpeople: 10 };
  try { var saved = localStorage.getItem('wok_lang'); if (saved === 'nl' || saved === 'en') state.lang = saved; } catch (e) {}
  try { var ss = JSON.parse(sessionStorage.getItem('wok_state') || '{}'); if (ss.p) state.people = ss.p; if (ss.d) state.day = ss.d; if (ss.g) state.gpeople = ss.g; } catch (e) {}
  var Q = new URLSearchParams(location.search);
  if (Q.get('p')) state.people = clamp(parseInt(Q.get('p'), 10), 2, 25);
  if (DAYS.indexOf(Q.get('d')) > -1) state.day = Q.get('d');
  if (BYID[Q.get('room')]) { state.room = Q.get('room'); var rr = BYID[state.room]; if (!Q.get('p') && !fits(rr, state.people)) state.people = rr.min; }
  function clamp(v, a, b) { return Math.max(a, Math.min(b, isNaN(v) ? a : v)); }
  function persist() { try { sessionStorage.setItem('wok_state', JSON.stringify({ p: state.people, d: state.day, g: state.gpeople })); } catch (e) {} }

  function ams() {
    var parts = {}, now = new Date();
    try {
      new Intl.DateTimeFormat('en-GB', { timeZone: 'Europe/Amsterdam', weekday: 'short', hour: '2-digit', minute: '2-digit', hour12: false })
        .formatToParts(now).forEach(function (p) { parts[p.type] = p.value; });
      var wd = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].indexOf(parts.weekday);
      return { d: wd, m: (parseInt(parts.hour, 10) % 24) * 60 + parseInt(parts.minute, 10) };
    } catch (e) { return { d: now.getDay(), m: now.getHours() * 60 + now.getMinutes() }; }
  }
  function hhmm(h) { h = h % 24; return (h < 10 ? '0' : '') + h + ':00'; }
  function tfmt(min) { min = min % 1440; var h = Math.floor(min / 60), m = min % 60; return (h < 10 ? '0' : '') + h + ':' + (m < 10 ? '0' : '') + m; }
  function openState() {
    var n = ams(), L = T[state.lang], y = (n.d + 6) % 7;
    if (HOURS[y] && HOURS[y][1] > 24 && n.m < (HOURS[y][1] - 24) * 60) return { open: true, note: L.until(hhmm(HOURS[y][1])) };
    if (HOURS[n.d] && n.m >= HOURS[n.d][0] * 60) return { open: true, note: L.until(hhmm(HOURS[n.d][1])) };
    if (HOURS[n.d] && n.m < HOURS[n.d][0] * 60) return { open: false, note: L.opens(L.today, hhmm(HOURS[n.d][0])) };
    for (var i = 1; i < 8; i++) { var d = (n.d + i) % 7; if (HOURS[d]) return { open: false, note: L.opens(L.wk[d], hhmm(HOURS[d][0])) }; }
    return { open: false, note: '' };
  }
  function defaultDay() {
    var n = ams();
    for (var i = 0; i < 7; i++) {
      var d = (n.d + i) % 7;
      if (!HOURS[d]) continue;
      if (i === 0 && n.m > 21 * 60 + 45) continue;
      for (var k in DAY_IDX) if (DAY_IDX[k] === d) return k;
    }
    return 'fri';
  }
  function fits(r, p) { return p >= r.min && p <= r.max; }
  function sessions(r, day) {
    var out = [], late = (day === 'fri' || day === 'sat') && r.start !== 1035;
    for (var k = 0; k < (late ? 4 : 3); k++) { var s = r.start + k * 135; out.push({ t: tfmt(s) + ' – ' + tfmt(s + 120), late: k === 3 }); }
    return out;
  }
  function rnd(a, b) { return a + Math.random() * (b - a); }
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function roomsUrl(extra) {
    var q = 'p=' + state.people + '&d=' + state.day + (extra ? '&' + extra : '');
    return 'rooms.html?' + q;
  }

  /* ------------------------------------------------------------------ i18n */
  var EN = {};
  function applyLang(relight) {
    var nl = state.lang === 'nl';
    root.lang = state.lang;
    $$('[data-i18n]').forEach(function (el) {
      var k = el.getAttribute('data-i18n'); if (!(k in EN)) EN[k] = el.textContent;
      el.textContent = nl && NL[k] ? NL[k] : EN[k];
    });
    $$('[data-i18n-html]').forEach(function (el) {
      var k = el.getAttribute('data-i18n-html'); if (!(('h:' + k) in EN)) EN['h:' + k] = el.innerHTML;
      el.innerHTML = nl && NL[k] ? NL[k] : EN['h:' + k];
    });
    $$('[data-i18n-aria]').forEach(function (el) {
      var k = el.getAttribute('data-i18n-aria'); if (!(('a:' + k) in EN)) EN['a:' + k] = el.getAttribute('aria-label');
      el.setAttribute('aria-label', nl && NL[k] ? NL[k] : EN['a:' + k]);
    });
    $$('[data-book]').forEach(function (a) { a.href = BOOK[state.lang]; });
    $$('[data-lang]').forEach(function (lb) {
      lb.setAttribute('aria-label', T[state.lang].lang);
      lb.children[0].classList.toggle('on', !nl); lb.children[1].classList.toggle('on', nl);
    });
    $$('[data-step="-1"],[data-gstep="-1"]').forEach(function (b) { b.setAttribute('aria-label', T[state.lang].less); });
    $$('[data-step="1"],[data-gstep="1"]').forEach(function (b) { b.setAttribute('aria-label', T[state.lang].more); });
    if (relight) $$('.nw').forEach(function (n) { n.classList.add('lit'); });   // swapped markup arrives lit
  }

  /* ------------------------------------------------------------------ finder: days, outputs */
  function renderDays() {
    var L = T[state.lang];
    $$('[data-days]').forEach(function (box) {
      var grp = box.getAttribute('data-days');
      box.innerHTML = DAYS.map(function (d) {
        return '<label class="day"><input type="radio" name="day-' + grp + '" value="' + d + '"' + (d === state.day ? ' checked' : '') + '>' +
          '<span>' + L.dshort[d] + '<small>€' + PRICE[d] + '</small></span></label>';
      }).join('');
    });
  }
  function out(key, val, html) { $$('[data-out="' + key + '"]').forEach(function (el) { if (html) el.innerHTML = val; else el.textContent = val; }); }
  function renderOut() {
    var L = T[state.lang], p = state.people, e = PRICE[state.day];
    var n = ROOMS.filter(function (r) { return fits(r, p); }).length;
    out('count', L.count(n, p)); out('price', L.price(e)); out('go', L.go(n));
    out('bar', PAGE === 'home' ? L.barShort(n, p) : L.bar(n, p, state.day, e), true);
    out('dockprice', L.dock(e, state.day));
    $$('#people,#people2').forEach(function (i) { i.value = p; });
    $$('.days input').forEach(function (i) { i.checked = i.value === state.day; });
    $$('a[href^="rooms.html"]').forEach(function (a) { if (!a.hasAttribute('data-fixed')) { var h = a.getAttribute('href'), base = h.split('?')[0].split('#')[0]; var room = /room=([a-z-]+)/.exec(h); if (base === 'rooms.html') a.setAttribute('href', roomsUrl(room ? 'room=' + room[1] : '') + (h.indexOf('#') > -1 ? h.slice(h.indexOf('#')) : '')); } });
  }

  /* ------------------------------------------------------------------ sign wall */
  var wall = $('#signwall'), panel = $('#room');
  var PP = '<svg class="pp" viewBox="0 0 12 12" aria-hidden="true"><circle cx="6" cy="3.7" r="2.2"/><path d="M1.9 11.2c0-2.5 1.8-4.2 4.1-4.2s4.1 1.7 4.1 4.2"/></svg>';
  function buildWall() {
    if (!wall) return;
    wall.innerHTML = ROOMS.map(function (r) {
      return '<button type="button" aria-pressed="false" class="csign' + (r.script ? ' script' : '') + '" data-room="' + r.id + '" style="--h:' + r.hue + ';--s:' + r.s + '">' +
        '<span class="tube">' + esc(r.name) + '</span><small>' + PP + r.min + '–' + r.max + (r.ktv ? ' <i lang="zh-Hans">' + (r.ktv === 'only' ? T[state.lang].ktvOnly : T[state.lang].ktvPlus) + '</i>' : '') + '</small></button>';
    }).join('');
  }
  function flick(el, cls, seq) {
    if (!MOTION) { el.classList.remove(cls); return; }
    var t = 0, on = true; el.classList.add(cls);
    seq.forEach(function (ms) { t += ms; on = !on; (function (s) { setTimeout(function () { el.classList.toggle(cls, s); }, t); })(on); });
    setTimeout(function () { el.classList.remove(cls); }, t + 20);
  }
  var SEQS = [[60, 50, 40], [40, 70, 30, 90, 50], [90], [30, 40, 30, 40, 120, 60, 40]];
  var wallSeen = !MOTION;
  function renderWall(animate, surge) {
    if (!wall) return;
    var p = state.people, k = 0, s = 0, link = wall.hasAttribute('data-link');
    surge = surge && wallSeen && MOTION;
    $$('.csign', wall).forEach(function (b, i) {
      var r = ROOMS[i], f = fits(r, p), was = b.classList.contains('fit');
      b.classList.toggle('fit', f);
      b.classList.toggle('sel', !link && state.room === r.id);
      b.setAttribute('aria-pressed', !link && state.room === r.id ? 'true' : 'false');
      if (!wallSeen) { if (f) b.classList.add('dip'); return; }
      if (f && (!was || animate)) {
        var seq = SEQS[Math.floor(Math.random() * SEQS.length)].slice();
        seq[0] += surge ? 230 + k++ * 80 : animate ? i * 70 : rnd(0, 160);
        flick(b, 'dip', seq);
      } else if (surge && !f && was) {
        flick(b, 'dying', [rnd(40, 110), 50, 60]);
      } else if (surge && f && was) {
        b.style.setProperty('--d', Math.round(200 + s++ * 55) + 'ms');
        b.classList.remove('surge'); void b.offsetWidth; b.classList.add('surge');
      }
    });
  }
  function renderPanel() {
    if (!panel) return;
    var L = T[state.lang], r = BYID[state.room];
    if (!r) return;
    var p = state.people, e = PRICE[state.day], f = fits(r, p);
    var media = r.pic
      ? '<img src="img/room-' + r.id + '-800.webp" srcset="img/room-' + r.id + '-800.webp 800w, img/room-' + r.id + '-1400.webp 1400w" sizes="(max-width:1040px) 92vw, 44vw" alt="' + esc(L.inside(r.name)) + '"><figcaption>' + esc(L.inside(r.name)) + '</figcaption>'
      : '<div class="big' + (r.script ? ' script' : '') + '">' + esc(r.name) + '</div>';
    var ss = sessions(r, state.day);
    if (state.sess != null && !ss[state.sess]) state.sess = null;
    var sess = ss.map(function (s, k) { return '<li><button type="button" data-sess="' + k + '" aria-pressed="' + (state.sess === k ? 'true' : 'false') + '"' + (s.late ? ' class="late"' : '') + '>' + s.t + '</button></li>'; }).join('');
    var warn = f ? '' : '<p class="room-warn">' + esc(L.warn(r)) + '<button type="button" data-first>' + esc(L.warnBtn(p)) + '</button></p>';
    var picked = state.sess != null ? ss[state.sess].t.slice(0, 5) : '';
    panel.style.setProperty('--h', r.hue);
    panel.innerHTML =
      '<figure class="room-media">' + media + '</figure>' +
      '<div class="room-body">' +
        '<h3>' + esc(r.name) + '</h3>' +
        (r.wall ? '<p class="room-wall"><span>' + L.wall + '</span> ' + esc(r.wall[state.lang]) + '.</p>' : '') +
        '<dl class="specs"><div><dt>' + L.people + '</dt><dd>' + L.range(r) + '</dd></div><div><dt>' + L.size + '</dt><dd>' + r.m2 + ' m²</dd></div><div><dt>' + L.system + '</dt><dd>' + L.sys[r.ktv || 'std'] + '</dd></div></dl>' +
        '<div class="sess"><h4>' + L.sess(state.day) + '</h4><ul>' + sess + '</ul></div>' +
        warn +
        (f ? '<p class="room-price"><b>' + L.pp(e) + '</b><span>' + L.total(e, p) + '</span></p>' : '') +
        '<a class="btn ' + (f ? 'btn-lit' : 'btn-tube') + ' btn-wide" target="_blank" rel="noopener" href="' + BOOK[state.lang] + '"><span>' + esc(L.check(r.name)) + '</span></a>' +
        '<p class="fine">' + esc(L.recap(state.day, r.name, picked, p)) + '</p>' +
        '<p class="fine">' + L.move + '</p>' +
      '</div>';
  }
  function firstFit() {
    var p = state.people, f = ROOMS.filter(function (r) { return fits(r, p); });
    var best = f.filter(function (r) { return r.ktv !== 'only' && r.pic; })[0] || f.filter(function (r) { return r.ktv !== 'only'; })[0] || f[0] || ROOMS[0];
    return best.id;
  }
  function update(opts) {
    opts = opts || {};
    if (opts.day) state.sess = null;
    var cur = BYID[state.room];
    if (!cur || (opts.people && !fits(cur, state.people))) { state.room = firstFit(); state.sess = null; }
    renderOut(); renderWall(opts.animate, opts.people); renderPanel(); renderCalc(); persist();
  }
  var feed = $('.feed');
  function setPeople(v, src) {
    v = clamp(parseInt(v, 10), 2, 25);
    if (v === state.people && src !== 'force') { renderOut(); return; }
    state.people = v; update({ people: true });
    if (!MOTION) return;
    $$('#people,#people2').forEach(function (n) { n.classList.remove('bump'); void n.offsetWidth; n.classList.add('bump'); });
    if (feed && wallSeen) { feed.classList.remove('go'); void feed.offsetWidth; feed.classList.add('go'); }
  }

  /* ------------------------------------------------------------------ groups calculator */
  var calcOut = $('#calcOut');
  function renderCalc() {
    if (!calcOut) return;
    var L = T[state.lang], p = state.gpeople, d = state.day, e = PRICE[d];
    $('#gpeople').value = p;
    if (p <= 25) {
      var f = ROOMS.filter(function (r) { return fits(r, p); }), k = f.filter(function (r) { return r.ktv === 'only'; }).length;
      calcOut.innerHTML = '<p class="co-head">' + esc(L.gFit(f.length, p)) + '</p>' +
        '<p class="co-rooms">' + f.map(function (r) { return '<a href="rooms.html?room=' + r.id + '&amp;p=' + p + '&amp;d=' + d + '" data-fixed class="' + (r.script ? 'script' : '') + '" style="--h:' + r.hue + '">' + esc(r.name) + '</a>'; }).join('') + '</p>' +
        (k ? '<p class="co-note">' + esc(L.gKtv(k)) + '</p>' : '') +
        '<p class="co-price"><b>' + L.gTotal(e, p, d) + '</b><span>' + esc(L.gTotalNote(e, p, d)) + '</span></p>' +
        '<p class="btn-row"><a class="btn btn-lit" href="' + BOOK[state.lang] + '" target="_blank" rel="noopener"><span>' + L.gBook + '</span></a></p>';
    } else {
      calcOut.innerHTML = '<p class="co-head">' + esc(L.gBig(p)) + '</p><p class="co-note">' + esc(L.gBigP) + '</p>' +
        '<p class="co-note">' + esc(L.gRate(e, p, d)) + '</p>' +
        '<p class="btn-row"><a class="btn btn-lit" href="mailto:info@worldofkaraoke.nl?subject=Group%20booking%20for%20' + p + '"><span>' + L.gMail + '</span></a><a class="btn btn-tube" href="tel:+31622955004"><span>+31 6 22 95 50 04</span></a></p>';
    }
  }

  /* ---------------------------------------------------------------- drinks card */
  var setlist = $('#setlist'), tagsSeen = !MOTION, M = window.WOK_MENU || { groups: [], places: {} };
  function tx(v) { return v == null ? '' : typeof v === 'string' ? v : v[state.lang] || v.en; }
  function rowPrices(r) { return r.ps ? r.ps.map(function (x) { return x.p; }) : r.p != null ? [r.p] : []; }
  function renderMenu() {
    if (!setlist) return;
    var L = T[state.lang], openIds = {};
    $$('details', setlist).forEach(function (d) { openIds[d.getAttribute('data-g')] = d.open; });
    var first = !setlist.firstChild, narrow = window.matchMedia('(max-width:760px)').matches;
    setlist.innerHTML = M.groups.map(function (g, gi) {
      var all = []; g.rows.forEach(function (r) { all = all.concat(rowPrices(r)); });
      var lo = Math.min.apply(null, all), hi = Math.max.apply(null, all);
      var isOpen = first ? (g.open && (!narrow || gi === 0)) : openIds[g.id];
      var rows = g.rows.map(function (r) {
        if (r.h) return '<li class="sub">' + esc(tx(r.h)) + '</li>';
        var pl = M.places[r.tag || r.from], price;
        if (r.ps) price = r.ps.map(function (x) { return '<span>' + (x.l ? '<small>' + esc(tx(x.l)) + '</small> ' : '') + L.eur(x.p) + '</span>'; }).join('');
        else price = '<span>' + L.eur(r.p) + '</span>';
        var tag = !pl ? '' : r.tag ? '<span class="tag neon' + (tagsSeen ? '' : ' dip') + '" style="--h:' + pl.hue + '">' + esc(tx(pl)) + '</span>' : '<span class="tag">' + esc(tx(pl)) + '</span>';
        return '<li class="trk' + (r.pic ? ' has-pic' : '') + '">' +
          (r.pic ? '<img class="thumb" loading="lazy" width="56" height="56" src="img/dr-' + r.pic + '-160.webp" alt="">' : '') +
          '<div class="trk-main"><p class="nm"><span class="fill">' + esc(tx(r.n)) + '</span>' + tag + '</p>' + (r.d ? '<p class="ds">' + esc(tx(r.d)) + '</p>' : '') + '</div>' +
          '<p class="pr">' + price + '</p></li>';
      }).join('');
      return '<details class="grp" data-g="' + g.id + '"' + (isOpen ? ' open' : '') + '><summary><span class="g-name">' + esc(tx(g.name)) + '</span><span class="g-what">' + esc(tx(g.what)) + '</span><span class="g-range">' + L.eur(lo) + L.upTo + L.eur(hi) + '</span></summary><ul>' + rows + '</ul></details>';
    }).join('');
  }

  function renderOpen() {
    var L = T[state.lang], o = openState();
    $$('[data-open-word]').forEach(function (w) { w.textContent = L.open; w.parentNode.setAttribute('data-state', o.open ? 'open' : 'closed'); });
    $$('[data-open-note]').forEach(function (n) { n.textContent = o.note; });
    var d = ams().d; $$('.hours tr').forEach(function (tr) { tr.classList.toggle('today', +tr.getAttribute('data-d') === d); });
  }

  /* ------------------------------------------------------------------ hero logo sign */
  var sign = $('#sign'), hero = $('.hero');
  var UNITS = 14, lit = [], litN = 0;
  function setUnit(u, on) {
    if (lit[u] === on) return; lit[u] = on; litN += on ? 1 : -1;
    $$('[data-u="' + u + '"]', sign).forEach(function (n) { n.classList.toggle('on', on); });
    hero.style.setProperty('--lit', (0.12 + 0.88 * litN / UNITS).toFixed(3));
  }
  function strike(u, at, seq) {
    var t = at, on = false;
    [0].concat(seq).forEach(function (ms) { t += ms; on = !on; (function (s) { setTimeout(function () { setUnit(u, s); }, t); })(on); });
    return t;
  }
  var faultTimer = null, heroVisible = true, lastU = -1, power = true, busy = false;
  var FAULTS = [[55, 45], [40, 30, 30, 90, 40], [60, 40, 50, 30, 30, 260, 40], [30, 25, 30, 25, 30, 25, 140]];
  function blinkUnit(u, seq, delay) {
    var t = delay || 0, on = true;
    seq.forEach(function (ms) { t += ms; on = !on; (function (s) { setTimeout(function () { setUnit(u, s); }, t); })(on); });
    setTimeout(function () { setUnit(u, true); }, t + 30);
  }
  function pickUnit() { var u; do { u = Math.random() < 0.3 ? 10 : Math.floor(Math.random() * UNITS); } while (u === lastU); return (lastU = u); }
  function fault(first) {
    clearTimeout(faultTimer);
    var wait = first ? rnd(1400, 2400) : rnd(1800, 4300) + (Math.random() < 0.14 ? rnd(2000, 3500) : 0);
    faultTimer = setTimeout(function () {
      if (power && heroVisible && !document.hidden) {
        var r = Math.random(), seq = FAULTS[r < 0.38 ? 0 : r < 0.7 ? 1 : r < 0.88 ? 2 : 3];
        var u = pickUnit(); blinkUnit(u, seq.map(function (x) { return x + rnd(-8, 12); }), 0);
        if (Math.random() < 0.35) { var v = u + (Math.random() < 0.5 ? -1 : 1); if (v < 0 || v >= UNITS) v = u > 0 ? u - 1 : 1; blinkUnit(v, FAULTS[Math.random() < 0.5 ? 0 : 1], rnd(60, 180)); }
      }
      fault();
    }, wait);
  }
  function switchSign() {
    if (busy) return;
    power = !power; sign.setAttribute('aria-pressed', power ? 'true' : 'false');
    if (!MOTION) { root.classList.toggle('pre', !power); hero.style.setProperty('--lit', power ? '1' : '0.12'); return; }
    clearTimeout(faultTimer);
    if (!power) {
      var hang = Math.floor(Math.random() * UNITS);
      for (var k = 0; k < UNITS; k++) if (k !== hang) setUnit(k, false);
      setTimeout(function () { setUnit(hang, false); hero.style.setProperty('--lit', '0.12'); }, 140);
    } else { busy = true; ignite(); setTimeout(function () { busy = false; }, 2600); }
  }
  function ignite() {
    if (!sign) return;
    if (!MOTION) { hero.style.setProperty('--lit', '1'); return; }
    for (var i = 0; i < UNITS; i++) lit[i] = false;
    litN = 0; hero.style.setProperty('--lit', '0.12');
    var end = 0, base = 300;
    for (var u = 0; u < UNITS; u++) {
      var at = base + (u < 5 ? u * 105 : u === 5 ? 640 : u === 6 ? 800 : 930 + (u - 7) * 92) + rnd(-25, 25);
      var seq = u === 5 ? [50, 45, 30, 40, 40, 140] : SEQS[Math.floor(Math.random() * 3)].map(function (x) { return x + rnd(-10, 14); });
      seq = seq.length % 2 ? seq.concat([40]) : seq;
      end = Math.max(end, strike(u, at, seq));
    }
    setTimeout(function () { sign.style.opacity = '.35'; hero.style.setProperty('--lit', '0.3'); }, end + 260);
    setTimeout(function () { sign.style.opacity = ''; hero.style.setProperty('--lit', '1'); }, end + 330);
    setTimeout(function () { sign.style.opacity = '.6'; }, end + 420);
    setTimeout(function () { sign.style.opacity = ''; if (!power) return; for (var k = 0; k < UNITS; k++) setUnit(k, true); fault(true); }, end + 470);
  }

  /* ------------------------------------------------------------------ hero video: their venue on a loop */
  function heroVideo() {
    var v = $('#heroVideo'), tog = $('#vidToggle'); if (!v) return;
    var saveData = navigator.connection && navigator.connection.saveData;
    if (!MOTION || saveData) { root.classList.add('no-video'); return; }
    var tall = window.matchMedia('(max-width: 760px)').matches;
    var userPaused = false, visible = true;
    v.src = v.getAttribute(tall ? 'data-tall' : 'data-wide'); v.preload = 'auto';
    function play() { if (userPaused || !visible || document.hidden) return; var p = v.play(); if (p && p.catch) p.catch(function () { root.classList.add('no-video'); }); }
    v.addEventListener('playing', function () { v.classList.add('on'); });
    new IntersectionObserver(function (e) { visible = e[0].isIntersecting; heroVisible = visible; if (visible) play(); else v.pause(); }).observe(hero);
    document.addEventListener('visibilitychange', function () { if (document.hidden) v.pause(); else play(); });
    if (tog) tog.addEventListener('click', function () {
      userPaused = !userPaused; tog.setAttribute('aria-pressed', userPaused ? 'true' : 'false');
      tog.setAttribute('aria-label', userPaused ? T[state.lang].vPlay : T[state.lang].vPause);
      if (userPaused) v.pause(); else play();
    });
    play();
  }

  /* ------------------------------------------------------------------ loader: their swinging Ki sign, once per visit */
  function loader() {
    var el = $('#loader'); if (!el) return 0;
    var seen = root.classList.contains('seen');
    try { sessionStorage.setItem('wok_seen', '1'); } catch (e) {}
    if (!MOTION || seen) { el.remove(); return seen ? 0 : 0; }
    el.classList.add('run');
    setTimeout(function () { el.classList.add('out'); }, 1150);
    setTimeout(function () { el.remove(); }, 1950);
    return 1900;
  }

  /* ------------------------------------------------------------------ menu overlay */
  function menu() {
    var b = $('#burger'), m = $('#menu'); if (!b || !m) return;
    m.hidden = false; m.inert = true;
    var pic = $('[data-menu-pic]', m), preloaded = false, pending = null;
    function setPic(name) {
      if (!pic || !name || pic.getAttribute('src').indexOf(name) > -1) return;
      clearTimeout(pending); pic.classList.add('swap');
      pending = setTimeout(function () { var im = new Image(); im.onload = function () { pic.src = im.src; pic.classList.remove('swap'); }; im.src = 'img/' + name + '-640.webp'; }, 120);
    }
    function open() {
      m.inert = false; m.classList.add('open'); b.setAttribute('aria-expanded', 'true'); root.classList.add('menu-open');
      var cur = $('a[aria-current]', m) || $('a', m); setPic(cur.getAttribute('data-pic'));
      if (!preloaded) { preloaded = true; $$('[data-pic]', m).forEach(function (a) { var im = new Image(); im.src = 'img/' + a.getAttribute('data-pic') + '-640.webp'; }); }
      setTimeout(function () { var f = $('.menu-links a', m); if (f) f.focus({ preventScroll: true }); }, MOTION ? 420 : 0);
    }
    function close(noFocus) {
      m.classList.remove('open'); b.setAttribute('aria-expanded', 'false'); root.classList.remove('menu-open'); m.inert = true;
      if (!noFocus) b.focus();
    }
    b.addEventListener('click', function () { if (m.classList.contains('open')) close(); else open(); });
    document.addEventListener('keydown', function (e) {
      if (!m.classList.contains('open')) return;
      if (e.key === 'Escape') { close(); return; }
      if (e.key === 'Tab') {
        var f = [b].concat($$('a,button', m)), i = f.indexOf(document.activeElement);
        if (e.shiftKey && i <= 0) { e.preventDefault(); f[f.length - 1].focus(); }
        else if (!e.shiftKey && i === f.length - 1) { e.preventDefault(); f[0].focus(); }
      }
    });
    $$('.menu-links a', m).forEach(function (a) {
      a.addEventListener('mouseenter', function () { setPic(a.getAttribute('data-pic')); });
      a.addEventListener('focus', function () { setPic(a.getAttribute('data-pic')); });
      a.addEventListener('click', function (e) { if (a.hasAttribute('aria-current')) { e.preventDefault(); close(true); window.scrollTo({ top: 0, behavior: MOTION ? 'smooth' : 'auto' }); } });
    });
  }

  /* ------------------------------------------------------------------ neon words and circuits: switched on as you arrive */
  var nwVisible = new Set(), nwIO = null;
  function strikeOn(n, delay) {
    var t = delay || 120, on = false;
    [0, 70, 50, 40, 110, 50].forEach(function (ms) { t += ms; on = !on; (function (s) { setTimeout(function () { n.classList.toggle('lit', s); }, t); })(on); });
    setTimeout(function () { n.classList.add('lit'); }, t + 40);
  }
  function neonWords(startDelay) {
    var els = $$('.nw');
    if (!MOTION || !('IntersectionObserver' in window)) { els.forEach(function (e) { e.classList.add('lit'); }); $$('.circuit').forEach(function (c) { c.classList.add('on'); }); return; }
    var circIO = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { circIO.unobserve(e.target); setTimeout(function () { e.target.classList.add('on'); }, startDelay && e.target.getBoundingClientRect().top < innerHeight ? startDelay : 0); } });
    }, { threshold: 0.5, rootMargin: '0px 0px -12% 0px' });
    $$('.circuit').forEach(function (c) { circIO.observe(c); });
    var io = nwIO = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        var n = e.target;
        if (e.isIntersecting) {
          nwVisible.add(n);
          if (!n.classList.contains('lit') && !n.dataset.going) {
            n.dataset.going = '1';
            var sec = n.closest('section, .sip-panel'), hasC = sec && $('.circuit', sec);
            var d = (hasC ? 820 : 120) + (startDelay && n.getBoundingClientRect().top < innerHeight ? startDelay : 0);
            strikeOn(n, d);
          }
        } else nwVisible.delete(n);
      });
    }, { threshold: 0.5 });
    els.forEach(function (e) { io.observe(e); });
    (function tick() {
      setTimeout(function () {
        if (!document.hidden && nwVisible.size) {
          var arr = Array.from(nwVisible).filter(function (n) { return n.classList.contains('lit'); });
          var n = arr[Math.floor(Math.random() * arr.length)];
          if (n) { n.classList.add('stutter'); setTimeout(function () { n.classList.remove('stutter'); }, 620); }
        }
        tick();
      }, rnd(3000, 6200));
    })();
  }

  /* ------------------------------------------------------------------ small things */
  function buttons() {
    if (!MOTION || !('IntersectionObserver' in window)) return;
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { io.unobserve(e.target); e.target.classList.add('strike'); setTimeout(function () { e.target.classList.remove('strike'); }, 900); } });
    }, { threshold: 0.9 });
    $$('main .btn-lit').forEach(function (b) { if (!b.closest('.hero')) io.observe(b); });
  }
  function taps() {
    var host = $('#taps'); if (!host || !MOTION) return;
    var pool = [], k = 0;
    for (var i = 0; i < 4; i++) { var d = document.createElement('span'); d.className = 'tap'; d.innerHTML = '<i class="ring"></i><i class="st s1"></i><i class="st s2"></i><i class="st s3"></i>'; host.appendChild(d); pool.push(d); }
    document.addEventListener('click', function (ev) {
      if (!ev.detail) return;
      var t = ev.target.closest('a,button,summary,label,.csign,.trk'); if (!t) return;
      var d = pool[k++ % pool.length], hv = t.closest('[style*="--h"]');
      d.classList.remove('go'); d.style.transform = 'translate(' + ev.clientX + 'px,' + ev.clientY + 'px)';
      d.style.setProperty('--h', hv ? getComputedStyle(hv).getPropertyValue('--h') : '#8df4f2');
      void d.offsetWidth; d.classList.add('go');
    }, { passive: true });
  }
  function countUp() {
    $$('[data-count]').forEach(function (el) {
      var N = +el.getAttribute('data-count');
      if (!MOTION) { el.textContent = T[state.lang].num(N); return; }
      el.textContent = '0';
      new IntersectionObserver(function (e, io) {
        if (!e[0].isIntersecting) return; io.disconnect();
        var t0 = performance.now(), dur = 1700;
        (function step(t) { var u = Math.min(1, (t - t0) / dur), v = Math.round(N * (1 - Math.pow(1 - u, 4)) / 100) * 100; el.textContent = T[state.lang].num(u < 1 ? v : N); if (u < 1) requestAnimationFrame(step); })(t0);
      }, { threshold: 0.6 }).observe(el);
    });
  }
  function lyric() {
    var l = $('#lyric'); if (!l) return;
    if (!MOTION) { l.classList.add('sung'); return; }
    new IntersectionObserver(function (e, io) { if (e[0].isIntersecting) { io.disconnect(); setTimeout(function () { l.classList.add('sung'); }, 300); } }, { threshold: 0.8 }).observe(l);
  }
  function neonLine() {
    $$('[data-neon]').forEach(function (el) {
      if (!MOTION) { el.classList.add('on'); return; }
      new IntersectionObserver(function (e, io) {
        if (!e[0].isIntersecting) return; io.disconnect();
        var t = 900, on = false; [0, 60, 50, 40, 90, 40, 160].forEach(function (ms) { t += ms; on = !on; (function (s) { setTimeout(function () { el.classList.toggle('on', s); }, t); })(on); });
        setTimeout(function () { el.classList.add('on'); }, t + 30);
      }, { threshold: 0.5 }).observe(el);
    });
  }
  function images() {
    $$('img[loading="lazy"]').forEach(function (im) {
      im.decoding = 'async';
      if (im.complete && im.naturalWidth) im.classList.add('in');
      else { im.addEventListener('load', function () { im.classList.add('in'); }, { once: true }); im.addEventListener('error', function () { im.classList.add('in'); }, { once: true }); }
    });
    window.addEventListener('load', function () {
      var go = function () { $$('img[loading="lazy"]').forEach(function (im) { im.loading = 'eager'; }); };
      if ('requestIdleCallback' in window) requestIdleCallback(go, { timeout: 3000 }); else setTimeout(go, 1500);
    });
  }
  function mapLoad() {
    var m = $('#map'); if (!m) return;
    $('.map-load', m).addEventListener('click', function () {
      var f = document.createElement('iframe'); f.src = m.getAttribute('data-src'); f.title = 'Map: World of Karaoke, La Guardiaweg 53'; f.loading = 'lazy'; f.referrerPolicy = 'no-referrer-when-downgrade';
      m.appendChild(f); m.classList.add('loaded');
    });
  }

  /* ---------------------------------------------------------------- sideways cocktails */
  function sideways() {
    var sec = $('#sip'), track = $('#sipTrack'), bar = $('#sipBar'); if (!sec || !track) return;
    if (!MOTION) { sec.classList.add('native'); return; }
    var dist = 0, top = 0, raf = 0, active = false, lastW = 0, cur = 0, tgt = 0, lastT = 0;
    var drinks = $$('.sip-drink', track).map(function (el) { return { el: el, img: $('img', el), c: 0, op: -1, px: 99 }; });
    function target() { return dist ? Math.min(1, Math.max(0, (window.scrollY - top) / dist)) : 0; }
    function measure() {
      lastW = window.innerWidth;
      dist = Math.max(0, track.scrollWidth - window.innerWidth);
      drinks.forEach(function (d) { var f = $('.sip-fig', d.el); d.c = d.el.offsetLeft + f.offsetLeft + f.offsetWidth / 2; d.op = -1; d.px = 99; });
      sec.style.height = (window.innerHeight + dist) + 'px';
      top = sec.getBoundingClientRect().top + window.scrollY;
      cur = tgt = target(); set();
    }
    function set() {
      track.style.transform = 'translate3d(' + (-cur * dist).toFixed(2) + 'px,0,0)';
      if (bar) bar.style.transform = 'scaleX(' + cur.toFixed(4) + ')';
      var vw = lastW || window.innerWidth, off = cur * dist;
      for (var i = 0; i < drinks.length; i++) {
        var d = drinks[i], x = (d.c - off - vw / 2) / vw;
        var op = Math.max(0.32, Math.min(1, 1 - (Math.abs(x) - 0.16) / 0.36));
        var px = Math.max(-1, Math.min(1, x * 1.6)) * -26;
        if (Math.abs(op - d.op) > 0.004) { d.el.style.opacity = op.toFixed(3); d.op = op; }
        if (d.img && Math.abs(px - d.px) > 0.15) { d.img.style.transform = 'translate3d(' + px.toFixed(1) + 'px,0,0)'; d.px = px; }
      }
    }
    function paint(t) {
      var dt = lastT ? Math.min(64, t - lastT) : 16.7; lastT = t;
      tgt = target();
      cur += (tgt - cur) * (1 - Math.pow(1 - 0.16, dt / 16.7));
      if (Math.abs(tgt - cur) * dist < 0.4) cur = tgt;
      set();
      raf = cur !== tgt ? requestAnimationFrame(paint) : 0;
      if (!raf) lastT = 0;
    }
    function onScroll() { if (active && !raf) raf = requestAnimationFrame(paint); }
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', function () { if (window.innerWidth !== lastW) measure(); });
    new IntersectionObserver(function (e) { active = e[0].isIntersecting; if (active) { top = sec.getBoundingClientRect().top + window.scrollY; onScroll(); } }, { rootMargin: '200px 0px' }).observe(sec);
    measure();
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(measure);
    window.addEventListener('load', measure);
    track.addEventListener('focusin', function (e) {
      var p = e.target.closest('.sip-panel'); if (!p) return;
      window.scrollTo({ top: top + Math.min(dist, p.offsetLeft), behavior: 'auto' });
    });
  }

  /* ------------------------------------------------------------------ wiring */
  function init() {
    var LD = loader();
    if (!state.day) state.day = defaultDay();
    if (!state.room) state.room = firstFit();
    applyLang(); renderDays(); buildWall(); renderMenu();
    update(); renderOpen();
    setInterval(renderOpen, 60000);
    menu();

    // people steppers shared by the hero finder, the room finder and the home teaser
    $$('[data-step]').forEach(function (b) { b.addEventListener('click', function () { setPeople(state.people + parseInt(b.getAttribute('data-step'), 10)); }); });
    $$('#people,#people2').forEach(function (inp) {
      inp.addEventListener('change', function () { setPeople(inp.value, 'force'); });
      inp.addEventListener('focus', function () { inp.select(); });
    });
    // group calculator stepper (2 to 140)
    $$('[data-gstep]').forEach(function (b) { b.addEventListener('click', function () { state.gpeople = clamp(state.gpeople + parseInt(b.getAttribute('data-gstep'), 10), 2, 140); renderCalc(); persist(); }); });
    var gp = $('#gpeople');
    if (gp) { gp.addEventListener('change', function () { state.gpeople = clamp(parseInt(gp.value, 10), 2, 140); renderCalc(); persist(); }); gp.addEventListener('focus', function () { gp.select(); }); }
    var cb = $('#calcBox'); if (cb) cb.addEventListener('submit', function (e) { e.preventDefault(); });

    document.addEventListener('change', function (ev) {
      var t = ev.target; if (t && t.matches && t.matches('.days input')) { state.day = t.value; update({ day: true }); }
    });
    var quick = $('#quick');
    if (quick) quick.addEventListener('submit', function (ev) { ev.preventDefault(); location.href = roomsUrl() + '#finder'; });

    if (wall) {
      wall.addEventListener('animationend', function (ev) { var b = ev.target.closest && ev.target.closest('.csign'); if (b) b.classList.remove('surge'); });
      wall.addEventListener('click', function (ev) {
        var b = ev.target.closest('.csign'); if (!b) return;
        if (wall.hasAttribute('data-link')) { location.href = roomsUrl('room=' + b.getAttribute('data-room')) + '#finder'; return; }
        state.room = b.getAttribute('data-room'); state.sess = null; renderWall(); renderPanel();
        if (window.matchMedia('(max-width:1040px)').matches) panel.scrollIntoView({ behavior: MOTION ? 'smooth' : 'auto', block: 'nearest' });
      });
    }
    if (panel) panel.addEventListener('click', function (ev) {
      if (ev.target.closest('[data-first]')) { state.room = firstFit(); state.sess = null; renderWall(); renderPanel(); return; }
      var sb = ev.target.closest('[data-sess]');
      if (sb) { var k = +sb.getAttribute('data-sess'); state.sess = state.sess === k ? null : k; renderPanel(); var nb = $('[data-sess="' + k + '"]', panel); if (nb) nb.focus(); }
    });
    $$('.gcard').forEach(function (g) {
      g.addEventListener('click', function () {
        var r = BYID[g.getAttribute('data-goroom')]; if (!r) return;
        state.room = r.id; state.sess = null; if (!fits(r, state.people)) { state.people = r.min; update({ people: true }); } else { renderWall(); renderPanel(); }
        $('#finder').scrollIntoView({ behavior: MOTION ? 'smooth' : 'auto', block: 'start' });
      });
    });

    $$('[data-lang]').forEach(function (lb) {
      lb.addEventListener('click', function () {
        state.lang = state.lang === 'en' ? 'nl' : 'en';
        try { localStorage.setItem('wok_lang', state.lang); } catch (e) {}
        applyLang(true); renderDays(); buildWall(); renderMenu(); update(); renderOpen();
        $$('[data-count]').forEach(function (el) { el.textContent = T[state.lang].num(+el.getAttribute('data-count')); });
        nwVisible.clear(); $$('.nw').forEach(function (n) { if (nwIO) nwIO.observe(n); });
      });
    });

    // nav background, mobile booking dock
    var nav = $('#nav'), dock = $('#dock'), head = $('.hero, .phero'), outro = $('.outro'), pastHead = false, atOutro = false;
    function onScroll() { nav.classList.toggle('solid', window.scrollY > 40); }
    window.addEventListener('scroll', onScroll, { passive: true }); onScroll();
    function dockState() { var s = pastHead && !atOutro; dock.classList.toggle('show', s); dock.setAttribute('aria-hidden', s ? 'false' : 'true'); $('a', dock).tabIndex = s ? 0 : -1; }
    if ('IntersectionObserver' in window) {
      if (head) new IntersectionObserver(function (e) { pastHead = !e[0].isIntersecting; dockState(); }, { rootMargin: '-40% 0px 0px 0px' }).observe(head);
      if (outro) new IntersectionObserver(function (e) { atOutro = e[0].isIntersecting; dockState(); }, { threshold: 0.25 }).observe(outro);
      if (wall) new IntersectionObserver(function (e, io) {
        if (!e[0].isIntersecting) return; io.disconnect(); wallSeen = true;
        $$('.csign.fit', wall).forEach(function (b, i) { var seq = SEQS[i % SEQS.length].slice(); seq[0] += 420 + i * 90; b.classList.remove('dip'); flick(b, 'dip', seq); });
      }, { threshold: 0.12, rootMargin: '0px 0px -15% 0px' }).observe(wall);
      if (setlist) new IntersectionObserver(function (e, io) {
        if (!e[0].isIntersecting) return; io.disconnect(); tagsSeen = true;
        $$('.tag.neon', setlist).forEach(function (el, i) { var seq = SEQS[i % SEQS.length].slice(); seq[0] += 80 + i * 70; flick(el, 'dip', seq); });
      }, { threshold: 0.12 }).observe(setlist);
    } else { wallSeen = true; $$('.dip').forEach(function (n) { n.classList.remove('dip'); }); tagsSeen = true; }

    if (sign) sign.addEventListener('click', switchSign);
    heroVideo(); neonWords(LD); buttons(); taps(); countUp(); lyric(); neonLine(); images(); mapLoad(); sideways();

    if (state.room && Q.get('room') && $('#finder') && location.hash !== '#finder') { setTimeout(function () { $('#finder').scrollIntoView({ block: 'start' }); }, 50); }
    if (sign) {
      if (document.fonts && document.fonts.ready) { var started = false; var st = function () { if (!started) { started = true; setTimeout(ignite, LD); } }; document.fonts.ready.then(st); setTimeout(st, 900); } else ignite();
    }
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
