import React from 'react'
import styled from 'styled-components'
import * as NatureRemo from 'nature-remo'

import BarIndicator from './components/BarIndicator'
import TemperatureController from './components/TemperatureController'
import Display from './components/Display'
import Header from './components/Header'

export default class App extends React.Component {
  constructor(props) {
    super(props)

    this.natureRemo = new NatureRemo.Cloud(process.env.NATURE_REMO_TOKEN)
    this.floatingVariables = [
      'temperature',
      'targetTemperature',
      'targetTemperatureMax',
      'mode',
      'airVolume',
      'airconSwitch',
      'airconID',
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

  async fetchSensorValueAndUpdateState() {
    const devices = await this.natureRemo.getDevices()
    const device = devices[0]
    const temperature = device.newest_events.te.val
    this.setState({ temperature })
    return { temperature }
  }

  async fetchAirconSettingsAndUpdateState() {
    const appliances = await this.natureRemo.getAppliances()
    const aircon = appliances.find(app => app.type === 'AC')
    const {
      id,
      aircon: {
        range: { modes },
      },
      settings: { button, mode, temp, vol },
    } = aircon
    const targetTemperatureMax = Math.max(
      ...modes[mode].temp.map(s => Number(s))
    )

    const newState = {
      targetTemperature: Number(temp),
      targetTemperatureMax,
      mode,
      airVolume: vol,
      airconSwitch: button === 'power-off' ? false : true,
      airconID: id,
    }
    this.setState(newState)
    return newState
  }

  async applyAirconSettings() {
    const {
      mode,
      targetTemperature,
      airVolume,
      airconSwitch,
      airconID,
    } = this.state

    const params = airconSwitch
      ? `operation_mode=${mode}&temperature=${targetTemperature}&air_volume=${airVolume}`
      : 'button=power-off'

    await this.natureRemo.updateAirconSettings(airconID, params)
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
      this.setState({ isSyncingWithServer: true })
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
      this.setState({ isSyncingWithServer: false })
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
