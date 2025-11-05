import { useEffect, useState } from 'react'
import { RiskEvent } from '../types'
import { X, MapPin, Clock, AlertCircle } from 'lucide-react'
import IncidentTimeline from './IncidentTimeline'
import './BottomDrawer.css'

interface BottomDrawerProps {
  event: RiskEvent | null
  onClose: () => void
}

export default function BottomDrawer({ event, onClose }: BottomDrawerProps) {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    if (event) {
      // Trigger slide-up animation
      setTimeout(() => setIsVisible(true), 10)
    } else {
      setIsVisible(false)
    }
  }, [event])

  const handleClose = () => {
    setIsVisible(false)
    setTimeout(onClose, 300) // Wait for animation to complete
  }

  if (!event) return null

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

  const formatTimeAgo = (date: Date) => {
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 1) return 'Just now'
    if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`
    return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`
  }

  return (
    <>
      <div 
        className={`bottom-drawer-backdrop ${isVisible ? 'visible' : ''}`}
        onClick={handleClose}
      />
      <div className={`bottom-drawer ${isVisible ? 'visible' : ''}`}>
        <div className="drawer-handle" onClick={handleClose} />
        
        <div className="drawer-header">
          <div className="drawer-title-section">
            <AlertCircle size={24} style={{ color: getSeverityColor() }} />
            <div>
              <h2>{event.type.toUpperCase()} Incident</h2>
              <p className="drawer-subtitle">Reported {formatTimeAgo(event.timestamp)}</p>
            </div>
          </div>
          <button className="drawer-close" onClick={handleClose}>
            <X size={20} />
          </button>
        </div>

        <div className="drawer-content">
          <div className="drawer-status-badges">
            <div 
              className="status-badge"
              style={{ 
                backgroundColor: `${getSeverityColor()}20`,
                borderColor: getSeverityColor(),
                color: getSeverityColor()
              }}
            >
              {event.severity.toUpperCase()}
            </div>
            <div className="status-badge">
              {event.status.replace('_', ' ').toUpperCase()}
            </div>
          </div>

          <div className="drawer-section">
            <h3>Description</h3>
            <p>{event.description}</p>
          </div>

          {event.distance && (
            <div className="drawer-info-item">
              <MapPin size={18} />
              <span>{Math.round(event.distance)}m away from your location</span>
            </div>
          )}

          {event.affectedArea && (
            <div className="drawer-info-item">
              <AlertCircle size={18} />
              <span>Affected area: {event.affectedArea}m radius</span>
            </div>
          )}

          <div className="drawer-section">
            <h3>
              <Clock size={18} />
              Timeline
            </h3>
            <IncidentTimeline timeline={event.timeline} />
          </div>
        </div>
      </div>
    </>
  )
}

