import React, { useState } from 'react'
import Logo from '../../assets/logo.png'
import './homepage.css'
import UserProfilePanel from '../../MyComponents/UserProfilePanel'
// import { useNavigate } from 'react-router-dom'
import ActionCard from '../../MyComponents/ActionCard'
// import Dashboard from '../../assets/dashboard_pic.png'

const Homepage = () => {
  const [isUserProfileVisible, setIsUserProfileVisible] = useState(false)
  // const token = sessionStorage.getItem('token')
  const user = JSON.parse(sessionStorage.getItem('user'))
  let firstLetter = user.username.charAt(0).toUpperCase()
  console.log('user in hp: ', user)

  // const navigate = useNavigate()

  return (
    <div className='home-container'>
      <header className='home-header'>
        {<img src={Logo} alt='Logo' className='logo-top-left' />}
        <div className='tabs'></div>
        <div className='header-right'>
          <div
            className='user-profile-icon'
            onClick={() => setIsUserProfileVisible(!isUserProfileVisible)}
          >
            <div className='avatar-circle'>{firstLetter}</div>
          </div>
          {isUserProfileVisible && (
            <UserProfilePanel onClose={() => setIsUserProfileVisible(false)} />
          )}
        </div>
      </header>
      <div className='welcome-section'>
        <h1 className='heading'>
          Welcome
          <div className='username'>{user.username}!</div>
        </h1>
        <div className='actions'>
          <ActionCard icon='dashboard' label='View Dashboard' />
          <ActionCard
            icon='template'
            label='Create Template'
            navigateTo='/template'
          />
          <ActionCard
            icon='upload'
            label='Upload file'
            navigateTo='/uploadAndSendPage'
          />
        </div>
      </div>
    </div>
  )
}

export default Homepage
