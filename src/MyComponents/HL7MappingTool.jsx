import React, { useState } from 'react'
import api from '../api/apiCalls' // Update with your API call file path
import './components.css'
import '../pages/template/template.css'
import '../pages/hl7message/hl7message.css'
import { useNavigate } from 'react-router-dom'

const HL7MappingTool = () => {
  const [data, setData] = useState(null)
  const [jsonKeys, setJsonKeys] = useState([])
  const [error, setError] = useState('')
  const [expandedSegments, setExpandedSegments] = useState({})
  const [expandedFields, setExpandedFields] = useState({})
  const [expandedComponents, setExpandedComponents] = useState({})
  const [mappedValues, setMappedValues] = useState({})
  const [toggleValidation, setToggleValidation] = useState({})
  const [step, setStep] = useState(1)
  const [selectedMessageType, setSelectedMessageType] = useState('')

  const navigate = useNavigate()
  const user = JSON.parse(sessionStorage.getItem('user'))

  const handleSelectChange = async event => {
    // if (selectedType === 'select') {
    //   setData(null)
    //   return
    // }

    if (!selectedMessageType) {
      setError('Please select a message type.')
      return
    }

    try {
      const response = await api.fetchHL7Message(selectedMessageType)
      setData(response)
      setStep(2)
    } catch (err) {
      console.error('Error fetching HL7 message:', err)
      setError('Failed to fetch data.')
    }
  }

  const handlePreviousStep = () => {
    if (step > 1) {
      setStep(step - 1)
    }
  }

  const handleNextStep = async () => {
    if (step === 1 && selectedMessageType) {
      setStep(2)
    } else if (step === 2) {
      try {
        // Validate or fetch data
        const response = await api.fetchHL7Message(selectedMessageType)
        setData(response)
        setStep(3)
        setError('')
      } catch (err) {
        console.error('Error fetching HL7 message:', err)
        setError('Failed to fetch mapping data. Please try again.')
      }
    } else {
      setError('Please complete the required fields.')
    }
  }

  // Handle message type selection
  const handleMessageTypeChange = event => {
    setSelectedMessageType(event.target.value)
    setError('')
  }

  const handleFileUpload = event => {
    const file = event.target.files[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = () => {
      try {
        const jsonContent = JSON.parse(reader.result)
        setJsonKeys(flattenJsonKeys(jsonContent))
      } catch (err) {
        console.error('Error parsing JSON file:', err)
        setError('Invalid JSON file.')
      }
    }
    reader.readAsText(file)
  }

  const flattenJsonKeys = (obj, prefix = '') => {
    let keys = []
    for (let key in obj) {
      if (obj.hasOwnProperty(key)) {
        const path = prefix ? `${prefix}.${key}` : key
        if (typeof obj[key] === 'object' && obj[key] !== null) {
          keys = keys.concat(flattenJsonKeys(obj[key], path))
        } else {
          keys.push(path)
        }
      }
    }
    return keys
  }

  const toggleSegment = segmentName => {
    setExpandedSegments(prev => ({
      ...prev,
      [segmentName]: !prev[segmentName]
    }))
  }

  const toggleField = fieldPath => {
    setExpandedFields(prev => ({
      ...prev,
      [fieldPath]: !prev[fieldPath]
    }))
  }

  const toggleComponent = componentPath => {
    setExpandedComponents(prev => ({
      ...prev,
      [componentPath]: !prev[componentPath]
    }))
  }

  const handleValueChange = (
    segment,
    field,
    component,
    subcomponent,
    value
  ) => {
    console.log('handleValueChange called with:', {
      segment,
      field,
      component,
      subcomponent,
      value
    })

    const tmpPath = [
      `tmp['${segment}']`,
      `['${segment}.${field}']`,
      component ? `['${segment}.${field}.${component}']` : null,
      subcomponent
        ? `['${segment}.${field}.${component}.${subcomponent}']`
        : null
    ]
      .filter(Boolean) // Remove null or undefined parts
      .join('')

    const valueParts = value.split('.') // Example: ['0', 'appointment', 'date']
    console.log(`Value Parts: ${valueParts}`)

    // Dynamically construct the msg path
    let msgPath

    if (valueParts.length === 1) {
      // If there's only one part, use the part directly as msgPath
      msgPath = `${valueParts[0]}`
    } else {
      // Otherwise, construct msgPath dynamically
      msgPath = 'msg' // Start with the root object
      valueParts.forEach(part => {
        if (!isNaN(part)) {
          msgPath += `[${part}]`
        } else {
          msgPath += `['${part}']`
        }
      })
    }

    // Construct variable name
    const variableName = [segment, field, component, subcomponent]
      .filter(Boolean) // Remove null or undefined levels
      .join('_') // Concatenate levels with "_"

    console.log(`Variable Name: ${variableName}, Value: ${value}`)

    // Update the mappedValues state
    setMappedValues(prevValues => {
      const updatedValues = {
        ...prevValues,
        [tmpPath]: msgPath
      }

      console.log('Updated Mapped Values:', updatedValues) // Log updated state
      return updatedValues
    })

    // Update validation state for the key
    setToggleValidation(prev => ({
      ...prev,
      [variableName]: {
        value,
        isToggleOn: prev[variableName]?.isToggleOn || false
      }
    }))
  }

  const handleToggleChange = (segment, field, component, subcomponent) => {
    const key = [segment, field, component, subcomponent]
      .filter(Boolean)
      .join('_')

    setToggleValidation(prev => {
      const value = prev[key]?.value || ''
      const isToggleOn = !prev[key]?.isToggleOn

      if (isToggleOn && !value) {
        alert(
          'Please provide a value or select a JSON key before enabling this toggle.'
        )
      }
      console.log('key: ', key, ' isToggleOn: ', isToggleOn, ' value: ', value)

      return {
        ...prev,
        [key]: { value: prev[key]?.value, isToggleOn }
      }
    })
  }

  // const handleNext = async () => {
  //   try {
  //     const user = JSON.parse(sessionStorage.getItem('user')) // Retrieve user from session storage
  //     const selectedType = document.getElementById('messageTypeSelect').value

  //     if (!selectedType || selectedType === 'select') {
  //       alert('Please select a message type.')
  //       return
  //     }

  //     console.log('toggleValidation: ', toggleValidation)

  //     const invalidToggles = Object.entries(toggleValidation).filter(
  //       ([, { isToggleOn, value }]) => isToggleOn && !value
  //     )

  //     if (invalidToggles.length > 0) {
  //       alert(
  //         'Some toggles are enabled without values. Please correct them before proceeding.'
  //       )
  //       return
  //     }

  //     const transformedToggleValidation = Object.entries(
  //       toggleValidation
  //     ).reduce(
  //       (acc, [key, { value, isToggleOn }]) => {
  //         if (isToggleOn) {
  //           const valueParts = value.split('.')
  //           let transformedKey

  //           // Check if value is a JSON key (e.g., contains a dot `.` for nested JSON paths)
  //           if (valueParts.length > 1) {
  //             // Transform multi-part JSON keys
  //             transformedKey = valueParts
  //               .map(part => (isNaN(part) ? `['${part}']` : `[${part}]`))
  //               .join('')
  //             acc.push(transformedKey) // Add the transformed key to the array
  //           }
  //         }
  //         return acc
  //       },
  //       [] // Start with an empty array
  //     )

  //     console.log(transformedToggleValidation)

  //     const payload = {
  //       user,
  //       selectedType,
  //       mappings: mappedValues,
  //       toggleValidation: transformedToggleValidation
  //     }

  //     console.log('Publishing Data:', payload.toggleValidation)

  //     const response = await api.createMappingData(payload)
  //     console.log('Publish Response:', response.channelId)
  //     alert('Channel created successfully!')
  //     navigate('/alerts', {
  //       state: {
  //         channelId: response.channelId,
  //         contextPath: response.contextPath
  //       }
  //     })
  //   } catch (error) {
  //     console.error('Error publishing data:', error.message)
  //     alert(`Failed to create channel. Error: ${error.message}`)
  //   }

  //   console.log('Next button clicked!')
  //   // navigate('/alerts')
  // }

  const handleNext = async () => {
    try {
      const user = JSON.parse(sessionStorage.getItem('user')) // Retrieve user from session storage
      const selectedType = selectedMessageType

      if (!selectedType || selectedType === 'select') {
        alert('Please select a message type.')
        return
      }

      console.log('toggleValidation: ', toggleValidation)

      // Ensure all entries in toggleValidation are initialized and valid
      const invalidToggles = Object.entries(toggleValidation).filter(
        ([, entry]) => entry?.isToggleOn && !entry?.value
      )

      if (invalidToggles.length > 0) {
        alert(
          'Some toggles are enabled without values. Please correct them before proceeding.'
        )
        return
      }

      const transformedToggleValidation = Object.entries(
        toggleValidation
      ).reduce(
        (acc, [key, entry]) => {
          if (entry?.isToggleOn && entry?.value) {
            const valueParts = entry.value.split('.')
            const transformedKey = valueParts
              .map(part => (isNaN(part) ? `['${part}']` : `[${part}]`))
              .join('')
            acc.push(transformedKey)
          }
          return acc
        },
        [] // Start with an empty array
      )

      console.log(transformedToggleValidation)

      const payload = {
        user,
        selectedType,
        mappings: mappedValues,
        toggleValidation: transformedToggleValidation
      }

      console.log('Publishing Data:', payload)

      const response = await api.createMappingData(payload)
      console.log('Publish Response:', response.channelId)
      alert('Channel created successfully!')
      navigate('/alerts', {
        state: {
          channelId: response.channelId,
          contextPath: response.contextPath
        }
      })
    } catch (error) {
      console.error('Error publishing data:', error.message)
      alert(`Failed to create channel. Error: ${error.message}`)
    }

    console.log('Next button clicked!')
  }

  return (
    <div className='hl7-mapping-tool'>
      <div className='controls'>
        {step === 1 && (
          <div className='step-container hl7-container'>
            <h1>Select HL7 Message Type</h1>
            <select
              onChange={handleMessageTypeChange}
              value={selectedMessageType}
              className='message-type-select'
            >
              <option value=''>Select a message type</option>
              <option value='ORU_R01'>ORU_R01</option>
              <option value='SIU_S12'>SIU_S12</option>
            </select>
            <button className='next-button' onClick={handleNextStep}>
              Next
            </button>
            {error && <p className='error-message'>{error}</p>}
          </div>
        )}
        {step === 2 && (
          <div className='step-container hl7-container'>
            <h1>Upload JSON</h1>
            <input
              type='file'
              accept='.json'
              onChange={handleFileUpload}
              className='upload-json'
            />

            <div>
              <button className='next-button' onClick={handlePreviousStep}>
                Back
              </button>
              <button className='next-button' onClick={handleNextStep}>
                Next
              </button>
            </div>
            {error && <p className='error-message'>{error}</p>}
          </div>
        )}
      </div>
      {/* <div className='file-upload'>
        <label htmlFor='fileUpload'>Upload JSON File:</label>
        <input
          type='file'
          id='fileUpload'
          accept='.json'
          onChange={handleFileUpload}
        />
      </div> */}

      {step === 3 && data && (
        <div className='message-container'>
          <div className='mapping-container'>
            <div className='header-row'>
              <span className='message-type'>
                Message Type: {selectedMessageType}
              </span>
            </div>
            <div className='toggle-note'>
              <span className='toggle-description'>
                <span className='asterisk'>*</span>
                Toggle indicates mandatory fields/components/subcomponents
              </span>
            </div>
            {Object.keys(data).map(segmentName => {
              const segment = data[segmentName]
              const isSegmentExpanded = expandedSegments[segmentName]

              return (
                <div className='segment' key={segmentName}>
                  <div
                    className='segment-header'
                    onClick={() => toggleSegment(segmentName)}
                  >
                    {segmentName}: {segment.description}{' '}
                    <span className='chevron'>
                      {isSegmentExpanded ? '▲' : '▼'}
                    </span>
                  </div>
                  {isSegmentExpanded && (
                    <div className='segment-content'>
                      {Object.keys(segment.fields).map(fieldKey => {
                        const field = segment.fields[fieldKey]
                        const fieldPath = `${segmentName}.${fieldKey}`
                        const isFieldExpanded = expandedFields[fieldPath]
                        const hasComponents =
                          field.components && field.components.length > 0
                        // Condition to check if the field is Field Separator
                        const isFieldSeparator =
                          field.field_name === 'Field Separator'

                        return (
                          <div className='field' key={fieldKey}>
                            <div
                              className='field-row'
                              onClick={() =>
                                hasComponents && toggleField(fieldPath)
                              }
                            >
                              <div className='field-header'>
                                {fieldKey}. {field.field_name} (
                                {field.data_type}){' '}
                                {hasComponents && (
                                  <span className='chevron'>
                                    {isFieldExpanded ? '▲' : '▼'}
                                  </span>
                                )}
                              </div>
                              {!hasComponents && (
                                <div>
                                  {/* Conditional rendering for input or dropdown */}
                                  {[
                                    'Field Separator',
                                    'Encoding Characters'
                                  ].includes(field.field_name) ? (
                                    <input
                                      type='text'
                                      className='field-textbox'
                                      placeholder={`Enter ${segmentName}_${field.field_name}`}
                                      onChange={e =>
                                        handleValueChange(
                                          segmentName, // Dynamically passed segment name
                                          fieldKey, // Dynamically passed field key
                                          null, // Dynamically passed component position
                                          null, // Dynamically passed subcomponent position
                                          e.target.value // Capturing user input
                                        )
                                      }
                                    />
                                  ) : (
                                    <select
                                      className='json-key-dropdown'
                                      onChange={e =>
                                        handleValueChange(
                                          segmentName, // Dynamically passed segment name
                                          fieldKey, // Dynamically passed field key
                                          null, // Dynamically passed component position
                                          null, // Dynamically passed subcomponent position
                                          e.target.value // Capturing user input
                                        )
                                      }
                                    >
                                      <option value=''>Select JSON key</option>
                                      {jsonKeys.map((key, i) => (
                                        <option key={i} value={key}>
                                          {key}
                                        </option>
                                      ))}
                                    </select>
                                  )}
                                  {/* Toggle switch always present */}
                                  <label className='toggle-switch'>
                                    <input
                                      type='checkbox'
                                      onChange={() =>
                                        handleToggleChange(
                                          segmentName,
                                          fieldKey,
                                          null,
                                          null
                                        )
                                      }
                                      checked={
                                        toggleValidation[
                                          [segmentName, fieldKey, null, null]
                                            .filter(Boolean)
                                            .join('_')
                                        ]?.isToggleOn || false
                                      }
                                    />
                                    <span className='slider'></span>
                                  </label>
                                </div>
                              )}

                              {/* <label className='toggle-switch'>
                              <input type='checkbox' />
                              <span className='slider'></span>
                            </label> */}
                            </div>
                            {isFieldExpanded && hasComponents && (
                              <div className='component-list'>
                                {field.components.map(component => {
                                  const componentPath = `${fieldPath}.${component.component_position}`
                                  const isComponentExpanded =
                                    expandedComponents[componentPath]
                                  const hasSubcomponents =
                                    component.subcomponents &&
                                    component.subcomponents.length > 0

                                  return (
                                    <div
                                      className='component-row'
                                      key={componentPath}
                                    >
                                      <div
                                        className='component-header'
                                        onClick={() =>
                                          hasSubcomponents &&
                                          toggleComponent(componentPath)
                                        }
                                      >
                                        {component.component_position}.{' '}
                                        {component.component_name} (
                                        {component.data_type}){' '}
                                        {hasSubcomponents && (
                                          <span className='chevron'>
                                            {isComponentExpanded ? '▲' : '▼'}
                                          </span>
                                        )}
                                      </div>
                                      {!hasSubcomponents && (
                                        <div>
                                          {[
                                            'Namespace ID',
                                            'Universal ID',
                                            'Universal ID Type'
                                          ].includes(
                                            component.component_name
                                          ) ? (
                                            <input
                                              type='text'
                                              className='field-textbox'
                                              placeholder={`Enter ${component.component_name}`}
                                              onChange={e =>
                                                handleValueChange(
                                                  segmentName, // Dynamically passed segment name
                                                  fieldKey, // Dynamically passed field key
                                                  component.component_position, // Dynamically passed component position
                                                  null, // Dynamically passed subcomponent position
                                                  e.target.value // Capturing user input
                                                )
                                              }
                                            />
                                          ) : (
                                            <select
                                              className='json-key-dropdown'
                                              onChange={e =>
                                                handleValueChange(
                                                  segmentName, // Dynamically passed segment name
                                                  fieldKey, // Dynamically passed field key
                                                  component.component_position, // Dynamically passed component position
                                                  null, // Dynamically passed subcomponent position
                                                  e.target.value // Capturing user input
                                                )
                                              }
                                            >
                                              <option value=''>
                                                Select JSON key
                                              </option>
                                              {jsonKeys.map((key, i) => (
                                                <option key={i} value={key}>
                                                  {key}
                                                </option>
                                              ))}
                                            </select>
                                          )}
                                          {/* Toggle switch moved outside the conditional block */}
                                          <label className='toggle-switch'>
                                            <input
                                              type='checkbox'
                                              onChange={() =>
                                                handleToggleChange(
                                                  segmentName,
                                                  fieldKey,
                                                  component.component_position,
                                                  null
                                                )
                                              }
                                              checked={
                                                toggleValidation[
                                                  [
                                                    segmentName,
                                                    fieldKey,
                                                    component.component_position,
                                                    null
                                                  ]
                                                    .filter(Boolean)
                                                    .join('_')
                                                ]?.isToggleOn || false
                                              }
                                            />
                                            <span className='slider'></span>
                                          </label>
                                        </div>
                                      )}

                                      {isComponentExpanded && hasSubcomponents && (
                                        <div className='subcomponent-list'>
                                          {component.subcomponents.map(
                                            subcomponent => (
                                              <div
                                                className='subcomponent-row'
                                                key={
                                                  subcomponent.subcomponent_position
                                                }
                                              >
                                                <div className='subcomponent-header'>
                                                  {
                                                    subcomponent.subcomponent_position
                                                  }
                                                  .{' '}
                                                  {
                                                    subcomponent.subcomponent_name
                                                  }{' '}
                                                  ({subcomponent.data_type})
                                                </div>
                                                <select
                                                  className='json-key-dropdown'
                                                  onChange={e =>
                                                    handleValueChange(
                                                      segmentName, // Dynamically passed segment name
                                                      fieldKey, // Dynamically passed field key
                                                      component.component_position, // Dynamically passed component position
                                                      subcomponent.subcomponent_position, // Dynamically passed subcomponent position
                                                      e.target.value // Capturing user input
                                                    )
                                                  }
                                                >
                                                  <option value=''>
                                                    Select JSON key
                                                  </option>
                                                  {jsonKeys.map((key, i) => (
                                                    <option key={i} value={key}>
                                                      {key}
                                                    </option>
                                                  ))}
                                                </select>
                                                <label className='toggle-switch'>
                                                  <input
                                                    type='checkbox'
                                                    onChange={() =>
                                                      handleToggleChange(
                                                        segmentName,
                                                        fieldKey,
                                                        component.component_position,
                                                        subcomponent.subcomponent_position
                                                      )
                                                    }
                                                    checked={
                                                      toggleValidation[
                                                        [
                                                          segmentName,
                                                          fieldKey,
                                                          component.component_position,
                                                          subcomponent.subcomponent_position
                                                        ]
                                                          .filter(Boolean)
                                                          .join('_')
                                                      ]?.isToggleOn || false
                                                    }
                                                  />
                                                  <span className='slider'></span>
                                                </label>
                                              </div>
                                            )
                                          )}
                                        </div>
                                      )}
                                    </div>
                                  )
                                })}
                              </div>
                            )}
                          </div>
                        )
                      })}
                    </div>
                  )}
                </div>
              )
            })}
            <div className='next-button-container'>
              <button className='next-button' onClick={handlePreviousStep}>
                Back
              </button>
              <button className='next-button' onClick={handleNext}>
                Create Channel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default HL7MappingTool
