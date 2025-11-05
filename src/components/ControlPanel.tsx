import { ViewMode, RiskEvent } from '../types'
import { User, Monitor, MapPin, Shield, AlertTriangle, BarChart3 } from 'lucide-react'
import SafetyStatus from './SafetyStatus'
import './ControlPanel.css'

interface ControlPanelProps {
  viewMode: ViewMode
  onViewModeChange: (mode: ViewMode) => void
  userLocation: [number, number] | null
  events?: RiskEvent[]
  fixedIncident?: RiskEvent | null
}

export default function ControlPanel({ viewMode, onViewModeChange, userLocation, events = [], fixedIncident = null }: ControlPanelProps) {
  const activeIncidents = events.filter(e => e.status !== 'resolved').length
  const criticalIncidents = events.filter(e => e.severity === 'critical').length
  return (
    <div className="control-panel">
      <div className="control-panel-header">
        <h1>Live Emergency Exit Planner</h1>
        <div className="view-mode-toggle">
          <button
            className={`view-mode-btn ${viewMode === 'user' ? 'active' : ''}`}
            onClick={() => onViewModeChange('user')}
          >
            <User size={18} />
            <span>User View</span>
          </button>
          <button
            className={`view-mode-btn ${viewMode === 'operator' ? 'active' : ''}`}
            onClick={() => onViewModeChange('operator')}
          >
            <Monitor size={18} />
            <span>Operator View</span>
          </button>
        </div>
      </div>

      <div className="control-panel-content">
        {viewMode === 'user' ? (
          <>
            {userLocation && (
              <div className="status-card">
                <div className="status-header">
                  <MapPin size={20} />
                  <span>Current Location</span>
                </div>
                <div className="status-details">
                  <div className="status-item">
                    <span className="status-label">Latitude:</span>
                    <span className="status-value">{userLocation[1].toFixed(6)}</span>
                  </div>
                  <div className="status-item">
                    <span className="status-label">Longitude:</span>
                    <span className="status-value">{userLocation[0].toFixed(6)}</span>
                  </div>
                </div>
              </div>
            )}

            <div className="feature-card">
              <div className="feature-header">
                <Shield size={20} />
                <span>Real-Time Risk Assessment</span>
              </div>
              <div className="feature-description">
                <p>Live monitoring of nearby incidents, emergencies, and hazards.</p>
                <div className="risk-legend">
                  <div className="legend-item">
                    <div className="legend-color critical"></div>
                    <span>Critical</span>
                  </div>
                  <div className="legend-item">
                    <div className="legend-color high"></div>
                    <span>High</span>
                  </div>
                  <div className="legend-item">
                    <div className="legend-color medium"></div>
                    <span>Medium</span>
                  </div>
                  <div className="legend-item">
                    <div className="legend-color low"></div>
                    <span>Low</span>
                  </div>
                </div>
              </div>
            </div>

            {userLocation && (
              <div className="safety-status-wrapper">
                <SafetyStatus
                  userLocation={userLocation}
                  fixedIncident={fixedIncident || null}
                  riskEvents={events}
                />
              </div>
            )}

          </>
        ) : (
          <>
            <div className="status-card">
              <div className="status-header">
                <BarChart3 size={20} />
                <span>Dashboard Overview</span>
              </div>
              <div className="status-details">
                <div className="status-item">
                  <span className="status-label">Active Incidents:</span>
                  <span className="status-value">{activeIncidents}</span>
                </div>
                <div className="status-item">
                  <span className="status-label">Critical:</span>
                  <span className="status-value critical-value">{criticalIncidents}</span>
                </div>
                <div className="status-item">
                  <span className="status-label">Total Tracked:</span>
                  <span className="status-value">{events.length}</span>
                </div>
              </div>
            </div>

            <div className="feature-card">
              <div className="feature-header">
                <Monitor size={20} />
                <span>Operator Dashboard</span>
              </div>
              <div className="feature-description">
                <p>Monitor all active incidents, view statistics, and manage emergency responses from the operator panel on the right.</p>
              </div>
            </div>

            <div className="info-card">
              <AlertTriangle size={20} />
              <div>
                <strong>Operator View</strong>
                <p>View aggregated statistics, incident lists, and manage multiple incidents simultaneously.</p>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

