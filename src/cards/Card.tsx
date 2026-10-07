import { m, useMotionValueEvent, useSpring, useTransform, useVelocity } from 'motion/react';
import { useEffect, useRef, type MouseEvent, type PointerEvent } from 'react';
import { Sprite } from '../components/Sprite';
import { es } from '../i18n/es';
import type { CardData } from './cardData';
import type { FanPose } from './fanLayout';
import './Card.css';

// How much bigger the held card gets. The description is 12px at rest, so
// it can be read at 18px while the card is held.
const HELD_SCALE = 1.5;

// How far the held card rises above its place in the hand, in CSS pixels,
// so the thumb does not cover it.
const HELD_LIFT_PIXELS = 56;

// The most the card turns towards the point where the finger presses it.
const MAX_PRESS_TILT_DEGREES = 14;

// While it moves, the card also leans in the direction it goes, more the
// faster it goes: degrees for each pixel per second, up to a limit.
const TILT_DEGREES_PER_SPEED = 0.02;
const MAX_SPEED_TILT_DEGREES = 20;

// A press counts as a tap, which plays the card, when the finger lets go
// before this time and without moving more than this. A longer press only
// holds the card up to read it.
const TAP_MAX_MILLISECONDS = 300;
const TAP_MAX_MOVE_PIXELS = 10;

// Dragging the card up by more than this and letting it go also plays it:
// it has left the hand, towards the enemy.
const PLAY_DRAG_UP_PIXELS = 120;

// A new card comes into the hand from this far below its place.
const DEAL_FROM_BELOW_PIXELS = 160;

// Springs (FR-VIS-002). Stiffness pulls the value towards its target and
// damping slows it down; with this little damping it goes a bit past the
// target and comes back, which is the bounce.
const POSITION_SPRING = { stiffness: 500, damping: 30 };
// The tilt has less damping than the position, so it wobbles more.
const TILT_SPRING = { stiffness: 300, damping: 14 };

type CardProps = {
  card: CardData;
  // Where the card rests in the fan of the hand.
  restPose: FanPose;
  // Called when the player plays the card: with a tap, by dragging it up or
  // with the keyboard. Without it, the card can only be held.
  onPlay?: () => void;
};

