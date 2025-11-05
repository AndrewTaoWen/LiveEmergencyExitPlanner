import { AlertTriangle, X } from 'lucide-react'
import { useEffect, useState } from 'react'
import './AlertBanner.css'

interface AlertBannerProps {
  message: string
  onClose: () => void
  severity?: 'warning' | 'critical'
}

export default function AlertBanner({ message, onClose, severity = 'warning' }: AlertBannerProps) {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    // Trigger slide-in animation
    setTimeout(() => setIsVisible(true), 10)
  }, [])

  const handleClose = () => {
    setIsVisible(false)
    setTimeout(onClose, 300) // Wait for animation to complete
  }

  return (
    <div className={`alert-banner ${severity} ${isVisible ? 'visible' : ''}`}>
      <div className="alert-banner-content">
        <AlertTriangle size={20} className="alert-icon" />
        <div className="alert-message">
          <strong>Warning:</strong> {message}
        </div>
        <button className="alert-close" onClick={handleClose}>
          <X size={18} />
        </button>
      </div>
    </div>
  )
}

