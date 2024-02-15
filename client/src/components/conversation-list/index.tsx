import { useState, useEffect } from 'react'
import ConversationSearch from '../conversation-search'
import ConversationListItem from '../conversation-list-item'
import Toolbar from '../toolbar'
import ToolbarButton from '../toolbar-button'

import { getConversationList, findUser } from '~/app/api/api'

import './ConversationList.css'

// TODO: Recheck logic for search, it's not working as expected, list is showing user_id not conversation_id
// LOGIC: If searchWord is empty, show all conversations, if searchWord is less than 3 characters, show warning, if searchWord is more than 3 characters, show search result
// when showing search result, add logic to check whether the user is already in the conversation list or not
const ConversationList = (props) => {
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
        const newConversations = response.map((result) => {
          return {
            id: result.id,
            photo: result.avatar_url,
            name: result.name,
            text: result.last_chat
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
        const newConversations = response.map((result) => {
          return {
            id: result.id,
            photo: result.avatar_url,
            name: result.name,
            text: result.last_chat
          }
        })
        setConversations(newConversations)
      })
      .then(() => {
        setLoading(false)
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
      {conversations?.map((conversation) => <ConversationListItem key={conversation?.name} data={conversation} />)}
      {conversations?.length === 0 && !loading && (
        <div className='d-flex justify-content-center'>No conversation found</div>
      )}
    </div>
  )
}

export default ConversationList
