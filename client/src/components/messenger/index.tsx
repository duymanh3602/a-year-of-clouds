import { useState } from 'react'
import ConversationList from '../conversation-list'
import MessageList from '../message-list'
import './Messenger.css'

const Messenger = () => {
  const [viewing, setViewing] = useState(null)

  return (
    <div className='messenger'>
      <div className='scrollable sidebar'>
        <ConversationList setViewing={setViewing} />
      </div>

      <div className='scrollable content'>
        <MessageList view={viewing} />
      </div>
    </div>
  )
}

export default Messenger
