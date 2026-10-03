import { getLicenseFileUrl } from '../assets/catalog';
import { LICENSES } from '../data/licenses';
import { es } from '../i18n/es';
import './CreditsScreen.css';

type CreditsScreenProps = {
  onBack: () => void;
};

// Credits screen (FR-VIS-006). The list is generated from the license
// register, so every asset and font that the project uses is credited.
export function CreditsScreen({ onBack }: CreditsScreenProps) {
  return (
    <main className="credits-screen">
      <h1 className="credits-screen__title" tabIndex={-1}>{es.credits.title}</h1>
      <p>{es.credits.intro}</p>

      <ul className="credits-screen__list">
        {LICENSES.map((entry) => (
          <li key={entry.name} className="credits-screen__entry">
            <h2 className="credits-screen__name">{entry.name}</h2>
            <p className="credits-screen__attribution">{entry.attribution}</p>
            <dl className="credits-screen__details">
              <dt>{es.credits.authorLabel}</dt>
              <dd>{entry.author}</dd>
              <dt>{es.credits.licenseLabel}</dt>
              <dd>
                {/* When the license text travels with the work, link to that
                    copy: it works without a connection. */}
                <a
                  href={entry.licenseFile === undefined ? entry.licenseUrl : getLicenseFileUrl(entry.licenseFile)}
                  target="_blank"
                  rel="noreferrer"
                >
                  {entry.license}
                </a>
              </dd>
              <dt>{es.credits.sourceLabel}</dt>
              <dd>
                <a href={entry.sourceUrl} target="_blank" rel="noreferrer">
                  {entry.sourceUrl}
                </a>
              </dd>
              {entry.modification !== undefined && (
                <>
                  <dt>{es.credits.modificationLabel}</dt>
                  <dd>{entry.modification}</dd>
                </>
              )}
            </dl>
          </li>
        ))}
      </ul>

      <button type="button" className="credits-screen__back" onClick={onBack}>
        {es.credits.back}
      </button>
    </main>
  );
}
