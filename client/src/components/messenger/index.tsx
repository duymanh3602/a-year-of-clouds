import ConversationList from '../conversation-list'
import MessageList from '../message-list'
import './Messenger.css'

const Messenger = (props) => {
  return (
    <div className='messenger'>
      <div className='scrollable sidebar'>
        <ConversationList />
      </div>

      <div className='scrollable content'>
        <MessageList />
      </div>
    </div>
  )
}

export default Messenger
