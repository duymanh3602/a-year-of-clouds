import { useRef, useState } from 'react'
import ConversationList from '../conversation-list'
import MessageList from '../message-list'
import './Messenger.css'

const Messenger = () => {
  const [viewing, setViewing] = useState(null)
  const scrollRef = useRef<HTMLDivElement>(null)
  const [reachTop, setReachTop] = useState(false)
  const [isBottom, setIsBottom] = useState(false)

  const handleOnScroll = () => {
    if (scrollRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = scrollRef.current
      if (scrollTop + clientHeight === scrollHeight) {
        setIsBottom(true)
      } else {
        setIsBottom(false)
      }

      if (scrollTop === 0) {
        setReachTop(true)
      } else {
        setReachTop(false)
      }
    }
  }

  return (
    <div className='messenger'>
      <div className='scrollable sidebar'>
        <ConversationList setViewing={setViewing} />
      </div>

      <div className='scrollable content' ref={scrollRef} onScroll={handleOnScroll}>
        <MessageList
          view={viewing}
          reachedTop={reachTop}
          setReachedTop={setReachTop}
          isBottom={isBottom}
          setIsBottom={setIsBottom}
        />
      </div>
    </div>
  )
}

export default Messenger
