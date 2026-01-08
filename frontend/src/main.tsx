import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

import { applyThemePreference, getThemePreference, subscribePreferencesChange } from './lib/preferences'

applyThemePreference(getThemePreference())
subscribePreferencesChange(() => {
  applyThemePreference(getThemePreference())
})

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
