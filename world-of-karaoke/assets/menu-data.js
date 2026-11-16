/* World of Karaoke drinks card, transcribed from their printed card "Menu 06/25" (read 16 Nov 2026). Prices in euro.
   Organised as a set list. Every item, description and price is from the card; grouping and place tags are the concept's.
   tag: place label. Cocktail origins (Havana, London, Mexico, Bermuda) are standard cocktail history, not from the card;
   country labels in B-sides are the ones the card prints. pic: one of the three cocktails their own menu page features. */
window.WOK_MENU = {
  groups: [
    { id: 'headliners', open: 1, name: { en: 'Headliners', nl: 'Headliners' }, what: { en: 'Cocktails', nl: 'Cocktails' }, rows: [
      { n: 'Uisukī Sour', p: 16.5, tag: 'japan', pic: 'uisuki', d: { en: 'Smooth and citrusy. Japanese whisky, yuzu liqueur, lemon, sugar, egg white. Uisukī is how Japan says whisky.', nl: 'Zacht en citrusachtig. Japanse whisky, yuzulikeur, citroen, suiker, eiwit. Uisukī is hoe Japan whisky zegt.' } },
      { n: 'Espresso Martini', p: 15, tag: 'london', pic: 'espresso', d: { en: 'Bittersweet and creamy. Vodka, coffee liqueur, espresso, sugar.', nl: 'Bitterzoet en romig. Wodka, koffielikeur, espresso, suiker.' } },
      { n: 'Mojito', p: 14, tag: 'havana', pic: 'mojito', d: { en: 'Refreshing and sweet, with lime or strawberry. Rum, fresh mint, sugar, soda.', nl: 'Fris en zoet, met limoen of aardbei. Rum, verse munt, suiker, soda.' } },
      { n: 'Dutch Mule', p: 14.5, tag: 'netherlands', d: { en: 'Refreshing and citrusy. Jenever, lime, fresh mint, ginger beer, Angostura bitters.', nl: 'Fris en citrusachtig. Jenever, limoen, verse munt, gemberbier, Angostura bitters.' } },
      { n: 'Pornstar Martini', p: 15.5, tag: 'london', d: { en: 'Smooth and sweet. Vodka, passion fruit, lime, vanilla, egg white.', nl: 'Zacht en zoet. Wodka, passievrucht, limoen, vanille, eiwit.' } },
      { n: 'Dark ’N Stormy', p: 15, tag: 'bermuda', d: { en: 'Refreshing and citrusy. Dark rum, lime, fresh mint, ginger beer, Angostura bitters.', nl: 'Fris en citrusachtig. Donkere rum, limoen, verse munt, gemberbier, Angostura bitters.' } },
      { n: 'Margarita', p: 14.5, tag: 'mexico', d: { en: 'Sweet and sour, with lime or strawberry. Tequila, triple sec, sugar.', nl: 'Zoetzuur, met limoen of aardbei. Tequila, triple sec, suiker.' } },
      { n: 'Paloma', p: 14.5, tag: 'mexico', d: { en: 'Refreshing and smooth. Tequila, grapefruit, lime, soda.', nl: 'Fris en zacht. Tequila, grapefruit, limoen, soda.' } }
    ] },
    { id: 'room', open: 1, name: { en: 'For the whole room', nl: 'Voor de hele kamer' }, what: { en: 'Pitchers, bottles and shots', nl: 'Pitchers, flessen en shots' }, rows: [
      { n: { en: 'Heineken pitcher', nl: 'Pitcher Heineken' }, p: 21, tag: 'amsterdam', d: { en: '1.5 litres of pale lager from the tap.', nl: '1,5 liter pils van de tap.' } },
      { n: { en: 'Mannenliefde or Bride pitcher', nl: 'Pitcher Mannenliefde of Bride' }, p: 28, d: { en: '1.5 litres of saison blond or white beer from the tap.', nl: '1,5 liter saison blond of witbier van de tap.' } },
      { n: { en: 'Amstel Rosé pitcher', nl: 'Pitcher Amstel Rosé' }, p: 26, d: { en: '1.5 litres of radler / rosé beer from the tap.', nl: '1,5 liter radler / rosébier van de tap.' } },
      { n: { en: 'Wine by the bottle', nl: 'Wijn per fles' }, p: 35, d: { en: 'Chardonnay, Pinot Grigio, Klosterkrone (sweet), Primitivo or rosé.', nl: 'Chardonnay, Pinot Grigio, Klosterkrone (zoet), Primitivo of rosé.' } },
      { n: { en: 'Prosecco by the bottle', nl: 'Prosecco per fles' }, p: 49, tag: 'italy' },
      { n: 'Soju Classic', p: 18.5, tag: 'korea', d: { en: 'Korean spirit. Smooth, slightly sweet and crisp, for sipping or shooting.', nl: 'Koreaanse sterkedrank. Zacht, licht zoet en fris, om te sippen of te shotten.' } },
      { n: 'Soju Green Grape', p: 16.5, tag: 'korea' },
      { n: 'Shots', p: 5, d: { en: 'Tequila, Rocketshot, Apfelkorn, vodka, amaretto, Malibu, Baileys, Jägermeister, Salmari, Licor 43, jenever, sambuca or limoncello.', nl: 'Tequila, Rocketshot, Apfelkorn, wodka, amaretto, Malibu, Baileys, Jägermeister, Salmari, Licor 43, jenever, sambuca of limoncello.' } }
    ] },
    { id: 'openers', name: { en: 'Openers', nl: 'Openers' }, what: { en: 'Spritz and gin & tonic', nl: 'Spritz en gin-tonic' }, rows: [
      { n: 'Yuzu Spritz', p: 15, d: { en: 'Refreshing and citrusy. Yuzu liqueur, lemon, prosecco, soda.', nl: 'Fris en citrusachtig. Yuzulikeur, citroen, prosecco, soda.' } },
      { n: 'Aperol Spritz', p: 14, tag: 'italy', d: { en: 'Bittersweet and citrusy. Aperol, orange, cinnamon, prosecco, soda.', nl: 'Bitterzoet en citrusachtig. Aperol, sinaasappel, kaneel, prosecco, soda.' } },
      { n: { en: 'Tanqueray and tonic', nl: 'Tanqueray-tonic' }, p: 14, d: { en: 'Botanical, with citrus notes. Served with grapefruit.', nl: 'Kruidig, met citrustonen. Geserveerd met grapefruit.' } },
      { n: { en: 'Hendrick’s and tonic', nl: 'Hendrick’s-tonic' }, p: 15.5, d: { en: 'Smooth and mellow. Served with cucumber.', nl: 'Zacht en rond. Geserveerd met komkommer.' } }
    ] },
    { id: 'unplugged', name: { en: 'Unplugged', nl: 'Unplugged' }, what: { en: 'No alcohol', nl: 'Alcoholvrij' }, rows: [
      { n: 'Passion Mojito', p: 14.5, d: { en: 'Refreshing and sweet. Passion fruit, lime, mint, soda.', nl: 'Fris en zoet. Passievrucht, limoen, munt, soda.' } },
      { n: 'Spiced Mule', p: 14.5, d: { en: 'Sweet, crisp and slightly spicy. Green apple, lime, basil, soda.', nl: 'Zoet, fris en licht pittig. Groene appel, limoen, basilicum, soda.' } },
      { n: 'Heineken 0.0%', p: 6, d: { en: 'Pale lager, bottle.', nl: 'Pils, fles.' } },
      { n: 'Red Bull', p: 5.5 },
      { n: { en: 'Soft drinks', nl: 'Frisdrank' }, p: 4.3, d: { en: 'Pepsi, Pepsi Zero, Lipton Ice Tea Green or Sparkling, Sisi, 7UP, ginger ale, ginger beer, tonic or apple juice.', nl: 'Pepsi, Pepsi Zero, Lipton Ice Tea Green of Sparkling, Sisi, 7UP, ginger ale, gemberbier, tonic of appelsap.' } },
      { n: { en: 'Spa water, still or sparkling', nl: 'Spa, plat of bruisend' }, ps: [{ p: 4.3 }, { l: { en: '0.75 L', nl: '0,75 L' }, p: 8.9 }] }
    ] },
    { id: 'bsides', name: { en: 'B-sides', nl: 'B-kantjes' }, what: { en: 'Beer, wine and spirits', nl: 'Bier, wijn en sterk' }, rows: [
      { h: { en: 'Draft beer', nl: 'Bier van de tap' } },
      { n: 'Heineken', from: 'amsterdam', d: { en: 'Pale lager', nl: 'Pils' }, ps: [{ l: { en: 'glass', nl: 'glas' }, p: 4.6 }, { l: { en: 'pint', nl: 'pint' }, p: 9.2 }] },
      { n: 'Mannenliefde', d: { en: 'Saison blond', nl: 'Saison blond' }, ps: [{ l: { en: 'glass', nl: 'glas' }, p: 7.2 }, { l: { en: 'pint', nl: 'pint' }, p: 12 }] },
      { n: 'Bride', d: { en: 'White beer', nl: 'Witbier' }, ps: [{ l: { en: 'glass', nl: 'glas' }, p: 7.2 }, { l: { en: 'pint', nl: 'pint' }, p: 12 }] },
      { n: 'Amstel Rosé', d: { en: 'Radler / rosé beer', nl: 'Radler / rosébier' }, ps: [{ l: { en: 'glass', nl: 'glas' }, p: 5.8 }, { l: { en: 'pint', nl: 'pint' }, p: 11.6 }] },
      { h: { en: 'Bottles', nl: 'Flesjes' } },
      { n: 'Sapporo', from: 'japan', d: { en: 'Japanese rice lager', nl: 'Japanse rijstlager' }, p: 6.9 },
      { n: 'Desperados', d: { en: 'Tequila-flavoured beer', nl: 'Bier met tequilasmaak' }, p: 6.9 },
      { n: 'Apple Bandit', d: { en: 'Cider', nl: 'Cider' }, p: 6.3 },
      { h: { en: 'Wine by the glass', nl: 'Wijn per glas' } },
      { n: { en: 'White, red or rosé', nl: 'Wit, rood of rosé' }, d: { en: 'Chardonnay, Pinot Grigio, Klosterkrone (sweet), Primitivo, rosé', nl: 'Chardonnay, Pinot Grigio, Klosterkrone (zoet), Primitivo, rosé' }, p: 6.5 },
      { n: 'Prosecco', from: 'italy', p: 9 },
      { h: { en: 'Whisky', nl: 'Whisky' } },
      { n: 'Hibiki Harmony', from: 'japan', d: { en: 'Blended', nl: 'Blended' }, p: 17.5 },
      { n: 'Suntory Toki', from: 'japan', d: { en: 'Blended', nl: 'Blended' }, p: 10.5 },
      { n: 'J.W. Black Label', from: 'scotland', d: { en: 'Blended', nl: 'Blended' }, p: 10.5 },
      { n: 'Jameson', from: 'ireland', d: { en: 'Blended', nl: 'Blended' }, p: 9.5 },
      { n: 'Jack Daniel’s', from: 'tennessee', p: 8.5 },
      { n: 'Jack Daniel’s Honey', from: 'tennessee', p: 9.5 },
      { h: { en: 'Gin, rum, tequila and vodka', nl: 'Gin, rum, tequila en wodka' } },
      { n: 'Hendrick’s', from: 'scotland', d: { en: 'Gin', nl: 'Gin' }, p: 11 },
      { n: 'Tanqueray', from: 'england', d: { en: 'Dry gin', nl: 'Dry gin' }, p: 9.5 },
      { n: 'Bacardí', from: 'puertorico', d: { en: 'Rum', nl: 'Rum' }, ps: [{ l: { en: 'Carta Blanca', nl: 'Carta Blanca' }, p: 8.5 }, { l: { en: 'Carta Negra or Spiced', nl: 'Carta Negra of Spiced' }, p: 9 }] },
      { n: 'Jose Cuervo Especial Silver', from: 'mexico', d: { en: 'Tequila', nl: 'Tequila' }, p: 8.5 },
      { n: 'Smirnoff', d: { en: 'Vodka', nl: 'Wodka' }, p: 8.5 },
      { h: { en: 'Liqueurs', nl: 'Likeuren' } },
      { n: { en: 'All liqueurs', nl: 'Alle likeuren' }, p: 8.5, d: { en: 'Baileys (Ireland), Disaronno Amaretto (Italy), Licor 43 (Spain), Malibu (Barbados), Limoncello (Italy), Apfelkorn (Germany), Sambuca (Italy), Jägermeister (Germany), jonge jenever (the Netherlands).', nl: 'Baileys (Ierland), Disaronno Amaretto (Italië), Licor 43 (Spanje), Malibu (Barbados), Limoncello (Italië), Apfelkorn (Duitsland), Sambuca (Italië), Jägermeister (Duitsland), jonge jenever (Nederland).' } }
    ] }
  ],
  places: {
    japan: { en: 'Japan', nl: 'Japan', hue: '#ff4d67' }, london: { en: 'London', nl: 'Londen', hue: '#8f9bff' },
    amsterdam: { en: 'Amsterdam', nl: 'Amsterdam', hue: '#8af4f2' }, netherlands: { en: 'Netherlands', nl: 'Nederland', hue: '#ff9a3c' },
    havana: { en: 'Havana', nl: 'Havana', hue: '#ffd84a' }, bermuda: { en: 'Bermuda', nl: 'Bermuda', hue: '#5ecbff' },
    mexico: { en: 'Mexico', nl: 'Mexico', hue: '#5dffb4' }, italy: { en: 'Italy', nl: 'Italië', hue: '#ff8a5c' },
    korea: { en: 'Korea', nl: 'Korea', hue: '#ff4fd0' }, scotland: { en: 'Scotland', nl: 'Schotland' }, ireland: { en: 'Ireland', nl: 'Ierland' },
    tennessee: { en: 'Tennessee', nl: 'Tennessee' }, england: { en: 'England', nl: 'Engeland' }, puertorico: { en: 'Puerto Rico', nl: 'Puerto Rico' }
  }
};
