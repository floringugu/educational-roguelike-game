import { es } from '../i18n/es';
import './HomeScreen.css';

// Placeholder screen used to check that the app opens on the phone.
export function HomeScreen() {
  return (
    <main className="home-screen">
      <h1 className="home-screen__title">{es.app.name}</h1>
      <p className="home-screen__tagline">{es.home.tagline}</p>
      <p className="home-screen__status">{es.home.status}</p>
    </main>
  );
}
