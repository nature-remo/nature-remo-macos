import React from 'react'
import fetch from 'isomorphic-unfetch'
import styled from 'styled-components'

import BarIndicator from './components/BarIndicator'
import TemperatureController from './components/TemperatureController'
import Display from './components/Display'
import Header from './components/Header'

const token = process.env.NATURE_REMO_TOKEN

export default class App extends React.Component {
  constructor(props) {
    super(props)

    this.floatingVariables = [
      'temperature',
      'targetTemperature',
      'targetTemperatureMax',
      'mode',
      'airVolume',
      'airconSwitch',
    ]

    this.state = Object.assign(
      {
        isModifyingTemperature: false,
        isSyncingWithServer: false,
      },
      this.floatingVariables.reduce(
        (map, name) => ((map[name] = null), map),
        {}
      )
    )
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
    const updateFrequencyInSeconds = 180
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
      this.loadCache(this.floatingVariables)
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
      <Container>
        <Header />
        <MainView>
          <BarIndicator
            value={targetTemperature}
            maxValue={targetTemperatureMax}
            mode={mode}
            isModifying={isModifyingTemperature}
          />
          <Display
            temperature={temperature}
            targetTemperature={targetTemperature}
            isSyncing={isSyncingWithServer}
          />
          <TemperatureController
            onEnter={this.onEnter.bind(this)}
            onLeave={this.onLeave.bind(this)}
            onValueChanged={this.onValueChanged.bind(this)}
          />
        </MainView>
      </Container>
    )
  }
}

const Container = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
`

const MainView = styled.div`
  flex-grow: 1;
  position: relative;
`
