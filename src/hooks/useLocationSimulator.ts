import { useState, useEffect, useRef } from 'react'
import { getRoute, generateRandomDestination, RoutePoint } from '../utils/routingUtils'
import { calculateDistance } from '../utils/locationUtils'

export type TransportMode = 'walking' | 'driving'

interface UseLocationSimulatorOptions {
  initialLat: number
  initialLng: number
  speed?: number // meters per second
  interval?: number // update interval in milliseconds
  mode?: TransportMode
  targetDirection?: [number, number] | null // [lng, lat] - user's dragged target location
}

export function useLocationSimulator({
  initialLat,
  initialLng,
  speed = 1.0, // 1 meter per second (walking speed)
  interval = 1000, // 1 second
  mode = 'walking',
  targetDirection = null // User's dragged target
}: UseLocationSimulatorOptions) {
  const [location, setLocation] = useState<[number, number]>([initialLng, initialLat])
  const routeRef = useRef<RoutePoint[]>([])
  const routeIndexRef = useRef<number>(0)
  const destinationRef = useRef<[number, number] | null>(null)
  const userTargetRef = useRef<[number, number] | null>(targetDirection)

  useEffect(() => {
    // Update user target when it changes
    userTargetRef.current = targetDirection
  }, [targetDirection])

  useEffect(() => {
    // Reset route when mode changes
    routeRef.current = []
    routeIndexRef.current = 0
    destinationRef.current = null
  }, [mode])

  useEffect(() => {
    let updateInterval: NodeJS.Timeout | null = null
    let isFetchingRoute = false

    const fetchNewRoute = async (currentLocation: [number, number], targetDestination?: [number, number]) => {
      if (isFetchingRoute) return
      
      isFetchingRoute = true
      try {
        // Use provided destination or generate a random one
        const destination = targetDestination || generateRandomDestination(currentLocation, 400 + Math.random() * 400)
        destinationRef.current = destination
        
        // Get route using Mapbox Directions API
        const route = await getRoute(currentLocation, destination, mode)
        
        if (route.length > 0) {
          routeRef.current = route
          routeIndexRef.current = 0
        }
      } catch (error) {
        console.error('Error fetching route:', error)
        // Fallback to simple movement if routing fails
        destinationRef.current = generateRandomDestination(currentLocation, 500)
      } finally {
        isFetchingRoute = false
      }
    }

    const updateLocation = () => {
      setLocation(prev => {
        const [prevLng, prevLat] = prev

        // If user has dragged to set a target direction, prioritize that
        if (userTargetRef.current) {
          const target = userTargetRef.current
          const distanceToTarget = calculateDistance(
            prevLat,
            prevLng,
            target[1],
            target[0]
          )

          // If we're very close to the target, clear it and continue with normal routing
          if (distanceToTarget < 10) {
            userTargetRef.current = null
            // Continue with normal routing logic below
          } else {
            // Get route to user's target if we have a route, otherwise move directly
            if (routeRef.current.length === 0 || routeIndexRef.current >= routeRef.current.length) {
              // Fetch route to user target
              fetchNewRoute(prev, target).catch(console.error)
              
              // Move directly towards target while route is being fetched
              const lat1Rad = (prevLat * Math.PI) / 180
              const lat2Rad = (target[1] * Math.PI) / 180
              const deltaLng = ((target[0] - prevLng) * Math.PI) / 180

              const y = Math.sin(deltaLng) * Math.cos(lat2Rad)
              const x =
                Math.cos(lat1Rad) * Math.sin(lat2Rad) -
                Math.sin(lat1Rad) * Math.cos(lat2Rad) * Math.cos(deltaLng)
              const bearing = Math.atan2(y, x)

              const distanceInDegrees = speed * 0.000009
              const bearingRad = bearing

              const newLat = prevLat + (distanceInDegrees * Math.cos(bearingRad))
              const newLng = prevLng + (distanceInDegrees * Math.sin(bearingRad) / Math.cos(lat1Rad))

              return [newLng, newLat]
            }
            // If we have a route, continue with route following (will eventually reach user target)
          }
        }

        // If we have a route, follow it
        if (routeRef.current.length > 0 && routeIndexRef.current < routeRef.current.length) {
          const currentPoint = routeRef.current[routeIndexRef.current]
          const distanceToPoint = calculateDistance(
            prevLat,
            prevLng,
            currentPoint.lat,
            currentPoint.lng
          )

          // If we're close to the current waypoint, move to next
          if (distanceToPoint < 5) {
            routeIndexRef.current += 1
          }

          // If we've reached the end of the route, get a new one
          if (routeIndexRef.current >= routeRef.current.length) {
            // Use user target if available, otherwise generate random destination
            const nextDestination = userTargetRef.current || undefined
            fetchNewRoute(prev, nextDestination).catch(console.error)
            return prev
          }

          // Move towards the current waypoint
          const targetPoint = routeRef.current[routeIndexRef.current]

          // Calculate bearing to target
          const lat1Rad = (prevLat * Math.PI) / 180
          const lat2Rad = (targetPoint.lat * Math.PI) / 180
          const deltaLng = ((targetPoint.lng - prevLng) * Math.PI) / 180

          const y = Math.sin(deltaLng) * Math.cos(lat2Rad)
          const x =
            Math.cos(lat1Rad) * Math.sin(lat2Rad) -
            Math.sin(lat1Rad) * Math.cos(lat2Rad) * Math.cos(deltaLng)
          const bearing = Math.atan2(y, x)

          // Move towards target at the specified speed
          const distanceInDegrees = speed * 0.000009
          const bearingRad = bearing

          const newLat = prevLat + (distanceInDegrees * Math.cos(bearingRad))
          const newLng = prevLng + (distanceInDegrees * Math.sin(bearingRad) / Math.cos(lat1Rad))

          return [newLng, newLat]
        } else {
          // No route yet, fetch one or use fallback movement
          if (!destinationRef.current) {
            // Use user target if available, otherwise generate random destination
            const nextDestination = userTargetRef.current || undefined
            fetchNewRoute(prev, nextDestination).catch(console.error)
            return prev
          }

          // Fallback: move towards destination
          const destination = destinationRef.current
          const distanceToDestination = calculateDistance(
            prevLat,
            prevLng,
            destination[1],
            destination[0]
          )

          if (distanceToDestination < 10) {
            // Reached destination, get new one
            // Use user target if available, otherwise generate random destination
            const nextDestination = userTargetRef.current || undefined
            fetchNewRoute(prev, nextDestination).catch(console.error)
            return prev
          }

          // Move towards destination
          const lat1Rad = (prevLat * Math.PI) / 180
          const lat2Rad = (destination[1] * Math.PI) / 180
          const deltaLng = ((destination[0] - prevLng) * Math.PI) / 180

          const y = Math.sin(deltaLng) * Math.cos(lat2Rad)
          const x =
            Math.cos(lat1Rad) * Math.sin(lat2Rad) -
            Math.sin(lat1Rad) * Math.cos(lat2Rad) * Math.cos(deltaLng)
          const bearing = Math.atan2(y, x)

          const distanceInDegrees = speed * 0.000009
          const bearingRad = bearing

          const newLat = prevLat + (distanceInDegrees * Math.cos(bearingRad))
          const newLng = prevLng + (distanceInDegrees * Math.sin(bearingRad) / Math.cos(lat1Rad))

          return [newLng, newLat]
        }
      })
    }

    // Initial route fetch
    const initialDestination = userTargetRef.current || undefined
    fetchNewRoute([initialLng, initialLat], initialDestination).catch(console.error)

    // Start update interval
    updateInterval = setInterval(() => {
      updateLocation()
    }, interval)

    return () => {
      if (updateInterval) {
        clearInterval(updateInterval)
      }
    }
  }, [speed, interval, mode, initialLat, initialLng, targetDirection])

  return location
}

