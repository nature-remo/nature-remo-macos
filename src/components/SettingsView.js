import React from 'react'
import styled from 'styled-components'
import { Link } from 'react-router-dom'

export default class SettingsView extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      value: '',
    }
  }

  onChange(event) {
    const {
      currentTarget: { value },
    } = event
    this.setState({ value })
  }

  onSubmit() {
    console.log('submit', this.state.value)
    localStorage.setItem('token', this.state.value)
  }

  render() {
    return (
      <Container>
        <input type="text" onChange={this.onChange.bind(this)} />
        <button onClick={this.onSubmit.bind(this)}>Save</button>
        <Link to="/">Close</Link>
      </Container>
    )
  }
}

const Container = styled.div`
  flex-grow: 1;
  position: relative;
`
