import React, { useState } from 'react'
// import { useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import './login.css'
import Logo from '../../assets/logo.png'
import utils from '../../utils'
import api from '../../api/apiCalls'
import 'bootstrap/dist/css/bootstrap.min.css'

const Login = () => {
  // const navigate = useNavigate()
  const [username, setUser] = useState('')
  const [password, setPassword] = useState('')

  const handleLogin = async event => {
    event.preventDefault()

    const userData = {
      username,
      password
    }
    try {
      const response = await api.loginUser(userData)
      console.log('res: ', response)
      const { token, user } = response.data
      console.log('token: ', token)
      console.log('user: ', user)

      // localStorage.clear()

      sessionStorage.setItem('token', token)
      sessionStorage.setItem('user', JSON.stringify(user))
      window.open(utils.constants.path.homepage, '_self')
    } catch (error) {
      if (error.response && error.response.status === 401) {
        toast.error('Incorrect username or Password.')
      } else {
        toast.error('An unexpected error occurred.')
      }
    }
  }
  return (
    <div className='login-container'>
      {/* <div className='container mt-3 '>
        <div className='row'>
          <div className='col'>
            <img src={Logo} alt='Logo' className='logo-top-left' />
          </div>
        </div>
      </div> */}

      {/* <div className='d-flex flex-column justify-content-center align-items-center '> */}
      <img src={Logo} alt='Logo' className='logo' />

      {/* Text "collaborative" outside the form, centered above it */}
      <div className='login-form'>
        <form onSubmit={handleLogin}>
          <div className='form-group'>
            <input
              type='user'
              className='form-control'
              placeholder='Username'
              value={username}
              onChange={e => setUser(e.target.value)}
              required
            />
          </div>
          <div className='form-group mt-4'>
            <input
              type='password'
              className='form-control'
              placeholder='Password'
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
            />
          </div>
          <div className='d-flex flex-column mt-5 justify-content-center align-items-center'>
            <div className='w-50 '>
              <button
                type='submit'
                className='btn btn-dark btn-block px-5 mt-4'
              >
                Login
              </button>
            </div>
          </div>
          {/* <p className='signup-text mt-4'>
              Don't have account? <a href='/register'>Create Account</a>
            </p> */}
        </form>
      </div>
      {/* </div> */}
    </div>
  )
}

export default Login
