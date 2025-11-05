import { Marker } from 'react-map-gl'
import { ViewMode } from '../types'
import './LocationMarker.css'

interface LocationMarkerProps {
  longitude: number
  latitude: number
  viewMode: ViewMode
}

export default function LocationMarker({ longitude, latitude, viewMode }: LocationMarkerProps) {
  return (
    <Marker
      longitude={longitude}
      latitude={latitude}
      anchor="center"
    >
      <div className={`location-marker ${viewMode}`}>
        <div className="pulse-ring"></div>
        <div className="pulse-ring-delay"></div>
        <div className="marker-dot">
          <div className="marker-inner"></div>
        </div>
        {viewMode === 'user' && (
          <div className="location-label">You are here</div>
        )}
      </div>
    </Marker>
  )
}

