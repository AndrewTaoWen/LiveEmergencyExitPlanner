import { RiskEvent } from '../types'
import './OperatorIncidentList.css'

interface OperatorIncidentListProps {
  events: RiskEvent[]
  selectedIncident: RiskEvent | null
  onIncidentClick: (incident: RiskEvent) => void
}

export default function OperatorIncidentList({ 
  events, 
  selectedIncident, 
  onIncidentClick 
}: OperatorIncidentListProps) {
  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return '#ef4444'
      case 'high': return '#f97316'
      case 'medium': return '#eab308'
      case 'low': return '#3b82f6'
      default: return '#6b7280'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'reported': return '#3b82f6'
      case 'investigating': return '#eab308'
      case 'in_progress': return '#f97316'
      case 'resolved': return '#10b981'
      case 'monitoring': return '#6b7280'
      default: return '#6b7280'
    }
  }

  const activeIncidents = events.filter(e => e.status !== 'resolved')

  return (
    <div className="operator-incident-list-container">
      <div className="operator-incident-list">
        <h3>Active Incidents ({activeIncidents.length})</h3>
        <div className="incident-list">
          {activeIncidents
            .sort((a, b) => {
              const severityOrder = { critical: 4, high: 3, medium: 2, low: 1 }
              return (severityOrder[b.severity] || 0) - (severityOrder[a.severity] || 0)
            })
            .slice(0, 10)
            .map(event => (
              <div 
                key={event.id} 
                className={`incident-list-item ${selectedIncident?.id === event.id ? 'selected' : ''}`}
                onClick={() => onIncidentClick(event)}
              >
                <div className="incident-item-header">
                  <span className="incident-item-type">{event.type.toUpperCase()}</span>
                  <span 
                    className="incident-item-severity"
                    style={{ color: getSeverityColor(event.severity) }}
                  >
                    {event.severity}
                  </span>
                </div>
                <div className="incident-item-description">{event.description}</div>
                <div className="incident-item-footer">
                  <span className="incident-item-status" style={{ color: getStatusColor(event.status) }}>
                    {event.status.replace('_', ' ')}
                  </span>
                  {event.distance && (
                    <span className="incident-item-distance">{Math.round(event.distance)}m away</span>
                  )}
                </div>
              </div>
            ))}
          {activeIncidents.length === 0 && (
            <div className="incident-list-empty">No active incidents</div>
          )}
        </div>
      </div>
    </div>
  )
}

