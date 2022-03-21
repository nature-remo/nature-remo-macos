import React from 'react';
import { IoIosPower, IoIosSettings } from 'react-icons/io';
// import 'react-tippy/dist/tippy.css'
// import { Tooltip } from 'react-tippy'
import { HashRouter as Router, Link, Route, Routes } from 'react-router-dom';
import styled from 'styled-components';
import Header from './components/Header';
import MainView from './containers/MainView';
import SettingsView from './containers/SettingsView';

export default function App() {
  return (
    <Container>
      <Router>
        <Header>
          <IoIosPower />
          <Link to={{ pathname: '/settings/' }}>
            <IoIosSettings />
          </Link>
        </Header>
        <Routes>
          <Route path="/" element={MainView} />
          <Route path="/settings/" element={SettingsView} />
        </Routes>
      </Router>
    </Container>
  );
}

const Container = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  width: 100%;
  position: absolute;
`;
