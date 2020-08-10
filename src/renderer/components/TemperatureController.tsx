import React, { useState } from 'react';
import styled from 'styled-components';

type Props = {
  onEnter: () => void;
  onLeave: () => void;
  onValueChanged: (value: number) => void;
};

const TemperatureController: React.FC<Props> = (props) => {
  const [isDragging, setDragging] = useState<boolean>(false);

  function sendValue(event: React.MouseEvent) {
    const { clientY } = event;
    const clientHeight = (event.target as HTMLDivElement).clientHeight;
    const offsetY = 56; // same as title bar height
    props.onValueChanged(1.0 - (clientY - offsetY) / clientHeight);
  }

  function onMouseDown(event: React.MouseEvent) {
    props.onEnter();
    sendValue(event);
    setDragging(true);
  }

  function onMouseMove(event: React.MouseEvent) {
    if (isDragging) {
      sendValue(event);
    }
  }

  function onMouseUp() {
    setDragging(false);
    props.onLeave();
  }

  return (
    <Container
      onMouseDown={onMouseDown}
      onMouseMove={onMouseMove}
      onMouseUp={onMouseUp}
    />
  );
};

export default TemperatureController;

const Container = styled.div`
  position: absolute;
  width: 100%;
  height: 100%;
`;
