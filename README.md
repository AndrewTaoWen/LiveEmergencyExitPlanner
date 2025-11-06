# Live Emergency Exit Planner

A real-time location tracking and risk assessment application I built for Firefly's take-home assignment. The app shows live location indicators on a map with both user and operator perspectives, plus real-time risk assessment capabilities.

## What I Built

### Main Task
I started by implementing the core requirements:
- **Live Location Indicator**: Real-time GPS tracking that shows where you are on the map with visual indicators
- **User View**: Your personal perspective showing your current location with nearby context and incidents
- **Operator View**: A dashboard view for monitoring multiple users and managing incidents

### Extension Task
For the extension, I added real-time risk assessment that integrates with external data sources:
- Crime reports and incidents
- Emergency service calls (911)
- Weather alerts
- Traffic incidents

All risk events are displayed with severity levels (low, medium, high, critical), and I added distance-based filtering so tooltips show for nearby events.

## How I Approached This

### Step 1: Setting Up the Foundation
I started by setting up a React 18 + TypeScript project with Vite for fast development. I chose MapBox (react-map-gl) for the mapping infrastructure since it's reliable and well-documented. I also added Lucide React for icons to keep things consistent.

### Step 2: Building the Core Map View
First, I built the basic map component that could display the user's location. I used the browser's Geolocation API to get real-time GPS coordinates, with a fallback to San Francisco if location access is denied. I added a pulsing animation to the location marker so it's immediately visible.

### Step 3: Implementing User View
For the user perspective, I created a view that focuses on the user's immediate surroundings. The user can see:
- Their current location with a pulsing indicator
- Nearby incidents within 2km radius
- Distance to each incident
- Detailed incident information when clicking on markers
- A transport mode selector (walking, driving, etc.) that affects movement simulation

I added an EventsPanel that shows nearby incidents in a list, and an IncidentDetailPanel that pops up when you click on an incident marker.

### Step 4: Creating the Risk Event System
I built a system to generate and display risk events. I started with simulated data, but structured it so it could easily integrate with real APIs later. The system:
- Generates events within a 2km radius of the user
- Assigns severity levels (low, medium, high, critical)
- Calculates distances in real-time as the user moves
- Updates event statuses and timelines dynamically

I created different event types (crime, emergency, weather, traffic) with appropriate descriptions and affected areas based on severity.

### Step 5: Building the Operator View
The operator view was a bigger challenge. I wanted it to be distinctly different from the user view, so I built a comprehensive dashboard with:

**Statistics Dashboard**: Real-time metrics showing critical incidents, active incidents, total incidents, and active users. I made these update dynamically as incidents change.

**Advanced Filtering**: I added a search and filter system so operators can quickly find incidents by type, severity, or status. The filters are collapsible and show active filter counts.

**Activity Feed**: A real-time log of all incident-related activities. This shows when incidents are created, when statuses change, when notes are added, etc. It's color-coded by activity type and shows timestamps.

**Incident Management Panel**: When an operator clicks on an incident, a management panel appears at the top of the sidebar. Operators can:
- Change incident status (reported, investigating, in_progress, resolved, monitoring)
- Adjust severity levels
- Add notes and comments
- Use quick action buttons for common tasks

**Multi-User Tracking**: I simulated multiple tracked users on the map, each with a status (safe, at_risk, unknown). These users appear as markers on the map in operator view, allowing operators to see where everyone is.

**Active Incidents List**: I positioned this at the bottom left of the screen (over the map) so it's always accessible. It shows all active incidents sorted by severity, and clicking an incident opens the management panel.

### Step 6: Integrating Real API Data
I integrated with several external APIs:
- National Weather Service for weather alerts
- FEMA for disaster declarations
- San Francisco open data portal for crime data

I structured the code so it tries to fetch real data first, then falls back to simulated data if the APIs fail. All events are filtered to only show incidents within 2km of the user's location.

### Step 7: Adding Polish and UX Details
I focused on making the interface feel polished:
- Dark theme that's easy on the eyes in emergency situations
- Smooth animations and transitions
- Color-coded severity levels for quick visual assessment
- Responsive design that works on different screen sizes
- Clear visual feedback when hovering or selecting items

### Step 8: Handling Edge Cases
I made sure to handle various scenarios:
- Location access denied (falls back to simulator)
- No internet connection (uses simulated data)
- Events moving beyond 2km radius (automatically filtered out)
- User moving around (distances recalculate in real-time)

## Tech Stack

- **React 18** with TypeScript for type safety
- **Vite** for fast development and building
- **react-map-gl** (MapBox) for mapping
- **Lucide React** for icons
- Modern CSS with animations and responsive design

