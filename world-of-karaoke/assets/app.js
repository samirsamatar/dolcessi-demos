/* World of Karaoke concept · Dolcessi */
(function () {
  'use strict';
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var root = document.documentElement;
  var MOTION = root.classList.contains('pre');

  /* ------------------------------------------------------------------ data */
  var BOOK = { en: 'https://worldofkaraoke.nl/en/book-your-experience-2/', nl: 'https://worldofkaraoke.nl/boek-jouw-ervaring/' };
  var MENU = { en: 'https://worldofkaraoke.nl/en/our-menu/', nl: 'https://worldofkaraoke.nl/menu/' };
  var PRICE = { wed: 19, thu: 19, fri: 23, sat: 23, sun: 19 };          // per person, per two-hour session
  var DAYS = ['wed', 'thu', 'fri', 'sat', 'sun'];
  var DAY_IDX = { sun: 0, wed: 3, thu: 4, fri: 5, sat: 6 };
  var HOURS = { 0: [16, 24], 3: [16, 24], 4: [16, 24], 5: [16, 26], 6: [16, 26] }; // close 26 = 02:00 next day
  // start = first session; every session is 2h, 15 min between sessions; late session Fri/Sat unless first start is 17:15
  var ROOMS = [
    { id: 'paris', name: 'Paris', min: 2, max: 3, m2: 8, start: 990, hue: '#ff5fa2', script: 1, s: 1.9 },
    { id: 'istanbul', name: 'Istanbul', min: 2, max: 3, m2: 9, start: 1005, hue: '#ffb24d', s: 1.75 },
    { id: 'tokyo', name: 'Tokyo', min: 2, max: 6, m2: 10, start: 1005, hue: '#ff4d67', ktv: 'only', pic: 1,wall: { en: "Tokyo Tower after dark and a round Karaoke Night neon", nl: "de Tokyo Tower bij nacht en een ronde neon met Karaoke Night" }, s: 2.3 },
    { id: 'barcelona', name: 'Barcelona', min: 2, max: 6, m2: 10, start: 1020, hue: '#ffd84a', script: 1, s: 2.1 },
    { id: 'singapore', name: 'Singapore', min: 4, max: 8, m2: 10, start: 1020, hue: '#5dffb4', ktv: 'plus', s: 2.1 },
    { id: 'los-angeles', name: 'Los Angeles', min: 4, max: 8, m2: 10, start: 990, hue: '#ff8a5c', script: 1, s: 2.2 },
    { id: 'rio', name: 'Rio de Janeiro', min: 4, max: 10, m2: 11, start: 1020, hue: '#7dff7a', pic: 1,wall: { en: "the bay at night, a parrot in neon colours and a mirror ball overhead", nl: "de baai bij nacht, een papegaai in neonkleuren en een spiegelbol erboven" }, s: 2.2 },
    { id: 'sydney', name: 'Sydney', min: 4, max: 10, m2: 12, start: 1035, hue: '#5ecbff', pic: 1,wall: { en: "the Harbour Bridge at sunset", nl: "de Harbour Bridge bij zonsondergang" }, s: 2.5 },
    { id: 'hongkong', name: 'Hongkong', min: 4, max: 10, m2: 12, start: 1035, hue: '#ff4fd0', ktv: 'plus', s: 2.4 },
    { id: 'london', name: 'London', min: 6, max: 12, m2: 12, start: 1035, hue: '#8f9bff', pic: 1,wall: { en: "the city's name in tall letters", nl: "de naam van de stad in grote letters" }, s: 2.7 },
    { id: 'berlin', name: 'Berlin', min: 6, max: 12, m2: 12, start: 1035, hue: '#fff36b', ktv: 'only', pic: 1,wall: { en: "BERLIJN, spelled the Dutch way", nl: "BERLIJN, op z'n Nederlands gespeld" }, s: 2.7 },
    { id: 'dubai', name: 'Dubai', min: 6, max: 12, m2: 12, start: 1005, hue: '#ffc46b', script: 1, pic: 1,wall: { en: "the Dubai skyline and a Karaoke Night neon", nl: "de skyline van Dubai en een neon met Karaoke Night" }, s: 2.6 },
    { id: 'amsterdam', name: 'Amsterdam', min: 12, max: 15, m2: 17, start: 1020, hue: '#8af4f2', pic: 1,wall: { en: "AMSTERDAM in tall letters", nl: "AMSTERDAM in grote letters" }, s: 3.1 },
    { id: 'new-york', name: 'New York', min: 16, max: 25, m2: 29, start: 990, hue: '#c9a2ff', ktv: 'plus', s: 3.7 }
  ];

  /* ------------------------------------------------------------------ copy */
  var NL = {
    'concept.bar': 'Conceptontwerp van Dolcessi. Dit is niet de officiële website van World of Karaoke.',
    'nav.rooms': 'Kamers', 'nav.songs': 'Nummers', 'nav.bar': 'Drankjes', 'nav.groups': 'Groepen', 'nav.visit': 'Bezoek',
    'cta.book': 'Boek een kamer',
    'hero.h1': 'Je eigen karaokekamer in Amsterdam.',
    'hero.lede': 'Kies een stad, doe de deur dicht en zing. Veertien privékamers vernoemd naar wereldsteden, meer dan 100.000 nummers in ruim 50 talen, en cocktails van de bar.',
    'hero.rating': '<b>4,8</b> op Google uit 217 reviews',
    'finder.h': 'Vind je kamer', 'finder.people': 'Met hoeveel zijn jullie?', 'finder.night': 'Welke avond?',
    'finder.fine': 'Maandag en dinsdag dicht. Boeken doe je op worldofkaraoke.nl.',
    'how.h': 'Zo werkt een <span class="nw" style="--h:#c9a2ff">avond</span> bij ons',
    'how.1h': 'Kies je stad en je avond', 'how.1p': 'Kamers voor twee tot vijfentwintig personen, €19 of €23 per persoon voor twee uur. Je boekt en betaalt op worldofkaraoke.nl en kunt één keer verzetten, tot 72 uur van tevoren.',
    'how.2h': 'Zet je nummers klaar', 'how.2p': 'Zoek in de catalogus op het touchscreen. Filter op decennium of genre en zing met zanglijn, zonder, of over het origineel.',
    'how.3h': 'Bestel een rondje', 'how.3p': 'Scan de QR-code in je kamer en een host brengt cocktails, pitchers of soju tot aan je deur. De bar is open tot middernacht, en op vrijdag en zaterdag tot 02:00.',
    'rooms.h': 'Veertien kamers, <span class="nw" style="--h:#ff5fae">veertien steden</span>',
    'rooms.p': 'De verste, Sydney, ligt 16.600 km van Amsterdam. Hier is het een paar deuren verder in de gang. Stel je groepsgrootte in en de borden die passen gaan aan.',
    'rooms.for': 'Personen', 'rooms.night': 'Avond',
    'songs.h': '<span class="nw" style="--h:#8af4f2">100.000 nummers.</span> Die van jou zit erbij.',
    'songs.p': 'Hits van nu en tijdloze klassiekers in meer dan 50 talen, waaronder Nederlands, Engels, Duits, Spaans, Japans en Chinees. Ga terug tot de jaren dertig of blijf in de hitlijsten van dit jaar, in 35+ genres van Latin tot K-pop.',
    'songs.line': 'Begin in het Nederlands. Eindig met K-pop.',
    'songs.now': 'Nu aan de beurt', 'songs.you': 'Jij, over een minuut of vijf', 'songs.more': 'en nog veel meer',
    'songs.ktv': '<b>Chinese KTV.</b> Singapore, Hongkong en New York hebben ook het Chinese KTV-systeem. Tokyo en Berlin werken er uitsluitend mee. Beschikbaar voor groepen vanaf vier personen.',
    'bar.h': 'Kom voor de karaoke, blijf voor de cocktails',
    'bar.p': 'De bar is er voor iedereen. Drink iets voor je sessie, of kom gewoon langs zonder een kamer te boeken.',
    'bar.d1': 'Japanse whisky, yuzulikeur, citroen, suiker, eiwit', 'bar.d2': 'Wodka, koffielikeur, espresso, suiker', 'bar.d3': 'Rum, limoen, verse munt, suiker, soda',
    'bar.cta': 'Bekijk de hele kaart', 'bar.t1': 'Cocktails', 'bar.v1': 'vanaf €14', 'bar.t2': 'Heineken van de tap', 'bar.t3': 'Wijn per glas', 'bar.t4': 'Shots',
    'groups.h': '<span class="nw" style="--h:#ff5fae">Verjaardagen</span>, vrijgezellenfeesten en het hele kantoor',
    'groups.p': 'Met z\'n achten? Zeven kamers passen, plus Berlin met Chinese KTV. Dat is <b>€152</b> op woensdag, donderdag of zondag en <b>€184</b> op vrijdag of zaterdag, voor twee uur. Een pitcher Heineken van 1,5 liter kost €21.',
    'groups.f1': 'personen in onze grootste kamer, New York', 'groups.f2': 'gasten in alle veertien kamers samen', 'groups.f3': 'personen in de bar', 'groups.f4': 'scherm voor een presentatie of je eigen video',
    'groups.cta': 'Mail ons over je groep',
    'proof.h': 'Beoordeeld met een 4,8 uit 5 door 217 gasten op Google', 'proof.read': 'Lees de reviews',
    'visit.h': 'Je vindt ons bij <span class="nw" style="--h:#5dffb4">Sloterdijk</span>',
    'visit.metro': 'Metro', 'visit.metro.t': 'Lijn 50 en 51, station Sloterdijk',
    'visit.bus': 'Bus', 'visit.bus.t': 'Lijn 22, 36, 103, 272 en 395, halte La Guardiaweg',
    'visit.car': 'Auto', 'visit.car.t': 'Betaald parkeren maandag t/m vrijdag van 09:00 tot 19:00. In het weekend gratis.',
    'visit.route': 'Route met de auto', 'visit.call': 'Bel ons', 'visit.hours': 'Openingstijden', 'visit.closed': 'Gesloten',
    'd.mon': 'Maandag', 'd.tue': 'Dinsdag', 'd.wed': 'Woensdag', 'd.thu': 'Donderdag', 'd.fri': 'Vrijdag', 'd.sat': 'Zaterdag', 'd.sun': 'Zondag',
    'faq.h': 'Goed om te <span class="nw" style="--h:#9778f0">weten</span> voor je boekt',
    'faq.q1': 'Wat kost een kamer?', 'faq.a1': '€19 per persoon op woensdag, donderdag en zondag. €23 per persoon op vrijdag en zaterdag, voor een sessie van twee uur. Je kiest het aantal personen bij het boeken en betaalt vooraf online. De kamer heeft twee draadloze microfoons en de hele catalogus; drankjes bestel je los.',
    'faq.q2': 'Hoe lang duurt een sessie en wanneer beginnen ze?', 'faq.a2': 'Elke sessie duurt twee uur. Elke kamer heeft drie sessies per avond, die afhankelijk van de kamer tussen 16:30 en 21:45 beginnen. Op vrijdag en zaterdag hebben de meeste kamers een late sessie tot na middernacht.',
    'faq.q3': 'Hoeveel mensen passen er in een kamer?', 'faq.a3': 'Onze kleinste kamers, Paris en Istanbul, zijn voor twee of drie personen. In New York passen er 16 tot 25. Elke kamer heeft een minimum en een maximum, dus gebruik de kamerzoeker hierboven om te zien welke bij je groep passen.',
    'faq.q4': 'Hoe werkt het met drankjes, en is er eten?', 'faq.a4': 'Elke kamer heeft een QR-code. Bestel op je telefoon en een karaokehost brengt de drankjes naar je kamer. Eten is er niet. De bar is open voor iedereen zonder reservering, en een tafel daar kun je per mail aanvragen.',
    'faq.q8': 'Kunnen we een boeking wijzigen of annuleren?', 'faq.a8': 'Je kunt een boeking één keer wijzigen, tot 72 uur voor je sessie: de datum, de sessie, de kamer of het aantal personen. Annuleer je minstens 72 uur van tevoren, dan krijg je je geld terug min €5 administratiekosten. Boekingen met korting of op maat worden niet terugbetaald.',
    'faq.q5': 'We zijn met meer dan 25. Kan dat?', 'faq.a5': 'Ja. Alle veertien kamers samen bieden plek aan 140 gasten, en in de bar kunnen tot 80 personen. Voor meer dan 25 personen, een datum buiten openingstijden of een aanvraag op maat mail je naar <a href="mailto:info@worldofkaraoke.nl">info@worldofkaraoke.nl</a>.',
    'faq.q6': 'Wat is het Chinese KTV-systeem?', 'faq.a6': 'Een apart karaokesysteem met een Chinese catalogus (中文 KTV 系统), voor groepen vanaf vier personen. Singapore, Hongkong en New York hebben het naast het gewone systeem. Tokyo en Berlin werken er alleen mee, dus kies Chinese KTV als je die twee boekt.',
    'faq.q7': 'Kun je er parkeren?', 'faq.a7': 'Parkeren op straat is betaald van maandag t/m vrijdag van 09:00 tot 19:00 en gratis in het weekend. Metro 50 en 51 stoppen op Sloterdijk en bus 22, 36, 103, 272 en 395 stoppen bij La Guardiaweg.',
    'outro.h': 'Waar gaan we heen vanavond?', 'outro.p': 'Veertien steden, een paar deuren van elkaar. Vanaf €19 per persoon.',
    'foot.tag': 'Privékaraoke en cocktailbar in Amsterdam Nieuw-West. Veertien kamers, veertien steden.',
    'foot.contact': 'Contact', 'foot.follow': 'Volg ons', 'foot.small': 'De kleine lettertjes', 'foot.terms': 'Algemene voorwaarden', 'foot.privacy': 'Privacyverklaring',
    'foot.coc': 'KvK 930 432 44', 'foot.vat': 'Btw NL 866 257 561 B01',
    'foot.concept': 'Conceptontwerp van Dolcessi, niet de officiële website van World of Karaoke.',
    'foot.photos': "Foto's: de eigen website en Instagram van World of Karaoke, alleen gebruikt voor dit concept.",
    'finder.get': 'Twee uur in je eigen kamer met twee draadloze microfoons en 100.000 nummers. Drankjes bestel je naar de kamer met de QR-code.',
    'menu.h': 'De vijftiende kamer is de <span class="nw" style="--h:#ffcf7a">bar</span>',
    'menu.p': 'Veertien steden in de gang, en de bar doet de rest van de kaart. Dit is de hele drankkaart, zodat je je eerste rondje al kunt kiezen voor je er bent. Eten wordt niet geserveerd.',
    'menu.end': '<b>Een kamer kost €19 of €23 per persoon</b> voor twee uur. Drankjes bestel je naar de kamer, prijzen zoals hierboven.',
    'menu.fine': 'Prijzen van de kaart van juni 2025. De plaatsnamen zijn waar een drankje is bedacht of waar de fles vandaan komt.',
    'groups.find': 'Vind een kamer voor acht',
    'groups.more': 'Met meer dan 25, of een datum buiten openingstijden? Mail info@worldofkaraoke.nl of bel +31 6 22 95 50 04 en we plannen het samen.',
    'seen.h': 'Gezien in de kamers',
    'faq.q9': 'Mogen we een verjaardagstaart meenemen?',
    'faq.a9': 'Ja. Zet het in het opmerkingenveld als je boekt en neem zelf bordjes en bestek mee. Ander eten en drinken van buiten is niet toegestaan.',
    'sip.h': 'Sip, savor, repeat',
    'sip.p': 'Drie van de eigen kaart van de bar, zoals ze geserveerd worden. Scroll door en ze komen naar je toe.',
    'sip.hint': 'Scroll',
    'sip.end': 'Van frisdrank voor <b>€4,30</b> tot een fles prosecco voor <b>€49</b>. De hele kaart staat hieronder.',
    'sip.end2': 'In je kamer bestel je met de QR-code, en een host brengt het binnen.',
    'sip.cta': 'Bekijk de hele kaart',
    'sip.t.japan': 'Japan',
    'sip.t.london': 'Londen',
    'sip.t.havana': 'Havana',
    'sip.uisuki.t': 'Zacht en citrusachtig',
    'sip.uisuki.i': 'Japanse whisky, yuzulikeur, citroen, suiker, eiwit',
    'sip.uisuki.l': 'Uisukī is hoe Japan whisky zegt.',
    'sip.espresso.t': 'Bitterzoet en romig',
    'sip.espresso.i': 'Wodka, koffielikeur, espresso, suiker',
    'sip.espresso.l': 'Drie koffiebonen erop.',
    'sip.mojito.t': 'Fris en zoet',
    'sip.mojito.i': 'Rum, limoen, verse munt, suiker, soda',
    'sip.mojito.l': 'Limoen of aardbei, jij kiest.',
    'visit.sub': 'Metro en bushalte vlakbij. Te laat? Bel ons: we houden je kamer tot 15 minuten vast.',
    'visit.st1': 'Station Sloterdijk',
    'visit.st1s': 'Metrolijn 50 en 51, en de trein',
    'visit.st2': 'Halte La Guardiaweg',
    'visit.st2s': 'Buslijn 22, 36, 103, 272 en 395',
    'visit.late': 'Te laat',
    'visit.late.t': 'Bel +31 6 22 95 50 04. We houden je kamer tot 15 minuten na de starttijd vast.',
    'visit.ov': 'Plan met het OV',
    'faq.q10': 'Kunnen we na twee uur doorzingen?',
    'faq.a10': 'Als je kamer voor de volgende sessie niet geboekt is, kun je tegen betaling langer blijven. Is hij wel geboekt, dan zoekt het team een andere vrije kamer.',
    'faq.q11': 'Mogen kinderen mee?',
    'faq.a11': 'Ja. Gasten onder de 16 hebben minstens één ouder of voogd (18+) bij zich. Een vroeg tijdslot, zoals zaterdag- of zondagmiddag, is het rustigst.',
    'foot.visit': 'Bezoek',
    'foot.reach': 'Metro 50 en 51 naar Sloterdijk. Bus 22, 36, 103, 272 of 395 naar La Guardiaweg.',
    'foot.hours': 'Openingstijden',
    'foot.h1': 'wo, do, zo',
    'foot.h2': 'vr, za',
    'foot.h3': 'ma, di',
    'foot.explore': 'Ontdek',
    'foot.faq': 'Veelgestelde vragen',
    'foot.cta': 'Je kamer wacht op je.',
    'foot.photos': 'Foto\'s van de website en Instagram van World of Karaoke.',
    'dock.sub': 'Twee uur, je eigen kamer'
  };

  var T = {
    en: {
      dshort: { wed: 'Wed', thu: 'Thu', fri: 'Fri', sat: 'Sat', sun: 'Sun' },
      dlong: { wed: 'Wednesday', thu: 'Thursday', fri: 'Friday', sat: 'Saturday', sun: 'Sunday' },
      rooms: function (n) { return n + (n === 1 ? ' room' : ' rooms'); },
      fit: function (n, p) { return (n === 1 ? 'fits ' : 'fit ') + p + ' people'; },
      count: function (n, p) { return T.en.rooms(n) + ' ' + T.en.fit(n, p) + '.'; },
      ktvn: function (k, n) { return !k ? '' : k === n ? (n === 1 ? 'It runs on Chinese KTV only.' : 'They run on Chinese KTV only.') : (k === 1 ? '1 is Chinese KTV only.' : k + ' are Chinese KTV only.'); },
      price: function (e) { return '€' + e + ' per person'; },
      ktvOnly: '中文 KTV only', ktvPlus: '+ 中文 KTV',
      wall: 'On the wall',
      pick: 'Tap the session you want',
      recap: function (d, room, t, p) { return 'Opens worldofkaraoke.nl. Choose there: ' + [T.en.dlong[d], room].concat(t ? [t] : []).concat([p + ' people']).join(', ') + '.'; },
      showRoom: function (n) { return 'Show the ' + n + ' room'; },
      upTo: ' to ', mOpen: 'open', priceRange: 'Prices',
      eur: function (v) { return '€' + (Math.round(v) === v ? v : v.toFixed(2)); },
      go: function (n) { return n === 1 ? 'Show me the room' : 'Show me the ' + n + ' rooms'; },
      bar: function (n, p, d, e) { return T.en.rooms(n) + ' ' + T.en.fit(n, p) + ' on ' + T.en.dlong[d] + '. <b>€' + e + ' per person</b> for two hours.'; },
      people: 'People', size: 'Size', system: 'Catalogue',
      sys: { std: 'Regular', only: 'Chinese KTV only', plus: 'Regular and Chinese KTV' },
      range: function (r) { return r.min + ' to ' + r.max; },
      sess: function (d) { return 'Sessions on ' + T.en.dlong[d]; },
      pp: function (e) { return '€' + e + ' per person'; },
      total: function (e, p) { return '€' + e * p + ' for ' + p + ' people, two hours'; },
      check: function (n) { return 'Check availability for ' + n; },
      move: 'Plans change? You can move your booking once, up to 72 hours before your session.',
      warn: function (r, p) { return r.name + ' is for ' + r.min + ' to ' + r.max + ' people. '; },
      warnBtn: function (p) { return 'Show a room for ' + p; },
      inside: function (n) { return 'Inside ' + n; },
      dock: function (e, d) { return '€' + e + ' per person on ' + T.en.dlong[d]; },
      outro: 'Opens worldofkaraoke.nl. Move your booking once, up to 72 hours before.',
      open: 'Open', closed: 'Open',
      until: function (t) { return 'until ' + t; },
      opens: function (day, t) { return 'opens ' + day + ' ' + t; },
      wks: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
      today: 'today',
      wk: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
      less: 'One person fewer', more: 'One person more', lang: 'Schakel naar Nederlands',
      todayTag: 'tonight'
    },
    nl: {
      dshort: { wed: 'wo', thu: 'do', fri: 'vr', sat: 'za', sun: 'zo' },
      dlong: { wed: 'woensdag', thu: 'donderdag', fri: 'vrijdag', sat: 'zaterdag', sun: 'zondag' },
      rooms: function (n) { return n + (n === 1 ? ' kamer' : ' kamers'); },
      fit: function (n, p) { return (n === 1 ? 'past bij ' : 'passen bij ') + p + ' personen'; },
      count: function (n, p) { return T.nl.rooms(n) + ' ' + T.nl.fit(n, p) + '.'; },
      ktvn: function (k, n) { return !k ? '' : k === n ? (n === 1 ? 'Die werkt alleen met Chinese KTV.' : 'Die werken alleen met Chinese KTV.') : (k === 1 ? '1 werkt alleen met Chinese KTV.' : k + ' werken alleen met Chinese KTV.'); },
      price: function (e) { return '€' + e + ' per persoon'; },
      ktvOnly: 'alleen 中文 KTV', ktvPlus: '+ 中文 KTV',
      wall: 'Op de muur',
      pick: 'Tik op de sessie die je wilt',
      recap: function (d, room, t, p) { return 'Opent worldofkaraoke.nl. Kies daar: ' + [T.nl.dlong[d], room].concat(t ? [t] : []).concat([p + ' personen']).join(', ') + '.'; },
      showRoom: function (n) { return 'Toon de kamer ' + n; },
      upTo: ' tot ', mOpen: 'open', priceRange: 'Prijzen',
      eur: function (v) { return '€' + (Math.round(v) === v ? String(v) : v.toFixed(2).replace('.', ',')); },
      go: function (n) { return n === 1 ? 'Laat de kamer zien' : 'Laat de ' + n + ' kamers zien'; },
      bar: function (n, p, d, e) { return T.nl.rooms(n) + ' ' + T.nl.fit(n, p) + ' op ' + T.nl.dlong[d] + '. <b>€' + e + ' per persoon</b> voor twee uur.'; },
      people: 'Personen', size: 'Grootte', system: 'Catalogus',
      sys: { std: 'Regulier', only: 'Alleen Chinese KTV', plus: 'Regulier en Chinese KTV' },
      range: function (r) { return r.min + ' tot ' + r.max; },
      sess: function (d) { return 'Sessies op ' + T.nl.dlong[d]; },
      pp: function (e) { return '€' + e + ' per persoon'; },
      total: function (e, p) { return '€' + e * p + ' voor ' + p + ' personen, twee uur'; },
      check: function (n) { return 'Bekijk beschikbaarheid ' + n; },
      move: 'Verandert er iets? Je kunt je boeking één keer verplaatsen, tot 72 uur voor je sessie.',
      warn: function (r, p) { return r.name + ' is voor ' + r.min + ' tot ' + r.max + ' personen. '; },
      warnBtn: function (p) { return 'Toon een kamer voor ' + p; },
      inside: function (n) { return 'Binnen in ' + n; },
      dock: function (e, d) { return '€' + e + ' per persoon op ' + T.nl.dlong[d]; },
      outro: 'Opent worldofkaraoke.nl. Verplaats je boeking één keer, tot 72 uur van tevoren.',
      open: 'Open', closed: 'Open',
      until: function (t) { return 'tot ' + t; },
      opens: function (day, t) { return 'open vanaf ' + day + ' ' + t; },
      wks: ['zo', 'ma', 'di', 'wo', 'do', 'vr', 'za'],
      today: 'vandaag',
      wk: ['zondag', 'maandag', 'dinsdag', 'woensdag', 'donderdag', 'vrijdag', 'zaterdag'],
      less: 'Eén persoon minder', more: 'Eén persoon meer', lang: 'Switch to English',
      todayTag: 'vanavond'
    }
  };

  /* ------------------------------------------------------------------ state */
  var state = { lang: 'en', people: 4, day: 'fri', room: null, today: null, sess: null };
  try { var saved = localStorage.getItem('wok_lang'); if (saved === 'nl' || saved === 'en') state.lang = saved; } catch (e) {}

  function ams() {
    var parts = {}; var now = new Date();
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
    var n = ams(), L = T[state.lang];
    var y = (n.d + 6) % 7;
    if (HOURS[y] && HOURS[y][1] > 24 && n.m < (HOURS[y][1] - 24) * 60) return { open: true, note: L.until(hhmm(HOURS[y][1])), day: y };
    if (HOURS[n.d] && n.m >= HOURS[n.d][0] * 60) return { open: true, note: L.until(hhmm(HOURS[n.d][1])), day: n.d };
    if (HOURS[n.d] && n.m < HOURS[n.d][0] * 60) return { open: false, note: L.opens(L.today, hhmm(HOURS[n.d][0])), short: L.opens(L.today, hhmm(HOURS[n.d][0])), day: n.d };
    for (var i = 1; i < 8; i++) { var d = (n.d + i) % 7; if (HOURS[d]) return { open: false, note: L.opens(L.wk[d], hhmm(HOURS[d][0])), short: L.opens(L.wks[d], hhmm(HOURS[d][0])), day: n.d }; }
    return { open: false, note: '', day: n.d };
  }
  function defaultDay() {
    var n = ams();
    for (var i = 0; i < 7; i++) {
      var d = (n.d + i) % 7;
      if (!HOURS[d]) continue;
      if (i === 0 && n.m > 21 * 60 + 45) continue; // last session has started
      for (var k in DAY_IDX) if (DAY_IDX[k] === d) { if (i === 0) state.today = k; return k; }
    }
    return 'fri';
  }

  function fits(r, p) { return p >= r.min && p <= r.max; }
  function sessions(r, day) {
    var out = [], late = (day === 'fri' || day === 'sat') && r.start !== 1035;
    for (var k = 0; k < (late ? 4 : 3); k++) { var s = r.start + k * 135; out.push({ t: tfmt(s) + ' – ' + tfmt(s + 120), late: k === 3 }); }
    return out;
  }

  /* ------------------------------------------------------------------ i18n */
  var EN = {};
  function applyLang() {
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
    $$('[data-book]').forEach(function (a) { a.href = BOOK[state.lang]; });
    $$('[data-menu]').forEach(function (a) { a.href = MENU[state.lang]; });
    var lb = $('#lang'); lb.setAttribute('aria-label', T[state.lang].lang);
    lb.children[0].classList.toggle('on', !nl); lb.children[1].classList.toggle('on', nl);
    $$('[data-step="-1"]').forEach(function (b) { b.setAttribute('aria-label', T[state.lang].less); });
    $$('[data-step="1"]').forEach(function (b) { b.setAttribute('aria-label', T[state.lang].more); });
    $$('[data-goroom]').forEach(function (b) { b.setAttribute('aria-label', T[state.lang].showRoom(b.textContent)); });
  }

  /* ------------------------------------------------------------------ render */
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }

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

  var wall = $('#signwall'), panel = $('#room');
  function buildWall() {
    wall.innerHTML = ROOMS.map(function (r) {
      return '<button type="button" aria-pressed="false" class="csign' + (r.script ? ' script' : '') + '" data-room="' + r.id + '" style="--h:' + r.hue + ';--s:' + r.s + '">' +
        '<span class="tube">' + esc(r.name) + '</span><small>' + r.min + '–' + r.max + (r.ktv ? ' <i lang="zh-Hans">' + (r.ktv === 'only' ? T[state.lang].ktvOnly : T[state.lang].ktvPlus) + '</i>' : '') + '</small></button>';
    }).join('');
  }
  function flick(el, cls, seq) { // seq: ms steps toggling cls, ends with cls removed
    if (!MOTION) { el.classList.remove(cls); return; }
    var t = 0, on = true; el.classList.add(cls);
    seq.forEach(function (ms) { t += ms; on = !on; (function (state_) { setTimeout(function () { el.classList.toggle(cls, state_); }, t); })(on); });
    setTimeout(function () { el.classList.remove(cls); }, t + 20);
  }
  var SEQS = [[60, 50, 40], [40, 70, 30, 90, 50], [90], [30, 40, 30, 40, 120, 60, 40]];
  function rnd(a, b) { return a + Math.random() * (b - a); }

  var wallSeen = !MOTION;
  function renderWall(animate) {
    var p = state.people;
    $$('.csign', wall).forEach(function (b, i) {
      var r = ROOMS[i], f = fits(r, p), was = b.classList.contains('fit');
      b.classList.toggle('fit', f);
      b.classList.toggle('sel', state.room === r.id);
      b.setAttribute('aria-pressed', state.room === r.id ? 'true' : 'false');
      if (f && (!was || animate) && wallSeen) {
        var seq = SEQS[Math.floor(Math.random() * SEQS.length)].slice(); seq[0] += animate ? i * 70 : rnd(0, 160);
        flick(b, 'dip', seq);
      } else if (f && !wallSeen) { b.classList.add('dip'); }
    });
  }

  function renderPanel() {
    var L = T[state.lang], r = ROOMS.filter(function (x) { return x.id === state.room; })[0];
    if (!r) return;
    var p = state.people, e = PRICE[state.day], f = fits(r, p);
    var media = r.pic
      ? '<img src="img/room-' + r.id + '-800.webp" srcset="img/room-' + r.id + '-800.webp 800w, img/room-' + r.id + '-1400.webp 1400w" sizes="(max-width:1040px) 92vw, 44vw" alt="' + esc(L.inside(r.name)) + '"><figcaption>' + esc(L.inside(r.name)) + '</figcaption>'
      : '<div class="big' + (r.script ? ' script' : '') + '">' + esc(r.name) + '</div>';
    var ss = sessions(r, state.day);
    if (state.sess != null && !ss[state.sess]) state.sess = null;
    var sess = ss.map(function (s, k) { return '<li><button type="button" data-sess="' + k + '" aria-pressed="' + (state.sess === k ? 'true' : 'false') + '"' + (s.late ? ' class="late"' : '') + '>' + s.t + '</button></li>'; }).join('');
    var warn = f ? '' : '<p class="room-warn">' + esc(L.warn(r, p)) + '<button type="button" data-first>' + esc(L.warnBtn(p)) + '</button></p>';
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
        '<a class="btn ' + (f ? 'btn-gold' : 'btn-line') + ' btn-wide" target="_blank" rel="noopener" href="' + BOOK[state.lang] + '">' + esc(L.check(r.name)) + '</a>' +
        '<p class="fine recap">' + esc(L.recap(state.day, r.name, picked, p)) + '</p>' +
        '<p class="fine">' + L.move + '</p>' +
      '</div>';
  }

  /* ---------------------------------------------------------------- set list (drinks) */
  var setlist = $('#setlist'), tagsSeen = !MOTION, M = window.WOK_MENU || { groups: [], places: {} };
  function tx(v) { return v == null ? '' : typeof v === 'string' ? v : v[state.lang] || v.en; }
  function rowPrices(r) { return r.ps ? r.ps.map(function (x) { return x.p; }) : r.p != null ? [r.p] : []; }
  function renderMenu() {
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

  function firstFit() { // prefer a room on the regular catalogue that we have a photo of
    var p = state.people, f = ROOMS.filter(function (r) { return fits(r, p); });
    var best = f.filter(function (r) { return r.ktv !== 'only' && r.pic; })[0] || f.filter(function (r) { return r.ktv !== 'only'; })[0] || f[0] || ROOMS[0];
    return best.id;
  }

  function renderOut() {
    var L = T[state.lang], p = state.people, e = PRICE[state.day];
    var n = ROOMS.filter(function (r) { return fits(r, p); }).length;
    var k = ROOMS.filter(function (r) { return fits(r, p) && r.ktv === 'only'; }).length;
    $('[data-out="count"]').textContent = L.count(n, p);
    $('[data-out="ktvnote"]').textContent = L.ktvn(k, n);
    $('[data-out="price"]').textContent = L.price(e);
    $('[data-out="go"]').textContent = L.go(n);
    $('[data-out="bar"]').innerHTML = L.bar(n, p, state.day, e);
    $('[data-out="dockprice"]').textContent = L.dock(e, state.day);
    $('[data-out="outro"]').textContent = L.outro;
    $('#people').value = p; $('#people2').value = p;
    $$('.days input').forEach(function (i) { i.checked = i.value === state.day; });
  }

  function renderOpen() {
    var L = T[state.lang], o = openState();
    $$('[data-open-word]').forEach(function (w) { w.textContent = L.open; w.parentNode.setAttribute('data-state', o.open ? 'open' : 'closed'); });
    $$('[data-open-note]').forEach(function (n) { n.textContent = o.note; });
    $$('[data-open-short]').forEach(function (n) { n.textContent = o.short || o.note; });
    var d = ams().d; $$('.hours tr').forEach(function (tr) { tr.classList.toggle('today', +tr.getAttribute('data-d') === d); });
  }

  function update(opts) {
    opts = opts || {};
    if (opts.day) state.sess = null;
    var cur = ROOMS.filter(function (x) { return x.id === state.room; })[0];
    if (!cur || (opts.people && !fits(cur, state.people))) { state.room = firstFit(); state.sess = null; }
    renderOut(); renderWall(opts.animate); renderPanel();
  }
  function setPeople(v, src) {
    v = Math.max(2, Math.min(25, parseInt(v, 10) || 2));
    if (v === state.people && src !== 'force') { renderOut(); return; }
    state.people = v; update({ people: true });
  }

  /* ------------------------------------------------------------------ hero sign */
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
  var faultTimer = null, heroVisible = true;
  function fault() {
    clearTimeout(faultTimer);
    faultTimer = setTimeout(function () {
      if (power && heroVisible && !document.hidden) {
        var u = Math.random() < 0.6 ? 10 : Math.floor(Math.random() * UNITS); // unit 10: the tube that never quite behaves
        var seq = Math.random() < 0.5 ? [50, 40, 60] : [40, 30, 30, 90, 40];
        var t = 0, on = true; seq.forEach(function (ms) { t += ms; on = !on; (function (s) { setTimeout(function () { setUnit(u, s); }, t); })(on); });
        setTimeout(function () { setUnit(u, true); }, t + 30);
      }
      fault();
    }, rnd(5200, 12500));
  }
  var power = true, busy = false;
  function switchSign() {
    if (busy) return;
    power = !power; sign.setAttribute('aria-pressed', power ? 'true' : 'false');
    if (!MOTION) { root.classList.toggle('pre', !power); hero.style.setProperty('--lit', power ? '1' : '0.12'); return; }
    clearTimeout(faultTimer);
    if (!power) { // cut the power: everything drops at once, one tube hangs on for a moment
      var hang = Math.floor(Math.random() * UNITS);
      for (var k = 0; k < UNITS; k++) if (k !== hang) setUnit(k, false);
      setTimeout(function () { setUnit(hang, false); hero.style.setProperty('--lit', '0.12'); }, 140);
    } else { busy = true; ignite(); setTimeout(function () { busy = false; }, 2600); }
  }
  function ignite() {
    if (!MOTION) { hero.style.setProperty('--lit', '1'); return; }
    for (var i = 0; i < UNITS; i++) lit[i] = false;
    litN = 0; hero.style.setProperty('--lit', '0.12');
    var end = 0, base = 420;
    for (var u = 0; u < UNITS; u++) {
      var at = base + (u < 5 ? u * 105 : u === 5 ? 640 : u === 6 ? 800 : 930 + (u - 7) * 92) + rnd(-25, 25);
      var seq = u === 5 ? [50, 45, 30, 40, 40, 140] : SEQS[Math.floor(Math.random() * 3)].map(function (x) { return x + rnd(-10, 14); });
      seq = seq.length % 2 ? seq.concat([40]) : seq; // must end lit
      end = Math.max(end, strike(u, at, seq));
    }
    // one voltage sag once everything is up, then steady
    setTimeout(function () { sign.style.opacity = '.35'; hero.style.setProperty('--lit', '0.3'); }, end + 260);
    setTimeout(function () { sign.style.opacity = ''; hero.style.setProperty('--lit', '1'); }, end + 330);
    setTimeout(function () { sign.style.opacity = '.6'; }, end + 420);
    setTimeout(function () { sign.style.opacity = ''; if (!power) return; for (var k = 0; k < UNITS; k++) setUnit(k, true); fault(); }, end + 470);
  }

  /* ------------------------------------------------------------------ mirror-ball specks */
  function specks() {
    var c = $('#specks'); if (!c || !c.getContext) return;
    var x = c.getContext('2d'), W = 0, H = 0, dpr = Math.min(window.devicePixelRatio || 1, 1.5), pts = [], raf = 0, last = 0;
    var cols = ['255,244,220', '138,244,242', '255,120,190', '170,150,255'];
    function size() { var r = c.getBoundingClientRect(); W = r.width; H = r.height; c.width = W * dpr; c.height = H * dpr; x.setTransform(dpr, 0, 0, dpr, 0, 0); }
    function seed() {
      pts = []; var n = Math.round(Math.min(40, Math.max(14, W / 34)));
      for (var i = 0; i < n; i++) pts.push({ a: Math.random() * 6.283, r: 0.25 + Math.random() * 0.95, y: Math.random(), s: 3 + Math.random() * 9, c: cols[i % cols.length], w: 0.5 + Math.random(), ph: Math.random() * 6.283 });
    }
    function draw(t) {
      x.clearRect(0, 0, W, H); x.globalCompositeOperation = 'lighter';
      for (var i = 0; i < pts.length; i++) {
        var p = pts[i], a = p.a + t * 0.00006 * p.w;
        var px = W * (0.5 + Math.cos(a) * p.r * 0.62), py = H * (0.08 + p.y * 0.84) + Math.sin(a * 1.7 + p.ph) * 14;
        var depth = (Math.sin(a) + 1) / 2, al = (0.05 + 0.2 * depth) * (0.6 + 0.4 * Math.sin(t * 0.0012 * p.w + p.ph));
        var rad = p.s * (0.7 + depth * 1.4);
        var g = x.createRadialGradient(px, py, 0, px, py, rad);
        g.addColorStop(0, 'rgba(' + p.c + ',' + al.toFixed(3) + ')'); g.addColorStop(1, 'rgba(' + p.c + ',0)');
        x.fillStyle = g; x.beginPath(); x.ellipse(px, py, rad * 1.5, rad, 0, 0, 6.283); x.fill();
      }
    }
    function loop(t) { raf = requestAnimationFrame(loop); if (document.hidden || t - last < 40) return; last = t; draw(t); }
    size(); seed();
    if (!MOTION) { draw(4000); return; }
    window.addEventListener('resize', function () { size(); seed(); });
    new IntersectionObserver(function (e) {
      heroVisible = e[0].isIntersecting; cancelAnimationFrame(raf); if (heroVisible) raf = requestAnimationFrame(loop);
    }, { threshold: 0 }).observe(hero);
  }


  /* ---------------------------------------------------------------- loader (after their own: the Ki sign swings in, then the screen slides away left) */
  function loader() {
    var el = $('#loader'); if (!el) return 0;
    if (!MOTION) { el.remove(); return 0; }
    var seen = false; try { seen = sessionStorage.getItem('wok_seen') === '1'; sessionStorage.setItem('wok_seen', '1'); } catch (e) {}
    var hold = seen ? 380 : 1150;
    el.classList.add('run');
    setTimeout(function () { el.classList.add('out'); }, hold);
    setTimeout(function () { el.remove(); }, hold + 800);
    return hold + 760;
  }

  /* ---------------------------------------------------------------- neon words: strike on when seen, then now and then one tube stutters */
  var nwVisible = new Set(), nwIO = null;
  function neonWords() {
    var els = $$('.nw');
    if (!MOTION) { els.forEach(function (e) { e.classList.add('lit'); }); return; }
    if (!('IntersectionObserver' in window)) { els.forEach(function (e) { e.classList.add('lit'); }); return; }
    var io = nwIO = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        var n = e.target;
        if (e.isIntersecting) {
          nwVisible.add(n);
          if (!n.classList.contains('lit')) { var t = 120, on = false; [0, 70, 50, 40, 110, 50].forEach(function (ms) { t += ms; on = !on; (function (s) { setTimeout(function () { n.classList.toggle('lit', s); }, t); })(on); }); setTimeout(function () { n.classList.add('lit'); }, t + 40); }
        } else nwVisible.delete(n);
      });
    }, { threshold: 0.6 });
    els.forEach(function (e) { io.observe(e); });
    (function tick() {
      setTimeout(function () {
        if (!document.hidden && nwVisible.size) {
          var arr = Array.from(nwVisible).filter(function (n) { return n.classList.contains('lit'); });
          var n = arr[Math.floor(Math.random() * arr.length)];
          if (n) { n.classList.add('stutter'); setTimeout(function () { n.classList.remove('stutter'); }, 620); }
        }
        tick();
      }, rnd(3200, 6800));
    })();
  }

  /* ---------------------------------------------------------------- buttons: gold buttons switch on like a sign the first time they scroll into view */
  function buttons() {
    if (!MOTION || !('IntersectionObserver' in window)) return;
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { io.unobserve(e.target); e.target.classList.add('strike'); setTimeout(function () { e.target.classList.remove('strike'); }, 900); } });
    }, { threshold: 0.9 });
    $$('.btn-gold').forEach(function (b) { if (!b.closest('.nav')) io.observe(b); });
  }

  /* ---------------------------------------------------------------- tap: a neon ring and the star from the logo's mic. Fires on click, so a phone scroll never triggers it */
  function taps() {
    var host = $('#taps'); if (!host || !MOTION) return;
    var pool = [], k = 0;
    for (var i = 0; i < 4; i++) { var d = document.createElement('span'); d.className = 'tap'; d.innerHTML = '<i class="ring"></i><i class="st s1"></i><i class="st s2"></i><i class="st s3"></i>'; host.appendChild(d); pool.push(d); }
    document.addEventListener('click', function (ev) {
      if (!ev.detail) return; // keyboard
      var t = ev.target.closest('a,button,summary,label,.csign,.trk');
      if (!t) return;
      var d = pool[k++ % pool.length];
      d.classList.remove('go'); d.style.transform = 'translate(' + ev.clientX + 'px,' + ev.clientY + 'px)';
      d.style.setProperty('--h', t.closest('[style*="--h"]') ? getComputedStyle(t.closest('[style*="--h"]')).getPropertyValue('--h') : '#8af4f2');
      void d.offsetWidth; d.classList.add('go');
    }, { passive: true });
  }

  /* ---------------------------------------------------------------- sideways section: vertical scroll drives the cocktails sideways */
  function sideways() {
    var sec = $('#sip'), track = $('#sipTrack'), bar = $('#sipBar'); if (!sec || !track) return;
    var wide = MOTION && window.matchMedia('(min-width: 1px)').matches;
    if (!MOTION) { sec.classList.add('native'); return; }
    var dist = 0, top = 0, raf = 0, active = false, lastW = 0, cur = 0, tgt = 0, lastT = 0;
    function target() { return dist ? Math.min(1, Math.max(0, (window.scrollY - top) / dist)) : 0; }
    function measure() {
      lastW = window.innerWidth;
      dist = Math.max(0, track.scrollWidth - window.innerWidth);
      sec.style.height = (window.innerHeight + dist) + 'px';
      top = sec.getBoundingClientRect().top + window.scrollY;
      cur = tgt = target(); set();
    }
    function set() {
      track.style.transform = 'translate3d(' + (-cur * dist).toFixed(2) + 'px,0,0)';
      if (bar) bar.style.transform = 'scaleX(' + cur.toFixed(4) + ')';
    }
    function paint(t) {
      var dt = lastT ? Math.min(64, t - lastT) : 16.7; lastT = t;
      tgt = target();
      cur += (tgt - cur) * (1 - Math.pow(1 - 0.16, dt / 16.7));   // ease toward the scroll position
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
    // keyboard users: focusing inside a panel scrolls the page to it
    track.addEventListener('focusin', function (e) {
      var panel = e.target.closest('.sip-panel'); if (!panel) return;
      window.scrollTo({ top: top + Math.min(dist, panel.offsetLeft), behavior: 'auto' });
    });
  }

  /* ------------------------------------------------------------------ wiring */
  var LD = 0;
  function init() {
    LD = loader();
    state.day = defaultDay();
    applyLang(); renderDays(); buildWall(); renderMenu();
    state.room = firstFit();
    update(); renderOpen();
    setInterval(renderOpen, 60000);

    $$('.stepper').forEach(function (st) {
      var inp = $('input', st);
      $$('button', st).forEach(function (b) { b.addEventListener('click', function () { setPeople(state.people + parseInt(b.getAttribute('data-step'), 10)); }); });
      inp.addEventListener('change', function () { setPeople(inp.value, 'force'); });
      inp.addEventListener('focus', function () { inp.select(); });
    });
    document.addEventListener('change', function (ev) {
      var t = ev.target; if (t && t.matches && t.matches('.days input')) { state.day = t.value; update({ day: true }); }
    });
    $('#finder').addEventListener('submit', function (ev) { ev.preventDefault(); go('#rooms'); });
    wall.addEventListener('click', function (ev) {
      var b = ev.target.closest('.csign'); if (!b) return;
      state.room = b.getAttribute('data-room'); state.sess = null; renderWall(); renderPanel();
      if (window.matchMedia('(max-width:1040px)').matches) panel.scrollIntoView({ behavior: MOTION ? 'smooth' : 'auto', block: 'nearest' });
    });
    panel.addEventListener('click', function (ev) {
      if (ev.target.closest('[data-first]')) { state.room = firstFit(); state.sess = null; renderWall(); renderPanel(); return; }
      var sb = ev.target.closest('[data-sess]');
      if (sb) { var k = +sb.getAttribute('data-sess'); state.sess = state.sess === k ? null : k; renderPanel(); var nb = $('[data-sess="' + k + '"]', panel); if (nb) nb.focus(); }
    });
    $('#lang').addEventListener('click', function () {
      state.lang = state.lang === 'en' ? 'nl' : 'en';
      try { localStorage.setItem('wok_lang', state.lang); } catch (e) {}
      applyLang(); renderDays(); buildWall(); renderMenu(); update(); renderOpen();
      nwVisible.clear(); $$('.nw').forEach(function (n) { n.classList.add('lit'); if (nwIO) nwIO.observe(n); });
    });

    function go(sel) { var el = $(sel); if (el) el.scrollIntoView({ behavior: MOTION ? 'smooth' : 'auto', block: 'start' }); }
    document.addEventListener('click', function (ev) {
      var gr = ev.target.closest('[data-goroom]');
      if (gr) { state.room = gr.getAttribute('data-goroom'); state.sess = null; renderWall(); renderPanel(); go('#rooms'); return; }
      var sp = ev.target.closest('[data-setpeople]');
      if (sp) { setPeople(sp.getAttribute('data-setpeople'), 'force'); go('#rooms'); return; }
      var a = ev.target.closest('a[href^="#"]'); if (!a) return;
      var id = a.getAttribute('href'); if (id.length < 2) return;
      if ($(id)) { ev.preventDefault(); go(id); }
    });

    var nav = $('#nav'), dock = $('#dock'), goBtn = $('[data-out="go"]'), outro = $('.outro'), pastFinder = false, atOutro = false;
    function onScroll() { nav.classList.toggle('solid', window.scrollY > 40); }
    window.addEventListener('scroll', onScroll, { passive: true }); onScroll();
    function dockState() { var s = pastFinder && !atOutro; dock.classList.toggle('show', s); dock.setAttribute('aria-hidden', s ? 'false' : 'true'); $('a', dock).tabIndex = s ? 0 : -1; }
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (e) { pastFinder = !e[0].isIntersecting; dockState(); }).observe(goBtn);
      new IntersectionObserver(function (e) { atOutro = e[0].isIntersecting; dockState(); }, { threshold: 0.35 }).observe(outro);

      // signs come on the first time the wall is seen
      new IntersectionObserver(function (e, io) {
        if (!e[0].isIntersecting) return; io.disconnect(); wallSeen = true;
        $$('.csign.fit', wall).forEach(function (b, i) { var seq = SEQS[i % SEQS.length].slice(); seq[0] += 120 + i * 90; b.classList.remove('dip'); flick(b, 'dip', seq); });
      }, { threshold: 0.08, rootMargin: '0px 0px -18% 0px' }).observe(wall);

      // karaoke line fills once, the way lyrics do on the screen
      var lyric = $('#lyric');
      new IntersectionObserver(function (e, io) { if (e[0].isIntersecting) { io.disconnect(); setTimeout(function () { lyric.classList.add('sung'); }, 300); } }, { threshold: 0.8 }).observe(lyric);

      // place tags on the set list warm up once, like tubes
      new IntersectionObserver(function (e, io) {
        if (!e[0].isIntersecting) return; io.disconnect(); tagsSeen = true;
        $$('.tag.neon', setlist).forEach(function (el, i) { var seq = SEQS[i % SEQS.length].slice(); seq[0] += 80 + i * 70; flick(el, 'dip', seq); });
      }, { threshold: 0.12 }).observe(setlist);

      // closing line strikes on
      $$('[data-neon]').forEach(function (el) {
        new IntersectionObserver(function (e, io) {
          if (!e[0].isIntersecting) return; io.disconnect();
          if (!MOTION) { el.classList.add('on'); return; }
          var t = 200, on = false; [0, 60, 50, 40, 90, 40, 160].forEach(function (ms) { t += ms; on = !on; (function (s) { setTimeout(function () { el.classList.toggle('on', s); }, t); })(on); });
          setTimeout(function () { el.classList.add('on'); }, t + 30);
        }, { threshold: 0.5 }).observe(el);
      });
    } else { wallSeen = true; $$('.dip').forEach(function (n) { n.classList.remove('dip'); }); $$('[data-neon]').forEach(function (n) { n.classList.add('on'); }); $('#lyric').classList.add('sung'); tagsSeen = true; $$('.tag.dip').forEach(function (n) { n.classList.remove('dip'); }); }

    sign.addEventListener('click', switchSign);
    specks(); neonWords(); buttons(); taps(); sideways();
    $$('img[loading="lazy"]').forEach(function (im) {
      im.decoding = 'async';
      if (im.complete && im.naturalWidth) im.classList.add('in');
      else { im.addEventListener('load', function () { im.classList.add('in'); }, { once: true }); im.addEventListener('error', function () { im.classList.add('in'); }, { once: true }); }
    });
    window.addEventListener('load', function () {
      var go = function () { $$('img[loading="lazy"]').forEach(function (im) { im.loading = 'eager'; }); };
      if ('requestIdleCallback' in window) requestIdleCallback(go, { timeout: 2500 }); else setTimeout(go, 1200);
    });
    if (document.fonts && document.fonts.ready) { var started = false; var st = function () { if (!started) { started = true; setTimeout(ignite, LD); } }; document.fonts.ready.then(st); setTimeout(st, 900); } else ignite();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
