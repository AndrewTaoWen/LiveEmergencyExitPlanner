export interface RoutePoint {
  lng: number
  lat: number
}

export async function getRoute(
  start: [number, number],
  end: [number, number],
  profile: 'driving' | 'walking'
): Promise<RoutePoint[]> {
  const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN
  
  if (!MAPBOX_TOKEN) {
    console.warn('Mapbox token not configured, using fallback routing')
    // Fallback: return a straight line route
    return [
      { lng: start[0], lat: start[1] },
      { lng: end[0], lat: end[1] }
    ]
  }

  const url = `https://api.mapbox.com/directions/v5/mapbox/${profile}/${start[0]},${start[1]};${end[0]},${end[1]}?geometries=geojson&access_token=${MAPBOX_TOKEN}`

  try {
    const response = await fetch(url)
    if (!response.ok) {
      throw new Error(`Routing API error: ${response.status}`)
    }

    const data = await response.json()
    
    if (data.code !== 'Ok' || !data.routes || data.routes.length === 0) {
      throw new Error('No route found')
    }

    // Extract coordinates from the route geometry
    const coordinates = data.routes[0].geometry.coordinates as [number, number][]
    return coordinates.map(([lng, lat]) => ({ lng, lat }))
  } catch (error) {
    console.error('Error fetching route:', error)
    // Fallback: return a straight line route
    return [
      { lng: start[0], lat: start[1] },
      { lng: end[0], lat: end[1] }
    ]
  }
}

export function generateRandomDestination(
  start: [number, number],
  radius: number = 500 // meters
): [number, number] {
  // Generate a random destination within radius
  const distance = Math.random() * radius
  const bearing = Math.random() * 360
  
  // Convert to degrees
  const R = 6371e3 // Earth's radius in meters
  const lat1 = (start[1] * Math.PI) / 180
  const lon1 = (start[0] * Math.PI) / 180
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

