import { useEffect, useRef, useState } from 'react'
import Compose from '../compose'
import Toolbar from '../toolbar'
import ToolbarButton from '../toolbar-button'
import Message from '../message'
import moment from 'moment'
import { getCurrentUserId } from '~/utils/localStorage'

import './MessageList.css'

import { getConversation, getConversationWithOffset, updateChatConfirm } from '~/app/api/api'
import { supabase } from '~/utils/supabase'
import { RealtimeChannel } from '@supabase/supabase-js'
import LastChatScroll from '../scroll-view/LastChatScroll'
import { Button } from 'react-bootstrap'
import { toast } from 'react-toastify'

const MessageList = (props) => {
  const { view, reachedTop, setReachedTop, isBottom } = props
  const MY_USER_ID = view ? getCurrentUserId() : 'apple'
  const [channels, setChannels] = useState<RealtimeChannel>()
  const [messages, setMessages] = useState([])
  const [isEnd, setIsEnd] = useState(false)
  const [messageList, setMessageList] = useState([])
  const [isFirst, setIsFirst] = useState(true) // tự động scroll xuống dưới cùng khi lần đầu vào chat
  const [oldFirstId, setOldFirstId] = useState('') // id của tin nhắn đầu tiên trong list tin nhắn cũ
  const firstMessageRef = useRef<HTMLDivElement | null>()
  const [tempVar, setTempVar] = useState(false)

  useEffect(() => {
    getMessages()
    if (!view) return
    setIsFirst(true)
    setIsEnd(false)
    const channel = supabase
      .channel('custom-all-channel')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'message_content',
          filter: `connect_id=eq.${view?.id}`
        },
        (payload) => {
          const newMessage = {
            id: payload.new.id,
            author: payload.new.send_by_from ? view?.from_id : view?.receive_id,
            message: payload.new.content,
            timestamp: payload.new.sent_date
          }
          setMessages((prevMessages) => [...prevMessages, newMessage])
        }
      )
      .subscribe()
    setChannels(channel)

    return () => {
      if (channels) {
        supabase.removeChannel(channels)
      }
    }
  }, [view])

  useEffect(() => {
    if (reachedTop && !isEnd) {
      setTempVar(true)
      setReachedTop(false)
      getConversationWithOffset(view?.id, messages.length).then((response) => {
        if (response?.length === 0) {
          setIsEnd(true)
          return
        }
        const data = response?.map((result) => {
          return {
            id: result.id,
            author: result.send_by_from ? result.chat_accept.from_id : result.chat_accept.receive_id,
            message: result.content,
            timestamp: result.sent_date
          }
        })
        setOldFirstId(messages[0]?.id)
        setMessages((prevMessages) => [...data, ...prevMessages])
      })
    }
  }, [reachedTop])

  useEffect(() => {
    if (!isBottom && tempVar) {
      firstMessageRef.current?.scrollIntoView({
        behavior: 'instant',
        block: 'start'
      })
      setTempVar(false)
    }
  }, [messageList])

  useEffect(() => {
    renderMessages()
  }, [messages])

  const getMessages = () => {
    view &&
      getConversation(view?.id).then((response) => {
        const data = response?.map((result) => {
          return {
            id: result.id,
            author: result.send_by_from ? result.chat_accept.from_id : result.chat_accept.receive_id,
            message: result.content,
            timestamp: result.sent_date
          }
        })
        setMessages(data)
      })
  }

  const renderMessages = () => {
    let i = 0
    const messageCount = messages.length
    const tempMessages = []

    while (i < messageCount) {
      const previous = messages[i - 1]
      const current = messages[i]
      const next = messages[i + 1]
      const isMine = current.author === MY_USER_ID
      const currentMoment = moment(current.timestamp)
      let prevBySameAuthor = false
      let nextBySameAuthor = false
      let startsSequence = true
      let endsSequence = true
      let showTimestamp = true

      if (previous) {
        const previousMoment = moment(previous.timestamp)
        const previousDuration = moment.duration(currentMoment.diff(previousMoment))
        prevBySameAuthor = previous.author === current.author

        if (prevBySameAuthor && previousDuration.as('hours') < 1) {
          startsSequence = false
        }

        if (previousDuration.as('hours') < 1) {
          showTimestamp = false
        }
      }

      if (next) {
        const nextMoment = moment(next.timestamp)
        const nextDuration = moment.duration(nextMoment.diff(currentMoment))
        nextBySameAuthor = next.author === current.author

        if (nextBySameAuthor && nextDuration.as('hours') < 1) {
          endsSequence = false
        }
      }

      current?.id === oldFirstId && tempMessages.push(<div ref={firstMessageRef} />)

      tempMessages.push(
        <Message
          key={i}
          isMine={isMine}
          startsSequence={startsSequence}
          endsSequence={endsSequence}
          showTimestamp={showTimestamp}
          data={current}
        />
      )

      // Proceed to the next message.
      i += 1
    }
    if (view?.is_accepted === null) {
      if (view?.receive_id !== MY_USER_ID) {
        tempMessages.push(
          <div className='d-flex justify-content-center'>Please wait for the other user to accept the chat.</div>
        )
      } else {
        tempMessages.push(
          <>
            <div className='d-flex justify-content-center'>Please confirm the chat.</div>
            <div className='d-flex justify-content-center gap-2'>
              <Button
                onClick={() => {
                  updateChatConfirm(view?.id, true)
                    .then((response) => {
                      toast.success('You have accepted the chat.')
                    })
                    .catch((error) => {
                      toast.error(error)
                    })
                }}
              >
                Accept
              </Button>
              <Button
                onClick={() => {
                  updateChatConfirm(view?.id, false)
                    .then(() => {
                      toast.success('You have rejected the chat.')
                    })
                    .catch((error) => {
                      toast.error(error)
                    })
                }}
              >
                Block
              </Button>
            </div>
          </>
        )
      }
    } else if (view?.is_accepted === false) {
      if (view?.receive_id !== MY_USER_ID) {
        tempMessages.push(<div className='d-flex justify-content-center'>The other user has rejected the chat.</div>)
      } else {
        tempMessages.push(<div className='d-flex justify-content-center'>You have rejected the chat.</div>)
      }
    }
    tempMessages.push(<LastChatScroll isFirst={isFirst} isBottom={isBottom} setIsFirst={setIsFirst} />)

    setMessageList(tempMessages)
  }

  return (
    <div className='message-list'>
      <Toolbar
        title={view?.name}
        rightItems={[
          <ToolbarButton key='info' icon='ion-ios-information-circle-outline' />,
          <ToolbarButton key='video' icon='ion-ios-videocam' />,
          <ToolbarButton key='phone' icon='ion-ios-call' />
        ]}
      />

      <div className='message-list-container'>{messageList}</div>

      <Compose
        viewing={view}
        rightItems={[
          <ToolbarButton key='photo' icon='ion-ios-camera' />,
          <ToolbarButton key='image' icon='ion-ios-image' />,
          <ToolbarButton key='audio' icon='ion-ios-mic' />,
          <ToolbarButton key='money' icon='ion-ios-card' />,
          <ToolbarButton key='games' icon='ion-logo-game-controller-b' />,
          <ToolbarButton key='emoji' icon='ion-ios-happy' />
        ]}
      />
    </div>
  )
}

export default MessageList
