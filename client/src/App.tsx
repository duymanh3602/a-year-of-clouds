import { Container } from 'react-bootstrap'
import { Navigate, Route, Routes } from 'react-router-dom'
import AuthRoute from './components/AuthRoute'
import Chat from './app/Chat'
import Login from './auth/Login'
import PasswordReset from './auth/PasswordReset'
import Register from './auth/Register'
import UpdatePassword from './auth/UpdatePassword'

const App = () => {
  return (
    <>
      <div className='w-100'>
        <Routes>
          <Route element={<AuthRoute />}>
            <Route path='/' element={<Navigate to={'/chat'} />} />
            <Route path='/chat' element={<Chat />} />
          </Route>
          <Route path='/register' element={<Register />} />
          <Route path='/login' element={<Login />} />
          <Route path='/password-reset' element={<PasswordReset />} />
          <Route path='/update-password' element={<UpdatePassword />} />
        </Routes>
      </div>
    </>
  )
}

export default App
