import { Shield, AlertTriangle, AlertCircle } from 'lucide-react'
import { RiskEvent } from '../types'
import { calculateDistance } from '../utils/locationUtils'
import './SafetyStatus.css'

interface SafetyStatusProps {
  userLocation: [number, number] | null
  fixedIncident: RiskEvent | null
  riskEvents: RiskEvent[]
}

export type SafetyLevel = 'safe' | 'caution' | 'at_risk' | 'critical'

interface SafetyInfo {
  level: SafetyLevel
  message: string
  icon: typeof Shield
  color: string
  description: string
}

export default function SafetyStatus({ userLocation, fixedIncident, riskEvents }: SafetyStatusProps) {
  if (!userLocation) {
    return null
  }

  // Calculate safety based on proximity to incidents
  const getSafetyInfo = (): SafetyInfo => {
    let nearestDistance = Infinity
    let nearestSeverity: 'low' | 'medium' | 'high' | 'critical' = 'low'

    // Check fixed incident
    if (fixedIncident) {
      const distance = calculateDistance(
        userLocation[1],
        userLocation[0],
        fixedIncident.location[1],
        fixedIncident.location[0]
      )
      if (distance < nearestDistance) {
        nearestDistance = distance
        nearestSeverity = fixedIncident.severity
      }
    }

    // Check other risk events
    riskEvents.forEach(event => {
      if (event.distance !== undefined) {
        const distance = event.distance
        if (distance < nearestDistance) {
          nearestDistance = distance
          nearestSeverity = event.severity
        }
      }
    })

    // Determine safety level based on distance and severity
    if (nearestDistance < 40) {
      return {
        level: 'critical',
        message: 'Critical Risk',
        icon: AlertCircle,
        color: '#ef4444',
        description: `Within ${Math.round(nearestDistance)}m of critical incident`
      }
    } else if (nearestDistance < 100) {
      if (nearestSeverity === 'critical' || nearestSeverity === 'high') {
        return {
          level: 'at_risk',
          message: 'At Risk',
          icon: AlertTriangle,
          color: '#f97316',
          description: `Within ${Math.round(nearestDistance)}m of ${nearestSeverity} risk`
        }
      }
      return {
        level: 'caution',
        message: 'Exercise Caution',
        icon: AlertTriangle,
        color: '#eab308',
        description: `Within ${Math.round(nearestDistance)}m of incident`
      }
    } else if (nearestDistance < 250) {
      if (nearestSeverity === 'critical' || nearestSeverity === 'high') {
        return {
          level: 'caution',
          message: 'Exercise Caution',
          icon: AlertTriangle,
          color: '#eab308',
          description: `${Math.round(nearestDistance)}m from ${nearestSeverity} risk`
        }
      }
      return {
        level: 'safe',
        message: 'Safe',
        icon: Shield,
        color: '#10b981',
        description: `${Math.round(nearestDistance)}m from nearest incident`
      }
    } else {
      return {
        level: 'safe',
        message: 'Safe',
        icon: Shield,
        color: '#10b981',
        description: 'No nearby incidents detected'
      }
    }
  }

  const safetyInfo = getSafetyInfo()
  const Icon = safetyInfo.icon

  return (
    <div className={`safety-status ${safetyInfo.level}`}>
      <div 
        className="safety-status-icon"
        style={{ 
          backgroundColor: `${safetyInfo.color}20`,
          borderColor: safetyInfo.color,
          color: safetyInfo.color
        }}
      >
        <Icon size={24} />
      </div>
      <div className="safety-status-content">
        <div className="safety-status-message">{safetyInfo.message}</div>
        <div className="safety-status-description">{safetyInfo.description}</div>
      </div>
      <div 
        className="safety-status-indicator"
        style={{ backgroundColor: safetyInfo.color }}
      />
    </div>
  )
}