## Getting Started

### Prerequisites

You'll need:
- Node.js 18+ and npm/yarn
- MapBox API token (free tier available at [mapbox.com](https://www.mapbox.com))

### Installation

1. Clone the repository:
```bash
cd LiveEmergencyExitPlanner
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the root directory:
```bash
VITE_MAPBOX_TOKEN=your_mapbox_token_here
```

Important: You need to provide a valid MapBox token. Get a free token at [https://account.mapbox.com/access-tokens/](https://account.mapbox.com/access-tokens/). MapBox offers a free tier with 50,000 map loads per month.

Steps to get your token:
1. Sign up/login at [mapbox.com](https://account.mapbox.com)
2. Go to [Access Tokens](https://account.mapbox.com/access-tokens/)
3. Copy your default public token (starts with `pk.`)
4. Create a `.env` file in the project root and add: `VITE_MAPBOX_TOKEN=your_token_here`
5. Restart the dev server

4. Start the development server:
```bash
npm run dev
```

5. Open your browser to `http://localhost:3000`

The app will request location permissions. If denied, it will use San Francisco as a fallback location.

## Project Structure

```
LiveEmergencyExitPlanner/
├── src/
│   ├── components/
│   │   ├── MapView.tsx              # Main map component with MapBox
│   │   ├── LocationMarker.tsx       # User location indicator
│   │   ├── RiskEventMarker.tsx      # Risk event markers
│   │   ├── OperatorView.tsx         # Operator dashboard sidebar
│   │   ├── OperatorIncidentList.tsx # Active incidents panel (bottom left)
│   │   ├── OperatorIncidentFilter.tsx # Search and filter component
│   │   ├── ActivityFeed.tsx         # Real-time activity log
│   │   ├── IncidentManagementPanel.tsx # Incident management controls
│   │   ├── TrackedUserMarker.tsx    # Multi-user location markers
│   │   ├── ControlPanel.tsx         # UI controls and info panel
│   │   └── ...                      # Other UI components
│   ├── hooks/
│   │   └── useLocationSimulator.ts  # Location simulation for testing
│   ├── utils/
│   │   ├── locationUtils.ts         # Location calculations and risk generation
│   │   └── apiServices.ts           # External API integrations
│   ├── types.ts                     # TypeScript type definitions
│   ├── App.tsx                      # Main application component
│   ├── main.tsx                     # Entry point
│   └── index.css                    # Global styles
├── public/
├── package.json
└── README.md
```

## Design Decisions

### UI/UX
I chose a dark theme because it's easier on the eyes, especially in emergency situations. I added pulsing animations on location markers so they're immediately noticeable. Everything is color-coded by risk level (red for critical, orange for high, yellow for medium, blue for low) so operators can assess situations at a glance. The design is responsive and works on both desktop and mobile devices.

### Architecture
I kept things organized with a component-based structure. Each major feature is its own component, making it easy to maintain and extend. I used TypeScript throughout for type safety, which caught a lot of bugs early. I separated concerns - map rendering, location tracking, and risk assessment are all in different modules so they don't interfere with each other.

### Map Features
The map shows real-time GPS tracking with high accuracy. I generate risk events dynamically within a 2km radius, and distances recalculate as the user moves. All markers are interactive with hover tooltips showing incident details.

## Current Features

### User View
- Real-time location tracking with pulsing indicator
- Nearby incidents displayed on map and in side panel
- Incident detail panel with full timeline
- Transport mode selection (walking, driving, etc.)
- Distance-based filtering (only shows incidents within 2km)
- Alert banner when approaching critical incidents

### Operator View
- Statistics dashboard with real-time metrics
- Advanced search and filtering system
- Real-time activity feed logging all changes
- Incident management panel for updating status, severity, and notes
- Multi-user tracking with status indicators
- Active incidents list positioned at bottom left
- Breakdowns by type, severity, and status

## Future Enhancements

There are several directions I'd like to take this:
- Connect to more real emergency data APIs
- Add route planning with safety considerations
- Build an emergency alert system to notify users
- Store and display historical incident data
- Allow operators to customize risk thresholds
- Add heat map visualization for incident density
- Implement user groups and team assignments
- Add analytics and reporting features

## Browser Support

I've tested this on:
- Chrome/Edge (recommended)
- Firefox
- Safari
- Mobile browsers (iOS Safari, Chrome Mobile)

Note: Location tracking requires HTTPS in production (or localhost for development).

## License

This project was created as a take-home assignment for Firefly.

## Credits

- Inspired by Citizen's real-time safety mapping approach
- Built with MapBox for mapping infrastructure
- Icons from Lucide React
