import { TimelineUpdate } from '../types'
import { Clock, TrendingUp, Info } from 'lucide-react'
import './IncidentTimeline.css'

interface IncidentTimelineProps {
  timeline: TimelineUpdate[]
}

export default function IncidentTimeline({ timeline }: IncidentTimelineProps) {
  const getUpdateIcon = (type: TimelineUpdate['type']) => {
    switch (type) {
      case 'status_change':
        return <Clock size={14} />
      case 'severity_change':
      case 'escalation':
        return <TrendingUp size={14} />
      default:
        return <Info size={14} />
    }
  }

  const getStatusColor = (status: TimelineUpdate['status']) => {
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

  const getSeverityColor = (severity: TimelineUpdate['severity']) => {
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

  const formatTime = (date: Date) => {
    return new Date(date).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    })
  }

  if (timeline.length === 0) {
    return (
      <div className="timeline-empty">
        <p>No timeline updates yet</p>
      </div>
    )
  }

  return (
    <div className="incident-timeline">
      {timeline.map((update, index) => (
        <div key={index} className="timeline-item">
          <div className="timeline-line" />
          <div className="timeline-dot" style={{ borderColor: getStatusColor(update.status) }}>
            <div 
              className="timeline-dot-inner" 
              style={{ backgroundColor: getStatusColor(update.status) }}
            />
          </div>
          <div className="timeline-content">
            <div className="timeline-header">
              <div className="timeline-type-icon">
                {getUpdateIcon(update.type)}
              </div>
              <span className="timeline-time">{formatTime(update.timestamp)}</span>
              <span 
                className="timeline-status"
                style={{ color: getStatusColor(update.status) }}
              >
                {update.status.replace('_', ' ').toUpperCase()}
              </span>
              <span 
                className="timeline-severity"
                style={{ color: getSeverityColor(update.severity) }}
              >
                {update.severity.toUpperCase()}
              </span>
            </div>
            <p className="timeline-description">{update.description}</p>
          </div>
        </div>
      ))}
    </div>
  )
}

