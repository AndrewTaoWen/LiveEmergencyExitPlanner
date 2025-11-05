import { useState } from 'react'
import MapView from './components/MapView'
import ControlPanel from './components/ControlPanel'
import { ViewMode, RiskEvent } from './types'
import './App.css'

function App() {
  const [viewMode, setViewMode] = useState<ViewMode>('user')
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null)
  const [events, setEvents] = useState<RiskEvent[]>([])
  const [fixedIncident, setFixedIncident] = useState<RiskEvent | null>(null)

  return (
    <div className="app">
      <ControlPanel 
        viewMode={viewMode} 
        onViewModeChange={setViewMode}
        userLocation={userLocation}
        events={events}
        fixedIncident={fixedIncident}
      />
      <MapView 
        viewMode={viewMode}
        onLocationUpdate={setUserLocation}
        onEventsUpdate={setEvents}
        onFixedIncidentUpdate={setFixedIncident}
      />
    </div>
  )
}

export default App

