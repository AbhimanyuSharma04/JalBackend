import React from 'react';

// Renamed internally to be more accurate, but keeping filename to avoid breaking imports elsewhere initially, 
// though logically this replaces the old "display-only" scale.
const SafetyScale = ({ value, min, max, label, unit, name, onChange, trackType = 'default' }) => {
  // Determine status for colour coding visually
  let status = 'neutral';
  let badgeText = '';

  // Quick logic for badge color (simplified for visuals)
  const numVal = parseFloat(value);
  const mid = (max - min) / 2;

  // Custom logic based on track type
  if (trackType === 'ph') {
    if (numVal >= 6.5 && numVal <= 8.5) { status = 'safe'; badgeText = 'Safe'; }
    else { status = 'unsafe'; badgeText = 'Unsafe'; }
  } else {
    // Default low=good assumption (contaminants)
    const range = max - min;
    if (numVal < min + range * 0.33) { status = 'safe'; badgeText = 'Safe'; }
    else if (numVal < min + range * 0.66) { status = 'moderate'; badgeText = 'Moderate'; }
    else { status = 'unsafe'; badgeText = 'Unsafe'; }
  }

  return (
    <div className="jr-slider-container">
      <div className="d-flex justify-content-between align-items-center mb-1">
        <label className="jr-label mb-0 fw-bold">{label}</label>
        {/* Value Input - Modified to allow manual entry */}
        <div className="d-flex align-items-center gap-2">
          <input
            type="number"
            className="jr-input py-1 px-2"
            style={{ 
              width: '80px', 
              textAlign: 'right', 
              fontSize: '0.9rem', 
              background: 'rgba(255, 255, 255, 0.1)', 
              border: '1px solid rgba(255, 255, 255, 0.2)', 
              color: 'white' 
            }}
            value={value}
            name={name}
            onChange={onChange}
            placeholder={min}
          />
          {unit && <small className="text-muted" style={{ fontSize: '0.8rem' }}>{unit}</small>}
        </div>
      </div>

      <input
        type="range"
        min={min}
        max={max}
        step={trackType === 'ph' ? 0.1 : 1}
        value={value || min} // Default to min if empty
        name={name}
        onChange={onChange}
        className={`jr-range ${trackType === 'ph' ? 'track-ph' : ''}`}
      />

      <div className="d-flex justify-content-between align-items-center mt-1">
        <small className="text-muted">{min}</small>

        {/* Status Badge on the right */}
        <span className={`jr-badge jr-badge-${status}`}>
          {badgeText || `${numVal} ${unit}`}
        </span>
      </div>
    </div>
  );
};

export default SafetyScale;
