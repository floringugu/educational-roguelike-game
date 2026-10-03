import { Sprite } from '../components/Sprite';
import { es } from '../i18n/es';
import './HomeScreen.css';

type HomeScreenProps = {
  onOpenCredits: () => void;
};

const CARD_ART_IDS = ['card-art-attack', 'card-art-defense', 'card-art-heal'] as const;

// Placeholder screen used to check that the app opens on the phone. It also
// shows the first sprites of the asset catalog.
export function HomeScreen({ onOpenCredits }: HomeScreenProps) {
  return (
    <main className="home-screen">
      <h1 className="home-screen__title" tabIndex={-1}>{es.app.name}</h1>
      <p className="home-screen__tagline">{es.home.tagline}</p>
      <p className="home-screen__status">{es.home.status}</p>

      <div className="home-screen__sprites">
        <Sprite id="enemy-brute" description={es.home.enemyDescription} size={96} />
        {CARD_ART_IDS.map((id) => (
          <Sprite key={id} id={id} description={es.home.cardDescriptions[id]} />
        ))}
      </div>

      <button type="button" className="home-screen__credits" onClick={onOpenCredits}>
        {es.home.creditsButton}
      </button>
    </main>
  );
}
