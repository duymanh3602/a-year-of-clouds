import { useState, useEffect } from 'react'
import ConversationSearch from '../conversation-search'
import ConversationListItem from '../conversation-list-item'
import Toolbar from '../toolbar'
import ToolbarButton from '../toolbar-button'

import { getConversationList, findUser } from '~/app/api/api'

import './ConversationList.css'

const ConversationList = (props) => {
  const { setViewing } = props
  const [searchWord, setSearchWord] = useState('')
  const [conversations, setConversations] = useState([])
  const [showWarning, setShowWarning] = useState(false)
  const [loading, setLoading] = useState(true)
  useEffect(() => {
    getConversations()
  }, [])

  useEffect(() => {
    if (searchWord.length > 2) {
      setShowWarning(false)
      getSearchedUser(searchWord).then((response) => {
        const newConversations = response?.map((result) => {
          return {
            id: result.id,
            photo: result.avatar_url,
            name: result.name,
            is_find: true,
            text: result.last_chat,
            is_accepted: result.is_accepted,
            receive_id: result.receive_id
          }
        })
        setConversations(newConversations)
      })
    } else if (searchWord.length === 0) {
      setShowWarning(false)
      getConversations()
    } else {
      setShowWarning(true)
    }
  }, [searchWord])

  const getConversations = () => {
    setLoading(true)
    getConversationList()
      .then((response) => {
        const newConversations = response?.map((result) => {
          return {
            id: result.id,
            photo: result.avatar_url,
            name: result.name,
            is_find: false,
            text: result.last_chat,
            is_accepted: result.is_accepted,
            receive_id: result.receive_id
          }
        })
        setConversations(newConversations)
      })
      .then(() => {
        setLoading(false)
        setViewing(conversations[0]?.id)
      })
  }

  const getSearchedUser = async (word: string) => {
    if (word.length < 3) {
      return []
    }
    const response = await findUser(word)
    return response
  }

  return (
    <div className='conversation-list'>
      <Toolbar
        title='Messenger'
        leftItems={[<ToolbarButton key='cog' icon='ion-ios-cog' />]}
        rightItems={[<ToolbarButton key='add' icon='ion-ios-add-circle-outline' />]}
      />
      <ConversationSearch setSearchWord={setSearchWord} />
      {showWarning && !loading && (
        <div className='d-flex justify-content-center'>Please enter at least 3 characters</div>
      )}
      {conversations?.map((conversation) => (
        <ConversationListItem key={conversation?.name} data={conversation} setViewing={setViewing} />
      ))}
      {conversations?.length === 0 && !loading && (
        <div className='d-flex justify-content-center'>No conversation found</div>
      )}
    </div>
  )
}

export default ConversationList
