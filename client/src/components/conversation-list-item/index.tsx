import { useEffect } from 'react'
import shave from 'shave'

import './ConversationListItem.css'

const ConversationListItem = (props) => {
  useEffect(() => {
    shave('.conversation-snippet', 20)
  })

  const { setViewing } = props
  const { photo, name, text, id } = props.data

  return (
    <div
      className='conversation-list-item'
      onClick={() => {
        const ele = {
          id: id,
          name: name
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
