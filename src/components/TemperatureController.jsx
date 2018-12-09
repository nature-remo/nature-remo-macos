import React from 'react'

export default class TemperatureController extends React.Component {
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
