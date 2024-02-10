import { useState, useEffect } from 'react'
import ConversationSearch from '../conversation-search'
import ConversationListItem from '../conversation-list-item'
import Toolbar from '../toolbar'
import ToolbarButton from '../toolbar-button'

import './ConversationList.css'
import axios from 'axios'

const ConversationList = (props) => {
  const [conversations, setConversations] = useState([])
  useEffect(() => {
    getConversations()
  }, [])

  const getConversations = () => {
    axios.get('https://randomuser.me/api/?results=5').then((response) => {
      const newConversations = response.data.results.map((result) => {
        return {
          photo: result.picture.large,
          name: `${result.name.first} ${result.name.last}`,
          text: 'Hello world!'
        }
      })
      setConversations([...conversations, ...newConversations])
    })
  }

  return (
    <div className='conversation-list'>
      <Toolbar
        title='Messenger'
        leftItems={[<ToolbarButton key='cog' icon='ion-ios-cog' />]}
        rightItems={[<ToolbarButton key='add' icon='ion-ios-add-circle-outline' />]}
      />
      <ConversationSearch />
      {conversations.map((conversation) => (
        <ConversationListItem key={conversation?.name} data={conversation} />
      ))}
    </div>
  )
}

export default ConversationList
