import { RiskEvent, TimelineUpdate, IncidentStatus } from '../types'
import { getWeatherAlerts, getCrimeData, getDisasterDeclarations } from './apiServices'

export function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371e3 // Earth's radius in meters
  const φ1 = (lat1 * Math.PI) / 180
  const φ2 = (lat2 * Math.PI) / 180
  const Δφ = ((lat2 - lat1) * Math.PI) / 180
  const Δλ = ((lon2 - lon1) * Math.PI) / 180

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))

  return R * c
}

export function getCurrentLocation(): Promise<GeolocationPosition> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation is not supported by your browser'))
      return
    }

    navigator.geolocation.getCurrentPosition(resolve, reject, {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 0,
    })
  })
}

/**
 * Generate risk events from real APIs, with fallback to simulated data
 */
export async function generateRiskEventsFromAPIs(userLocation: [number, number]): Promise<RiskEvent[]> {
  const [lng, lat] = userLocation
  const events: RiskEvent[] = []
  
  try {
    // Fetch weather alerts
    const weatherAlerts = await getWeatherAlerts(lat, lng)
    events.push(...weatherAlerts)
    
    // Fetch disaster declarations
    const disasters = await getDisasterDeclarations(lat, lng)
    events.push(...disasters)
    
    // Fetch crime data (works for SF, adapt for other cities)
    const crimes = await getCrimeData(lat, lng)
    
    // Calculate distances for all events
    const eventsWithDistances = events.map(event => ({
      ...event,
      distance: calculateDistance(
        userLocation[1],
        userLocation[0],
        event.location[1],
        event.location[0]
      )
    }))
    
    // Add crimes with distances
    const crimesWithDistances = crimes.map(crime => ({
      ...crime,
      distance: calculateDistance(
        userLocation[1],
        userLocation[0],
        crime.location[1],
        crime.location[0]
      )
    }))
    
    eventsWithDistances.push(...crimesWithDistances)
    
    // Filter to only include events within 2km (2000 meters)
    const MAX_DISTANCE_METERS = 2000
    const filteredEvents = eventsWithDistances.filter(event => 
      (event.distance || Infinity) <= MAX_DISTANCE_METERS
    )
    
    // Sort by distance
    return filteredEvents.sort((a, b) => (a.distance || 0) - (b.distance || 0))
  } catch (error) {
    console.error('Error fetching real-time data:', error)
    // Fallback to simulated data
    return generateRiskEvents(userLocation)
  }
}

/**
 * Generate simulated risk events (fallback when APIs fail)
 */
export function generateRiskEvents(userLocation: [number, number]): RiskEvent[] {
  const events: RiskEvent[] = []
  const types: RiskEvent['type'][] = ['crime', 'emergency', 'weather', 'traffic']
  const severities: RiskEvent['severity'][] = ['low', 'medium', 'high', 'critical']

  // Generate 3-6 random events within 2km radius
  const numEvents = Math.floor(Math.random() * 4) + 3

  for (let i = 0; i < numEvents; i++) {
    const type = types[Math.floor(Math.random() * types.length)]
    const severity = severities[Math.floor(Math.random() * severities.length)]

    // Generate random location within 2km radius
    const distance = Math.random() * 2000 // meters
    const bearing = Math.random() * 360 // degrees
    const offset = generateOffset(userLocation, distance, bearing)

    // Determine initial status based on severity and type
    const initialStatus = getInitialStatus(type, severity)
    
    // Create initial timeline entry
    const initialTimestamp = new Date(Date.now() - Math.random() * 3600000) // Random time within last hour
    const timeline: TimelineUpdate[] = [
      {
        timestamp: initialTimestamp,
        status: initialStatus,
        severity,
        description: getEventDescription(type, severity),
        type: 'update'
      }
    ]

    // Add affected area based on severity
    const affectedArea = getAffectedArea(severity, type)

    const event: RiskEvent = {
      id: `event-${Date.now()}-${i}`,
      type,
      severity,
      status: initialStatus,
      location: offset,
      timestamp: initialTimestamp,
      description: getEventDescription(type, severity),
      distance: calculateDistance(
        userLocation[1],
        userLocation[0],
        offset[1],
        offset[0]
      ),
      timeline,
      affectedArea
    }

    events.push(event)
  }

  return events.sort((a, b) => (a.distance || 0) - (b.distance || 0))
}

function getInitialStatus(_type: RiskEvent['type'], severity: RiskEvent['severity']): IncidentStatus {
  // Higher severity events more likely to be in progress
  if (severity === 'critical') {
    return Math.random() > 0.3 ? 'in_progress' : 'investigating'
  }
  if (severity === 'high') {
    return Math.random() > 0.5 ? 'investigating' : 'reported'
  }
  if (severity === 'medium') {
    return Math.random() > 0.7 ? 'investigating' : 'reported'
  }
  return 'reported'
}

function getAffectedArea(severity: RiskEvent['severity'], type: RiskEvent['type']): number {
  // Base radius in meters
  const baseRadius: Record<RiskEvent['severity'], number> = {
    low: 50,
    medium: 150,
    high: 300,
    critical: 500
  }
  
  // Weather events have larger affected areas
  if (type === 'weather') {
    return baseRadius[severity] * 2
  }
  
  return baseRadius[severity]
}

