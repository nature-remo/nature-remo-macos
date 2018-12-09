import React from 'react'
import styled from 'styled-components'

const Header = () => (
  <Container>
    <Title>Nature Remo</Title>
  </Container>
)

const Container = styled.div`
  background: linear-gradient(#ececec, #d6d6d6);
  height: 40px;
  -webkit-app-region: drag;
`

const Title = styled.div`
  text-align: center;
  font-family: BlinkMacSystemFont, sans-serif;
  font-weight: 500;
  font-size: 12px;
  color: grey;
  padding-top: 12px;
`

export default Header
