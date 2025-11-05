import { RiskEvent } from '../types'
import { AlertTriangle, AlertCircle, CloudRain, Zap, MapPin } from 'lucide-react'
import './EventsPanel.css'

interface EventsPanelProps {
  events: RiskEvent[]
  userLocation: [number, number] | null
  onEventSelect: (event: RiskEvent) => void
  selectedEvent: RiskEvent | null
}

export default function EventsPanel({ events, userLocation, onEventSelect, selectedEvent }: EventsPanelProps) {
  const getEventIcon = (type: RiskEvent['type']) => {
    switch (type) {
      case 'crime':
        return <AlertTriangle size={18} />
      case 'emergency':
        return <AlertCircle size={18} />
      case 'weather':
        return <CloudRain size={18} />
      case 'traffic':
        return <Zap size={18} />
      default:
        return <AlertCircle size={18} />
    }
  }

  const getSeverityColor = (severity: RiskEvent['severity']) => {
    switch (severity) {
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

  const shouldBeAware = (event: RiskEvent) => {
    // Highlight events that are critical/high severity or within 250m
    return event.severity === 'critical' || 
           event.severity === 'high' || 
           (event.distance !== undefined && event.distance < 250)
  }

  const formatTimeAgo = (date: Date) => {
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 1) return 'Just now'
    if (diffMins < 60) return `${diffMins}m ago`
    if (diffHours < 24) return `${diffHours}h ago`
    return `${diffDays}d ago`
  }

  // Sort events: aware events first, then by distance
  const sortedEvents = [...events].sort((a, b) => {
    const aAware = shouldBeAware(a)
    const bAware = shouldBeAware(b)
    
    if (aAware && !bAware) return -1
    if (!aAware && bAware) return 1
    
    return (a.distance || Infinity) - (b.distance || Infinity)
  })

  return (
    <div className="events-panel">
      <div className="events-panel-header">
        <h2>Incidents & Alerts</h2>
        <div className="events-count">{events.length} active</div>
      </div>

      <div className="events-list">
        {sortedEvents.length === 0 ? (
          <div className="events-empty">
            <p>No incidents reported in your area</p>
          </div>
        ) : (
          sortedEvents.map((event) => {
            const isAware = shouldBeAware(event)
            const isSelected = selectedEvent?.id === event.id
            const color = getSeverityColor(event.severity)

            return (
              <div
                key={event.id}
                className={`event-item ${isAware ? 'aware' : ''} ${isSelected ? 'selected' : ''}`}
                onClick={() => onEventSelect(event)}
                style={{
                  borderLeftColor: color
                }}
              >
                <div className="event-item-header">
                  <div className="event-icon" style={{ color }}>
                    {getEventIcon(event.type)}
                  </div>
                  <div className="event-item-content">
                    <div className="event-title">
                      <span className="event-type">{event.type.toUpperCase()}</span>
                      <span 
                        className="event-severity"
                        style={{ color }}
                      >
                        {event.severity}
                      </span>
                    </div>
                    <div className="event-description">{event.description}</div>
                  </div>
                  {isAware && (
                    <div className="event-alert-badge">!</div>
                  )}
                </div>
                <div className="event-item-footer">
                  <div className="event-meta">
                    {event.distance !== undefined && (
                      <div className="event-distance">
                        <MapPin size={14} />
                        <span>{Math.round(event.distance)}m away</span>
                      </div>
                    )}
                    <div className="event-time">{formatTimeAgo(event.timestamp)}</div>
                  </div>
                  <div className="event-status">{event.status.replace('_', ' ')}</div>
                </div>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}

