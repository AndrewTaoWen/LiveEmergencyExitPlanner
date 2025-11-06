import { useState, useEffect, useMemo, useRef } from 'react'
import { RiskEvent, ActivityLog, TrackedUser } from '../types'
import { AlertTriangle, Activity, Users, TrendingUp, X } from 'lucide-react'
import OperatorIncidentFilter from './OperatorIncidentFilter'
import ActivityFeed from './ActivityFeed'
import IncidentManagementPanel from './IncidentManagementPanel'
import './OperatorView.css'

interface OperatorViewProps {
  events: RiskEvent[]
  trackedUsers?: TrackedUser[]
  selectedIncident?: RiskEvent | null
  onIncidentUpdate?: (incidentId: string, updates: Partial<RiskEvent>) => void
  onIncidentSelect?: (incident: RiskEvent | null) => void
}

export default function OperatorView({ 
  events, 
  trackedUsers = [],
  selectedIncident: externalSelectedIncident = null,
  onIncidentUpdate,
  onIncidentSelect 
}: OperatorViewProps) {
  const [filteredEvents, setFilteredEvents] = useState<RiskEvent[]>(events)
  const [selectedIncident, setSelectedIncident] = useState<RiskEvent | null>(externalSelectedIncident)
  const [activityLog, setActivityLog] = useState<ActivityLog[]>([])
  const [showManagementPanel, setShowManagementPanel] = useState(false)
  const managementPanelRef = useRef<HTMLDivElement>(null)

  // Sync with external selected incident
  useEffect(() => {
    if (externalSelectedIncident) {
      setSelectedIncident(externalSelectedIncident)
      setShowManagementPanel(true)
    }
  }, [externalSelectedIncident])

  // Initialize activity log from events
  useEffect(() => {
    const initialActivities: ActivityLog[] = events
      .filter(e => e.status !== 'resolved')
      .slice(0, 10)
      .map(event => ({
        id: `activity-${event.id}`,
        timestamp: event.timestamp,
        type: 'incident_created',
        description: `${event.type.toUpperCase()} incident reported: ${event.description.slice(0, 50)}...`,
        incidentId: event.id,
      }))
    
    setActivityLog(prev => [...initialActivities, ...prev].slice(0, 50))
  }, [])

  // Update filtered events when events change
  useEffect(() => {
    setFilteredEvents(events)
  }, [events])

  // Calculate statistics from filtered events
  const stats = useMemo(() => {
    const totalIncidents = filteredEvents.length
    const activeIncidents = filteredEvents.filter(e => e.status !== 'resolved').length
    const criticalIncidents = filteredEvents.filter(e => e.severity === 'critical').length
    const activeUsers = trackedUsers.length || Math.floor(Math.random() * 50) + 10

    const incidentsByType = filteredEvents.reduce((acc, event) => {
      acc[event.type] = (acc[event.type] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    const incidentsBySeverity = filteredEvents.reduce((acc, event) => {
      acc[event.severity] = (acc[event.severity] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    const incidentsByStatus = filteredEvents.reduce((acc, event) => {
      acc[event.status] = (acc[event.status] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    return {
      totalIncidents,
      activeIncidents,
      criticalIncidents,
      activeUsers,
      incidentsByType,
      incidentsBySeverity,
      incidentsByStatus,
    }
  }, [filteredEvents, trackedUsers])

  const handleIncidentClick = (incident: RiskEvent) => {
    setSelectedIncident(incident)
    setShowManagementPanel(true)
    if (onIncidentSelect) {
      onIncidentSelect(incident)
    }
    // Scroll to top of operator view to show management panel
    setTimeout(() => {
      const operatorView = managementPanelRef.current?.closest('.operator-view')
      if (operatorView) {
        operatorView.scrollTo({ top: 0, behavior: 'smooth' })
      }
    }, 50)
  }

  const handleIncidentUpdate = (incidentId: string, updates: Partial<RiskEvent>) => {
    if (onIncidentUpdate) {
      onIncidentUpdate(incidentId, updates)
    }
    // Update local state
    setFilteredEvents(prev => 
      prev.map(event => 
        event.id === incidentId ? { ...event, ...updates } : event
      )
    )
    if (selectedIncident?.id === incidentId) {
      setSelectedIncident({ ...selectedIncident, ...updates })
    }
  }

  const handleActivityLog = (activity: ActivityLog) => {
    setActivityLog(prev => [activity, ...prev].slice(0, 50))
  }

  const handleCloseManagementPanel = () => {
    setShowManagementPanel(false)
    setSelectedIncident(null)
    if (onIncidentSelect) {
      onIncidentSelect(null)
    }
  }

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

  return (
    <div className="operator-view">
      {/* Statistics Cards */}
      <div className="operator-stats-grid">
        <div className="stat-card critical">
          <div className="stat-icon">
            <AlertTriangle size={24} />
          </div>
          <div className="stat-content">
            <div className="stat-value">{stats.criticalIncidents}</div>
            <div className="stat-label">Critical Incidents</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">
            <Activity size={24} />
          </div>
          <div className="stat-content">
            <div className="stat-value">{stats.activeIncidents}</div>
            <div className="stat-label">Active Incidents</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">
            <Users size={24} />
          </div>
          <div className="stat-content">
            <div className="stat-value">{stats.activeUsers}</div>
            <div className="stat-label">Active Users</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">
            <TrendingUp size={24} />
          </div>
          <div className="stat-content">
            <div className="stat-value">{stats.totalIncidents}</div>
            <div className="stat-label">Total Incidents</div>
          </div>
        </div>
      </div>

      {/* Incident Management Panel - Show at top when open */}
      {showManagementPanel && selectedIncident && (
        <div ref={managementPanelRef}>
          <IncidentManagementPanel
            incident={selectedIncident}
            onUpdate={handleIncidentUpdate}
            onClose={handleCloseManagementPanel}
            onActivityLog={handleActivityLog}
          />
        </div>
      )}

      {/* Filter Component */}
      <OperatorIncidentFilter 
        events={events}
        onFilterChange={setFilteredEvents}
      />

      {/* Breakdowns - Only show when panel is closed to save space */}
      {!showManagementPanel && (
      <div className="operator-breakdowns">
        <div className="breakdown-card">
          <h3>By Type</h3>
          <div className="breakdown-list">
            {Object.entries(stats.incidentsByType).map(([type, count]) => (
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
            {Object.entries(stats.incidentsBySeverity).map(([severity, count]) => (
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
            {Object.entries(stats.incidentsByStatus).map(([status, count]) => (
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
      )}

      {/* Activity Feed - Show when panel is closed */}
      {!showManagementPanel && (
        <ActivityFeed activities={activityLog} />
      )}
    </div>
  )
}
