import { useState } from 'react'
import './Compose.css'
import { sendMessage } from '~/app/api/api'

const Compose = (props) => {
  const [message, setMessage] = useState('')
  const { viewing } = props

  const handleSendMessage = (e) => {
    if (!viewing) {
      e.target.value = 'Please select a conversation to send a message'
      return
    }
    if (e.key === 'Enter') {
      const newMessage = {
        id: viewing?.id,
        content: message
      }
      sendMessage(newMessage.id, newMessage.content)
      e.target.value = ''
    }
  }

  return (
    <div className='compose'>
      <input
        type='text'
        className='compose-input'
        placeholder='Type a message, @name'
        onChange={(e) => setMessage(e.target.value)}
        onKeyDown={(e) => handleSendMessage(e)}
      />

      {props.rightItems}
    </div>
  )
}

export default Compose
