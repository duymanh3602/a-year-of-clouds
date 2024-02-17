import { useState, useEffect } from 'react'
import ConversationSearch from '../conversation-search'
import ConversationListItem from '../conversation-list-item'
import Toolbar from '../toolbar'
import ToolbarButton from '../toolbar-button'

import { getConversationList, findUser } from '~/app/api/api'

import './ConversationList.css'
import { Button, Form, Modal } from 'react-bootstrap'
import { supabase } from '~/utils/supabase'
import { toast } from 'react-toastify'
import { getCurrentUserMetadata, getCurrentUsername } from '~/utils/localStorage'
import { useAuth } from '~/context/AuthProvider'

const updateUsername = async (name: string, avatar_url: string) => {
  const { error } = await supabase.auth.updateUser({ data: { full_name: name, avatar_url: avatar_url } })
  if (error) {
    toast.error('Error updating user')
  }
  toast.success('User updated')
}

const ConversationList = (props) => {
  const { signOut } = useAuth()
  const { setViewing } = props
  const [searchWord, setSearchWord] = useState('')
  const [conversations, setConversations] = useState([])
  const [showWarning, setShowWarning] = useState(false)
  const [loading, setLoading] = useState(true)
  const [showSettings, setShowSettings] = useState(false)
  const [username, setUsername] = useState(getCurrentUserMetadata()?.full_name ?? '')
  const [avatarUrl, setAvatarUrl] = useState(getCurrentUserMetadata()?.avatar_url ?? '')
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
            receive_id: result.receive_id,
            from_id: result.from_id
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
            receive_id: result.receive_id,
            from_id: result.from_id
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

  const handleCloseModal = () => {
    setShowSettings(false)
  }

  const handleUpdateUsername = () => {
    updateUsername(username, avatarUrl)
    setShowSettings(false)
  }

  return (
    <div className='conversation-list'>
      <Toolbar
        title='Messenger'
        leftItems={[<ToolbarButton key='cog' icon='ion-ios-cog' click={showSettings} setClick={setShowSettings} />]}
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

      <div className='modal' id='modal'>
        <Modal centered show={showSettings} onHide={handleCloseModal}>
          <Modal.Header closeButton>
            <Modal.Title>Settings</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form>
              <Form.Group className='mb-3' controlId='exampleForm.ControlInput1'>
                <Form.Label>Your name</Form.Label>
                <Form.Control
                  type='text'
                  defaultValue={getCurrentUsername()}
                  autoFocus
                  onChange={(e) => {
                    setUsername(e.target.value)
                  }}
                />
                <Form.Label>Avatar Url</Form.Label>
                <Form.Control
                  type='text'
                  defaultValue={getCurrentUserMetadata()?.avatar_url}
                  onChange={(e) => {
                    setAvatarUrl(e.target.value)
                  }}
                />
              </Form.Group>
            </Form>
          </Modal.Body>
          <Modal.Footer>
            <Button variant='secondary' onClick={handleCloseModal}>
              Close
            </Button>
            <Button variant='secondary' onClick={signOut}>
              Logout
            </Button>
            <Button variant='primary' onClick={handleUpdateUsername}>
              Save Changes
            </Button>
          </Modal.Footer>
        </Modal>
      </div>
    </div>
  )
}

export default ConversationList
