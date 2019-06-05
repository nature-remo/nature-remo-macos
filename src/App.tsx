import React from 'react'
import styled from 'styled-components'
// import { remote } from 'electron'
// import 'react-tippy/dist/tippy.css'
// import { Tooltip } from 'react-tippy'

import { HashRouter as Router, Route, Link, Switch } from 'react-router-dom'
import Header from './components/Header'
import MainView from './components/MainView'
import SettingsView from './components/SettingsView'
import { IoIosSettings, IoIosPower } from 'react-icons/io'

export default function App() {
  return (
    <Container>
      <Router>
        <Header>
          <IoIosPower />
          <Link to={{ pathname: '/settings/', state: { modal: true } }}>
            <IoIosSettings />
          </Link>
        </Header>
        <Switch>
          <Route exact path="/" component={MainView} />
          <Route exact path="/settings/" component={SettingsView} />
        </Switch>
      </Router>
    </Container>
  )
}

const Container = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  width: 100%;
  position: absolute;
`
