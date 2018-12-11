import React from 'react'
import styled from 'styled-components'

const Header = ({ onClick, children }) => (
  <Container>
    <Title>Nature Remo</Title>
    {children}
  </Container>
)

const Container = styled.div`
  height: 40px;
  background: linear-gradient(#ececec, #d6d6d6);
  -webkit-app-region: drag;
`

const Title = styled.div`
  position: absolute;
  width: 100%;
  padding-top: 12px;
  text-align: center;
  font-family: BlinkMacSystemFont, sans-serif;
  font-weight: 500;
  font-size: 12px;
  color: grey;
`

export default Header
