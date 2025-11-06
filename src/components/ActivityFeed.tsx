import { ActivityLog } from '../types'
import { Clock, AlertCircle, User, Edit, Bell } from 'lucide-react'
import './ActivityFeed.css'

interface ActivityFeedProps {
  activities: ActivityLog[]
}

export default function ActivityFeed({ activities }: ActivityFeedProps) {
  const formatTimeAgo = (date: Date) => {
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffSecs = Math.floor(diffMs / 1000)

    if (diffSecs < 10) return 'Just now'
    if (diffSecs < 60) return `${diffSecs}s ago`
    if (diffMins < 60) return `${diffMins}m ago`
    return new Date(date).toLocaleTimeString()
  }

  const getActivityIcon = (type: ActivityLog['type']) => {
    switch (type) {
      case 'incident_created':
        return <AlertCircle size={14} />
      case 'incident_updated':
      case 'status_change':
      case 'severity_change':
        return <Edit size={14} />
      case 'user_alert':
        return <Bell size={14} />
      case 'assignment':
        return <User size={14} />
      default:
        return <Clock size={14} />
    }
  }

  const getActivityColor = (type: ActivityLog['type']) => {
    switch (type) {
      case 'incident_created':
        return '#ef4444'
      case 'status_change':
      case 'severity_change':
        return '#f97316'
      case 'user_alert':
        return '#eab308'
      case 'assignment':
        return '#3b82f6'
      default:
        return '#6b7280'
    }
  }

  return (
    <div className="activity-feed">
      <div className="activity-feed-header">
        <h3>Activity Feed</h3>
        <span className="activity-count">{activities.length}</span>
      </div>
      <div className="activity-list">
        {activities.length === 0 ? (
          <div className="activity-empty">No recent activity</div>
        ) : (
          activities.map(activity => (
            <div key={activity.id} className="activity-item">
              <div 
                className="activity-icon"
                style={{ 
                  backgroundColor: `${getActivityColor(activity.type)}20`,
                  color: getActivityColor(activity.type)
                }}
              >
                {getActivityIcon(activity.type)}
              </div>
              <div className="activity-content">
                <div className="activity-description">{activity.description}</div>
                <div className="activity-meta">
                  <span className="activity-time">{formatTimeAgo(activity.timestamp)}</span>
                  {activity.incidentId && (
                    <span className="activity-incident-id">#{activity.incidentId.slice(-6)}</span>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

