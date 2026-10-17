import { type CSSProperties, type PointerEvent, type RefObject, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { getSpriteUrl } from '../assets/catalog';
import { type ArtRect } from './classroomLayout';
import { type DeskItemFlight, spinPivot, throwFlight, wouldHitEnemy } from './deskItemFlight';
import {
  DESK_ITEMS,
  HELD_LIFT,
  HELD_Z_INDEX,
  type DeskItem,
  type DeskItemId,
  type DeskItemPlace,
  type DeskItemPlaces,
  type FreeDesk,
  type PointerSample,
  type Velocity,
  dropItem,
  grabZone,
  heldPlace,
  isThrow,
  leaveRide,
  moveItem,
  putBack,
  rectAt,
  releaseVelocity,
  restingZIndices,
  ridersOf,
  shadowRectAt,
  startingPlaces,
  visibleAreaOf,
} from './deskItems';
import { CLASSROOM_MARGIN_Y } from './integerScale';
import { useCamera } from './useCamera';
import { useIntegerScale } from './useIntegerScale';
import './DeskItems.css';

// A length of `n` pixels of the art, for the styles.
function artLength(n: number): string {
  return `calc(${n} * var(--art-pixel))`;
}

// An item in flight, and the point it spins around, from the top left
// corner of its sprite. An item that rides on the thrown one flies with it,
// and spins around the same point.
type ItemFlight = {
  flight: DeskItemFlight;
  pivot: { x: number; y: number };
};

// The item held by the finger, and what is needed to move it and to let go
// of it.
type Grab = {
  id: DeskItemId;
  pointerId: number;
  // Where the finger touched the item, in CSS pixels of the screen.
  fingerStart: { x: number; y: number };
  // The places when it was picked up: before, and once it no longer rides
  // on anything.
  placesBeforePickUp: DeskItemPlaces;
  placesAtPickUp: DeskItemPlaces;
  // The last moves of the finger, to know how fast it let go.
  samples: PointerSample[];
};

// The samples of the finger older than this are not needed any more: the
// speed is measured over the last moments (deskItems.ts).
const SAMPLE_KEEP_MS = 200;

type DeskItemsProps = {
  // The parts of the enemy that a thrown item can hit, or null if no enemy
  // is standing on the desk.
  enemyHitArea: ReadonlyArray<ArtRect> | null;
  // While the menu is open, a touch only closes it.
  isDisabled: boolean;
  // Called when a thrown item hits the enemy.
  onEnemyHit: () => void;
  // The bar and the hand: an item cannot be left under them.
  deskCoverRefs: ReadonlyArray<RefObject<HTMLElement | null>>;
};

// The things on the green desk (FR-VIS-010, ticket 17): the pencil case,
// the water bottle, the notebook and the pen on it. The player can pick
// them up, move them around the desk and throw them at the enemy, which
// gets annoyed when one hits it (EnemyView). They are only decoration:
// nothing they do changes the combat, and screen readers skip them.
// They move with the desk when the camera moves (ADR-0017). While the
// classroom is still (FR-VIS-007), a thrown item does not fly: if it would
// hit the enemy, it annoys it and goes back to where it was.
//
// CombatScreen draws them again for each enemy, so each one finds them in
// their places of the drawing.
export function DeskItems({ enemyHitArea, isDisabled, onEnemyHit, deskCoverRefs }: DeskItemsProps) {
  const camera = useCamera();
  const placement = useIntegerScale();
  const { artPixel } = placement;
  const visible = visibleAreaOf(placement);
  const [places, setPlaces] = useState(startingPlaces);
  const [heldId, setHeldId] = useState<DeskItemId | null>(null);
  const [flights, setFlights] = useState<Partial<Record<DeskItemId, ItemFlight>>>({});
  const rootElement = useRef<HTMLDivElement>(null);
  const grabRef = useRef<Grab | null>(null);
  const timers = useRef(new Set<number>());

  // The flights that are still running end when the items are drawn again.
  useEffect(() => {
    const pending = timers.current;
    return () => {
      for (const timer of pending) {
        window.clearTimeout(timer);
      }
    };
  }, []);

  function schedule(delayMs: number, callback: () => void) {
    const timer = window.setTimeout(() => {
      timers.current.delete(timer);
      callback();
    }, delayMs);
    timers.current.add(timer);
  }

  // The free part of the desk on this screen, measured when an item is let
  // go: the bar and the hand can move when the screen changes size.
  function measureFreeDesk(): FreeDesk {
    const rootTop = rootElement.current?.getBoundingClientRect().top ?? 0;
    const safeAreaTop = rootTop + placement.classroomTop + CLASSROOM_MARGIN_Y * artPixel;
    let bottom = visible.bottom;
    for (const cover of deskCoverRefs) {
      const element = cover.current;
      if (element !== null) {
        bottom = Math.min(bottom, (element.getBoundingClientRect().top - safeAreaTop) / artPixel);
      }
    }
    return { left: visible.left, right: visible.right, bottom: Math.floor(bottom) };
  }

  // Where the held item is for a position of the finger.
  function placesForFinger(grab: Grab, clientX: number, clientY: number): DeskItemPlaces {
    const fingerMoved = { x: clientX - grab.fingerStart.x, y: clientY - grab.fingerStart.y };
    const target = heldPlace(grab.placesAtPickUp[grab.id], fingerMoved, artPixel);
    return moveItem(grab.placesAtPickUp, grab.id, target.x, target.y);
  }

  function addSample(grab: Grab, event: PointerEvent<HTMLElement>) {
    grab.samples.push({ x: event.clientX, y: event.clientY, timeMs: event.timeStamp });
    grab.samples = grab.samples.filter((sample) => event.timeStamp - sample.timeMs <= SAMPLE_KEEP_MS);
  }

  function handlePointerDown(id: DeskItemId, event: PointerEvent<HTMLElement>) {
    if (isDisabled || grabRef.current !== null || flights[id] !== undefined || !event.isPrimary) {
      return;
    }
    // The finger keeps the item even when it moves off the zone, and the
    // page does not scroll or select text.
    event.preventDefault();
    event.currentTarget.setPointerCapture(event.pointerId);
    const placesAtPickUp = leaveRide(places, id);
    grabRef.current = {
      id,
      pointerId: event.pointerId,
      fingerStart: { x: event.clientX, y: event.clientY },
      placesBeforePickUp: places,
      placesAtPickUp,
      samples: [{ x: event.clientX, y: event.clientY, timeMs: event.timeStamp }],
    };
    setPlaces(placesAtPickUp);
    setHeldId(id);
  }

  function handlePointerMove(event: PointerEvent<HTMLElement>) {
    const grab = grabRef.current;
    if (grab === null || grab.pointerId !== event.pointerId) {
      return;
    }
    addSample(grab, event);
    setPlaces(placesForFinger(grab, event.clientX, event.clientY));
  }

  function handlePointerUp(event: PointerEvent<HTMLElement>) {
    const grab = grabRef.current;
    if (grab === null || grab.pointerId !== event.pointerId) {
      return;
    }
    grabRef.current = null;
    setHeldId(null);
    addSample(grab, event);
    const letGo = placesForFinger(grab, event.clientX, event.clientY);
    const velocity = releaseVelocity(grab.samples);
    const freeDesk = measureFreeDesk();
    if (isThrow(velocity)) {
      throwItem(grab, letGo, velocity, freeDesk);
    } else {
      setPlaces(dropItem(letGo, grab.id, freeDesk, grab.placesBeforePickUp));
    }
  }

  // The browser took the finger away, as when a call comes in: the item is
  // let go where it is.
  function handlePointerCancel(event: PointerEvent<HTMLElement>) {
    const grab = grabRef.current;
    if (grab === null || grab.pointerId !== event.pointerId) {
      return;
    }
    grabRef.current = null;
    setHeldId(null);
    const freeDesk = measureFreeDesk();
    setPlaces((current) => dropItem(current, grab.id, freeDesk, grab.placesBeforePickUp));
  }

  function throwItem(grab: Grab, letGo: DeskItemPlaces, velocityCss: Velocity, freeDesk: FreeDesk) {
    const { id } = grab;
    // It flies from where it is seen: lifted, as it was held.
    const rect = rectAt(id, { x: letGo[id].x, y: letGo[id].y - HELD_LIFT });
    const setup = {
      rect,
      velocity: { x: velocityCss.x / artPixel, y: velocityCss.y / artPixel },
      enemyHitArea,
      freeDesk,
    };

    if (camera.isStill()) {
      if (wouldHitEnemy(setup)) {
        onEnemyHit();
        setPlaces(putBack(letGo, id, grab.placesBeforePickUp));
      } else {
        setPlaces(dropItem(letGo, id, freeDesk, grab.placesBeforePickUp));
      }
      return;
    }

    const flight = throwFlight(setup);
    const pivot = spinPivot(rect.width, rect.height);
    const newFlights: Partial<Record<DeskItemId, ItemFlight>> = { [id]: { flight, pivot } };
    for (const riderId of ridersOf(letGo, id)) {
      newFlights[riderId] = {
        flight,
        pivot: { x: pivot.x + letGo[id].x - letGo[riderId].x, y: pivot.y + letGo[id].y - letGo[riderId].y },
      };
    }
    // The items are at the landing from the start: the flight is drawn as
    // offsets from it, and ends there.
    setPlaces(moveItem(letGo, id, flight.landing.x, flight.landing.y));
    setFlights((current) => ({ ...current, ...newFlights }));

    if (flight.hitsEnemy) {
      schedule(flight.hitMs, onEnemyHit);
    }
    // When it lands, the items of this throw are no longer in flight.
    schedule(flight.move.durationMs, () => {
      setFlights((current) => {
        const remaining: Partial<Record<DeskItemId, ItemFlight>> = {};
        for (const item of DESK_ITEMS) {
          const itemFlight = current[item.id];
          if (itemFlight !== undefined && itemFlight.flight !== flight) {
            remaining[item.id] = itemFlight;
          }
        }
        return remaining;
      });
    });
  }

  const zIndices = restingZIndices(places);

  return (
    <div ref={rootElement} className="desk-items" aria-hidden="true">
      {DESK_ITEMS.map((item) => {
        const place = places[item.id];
        const isHeld = heldId === item.id;
        // An item that rides on the held one is lifted with it.
        const isCarried = heldId !== null && place.ridingOn === heldId;
        const itemFlight = flights[item.id];
        const isRider = place.ridingOn !== null;
        const zIndex =
          isHeld || isCarried || itemFlight !== undefined ? HELD_Z_INDEX + (isRider ? 1 : 0) : zIndices[item.id];
        const drawnPlace = isCarried ? { ...place, y: place.y - HELD_LIFT } : place;
        return (
          <DeskItemView
            key={item.id}
            item={item}
            place={drawnPlace}
            isHeld={isHeld}
            itemFlight={itemFlight}
            zIndex={zIndex}
            grabZone={grabZone(rectAt(item.id, drawnPlace), visible, artPixel)}
            onPointerDown={(event) => handlePointerDown(item.id, event)}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerCancel={handlePointerCancel}
          />
        );
      })}
    </div>
  );
}

type DeskItemViewProps = {
  item: DeskItem;
  place: DeskItemPlace;
  isHeld: boolean;
  itemFlight: ItemFlight | undefined;
  zIndex: number;
  grabZone: ArtRect | null;
  onPointerDown: (event: PointerEvent<HTMLElement>) => void;
  onPointerMove: (event: PointerEvent<HTMLElement>) => void;
  onPointerUp: (event: PointerEvent<HTMLElement>) => void;
  onPointerCancel: (event: PointerEvent<HTMLElement>) => void;
};

// One item: its shadow on the desk, its sprite and the zone where the
// finger picks it up. Each part is a different element, so each one plays
// only one move at a time (ADR-0017):
// - the item moves with the desk when the camera moves;
// - its body flies when it is thrown;
// - and inside it, its sprite spins.
// A held item rises above the desk, and its shadow stays down. The shadow
// does not fly: it shows again where the item lands.
function DeskItemView({
  item,
  place,
  isHeld,
  itemFlight,
  zIndex,
  grabZone: zone,
  onPointerDown,
  onPointerMove,
  onPointerUp,
  onPointerCancel,
}: DeskItemViewProps) {
  const camera = useCamera();
  const itemElement = useRef<HTMLDivElement>(null);
  const bodyElement = useRef<HTMLDivElement>(null);
  const spinElement = useRef<HTMLDivElement>(null);
  const { width, height } = item.rect;

  useLayoutEffect(() => {
    const element = itemElement.current;
    if (element === null) {
      return;
    }
    return camera.attachFollower('desk', element);
  }, [camera]);

  // A layout effect, so the item is drawn in the air from the first frame,
  // and not at its landing.
  useLayoutEffect(() => {
    const body = bodyElement.current;
    const spin = spinElement.current;
    if (itemFlight === undefined || body === null || spin === null) {
      return;
    }
    const { move, spinKeyframes } = itemFlight.flight;
    const animations = [camera.playOn(body, move), spin.animate(spinKeyframes, { duration: move.durationMs })];
    return () => {
      for (const animation of animations) {
        animation.cancel();
      }
    };
  }, [camera, itemFlight]);

  const shadowSprite = place.ridingOn !== null ? (item.shadowOnRide ?? item.shadow) : item.shadow;
  const shadowRect = shadowRectAt(item.id, place);

  const itemStyle: CSSProperties = {
    left: `calc(var(--safe-left) + ${place.x} * var(--art-pixel))`,
    top: `calc(var(--safe-top) + ${place.y} * var(--art-pixel))`,
    width: artLength(width),
    height: artLength(height),
    zIndex,
  };
  const pivot = itemFlight?.pivot;

  return (
    <div ref={itemElement} className="desk-item" style={itemStyle}>
      {itemFlight === undefined && (
        <img
          className="desk-item__shadow"
          src={getSpriteUrl(shadowSprite)}
          alt=""
          draggable={false}
          style={{
            left: artLength(shadowRect.x - place.x),
            top: artLength(shadowRect.y - place.y),
            width: artLength(shadowRect.width),
            height: artLength(shadowRect.height),
          }}
        />
      )}
      <div ref={bodyElement} className="desk-item__body" style={isHeld ? { top: artLength(-HELD_LIFT) } : undefined}>
        <div
          ref={spinElement}
          style={pivot === undefined ? undefined : { transformOrigin: `${artLength(pivot.x)} ${artLength(pivot.y)}` }}
        >
          <img
            className="desk-item__sprite"
            src={getSpriteUrl(item.sprite)}
            alt=""
            draggable={false}
            style={{ width: artLength(width), height: artLength(height) }}
          />
        </div>
      </div>
      {/* Always there, even with no size when the item is off the screen,
          so the finger does not lose an item it drags off the screen. */}
      <span
        className="desk-item__grab-zone"
        style={{
          left: artLength((zone?.x ?? place.x) - place.x),
          top: artLength((zone?.y ?? place.y) - place.y),
          width: artLength(zone?.width ?? 0),
          height: artLength(zone?.height ?? 0),
        }}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerCancel}
      />
    </div>
  );
}
