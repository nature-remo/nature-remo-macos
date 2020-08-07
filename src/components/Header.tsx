import React from 'react';
import { IconContext } from 'react-icons';
import styled from 'styled-components';

const Header: React.FC = ({ children }) => (
  <Container>
    <Title>Nature Remo</Title>
    <Icons>
      <IconContext.Provider value={{ color: 'gray', size: '20px' }}>
        {children}
      </IconContext.Provider>
    </Icons>
  </Container>
);

export default Header;

const Container = styled.div`
  position: relative;
  height: 40px;
  background: linear-gradient(#ececec, #d6d6d6);
  -webkit-app-region: drag;
`;

const Title = styled.div`
  position: absolute;
  width: 100%;
  padding-top: 12px;
  text-align: center;
  font-family: BlinkMacSystemFont, sans-serif;
  font-weight: 500;
  font-size: 12px;
  color: grey;
  user-select: none;
`;

const Icons = styled.div`
  position: absolute;
  right: 0;
  top: 0;
  display: flex;
  flex-direction: row;
  align-items: center;
  height: 100%;

  a {
    padding-right: 10px;
  }
`;
