import React from 'react'

export default class TemperatureController extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      isDragging: false,
    }
  }

  sendValue(event) {
    const {
      clientY,
      target: { clientHeight },
    } = event
    const offsetY = 56 // same as title bar height
    this.props.onValueChanged(1.0 - (clientY - offsetY) / clientHeight)
  }

  onMouseDown(event) {
    this.setState({ isDragging: true })
    this.sendValue(event)
    this.props.onEnter()
  }

  onMouseUp(event) {
    this.setState({ isDragging: false })
    this.props.onLeave()
  }

  onMouseMove(event) {
    if (this.state.isDragging) {
      this.sendValue(event)
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
