import { useEffect, useState, useCallback } from 'react'
import mapboxgl from 'mapbox-gl'
import Map, { NavigationControl, FullscreenControl, ViewStateChangeEvent, Marker } from 'react-map-gl'
import { ViewMode, RiskEvent, TrackedUser } from '../types'
import LocationMarker from './LocationMarker'
import RiskEventMarker from './RiskEventMarker'
import FixedIncidentMarker from './FixedIncidentMarker'
import TrackedUserMarker from './TrackedUserMarker'
import MapError from './MapError'
import IncidentDetailPanel from './IncidentDetailPanel'
import OperatorView from './OperatorView'
import OperatorIncidentList from './OperatorIncidentList'
import AlertBanner from './AlertBanner'
import BottomDrawer from './BottomDrawer'
import TransportModeMenu, { TransportMode, TRANSPORT_MODES } from './TransportModeMenu'
import EventsPanel from './EventsPanel'
import { useLocationSimulator } from '../hooks/useLocationSimulator'
import { generateRiskEvents, generateRiskEventsFromAPIs, simulateEventUpdate, calculateDistance, getCurrentLocation } from '../utils/locationUtils'
import 'mapbox-gl/dist/mapbox-gl.css'
import './MapView.css'

// Ensure mapbox-gl is available globally for react-map-gl
if (typeof window !== 'undefined') {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (window as any).mapboxgl = mapboxgl
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const MAPBOX_TOKEN = (import.meta as any).env?.VITE_MAPBOX_TOKEN as string | undefined

interface MapViewProps {
  viewMode: ViewMode
  onLocationUpdate: (location: [number, number] | null) => void
  onEventsUpdate?: (events: RiskEvent[]) => void
  onFixedIncidentUpdate?: (incident: RiskEvent | null) => void
}

export default function MapView({ viewMode, onLocationUpdate, onEventsUpdate, onFixedIncidentUpdate }: MapViewProps) {
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null)
  const [riskEvents, setRiskEvents] = useState<RiskEvent[]>([])
  const [selectedEvent, setSelectedEvent] = useState<RiskEvent | null>(null)
  const [selectedOperatorIncident, setSelectedOperatorIncident] = useState<RiskEvent | null>(null)
  const [fixedIncident, setFixedIncident] = useState<RiskEvent | null>(null)
  const [showAlert, setShowAlert] = useState(false)
  const [selectedFixedIncident, setSelectedFixedIncident] = useState<RiskEvent | null>(null)
  const [transportMode, setTransportMode] = useState<TransportMode>('walking')
  const [dragTarget, setDragTarget] = useState<[number, number] | null>(null)
  const [trackedUsers, setTrackedUsers] = useState<TrackedUser[]>([])
  const [viewState, setViewState] = useState({
    latitude: 37.7749,
    longitude: -122.4194,
    zoom: 12,
    bearing: 0,
    pitch: 0,
  })

  // Simulated location that moves along roads/paths
  const simulatedLocation = useLocationSimulator({
    initialLat: 37.7749,
    initialLng: -122.4194,
    speed: TRANSPORT_MODES[transportMode].speed,
    interval: 1000,
    mode: transportMode,
    targetDirection: dragTarget
  })

  // Request real user location
  useEffect(() => {
    let watchId: number | null = null

    const startLocationTracking = async () => {
      try {
        // Try to get real location first
        const position = await getCurrentLocation()
        const coords: [number, number] = [position.coords.longitude, position.coords.latitude]
        setUserLocation(coords)
        onLocationUpdate(coords)
        setViewState(prev => ({
          ...prev,
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        }))

        // Watch for location updates
        watchId = navigator.geolocation.watchPosition(
          (pos) => {
            const newCoords: [number, number] = [pos.coords.longitude, pos.coords.latitude]
            setUserLocation(newCoords)
            onLocationUpdate(newCoords)
          },
          (err) => {
            console.warn('Geolocation error:', err)
            // Fallback to simulator if location access denied
            setUserLocation(simulatedLocation)
            onLocationUpdate(simulatedLocation)
            if (userLocation === null) {
              setViewState(prev => ({
                ...prev,
                latitude: simulatedLocation[1],
                longitude: simulatedLocation[0],
              }))
            }
          },
          {
            enableHighAccuracy: true,
            maximumAge: 0,
            timeout: 5000,
          }
        )
      } catch (error) {
        console.warn('Error getting location, using simulator:', error)
        // Fallback to simulator
        setUserLocation(simulatedLocation)
        onLocationUpdate(simulatedLocation)
        if (userLocation === null) {
          setViewState(prev => ({
            ...prev,
            latitude: simulatedLocation[1],
            longitude: simulatedLocation[0],
          }))
        }
      }
    }

    startLocationTracking()

    return () => {
      if (watchId !== null) {
        navigator.geolocation.clearWatch(watchId)
      }
    }
  }, [onLocationUpdate, userLocation, simulatedLocation])

  // Create fixed incident at a specific location
  useEffect(() => {
    // Fixed incident at coordinates offset from initial location (about 50m away)
    // This allows the simulator to eventually get within 40m
    const fixedIncidentCoords: [number, number] = [-122.41945, 37.77495] // ~50m offset
    
    const incident: RiskEvent = {
      id: 'fixed-incident-1',
      type: 'emergency',
      severity: 'critical',
      status: 'in_progress',
      location: fixedIncidentCoords,
      timestamp: new Date(Date.now() - 1800000), // 30 minutes ago
      description: 'Active emergency situation - maintain distance',
      affectedArea: 500, // 500 meter radius
      timeline: [
        {
          timestamp: new Date(Date.now() - 1800000),
          status: 'reported',
          severity: 'high',
          description: 'Emergency reported',
          type: 'update'
        },
        {
          timestamp: new Date(Date.now() - 1200000),
          status: 'investigating',
          severity: 'high',
          description: 'Emergency services responding',
          type: 'status_change'
        },
        {
          timestamp: new Date(Date.now() - 600000),
          status: 'in_progress',
          severity: 'critical',
          description: 'Situation escalated - active response',
          type: 'escalation'
        }
      ]
    }
    
    setFixedIncident(incident)
    if (onFixedIncidentUpdate) {
      onFixedIncidentUpdate(incident)
    }
  }, [onFixedIncidentUpdate])

  // Generate tracked users for operator view
  useEffect(() => {
    if (viewMode === 'operator' && userLocation) {
      // Generate simulated tracked users around the area
      const generateTrackedUsers = (): TrackedUser[] => {
        const users: TrackedUser[] = []
        const names = ['Alice', 'Bob', 'Charlie', 'Diana', 'Eve', 'Frank', 'Grace', 'Henry']
        const baseLat = userLocation[1]
        const baseLng = userLocation[0]
        
        for (let i = 0; i < 8; i++) {
          const offsetLat = (Math.random() - 0.5) * 0.02 // ~1km offset
          const offsetLng = (Math.random() - 0.5) * 0.02
          const statuses: ('safe' | 'at_risk' | 'unknown')[] = ['safe', 'safe', 'safe', 'at_risk', 'unknown']
          
          users.push({
            id: `user-${i + 1}`,
            name: names[i] || `User ${i + 1}`,
            location: [baseLng + offsetLng, baseLat + offsetLat],
            status: statuses[Math.floor(Math.random() * statuses.length)],
            lastUpdate: new Date(Date.now() - Math.random() * 300000), // 0-5 min ago
          })
        }
        return users
      }
      
      setTrackedUsers(generateTrackedUsers())
      
      // Update user locations periodically
      const interval = setInterval(() => {
        setTrackedUsers(prev => prev.map(user => ({
          ...user,
          location: [
            user.location[0] + (Math.random() - 0.5) * 0.0001,
            user.location[1] + (Math.random() - 0.5) * 0.0001,
          ] as [number, number],
          lastUpdate: new Date(),
        })))
      }, 10000) // Update every 10 seconds
      
      return () => clearInterval(interval)
    }
  }, [viewMode, userLocation])

  // Generate risk events once when location is first set
  useEffect(() => {
    if (!userLocation) return

    // Only generate events if we don't have any yet
    setRiskEvents(prevEvents => {
      if (prevEvents.length > 0) return prevEvents
      
      // Try to fetch real data from APIs first
      generateRiskEventsFromAPIs(userLocation).then(apiEvents => {
        if (apiEvents.length > 0) {
          setRiskEvents(apiEvents)
          if (onEventsUpdate) {
            onEventsUpdate(apiEvents)
          }
        } else {
          // Fallback to simulated if no real data
          const simulatedEvents = generateRiskEvents(userLocation)
          setRiskEvents(simulatedEvents)
          if (onEventsUpdate) {
            onEventsUpdate(simulatedEvents)
          }
        }
      }).catch(error => {
        console.error('Error fetching real-time events:', error)
        // Fallback to simulated data on error
        const simulatedEvents = generateRiskEvents(userLocation)
        setRiskEvents(simulatedEvents)
        if (onEventsUpdate) {
          onEventsUpdate(simulatedEvents)
        }
      })
      
      // Return empty array while loading
      return []
    })

    // Simulate event updates instead of regenerating all events
    const interval = setInterval(() => {
      setRiskEvents(prevEvents => {
        if (prevEvents.length === 0) return prevEvents
        
        const MAX_DISTANCE_METERS = 2000
        
        const updated = prevEvents
          .map(event => {
            // Update the event's timeline
            const updatedEvent = simulateEventUpdate(event)
            
            // Update distance to user
            if (userLocation) {
              updatedEvent.distance = calculateDistance(
                userLocation[1],
                userLocation[0],
                event.location[1],
                event.location[0]
              )
            }
            
            // If this is the selected event, update it too
            if (selectedEvent && event.id === selectedEvent.id) {
              setSelectedEvent(updatedEvent)
            }
            
            return updatedEvent
          })
          .filter(event => (event.distance || Infinity) <= MAX_DISTANCE_METERS)
        if (onEventsUpdate) {
          onEventsUpdate(updated)
        }
        return updated
      })
    }, 30000) // Update every 30 seconds

    return () => clearInterval(interval)
  }, [userLocation, selectedEvent, onEventsUpdate])

  // Update distances to events as user moves and filter out events beyond 2km
  useEffect(() => {
    if (!userLocation) return

    const MAX_DISTANCE_METERS = 2000

    setRiskEvents(prevEvents => {
      if (prevEvents.length === 0) return prevEvents
      
      const eventsWithDistances = prevEvents.map(event => {
        const distance = calculateDistance(
          userLocation[1],
          userLocation[0],
          event.location[1],
          event.location[0]
        )
        return { ...event, distance }
      })

      // Filter out events beyond 2km
      const filteredEvents = eventsWithDistances.filter(event => 
        (event.distance || Infinity) <= MAX_DISTANCE_METERS
      )

      if (filteredEvents.length !== prevEvents.length && onEventsUpdate) {
        onEventsUpdate(filteredEvents)
      }

      return filteredEvents
    })
  }, [userLocation, onEventsUpdate])

  // Check distance to fixed incident and show alert if < 40m
  useEffect(() => {
    if (!userLocation || !fixedIncident) return

    const distance = calculateDistance(
      userLocation[1],
      userLocation[0],
      fixedIncident.location[1],
      fixedIncident.location[0]
    )

    // Show alert if within 40 meters
    if (distance < 40) {
      setShowAlert(true)
    } else {
      setShowAlert(false)
    }
  }, [userLocation, fixedIncident])

  const handleEventSelect = useCallback((event: RiskEvent) => {
    setSelectedEvent(event)
  }, [])

  const handleClosePanel = useCallback(() => {
    setSelectedEvent(null)
  }, [])

  const handleFixedIncidentSelect = useCallback((event: RiskEvent) => {
    setSelectedFixedIncident(event)
  }, [])

  const handleCloseBottomDrawer = useCallback(() => {
    setSelectedFixedIncident(null)
  }, [])

  const handleIncidentUpdate = useCallback((incidentId: string, updates: Partial<RiskEvent>) => {
    setRiskEvents(prev => {
      const updated = prev.map(event => 
        event.id === incidentId ? { ...event, ...updates } : event
      )
      if (onEventsUpdate) {
        onEventsUpdate(updated)
      }
      return updated
    })
  }, [onEventsUpdate])

  const handleOperatorIncidentSelect = useCallback((incident: RiskEvent | null) => {
    setSelectedOperatorIncident(incident)
  }, [])

  const handleOperatorIncidentClick = useCallback((incident: RiskEvent) => {
    setSelectedOperatorIncident(incident)
    // This will trigger the OperatorView to show the management panel
  }, [])

  const onMove = useCallback((evt: ViewStateChangeEvent) => {
    setViewState(evt.viewState)
  }, [])

  const handleMapClick = useCallback((evt: { lngLat: { lng: number; lat: number } }) => {
    if (viewMode === 'user') {
      // Set target to where user clicked
      const target: [number, number] = [evt.lngLat.lng, evt.lngLat.lat]
      setDragTarget(target)
    }
  }, [viewMode])

  // Show error if no MapBox token
  if (!MAPBOX_TOKEN) {
    return <MapError />
  }

  return (
    <div className="map-container">
      {showAlert && (
        <AlertBanner
          message={`You are within 40 meters of an active emergency. Please maintain distance and follow safety protocols.`}
          onClose={() => setShowAlert(false)}
          severity="critical"
        />
      )}

      {viewMode === 'user' && userLocation && (
        <EventsPanel
          events={riskEvents}
          userLocation={userLocation}
          onEventSelect={handleEventSelect}
          selectedEvent={selectedEvent}
        />
      )}

      <Map
        {...viewState}
        onMove={onMove}
        onClick={handleMapClick}
        style={{ width: '100%', height: '100%' }}
        mapStyle="mapbox://styles/mapbox/dark-v11"
        mapboxAccessToken={MAPBOX_TOKEN}
        cursor="pointer"
      >
        <NavigationControl position="top-right" />
        <FullscreenControl position="top-right" />

        {userLocation && viewMode === 'user' && (
          <LocationMarker 
            longitude={userLocation[0]} 
            latitude={userLocation[1]}
            viewMode={viewMode}
          />
        )}

        {fixedIncident && (() => {
          // Calculate distance for the fixed incident
          const distance = userLocation ? calculateDistance(
            userLocation[1],
            userLocation[0],
            fixedIncident.location[1],
            fixedIncident.location[0]
          ) : undefined
          
          const incidentWithDistance = { ...fixedIncident, distance }
          
          return (
            <FixedIncidentMarker
              event={incidentWithDistance}
              onSelect={handleFixedIncidentSelect}
            />
          )
        })()}

        {riskEvents.map((event) => (
          <RiskEventMarker
            key={event.id}
            event={event}
            userLocation={userLocation}
            onSelect={handleEventSelect}
          />
        ))}

        {viewMode === 'operator' && trackedUsers.map((user) => (
          <Marker
            key={user.id}
            longitude={user.location[0]}
            latitude={user.location[1]}
            anchor="center"
          >
            <TrackedUserMarker user={user} />
          </Marker>
        ))}
      </Map>
      
      {viewMode === 'operator' && (
        <>
          <OperatorView 
            events={riskEvents}
            trackedUsers={trackedUsers}
            selectedIncident={selectedOperatorIncident}
            onIncidentUpdate={handleIncidentUpdate}
            onIncidentSelect={handleOperatorIncidentSelect}
          />
          <OperatorIncidentList
            events={riskEvents}
            selectedIncident={selectedOperatorIncident}
            onIncidentClick={handleOperatorIncidentClick}
          />
        </>
      )}
      
      {viewMode === 'user' && (
        <>
          <IncidentDetailPanel 
            event={selectedEvent}
            onClose={handleClosePanel}
          />
          <BottomDrawer
            event={selectedFixedIncident}
            onClose={handleCloseBottomDrawer}
          />
          <TransportModeMenu
            mode={transportMode}
            onModeChange={setTransportMode}
          />
        </>
      )}
    </div>
  )
}

