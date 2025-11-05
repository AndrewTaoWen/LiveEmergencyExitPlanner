import { RiskEvent } from '../types'

const OPEN_METEO_URL = 'https://api.open-meteo.com/v1'
const NWS_ALERTS_URL = 'https://api.weather.gov/alerts/active'
const FEMA_DISASTERS_URL = 'https://www.fema.gov/api/open/v2/DisasterDeclarationsSummaries'

export interface WeatherData {
  current: {
    temperature: number
    weathercode: number
    time: string
  }
  hourly?: {
    time: string[]
    weathercode: number[]
    temperature_2m: number[]
  }
}

/**
 * Get current weather data from Open-Meteo (no API key required)
 */
export async function getCurrentWeather(lat: number, lng: number): Promise<WeatherData | null> {
  try {
    const response = await fetch(
      `${OPEN_METEO_URL}/forecast?latitude=${lat}&longitude=${lng}&current_weather=true&hourly=weathercode,temperature_2m&timezone=auto`
    )
    
    if (!response.ok) {
      throw new Error(`Weather API error: ${response.status}`)
    }
    
    const data = await response.json()
    return data
  } catch (error) {
    console.error('Error fetching weather:', error)
    return null
  }
}

/**
 * Get weather alerts from NWS (US only, no API key required)
 */
export async function getWeatherAlerts(lat: number, lng: number): Promise<RiskEvent[]> {
  try {
    const response = await fetch(`${NWS_ALERTS_URL}?point=${lat},${lng}`)
    
    if (!response.ok) {
      // NWS API might not work outside US, return empty array
      return []
    }
    
    const data = await response.json()
    const alerts: RiskEvent[] = []
    
    if (data.features && Array.isArray(data.features)) {
      data.features.forEach((feature: any, index: number) => {
        const properties = feature.properties
        const severity = getSeverityFromNWS(properties.severity)
        
        // Extract coordinates from geometry if available
        let alertLocation: [number, number] = [lng, lat]
        if (feature.geometry && feature.geometry.coordinates) {
          const coords = feature.geometry.coordinates[0]?.[0] || feature.geometry.coordinates[0]
          if (coords && coords.length >= 2) {
            alertLocation = [coords[0], coords[1]]
          }
        }
        
        alerts.push({
          id: `weather-alert-${feature.id || index}`,
          type: 'weather',
          severity,
          status: 'in_progress',
          location: alertLocation,
          timestamp: new Date(properties.sent || properties.effective || Date.now()),
          description: `${properties.headline || 'Weather Alert'}: ${properties.description?.substring(0, 200) || properties.event || 'Weather warning'}`,
          affectedArea: 5000, // Default 5km radius for weather alerts
          timeline: [
            {
              timestamp: new Date(properties.effective || Date.now()),
              status: 'in_progress',
              severity,
              description: properties.headline || 'Weather alert issued',
              type: 'update'
            }
          ]
        })
      })
    }
    
    return alerts
  } catch (error) {
    console.error('Error fetching weather alerts:', error)
    return []
  }
}

/**
 * Get disaster declarations from FEMA (no API key required)
 */
export async function getDisasterDeclarations(lat: number, lng: number, radiusKm: number = 50): Promise<RiskEvent[]> {
  try {
    // FEMA API requires state/county lookup, this is a simplified version
    // For production, you'd want to geocode the lat/lng to get state/county first
    const response = await fetch(`${FEMA_DISASTERS_URL}?$limit=100&$order=declarationDate DESC`)
    
    if (!response.ok) {
      return []
    }
    
    const data = await response.json()
    const disasters: RiskEvent[] = []
    
    if (data.DisasterDeclarationsSummaries && Array.isArray(data.DisasterDeclarationsSummaries)) {
      // Filter by date (last 30 days) and convert to alerts
      const thirtyDaysAgo = new Date()
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
      
      data.DisasterDeclarationsSummaries
        .filter((disaster: any) => {
          const disasterDate = new Date(disaster.declarationDate)
          return disasterDate > thirtyDaysAgo
        })
        .slice(0, 10) // Limit to 10 most recent
        .forEach((disaster: any, index: number) => {
          disasters.push({
            id: `disaster-${disaster.id || index}`,
            type: 'emergency',
            severity: 'high',
            status: 'in_progress',
            location: [lng, lat], // Approximate - would need geocoding for exact location
            timestamp: new Date(disaster.declarationDate),
            description: `${disaster.incidentType || 'Disaster'}: ${disaster.declarationTitle || 'Emergency declaration'}`,
            affectedArea: radiusKm * 1000, // Convert km to meters
            timeline: [
              {
                timestamp: new Date(disaster.declarationDate),
                status: 'in_progress',
                severity: 'high',
                description: disaster.declarationTitle || 'Disaster declaration',
                type: 'update'
              }
            ]
          })
        })
    }
    
    return disasters
  } catch (error) {
    console.error('Error fetching disaster data:', error)
    return []
  }
}

