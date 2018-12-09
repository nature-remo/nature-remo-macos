import React from 'react'

const BarIndicator = ({ value, maxValue, isModifying, mode }) => {
  const gradientTheme = {
    warm: 'linear-gradient(#F76B1C, #FAD961)',
    cold: 'linear-gradient(#80C3F3, #4A90E2)',
  }
  return (
    <div
      style={{
        opacity: isModifying ? '0.8' : '1.0',
        position: 'absolute',
        width: '100%',
        height: `${100 * (value / maxValue)}%`,
        top: `${100 - 100 * (value / maxValue)}%`,
        background: gradientTheme[mode],
        transition: `all ${isModifying ? '0.2' : '0.8'}s`,
        display: 'flex',
        justifyContent: 'center',
        borderTopLeftRadius: isModifying ? '20px' : '0',
        borderTopRightRadius: isModifying ? '20px' : '0',
      }}>
      <div
        style={{
          width: '100px',
          height: '8px',
          background: isModifying
            ? 'rgb(255,255,255,1.0)'
            : 'rgb(255,255,255,0.3)',
          borderRadius: '4px',
          marginTop: '8px',
        }}
      />
    </div>
  )
}

export default BarIndicator
