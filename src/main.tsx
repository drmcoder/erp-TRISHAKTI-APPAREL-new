import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import './shared/styles/globals.css';
import App from './App.tsx';

// Initialize Firebase connectivity testing and session management
import './services/firebase-test';
import './services/session-manager';

// Initialize cache management
import './utils/cache-manager';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
