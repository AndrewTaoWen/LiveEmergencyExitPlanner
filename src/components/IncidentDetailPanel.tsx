import { RiskEvent } from '../types'
import { X, MapPin, Clock, AlertCircle } from 'lucide-react'
import IncidentTimeline from './IncidentTimeline'
import './IncidentDetailPanel.css'

interface IncidentDetailPanelProps {
  event: RiskEvent | null
  onClose: () => void
}

export default function IncidentDetailPanel({ event, onClose }: IncidentDetailPanelProps) {
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

  const getStatusColor = () => {
    switch (event.status) {
      case 'reported':
        return '#3b82f6'
      case 'investigating':
        return '#eab308'
      case 'in_progress':
        return '#f97316'
      case 'resolved':
        return '#10b981'
      case 'monitoring':
        return '#6b7280'
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
      <div className="incident-panel-backdrop" onClick={onClose} />
      <div className="incident-detail-panel">
        <div className="incident-panel-header">
          <div className="incident-panel-title">
            <AlertCircle size={24} style={{ color: getSeverityColor() }} />
            <div>
              <h2>{event.type.toUpperCase()} Incident</h2>
              <p className="incident-time">Reported {formatTimeAgo(event.timestamp)}</p>
            </div>
          </div>
          <button className="incident-panel-close" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div className="incident-panel-content">
          <div className="incident-status-badges">
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
            <div 
              className="status-badge"
              style={{ 
                backgroundColor: `${getStatusColor()}20`,
                borderColor: getStatusColor(),
                color: getStatusColor()
              }}
            >
              {event.status.replace('_', ' ').toUpperCase()}
            </div>
          </div>

          <div className="incident-description">
            <h3>Description</h3>
            <p>{event.description}</p>
          </div>

          {event.distance && (
            <div className="incident-location">
              <MapPin size={18} />
              <span>{Math.round(event.distance)}m away</span>
            </div>
          )}

          {event.affectedArea && (
            <div className="incident-affected-area">
              <AlertCircle size={18} />
              <span>Affected area: {event.affectedArea}m radius</span>
            </div>
          )}

          <div className="incident-timeline-section">
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

