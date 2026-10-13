import { getBackgroundUrl, getSpriteUrl } from '../assets/catalog';
import { type ArtRect, CLASSROOM_SPRITES } from './classroomLayout';
import { CLASSROOM_MARGIN_X, CLASSROOM_MARGIN_Y } from './integerScale';
import './Classroom.css';

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

// The classroom behind every screen (FR-VIS-001, ADR-0013): the city seen
// through the glass of the window, the drawing, the sprites that ticket 15
// animates in their places, and the layer of light on top of everything. It
// is still for now, so it needs no work while the tab is hidden or with
// prefers-reduced-motion (FR-VIS-007).
// It is only decoration: screen readers skip it.
export function Classroom() {
  return (
    <div className="classroom" aria-hidden="true">
      <img className="classroom__image" src={getBackgroundUrl('classroom-city')} alt="" />
      <img className="classroom__image" src={getBackgroundUrl('classroom')} alt="" />
      {CLASSROOM_SPRITES.map(({ id, rect }) => (
        <img key={id} className="classroom__sprite" src={getSpriteUrl(id)} alt="" style={placeInArt(rect)} />
      ))}
      <img className="classroom__image" src={getBackgroundUrl('classroom-light')} alt="" />
    </div>
  );
}
