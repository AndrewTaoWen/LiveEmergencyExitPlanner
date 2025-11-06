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

export interface TrackedUser {
  id: string
  name: string
  location: [number, number]
  status: 'safe' | 'at_risk' | 'unknown'
  lastUpdate: Date
  nearbyIncidents?: string[] // incident IDs
}

export interface ActivityLog {
  id: string
  timestamp: Date
  type: 'incident_created' | 'incident_updated' | 'status_change' | 'severity_change' | 'user_alert' | 'assignment'
  description: string
  incidentId?: string
  userId?: string
  operatorId?: string
}

export interface IncidentNote {
  id: string
  incidentId: string
  operatorId: string
  operatorName: string
  note: string
  timestamp: Date
}

export interface IncidentAssignment {
  incidentId: string
  operatorId: string
  operatorName: string
  assignedAt: Date
}

