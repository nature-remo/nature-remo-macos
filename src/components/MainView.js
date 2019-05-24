import React, { useState, useRef, useEffect } from 'react'
import styled from 'styled-components'
import * as NatureRemo from 'nature-remo'

import BarIndicator from './BarIndicator'
import Display from './Display'
import TemperatureController from './TemperatureController'

function useAircon(token) {
  const natureRemo = useRef()
  const [roomTemperature, setRoomTemperature] = useState(0)
  const [airconID, setAirconID] = useState(null)
  const [airconTemperature, setAirconTemperature] = useState(0)
  const [airconTemperatureMax, setAirconTemperatureMax] = useState(32)
  const [airconMode, setAirconMode] = useState(null)
  const [airconVolume, setAirconVolume] = useState(null)
  const [airconStatus, setAirconStatus] = useState(null)

  useEffect(() => {
    natureRemo.current = new NatureRemo.Cloud(token)
  }, [token])

  useEffect(() => {
    async function situateRemoteValue() {
      console.log('situate values')
      const device = (await natureRemo.current.getDevices())[0]
      const roomTemperature = Math.floor(Number(device.newest_events.te.val))
      setRoomTemperature(roomTemperature)

      const appliances = await natureRemo.current.getAppliances()
      const aircon = appliances.find((app) => app.type === 'AC')
      const airconID = aircon.id
      const airconMode = aircon.settings.mode
      const airconStatus = aircon.settings.button !== 'power-off'
      const airconTemperature = Number(aircon.settings.temp)
      const airconTemperatureMax = Math.max(
        ...aircon.aircon.range.modes[airconMode].temp.map((s) => Number(s))
      )
      const airconVolume = Number(aircon.settings.vol)

      setAirconID(airconID)
      setAirconMode(airconMode)
      setAirconStatus(airconStatus)
      setAirconTemperature(airconTemperature)
      setAirconTemperatureMax(airconTemperatureMax)
      setAirconVolume(airconVolume)
    }

    if (shouldUpdateValue()) {
      situateRemoteValue()
    } else {
      restoreCache()
    }
  }, [natureRemo])

  useEffect(() => {
    localStorage.setItem('airconID', airconID)
    localStorage.setItem('airconMode', airconMode)
    localStorage.setItem('airconStatus', airconStatus)
    localStorage.setItem('airconTemperature', airconTemperature)
    localStorage.setItem('airconTemperatureMax', airconTemperatureMax)
    localStorage.setItem('airconVolume', airconVolume)
    localStorage.setItem('timeLastFetched', new Date().getTime())
    localStorage.setItem('roomTemperature', roomTemperature)
  }, [
    airconID,
    airconMode,
    airconStatus,
    airconTemperature,
    airconTemperatureMax,
    airconVolume,
    roomTemperature,
  ])

  function shouldUpdateValue() {
    console.log('shouldUpdateValue')
    const updateFrequencyInSeconds = 180
    const timeLastFetched = localStorage.getItem('timeLastFetched')
    if (!timeLastFetched) {
      return true
    }
    return (
      new Date().getTime() - timeLastFetched > updateFrequencyInSeconds * 1000
    )
  }

  function restoreCache() {
    setAirconTemperature(Number(localStorage.getItem('airconTemperature')))
    setAirconID(localStorage.getItem('airconID'))
    setAirconMode(localStorage.getItem('airconMode'))
    setAirconStatus(
      localStorage.getItem('airconStatus') === 'true' ? true : false
    )
    setAirconTemperature(Number(localStorage.getItem('airconTemperature')))
    setAirconTemperatureMax(
      Number(localStorage.getItem('airconTemperatureMax'))
    )
    setAirconVolume(Number(localStorage.getItem('airconVolume')))
    setRoomTemperature(Number(localStorage.getItem('roomTemperature')))
  }

  async function applyAirconSettings() {
    const params = airconStatus
      ? {
          operation_mode: airconMode,
          temperature: airconTemperature,
          air_volume: airconVolume,
        }
      : { button: 'power-off' }

    await natureRemo.current.updateAirconSettings(airconID, params)
  }

  async function setTemperature(temperature) {
    setAirconTemperature(temperature)
    await applyAirconSettings()
  }

  return [
    {
      temperature: roomTemperature,
      targetTemperature: airconTemperature,
      targetTemperatureMax: airconTemperatureMax,
      airconMode,
      airconVolume,
      airconStatus,
      airconID,
    },
    setTemperature,
  ]
}

export default function MainView({ history }) {
  const tokenRef = useRef(localStorage.getItem('token'))
  const [aircon, setAirconTemperature] = useAircon(tokenRef.current)

  const [isModifyingTemperature, setIsModifyingTemperature] = useState(false)
  const [isSyncingWithServer, setIsSyncingWithServer] = useState(false)
  const [targetValue, setTargetValue] = useState()

  useEffect(() => {
    if (!tokenRef.current || tokenRef.current === '') {
      history.push('/settings')
    }
  }, [history])

  useEffect(() => {
    setTargetValue(aircon.targetTemperature)
  }, [aircon.targetTemperature])

  function onEnterModifyState() {
    setIsModifyingTemperature(true)
  }

  function onHandleMove(value) {
    const targetTemperature = Math.round(value * aircon.targetTemperatureMax)
    setTargetValue(targetTemperature)
  }

  async function onLeaveHandle() {
    setIsModifyingTemperature(false)
    if (aircon.targetTemperature !== targetValue) {
      setIsSyncingWithServer(true)
      await setAirconTemperature(targetValue)
      setIsSyncingWithServer(false)
    }
  }

  return (
    <Container>
      <BarIndicator
        value={targetValue}
        maxValue={aircon.targetTemperatureMax}
        mode={aircon.airconMode}
        isModifying={isModifyingTemperature}
      />
      <Display
        temperature={aircon.temperature}
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

const Container = styled.div`
  flex-grow: 1;
  position: relative;
  background-color: #f3f3f3;
`
