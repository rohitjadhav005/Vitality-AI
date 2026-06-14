import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import './pages.css'
import App from './App.jsx'

import { FluidPWAProvider } from 'fluid-pwa'

const pwaConfig = {
  databaseName: 'VitalityApp',
  schema: {
    predictions: '++localId, date, energyLevel, productivityScore, syncStatus, lastModifiedOffline',
    metrics: '++localId, date, sleepHours, caffeineIntake, stressLevel, syncStatus, lastModifiedOffline'
  },
  version: 1,
  enableLogging: true
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <FluidPWAProvider config={pwaConfig}>
      <App />
    </FluidPWAProvider>
  </StrictMode>,
)
