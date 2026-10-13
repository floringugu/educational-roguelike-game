import { getSpriteUrl, type SpriteId } from '../assets/catalog';
import './Sprite.css';

type SpriteProps = {
  id: SpriteId;
  // Description for screen readers. It comes from the text catalog, or is
  // empty when the sprite is only decoration and screen readers skip it.
  description: string;
  // Side of the sprite in pixels of the art (ADR-0014). Each one is drawn
  // as `--art-pixel` CSS pixels, the integer scale of the game frame, so
  // every pixel of every sprite has the same size on screen.
  size?: number;
  // A fixed side in CSS pixels, outside the integer scale. Only the cards use
  // it, until ticket 14 redraws their art at 24x24.
  cssSize?: number;
};

// Draws a sprite of the asset catalog by its identifier.
export function Sprite({ id, description, size = 16, cssSize }: SpriteProps) {
  const side = cssSize === undefined ? `calc(${size} * var(--art-pixel))` : `${cssSize}px`;
  return (
    <img
      className="sprite"
      src={getSpriteUrl(id)}
      alt={description}
      style={{ width: side, height: side }}
    />
  );
}
