import React from 'react'
import styled from 'styled-components'

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
    this.props.onEnter()
    this.sendValue(event)
    this.setState({ isDragging: true })
  }

  onMouseMove(event) {
    if (this.state.isDragging) {
      this.sendValue(event)
    }
  }

  onMouseUp(event) {
    this.setState({ isDragging: false })
    this.props.onLeave()
  }

  render() {
    return (
      <Container
        onMouseDown={this.onMouseDown.bind(this)}
        onMouseMove={this.onMouseMove.bind(this)}
        onMouseUp={this.onMouseUp.bind(this)}
      />
    )
  }
}

const Container = styled.div`
  position: absolute;
  width: 100%;
  height: 100%;
`
