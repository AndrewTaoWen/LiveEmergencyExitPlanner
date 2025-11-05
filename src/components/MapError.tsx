import { AlertCircle, ExternalLink } from 'lucide-react'
import './MapError.css'

export default function MapError() {
  return (
    <div className="map-error">
      <div className="map-error-content">
        <AlertCircle size={48} className="map-error-icon" />
        <h2>MapBox Token Required</h2>
        <p>
          To use this application, you need a valid MapBox access token.
        </p>
        <div className="map-error-steps">
          <h3>Quick Setup:</h3>
          <ol>
            <li>Get a free token from <a href="https://account.mapbox.com/access-tokens/" target="_blank" rel="noopener noreferrer">MapBox <ExternalLink size={14} /></a></li>
            <li>Create a <code>.env</code> file in the project root</li>
            <li>Add: <code>VITE_MAPBOX_TOKEN=your_token_here</code></li>
            <li>Restart the dev server</li>
          </ol>
        </div>
        <div className="map-error-note">
          <strong>Note:</strong> MapBox offers a free tier with 50,000 map loads per month.
        </div>
      </div>
    </div>
  )
}

