import { useEffect } from 'react'
import shave from 'shave'

import './ConversationListItem.css'
import { createNewChat, getIsConnected } from '~/app/api/api'
import { toast } from 'react-toastify'

const ConversationListItem = (props) => {
  useEffect(() => {
    shave('.conversation-snippet', 20)
  })

  const { setViewing } = props
  const { photo, name, text, id, is_find, is_accepted, receive_id } = props.data

  return (
    <div
      className='conversation-list-item'
      onClick={() => {
        if (is_find) {
          getIsConnected(id).then((response) => {
            if (response === 'NOT_CONNECTED') {
              toast.success('Created new chat, please wait for the other user to accept the chat.')
              createNewChat(id).then((res) => {
                const ele = {
                  id: res?.id,
                  name: name,
                  is_accepted: res?.is_accepted,
                  receive_id: res?.receive_id
                }
                setViewing(ele)
                return
              })
            } else {
              const ele = {
                id: response?.id,
                name: name,
                is_accepted: response?.is_accepted,
                receive_id: response?.receive_id
              }
              setViewing(ele)
              return
            }
          })
        }
        const ele = {
          id: id,
          name: name,
          is_accepted: is_accepted,
          receive_id: receive_id
        }
        setViewing(ele)
      }}
    >
      <img className='conversation-photo' src={photo} alt='conversation' />
      <div className='conversation-info'>
        <h1 className='conversation-title'>{name}</h1>
        <p className='conversation-snippet'>{text}</p>
      </div>
    </div>
  )
}

export default ConversationListItem
