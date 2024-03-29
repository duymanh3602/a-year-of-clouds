import { useRef, useState } from 'react'
import { useAuth } from '../context/AuthProvider'
import { Button, Card, Form } from 'react-bootstrap'
import { Link } from 'react-router-dom'
import { toast } from 'react-toastify'

const PasswordReset = () => {
  const { passwordReset } = useAuth()
  const emailRef = useRef(null)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      setLoading(true)
      const { error } = await passwordReset(emailRef.current?.value)
      if (!error) {
        toast.success('Password Reset Link Sent')
      }
    } catch (e) {
      console.error(e)
    }
    setLoading(false)
  }

  return (
    <div className='d-flex justify-content-center align-items-center' style={{ height: '100vh' }}>
      <Card style={{ width: '500px' }}>
        <Card.Body>
          <h2 className='text-center mb-4'>Reset Password</h2>
          <Form onSubmit={handleSubmit}>
            <Form.Group id='email'>
              <Form.Label>Email</Form.Label>
              <Form.Control type='email' ref={emailRef} required />
            </Form.Group>
            <div className='text-center mt-2'>
              <Button disabled={loading} type='submit' className='w-50'>
                Send Reset Link
              </Button>
            </div>
          </Form>
        </Card.Body>
        <div className='w-100 text-center mt-2'>
          Back to Login? <Link to={'/login'}>Login</Link>
        </div>
      </Card>
    </div>
  )
}

export default PasswordReset
