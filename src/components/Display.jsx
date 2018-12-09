import React from 'react'

const Display = ({
  temperature,
  targetTemperature,
  isModifying,
  isSyncing,
}) => (
  <div
    style={{
      position: 'absolute',
      width: '100%',
      height: '100%',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      flexDirection: 'column',
      fontFamily: "'BlinkMacSystemFont', sans-serif",
      color: 'black',
      transition: `all 1s`,
      filter: isSyncing ? 'blur(15px)' : 'none',
    }}>
    <div
      style={{
        fontSize: '100px',
        marginBottom: '30px',
        transition: `all .5s`,
      }}>
      {targetTemperature}
    </div>
    <div style={{ fontSize: '15px' }}>気温</div>
    <div style={{ fontSize: '40px' }}>{temperature}</div>
  </div>
)

export default Display
