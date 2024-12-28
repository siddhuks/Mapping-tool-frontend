import React, { useState } from 'react'
import './alerts.css'
import Header from '../../MyComponents/Header'
import '../template/template.css'
import { useNavigate } from 'react-router-dom'
import Arrrowback from '../../assets/arrow_back.png'
import { useLocation } from 'react-router-dom'
import api from '../../api/apiCalls'

function Alerts ({ alerts }) {
  const location = useLocation()
  const { channelId, contextPath } = location.state || {}
  const [email, setEmail] = useState('')

  const handleSubmit = async () => {
    const user = JSON.parse(sessionStorage.getItem('user'))
    const userId = user.id
    console.log('user id: ', userId)
    if (!user.id) {
      alert('User is not logged in.')
      return
    }

    try {
      const response = await api.addEmail({ email, userId })
      alert(response.message || 'Email added successfully!')
      setEmail('')
    } catch (error) {
      console.error('Error adding email:', error)
      alert('Failed to add email.')
    }
  }

  const handlePublish = async () => {
    try {
      const payload = { channelId }

      const response = await api.deployMappingData(payload)
      console.log('Deploy Channel Response:', response)

      alert('Channel deployed successfully!')
      navigate('/deployed', {
        state: { url: `${response.url}${contextPath}`, channelId: channelId }
      })
    } catch (error) {
      console.error('Error deploying channel:', error)
      alert('Failed to deploy channel.')
    }
  }

  const navigate = useNavigate()

  const handleBack = () => {
    navigate('/template')
  }

  return (
    <div className='container'>
      <div className='back-button-container'>
        <button className='back-button' onClick={handleBack}>
          <img src={Arrrowback} alt='Arrowback' className='back-logo' />
        </button>

        <Header heading={'Alerts and Notifications'} />
      </div>
      <div className='email-input-container'>
        <label htmlFor='email'>Enter your email for alerts:</label>
        <input
          type='email'
          id='email'
          value={email}
          onChange={e => setEmail(e.target.value)}
          placeholder='Enter your email'
        />
        <button className='submit-button' onClick={handleSubmit}>
          Submit
        </button>
      </div>

      <div className='publish-button-container'>
        <button className='publish-button' onClick={handlePublish}>
          Deploy Channel
        </button>
      </div>
    </div>
  )
}

export default Alerts
