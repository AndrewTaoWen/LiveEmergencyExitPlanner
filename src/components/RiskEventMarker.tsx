import { Marker } from 'react-map-gl'
import { RiskEvent } from '../types'
import { AlertTriangle, AlertCircle, Zap, CloudRain } from 'lucide-react'
import './RiskEventMarker.css'

interface RiskEventMarkerProps {
  event: RiskEvent
  userLocation?: [number, number] | null
  onSelect?: (event: RiskEvent) => void
}

export default function RiskEventMarker({ event, onSelect }: RiskEventMarkerProps) {
  const getIcon = () => {
    switch (event.type) {
      case 'crime':
        return <AlertTriangle size={16} />
      case 'emergency':
        return <AlertCircle size={16} />
      case 'weather':
        return <CloudRain size={16} />
      case 'traffic':
        return <Zap size={16} />
      default:
        return <AlertCircle size={16} />
    }
  }

  const getSeverityColor = () => {
    switch (event.severity) {
      case 'critical':
        return '#ef4444'
      case 'high':
        return '#f97316'
      case 'medium':
        return '#eab308'
      case 'low':
        return '#3b82f6'
      default:
        return '#6b7280'
    }
  }

  const handleClick = () => {
    if (onSelect) {
      onSelect(event)
    }
  }

  return (
    <Marker
      longitude={event.location[0]}
      latitude={event.location[1]}
      anchor="center"
    >
      <div 
        className="risk-event-marker"
        style={{ color: getSeverityColor() }}
        onClick={handleClick}
        title={`${event.type} - ${event.severity}`}
      >
        <div 
          className="risk-icon"
          style={{ 
            backgroundColor: `${getSeverityColor()}30`,
            borderColor: getSeverityColor(),
            borderWidth: '2px'
          }}
        >
          {getIcon()}
        </div>
      </div>
    </Marker>
  )
}

