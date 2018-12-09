import React from 'react'
import styled from 'styled-components'

const Display = props => (
  <Container>
    <LargeGauge>{props.targetTemperature}</LargeGauge>
    <Label>気温</Label>
    <SmallGauge>{props.temperature}</SmallGauge>
  </Container>
)

const Container = styled.div`
  position: absolute;
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  font-family: 'BlinkMacSystemFont', sans-serif;
  color: black;
  transition: all 1s,
  filter: ${props => (props.isSyncing ? 'blur(15px)' : 'none')};
`

const Label = styled.div`
  font-size: 15px;
`

const LargeGauge = styled.div`
  font-size: 100px;
  margin-bottom: 30px;
`

const SmallGauge = styled.div`
  font-size: 40px;
`

export default Display
