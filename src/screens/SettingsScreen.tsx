import { es } from '../i18n/es';
import './SettingsScreen.css';

type SettingsScreenProps = {
  onBack: () => void;
};

// Settings screen, opened from the menu of the combat (ticket 12). For now it
// only has its title and the way back: ticket 07 adds the settings, starting
// with the CRT effect.
export function SettingsScreen({ onBack }: SettingsScreenProps) {
  return (
    <main className="settings-screen">
      <h1 className="settings-screen__title" tabIndex={-1}>
        {es.settings.title}
      </h1>

      <button type="button" className="settings-screen__back" onClick={onBack}>
        {es.settings.back}
      </button>
    </main>
  );
}
