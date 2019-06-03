import React from 'react'
import styled from 'styled-components'

type Props = {
  targetTemperature: number
  temperature: number
  isSyncing: boolean
}

const Display: React.FC<Props> = ({
  targetTemperature,
  temperature,
  isSyncing,
}) => (
  <Container isSyncing={isSyncing}>
    <LargeGauge>{targetTemperature}</LargeGauge>
    <SmallGauge>{temperature}</SmallGauge>
  </Container>
)

export default Display

// ------
// styles
// ------
const Container = styled.div<Pick<Props, 'isSyncing'>>`
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

const LargeGauge = styled.div`
  font-size: 100px;
  font-weight: 100;
  margin-bottom: 10px;
`

const SmallGauge = styled.div`
  font-size: 30px;
  font-weight: 300;
  border: 2px solid black;
  border-radius: 50%;
  width: 2em;
  height: 2em;
  text-align: center;
  line-height: 2em;
  color: black;
`