// A card of the hand (FR-VIS-002). While a finger holds it, the card rises,
// grows so its text can be read and turns in 3D towards the finger; if the
// finger moves, the card follows it and leans as it goes. When the finger
// lets go, the card springs back to its place in the fan. A quick tap, or
// letting it go after dragging it up, plays it.
//
// Every movement is a spring of Motion. The values change many times per
// second, so they go straight to the `transform` of the element without
// rendering the component again with React.
export function Card({ card, restPose, onPlay }: CardProps) {
  const texts = es.cards[card.id];
  const cardElement = useRef<HTMLButtonElement>(null);
  // Where and when the finger first pressed, while the card is held.
  const pressStart = useRef<{ x: number; y: number; time: number } | null>(null);

  // useSpring gives a value that, each time it is set, moves to the new
  // target with a spring instead of jumping to it.
  const x = useSpring(0, POSITION_SPRING);
  // A new card starts below its place and springs up to it (see the effect
  // below), so a new hand is dealt in.
  const y = useSpring(restPose.dropPixels + DEAL_FROM_BELOW_PIXELS, POSITION_SPRING);
  const rotate = useSpring(restPose.rotateDegrees, POSITION_SPRING);
  const scale = useSpring(1, POSITION_SPRING);
  const pressTiltX = useSpring(0, TILT_SPRING);
  const pressTiltY = useSpring(0, TILT_SPRING);

  // The 3D tilt adds the tilt towards the finger and the lean of the
  // movement. A positive rotateY sends the right edge away from the eye, and
  // a positive rotateX sends the top edge away.
  const speedX = useVelocity(x);
  const speedY = useVelocity(y);
  const rotateY = useTransform(() => pressTiltY.get() + speedTilt(speedX.get()));
  const rotateX = useTransform(() => pressTiltX.get() - speedTilt(speedY.get()));

  // A card out of its place is drawn over the others, also while it flies
  // back, so it never passes under its neighbors. Its place can change, so
  // the transform reads it from a ref that the effect below keeps up to date.
  const restDropPixels = useRef(restPose.dropPixels);
  const zIndex = useTransform(() => {
    const isAway =
      scale.get() > 1.01 || Math.abs(x.get()) > 1 || Math.abs(y.get() - restDropPixels.current) > 1;
    return isAway ? 1 : 0;
  });

  // Send the card to its place in the fan when it comes in and each time its
  // place changes, as when a card on its left is played. Not while a finger
  // holds it: it goes back to its place when let go.
  useEffect(() => {
    restDropPixels.current = restPose.dropPixels;
    if (pressStart.current === null) {
      y.set(restPose.dropPixels);
      rotate.set(restPose.rotateDegrees);
    }
  }, [restPose.dropPixels, restPose.rotateDegrees, y, rotate]);

  // The shine of the seal of the foil and holo editions moves as the card
  // turns (Card.css). Motion cannot type a CSS variable in `style`, so it is set
  // on the element directly.
  useMotionValueEvent(rotateY, 'change', (degrees) => {
    cardElement.current?.style.setProperty('--edition-shift', String(degrees));
  });

  function handlePointerDown(event: PointerEvent<HTMLButtonElement>) {
    // Keep receiving the moves of this finger even when it leaves the card.
    event.currentTarget.setPointerCapture(event.pointerId);
    pressStart.current = { x: event.clientX, y: event.clientY, time: event.timeStamp };

    // From -1 (left or top edge) to 1 (right or bottom edge).
    const box = event.currentTarget.getBoundingClientRect();
    const pressX = (event.clientX - box.left) / box.width * 2 - 1;
    const pressY = (event.clientY - box.top) / box.height * 2 - 1;
    pressTiltY.set(pressX * MAX_PRESS_TILT_DEGREES);
    pressTiltX.set(-pressY * MAX_PRESS_TILT_DEGREES);

    rotate.set(0);
    scale.set(HELD_SCALE);
    y.set(-HELD_LIFT_PIXELS);
  }

  function handlePointerMove(event: PointerEvent<HTMLButtonElement>) {
    if (pressStart.current === null) {
      return;
    }
    x.set(event.clientX - pressStart.current.x);
    y.set(event.clientY - pressStart.current.y - HELD_LIFT_PIXELS);
  }

  function handlePointerUp(event: PointerEvent<HTMLButtonElement>) {
    const start = pressStart.current;
    handleRelease();
    if (start === null || onPlay === undefined) {
      return;
    }
    const movedX = event.clientX - start.x;
    const movedY = event.clientY - start.y;
    const isTap =
      event.timeStamp - start.time < TAP_MAX_MILLISECONDS &&
      Math.hypot(movedX, movedY) < TAP_MAX_MOVE_PIXELS;
    const isDraggedUp = movedY < -PLAY_DRAG_UP_PIXELS;
    if (isTap || isDraggedUp) {
      onPlay();
    }
  }

  // The keyboard (Enter or Space on the focused card) plays the card with a
  // click. A finger or a mouse makes a click too, after letting go, but those
  // are already handled by handlePointerUp; the browser marks the click of
  // the keyboard with a `detail` of 0, the number of presses it counted.
  function handleClick(event: MouseEvent<HTMLButtonElement>) {
    if (event.detail === 0) {
      onPlay?.();
    }
  }

  // Also when the browser takes the finger away (a call, a system gesture):
  // then the card goes back to the hand without being played.
  function handleRelease() {
    pressStart.current = null;
    x.set(0);
    y.set(restPose.dropPixels);
    rotate.set(restPose.rotateDegrees);
    scale.set(1);
    pressTiltX.set(0);
    pressTiltY.set(0);
  }

  // A button, so it can be reached with the keyboard and read by screen
  // readers.
  return (
    <m.button
      ref={cardElement}
      type="button"
      className={cardClassName(card)}
      data-type={card.type}
      data-edition={card.edition}
      // The perspective makes the edge that turns away look smaller: without
      // it, a 3D turn would only look like the card getting narrower.
      style={{ x, y, rotate, scale, rotateX, rotateY, zIndex, transformPerspective: 600 }}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handleRelease}
      onClick={handleClick}
    >
      <span className="card__cost">
        <span className="card__cost-label">{es.hand.costLabel} </span>
        {card.cost}
      </span>
      <span className="card__name">{texts.name}</span>
      <span className="card__art">
        {/* The name already says what the card is: the art is decoration. */}
        <Sprite id={card.art} description="" size={32} />
      </span>
      <span className="card__type">{es.cardTypes[card.type]}</span>
      <span className="card__description">{highlightNumbers(texts.description)}</span>
      {/* The seal of a diploma or a certificate, drawn by Card.css. It is
          decoration, so it has no text for screen readers. */}
      {card.edition !== 'base' && <span className="card__seal" />}
    </m.button>
  );
}

// The classes that give the card the look of its type, its edition and, if
// it has one, its coffee stain (Card.css).
function cardClassName(card: CardData): string {
  const className = `card card--${card.type} card--${card.edition}`;
  if (card.stain === undefined) {
    return className;
  }
  return `${className} card--stain-${card.stain}`;
}

// Splits a description into its words and its numbers, and wraps each number
// in a span so it stands out ("Hace 6 de daño." has the 6 in big type).
// Splitting with a group in the pattern keeps the numbers in the result, at
// the odd positions.
function highlightNumbers(description: string) {
  return description.split(/(\d+)/).map((part, index) =>
    index % 2 === 1 ? (
      <span key={index} className="card__number">
        {part}
      </span>
    ) : (
      part
    ),
  );
}

function speedTilt(pixelsPerSecond: number): number {
  const degrees = pixelsPerSecond * TILT_DEGREES_PER_SPEED;
  return Math.max(-MAX_SPEED_TILT_DEGREES, Math.min(MAX_SPEED_TILT_DEGREES, degrees));
}
