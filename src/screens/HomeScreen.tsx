import { Hand } from '../cards/Hand';
import { Sprite } from '../components/Sprite';
import { es } from '../i18n/es';
import { TEST_HAND } from '../prototype/testHand';
import './HomeScreen.css';

type HomeScreenProps = {
  onOpenCredits: () => void;
};

// Placeholder screen used to check that the app opens on the phone. It shows
// an enemy of the asset catalog and, at the bottom, the hand of test cards
// (FR-VIS-002). Ticket 06 turns it into a combat screen.
export function HomeScreen({ onOpenCredits }: HomeScreenProps) {
  return (
    <main className="home-screen">
      <div className="home-screen__content">
        <h1 className="home-screen__title" tabIndex={-1}>{es.app.name}</h1>
        <p className="home-screen__tagline">{es.home.tagline}</p>
        <p className="home-screen__status">{es.home.status}</p>

        <Sprite id="enemy-brute" description={es.home.enemyDescription} size={96} />

        <button type="button" className="home-screen__credits" onClick={onOpenCredits}>
          {es.home.creditsButton}
        </button>
      </div>

      <Hand cards={TEST_HAND} />
    </main>
  );
}
