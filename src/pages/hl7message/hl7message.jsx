import React, { useEffect, useState } from 'react'
import './hl7message.css'
import api from '../../api/apiCalls'

const HL7Messages = () => {
  const [message, setMessage] = useState('')

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const response = await api.fetchMessages()
        console.log('response: ', response)

        // Ensure proper handling of the "messages" string
        if (typeof response === 'string') {
          const parsedResponse = JSON.parse(response) // Parse string if it is JSON
          setMessage(parsedResponse.messages || 'No messages available.')
        } else {
          setMessage(response.messages || 'No messages available.')
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
      <h1>HL7 Message</h1>
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
