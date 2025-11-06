import { useState, useEffect } from 'react'
import { RiskEvent, IncidentStatus } from '../types'
import { Search, Filter, X } from 'lucide-react'
import './OperatorIncidentFilter.css'

interface OperatorIncidentFilterProps {
  events: RiskEvent[]
  onFilterChange: (filteredEvents: RiskEvent[]) => void
}

export default function OperatorIncidentFilter({ events, onFilterChange }: OperatorIncidentFilterProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedTypes, setSelectedTypes] = useState<Set<string>>(new Set())
  const [selectedSeverities, setSelectedSeverities] = useState<Set<string>>(new Set())
  const [selectedStatuses, setSelectedStatuses] = useState<Set<string>>(new Set())
  const [showFilters, setShowFilters] = useState(false)

  const types = ['crime', 'emergency', 'weather', 'traffic']
  const severities = ['critical', 'high', 'medium', 'low']
  const statuses: IncidentStatus[] = ['reported', 'investigating', 'in_progress', 'resolved', 'monitoring']

  const applyFilters = () => {
    let filtered = [...events]

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(event => 
        event.description.toLowerCase().includes(query) ||
        event.type.toLowerCase().includes(query) ||
        event.id.toLowerCase().includes(query)
      )
    }

    // Type filter
    if (selectedTypes.size > 0) {
      filtered = filtered.filter(event => selectedTypes.has(event.type))
    }

    // Severity filter
    if (selectedSeverities.size > 0) {
      filtered = filtered.filter(event => selectedSeverities.has(event.severity))
    }

    // Status filter
    if (selectedStatuses.size > 0) {
      filtered = filtered.filter(event => selectedStatuses.has(event.status))
    }

    onFilterChange(filtered)
  }

  const handleTypeToggle = (type: string) => {
    const newTypes = new Set(selectedTypes)
    if (newTypes.has(type)) {
      newTypes.delete(type)
    } else {
      newTypes.add(type)
    }
    setSelectedTypes(newTypes)
  }

  const handleSeverityToggle = (severity: string) => {
    const newSeverities = new Set(selectedSeverities)
    if (newSeverities.has(severity)) {
      newSeverities.delete(severity)
    } else {
      newSeverities.add(severity)
    }
    setSelectedSeverities(newSeverities)
  }

  const handleStatusToggle = (status: IncidentStatus) => {
    const newStatuses = new Set(selectedStatuses)
    if (newStatuses.has(status)) {
      newStatuses.delete(status)
    } else {
      newStatuses.add(status)
    }
    setSelectedStatuses(newStatuses)
  }

  const clearFilters = () => {
    setSearchQuery('')
    setSelectedTypes(new Set())
    setSelectedSeverities(new Set())
    setSelectedStatuses(new Set())
  }

  const hasActiveFilters = selectedTypes.size > 0 || selectedSeverities.size > 0 || selectedStatuses.size > 0 || searchQuery.trim() !== ''

  // Apply filters when dependencies change
  useEffect(() => {
    applyFilters()
  }, [searchQuery, selectedTypes, selectedSeverities, selectedStatuses, events])

  return (
    <div className="operator-filter-container">
      <div className="filter-header">
        <div className="filter-search">
          <Search size={18} />
          <input
            type="text"
            placeholder="Search incidents..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value)
              setTimeout(applyFilters, 100)
            }}
            className="filter-search-input"
          />
          {searchQuery && (
            <button 
              className="filter-clear-btn"
              onClick={() => {
                setSearchQuery('')
                setTimeout(applyFilters, 100)
              }}
            >
              <X size={14} />
            </button>
          )}
        </div>
        <button 
          className={`filter-toggle-btn ${showFilters ? 'active' : ''}`}
          onClick={() => setShowFilters(!showFilters)}
        >
          <Filter size={18} />
          {hasActiveFilters && <span className="filter-badge">{selectedTypes.size + selectedSeverities.size + selectedStatuses.size}</span>}
        </button>
      </div>

      {showFilters && (
        <div className="filter-panel">
          <div className="filter-section">
            <h4>Type</h4>
            <div className="filter-chips">
              {types.map(type => (
                <button
                  key={type}
                  className={`filter-chip ${selectedTypes.has(type) ? 'active' : ''}`}
                  onClick={() => {
                    handleTypeToggle(type)
                    setTimeout(applyFilters, 100)
                  }}
                >
                  {type.toUpperCase()}
                </button>
              ))}
            </div>
          </div>

          <div className="filter-section">
            <h4>Severity</h4>
            <div className="filter-chips">
              {severities.map(severity => (
                <button
                  key={severity}
                  className={`filter-chip ${selectedSeverities.has(severity) ? 'active' : ''}`}
                  onClick={() => {
                    handleSeverityToggle(severity)
                    setTimeout(applyFilters, 100)
                  }}
                  style={{
                    borderColor: selectedSeverities.has(severity) ? getSeverityColor(severity) : undefined
                  }}
                >
                  {severity.toUpperCase()}
                </button>
              ))}
            </div>
          </div>

          <div className="filter-section">
            <h4>Status</h4>
            <div className="filter-chips">
              {statuses.map(status => (
                <button
                  key={status}
                  className={`filter-chip ${selectedStatuses.has(status) ? 'active' : ''}`}
                  onClick={() => {
                    handleStatusToggle(status)
                    setTimeout(applyFilters, 100)
                  }}
                  style={{
                    borderColor: selectedStatuses.has(status) ? getStatusColor(status) : undefined
                  }}
                >
                  {status.replace('_', ' ').toUpperCase()}
                </button>
              ))}
            </div>
          </div>

          {hasActiveFilters && (
            <button className="filter-clear-all" onClick={() => {
              clearFilters()
              setTimeout(applyFilters, 100)
            }}>
              Clear All Filters
            </button>
          )}
        </div>
      )}
    </div>
  )
}

function getSeverityColor(severity: string): string {
  switch (severity) {
    case 'critical': return '#ef4444'
    case 'high': return '#f97316'
    case 'medium': return '#eab308'
    case 'low': return '#3b82f6'
    default: return '#6b7280'
  }
}

function getStatusColor(status: string): string {
  switch (status) {
    case 'reported': return '#3b82f6'
    case 'investigating': return '#eab308'
    case 'in_progress': return '#f97316'
    case 'resolved': return '#10b981'
    case 'monitoring': return '#6b7280'
    default: return '#6b7280'
  }
}

