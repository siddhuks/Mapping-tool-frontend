import React from 'react'
import './alerts.css'
import Header from '../../MyComponents/Header'
import '../template/template.css'
import { useNavigate } from 'react-router-dom'
import Arrrowback from '../../assets/arrow_back.png'

function Alerts ({ alerts }) {
  const handlePublish = () => {
    console.log('Publish clicked!')
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
          Publish
        </button>
      </div>
    </div>
  )
}

export default Alerts
