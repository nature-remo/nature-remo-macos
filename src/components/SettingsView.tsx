import React, { useState } from 'react'
import styled from 'styled-components'
import { Link } from 'react-router-dom'

const SettingsView: React.FC = () => {
  const [token, setToken] = useState<string>(
    localStorage.getItem('token') || ''
  )

  function onSave() {
    console.log(token)
    localStorage.setItem('token', token)
  }

  return (
    <Container>
      <InputForm
        type="text"
        onChange={(e) => setToken(e.target.value)}
        defaultValue={token}
      />
      <SubmitButton onClick={onSave}>Save</SubmitButton>
      <Link to="/">Close</Link>
    </Container>
  )
}

export default SettingsView

const Container = styled.div`
  padding: 15px;
  position: relative;
`

const InputForm = styled.input`
  width: 100%;
  padding: 10px;
  font-size: 12px;
  outline: none;
`

const SubmitButton = styled.button`
  margin-top: 5px;
  padding: 15px 30px;
  background-color: deepskyblue;
  color: white;
  border: none;
  border-radius: 2px;
`
