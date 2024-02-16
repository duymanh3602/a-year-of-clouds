import { useEffect, useState } from 'react'
import Compose from '../compose'
import Toolbar from '../toolbar'
import ToolbarButton from '../toolbar-button'
import Message from '../message'
import moment from 'moment'
import { getCurrentUserId } from '~/utils/localStorage'

import './MessageList.css'

import { getConversation } from '~/app/api/api'
// import { anon, supabase } from '~/utils/supabase'
import { RealtimeChannel } from '@supabase/supabase-js'

const MessageList = (props: { view: unknown }) => {
  const { view } = props
  const MY_USER_ID = view ? getCurrentUserId() : 'apple'
  // const [messages, setMessages] = useState([])
  // const [channels, setChannels] = useState<RealtimeChannel>()

  const [messages, setMessages] = useState([])
  const [newMessage, setNewMessage] = useState('')

  // useEffect(() => {
  //   const chatSubscription = supabase
  //     .from('chat')
  //     .on('INSERT', (payload) => {
  //       setMessages((prevMessages) => [...prevMessages, payload.new]);
  //     })
  //     .subscribe();

  //   return () => chatSubscription.unsubscribe();
  // }, []);

  // const sendMessage = async () => {
  //   try {
  //     const { data, error } = await supabase.from('chat').insert({
  //       sender: 'YOUR_USER_ID', // Replace with your user ID
  //       content: newMessage,
  //     });

  //     if (error) {
  //       console.error('Error sending message:', error);
  //     } else {
  //       setNewMessage('');
  //     }
  //   } catch (error) {
  //     console.error('Error:', error);
  //   }
  // };

  useEffect(() => {
    console.log('changed!!!', messages)
  }, [messages])
  // :id=eq.${view?.id}
  // useEffect(() => {
  //   const channel = anon
  //     .channel(`chat_accept`)
  //     .on(
  //       'postgres_changes',
  //       {
  //         event: '*',
  //         schema: 'public',
  //         table: 'message_content',
  //         // filter: `id=eq.${view?.id}`
  //       },
  //       (payload) => {
  //         setMessages((prevMessages) => [...prevMessages, payload.new])
  //       }
  //     )
  //     .subscribe()
  //   return () => {
  //     channel.unsubscribe()
  //   }
  // }, [])

  useEffect(() => {
    getMessages()
  }, [view])

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

    return tempMessages
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

      <div className='message-list-container'>{renderMessages()}</div>

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
