// Text catalog: every text the player sees lives here, in Spanish (R-9,
// NFR-I18N-001). Components never write visible text directly; a lint rule
// rejects it (see eslint.config.js). Group the texts by screen.
export const es = {
  app: {
    name: 'Empollatro',
  },
  home: {
    tagline: 'Roguelike de cartas para estudiar',
    status: 'Prototipo visual en construcción',
    creditsButton: 'Créditos',
    enemyDescription: 'Un monstruo rojo con pinzas',
  },
  // The hand of cards at the bottom of the screen (FR-VIS-002).
  hand: {
    label: 'Mano',
    costLabel: 'Coste',
  },
  // Name and description of each test card, by the id it has in
  // src/prototype/cards.json.
  cards: {
    chalkThrow: { name: 'Tizazo', description: 'Hace 6 de daño.' },
    skipClass: { name: 'Faltar', description: 'Ganas 5 de bloqueo.' },
    coffee: { name: 'Cafelito', description: 'Recuperas 4 de vida.' },
    cheatSheet: { name: 'Chuleta', description: 'Hace 10 de daño.' },
    tome: { name: 'Tocho', description: 'Ganas 9 de bloqueo.' },
  },
  // The label of each card type, shown on the card (see CARD_TYPES in
  // src/cards/cardData.ts).
  cardTypes: {
    attack: 'Ataque',
    defense: 'Defensa',
    skill: 'Habilidad',
  },
  credits: {
    title: 'Créditos',
    intro: 'Estas obras hacen posible Empollatro. Gracias a sus autores.',
    back: 'Volver',
    authorLabel: 'Autor',
    licenseLabel: 'Licencia',
    sourceLabel: 'Origen',
    modificationLabel: 'Cambios',
  },
  // Developer tools, only visible in debug mode (`?debug` in the address).
  debug: {
    framesPerSecond: 'fps',
    noFrameRateYet: '--',
  },
} as const;
