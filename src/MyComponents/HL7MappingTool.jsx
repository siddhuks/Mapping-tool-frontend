// import React, { useState } from 'react'
// import api from '../api/apiCalls' // Update with your API call file path
// import './components.css'

// const HL7MappingTool = () => {
//   const [data, setData] = useState(null)
//   const [jsonKeys, setJsonKeys] = useState([])
//   const [error, setError] = useState('')

//   const handleSelectChange = async event => {
//     const selectedType = event.target.value

//     if (selectedType === 'select') {
//       setData(null)
//       return
//     }

//     try {
//       const response = await api.fetchHL7Message(selectedType)
//       setData(response)
//     } catch (err) {
//       console.error('Error fetching HL7 message:', err)
//       setError('Failed to fetch data.')
//     }
//   }

//   const handleFileUpload = event => {
//     const file = event.target.files[0]
//     if (!file) return

//     const reader = new FileReader()
//     reader.onload = () => {
//       try {
//         const jsonContent = JSON.parse(reader.result)
//         setJsonKeys(flattenJsonKeys(jsonContent))
//       } catch (err) {
//         console.error('Error parsing JSON file:', err)
//         setError('Invalid JSON file.')
//       }
//     }
//     reader.readAsText(file)
//   }

//   const flattenJsonKeys = (obj, prefix = '') => {
//     let keys = []
//     for (let key in obj) {
//       if (obj.hasOwnProperty(key)) {
//         const path = prefix ? `${prefix}.${key}` : key
//         if (typeof obj[key] === 'object' && obj[key] !== null) {
//           keys = keys.concat(flattenJsonKeys(obj[key], path))
//         } else {
//           keys.push(path)
//         }
//       }
//     }
//     return keys
//   }

//   return (
//     <div className='hl7-mapping-tool'>
//       <div className='controls'>
//         <label htmlFor='messageTypeSelect'>Select HL7 Message Type:</label>
//         <select id='messageTypeSelect' onChange={handleSelectChange}>
//           <option value='select'>Select a message</option>
//           <option value='ORU_R01'>ORU_R01</option>
//           <option value='ADT_A01'>ADT_A01</option>
//         </select>

//         <div className='file-upload'>
//           <label htmlFor='fileUpload'>Upload JSON File:</label>
//           <input
//             type='file'
//             id='fileUpload'
//             accept='.json'
//             onChange={handleFileUpload}
//           />
//         </div>
//       </div>
//       {error && <p className='error-message'>{error}</p>}
//       <div className='message-container'>
//         {data &&
//           Object.keys(data).map((segmentName, index) => {
//             const segment = data[segmentName]
//             return (
//               <div className='segment' key={index}>
//                 <div
//                   className='segment-header'
//                   onClick={e =>
//                     (e.target.nextSibling.style.display =
//                       e.target.nextSibling.style.display === 'none'
//                         ? 'block'
//                         : 'none')
//                   }
//                 >
//                   {segmentName}: {segment.description}
//                 </div>
//                 <div className='segment-content'>
//                   {Object.keys(segment.fields).map((fieldKey, idx) => {
//                     const field = segment.fields[fieldKey]
//                     const hasComponents =
//                       field.components && field.components.length > 0

//                     return (
//                       <div className='field' key={idx}>
//                         <div className='field-row'>
//                           <div className='field-header'>
//                             {fieldKey}. {field.field_name} ({field.data_type})
//                           </div>
//                           {!hasComponents && (
//                             <select className='json-key-dropdown'>
//                               <option value=''>Select JSON key</option>
//                               {jsonKeys.map((key, i) => (
//                                 <option key={i} value={key}>
//                                   {key}
//                                 </option>
//                               ))}
//                             </select>
//                           )}
//                         </div>
//                         {hasComponents && (
//                           <div
//                             className='component-list'
//                             style={{ display: 'none' }}
//                           >
//                             {field.components.map((component, cIdx) => (
//                               <div className='component' key={cIdx}>
//                                 <div className='field-row'>
//                                   <div className='component-header'>
//                                     {component.component_position}.{' '}
//                                     {component.component_name} (
//                                     {component.data_type})
//                                   </div>
//                                   <div className='field-actions'>
//                                     <select className='json-key-dropdown'>
//                                       <option value=''>Select JSON key</option>
//                                       {jsonKeys.map((key, i) => (
//                                         <option key={i} value={key}>
//                                           {key}
//                                         </option>
//                                       ))}
//                                     </select>
//                                   </div>
//                                 </div>
//                               </div>
//                             ))}
//                           </div>
//                         )}
//                       </div>
//                     )
//                   })}
//                 </div>
//               </div>
//             )
//           })}
//       </div>
//     </div>
//   )
// }

// export default HL7MappingTool

import React, { useState } from 'react'
import api from '../api/apiCalls' // Update with your API call file path
import './components.css'
import '../pages/template/template.css'
import { useNavigate } from 'react-router-dom'

const HL7MappingTool = () => {
  const [data, setData] = useState(null)
  const [jsonKeys, setJsonKeys] = useState([])
  const [error, setError] = useState('')
  const [expandedSegments, setExpandedSegments] = useState({})
  const [expandedFields, setExpandedFields] = useState({})
  const [expandedComponents, setExpandedComponents] = useState({})

  const navigate = useNavigate()

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

  const handleNext = () => {
    console.log('Next button clicked!')
    navigate('/alerts')
    // Add your navigation logic or functionality here
  }

  return (
    <div className='hl7-mapping-tool'>
      <div className='controls'>
        <label htmlFor='messageTypeSelect'>Select HL7 Message Type:</label>
        <select id='messageTypeSelect' onChange={handleSelectChange}>
          <option value='select'>Select a message</option>
          <option value='ORU_R01'>ORU_R01</option>
          <option value='ADT_A01'>ADT_A01</option>
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
                                    placeholder={`Enter ${field.field_name}`}
                                  />
                                ) : (
                                  <select className='json-key-dropdown'>
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
                                          />
                                        ) : (
                                          <select className='json-key-dropdown'>
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
                                              <select className='json-key-dropdown'>
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
          Next
        </button>
      </div>
    </div>
  )
}

export default HL7MappingTool
