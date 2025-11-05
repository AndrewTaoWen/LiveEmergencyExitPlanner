import { Marker, Source, Layer } from 'react-map-gl'
import { AlertCircle } from 'lucide-react'
import { RiskEvent } from '../types'
import './FixedIncidentMarker.css'

interface FixedIncidentMarkerProps {
  event: RiskEvent
  onSelect?: (event: RiskEvent) => void
}

export default function FixedIncidentMarker({ event, onSelect }: FixedIncidentMarkerProps) {
  const handleClick = () => {
    if (onSelect) {
      onSelect(event)
    }
  }

  const radius = event.affectedArea || 500 // meters in meters
  
  // Create circle GeoJSON feature
  // Convert meters to approximate pixels at different zoom levels
  // At zoom 13: 1 pixel ≈ 19.1 meters, so radius meters / 19.1 ≈ pixels
  const circleData = {
    type: 'Feature' as const,
    geometry: {
      type: 'Point' as const,
      coordinates: event.location
    },
    properties: {
      radius: radius
    }
  }

  return (
    <>
      <Source 
        id={`incident-source-${event.id}`} 
        type="geojson" 
        data={circleData}
      >
        <Layer
          id={`incident-circle-${event.id}`}
          type="circle"
          paint={{
            // Convert meters to pixels: approximate conversion
            // At zoom level Z, meters per pixel ≈ 156543.03392 * cos(lat) / 2^Z
            // We'll use a zoom-based interpolation
            'circle-radius': [
              'interpolate',
              ['exponential', 2],
              ['zoom'],
              10, radius / 150,  // zoom 10: ~150m per pixel
              13, radius / 19,   // zoom 13: ~19m per pixel  
              15, radius / 5,    // zoom 15: ~5m per pixel
              18, radius / 0.6   // zoom 18: ~0.6m per pixel
            ],
            'circle-color': '#ef4444',
            'circle-opacity': 0.2,
            'circle-stroke-color': '#ef4444',
            'circle-stroke-width': 2,
            'circle-stroke-opacity': 0.5
          }}
        />
      </Source>
      <Marker
        longitude={event.location[0]}
        latitude={event.location[1]}
        anchor="center"
      >
        <div 
          className="fixed-incident-marker"
          onClick={handleClick}
        >
          <div className="fixed-incident-icon">
            <AlertCircle size={24} />
          </div>
          <div className="fixed-incident-pulse"></div>
        </div>
      </Marker>
    </>
  )
}

