import React from 'react'
import fetch from 'isomorphic-unfetch'

const gradientTheme = {
  warm: 'linear-gradient(#F76B1C, #FAD961)',
  cold: 'linear-gradient(#80C3F3, #4A90E2)',
}
const token = process.env.NATURE_REMO_TOKEN

const BarIndicator = ({
  value,
  maxValue = 32,
  isModifying,
  theme = 'warm',
}) => (
  <div
    style={{
      position: 'absolute',
      width: '100%',
      height: `${100 * (value / maxValue)}%`,
      top: `${100 - 100 * (value / maxValue)}%`,
      background: gradientTheme[theme],
      transition: `all ${isModifying ? '0.2' : '0.8'}s`,
    }}
  />
)

const Display = ({ temperature, targetTemperature, isModifying }) => (
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
    }}>
    <div
      style={{
        fontSize: isModifying ? '140px' : '100px',
        marginBottom: '30px',
        transition: `all .5s`,
      }}>
      {targetTemperature}
    </div>
    <div style={{ fontSize: '15px' }}>気温</div>
    <div style={{ fontSize: '40px' }}>{temperature}</div>
  </div>
)

class Controller extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      isDragging: false,
    }
  }

  onMouseDown(event) {
    this.setState({ isDragging: true })
    const {
      clientY,
      target: { clientHeight },
    } = event
    this.props.onValueChanged(1.0 - clientY / clientHeight)

    this.props.onEnter()
  }

  onMouseUp(event) {
    this.setState({ isDragging: false })
    this.props.onLeave()
  }

  onMouseMove(event) {
    if (this.state.isDragging) {
      const {
        clientY,
        target: { clientHeight },
      } = event
      this.props.onValueChanged(1.0 - clientY / clientHeight)
    }
  }

  render() {
    return (
      <div
        style={{
          position: 'absolute',
          width: '100%',
          height: '100%',
        }}
        onMouseDown={this.onMouseDown.bind(this)}
        onMouseUp={this.onMouseUp.bind(this)}
        onMouseMove={this.onMouseMove.bind(this)}
      />
    )
  }
}

export default class App extends React.Component {
  constructor() {
    super()
    this.state = {
      isModifyingTemperature: false,
      isSwitchedOn: null,
      mode: null,
      volume: null,
      temperature: null,
      targetTemperature: null,
      targetTemperatureMax: null,
      isRateLimitReached: false,
    }
  }

  async fetch(path, method = 'GET', body = undefined) {
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
      return json
    } catch (err) {
      console.log(err)
      this.setState({ isRateLimitReached: true })
      return {}
    }
  }

  async getSensorValue() {
    const devices = await this.fetch('devices')
    const device = devices[0]
    const sensorValue = {
      temperature: device.newest_events.te.val,
      humidity: device.newest_events.hu.val,
    }
    return sensorValue
  }

  async getAircon() {
    const appliances = await this.fetch('appliances')
    const aircon = appliances.find(app => app.type === 'AC')
    return aircon
  }

  async fetchSensorValue() {
    const { temperature } = await this.getSensorValue()
    this.setState({ temperature })
  }

  async fetchAirconSettings() {
    const aircon = await this.getAircon()
    const {
      aircon: {
        range: { modes },
      },
      settings: { button, mode, temp, vol },
    } = aircon
    const targetTemperatureMax = Math.max(
      ...modes[mode].temp.map(s => Number(s))
    )

    this.setState({
      isSwitchedOn: button === 'power-off' ? false : true,
      mode,
      volume: vol,
      targetTemperature: Number(temp),
      targetTemperatureMax,
    })
  }

  async applyAirconSettings() {
    const { mode, targetTemperature, volume, isSwitchedOn } = this.state
    const { id } = await this.getAircon()

    const params = isSwitchedOn
      ? `operation_mode=${mode}&temperature=${targetTemperature}&air_volume=${volume}`
      : 'button=power-off'

    await this.fetch(`appliances/${id}/aircon_settings`, 'POST', params)
  }

  async componentDidMount() {
    await this.fetchSensorValue()
    await this.fetchAirconSettings()
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
      temperature,
      targetTemperature,
      isModifyingTemperature,
    } = this.state

    return (
      <div
        style={{
          backgroundColor: 'white',
          width: '100%',
          height: '100%',
          position: 'absolute',
        }}>
        <BarIndicator
          isModifying={isModifyingTemperature}
          value={targetTemperature === null ? 0 : targetTemperature}
          maxValue={32}
        />
        <Display
          temperature={temperature === null ? 'Loading' : temperature}
          targetTemperature={
            targetTemperature === null ? 'Loading' : targetTemperature
          }
          isModifying={isModifyingTemperature}
        />
        <Controller
          onEnter={this.onEnter.bind(this)}
          onLeave={this.onLeave.bind(this)}
          onValueChanged={this.onValueChanged.bind(this)}
        />
      </div>
    )
  }
}
