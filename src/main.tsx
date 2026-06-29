import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
// Self-hosted fonts (bundled, served from 'self') so the tight CSP doesn't block
// them the way the old Google Fonts @import did. Family names: 'Fraunces Variable'
// and 'DM Mono' (see --font-display / --font-mono in index.css).
import '@fontsource-variable/fraunces/index.css'
import '@fontsource/dm-mono/400.css'
import '@fontsource/dm-mono/500.css'
import './index.css'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
