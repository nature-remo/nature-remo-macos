import React, { useState } from 'react'
import styled from 'styled-components'
import { History } from 'history'

const SettingsView: React.FC<{ history: History }> = ({ history }) => {
  const [token, setToken] = useState<string>(
    localStorage.getItem('token') || ''
  )

  function onSave(e: React.MouseEvent) {
    e.stopPropagation()
    localStorage.setItem('token', token)
    history.goBack()
  }

  return (
    <Container>
      <InputForm
        type="text"
        onChange={(e) => setToken(e.target.value)}
        defaultValue={token}
      />
      <SubmitButton onClick={onSave}>Save</SubmitButton>
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
