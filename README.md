# Live Emergency Exit Planner

A real-time location tracking and risk assessment application built for Firefly's take-home assignment. This application demonstrates live location indicators on a map with both user and operator perspectives, along with real-time risk assessment capabilities.

## Features

### Main Task ✅
- **Live Location Indicator**: Real-time GPS tracking with visual indicators
- **User View**: Personal perspective showing your current location with nearby context
- **Operator View**: Dashboard view for monitoring multiple users (ready for expansion)

### Extension Task ✅
- **Real-Time Risk Assessment**: Simulated integration of external data sources
  - Crime reports and incidents
  - Emergency service calls (911)
  - Weather alerts
  - Traffic incidents
- Risk events are displayed with severity levels (low, medium, high, critical)
- Distance-based filtering and tooltips for nearby events

## Tech Stack

- **React 18** with TypeScript
- **Vite** for fast development and building
- **react-map-gl** (MapBox) for mapping
- **Deck.GL** for additional map enhancements
- **Lucide React** for icons
- Modern CSS with animations and responsive design

## Getting Started

### Prerequisites

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

3. **Create a `.env` file** in the root directory:
```bash
VITE_MAPBOX_TOKEN=your_mapbox_token_here
```

> **⚠️ Important**: You **must** provide a valid MapBox token. Get a free token at [https://account.mapbox.com/access-tokens/](https://account.mapbox.com/access-tokens/). MapBox offers a free tier with 50,000 map loads per month.

**Steps to get your token:**
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
│   │   ├── MapView.tsx          # Main map component with MapBox
│   │   ├── LocationMarker.tsx   # User location indicator
│   │   ├── RiskEventMarker.tsx  # Risk event markers
│   │   └── ControlPanel.tsx     # UI controls and info panel
│   ├── utils/
│   │   └── locationUtils.ts     # Location calculations and risk generation
│   ├── types.ts                 # TypeScript type definitions
│   ├── App.tsx                  # Main application component
│   ├── main.tsx                 # Entry point
│   └── index.css                # Global styles
├── public/
├── package.json
└── README.md
```

## Design Decisions

### UI/UX
- **Dark theme** for better visibility in emergency situations
- **Pulsing animations** on location markers for immediate visual feedback
- **Color-coded risk levels** for quick assessment
- **Responsive design** that works on desktop and mobile
- **Smooth animations** for a polished, professional feel

### Architecture
- **Component-based structure** for maintainability
- **TypeScript** for type safety
- **Separation of concerns** between map rendering, location tracking, and risk assessment
- **Simulated data** for risk events (easily replaceable with real API calls)

### Map Features
- **Real-time GPS tracking** with high accuracy
- **Dynamic risk event generation** within 2km radius
- **Distance calculations** for proximity awareness
- **Interactive markers** with hover tooltips

## Extension Implementation

The **Real-Time Risk Assessment** extension simulates:
- External data sources (crime reports, 911 calls, weather, traffic)
- Dynamic event generation based on user location
- Severity-based visualization
- Distance-based filtering (tooltips show for events < 500m away)

To integrate with real APIs, replace the `generateRiskEvents` function in `src/utils/locationUtils.ts` with actual API calls.

## Future Enhancements

- Connect to real emergency data APIs
- Multi-user tracking in operator view
- Route planning with safety considerations
- Emergency alert system
- Historical incident data
- Customizable risk thresholds

## Browser Support

- Chrome/Edge (recommended)
- Firefox
- Safari
- Mobile browsers (iOS Safari, Chrome Mobile)

**Note**: Location tracking requires HTTPS in production (or localhost for development).

## License

This project was created as a take-home assignment for Firefly.

## Credits

- Inspired by Citizen's real-time safety mapping approach
- Built with MapBox for mapping infrastructure
- Icons from Lucide React