/**
 * Get crime data from city open data portals (SF example)
 * Note: This is city-specific. You'll need to adapt for different cities.
 */
export async function getCrimeData(lat: number, lng: number, radiusMeters: number = 1000): Promise<RiskEvent[]> {
  try {
    // San Francisco open data portal example
    // Other cities have similar endpoints - you'd need to lookup their specific APIs
    const response = await fetch(
      `https://data.sfgov.org/resource/cuks-n6tp.json?$where=within_circle(location,${lat},${lng},${radiusMeters})&$limit=20&$order=date DESC`
    )
    
    if (!response.ok) {
      // Not all cities have this API, return empty if it fails
      return []
    }
    
    const data = await response.json()
    const crimes: RiskEvent[] = []
    
    if (Array.isArray(data)) {
      data.forEach((incident: any, index: number) => {
        const severity = getSeverityFromCrimeType(incident.category || incident.incident_type || '')
        
        // Extract location from incident data
        let crimeLocation: [number, number] = [lng, lat]
        if (incident.location && incident.location.coordinates) {
          crimeLocation = [
            incident.location.coordinates[0],
            incident.location.coordinates[1]
          ]
        } else if (incident.longitude && incident.latitude) {
          crimeLocation = [
            parseFloat(incident.longitude),
            parseFloat(incident.latitude)
          ]
        }
        
        crimes.push({
          id: `crime-${incident.incident_number || index}`,
          type: 'crime',
          severity,
          status: 'reported',
          location: crimeLocation,
          timestamp: new Date(incident.date || Date.now()),
          description: `${incident.category || 'Crime'}: ${incident.descript || incident.description || 'Incident reported'}`,
          distance: undefined, // Will be calculated by caller
          affectedArea: 100,
          timeline: [
            {
              timestamp: new Date(incident.date || Date.now()),
              status: 'reported',
              severity,
              description: incident.descript || 'Crime reported',
              type: 'update'
            }
          ]
        })
      })
    }
    
    return crimes
  } catch (error) {
    console.error('Error fetching crime data:', error)
    return []
  }
}

/**
 * Convert NWS severity to our severity scale
 */
function getSeverityFromNWS(nwsSeverity: string): 'low' | 'medium' | 'high' | 'critical' {
  const severity = (nwsSeverity || '').toLowerCase()
  if (severity.includes('extreme') || severity.includes('severe')) {
    return 'critical'
  }
  if (severity.includes('moderate')) {
    return 'high'
  }
  if (severity.includes('minor')) {
    return 'medium'
  }
  return 'low'
}

/**
 * Convert crime type to severity
 */
function getSeverityFromCrimeType(crimeType: string): 'low' | 'medium' | 'high' | 'critical' {
  const type = (crimeType || '').toLowerCase()
  
  if (type.includes('assault') || type.includes('robbery') || type.includes('homicide') || type.includes('shooting')) {
    return 'critical'
  }
  if (type.includes('burglary') || type.includes('theft') || type.includes('vandalism')) {
    return 'high'
  }
  if (type.includes('trespass') || type.includes('disorderly')) {
    return 'medium'
  }
  return 'low'
}

