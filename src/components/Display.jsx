import React from 'react'
import styled from 'styled-components'

const Display = ({ targetTemperature, temperature, isSyncing }) => (
  <Container isSyncing={isSyncing}>
    <LargeGauge>{targetTemperature}</LargeGauge>
    <Label>気温</Label>
    <SmallGauge>{temperature}</SmallGauge>
  </Container>
)

// ------
// styles
// ------
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
  transition: all 0.5s ease-out;
  filter: ${(props) => (props.isSyncing ? 'blur(15px)' : 'none')};
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
