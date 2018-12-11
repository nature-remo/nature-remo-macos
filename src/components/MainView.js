import React from 'react'
import styled from 'styled-components'
import * as NatureRemo from 'nature-remo'
import { Redirect } from 'react-router-dom'

import BarIndicator from './BarIndicator'
import Display from './Display'
import TemperatureController from './TemperatureController'

export default class MainView extends React.Component {
  constructor(props) {
    super(props)

    const token = localStorage.getItem('token')
    this.natureRemo = new NatureRemo.Cloud(token)

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
    const temperature = devices[0].newest_events.te.val

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
      airconSwitch: button !== 'power-off',
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
      ? {
          operation_mode: mode,
          temperature: targetTemperature,
          air_volume: airVolume,
        }
      : { button: 'power-off' }

    await this.natureRemo.updateAirconSettings(airconID, params)
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

  shouldUpdateValue() {
    const updateFrequencyInSeconds = 180
    const timeLastFetched = localStorage.getItem('timeLastFetched')
    if (!timeLastFetched) {
      return true
    }
    return (
      new Date().getTime() - timeLastFetched > updateFrequencyInSeconds * 1000
    )
  }

  async componentDidMount() {
    if (this.shouldUpdateValue()) {
      this.setState({ isSyncingWithServer: true })

      try {
        const updatedValues = Object.assign(
          {},
          ...(await Promise.all([
            this.fetchSensorValueAndUpdateState(),
            this.fetchAirconSettingsAndUpdateState(),
          ]))
        )
        this.saveCache(
          Object.assign(updatedValues, {
            timeLastFetched: new Date().getTime(),
          })
        )
      } catch (err) {
        console.log(err)
        this.setState({ redirectToSettings: true })
      }

      this.setState({ isSyncingWithServer: false })
    } else {
      this.loadCache(this.floatingVariables)
    }
  }

  onEnterModifyState() {
    this.setState({ isModifyingTemperature: true })
  }

  async onLeaveModifyState() {
    this.setState({ isSyncingWithServer: true, isModifyingTemperature: false })

    await this.applyAirconSettings()

    this.setState({ isSyncingWithServer: false })
  }

  onTargetTemperatureChanged(value) {
    const { targetTemperatureMax } = this.state

    const targetTemperature = Math.round(value * targetTemperatureMax)

    this.setState({ targetTemperature })
  }

  render() {
    const {
      temperature = 0,
      targetTemperature = 0,
      targetTemperatureMax = 32,
      mode,
      isModifyingTemperature,
      isSyncingWithServer,
    } = this.state

    return (
      <Container>
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
          onEnter={this.onEnterModifyState.bind(this)}
          onLeave={this.onLeaveModifyState.bind(this)}
          onValueChanged={this.onTargetTemperatureChanged.bind(this)}
        />
      </Container>
    )
  }
}

const Container = styled.div`
  flex-grow: 1;
  position: relative;
`
