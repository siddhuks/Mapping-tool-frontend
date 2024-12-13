import React, { useState } from 'react'
import api from '../api/apiCalls' // Update with your API call file path
import './components.css'
import '../pages/template/template.css'
import { useNavigate } from 'react-router-dom'
import Alerts from '../pages/alerts/alerts'

const HL7MappingTool = () => {
  const [data, setData] = useState(null)
  const [jsonKeys, setJsonKeys] = useState([])
  const [error, setError] = useState('')
  const [expandedSegments, setExpandedSegments] = useState({})
  const [expandedFields, setExpandedFields] = useState({})
  const [expandedComponents, setExpandedComponents] = useState({})
  const [mappedValues, setMappedValues] = useState({})

  const navigate = useNavigate()
  const user = JSON.parse(sessionStorage.getItem('user'))

  const handleSelectChange = async event => {
    const selectedType = event.target.value

    if (selectedType === 'select') {
      setData(null)
      return
    }

    try {
      const response = await api.fetchHL7Message(selectedType)
      setData(response)
    } catch (err) {
      console.error('Error fetching HL7 message:', err)
      setError('Failed to fetch data.')
    }
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
  }

  const handleNext = async () => {
    try {
      const user = JSON.parse(sessionStorage.getItem('user')) // Retrieve user from session storage
      const selectedType = document.getElementById('messageTypeSelect').value

      if (!selectedType || selectedType === 'select') {
        alert('Please select a message type.')
        return
      }

      const payload = {
        user,
        selectedType,
        mappings: mappedValues
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
      console.error('Error publishing data:', error)
      alert('Failed to create channel.')
    }

    console.log('Next button clicked!')
    // navigate('/alerts')
  }

  return (
    <div className='hl7-mapping-tool'>
      <div className='controls'>
        <label htmlFor='messageTypeSelect'>Select HL7 Message Type:</label>
        <select id='messageTypeSelect' onChange={handleSelectChange}>
          <option value='select'>Select a message</option>
          <option value='ORU_R01'>ORU_R01</option>
          <option value='SIU_S12'>SIU_S12</option>
        </select>

        <div className='file-upload'>
          <label htmlFor='fileUpload'>Upload JSON File:</label>
          <input
            type='file'
            id='fileUpload'
            accept='.json'
            onChange={handleFileUpload}
          />
        </div>
      </div>
      {error && <p className='error-message'>{error}</p>}
      <div className='message-container'>
        {data &&
          Object.keys(data).map(segmentName => {
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
                              {fieldKey}. {field.field_name} ({field.data_type}){' '}
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
                                  <input type='checkbox' />
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
                                        ].includes(component.component_name) ? (
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
                                          <input type='checkbox' />
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
                                                {subcomponent.subcomponent_name}{' '}
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
                                                <input type='checkbox' />
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
      </div>
      <div className='next-button-container'>
        <button className='next-button' onClick={handleNext}>
          Create Channel
        </button>
      </div>
    </div>
  )
}

export default HL7MappingTool
