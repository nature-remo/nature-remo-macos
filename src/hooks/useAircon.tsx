import { useState, useRef, useEffect, useMemo } from 'react'
import { Cloud, IAirconModeType } from 'nature-remo'

export type Aircon = {
  id: string
  temperature: number
  maxTempetature: number
  mode: IAirconModeType
  volume: string
  status: boolean
}

export type Room = {
  temperature: number
}

export function useNatureRemo(token: string) {
  const natureRemo = useMemo<Cloud>(() => new Cloud(token), [token])
  return natureRemo
}

export function useAircon(
  token: string
): [
  Aircon,
  Room,
  React.Dispatch<React.SetStateAction<Aircon>>,
  () => Promise<void>
] {
  const natureRemo = useNatureRemo(token)
  const [roomData, setRoomData] = useState<Room>({
    temperature: 0,
  })
  const [airconData, setAirconData] = useState<Aircon>({
    id: '',
    temperature: 0,
    maxTempetature: 0,
    mode: 'cool',
    volume: 'auto',
    status: false,
  })

  useEffect(() => {
    async function situateRemoteValue() {
      console.log('fetch roomData')
      const sensorValue = await natureRemo!.getSensorValue()
      setRoomData({ temperature: Math.floor(sensorValue.temperature) })

      console.log('fetch airconData')
      const appliances = await natureRemo!.getAppliances()
      const aircon = appliances.find((app) => app.type === 'AC')!
      console.log(aircon)

      const id = aircon.id
      const temperature = Number(aircon.settings.temp)
      const maxTempetature = Math.max(
        ...aircon.aircon!.range.modes[airconData.mode].temp.map((s) =>
          Number(s)
        )
      )
      const mode = aircon.settings.mode
      const volume = aircon.settings.vol
      const status = aircon.settings.button !== 'power-off'
      setAirconData({
        id,
        temperature,
        maxTempetature,
        mode,
        volume,
        status,
      })

      localStorage.setItem('timeLastFetched', String(new Date().getTime()))
    }

    function shouldUpdateValue() {
      if (token === '') {
        return false
      }

      const updateFrequencyInSeconds = 30
      const timeLastFetched = Number(localStorage.getItem('timeLastFetched'))
      if (!timeLastFetched) {
        return true
      }
      return (
        new Date().getTime() - timeLastFetched > updateFrequencyInSeconds * 1000
      )
    }

    if (shouldUpdateValue()) {
      situateRemoteValue()
    } else {
      console.log('restore from cache')
      restoreCache()
    }
  }, [airconData.mode, natureRemo, token])

  useEffect(() => {
    localStorage.setItem('airconData', JSON.stringify(airconData))
  }, [airconData])

  useEffect(() => {
    localStorage.setItem('roomData', JSON.stringify(roomData))
  }, [roomData])

  function restoreCache() {
    setAirconData(JSON.parse(localStorage.getItem('airconData') || '{}'))
    setRoomData(JSON.parse(localStorage.getItem('roomData') || '{}'))
  }

  async function applyAirconSettings() {
    console.log('apply')

    const params = airconData.status
      ? {
          operation_mode: airconData.mode,
          temperature: airconData.temperature,
          air_volume: airconData.volume,
        }
      : { button: 'power-off' }
    await natureRemo!.updateAirconSettings(airconData.id, params)
  }

  return [airconData, roomData, setAirconData, applyAirconSettings]
}
