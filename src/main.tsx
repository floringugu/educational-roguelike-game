import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './App';
import './styles/tokens.css';
import './styles/fonts.css';
import './styles/global.css';

const rootElement = document.getElementById('root');
if (rootElement === null) {
  throw new Error('index.html has no element with id "root"');
}

createRoot(rootElement).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
