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
  },
} as const;
