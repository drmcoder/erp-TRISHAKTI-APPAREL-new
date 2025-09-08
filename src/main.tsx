import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import './shared/styles/globals.css';
import App from './App.tsx';

// Services will be initialized lazily when needed to reduce initial bundle size
// Firebase and session management will be loaded on first use

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
