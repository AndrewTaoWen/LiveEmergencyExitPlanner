import { useState } from 'react'
import { RiskEvent, IncidentStatus, ActivityLog } from '../types'
import { X, User, MessageSquare, CheckCircle, AlertCircle } from 'lucide-react'
import './IncidentManagementPanel.css'

interface IncidentManagementPanelProps {
  incident: RiskEvent | null
  onUpdate: (incidentId: string, updates: Partial<RiskEvent>) => void
  onClose: () => void
  onActivityLog: (activity: ActivityLog) => void
}

export default function IncidentManagementPanel({ 
  incident, 
  onUpdate, 
  onClose,
  onActivityLog 
}: IncidentManagementPanelProps) {
  const [selectedStatus, setSelectedStatus] = useState<IncidentStatus>(incident?.status || 'reported')
  const [selectedSeverity, setSelectedSeverity] = useState<string>(incident?.severity || 'low')
  const [note, setNote] = useState('')

  if (!incident) return null

  const statuses: IncidentStatus[] = ['reported', 'investigating', 'in_progress', 'resolved', 'monitoring']
  const severities = ['low', 'medium', 'high', 'critical']

  const handleStatusChange = (newStatus: IncidentStatus) => {
    if (newStatus !== incident.status) {
      onUpdate(incident.id, { status: newStatus })
      onActivityLog({
        id: `activity-${Date.now()}`,
        timestamp: new Date(),
        type: 'status_change',
        description: `Status changed to ${newStatus.replace('_', ' ')}`,
        incidentId: incident.id,
        operatorId: 'operator-1',
      })
      setSelectedStatus(newStatus)
    }
  }

  const handleSeverityChange = (newSeverity: string) => {
    if (newSeverity !== incident.severity) {
      onUpdate(incident.id, { severity: newSeverity as any })
      onActivityLog({
        id: `activity-${Date.now()}`,
        timestamp: new Date(),
        type: 'severity_change',
        description: `Severity changed to ${newSeverity}`,
        incidentId: incident.id,
        operatorId: 'operator-1',
      })
      setSelectedSeverity(newSeverity)
    }
  }

  const handleAddNote = () => {
    if (note.trim()) {
      onActivityLog({
        id: `activity-${Date.now()}`,
        timestamp: new Date(),
        type: 'incident_updated',
        description: `Note added: ${note}`,
        incidentId: incident.id,
        operatorId: 'operator-1',
      })
      setNote('')
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

  const getStatusColor = (status: IncidentStatus) => {
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
    <div className="incident-management-panel">
      <div className="management-panel-header">
        <div>
          <h3>Manage Incident</h3>
          <p className="incident-id">#{incident.id.slice(-8)}</p>
        </div>
        <button className="panel-close-btn" onClick={onClose}>
          <X size={20} />
        </button>
      </div>

      <div className="management-panel-content">
        <div className="management-section">
          <h4>Status</h4>
          <div className="status-buttons">
            {statuses.map(status => (
              <button
                key={status}
                className={`status-btn ${selectedStatus === status ? 'active' : ''}`}
                onClick={() => handleStatusChange(status)}
                style={{
                  borderColor: selectedStatus === status ? getStatusColor(status) : undefined,
                  backgroundColor: selectedStatus === status ? `${getStatusColor(status)}20` : undefined
                }}
              >
                {status === 'resolved' && <CheckCircle size={14} />}
                {status.replace('_', ' ').toUpperCase()}
              </button>
            ))}
          </div>
        </div>

        <div className="management-section">
          <h4>Severity</h4>
          <div className="severity-buttons">
            {severities.map(severity => (
              <button
                key={severity}
                className={`severity-btn ${selectedSeverity === severity ? 'active' : ''}`}
                onClick={() => handleSeverityChange(severity)}
                style={{
                  borderColor: selectedSeverity === severity ? getSeverityColor(severity) : undefined,
                  backgroundColor: selectedSeverity === severity ? `${getSeverityColor(severity)}20` : undefined,
                  color: selectedSeverity === severity ? getSeverityColor(severity) : undefined
                }}
              >
                {severity.toUpperCase()}
              </button>
            ))}
          </div>
        </div>

        <div className="management-section">
          <h4>Add Note</h4>
          <div className="note-input-group">
            <textarea
              className="note-textarea"
              placeholder="Add a note about this incident..."
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={3}
            />
            <button 
              className="note-add-btn"
              onClick={handleAddNote}
              disabled={!note.trim()}
            >
              <MessageSquare size={14} />
              Add Note
            </button>
          </div>
        </div>

        <div className="management-section">
          <h4>Quick Actions</h4>
          <div className="quick-actions">
            <button className="quick-action-btn">
              <User size={14} />
              Assign Operator
            </button>
            <button className="quick-action-btn">
              <AlertCircle size={14} />
              Escalate
            </button>
            <button className="quick-action-btn">
              <CheckCircle size={14} />
              Mark Resolved
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

