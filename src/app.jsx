import React from 'react'
import fetch from 'isomorphic-unfetch'

import BarIndicator from './components/BarIndicator'
import TemperatureController from './components/TemperatureController'
import Display from './components/Display'

const token = process.env.NATURE_REMO_TOKEN

export default class App extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      airconSwitch: null,
      mode: null,
      airVolume: null,
      temperature: null,
      targetTemperature: null,
      targetTemperatureMax: null,
      isModifyingTemperature: false,
      isRateLimitReached: false,
      isSyncingWithServer: false,
    }
  }

  async nremoFetch(path, method = 'GET', body = undefined) {
    this.setState({ isSyncingWithServer: true })
    try {
      const res = await fetch(`https://api.nature.global/1/${path}`, {
        method: method,
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/x-www-form-urlencoded; charset=utf-8',
        },
        body: body,
      })
      const json = await res.json()
      this.setState({ isSyncingWithServer: false })
      return json
    } catch (err) {
      console.log(err)
      this.setState({ isSyncingWithServer: false })
      return null
    }
  }

  async getAircon() {
    const appliances = await this.nremoFetch('appliances')
    return appliances.find(app => app.type === 'AC')
  }

  async fetchSensorValueAndUpdateState() {
    const devices = await this.nremoFetch('devices')
    const device = devices[0]
    const temperature = device.newest_events.te.val
    this.setState({ temperature })
    return { temperature }
  }

  async fetchAirconSettingsAndUpdateState() {
    const {
      aircon: {
        range: { modes },
      },
      settings: { button, mode, temp, vol },
    } = await this.getAircon()
    const targetTemperatureMax = Math.max(
      ...modes[mode].temp.map(s => Number(s))
    )

    const newState = {
      targetTemperature: Number(temp),
      targetTemperatureMax,
      mode,
      airVolume: vol,
      airconSwitch: button === 'power-off' ? false : true,
    }
    this.setState(newState)
    return newState
  }

  async applyAirconSettings() {
    const { mode, targetTemperature, airVolume, airconSwitch } = this.state
    const { id } = await this.getAircon()

    const params = airconSwitch
      ? `operation_mode=${mode}&temperature=${targetTemperature}&air_volume=${airVolume}`
      : 'button=power-off'

    await this.nremoFetch(`appliances/${id}/aircon_settings`, 'POST', params)
  }

  shouldUpdateValue() {
    const updateFrequencyInSeconds = 60
    const timeLastFetched = localStorage.getItem('timeLastFetched')
    if (timeLastFetched === null) {
      return true
    }
    return (
      new Date().getTime() - timeLastFetched > updateFrequencyInSeconds * 1000
    )
  }

  saveCache(dict) {
    for (const key of Object.keys(dict)) {
      localStorage.setItem(key, dict[key])
    }
  }

  loadCache(keys) {
    let newState = {}
    for (const key of keys) {
      newState[key] = localStorage.getItem(key)
    }
    this.setState(newState)
  }

  async componentDidMount() {
    if (this.shouldUpdateValue()) {
      const updatedValues = Object.assign(
        {},
        ...(await Promise.all([
          this.fetchSensorValueAndUpdateState(),
          this.fetchAirconSettingsAndUpdateState(),
        ]))
      )
      console.log(updatedValues)
      this.saveCache(
        Object.assign({ timeLastFetched: new Date().getTime() }, updatedValues)
      )
    } else {
      this.loadCache([
        'temperature',
        'targetTemperature',
        'targetTemperatureMax',
        'mode',
        'airVolume',
        'airconSwitch',
      ])
    }
  }

  onEnter() {
    this.setState({ isModifyingTemperature: true })
  }

  async onLeave() {
    this.setState({ isModifyingTemperature: false })
    await this.applyAirconSettings()
  }

  onValueChanged(value) {
    const { targetTemperatureMax } = this.state
    const targetTemperature = Math.round(value * targetTemperatureMax)
    this.setState({ targetTemperature })
  }

  render() {
    const {
      temperature = 0,
      targetTemperature = 0,
      targetTemperatureMax = 32,
      isModifyingTemperature,
      isSyncingWithServer,
      mode,
    } = this.state

    return (
      <div>
        <div
          style={{
            background: 'linear-gradient(#ececec, #d6d6d6)',
            height: '40px',
            WebkitAppRegion: 'drag',
          }}>
          <div
            style={{
              textAlign: 'center',
              fontFamily: 'BlinkMacSystemFont, sans-serif',
              fontWeight: '500',
              fontSize: '12px',
              color: 'grey',
              paddingTop: '12px',
            }}>
            Nature Remo
          </div>
        </div>
        <div>
          <BarIndicator
            value={targetTemperature}
            maxValue={targetTemperatureMax}
            mode={mode}
            isModifying={isModifyingTemperature}
          />
          <Display
            temperature={temperature}
            targetTemperature={targetTemperature}
            isModifying={isModifyingTemperature}
            isSyncing={isSyncingWithServer}
          />
          <TemperatureController
            onEnter={this.onEnter.bind(this)}
            onLeave={this.onLeave.bind(this)}
            onValueChanged={this.onValueChanged.bind(this)}
          />
        </div>
      </div>
    )
  }
}
