import { useEffect, useRef, useState } from 'react';
import { SwirlBackground } from './background/SwirlBackground';
import { FpsCounter } from './debug/FpsCounter';
import { isDebugMode } from './debug/debugMode';
import { CreditsScreen } from './screens/CreditsScreen';
import { HomeScreen } from './screens/HomeScreen';

type Screen = 'home' | 'credits';

// Returns the screen saved in an entry of the browser history. The first
// entry has no saved screen: that is the home screen. The state can be
// anything that a page saved, so it is checked before reading it.
export function screenFromHistoryState(state: unknown): Screen {
  if (typeof state === 'object' && state !== null && 'screen' in state && state.screen === 'credits') {
    return 'credits';
  }
  return 'home';
}

function readScreenFromHistory(): Screen {
  return screenFromHistoryState(window.history.state);
}

// Root component. There is no router yet: the app remembers which of its
// screens is open, and saves each screen it opens in the browser history.
// That way the back gesture of the phone returns to the previous screen
// instead of closing the app.
export function App() {
  const [screen, setScreen] = useState<Screen>(readScreenFromHistory);

  // The back gesture (or the back button of the browser) moves through the
  // history; show the screen saved in the entry it lands on.
  useEffect(() => {
    function handlePopState() {
      setScreen(readScreenFromHistory());
    }
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // When the screen changes, the button that was pressed disappears and the
  // keyboard focus would be lost. Move it to the title of the new screen, so
  // a screen reader announces it (NFR-ACS-001). Not on the first render: the
  // app has just opened and the focus is where the browser put it.
  const isFirstRender = useRef(true);
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    document.querySelector<HTMLElement>('main h1')?.focus();
  }, [screen]);

  function openCredits() {
    window.history.pushState({ screen: 'credits' }, '');
    setScreen('credits');
  }

  // The back button of the screen does the same as the back gesture, so the
  // history stays in step with what is shown.
  function goBack() {
    window.history.back();
  }

  const screenElement =
    screen === 'credits' ? <CreditsScreen onBack={goBack} /> : <HomeScreen onOpenCredits={openCredits} />;

  // The background stays in place while the screens change on top of it.
  return (
    <>
      <SwirlBackground />
      {isDebugMode(window.location.search) && <FpsCounter />}
      {screenElement}
    </>
  );
}
