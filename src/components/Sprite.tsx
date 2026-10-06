import { getSpriteUrl, type SpriteId } from '../assets/catalog';
import './Sprite.css';

type SpriteProps = {
  id: SpriteId;
  // Description for screen readers. It comes from the text catalog, or is
  // empty when the sprite is only decoration and screen readers skip it.
  description: string;
  // Size on screen in CSS pixels. Sprites are 16x16, so multiples of 16 keep
  // every pixel the same size.
  size?: number;
};

// Draws a sprite of the asset catalog by its identifier.
export function Sprite({ id, description, size = 64 }: SpriteProps) {
  return (
    <img
      className="sprite"
      src={getSpriteUrl(id)}
      alt={description}
      width={size}
      height={size}
    />
  );
}
