import React from 'react'
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

  const handlePublish = async () => {
    try {
      const payload = { channelId }

      const response = await api.deployMappingData(payload)
      console.log('Deploy Channel Response:', response)

      alert('Channel deployed successfully!')
      navigate('/deployed', { state: { url: `${response.url}${contextPath}` } })
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
      </div>

      <Header heading={'Alerts and Notifications'} />

      {alerts && alerts.length > 0 ? (
        alerts.map((alert, index) => (
          <div className='alert-item' key={index}>
            {alert.message}
          </div>
        ))
      ) : (
        <div className='d-flex flex-column justify-content-center align-items-center'>
          No alerts to display.
        </div>
      )}

      <div className='publish-button-container'>
        <button className='publish-button' onClick={handlePublish}>
          Deploy Channel
        </button>
      </div>
    </div>
  )
}

export default Alerts
