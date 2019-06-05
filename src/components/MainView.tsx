import React, { useState, useRef, useEffect } from 'react'
import styled from 'styled-components'
import { History } from 'history'

import TemperatureBarIndicator from './TemperatureBarIndicator'
import TemperatureDisplay from './TemperatureDisplay'
import TemperatureController from './TemperatureController'
import { useAircon } from '../hooks/useAircon'

const MainView: React.FC<{ history: History }> = ({ history }) => {
  const tokenRef = useRef(localStorage.getItem('token'))
  const [aircon, room, setAirconData, applyAirconData] = useAircon(
    tokenRef.current || ''
  )

  const [isModifyingTemperature, setIsModifyingTemperature] = useState(false)
  const [isSyncingWithServer, setIsSyncingWithServer] = useState(false)
  const [targetValue, setTargetValue] = useState()

  // Settings view
  useEffect(() => {
    if (!tokenRef.current || tokenRef.current === '') {
      history.push('/settings')
    }
  }, [history])

  useEffect(() => {
    setTargetValue(aircon.temperature)
  }, [aircon.temperature])

  function onEnterModifyState() {
    setIsModifyingTemperature(true)
  }

  function onHandleMove(value: number) {
    const targetValue = Math.round(value * aircon.maxTempetature)
    setTargetValue(targetValue)
  }

  async function onLeaveHandle() {
    setIsModifyingTemperature(false)
    if (aircon.temperature !== targetValue) {
      setIsSyncingWithServer(true)
      setAirconData((prevState) => ({ ...prevState, temperature: targetValue }))
      await applyAirconData()
      setIsSyncingWithServer(false)
    }
  }

  return (
    <Container>
      <TemperatureBarIndicator
        value={targetValue}
        maxValue={aircon.maxTempetature}
        mode={aircon.mode}
        isModifying={isModifyingTemperature}
      />
      <TemperatureDisplay
        temperature={room.temperature}
        targetTemperature={targetValue}
        isSyncing={isSyncingWithServer}
      />
      <TemperatureController
        onEnter={onEnterModifyState}
        onLeave={onLeaveHandle}
        onValueChanged={onHandleMove}
      />
    </Container>
  )
}

export default MainView

const Container = styled.div`
  flex-grow: 1;
  position: relative;
  background-color: #f3f3f3;
`
