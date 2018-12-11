import React from 'react'
import styled from 'styled-components'
import { HashRouter as Router, Route, Link } from 'react-router-dom'

import Header from './components/Header'
import MainView from './components/MainView'
import SettingsView from './components/SettingsView'

class App extends React.Component {
  render() {
    return (
      <Router>
        <Container>
          <Header>
            <Link to="/settings/">
              <SettingsButton />
            </Link>
          </Header>
          <Route path="/" exact component={MainView} />
          <Route path="/settings/" component={SettingsView} />
        </Container>
      </Router>
    )
  }
}

const Container = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
`

const SettingsButton = styled.div`
  position: absolute;
  width: 20px;
  height: 20px;
  right: 10px;
  top: 10px;
  margin-left: 100px;
  // background: black;
  content: 'S';
`

export default App
