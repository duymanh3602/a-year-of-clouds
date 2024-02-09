import { useRef, useState } from 'react'
import { Button, Card, Form } from 'react-bootstrap'
import { useAuth } from '../context/AuthProvider'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'

const UpdatePassword = () => {
  const { updatePassword } = useAuth()
  const passwordRef = useRef(null)
  const confirmPasswordRef = useRef(null)
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!passwordRef.current?.value || !confirmPasswordRef.current?.value) {
      toast.error('Please fill all the fields')
      return
    }
    if (passwordRef.current.value !== confirmPasswordRef.current.value) {
      toast.error("Passwords doesn't match. Try again")
      return
    }
    try {
      setLoading(true)
      const { error } = await updatePassword(passwordRef.current.value)
      if (!error) {
        navigate('/')
      }
    } catch (error) {
      toast.error('Error in Updating Password. Try again')
    }
    setLoading(false)
  }

  return (
    <>
      <Card>
        <Card.Body>
          <h2 className='text-center mb-4'>Update Password</h2>
          <Form onSubmit={handleSubmit}>
            <Form.Group id='password'>
              <Form.Label>Password</Form.Label>
              <Form.Control type='password' ref={passwordRef} required />
            </Form.Group>
            <Form.Group id='confirm-password'>
              <Form.Label>Confirm Password</Form.Label>
              <Form.Control type='password' ref={confirmPasswordRef} required />
            </Form.Group>
            <div className='text-center mt-2'>
              <Button disabled={loading} type='submit' className='w-50'>
                Update
              </Button>
            </div>
          </Form>
        </Card.Body>
      </Card>
    </>
  )
}

export default UpdatePassword
