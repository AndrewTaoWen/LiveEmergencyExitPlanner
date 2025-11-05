import { RiskEvent } from '../types'
import { AlertTriangle, Activity, Users, TrendingUp } from 'lucide-react'
import './OperatorView.css'

interface OperatorViewProps {
  events: RiskEvent[]
}

export default function OperatorView({ events }: OperatorViewProps) {
  // Calculate statistics
  const totalIncidents = events.length
  const incidentsByType = events.reduce((acc, event) => {
    acc[event.type] = (acc[event.type] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  const incidentsBySeverity = events.reduce((acc, event) => {
    acc[event.severity] = (acc[event.severity] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  const incidentsByStatus = events.reduce((acc, event) => {
    acc[event.status] = (acc[event.status] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  const activeIncidents = events.filter(e => e.status !== 'resolved').length
  const criticalIncidents = events.filter(e => e.severity === 'critical').length

  // Simulated active users
  const activeUsers = Math.floor(Math.random() * 50) + 10

  const getSeverityColor = (severity: string) => {
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

  const getStatusColor = (status: string) => {
    switch (status) {
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

  return (
    <div className="operator-view">
      <div className="operator-stats-grid">
        <div className="stat-card critical">
          <div className="stat-icon">
            <AlertTriangle size={24} />
          </div>
          <div className="stat-content">
            <div className="stat-value">{criticalIncidents}</div>
            <div className="stat-label">Critical Incidents</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">
            <Activity size={24} />
          </div>
          <div className="stat-content">
            <div className="stat-value">{activeIncidents}</div>
            <div className="stat-label">Active Incidents</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">
            <Users size={24} />
          </div>
          <div className="stat-content">
            <div className="stat-value">{activeUsers}</div>
            <div className="stat-label">Active Users</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">
            <TrendingUp size={24} />
          </div>
          <div className="stat-content">
            <div className="stat-value">{totalIncidents}</div>
            <div className="stat-label">Total Incidents</div>
          </div>
        </div>
      </div>

      <div className="operator-breakdowns">
        <div className="breakdown-card">
          <h3>By Type</h3>
          <div className="breakdown-list">
            {Object.entries(incidentsByType).map(([type, count]) => (
              <div key={type} className="breakdown-item">
                <span className="breakdown-label">{type.toUpperCase()}</span>
                <span className="breakdown-value">{count}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="breakdown-card">
          <h3>By Severity</h3>
          <div className="breakdown-list">
            {Object.entries(incidentsBySeverity).map(([severity, count]) => (
              <div key={severity} className="breakdown-item">
                <span 
                  className="breakdown-label"
                  style={{ color: getSeverityColor(severity) }}
                >
                  {severity.toUpperCase()}
                </span>
                <span className="breakdown-value">{count}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="breakdown-card">
          <h3>By Status</h3>
          <div className="breakdown-list">
            {Object.entries(incidentsByStatus).map(([status, count]) => (
              <div key={status} className="breakdown-item">
                <span 
                  className="breakdown-label"
                  style={{ color: getStatusColor(status) }}
                >
                  {status.replace('_', ' ').toUpperCase()}
                </span>
                <span className="breakdown-value">{count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="operator-incident-list">
        <h3>Active Incidents</h3>
        <div className="incident-list">
          {events
            .filter(e => e.status !== 'resolved')
            .sort((a, b) => {
              const severityOrder = { critical: 4, high: 3, medium: 2, low: 1 }
              return (severityOrder[b.severity] || 0) - (severityOrder[a.severity] || 0)
            })
            .slice(0, 10)
            .map(event => (
              <div key={event.id} className="incident-list-item">
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
        </div>
      </div>
    </div>
  )
}

