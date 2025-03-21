import React, { useState } from 'react'
import { Rings } from 'react-loader-spinner'
import './uploadAndSendPage.css'
import api from '../../api/apiCalls'
import '../alerts/alerts.css'
import { useNavigate } from 'react-router-dom'
import Arrrowback from '../../assets/arrow_back.png'

const UploadAndSendPage = () => {
  const [jsonFile, setJsonFile] = useState(null)
  const [channelId, setChannelId] = useState('')
  const [uploadError, setUploadError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const navigate = useNavigate()

  const handleBack = () => {
    navigate('/homepage')
  }

  // const handleFileUpload = event => {
  //   const file = event.target.files[0]
  //   if (file && file.type === 'application/json' ||) {
  //     setUploadError('')
  //     const reader = new FileReader()
  //     reader.onload = e => {
  //       try {
  //         const jsonData = JSON.parse(e.target.result)
  //         setJsonFile(jsonData)
  //       } catch (error) {
  //         setUploadError('Invalid JSON file')
  //       }
  //     }
  //     reader.readAsText(file)
  //   } else {
  //     setUploadError('Please upload a valid JSON file')
  //   }
  // }

  const handleFileUpload = event => {
    const file = event.target.files[0]
    if (!file) {
      setUploadError('No file selected.')
      return
    }

    console.log(`File selected: ${file.name}, Type: ${file.type}`)

    const reader = new FileReader()
    reader.onload = e => {
      try {
        let fileContent = e.target.result.trim()
        console.log('Raw File Content Loaded:', fileContent)

        if (file.type === 'application/json' || file.name.endsWith('.json')) {
          console.log('Processing as JSON...')
          const jsonData = JSON.parse(fileContent)
          setJsonFile(jsonData)
        } else if (file.type === 'text/xml' || file.name.endsWith('.xml')) {
          console.log('Processing as XML...')

          // Convert XML to JSON
          const parser = new DOMParser()
          const xmlDoc = parser.parseFromString(fileContent, 'text/xml')

          if (xmlDoc.getElementsByTagName('parsererror').length > 0) {
            console.error(
              'XML Parsing Error:',
              xmlDoc.getElementsByTagName('parsererror')[0].textContent
            )
            setUploadError('Invalid XML file.')
            return
          }

          console.log('Parsed XML Document:', xmlDoc)
          let jsonConverted = xmlToJson(xmlDoc)
          console.log('Converted XML to JSON:', jsonConverted)

          setJsonFile(jsonConverted)
        } else {
          throw new Error('Unsupported file format.')
        }

        setUploadError('') // Clear errors if successful
      } catch (error) {
        console.error('Error parsing file:', error)
        setUploadError(
          'Invalid file format. Please upload a valid JSON or XML file.'
        )
        setJsonFile(null) // Clear stored file
      }
    }

    reader.readAsText(file)
  }

  const xmlToJson = xml => {
    let obj = {}
    if (xml.nodeType === 1) {
      // Element node
      if (xml.attributes.length > 0) {
        obj['@attributes'] = {}
        for (let j = 0; j < xml.attributes.length; j++) {
          const attribute = xml.attributes.item(j)
          obj['@attributes'][attribute.nodeName] = attribute.nodeValue
        }
      }
    } else if (xml.nodeType === 3) {
      // Text node
      return xml.nodeValue.trim() ? xml.nodeValue.trim() : null
    }

    if (xml.hasChildNodes()) {
      for (let i = 0; i < xml.childNodes.length; i++) {
        const item = xml.childNodes.item(i)
        const nodeName = item.nodeName
        const nodeValue = xmlToJson(item)

        if (nodeValue === null) continue // Skip empty text nodes

        if (typeof obj[nodeName] === 'undefined') {
          obj[nodeName] = nodeValue
        } else {
          if (!Array.isArray(obj[nodeName])) {
            obj[nodeName] = [obj[nodeName]]
          }
          obj[nodeName].push(nodeValue)
        }
      }
    }
    return obj
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
      // alert('HL7 v2 Message Received')
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
      {isLoading ? (
        <div className='spinner-container'>
          <Rings color='#007bff' height={80} width={80} />
          <p>Fetching HL7 message, please wait...</p>
        </div>
      ) : (
        <div className='upload-send-container hl7-container'>
          <h1 className='upload-send-heading'>Upload JSON and Send Data</h1>
          <div className='upload-section'>
            <label htmlFor='jsonFile' className='upload-label'>
              Upload JSON File:
            </label>
            <input
              type='file'
              id='jsonFile'
              accept='.json, .xml'
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
        </div>
      )}
    </div>
  )
}

export default UploadAndSendPage