function generateOffset(
  center: [number, number],
  distance: number,
  bearing: number
): [number, number] {
  const R = 6371e3 // Earth's radius in meters
  const lat1 = (center[1] * Math.PI) / 180
  const lon1 = (center[0] * Math.PI) / 180
  const brng = (bearing * Math.PI) / 180
  const d = distance

  const lat2 = Math.asin(
    Math.sin(lat1) * Math.cos(d / R) +
      Math.cos(lat1) * Math.sin(d / R) * Math.cos(brng)
  )
  const lon2 =
    lon1 +
    Math.atan2(
      Math.sin(brng) * Math.sin(d / R) * Math.cos(lat1),
      Math.cos(d / R) - Math.sin(lat1) * Math.sin(lat2)
    )

  return [(lon2 * 180) / Math.PI, (lat2 * 180) / Math.PI]
}

function getEventDescription(type: RiskEvent['type'], severity: RiskEvent['severity']): string {
  const descriptions: Record<RiskEvent['type'], Record<RiskEvent['severity'], string>> = {
    crime: {
      low: 'Minor disturbance reported in area',
      medium: 'Police activity reported nearby',
      high: 'Active police investigation in progress',
      critical: 'Major incident - avoid area',
    },
    emergency: {
      low: 'Medical response in area',
      medium: 'Emergency services responding',
      high: 'Active emergency situation',
      critical: 'Critical emergency - evacuate if possible',
    },
    weather: {
      low: 'Weather advisory in effect',
      medium: 'Weather warning issued',
      high: 'Severe weather conditions',
      critical: 'Extreme weather - seek shelter',
    },
    traffic: {
      low: 'Minor traffic delays',
      medium: 'Traffic congestion reported',
      high: 'Major traffic incident',
      critical: 'Road closure - use alternate route',
    },
  }

  return descriptions[type][severity]
}

export function simulateEventUpdate(event: RiskEvent): RiskEvent {
  const now = new Date()
  const timeSinceLastUpdate = now.getTime() - event.timeline[event.timeline.length - 1].timestamp.getTime()
  const minutesSinceLastUpdate = timeSinceLastUpdate / 60000

  // Only update if at least 30 seconds have passed since last update
  if (minutesSinceLastUpdate < 0.5) {
    return event
  }

  const updatedEvent = { ...event }
  const lastUpdate = event.timeline[event.timeline.length - 1]
  const newUpdate: TimelineUpdate = {
    timestamp: now,
    status: lastUpdate.status,
    severity: lastUpdate.severity,
    description: lastUpdate.description,
    type: 'update'
  }

  // Status progression logic
  const statusProgression: Record<IncidentStatus, IncidentStatus[]> = {
    'reported': ['investigating', 'reported'],
    'investigating': ['in_progress', 'investigating', 'monitoring'],
    'in_progress': ['investigating', 'monitoring', 'in_progress'],
    'monitoring': ['resolved', 'monitoring'],
    'resolved': ['resolved']
  }

  // Chance to progress status
  if (Math.random() > 0.7) {
    const possibleStatuses = statusProgression[event.status]
    if (possibleStatuses && possibleStatuses.length > 0) {
      newUpdate.status = possibleStatuses[Math.floor(Math.random() * possibleStatuses.length)]
      if (newUpdate.status !== lastUpdate.status) {
        newUpdate.type = 'status_change'
        newUpdate.description = getStatusChangeDescription(event.type, newUpdate.status)
      }
    }
  }

  // Severity escalation/de-escalation (less frequent)
  if (Math.random() > 0.85) {
    const severityOrder: RiskEvent['severity'][] = ['low', 'medium', 'high', 'critical']
    const currentIndex = severityOrder.indexOf(event.severity)
    
    if (currentIndex > 0 && Math.random() > 0.5) {
      // De-escalate
      newUpdate.severity = severityOrder[currentIndex - 1]
      newUpdate.type = 'severity_change'
      newUpdate.description = `Severity reduced to ${newUpdate.severity}`
    } else if (currentIndex < severityOrder.length - 1 && event.status === 'in_progress') {
      // Escalate (only if in progress)
      newUpdate.severity = severityOrder[currentIndex + 1]
      newUpdate.type = 'escalation'
      newUpdate.description = `Incident escalated to ${newUpdate.severity} severity`
    }
  }

  // Update event with new timeline entry
  updatedEvent.timeline = [...event.timeline, newUpdate]
  updatedEvent.status = newUpdate.status
  updatedEvent.severity = newUpdate.severity
  updatedEvent.description = newUpdate.description

  return updatedEvent
}

function getStatusChangeDescription(_type: RiskEvent['type'], status: IncidentStatus): string {
  const descriptions: Record<IncidentStatus, string> = {
    'reported': 'Incident reported',
    'investigating': 'Authorities are investigating',
    'in_progress': 'Active response in progress',
    'monitoring': 'Situation being monitored',
    'resolved': 'Incident resolved'
  }

  return descriptions[status] || 'Status updated'
}

