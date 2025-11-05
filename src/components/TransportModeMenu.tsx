import { useState } from 'react'
import { User, Car, Settings, X } from 'lucide-react'
import './TransportModeMenu.css'

export type TransportMode = 'walking' | 'driving'

interface TransportModeMenuProps {
  mode: TransportMode
  onModeChange: (mode: TransportMode) => void
}

const TRANSPORT_MODES = {
  walking: {
    label: 'Walking',
    icon: User,
    speed: 1.5, // meters per second (~5.4 km/h)
    description: 'Walking speed'
  },
  driving: {
    label: 'Driving',
    icon: Car,
    speed: 13.9, // meters per second (~50 km/h in city)
    description: 'City driving speed'
  }
}

export default function TransportModeMenu({ mode, onModeChange }: TransportModeMenuProps) {
  const [isOpen, setIsOpen] = useState(false)

  const currentMode = TRANSPORT_MODES[mode]

  return (
    <div className="transport-mode-menu">
      <button
        className="transport-mode-toggle"
        onClick={() => setIsOpen(!isOpen)}
        title="Test menu - Change transport mode"
      >
        <Settings size={18} />
        <span>{currentMode.label}</span>
      </button>

      {isOpen && (
        <>
          <div 
            className="transport-mode-backdrop"
            onClick={() => setIsOpen(false)}
          />
          <div className="transport-mode-panel">
            <div className="transport-mode-header">
              <h3>Transport Mode</h3>
              <button
                className="transport-mode-close"
                onClick={() => setIsOpen(false)}
              >
                <X size={18} />
              </button>
            </div>
            
            <div className="transport-mode-options">
              {Object.entries(TRANSPORT_MODES).map(([key, config]) => {
                const Icon = config.icon
                const isSelected = mode === key
                
                return (
                  <button
                    key={key}
                    className={`transport-mode-option ${isSelected ? 'selected' : ''}`}
                    onClick={() => {
                      onModeChange(key as TransportMode)
                      setIsOpen(false)
                    }}
                  >
                    <div className="transport-mode-icon">
                      <Icon size={24} />
                    </div>
                    <div className="transport-mode-info">
                      <div className="transport-mode-label">{config.label}</div>
                      <div className="transport-mode-details">
                        {config.description} • {(config.speed * 3.6).toFixed(1)} km/h
                      </div>
                    </div>
                    {isSelected && (
                      <div className="transport-mode-check">✓</div>
                    )}
                  </button>
                )
              })}
            </div>

            <div className="transport-mode-footer">
              <p>Test mode: Simulate location movement</p>
            </div>
          </div>
        </>
      )}
    </div>
  )
}

export { TRANSPORT_MODES }

