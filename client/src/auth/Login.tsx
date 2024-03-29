import { useRef, useState } from 'react'
import { Alert, Button, Card, Form } from 'react-bootstrap'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthProvider'
import { toast } from 'react-toastify'

const Login = () => {
  const emailRef = useRef(null)
  const passwordRef = useRef(null)
  const [errorMsg, setErrorMsg] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  const { login, user } = useAuth()

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      setErrorMsg('')
      setLoading(true)
      if (!passwordRef.current?.value || !emailRef.current?.value) {
        toast.error('Please fill all the fields')
        return
      }
      const {
        data: { user, session },
        error
      } = await login(emailRef.current.value, passwordRef.current.value)
      if (error) toast.error(error.message)
      if (user && session) navigate('/')
    } catch (error) {
      toast.error('Error in Logging In')
    }
    setLoading(false)
  }

  return (
    <div className='d-flex justify-content-center align-items-center' style={{ height: '100vh' }}>
      <Card style={{ width: '500px' }}>
        <Card.Body>
          <h2 className='text-center mb-4 w-45'>Login</h2>
          <Form onSubmit={handleSubmit}>
            <Form.Group id='email'>
              <Form.Label>Email</Form.Label>
              <Form.Control type='email' ref={emailRef} required />
            </Form.Group>
            <Form.Group id='password'>
              <Form.Label>Password</Form.Label>
              <Form.Control type='password' ref={passwordRef} required />
            </Form.Group>
            <div className='text-center mt-2'>
              <Button disabled={loading} type='submit' className='w-50'>
                Login
              </Button>
            </div>
          </Form>
        </Card.Body>
        <div className='w-100 text-center mt-2'>
          New User? <Link to={'/register'}>Register</Link>
        </div>
        <div className='w-100 text-center mt-2'>
          Forgot Password? <Link to={'/password-reset'}>Click Here</Link>
        </div>
      </Card>
    </div>
  )
}

export default Login
