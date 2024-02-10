import { useAuth } from '../context/AuthProvider'
import Messenger from '../components/messenger'

const Chat = () => {
  const { user, signOut } = useAuth()

  return (
    <>
      <Messenger />
    </>
  )
}

export default Chat
