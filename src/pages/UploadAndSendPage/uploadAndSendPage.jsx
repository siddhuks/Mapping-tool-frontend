import React, { useState } from 'react'
import './uploadAndSendPage.css'
import api from '../../api/apiCalls'
import '../alerts/alerts.css'
import { useNavigate } from 'react-router-dom'
import Arrrowback from '../../assets/arrow_back.png'
import Spinner from 'react-spinner-material'

const UploadAndSendPage = () => {
  const [jsonFile, setJsonFile] = useState(null)
  const [channelId, setChannelId] = useState('')
  const [uploadError, setUploadError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const navigate = useNavigate()

  const handleBack = () => {
    navigate('/homepage')
  }

  const handleFileUpload = event => {
    const file = event.target.files[0]
    if (file && file.type === 'application/json') {
      setUploadError('')
      const reader = new FileReader()
      reader.onload = e => {
        try {
          const jsonData = JSON.parse(e.target.result)
          setJsonFile(jsonData)
        } catch (error) {
          setUploadError('Invalid JSON file')
        }
      }
      reader.readAsText(file)
    } else {
      setUploadError('Please upload a valid JSON file')
    }
  }

  const handleSend = async () => {
    if (!jsonFile) {
      alert('Please upload a JSON file.')
      return
    }

    if (!channelId) {
      alert('Please enter a valid ID.')
      return
    }
    // const rawMessage = JSON.stringify(jsonFile)

    const payload = { jsonFile: jsonFile, channelId }

    setIsLoading(true)

    console.log('jsonfile: ', jsonFile)
    console.log('channelId: ', channelId)

    try {
      const response = await api.uploadAndSendJSON(payload)
      console.log('resp: ', response)
      alert('HL7 v2 Message Received')
      navigate('/hl7message')

      //   const data = await response.json()
      //   if (response.ok) {

      //   } else {
      //     alert(`Failed to send JSON: ${data.error}`)
      //   }
    } catch (error) {
      console.error(
        'Error sending JSON:',
        error.response?.data?.error || error.message
      )

      // Display the validation error
      alert(
        `Validation failed: ${
          error.response?.data?.error || 'An unknown error occurred'
        }`
      )
    } finally {
      setIsLoading(false) // Stop spinner
    }
  }

  return (
    <div className='container'>
      <div className='back-button-container'>
        <button className='back-button' onClick={handleBack}>
          <img src={Arrrowback} alt='Arrowback' className='back-logo' />
        </button>
      </div>

      <div className='upload-send-container'>
        <h1 className='upload-send-heading'>Upload JSON and Send Data</h1>
        <div className='upload-section'>
          <label htmlFor='jsonFile' className='upload-label'>
            Upload JSON File:
          </label>
          <input
            type='file'
            id='jsonFile'
            accept='.json'
            onChange={handleFileUpload}
            className='upload-input'
          />
          {uploadError && <p className='error-message'>{uploadError}</p>}
        </div>
        <div className='url-section'>
          <label htmlFor='url' className='url-label'>
            Enter Channel ID:
          </label>
          <input
            type='text'
            id='url'
            value={channelId}
            onChange={e => setChannelId(e.target.value)}
            className='url-input'
            placeholder='Username-MessageType'
          />
        </div>
        <button
          className='send-button'
          onClick={handleSend}
          disabled={isLoading}
        >
          {isLoading ? 'Sending...' : 'Send'}
        </button>
        {isLoading && (
          <div className='spinner-container'>
            <Spinner radius={30} color={'#007bff'} stroke={3} visible={true} />
          </div>
        )}
      </div>
    </div>
  )
}

export default UploadAndSendPage
