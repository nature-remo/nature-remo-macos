import { History } from 'history';
import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import TemperatureBarIndicator from '../components/TemperatureBarIndicator';
import TemperatureController from '../components/TemperatureController';
import TemperatureDisplay from '../components/TemperatureDisplay';
import { useAircon } from '../hooks/useAircon';
import { useLocalStorage } from '../hooks/useLocalStorage';

const MainView: React.FC<{ history: History }> = ({ history }) => {
  const [token] = useLocalStorage('token');
  const [aircon, room, setAirconData, applyAirconData] = useAircon(token || '');

  const [isModifyingTemperature, setIsModifyingTemperature] = useState<boolean>(
    false,
  );
  const [isSyncingWithServer, setIsSyncingWithServer] = useState<boolean>(
    false,
  );
  const [targetValue, setTargetValue] = useState<number>(0);

  // Settings view
  useEffect(() => {
    if (!token) {
      history.push('/settings');
    }
  }, [token, history]);

  useEffect(() => {
    setTargetValue(aircon.temperature);
  }, [aircon.temperature]);

  function onEnterModifyState() {
    setIsModifyingTemperature(true);
  }

  function onHandleMove(value: number) {
    const targetValue = Math.round(value * aircon.maxTemperature);
    setTargetValue(targetValue);
  }

  async function onLeaveHandle() {
    setIsModifyingTemperature(false);
    if (aircon.temperature !== targetValue) {
      setIsSyncingWithServer(true);
      setAirconData((prevState) => ({
        ...prevState,
        temperature: targetValue,
      }));
      await applyAirconData();
      setIsSyncingWithServer(false);
    }
  }

  return (
    <Container>
      <TemperatureBarIndicator
        value={targetValue}
        maxValue={aircon.maxTemperature}
        mode={aircon.mode}
        isModifying={isModifyingTemperature}
      />
      <TemperatureDisplay
        temperature={room.temperature}
        targetTemperature={targetValue}
        isSyncing={isSyncingWithServer}
      />
      <TemperatureController
        onEnter={onEnterModifyState}
        onLeave={onLeaveHandle}
        onValueChanged={onHandleMove}
      />
    </Container>
  );
};

export default MainView;

const Container = styled.div`
  flex-grow: 1;
  position: relative;
  background-color: #f3f3f3;
`;
