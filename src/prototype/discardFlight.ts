// The flight of a played card to the paper shredder of the discard pile, and
// the shredder cutting it into strips (ticket 06). They use the animations of
// the browser (Element.animate), like the camera of the classroom, so React does
// not draw the screen again on every frame.

// How long the card flies to the slot of the shredder, and how long it takes
// to go in.
const FLIGHT_MS = 420;
const SWALLOW_MS = 260;

// Where the slot of the shredder is in its sprite: its middle, 4.5 of the 16
// sprite pixels from the top (it is the row 4), and how wide its opening is,
// 8 of the 16.
const SLOT_TOP_SHARE = 4.5 / 16;
const SLOT_WIDTH_SHARE = 8 / 16;

// Copies the card element and makes the copy fly from where the card is to the
// slot of the shredder and go in through it. The copy floats over the whole
// page, outside React, so the real card can leave the hand at once. It
// resolves when the card is inside, which is when the shredder should start.
export async function flyCardToShredder(card: HTMLElement, shredder: HTMLElement): Promise<void> {
  const cardBox = card.getBoundingClientRect();
  const shredderBox = shredder.getBoundingClientRect();
  // The real size of the card, without the turn and the scale of the fan.
  const width = card.offsetWidth;
  const height = card.offsetHeight;
  const startAngle = currentAngle(card);

  const ghost = card.cloneNode(true) as HTMLElement;
  ghost.removeAttribute('id');
  ghost.setAttribute('aria-hidden', 'true');
  ghost.inert = true;
  // The width of a card comes from the hand (--card-width in Hand.css), and
  // the copy is outside it.
  ghost.style.setProperty('--card-width', `${width}px`);
  Object.assign(ghost.style, {
    position: 'fixed',
    left: '0',
    top: '0',
    width: `${width}px`,
    height: `${height}px`,
    margin: '0',
    zIndex: '1000',
    pointerEvents: 'none',
    transformOrigin: 'center',
  });
  document.body.append(ghost);

  // Over the slot the card is as wide as the opening.
  const smallScale = (shredderBox.width * SLOT_WIDTH_SHARE) / width;
  const smallHeight = height * smallScale;
  const slotX = shredderBox.left + shredderBox.width / 2;
  const slotY = shredderBox.top + shredderBox.height * SLOT_TOP_SHARE;
  const startX = cardBox.left + cardBox.width / 2;
  const startY = cardBox.top + cardBox.height / 2;

  // The position of the middle of the copy, its scale and its angle, as a
  // transform. The copy starts at the top left corner of the page.
  function place(x: number, y: number, scale: number, angle: number): string {
    return `translate(${x - width / 2}px, ${y - height / 2}px) rotate(${angle}deg) scale(${scale})`;
  }

  try {
    // The flight: the card shrinks, straightens and ends just over the slot,
    // with its bottom edge on it.
    await ghost.animate(
      [
        { transform: place(startX, startY, 1, startAngle) },
        { transform: place(slotX, slotY - smallHeight / 2, smallScale, 0) },
      ],
      { duration: FLIGHT_MS, easing: 'cubic-bezier(0.5, 0, 0.75, 0.4)', fill: 'forwards' },
    ).finished;
    // Going in: the card goes down as much as it is tall, and is cut by the
    // same amount from the bottom, so its bottom edge stays on the slot, as
    // if the shredder swallowed it.
    await ghost.animate(
      [
        { transform: place(slotX, slotY - smallHeight / 2, smallScale, 0), clipPath: 'inset(0 0 0 0)' },
        { transform: place(slotX, slotY + smallHeight / 2, smallScale, 0), clipPath: 'inset(0 0 100% 0)' },
      ],
      { duration: SWALLOW_MS, easing: 'linear', fill: 'forwards' },
    ).finished;
  } catch {
    // The animation was cancelled, for example when the page closes. There
    // is nothing to finish: the copy is removed below all the same.
  } finally {
    ghost.remove();
  }
}

// The shredder shakes while it cuts, and the strips of the card come out
// underneath, fall a little and fade. `strips` is the drawing of the strips,
// inside a box that cuts it at the bottom edge of the shredder.
export function runShredder(body: HTMLElement, strips: HTMLElement): void {
  body.animate(
    [
      { transform: 'translate(0, 0)' },
      { transform: 'translate(-2px, 1px)' },
      { transform: 'translate(2px, 0)' },
      { transform: 'translate(-2px, 0)' },
      { transform: 'translate(2px, 1px)' },
      { transform: 'translate(-1px, 0)' },
      { transform: 'translate(0, 0)' },
    ],
    { duration: 450, easing: 'linear' },
  );
  strips.animate(
    [
      { transform: 'translateY(-100%)', opacity: 1 },
      { transform: 'translateY(0)', opacity: 1, offset: 0.6 },
      { transform: 'translateY(12%)', opacity: 0 },
    ],
    { duration: 800, easing: 'ease-out' },
  );
}

// The angle the card is turned in the fan, read from its transform.
function currentAngle(element: HTMLElement): number {
  const matrix = new DOMMatrixReadOnly(getComputedStyle(element).transform);
  return (Math.atan2(matrix.b, matrix.a) * 180) / Math.PI;
}
