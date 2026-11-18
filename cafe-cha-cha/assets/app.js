/* Café CHA CHA concept, by Dolcessi */
(function () {
  'use strict';
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var root = document.documentElement;
  var MOTION = root.classList.contains('mo');
  var NL = window.CC_NL || {};
  var lang = 'en';
  try { if (localStorage.getItem('cc_lang') === 'nl') lang = 'nl'; } catch (e) {}
  function seen(el, fn, opt) { if (!el) return; if (!('IntersectionObserver' in window)) { fn(true); return; } new IntersectionObserver(function (e) { fn(e[0].isIntersecting); }, opt || {}).observe(el); }

  /* ---------------------------------------------------------------- time on the Rokin */
  // Sun–Wed 11:00–22:00, Thu–Sat 11:00–01:00 (cafechacha.nl). Karaoke Wed–Sun from 21:00.
  var OPEN = { 0: [11, 22], 1: [11, 22], 2: [11, 22], 3: [11, 22], 4: [11, 25], 5: [11, 25], 6: [11, 25] };
  var KARAOKE = { 0: 1, 3: 1, 4: 1, 5: 1, 6: 1 };
  var KSTART = 21 * 60;
  function ams() {
    var parts = {}, now = new Date();
    try {
      new Intl.DateTimeFormat('en-GB', { timeZone: 'Europe/Amsterdam', weekday: 'short', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false })
        .formatToParts(now).forEach(function (p) { parts[p.type] = p.value; });
      return { d: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].indexOf(parts.weekday), m: (parseInt(parts.hour, 10) % 24) * 60 + parseInt(parts.minute, 10), s: parseInt(parts.second, 10) || 0 };
    } catch (e) { return { d: now.getDay(), m: now.getHours() * 60 + now.getMinutes(), s: now.getSeconds() }; }
  }
  function hh(h) { h = h % 24; return (h < 10 ? '0' : '') + h + ':00'; }
  function pad(n) { return (n < 10 ? '0' : '') + n; }
  var T = {
    en: {
      loc: 'en-GB',
      days: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
      openUntil: function (t) { return ['Open now', ', until ' + t]; },
      opensToday: function (t) { return ['Closed', ', opens today at ' + t]; },
      opensTomorrow: function (t) { return ['Closed', ', opens tomorrow at ' + t]; },
      hero: {
        before: ['See you at 11:00.', 'Lunch, dinner and drinks on the Rokin, with the trams going past the window.'],
        lunch: ['Lunch on the Rokin.', 'Club sandwiches, Caesar salad and fresh mint tea, a few minutes from Dam Square.'],
        afternoon: ['An afternoon on the terrace.', 'A spritz, bitterballen and the Rokin going by. The terrace has heaters for the cooler days.'],
        dinner: ['Dinner and drinks on the Rokin.', 'Entrecôte and spareribs from the grill, then a cocktail at the bar.'],
        karaoke: ['Free karaoke tonight.', 'From 21:00 the café sings. Cocktails at the bar, the mic is free.'],
        late: ['One more round?', 'Espresso martinis, gin and tonics and €5 shots at the bar.'],
        closed: ['Closed for tonight.', 'Back tomorrow from 11:00 for lunch, dinner and drinks.']
      },
      today: { karaokeOn: 'on now', karaokeTonight: 'tonight from 21:00', karaokeNext: function (d) { return 'back ' + d; } },
      ka: {
        on: function (t) { return 'Karaoke is on now, until ' + t; },
        tonight: 'Free karaoke tonight from 21:00',
        tomorrow: 'Free karaoke tomorrow from 21:00',
        next: function (d) { return 'Next free karaoke: ' + d + ' from 21:00'; },
        startsIn: 'Starts in',
        inDays: function (n, h) { return 'in ' + n + (n === 1 ? ' day' : ' days') + (h ? ', ' + h + (h === 1 ? ' hour' : ' hours') : ''); },
        countLine: function (t) { return 'The mic opens in ' + t; },
        onLine: 'The mic is open. Come and sing.'
      },
      lines: ['Grab the mic, gather your friends.', 'Everybody sings, nobody judges.', 'The Rokin can hear you tonight.', 'One more song, then one more round.'],
      cheers: ['The room is with you.', 'Encore!', 'One more song!', 'The Rokin heard that.'],
      voice: { on: 'Stop the microphone', off: 'Use my microphone', fail: 'No microphone here. Hold the button instead.' },
      pv: {
        note: function (n) { return '€20 × ' + n + ' people, paid in advance. The karaoke is yours alone.'; },
        small: 'From 20 people. Smaller groups join the free karaoke.',
        subject: function (n) { return 'Private karaoke for ' + n + ' people'; },
        body: function (n) { return 'Hello Café CHA CHA,\n\nWe would like to have the karaoke to ourselves with ' + n + ' people.\nWhich dates are possible, and how do we pay in advance?\n\nThank you!\n\n'; }
      },
      moodOut: function (n, m, list) { return n + (n === 1 ? ' cocktail is ' : ' cocktails are ') + m.toLowerCase() + ': ' + list + '.'; },
      moods: { refreshing: 'Refreshing', citrusy: 'Citrusy', sweet: 'Sweet', bittersweet: 'Bittersweet', strong: 'Strong' },
      occ: { birthday: 'a birthday', company: 'a company lunch or dinner', drinks: 'drinks', party: 'a private party', presentation: 'a presentation', karaoke: 'private karaoke' },
      part: { lunch: 'lunch', dinner: 'dinner', evening: 'evening drinks' },
      company: { lunch: 'a company lunch', dinner: 'a company dinner' },
      pl: {
        subject: function (o, p) { return 'Group request: ' + o + ' for ' + p + ' people'; },
        body: function (o, p, d, part) { return 'Hello Café CHA CHA,\n\nWe would like to come with ' + p + ' people for ' + o + (part ? ' (' + part + ')' : '') + (d ? ' on ' + d : '') + '.\nCould you let us know if that is possible, and send a proposal?\n\nThank you!\n\n'; },
        seat52: 'Up to 52 sit downstairs; with the upstairs too, the café seats 80.',
        seat80: 'Seated, the café fits 80 across both floors. For drinks or a party it takes up to 100.',
        over100: 'The café takes up to 100 guests. Call to talk it through: +31 6 266 325 34.',
        drinks100: 'Drinks and parties: up to 100 guests, part of the café or all of it.',
        kSmall: 'Private karaoke is for groups of 20 or more. Free karaoke runs Wednesday to Sunday from 21:00.',
        kPrice: function (p) { return 'Private karaoke for ' + p + ': €20 × ' + p + ' = €' + (20 * p).toLocaleString('en-GB') + ', paid in advance.'; },
        ok: function (p) { return 'A table for ' + p + ' fits fine. The email asks the team for a proposal.'; }
      },
      langLabel: 'Schakel naar Nederlands'
    },
    nl: {
      loc: 'nl-NL',
      days: ['zondag', 'maandag', 'dinsdag', 'woensdag', 'donderdag', 'vrijdag', 'zaterdag'],
      openUntil: function (t) { return ['Nu open', ', tot ' + t]; },
      opensToday: function (t) { return ['Gesloten', ', vandaag open vanaf ' + t]; },
      opensTomorrow: function (t) { return ['Gesloten', ', morgen open vanaf ' + t]; },
      hero: {
        before: ['Vanaf 11:00 weer open.', 'Lunch, diner en drankjes aan het Rokin, met de trams langs het raam.'],
        lunch: ['Lunch aan het Rokin.', 'Clubsandwiches, Caesar salad en verse muntthee, op een paar minuten van de Dam.'],
        afternoon: ['Een middag op het terras.', 'Een spritz, bitterballen en het Rokin dat voorbijkomt. Het terras heeft heaters voor de koelere dagen.'],
        dinner: ['Diner en drankjes aan het Rokin.', 'Entrecôte en spareribs van de grill, daarna een cocktail aan de bar.'],
        karaoke: ['Vanavond gratis karaoke.', 'Vanaf 21:00 zingt het café. Cocktails aan de bar, de microfoon is gratis.'],
        late: ['Nog eentje?', 'Espresso martini\'s, gin-tonics en shots van €5 aan de bar.'],
        closed: ['Voor vandaag gesloten.', 'Morgen vanaf 11:00 weer open voor lunch, diner en drankjes.']
      },
      today: { karaokeOn: 'nu bezig', karaokeTonight: 'vanavond vanaf 21:00', karaokeNext: function (d) { return 'weer op ' + d; } },
      ka: {
        on: function (t) { return 'Nu karaoke, tot ' + t; },
        tonight: 'Vanavond gratis karaoke vanaf 21:00',
        tomorrow: 'Morgen gratis karaoke vanaf 21:00',
        next: function (d) { return 'Volgende gratis karaoke: ' + d + ' vanaf 21:00'; },
        startsIn: 'Begint over',
        inDays: function (n, h) { return 'over ' + n + (n === 1 ? ' dag' : ' dagen') + (h ? ', ' + h + ' uur' : ''); },
        countLine: function (t) { return 'De microfoon gaat open over ' + t; },
        onLine: 'De microfoon is open. Kom zingen.'
      },
      lines: ['Pak de microfoon, haal je vrienden erbij.', 'Iedereen zingt, niemand oordeelt.', 'Het Rokin hoort je vanavond.', 'Nog één nummer, dan nog één rondje.'],
      cheers: ['De zaal is met je.', 'Encore!', 'Nog één nummer!', 'Het Rokin hoorde dat.'],
      voice: { on: 'Stop de microfoon', off: 'Gebruik mijn microfoon', fail: 'Geen microfoon gevonden. Houd de knop ingedrukt.' },
      pv: {
        note: function (n) { return '€20 × ' + n + ' personen, vooraf te betalen. De karaoke is helemaal van jullie.'; },
        small: 'Vanaf 20 personen. Kleinere groepen doen mee met de gratis karaoke.',
        subject: function (n) { return 'Besloten karaoke voor ' + n + ' personen'; },
        body: function (n) { return 'Hallo Café CHA CHA,\n\nWe willen graag de karaoke voor onszelf met ' + n + ' personen.\nWelke datums zijn mogelijk, en hoe betalen we vooraf?\n\nAlvast bedankt!\n\n'; }
      },
      moodOut: function (n, m, list) { return n + (n === 1 ? ' cocktail is ' : ' cocktails zijn ') + m.toLowerCase() + ': ' + list + '.'; },
      moods: { refreshing: 'Verfrissend', citrusy: 'Citrusachtig', sweet: 'Zoet', bittersweet: 'Bitterzoet', strong: 'Sterk' },
      occ: { birthday: 'een verjaardag', company: 'een bedrijfslunch of -diner', drinks: 'een borrel', party: 'een besloten feest', presentation: 'een presentatie', karaoke: 'besloten karaoke' },
      part: { lunch: 'lunch', dinner: 'diner', evening: 'avondborrel' },
      company: { lunch: 'een bedrijfslunch', dinner: 'een bedrijfsdiner' },
      pl: {
        subject: function (o, p) { return 'Groepsaanvraag: ' + o + ' voor ' + p + ' personen'; },
        body: function (o, p, d, part) { return 'Hallo Café CHA CHA,\n\nWe willen graag met ' + p + ' personen komen voor ' + o + (part ? ' (' + part + ')' : '') + (d ? ' op ' + d : '') + '.\nKunnen jullie laten weten of dat kan, en een voorstel sturen?\n\nAlvast bedankt!\n\n'; },
        seat52: 'Beneden zitten tot 52 personen; met boven erbij biedt het café plek aan 80.',
        seat80: 'Zittend past het café 80 personen over twee verdiepingen. Voor een borrel of feest tot 100.',
        over100: 'Het café biedt plek aan maximaal 100 gasten. Bel om het te bespreken: +31 6 266 325 34.',
        drinks100: 'Borrels en feesten: tot 100 gasten, in een deel van het café of het hele café.',
        kSmall: 'Besloten karaoke is voor groepen vanaf 20 personen. Gratis karaoke is er woensdag tot en met zondag vanaf 21:00.',
        kPrice: function (p) { return 'Besloten karaoke voor ' + p + ': €20 × ' + p + ' = €' + (20 * p).toLocaleString('nl-NL') + ', vooraf te betalen.'; },
        ok: function (p) { return 'Een tafel voor ' + p + ' past prima. De mail vraagt het team om een voorstel.'; }
      },
      langLabel: 'Switch to English'
    }
  };
  function L() { return T[lang]; }

  function status() {
    var n = ams(), o = OPEN[n.d], y = OPEN[(n.d + 6) % 7];
    if (y[1] > 24 && n.m < (y[1] - 24) * 60) return { open: true, text: L().openUntil(hh(y[1])), d: (n.d + 6) % 7, m: n.m + 1440 };
    if (n.m >= o[0] * 60 && n.m < Math.min(o[1], 24) * 60 + (o[1] > 24 ? 999 : 0)) return { open: true, text: L().openUntil(hh(o[1])), d: n.d, m: n.m };
    if (n.m < o[0] * 60) return { open: false, text: L().opensToday(hh(o[0])), d: n.d, m: n.m, before: true };
    return { open: false, text: L().opensTomorrow(hh(OPEN[(n.d + 1) % 7][0])), d: n.d, m: n.m };
  }
  function renderStatus() {
    var s = status();
    $$('[data-status]').forEach(function (el) { el.setAttribute('data-open', s.open ? '1' : '0'); });
    $$('[data-status-text]').forEach(function (el) { el.textContent = ''; var a = document.createElement('span'), b = document.createElement('span'); a.textContent = s.text[0]; b.textContent = s.text[1]; b.className = 'st-d'; el.appendChild(a); el.appendChild(b); });
    var d = ams().d;
    $$('.hours tr').forEach(function (tr) { tr.classList.toggle('today', +tr.getAttribute('data-d') === d); });
    $$('.wk li').forEach(function (li) { li.classList.toggle('today', +li.getAttribute('data-d') === d); });
    return s;
  }

  /* karaoke: on now, tonight, or when next */
  function kState() {
    var n = ams(), now = n.m * 60 + n.s, y = (n.d + 6) % 7;
    if (KARAOKE[y] && OPEN[y][1] > 24 && n.m < (OPEN[y][1] - 24) * 60) return { live: true, until: OPEN[y][1] };
    if (KARAOKE[n.d] && n.m >= KSTART && n.m < OPEN[n.d][1] * 60) return { live: true, until: OPEN[n.d][1] };
    for (var k = 0; k < 8; k++) {
      var day = (n.d + k) % 7;
      if (KARAOKE[day] && (k > 0 || n.m < KSTART)) return { live: false, k: k, day: day, secs: k * 86400 + KSTART * 60 - now };
    }
  }
  function kCount(st) {
    if (st.secs < 86400) { var s = st.secs, h = Math.floor(s / 3600), m = Math.floor(s % 3600 / 60); return pad(h) + ':' + pad(m) + ':' + pad(s % 60); }
    return L().ka.inDays(Math.floor(st.secs / 86400), Math.floor(st.secs % 86400 / 3600));
  }
  function renderKaraoke() {
    var st = kState(), K = L().ka;
    var when = st.live ? K.on(hh(st.until)) : st.k === 0 ? K.tonight : st.k === 1 ? K.tomorrow : K.next(L().days[st.day]);
    $$('[data-ka-when]').forEach(function (el) { el.textContent = when; });
    $$('[data-ka-live]').forEach(function (el) { el.classList.toggle('live', st.live); });
    $$('[data-ka-count]').forEach(function (el) {
      var big = el.classList.contains('kp-count');
      if (st.live) { el.textContent = big ? '' : K.onLine; return; }
      var c = kCount(st);
      if (big) { el.innerHTML = ''; var sm = document.createElement('small'); sm.textContent = K.startsIn; el.appendChild(sm); el.appendChild(document.createTextNode(c)); }
      else el.textContent = K.countLine(c);
    });
    return st;
  }

  /* ---------------------------------------------------------------- hero follows the clock */
  function heroPeriod(s) {
    if (!s.open) return s.before ? 'before' : 'closed';
    var m = s.m;
    if (m < 15 * 60) return 'lunch';
    if (m < 17 * 60) return 'afternoon';
    if (m < 21 * 60) return 'dinner';
    if (KARAOKE[s.d]) return 'karaoke';
    return 'late';
  }
  var SHOT = { before: 'day', lunch: 'day', afternoon: 'day', dinner: 'eve', karaoke: 'night', late: 'night', closed: 'night' };
  function renderHero(s) {
    var hero = $('.hero'); if (!hero) return;
    var p = heroPeriod(s), copy = L().hero[p], shot = SHOT[p];
    $('[data-hero-line]').textContent = copy[0];
    $('[data-hero-sub]').textContent = copy[1];
    renderToday();
    if (hero.getAttribute('data-when') === shot) return;
    hero.setAttribute('data-when', shot);
    $$('.hero-media picture').forEach(function (pic) {
      var on = pic.getAttribute('data-shot') === shot;
      if (on) {
        $$('source[data-srcset]', pic).forEach(function (n) { n.srcset = n.getAttribute('data-srcset'); n.removeAttribute('data-srcset'); });
        var im = $('img', pic);
        if (im.hasAttribute('data-src')) { im.srcset = im.getAttribute('data-srcset'); im.src = im.getAttribute('data-src'); im.removeAttribute('data-src'); im.removeAttribute('data-srcset'); im.fetchPriority = 'high'; }
      }
      pic.hidden = !on;
    });
  }
  function renderToday() {
    var dEl = $('[data-today-date]'); if (!dEl) return;
    var n = ams(), o = OPEN[n.d], st = kState(), Td = L().today;
    try { dEl.textContent = new Intl.DateTimeFormat(L().loc, { timeZone: 'Europe/Amsterdam', weekday: 'long', day: 'numeric', month: 'long' }).format(new Date()); } catch (e) { dEl.textContent = L().days[n.d]; }
    $('[data-today-hours]').textContent = hh(o[0]) + ' – ' + hh(o[1]);
    $('[data-today-karaoke]').textContent = st.live ? Td.karaokeOn : st.k === 0 ? Td.karaokeTonight : Td.karaokeNext(L().days[st.day]);
  }

  /* ---------------------------------------------------------------- i18n */
  var EN = {};
  function applyLang() {
    var nl = lang === 'nl';
    root.lang = lang;
    $$('[data-i18n]').forEach(function (el) {
      var k = el.getAttribute('data-i18n'); if (!(k in EN)) EN[k] = el.textContent;
      el.textContent = nl && NL[k] ? NL[k] : EN[k];
    });
    $$('[data-i18n-html]').forEach(function (el) {
      var k = el.getAttribute('data-i18n-html'); if (!(('h:' + k) in EN)) EN['h:' + k] = el.innerHTML;
      el.innerHTML = nl && NL[k] ? NL[k] : EN['h:' + k];
    });
    $$('[data-lang]').forEach(function (b) { b.setAttribute('aria-label', L().langLabel); b.children[0].classList.toggle('on', !nl); b.children[1].classList.toggle('on', nl); });
    var s = renderStatus(); renderHero(s); renderKaraoke(); renderMood(); renderPlan(); renderRoom(); stage.lang();
    var v = $('[data-voice-label]'); if (v) v.textContent = stage.voiceOn() ? L().voice.on : L().voice.off;
  }

  /* ---------------------------------------------------------------- menu card */
  function card() {
    var b = $('#burger'), c = $('#card'), v = $('#veil'); if (!b || !c) return;
    c.hidden = false; v.hidden = false; c.inert = true;
    function open() { c.inert = false; c.classList.add('open'); v.classList.add('open'); b.setAttribute('aria-expanded', 'true'); root.classList.add('card-open'); setTimeout(function () { var f = $('.card-list a', c); if (f) f.focus({ preventScroll: true }); }, MOTION ? 320 : 0); }
    function close(nf) { c.classList.remove('open'); v.classList.remove('open'); b.setAttribute('aria-expanded', 'false'); root.classList.remove('card-open'); c.inert = true; if (!nf) b.focus(); }
    b.addEventListener('click', function () { if (c.classList.contains('open')) close(); else open(); });
    v.addEventListener('click', function () { close(); });
    document.addEventListener('keydown', function (e) {
      if (!c.classList.contains('open')) return;
      if (e.key === 'Escape') { close(); return; }
      if (e.key === 'Tab') {
        var f = $$('a,button', c), i = f.indexOf(document.activeElement);
        if (e.shiftKey && i <= 0) { e.preventDefault(); f[f.length - 1].focus(); }
        else if (!e.shiftKey && i === f.length - 1) { e.preventDefault(); f[0].focus(); }
      }
    });
    $$('.card-list a', c).forEach(function (a) { a.addEventListener('click', function (e) { if (a.hasAttribute('aria-current')) { e.preventDefault(); close(true); window.scrollTo({ top: 0, behavior: MOTION ? 'smooth' : 'auto' }); } }); });
  }

  /* ---------------------------------------------------------------- gold leaf: the light runs across now and then */
  function shine() {
    var run = document.getElementById('shineRun');
    if (!MOTION || !run || !$('.logo.gilt') || !run.beginElement) return;
    setTimeout(function () { try { run.beginElement(); } catch (e) {} }, 2300);
    // only spend the paint while a gilded logo is on screen
    var defs = run.ownerSVGElement, on = {}, gilt = $$('.logo.gilt');
    gilt.forEach(function (g, i) { seen(g, function (v) { on[i] = v; var any = gilt.some(function (x, j) { return on[j]; }); try { if (any) defs.unpauseAnimations(); else defs.pauseAnimations(); } catch (e) {} }); });
  }

  /* ---------------------------------------------------------------- the day: a café clock turns from 11:00 to 23:00 */
  function day() {
    var sec = $('#day'); if (!sec) return;
    var panels = $$('.hour', sec), read = $('#clock'), ticks = $$('.ticks li', sec);
    var hH = $('.cc-h', sec), hM = $('.cc-m', sec), sun = $('.cc-sun', sec), moon = $('.cc-moon', sec), dusk = $('.cc-dusk', sec), night = $('.cc-night', sec), stars = $('.cc-stars', sec);
    var TIMES = [660, 900, 1080, 1260, 1380];
    var target = 660, cur = 660, shown = '', active = -1, raf = 0, inView = false, centers = [];
    function measure() { centers = panels.map(function (p) { var r = p.getBoundingClientRect(); return r.top + window.scrollY + r.height / 2; }); }
    function aim() {
      var y = window.scrollY + window.innerHeight * 0.5, f = 0;
      if (!centers.length || y <= centers[0]) f = 0; else if (y >= centers[centers.length - 1]) f = centers.length - 1;
      else for (var i = 0; i < centers.length - 1; i++) if (y < centers[i + 1]) { f = i + (y - centers[i]) / (centers[i + 1] - centers[i]); break; }
      var i0 = Math.floor(f), t = f - i0;
      // hold on each hour for a moment, then move on
      t = t < 0.18 ? 0 : t > 0.82 ? 1 : (t - 0.18) / 0.64; t = t * t * (3 - 2 * t);
      target = i0 >= TIMES.length - 1 ? TIMES[TIMES.length - 1] : TIMES[i0] + (TIMES[i0 + 1] - TIMES[i0]) * t;
      var a = Math.round(f); if (a !== active) { active = a; ticks.forEach(function (li, j) { li.classList.toggle('on', j === a); }); }
    }
    function paint(m) {
      hH.style.transform = 'rotate(' + (m / 2).toFixed(2) + 'deg)';
      hM.style.transform = 'rotate(' + (m * 6).toFixed(2) + 'deg)';
      // the day/night window: sun rises over the dial, sets after 18:00, the moon follows
      // the day/night window: the sun crosses the Rokin and sets behind the houses, then the moon comes up
      function cl(v) { return Math.max(0, Math.min(1, v)); }
      sun.style.transform = 'rotate(' + (-58 + (m - 660) / 480 * 148).toFixed(2) + 'deg)';
      moon.style.transform = 'rotate(' + (m < 1140 ? -110 : -92 + (m - 1140) / 240 * 118).toFixed(2) + 'deg)';
      var du = cl((m - 1000) / 90) * (1 - cl((m - 1150) / 80)), ni = cl((m - 1130) / 100);
      dusk.setAttribute('opacity', du.toFixed(3)); night.setAttribute('opacity', ni.toFixed(3)); stars.setAttribute('opacity', cl((m - 1170) / 70).toFixed(3));
      var r = Math.round(m / 5) * 5, str = pad(Math.floor(r / 60) % 24) + ':' + pad(r % 60);
      if (str !== shown) { shown = str; read.textContent = str; }
    }
    function frame() {
      raf = 0;
      cur += (target - cur) * (MOTION ? 0.14 : 1);
      if (Math.abs(target - cur) < 0.05) cur = target;
      paint(cur);
      if (cur !== target) raf = requestAnimationFrame(frame);
    }
    function req() { aim(); if (inView && !raf) raf = requestAnimationFrame(frame); }
    window.addEventListener('scroll', req, { passive: true });
    window.addEventListener('resize', function () { measure(); req(); });
    window.addEventListener('load', function () { measure(); req(); });
    seen(sec, function (v) { inView = v; if (v) { measure(); req(); } }, { rootMargin: '100px 0px' });
    measure(); aim(); cur = target; paint(cur);
  }

  /* ---------------------------------------------------------------- the karaoke line in the day */
  function prompters() {
    $$('.prompter:not([data-lines])').forEach(function (p) {
      var words = $$('span', p), timer = null, k = 0;
      if (!MOTION) { words.forEach(function (w) { w.classList.add('sung'); }); return; }
      function tick() {
        if (k < words.length) { words[k].classList.add('sung'); k++; timer = setTimeout(tick, k === words.length ? 1600 : 420); }
        else { words.forEach(function (w) { w.classList.remove('sung'); }); k = 0; timer = setTimeout(tick, 500); }
      }
      seen(p, function (v) { if (v) { if (!timer) tick(); } else { clearTimeout(timer); timer = null; } }, { threshold: 0.6 });
    });
  }

  /* ---------------------------------------------------------------- the back bar */
  var mood = null;
  function fillDetail(btn) {
    var sec = btn.closest('.bar'), box = sec && $('.bar-detail', sec); if (!box) return;
    var info = {}; try { info = JSON.parse(btn.getAttribute('data-info')); } catch (e) {}
    ['n', 't', 'i', 'o', 'p'].forEach(function (k) { var el = $('[data-bd="' + k + '"]', box); if (el) el.textContent = info[k] || ''; });
    box.classList.remove('swap'); void box.offsetWidth; box.classList.add('swap');
  }
  function pick(btn) {
    var shelf = btn.closest('.shelf');
    $$('.g-b', shelf).forEach(function (b) { b.setAttribute('aria-pressed', b === btn ? 'true' : 'false'); });
    fillDetail(btn);
  }
  function renderMood() {
    $$('[data-glasses]').forEach(function (shelf) {
      var hits = [], first = null;
      $$('.g', shelf).forEach(function (g) {
        var hit = !!mood && g.getAttribute('data-moods').split(' ').indexOf(mood) > -1;
        g.classList.toggle('hit', hit); if (hit) { hits.push($('.g-n', g).textContent); if (!first) first = $('.g-b', g); }
      });
      shelf.classList.toggle('filtering', !!mood);
      var sec = shelf.closest('section'), out = sec && $('[data-mood-out]', sec);
      if (out) out.textContent = mood ? L().moodOut(hits.length, L().moods[mood], hits.join(', ')) : '';
      var cur = $('.g-b[aria-pressed="true"]', shelf);
      if (mood && first && cur && !cur.closest('.g').classList.contains('hit')) pick(first);
    });
    $$('[data-mood]').forEach(function (b) { b.setAttribute('aria-pressed', b.getAttribute('data-mood') === mood ? 'true' : 'false'); });
  }
  function bar() {
    $$('[data-mood]').forEach(function (b) { b.addEventListener('click', function () { var m = b.getAttribute('data-mood'); mood = mood === m ? null : m; renderMood(); }); });
    $$('.shelf').forEach(function (shelf) {
      $$('.g-b', shelf).forEach(function (b) { b.addEventListener('click', function () { pick(b); }); });
      if (!MOTION) { shelf.classList.add('poured'); return; }
      var done = false;
      seen(shelf, function (v) { if (v && !done) { done = true; setTimeout(function () { shelf.classList.add('poured'); }, 150); } }, { threshold: 0.35 });
    });
  }

  /* ---------------------------------------------------------------- the karaoke stage */
  var stage = (function () {
    var api = { lang: function () {}, voiceOn: function () { return false; } };
    var st = $('#stage'), mic = $('#mic'); if (!st || !mic) return api;
    var lineEl = $('[data-lines]', st), bar = $('.ka-bar i', st), meter = $('.meter i', st), cheer = $('[data-cheer]', st), vbtn = $('#voice'), vlabel = $('[data-voice-label]', st);
    var held = false, heat = 0, raf = 0, line = 0, words = [], sung = 0, nextAt = 0, pauseTill = 0, voice = null, vlevel = 0, lastCheer = 0, idleT = null;
    function setLine(i) {
      line = i % L().lines.length; sung = 0;
      lineEl.innerHTML = '';
      words = L().lines[line].split(' ').map(function (w, j) { var s = document.createElement('span'); s.textContent = w; lineEl.appendChild(s); if (j < L().lines[line].split(' ').length - 1) lineEl.appendChild(document.createTextNode(' ')); return s; });
      bar.style.transform = 'scaleX(0)';
    }
    api.lang = function () { setLine(line); cheer.textContent = ''; if (vlabel) vlabel.textContent = voice ? L().voice.on : L().voice.off; };
    api.voiceOn = function () { return !!voice; };
    function loop(t) {
      raf = 0;
      if (voice) {
        voice.an.getFloatTimeDomainData(voice.buf);
        var sum = 0; for (var i = 0; i < voice.buf.length; i++) sum += voice.buf[i] * voice.buf[i];
        var rms = Math.sqrt(sum / voice.buf.length);
        vlevel += (Math.min(1, rms * 9) - vlevel) * 0.3;
      }
      var target = held ? 1 : voice ? vlevel : 0;
      heat += (target - heat) * (target > heat ? 0.09 : 0.04);
      meter.style.transform = 'scaleX(' + heat.toFixed(3) + ')';
      st.classList.toggle('live', heat > 0.22);
      if (heat > 0.25 && t > pauseTill && t > nextAt) {
        if (sung < words.length) { words[sung].classList.add('sung'); sung++; bar.style.transform = 'scaleX(' + (sung / words.length).toFixed(3) + ')'; nextAt = t + 460 - heat * 220; }
        else { pauseTill = t + 700; setTimeout(function () { setLine(line + 1); }, 650); nextAt = t + 900; }
        if (heat > 0.85 && t - lastCheer > 3800) { lastCheer = t; var c = L().cheers; cheer.textContent = c[Math.floor(Math.random() * c.length)]; clearTimeout(idleT); idleT = setTimeout(function () { cheer.textContent = ''; }, 2600); }
      }
      if (held || voice || heat > 0.01) raf = requestAnimationFrame(loop);
      else { heat = 0; meter.style.transform = 'scaleX(0)'; st.classList.remove('live'); }
    }
    function go() { if (!raf) raf = requestAnimationFrame(loop); }
    function down(e) { if (e && e.button > 0) return; held = true; mic.classList.add('held'); go(); }
    function up() { if (!held) return; held = false; mic.classList.remove('held'); }
    mic.addEventListener('pointerdown', function (e) { e.preventDefault(); try { mic.setPointerCapture(e.pointerId); } catch (x) {} down(e); });
    mic.addEventListener('pointerup', up); mic.addEventListener('pointercancel', up); mic.addEventListener('lostpointercapture', up);
    mic.addEventListener('contextmenu', function (e) { e.preventDefault(); });
    mic.addEventListener('keydown', function (e) { if ((e.key === ' ' || e.key === 'Enter') && !e.repeat) { e.preventDefault(); down(); } });
    mic.addEventListener('keyup', function (e) { if (e.key === ' ' || e.key === 'Enter') up(); });
    mic.addEventListener('blur', up);
    function stopVoice() {
      if (!voice) return;
      voice.stream.getTracks().forEach(function (tr) { tr.stop(); });
      try { voice.ctx.close(); } catch (e) {}
      voice = null; vlevel = 0; vbtn.setAttribute('aria-pressed', 'false'); if (vlabel) vlabel.textContent = L().voice.off;
    }
    if (vbtn) vbtn.addEventListener('click', function () {
      if (voice) { stopVoice(); return; }
      var md = navigator.mediaDevices;
      if (!md || !md.getUserMedia || !(window.AudioContext || window.webkitAudioContext)) { cheer.textContent = L().voice.fail; return; }
      md.getUserMedia({ audio: { echoCancellation: false, noiseSuppression: false, autoGainControl: false } }).then(function (stream) {
        var Ctx = window.AudioContext || window.webkitAudioContext, ctx = new Ctx(), src = ctx.createMediaStreamSource(stream), an = ctx.createAnalyser();
        an.fftSize = 1024; src.connect(an);
        voice = { stream: stream, ctx: ctx, an: an, buf: new Float32Array(an.fftSize) };
        vbtn.setAttribute('aria-pressed', 'true'); if (vlabel) vlabel.textContent = L().voice.on; cheer.textContent = '';
        go();
      }).catch(function () { cheer.textContent = L().voice.fail; });
    });
    document.addEventListener('visibilitychange', function () { if (document.hidden) { up(); stopVoice(); } });
    window.addEventListener('pagehide', stopVoice);
    setLine(0);
    // a gentle demo the first time the stage is seen: two lines sing themselves, then it waits for you
    if (MOTION) {
      var demo = false;
      seen(st, function (v) {
        if (!v || demo) return; demo = true;
        var w = 0; (function sing() { if (held || voice) return; if (w < words.length) { words[w].classList.add('sung'); w++; sung = w; bar.style.transform = 'scaleX(' + (w / words.length).toFixed(3) + ')'; setTimeout(sing, 380); } else setTimeout(function () { if (!held && !voice) setLine(1); }, 1400); })();
      }, { threshold: 0.4 });
    }
    return api;
  })();

  /* free or private: the room fills up */
  function renderRoom() {
    var input = $('#pvN'); if (!input) return;
    var n = Math.max(2, Math.min(100, parseInt(input.value, 10) || 2)), P = L().pv;
    $('#pvOut').textContent = n;
    $$('[data-room] i').forEach(function (d, i) { var on = i < n; if (d.classList.contains('on') !== on) d.classList.toggle('on', on); });
    var priv = $('[data-pv-priv]'), free = $('.pv-free');
    var ok = n >= 20;
    priv.classList.toggle('off', !ok); priv.classList.toggle('best', ok); free.classList.toggle('best', !ok);
    $('[data-pv-price]').textContent = ok ? '€' + (20 * n).toLocaleString(L().loc) : '–';
    $('[data-pv-note]').textContent = ok ? P.note(n) : P.small;
    $('[data-pv-mail]').href = 'mailto:info@cafechacha.nl?subject=' + encodeURIComponent(P.subject(n)) + '&body=' + encodeURIComponent(P.body(n));
  }
  function room() {
    var r = $('[data-room]'), input = $('#pvN'); if (!r || !input) return;
    var f = document.createDocumentFragment();
    for (var i = 1; i <= 100; i++) { var d = document.createElement('i'); if (i === 52 || i === 80 || i === 100) d.className = 'mk'; f.appendChild(d); }
    r.appendChild(f);
    input.addEventListener('input', renderRoom);
    renderRoom();
  }

  /* ---------------------------------------------------------------- guests */
  function guests() {
    var stageEl = $('[data-quotes]'); if (!stageEl) return;
    var qs = $$('.q', stageEl), bs = $$('.q-who button'), i = 0, timer = null, vis = false, user = false;
    function show(k) { i = k; qs.forEach(function (q, j) { q.classList.toggle('on', j === k); }); bs.forEach(function (b, j) { b.setAttribute('aria-pressed', j === k ? 'true' : 'false'); }); }
    function plan() { clearTimeout(timer); if (MOTION && vis && !user) { stageEl.classList.add('auto'); timer = setTimeout(function () { show((i + 1) % qs.length); plan(); }, 8000); } else stageEl.classList.remove('auto'); }
    bs.forEach(function (b, j) { b.addEventListener('click', function () { user = true; show(j); plan(); }); });
    seen(stageEl, function (v) { vis = v; plan(); }, { threshold: 0.5 });
  }

  /* ---------------------------------------------------------------- signature rail: buttons and drag */
  function rail() {
    var r = $('.rail'); if (!r) return;
    $$('[data-rail]').forEach(function (b) { b.addEventListener('click', function () { var p = $('.plate', r); r.scrollBy({ left: (p ? p.offsetWidth + 24 : 400) * +b.getAttribute('data-rail'), behavior: MOTION ? 'smooth' : 'auto' }); }); });
    var down = false, x0 = 0, s0 = 0, moved = false;
    r.addEventListener('pointerdown', function (e) { if (e.pointerType !== 'mouse') return; down = true; moved = false; x0 = e.clientX; s0 = r.scrollLeft; });
    window.addEventListener('pointermove', function (e) { if (!down) return; var dx = e.clientX - x0; if (Math.abs(dx) > 4) { moved = true; r.classList.add('drag'); } r.scrollLeft = s0 - dx; });
    window.addEventListener('pointerup', function () { if (!down) return; down = false; r.classList.remove('drag'); });
    r.addEventListener('click', function (e) { if (moved) { e.preventDefault(); e.stopPropagation(); } }, true);
  }

  /* ---------------------------------------------------------------- food: the carte */
  function foodMenu() {
    var body = $('.menu-body'); if (!body) return;
    var veg = $('[data-veg]');
    if (veg) veg.addEventListener('click', function () { var on = veg.getAttribute('aria-pressed') !== 'true'; veg.setAttribute('aria-pressed', on ? 'true' : 'false'); body.classList.toggle('vegonly', on); });
    var tabs = $$('.tabs a'), groups = $$('.fgroup'), cur = '', ticking = false;
    function spy() {
      ticking = false;
      var id = groups[0].id, line = window.innerHeight * 0.45;
      groups.forEach(function (g) { if (g.offsetParent && g.getBoundingClientRect().top < line) id = g.id; });
      if (id === cur) return; cur = id;
      tabs.forEach(function (t) {
        var on = t.getAttribute('href') === '#' + id; t.classList.toggle('on', on);
        if (on) { t.setAttribute('aria-current', 'location'); if (window.innerWidth < 900) t.parentNode.scrollTo({ left: t.offsetLeft - 20, behavior: MOTION ? 'smooth' : 'auto' }); }
        else t.removeAttribute('aria-current');
      });
    }
    window.addEventListener('scroll', function () { if (!ticking) { ticking = true; requestAnimationFrame(spy); } }, { passive: true });
    spy();
    // the dish follows the cursor
    var fp = $('.float-pic'); if (!fp || !window.matchMedia || !matchMedia('(hover: hover) and (pointer: fine)').matches) return;
    var img = $('img', fp), W = fp.getAttribute('data-w') || '480', key = '', x = 0, y = 0, tx = 0, ty = 0, on = false, raf = 0;
    function loop() {
      raf = 0; x += (tx - x) * 0.22; y += (ty - y) * 0.22;
      fp.style.transform = 'translate3d(' + x.toFixed(1) + 'px,' + y.toFixed(1) + 'px,0) rotate(-1.5deg)';
      if (Math.abs(tx - x) > 0.4 || Math.abs(ty - y) > 0.4) raf = requestAnimationFrame(loop);
    }
    function hide() { if (on) { on = false; fp.classList.remove('on'); } }
    body.addEventListener('pointermove', function (e) {
      if (e.pointerType !== 'mouse') return;
      var li = e.target.closest('.dish[data-pic]'); if (!li) { hide(); return; }
      var k = li.getAttribute('data-pic');
      if (k !== key) { key = k; img.src = 'img/d-' + k + '-' + W + '.webp'; }
      var w = fp.offsetWidth, h = fp.offsetHeight || w / 2;
      tx = e.clientX + 28; if (tx + w > window.innerWidth - 12) tx = e.clientX - 28 - w;
      ty = Math.max(12, Math.min(window.innerHeight - h - 12, e.clientY - h / 2));
      if (!on) { on = true; x = tx; y = ty; fp.classList.add('on'); }
      if (!raf) raf = requestAnimationFrame(loop);
    });
    body.addEventListener('pointerleave', hide);
    window.addEventListener('scroll', hide, { passive: true });
    window.addEventListener('load', function () {
      var go = function () { $$('.dish[data-pic]').forEach(function (li) { var im = new Image(); im.src = 'img/d-' + li.getAttribute('data-pic') + '-' + W + '.webp'; }); };
      if ('requestIdleCallback' in window) requestIdleCallback(go, { timeout: 4000 }); else setTimeout(go, 2000);
    });
  }

  /* ---------------------------------------------------------------- spirits tabs */
  function spiritTabs() {
    var tabs = $$('.sp-tabs [role="tab"]'); if (!tabs.length) return;
    function sel(t, focus) {
      tabs.forEach(function (x) { var on = x === t; x.setAttribute('aria-selected', on ? 'true' : 'false'); x.tabIndex = on ? 0 : -1; $('#' + x.getAttribute('aria-controls')).hidden = !on; });
      if (focus) t.focus();
    }
    tabs.forEach(function (t, i) {
      t.addEventListener('click', function () { sel(t); });
      t.addEventListener('keydown', function (e) {
        if (e.key === 'ArrowRight') { e.preventDefault(); sel(tabs[(i + 1) % tabs.length], true); }
        if (e.key === 'ArrowLeft') { e.preventDefault(); sel(tabs[(i - 1 + tabs.length) % tabs.length], true); }
      });
    });
  }

  /* ---------------------------------------------------------------- group planner -> a ready email */
  function renderPlan() {
    var form = $('#planner'); if (!form) return;
    var P = L().pl, p = Math.max(2, Math.min(100, parseInt($('#plPeople').value, 10) || 2));
    var occ = (form.querySelector('[name="occ"]:checked') || {}).value || 'birthday';
    var part = (form.querySelector('[name="part"]:checked') || {}).value || '';
    var date = $('#plDate').value, dtxt = '';
    if (date) { try { dtxt = new Date(date + 'T12:00:00').toLocaleDateString(L().loc, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }); } catch (e) { dtxt = date; } }
    var seated = (part === 'lunch' || part === 'dinner') && occ !== 'drinks' && occ !== 'party';
    var note;
    if (occ === 'karaoke') note = p < 20 ? P.kSmall : P.kPrice(p);
    else if (p > 100) note = P.over100;
    else if (seated && p > 80) note = P.seat80;
    else if (seated && p > 52) note = P.seat52;
    else if (!seated && p > 52) note = P.drinks100;
    else note = P.ok(p);
    $('#plOut').textContent = note;
    var o = L().occ[occ], pt = occ === 'karaoke' ? '' : L().part[part];
    if (occ === 'company' && (part === 'lunch' || part === 'dinner')) { o = L().company[part]; pt = ''; }
    $('#plSend').href = 'mailto:info@cafechacha.nl?subject=' + encodeURIComponent(P.subject(o, p)) + '&body=' + encodeURIComponent(P.body(o, p, dtxt, pt));
  }
  function planner() {
    var form = $('#planner'); if (!form) return;
    var ppl = $('#plPeople'), d = $('#plDate');
    try { d.min = new Date().toISOString().slice(0, 10); } catch (e) {}
    form.addEventListener('change', renderPlan); form.addEventListener('input', renderPlan);
    form.addEventListener('submit', function (e) { e.preventDefault(); });
    $$('[data-pstep]').forEach(function (b) { b.addEventListener('click', function () { ppl.value = Math.max(2, Math.min(100, (parseInt(ppl.value, 10) || 2) + parseInt(b.getAttribute('data-pstep'), 10) * (ppl.value >= 20 ? 5 : 1))); renderPlan(); }); });
    ppl.addEventListener('focus', function () { ppl.select(); });
    $$('[data-occ]').forEach(function (a) { a.addEventListener('click', function () { var r = form.querySelector('[name="occ"][value="' + a.getAttribute('data-occ') + '"]'); if (r) { r.checked = true; renderPlan(); } }); });
  }

  /* ---------------------------------------------------------------- small things */
  function images() {
    $$('img[loading="lazy"]').forEach(function (im) {
      if (im.complete && im.naturalWidth) im.classList.add('in');
      else { im.addEventListener('load', function () { im.classList.add('in'); }, { once: true }); im.addEventListener('error', function () { im.classList.add('in'); }, { once: true }); }
    });
    window.addEventListener('load', function () {
      var go = function () { $$('img[loading="lazy"]').forEach(function (im) { if (im.offsetParent) im.loading = 'eager'; }); };
      if ('requestIdleCallback' in window) requestIdleCallback(go, { timeout: 3000 }); else setTimeout(go, 1500);
    });
  }
  function intro() { var s = $('.intro'); if (!s) return; if (!MOTION) { s.classList.add('in'); return; } seen(s, function (v) { if (v) s.classList.add('in'); }, { threshold: 0.35 }); }
  function mapLoad() {
    var m = $('#map'); if (!m) return;
    $('.map-load', m).addEventListener('click', function () {
      var f = document.createElement('iframe'); f.src = m.getAttribute('data-src'); f.title = 'Map: Café CHA CHA, Rokin 103'; f.loading = 'lazy'; f.referrerPolicy = 'no-referrer-when-downgrade';
      m.appendChild(f); m.classList.add('loaded');
    });
  }
  function chrome() {
    var nav = $('#nav'), dock = $('#dock'), head = $('.hero, .phero, .stage'), outro = $('.outro'), past = false, atEnd = false;
    function onScroll() { nav.classList.toggle('solid', window.scrollY > 30); }
    window.addEventListener('scroll', onScroll, { passive: true }); onScroll();
    function ds() { dock.classList.toggle('show', past && !atEnd); }
    if (head) seen(head, function (v) { past = !v; ds(); }, { rootMargin: '-35% 0px 0px 0px' }); else { past = true; ds(); }
    if (outro) seen(outro, function (v) { atEnd = v; ds(); }, { threshold: 0.3 });
  }
  function ticker() {
    var counters = $$('[data-ka-count]'), vis = false;
    counters.forEach(function (c) { seen(c, function (v) { c._v = v; vis = counters.some(function (x) { return x._v; }); }); });
    setInterval(function () { if (vis) renderKaraoke(); }, 1000);
    setInterval(function () { var s = renderStatus(); renderHero(s); if (!vis) renderKaraoke(); }, 60000);
  }

  function init() {
    room();
    applyLang();
    $$('[data-lang]').forEach(function (b) { b.addEventListener('click', function () { lang = lang === 'en' ? 'nl' : 'en'; try { localStorage.setItem('cc_lang', lang); } catch (e) {} applyLang(); }); });
    card(); shine(); day(); prompters(); bar(); guests(); rail(); foodMenu(); spiritTabs(); planner(); renderPlan(); images(); intro(); mapLoad(); chrome(); ticker();
    if (location.hash === '#private' && $('#pvN')) setTimeout(function () { $('#pvN').focus({ preventScroll: true }); }, 400);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
