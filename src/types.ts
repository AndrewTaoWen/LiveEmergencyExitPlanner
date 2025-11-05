export type ViewMode = 'user' | 'operator'

export type IncidentStatus = 'reported' | 'investigating' | 'in_progress' | 'resolved' | 'monitoring'

export interface TimelineUpdate {
  timestamp: Date
  status: IncidentStatus
  severity: 'low' | 'medium' | 'high' | 'critical'
  description: string
  type: 'status_change' | 'severity_change' | 'update' | 'escalation'
}

export interface RiskEvent {
  id: string
  type: 'crime' | 'emergency' | 'weather' | 'traffic'
  severity: 'low' | 'medium' | 'high' | 'critical'
  status: IncidentStatus
  location: [number, number]
  timestamp: Date
  description: string
  distance?: number
  timeline: TimelineUpdate[]
  affectedArea?: number // radius in meters
}

export interface UserLocation {
  coordinates: [number, number]
  accuracy: number
  timestamp: Date
}

