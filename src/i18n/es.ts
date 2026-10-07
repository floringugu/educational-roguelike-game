// Text catalog: every text the player sees lives here, in Spanish (R-9,
// NFR-I18N-001). Components never write visible text directly; a lint rule
// rejects it (see eslint.config.js). Group the texts by screen.
export const es = {
  app: {
    name: 'Empollatro',
  },
  // The combat screen of the prototype (ticket 06).
  combat: {
    creditsButton: 'Créditos',
    enemyHealthLabel: 'Vida del enemigo',
    playerHealthLabel: 'Tu vida',
    blockLabel: 'Bloqueo',
    discardLabel: 'Descarte',
    // Read before the value of the intent: "Va a atacar con 8".
    intentAttack: 'Va a atacar con',
    // Between the health left and the maximum: "26/40".
    outOf: '/',
    // Before the number of a tag: "-6" of damage, "+4" of healing.
    lossSign: '-',
    gainSign: '+',
  },
  // The enemies of the prototype (ticket 06): the name shown over the health
  // bar and the description of the sprite for screen readers.
  enemies: {
    midterm: {
      name: 'El Parcial',
      description: 'Un examen arrugado con un 3 en rojo, al que alguien ha pintado a boli una cara furiosa con dientes de grapa, brazos, piernas y zapatillas rojas. Lleva una regla en una mano y un boli rojo en la otra',
    },
    mathTeacher: {
      name: 'Don Ramiro, el de Mates',
      description:
        'Caricatura a boli de un profesor despeinado, con gafas enormes, bigote, la lengua fuera, bata manchada de tinta, un libro de Mates y el dedo en alto, en un trozo de hoja cuadriculada',
    },
  },
  // The question that appears when a card is played (FR-CMB-001,
  // FR-ANS-003).
  question: {
    label: 'Pregunta',
    // The letters of the options, as in an exam on paper.
    optionLetters: ['a)', 'b)', 'c)', 'd)'],
    correctMark: '¡Bien!',
    wrongMark: 'Fallo: la carta no hace nada y va al descarte.',
    correctTag: 'Correcta',
    yourAnswerTag: 'Tu respuesta',
    showCitation: 'Ver la cita',
    hideCitation: 'Ocultar la cita',
    page: 'Página',
    reportButton: 'Esta pregunta está mal',
    continueButton: 'Continuar',
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
