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
      <h1 className='deployed-heading'>Channel Deployed Successfully!</h1>;
      <p className='deployed-description'>
        Your channel has been deployed. You can now upload files for processing
        or return to the home page. Here is the endpoint to upload JSON file:{' '}
        <strong>{url}</strong> and Channel ID is <strong>{channelId}</strong>{' '}
        <img
          src={require('../../assets/copy.png')} // Adjust the path if necessary
          alt='Copy to clipboard'
          className='copy-icon'
          onClick={() => {
            navigator.clipboard.writeText(channelId)
            alert('Channel ID copied to clipboard!')
          }}
        />
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
