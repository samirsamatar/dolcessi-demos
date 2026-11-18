/* Café CHA CHA concept · Dolcessi */
(function () {
  'use strict';
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var root = document.documentElement;
  var MOTION = root.classList.contains('mo');
  var NL = window.CC_NL || {};
  var lang = 'en';
  try { if (localStorage.getItem('cc_lang') === 'nl') lang = 'nl'; } catch (e) {}

  /* ---------------------------------------------------------------- time on the Rokin */
  // Sun–Wed 11:00–22:00, Thu–Sat 11:00–01:00 (cafechacha.nl). Karaoke Wed–Sun from 21:00.
  var OPEN = { 0: [11, 22], 1: [11, 22], 2: [11, 22], 3: [11, 22], 4: [11, 25], 5: [11, 25], 6: [11, 25] };
  var KARAOKE = { 0: 1, 3: 1, 4: 1, 5: 1, 6: 1 };
  function ams() {
    var parts = {}, now = new Date();
    try {
      new Intl.DateTimeFormat('en-GB', { timeZone: 'Europe/Amsterdam', weekday: 'short', hour: '2-digit', minute: '2-digit', hour12: false })
        .formatToParts(now).forEach(function (p) { parts[p.type] = p.value; });
      return { d: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].indexOf(parts.weekday), m: (parseInt(parts.hour, 10) % 24) * 60 + parseInt(parts.minute, 10) };
    } catch (e) { return { d: now.getDay(), m: now.getHours() * 60 + now.getMinutes() }; }
  }
  function hh(h) { h = h % 24; return (h < 10 ? '0' : '') + h + ':00'; }
  var T = {
    en: {
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
    var d = ams().d; $$('.hours tr').forEach(function (tr) { tr.classList.toggle('today', +tr.getAttribute('data-d') === d); });
    return s;
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
    var s = renderStatus(); renderHero(s); renderMood(); renderPlan();
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

  /* ---------------------------------------------------------------- the day: clock, sky, sun */
  function day() {
    var sec = $('#day'); if (!sec) return;
    var panels = $$('.hour', sec), clock = $('#clock'), sun = $('#sun'), path = $('.arc path', sec), ticks = $$('.ticks li', sec);
    var skyD = $('.sky-dusk', sec), skyN = $('.sky-night', sec);
    var TIMES = [660, 900, 1080, 1260, 1380];
    var digits = $$('span', clock), shown = ['1', '1', '0', '0'], tone = '', active = -1, raf = 0, inView = false, centers = [], plen = 0, arcBox = null;
    function measure() { centers = panels.map(function (p) { var r = p.getBoundingClientRect(); return r.top + window.scrollY + r.height / 2; }); plen = path.getTotalLength(); }
    function frame() {
      raf = 0;
      var y = window.scrollY + window.innerHeight * 0.5, f = 0;
      if (y <= centers[0]) f = 0; else if (y >= centers[centers.length - 1]) f = centers.length - 1;
      else for (var i = 0; i < centers.length - 1; i++) if (y < centers[i + 1]) { f = i + (y - centers[i]) / (centers[i + 1] - centers[i]); break; }
      var i0 = Math.floor(f), t = f - i0, mins = i0 >= TIMES.length - 1 ? TIMES[TIMES.length - 1] : TIMES[i0] + (TIMES[i0 + 1] - TIMES[i0]) * t;
      mins = Math.round(mins / 5) * 5;
      var hhv = Math.floor(mins / 60) % 24, mm = mins % 60, str = (hhv < 10 ? '0' : '') + hhv + (mm < 10 ? '0' : '') + mm;
      for (var k = 0; k < 4; k++) if (shown[k] !== str[k]) { shown[k] = str[k]; digits[k].textContent = str[k]; if (MOTION) { digits[k].classList.remove('roll'); void digits[k].offsetWidth; digits[k].classList.add('roll'); } }
      var dusk = Math.min(1, Math.max(0, (f - 1.05) / 0.7)), night = Math.min(1, Math.max(0, (f - 2.25) / 0.65));
      skyD.style.opacity = dusk.toFixed(3); skyN.style.opacity = night.toFixed(3);
      var tn = f < 1.55 ? 'day' : f < 2.45 ? 'dusk' : 'night';
      if (tn !== tone) { tone = tn; sec.setAttribute('data-tone', tn); }
      var a = Math.round(f); if (a !== active) { active = a; ticks.forEach(function (li, j) { li.classList.toggle('on', j === a); }); }
      var pt = path.getPointAtLength(plen * Math.min(1, f / (TIMES.length - 1)));
      var box = path.ownerSVGElement.getBoundingClientRect(), vb = path.ownerSVGElement.viewBox.baseVal;
      sun.style.transform = 'translate3d(' + (pt.x / vb.width * box.width).toFixed(1) + 'px,' + (pt.y / vb.height * box.height).toFixed(1) + 'px,0)';
    }
    function req() { if (inView && !raf) raf = requestAnimationFrame(frame); }
    window.addEventListener('scroll', req, { passive: true });
    window.addEventListener('resize', function () { measure(); req(); });
    window.addEventListener('load', function () { measure(); req(); });
    new IntersectionObserver(function (e) { inView = e[0].isIntersecting; if (inView) { measure(); req(); } }, { rootMargin: '100px 0px' }).observe(sec);
    measure(); frame();
  }

  /* ---------------------------------------------------------------- karaoke prompter */
  function prompters() {
    $$('.prompter').forEach(function (p) {
      var words = $$('span', p), timer = null, k = 0;
      if (!MOTION) { words.forEach(function (w) { w.classList.add('sung'); }); return; }
      function tick() {
        if (k < words.length) { words[k].classList.add('sung'); k++; timer = setTimeout(tick, k === words.length ? 1600 : 420); }
        else { words.forEach(function (w) { w.classList.remove('sung'); }); k = 0; timer = setTimeout(tick, 500); }
      }
      new IntersectionObserver(function (e) {
        var sec = p.closest('section'); if (sec) sec.classList.toggle('vis', e[0].isIntersecting);
        if (e[0].isIntersecting) { if (!timer) tick(); } else { clearTimeout(timer); timer = null; }
      }, { threshold: 0.6 }).observe(p);
    });
  }

  /* ---------------------------------------------------------------- cocktail moods */
  var mood = null;
  function renderMood() {
    $$('[data-glasses]').forEach(function (list) {
      var hits = [];
      $$('.g', list).forEach(function (g) {
        var hit = !!mood && g.getAttribute('data-moods').split(' ').indexOf(mood) > -1;
        g.classList.toggle('hit', hit); if (hit) hits.push($('.g-n', g).textContent);
      });
      list.classList.toggle('filtering', !!mood);
      var box = list.closest('.mood-grid'), out = box && $('[data-mood-out]', box);
      if (out) out.textContent = mood ? L().moodOut(hits.length, L().moods[mood], hits.join(', ')) : '';
    });
    $$('[data-mood]').forEach(function (b) { b.setAttribute('aria-pressed', b.getAttribute('data-mood') === mood ? 'true' : 'false'); });
  }
  function moods() {
    $$('[data-mood]').forEach(function (b) { b.addEventListener('click', function () { var m = b.getAttribute('data-mood'); mood = mood === m ? null : m; renderMood(); }); });
  }

  /* ---------------------------------------------------------------- food menu: tabs + vegetarian */
  function foodMenu() {
    var body = $('.menu-body'); if (!body) return;
    var veg = $('[data-veg]');
    if (veg) veg.addEventListener('click', function () { var on = veg.getAttribute('aria-pressed') !== 'true'; veg.setAttribute('aria-pressed', on ? 'true' : 'false'); body.classList.toggle('vegonly', on); });
    var tabs = $$('.tabs a'), groups = $$('.fgroup'), cur = '', ticking = false;
    function spy() {
      ticking = false;
      var id = groups[0].id, line = window.innerHeight * 0.45;
      groups.forEach(function (g) { if (g.getBoundingClientRect().top < line) id = g.id; });
      if (id === cur) return; cur = id;
      tabs.forEach(function (t) {
        var on = t.getAttribute('href') === '#' + id; t.classList.toggle('on', on);
        if (on) { t.setAttribute('aria-current', 'location'); if (window.innerWidth < 900) t.parentNode.scrollTo({ left: t.offsetLeft - 20, behavior: MOTION ? 'smooth' : 'auto' }); }
        else t.removeAttribute('aria-current');
      });
    }
    window.addEventListener('scroll', function () { if (!ticking) { ticking = true; requestAnimationFrame(spy); } }, { passive: true });
    spy();
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
    if (date) { try { dtxt = new Date(date + 'T12:00:00').toLocaleDateString(lang === 'nl' ? 'nl-NL' : 'en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }); } catch (e) { dtxt = date; } }
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
    try { var t = new Date(); d.min = t.toISOString().slice(0, 10); } catch (e) {}
    form.addEventListener('change', renderPlan); form.addEventListener('input', renderPlan);
    form.addEventListener('submit', function (e) { e.preventDefault(); });
    $$('[data-pstep]').forEach(function (b) { b.addEventListener('click', function () { ppl.value = Math.max(2, Math.min(100, (parseInt(ppl.value, 10) || 2) + parseInt(b.getAttribute('data-pstep'), 10) * (ppl.value >= 20 ? 5 : 1))); renderPlan(); }); });
    ppl.addEventListener('focus', function () { ppl.select(); });
    $$('[data-occ]').forEach(function (a) { a.addEventListener('click', function () { var r = form.querySelector('[name="occ"][value="' + a.getAttribute('data-occ') + '"]'); if (r) { r.checked = true; renderPlan(); } }); });
    if (location.hash === '#karaoke-plan') { var r = form.querySelector('[value="karaoke"]'); if (r) r.checked = true; }
  }

  /* ---------------------------------------------------------------- small things */
  function images() {
    $$('img[loading="lazy"]').forEach(function (im) {
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
      var f = document.createElement('iframe'); f.src = m.getAttribute('data-src'); f.title = 'Map: Café CHA CHA, Rokin 103'; f.loading = 'lazy'; f.referrerPolicy = 'no-referrer-when-downgrade';
      m.appendChild(f); m.classList.add('loaded');
    });
  }
  function chrome() {
    var nav = $('#nav'), dock = $('#dock'), head = $('.hero, .phero'), outro = $('.outro'), past = false, atEnd = false;
    function onScroll() { nav.classList.toggle('solid', window.scrollY > 30); }
    window.addEventListener('scroll', onScroll, { passive: true }); onScroll();
    function ds() { dock.classList.toggle('show', past && !atEnd); }
    if (head) new IntersectionObserver(function (e) { past = !e[0].isIntersecting; ds(); }, { rootMargin: '-35% 0px 0px 0px' }).observe(head); else { past = true; ds(); }
    if (outro) new IntersectionObserver(function (e) { atEnd = e[0].isIntersecting; ds(); }, { threshold: 0.3 }).observe(outro);
  }

  function init() {
    applyLang();
    setInterval(function () { var s = renderStatus(); renderHero(s); }, 60000);
    $$('[data-lang]').forEach(function (b) { b.addEventListener('click', function () { lang = lang === 'en' ? 'nl' : 'en'; try { localStorage.setItem('cc_lang', lang); } catch (e) {} applyLang(); }); });
    card(); day(); prompters(); moods(); foodMenu(); spiritTabs(); planner(); renderPlan(); images(); mapLoad(); chrome();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
