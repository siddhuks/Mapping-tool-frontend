import React from 'react'
import './deployed.css'
import { useNavigate } from 'react-router-dom'
import { useLocation } from 'react-router-dom'

const DeployedPage = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const { url, channelId } = location.state || {}

  const handleUpload = () => {
    // Navigate to file upload page
    navigate('/uploadAndSendPage')
  }

  const goToHome = () => {
    // Navigate back to the homepage
    navigate('/homepage')
  }

  return (
    <div className='deployed-container'>
      <h1 className='deployed-heading'>Channel Deployed Successfully!</h1>
      <p className='deployed-description'>
        Your channel has been deployed. You can now upload files for processing
        or return to the home page. Here is the endpoint to upload json file:{' '}
        {url} and Chhannel ID is {channelId}
      </p>
      <div className='deployed-actions'>
        <button className='deployed-button' onClick={handleUpload}>
          Upload File
        </button>
        <button className='deployed-button secondary' onClick={goToHome}>
          Go to Home
        </button>
      </div>
    </div>
  )
}

export default DeployedPage
