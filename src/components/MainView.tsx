import React, { useState, useRef, useEffect } from 'react'
import styled from 'styled-components'
import { Cloud, IAirconModeType } from 'nature-remo'
import { History } from 'history'

import BarIndicator from './BarIndicator'
import Display from './Display'
import TemperatureController from './TemperatureController'

type Aircon = {
  roomTemperature: number
  airconTemperature: number
  airconTemperatureMax: number
  airconMode: IAirconModeType
  airconVolume: string
  airconStatus: boolean
  airconID: string
}

function useAircon(
  token: string | null
): [Aircon, (temperature: number) => Promise<any>] {
  const natureRemo = useRef<Cloud>()
  const [roomTemperature, setRoomTemperature] = useState<number>(0)
  const [airconID, setAirconID] = useState<string>('')
  const [airconTemperature, setAirconTemperature] = useState<number>(0)
  const [airconTemperatureMax, setAirconTemperatureMax] = useState<number>(32)
  const [airconMode, setAirconMode] = useState<IAirconModeType>('auto')
  const [airconVolume, setAirconVolume] = useState<string>('')
  const [airconStatus, setAirconStatus] = useState<boolean>(false)

  useEffect(() => {
    natureRemo.current = new Cloud(token || '')
  }, [token])

  useEffect(() => {
    async function situateRemoteValue() {
      console.log('situate values')
      const sensorValue = await natureRemo.current!.getSensorValue()

      const roomTemperature = Math.floor(sensorValue.temperature)
      setRoomTemperature(roomTemperature)

      const appliances = await natureRemo.current!.getAppliances()
      const aircon = appliances.find((app) => app.type === 'AC')!
      const airconID = aircon.id
      const airconMode = aircon.settings.mode
      const airconStatus = aircon.settings.button !== 'power-off'
      const airconTemperature = Number(aircon.settings.temp)
      const airconTemperatureMax = Math.max(
        ...aircon.aircon!.range.modes[airconMode].temp.map((s) => Number(s))
      )
      const airconVolume = aircon.settings.vol

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
      console.log('restore')

      restoreCache()
    }
  }, [natureRemo])

  useEffect(() => {
    localStorage.setItem('airconID', airconID)
    localStorage.setItem('airconMode', airconMode)
    localStorage.setItem('airconStatus', airconStatus ? '1' : '0')
    localStorage.setItem('airconTemperature', String(airconTemperature))
    localStorage.setItem('airconTemperatureMax', String(airconTemperatureMax))
    localStorage.setItem('airconVolume', String(airconVolume))
    localStorage.setItem('timeLastFetched', String(new Date().getTime()))
    localStorage.setItem('roomTemperature', String(roomTemperature))
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
    const updateFrequencyInSeconds = 30
    const timeLastFetched = Number(localStorage.getItem('timeLastFetched'))

    if (!timeLastFetched) {
      return true
    }
    return (
      new Date().getTime() - timeLastFetched > updateFrequencyInSeconds * 1000
    )
  }

  function restoreCache() {
    setAirconTemperature(Number(localStorage.getItem('airconTemperature')))
    setAirconTemperatureMax(
      Number(localStorage.getItem('airconTemperatureMax'))
    )
    setAirconID(localStorage.getItem('airconID')!)
    setAirconMode(localStorage.getItem('airconMode') as IAirconModeType)
    setAirconStatus(
      localStorage.getItem('airconStatus') === 'true' ? true : false
    )
    setAirconVolume(localStorage.getItem('airconVolume')!)

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

    await natureRemo.current!.updateAirconSettings(airconID, params)
  }

  async function setTemperature(temperature: number) {
    setAirconTemperature(temperature)
    await applyAirconSettings()
  }

  return [
    {
      roomTemperature,
      airconTemperature,
      airconTemperatureMax,
      airconMode,
      airconVolume,
      airconStatus,
      airconID,
    },
    setTemperature,
  ]
}

const MainView: React.FC<{ history: History }> = ({ history }) => {
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
    setTargetValue(aircon.airconTemperature)
  }, [aircon.airconTemperature])

  function onEnterModifyState() {
    setIsModifyingTemperature(true)
  }

  function onHandleMove(value: number) {
    const airconTemperature = Math.round(value * aircon.airconTemperatureMax)
    setTargetValue(airconTemperature)
  }

  async function onLeaveHandle() {
    setIsModifyingTemperature(false)
    if (aircon.airconTemperature !== targetValue) {
      setIsSyncingWithServer(true)
      await setAirconTemperature(targetValue)
      setIsSyncingWithServer(false)
    }
  }

  return (
    <Container>
      <BarIndicator
        value={targetValue}
        maxValue={aircon.airconTemperatureMax}
        mode={aircon.airconMode}
        isModifying={isModifyingTemperature}
      />
      <Display
        temperature={aircon.roomTemperature}
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
