// Health is drawn as a row of symbols instead of a bar (ticket 06): neurons
// for the player and red pen crosses for the enemy. Each symbol stands for
// 8 points of health and empties a quarter at a time, so a quarter is 2
// points. With 40 points of health there are 5 symbols; with more, there are
// more symbols.
export const HEALTH_PER_SYMBOL = 8;
export const QUARTERS_PER_SYMBOL = 4;
const HEALTH_PER_QUARTER = HEALTH_PER_SYMBOL / QUARTERS_PER_SYMBOL;

// How many quarters of each symbol are full, from the first symbol to the
// last. A quarter counts as full while any of its health is left: with 27
// points the fourth symbol shows 2 quarters, not 1. This way the row never
// looks empty while there is still health left.
export function filledQuarters(health: number, maxHealth: number): number[] {
  const symbolCount = Math.ceil(maxHealth / HEALTH_PER_SYMBOL);
  const quarters: number[] = [];
  for (let index = 0; index < symbolCount; index++) {
    const healthInSymbol = health - index * HEALTH_PER_SYMBOL;
    const quartersInSymbol = Math.ceil(healthInSymbol / HEALTH_PER_QUARTER);
    quarters.push(Math.min(Math.max(quartersInSymbol, 0), QUARTERS_PER_SYMBOL));
  }
  return quarters;
}
