import { Button } from 'react-bootstrap'
import { useAuth } from '../context/AuthProvider'

const Home = () => {
  const { user, signOut } = useAuth()

  return (
    <>
      <div>You are logged in and your email address is {user.email}</div>
      <Button onClick={signOut}>Logout</Button>
    </>
  )
}

export default Home
