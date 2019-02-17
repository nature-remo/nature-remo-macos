import React, { useState } from 'react'
import styled from 'styled-components'
import { Link } from 'react-router-dom'

export default function SettingsView() {
  const [token, setToken] = useState(() => localStorage.getItem('token'))

  function onSave() {
    console.log(token)
    localStorage.setItem('token', token)
  }

  return (
    <Container>
      <input
        type="text"
        onChange={(e) => setToken(e.target.value)}
        defaultValue={token}
      />
      <div>{token}</div>
      <button onClick={onSave}>Save</button>
      <Link to="/">Close</Link>
    </Container>
  )
}

const Container = styled.div`
  flex-grow: 1;
  position: relative;
`
