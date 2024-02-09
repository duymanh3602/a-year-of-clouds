import { Container } from 'react-bootstrap'
import { Route, Routes } from 'react-router-dom'
import AuthRoute from './components/AuthRoute'
import Home from './app/Home'
import Login from './auth/Login'
import PasswordReset from './auth/PasswordReset'
import Register from './auth/Register'
import UpdatePassword from './auth/UpdatePassword'

const App = () => {
  return (
    <>
      <Container className='d-flex align-items-center justify-content-center' style={{ minHeight: '100vh' }}>
        <div className='w-100' style={{ maxWidth: '400px' }}>
          <Routes>
            <Route element={<AuthRoute />}>
              <Route path='/' element={<Home />} />
              <Route path='/home' element={<Home />} />
            </Route>
            <Route path='/register' element={<Register />} />
            <Route path='/login' element={<Login />} />
            <Route path='/password-reset' element={<PasswordReset />} />
            <Route path='/update-password' element={<UpdatePassword />} />
          </Routes>
        </div>
      </Container>
    </>
  )
}

export default App
