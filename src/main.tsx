import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { registerServiceWorker, setupInstallPrompt } from './utils/pwa'

// Register service worker and setup PWA features
if (typeof window !== 'undefined') {
  registerServiceWorker();
  setupInstallPrompt();
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
