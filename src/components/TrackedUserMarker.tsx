import { TrackedUser } from '../types'
import { User } from 'lucide-react'
import './TrackedUserMarker.css'

interface TrackedUserMarkerProps {
  user: TrackedUser
  onSelect?: (user: TrackedUser) => void
}

export default function TrackedUserMarker({ user, onSelect }: TrackedUserMarkerProps) {
  const getStatusColor = () => {
    switch (user.status) {
      case 'at_risk':
        return '#ef4444'
      case 'safe':
        return '#10b981'
      default:
        return '#6b7280'
    }
  }

  return (
    <div
      className={`tracked-user-marker ${user.status}`}
      onClick={() => onSelect?.(user)}
      style={{
        '--status-color': getStatusColor()
      } as React.CSSProperties}
    >
      <div className="user-marker-pulse" />
      <div className="user-marker-icon">
        <User size={16} />
      </div>
      <div className="user-marker-label">{user.name}</div>
    </div>
  )
}

