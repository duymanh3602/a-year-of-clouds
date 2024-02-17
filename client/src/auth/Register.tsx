import { useRef, useState } from 'react'
import { Button, Card, Form } from 'react-bootstrap'
import { Link } from 'react-router-dom'
import { supabase } from '../utils/supabase'
import { toast } from 'react-toastify'

const Register = () => {
  const emailRef = useRef(null)
  const passwordRef = useRef(null)
  const confirmPasswordRef = useRef(null)
  const [loading, setLoading] = useState(false)

  const register = (email: string, password: string) => supabase.auth.signUp({ email, password })

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!passwordRef.current?.value || !emailRef.current?.value || !confirmPasswordRef.current?.value) {
      toast.error('Please fill all the fields')
      return
    }
    if (passwordRef.current.value !== confirmPasswordRef.current.value) {
      toast.error("Passwords doesn't match. Try again")
      return
    }
    try {
      setLoading(true)
      const { data, error } = await register(emailRef.current.value, passwordRef.current.value)
      if (!error && data) {
        toast.success('Account Created Successfully')
      }
    } catch (error) {
      toast.error('Error in Registering')
    }
    setLoading(false)
  }

  return (
    <div className='d-flex justify-content-center align-items-center flex-column' style={{ height: '100vh' }}>
      <Card style={{ width: '500px' }}>
        <Card.Body>
          <h2 className='text-center mb-4'>Register</h2>
          <Form onSubmit={handleSubmit}>
            <Form.Group id='email'>
              <Form.Label>Email</Form.Label>
              <Form.Control type='email' ref={emailRef} required />
            </Form.Group>
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
                Register
              </Button>
            </div>
          </Form>
        </Card.Body>
      </Card>
      <div className='w-100 text-center mt-2'>
        Already a User? <Link to={'/login'}>Login</Link>
      </div>
    </div>
  )
}

export default Register
