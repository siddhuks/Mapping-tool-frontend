import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import './hl7message.css'
import api from '../../api/apiCalls'
import Arrrowback from '../../assets/arrow_back.png'
import Header from '../../MyComponents/Header'

const HL7Messages = () => {
  const [message, setMessage] = useState('')

  const navigate = useNavigate()

  const handleBack = () => {
    navigate('/uploadAndSendPage')
  }

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const response = await api.fetchMessages()
        console.log('response: ', response)

        // Ensure proper handling of the "messages" string
        if (typeof response === 'string') {
          const parsedResponse = JSON.parse(response) // Parse string if it is JSON
          setMessage(
            parsedResponse.messages ||
              'No messages available / Validation failed.'
          )
        } else {
          setMessage(
            response.messages || 'No messages available / Validation failed.'
          )
        }
      } catch (error) {
        console.error('Error fetching messages:', error)
        setMessage('Error loading messages.')
      }
    }

    // Fetch messages on component mount
    fetchMessages()
  }, []) // Empty dependency array ensures this runs only once on mount

  return (
    <div className='container'>
      <div className='back-button-container'>
        <button className='back-button' onClick={handleBack}>
          <img src={Arrrowback} alt='Arrowback' className='back-logo' />
        </button>

        <Header heading={'HL7 Message'} />
      </div>

      <div className='hl7-messages'>
        {message ? (
          <pre>{message}</pre>
        ) : (
          <p className='no-messages'>No messages available.</p>
        )}
      </div>
    </div>
  )
}

export default HL7Messages
