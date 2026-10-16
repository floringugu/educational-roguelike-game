import { type BackgroundId, getBackgroundUrl, getSpriteUrl } from '../assets/catalog';
import { PLANE_PADDING } from './camera';
import {
  type ArtRect,
  CLASSROOM_PLANES,
  CLASSROOM_SPRITES,
  type ClassroomPlane,
  type ClassroomSprite,
  DUST_MOTES,
} from './classroomLayout';
import { CLASSROOM_HEIGHT, CLASSROOM_MARGIN_X, CLASSROOM_MARGIN_Y, CLASSROOM_WIDTH } from './integerScale';
import { useCamera } from './useCamera';
import { type ClassroomMotion } from './useClassroomMotion';
import './Classroom.css';

// The PNG of each plane (ADR-0017).
const PLANE_IMAGES: Record<ClassroomPlane, BackgroundId> = {
  city: 'classroom-city',
  room: 'classroom-room',
  backDesks: 'classroom-back-desks',
  light: 'classroom-light',
  desk: 'classroom-desk',
};

// The classroom is laid out at one CSS pixel per pixel of the art and then
// scaled to the frame (Classroom.css), so a place in the art is a place in
// CSS pixels. The places are counted from the safe area, which starts after
// the margin of the drawing.
function placeInArt(rect: ArtRect) {
  return {
    left: `${rect.x + CLASSROOM_MARGIN_X}px`,
    top: `${rect.y + CLASSROOM_MARGIN_Y}px`,
    width: `${rect.width}px`,
    height: `${rect.height}px`,
  };
}

// The light is as big as the drawing. The PNGs of the other planes repeat
// their edge PLANE_PADDING pixels all around, so they start further out.
function placePlaneImage(plane: ClassroomPlane) {
  const padding = plane === 'light' ? 0 : PLANE_PADDING;
  return {
    left: `${-padding}px`,
    top: `${-padding}px`,
    width: `${CLASSROOM_WIDTH + 2 * padding}px`,
    height: `${CLASSROOM_HEIGHT + 2 * padding}px`,
  };
}

// Each sprite has a class of its own for its loop in Classroom.css, such as
// "classroom__cloud" for "classroom-cloud".
function spriteClassName(sprite: ClassroomSprite): string {
  return `classroom__sprite classroom__${sprite.id.replace('classroom-', '')}`;
}

// A sprite of the classroom in its place. A strip of frames is shown through
// a window as big as one frame, and its loop slides the strip one frame at
// a time (Classroom.css).
function ClassroomSpriteImage({ sprite }: { sprite: ClassroomSprite }) {
  const url = getSpriteUrl(sprite.id);
  if (sprite.frames === undefined) {
    return <img className={spriteClassName(sprite)} src={url} alt="" style={placeInArt(sprite.rect)} />;
  }
  return (
    <div className={spriteClassName(sprite)} style={placeInArt(sprite.rect)}>
      <img
        className="classroom__frames"
        src={url}
        alt=""
        style={{ width: `${sprite.rect.width * sprite.frames}px`, height: `${sprite.rect.height}px` }}
      />
    </div>
  );
}

// The specks of dust in the beam of light. Each one rises at its own pace,
// and they start at different moments, so they never move together.
function DustMotes() {
  return DUST_MOTES.map((mote, index) => (
    <span
      key={`${mote.x},${mote.y}`}
      className="classroom__mote"
      style={{
        left: `${mote.x + CLASSROOM_MARGIN_X}px`,
        top: `${mote.y + CLASSROOM_MARGIN_Y}px`,
        animationDuration: `${7 + (index % 4) * 1.5}s`,
        animationDelay: `${-index * 1.3}s`,
      }}
    />
  ));
}

type ClassroomProps = {
  motion: ClassroomMotion;
};

// The classroom behind every screen (FR-VIS-001, ADR-0013, ADR-0017), in
// planes from the farthest to the nearest: the city seen through the glass
// of the window, the room, the desks at the back, the layer of light and the
// green desk. The camera moves them (camera.ts), and the sprites that ticket
// 15 animates go in their planes. Its slow loops play only while `motion` is
// "moving", and wait where they are while it is "paused" (FR-VIS-007).
// It is only decoration: screen readers skip it.
export function Classroom({ motion }: ClassroomProps) {
  const camera = useCamera();
  const className = [
    'classroom',
    motion !== 'still' && 'classroom--animated',
    motion === 'paused' && 'classroom--paused',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={className} aria-hidden="true">
      {CLASSROOM_PLANES.map((plane) => (
        <div
          key={plane}
          className="classroom__plane"
          ref={(element) => (element === null ? undefined : camera.attachPlane(plane, element))}
        >
          <img
            className="classroom__image"
            src={getBackgroundUrl(PLANE_IMAGES[plane])}
            alt=""
            style={placePlaneImage(plane)}
          />
          {CLASSROOM_SPRITES.filter((sprite) => sprite.plane === plane).map((sprite) => (
            <ClassroomSpriteImage key={sprite.id} sprite={sprite} />
          ))}
          {plane === 'light' && <DustMotes />}
        </div>
      ))}
    </div>
  );
}
