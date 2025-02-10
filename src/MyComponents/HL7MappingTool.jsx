import React, { useState, useEffect, useCallback } from 'react'
import { Rings } from 'react-loader-spinner'
import api from '../api/apiCalls' // Update with your API call file path
import './components.css'
import '../pages/template/template.css'
import '../pages/hl7message/hl7message.css'
import { useNavigate } from 'react-router-dom'
import { FaTrash } from 'react-icons/fa'

const HL7MappingTool = () => {
  const [data, setData] = useState(null)
  const [jsonKeys, setJsonKeys] = useState([])
  const [error, setError] = useState('')
  // const [expandedSegments, setExpandedSegments] = useState({})
  const [expandedFields, setExpandedFields] = useState({})
  const [expandedComponents, setExpandedComponents] = useState({})
  const [mappedValues, setMappedValues] = useState({})
  const [toggleValidation, setToggleValidation] = useState({})
  const [step, setStep] = useState(1)
  const [selectedMessageType, setSelectedMessageType] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [selectedSegment, setSelectedSegment] = useState(null)
  const [segmentStatus, setSegmentStatus] = useState({})
  const [requiredFields, setRequiredFields] = useState([])
  const [optionalFields, setOptionalFields] = useState([])
  const [segmentData, setSegmentData] = useState({})
  const [inputMode, setInputMode] = useState({})
  const [addedFromOptional, setAddedFromOptional] = useState(new Set())
  const [repeatedSegments, setRepeatedSegments] = useState({})

  const getSegmentMappedValues = useCallback(
    segmentKey => {
      console.log(`Fetching mapped values for segment: ${segmentKey}`)

      return Object.fromEntries(
        Object.entries(mappedValues).filter(
          ([key]) =>
            key.startsWith(`${segmentKey}.0.`) ||
            key.startsWith(`${segmentKey}.`)
        )
      )
    },
    [mappedValues]
  )

  useEffect(() => {
    if (selectedSegment && data[selectedSegment]) {
      console.log(`Selected segment: ${selectedSegment}`)

      if (!segmentData[selectedSegment]) {
        const fields = data[selectedSegment].fields
        console.log(`Initializing segment data for ${selectedSegment}`)

        const required = Object.entries(fields)
          .filter(([_, field]) => field.required)
          .map(([key, field]) => ({ key, ...field }))

        const optional = Object.entries(fields)
          .filter(([_, field]) => !field.required)
          .map(([key, field]) => ({ key, ...field }))

        setOptionalFields(sortFieldsByKey(optional))

        // Initialize inputMode to 'dropdown' for all levels (fields, components, subcomponents)
        const defaultInputMode = {}

        Object.entries(fields || {}).forEach(([fieldKey, field]) => {
          const fieldPath = `${selectedSegment}.${fieldKey}`
          defaultInputMode[fieldPath] = 'dropdown'
          ;(field?.components || []).forEach(component => {
            const componentPath = `${fieldPath}.${component.component_position}`
            defaultInputMode[componentPath] = 'dropdown'
            ;(component?.subcomponents || []).forEach(subcomponent => {
              const subcomponentPath = `${componentPath}.${subcomponent.subcomponent_position}`
              defaultInputMode[subcomponentPath] = 'dropdown'
            })
          })
        })

        const newMappedValues = getSegmentMappedValues(selectedSegment)

        setInputMode(prev => ({
          ...prev,
          ...defaultInputMode
        }))

        setSegmentData(prev => ({
          ...prev,
          [selectedSegment]: {
            requiredFields: required,
            optionalFields: optional,
            // Dynamically derive mappedValues
            mappedValues: newMappedValues,
            toggleValidation: {}
          }
        }))
      } else {
        const segmentFields = segmentData[selectedSegment]
        const newMappedValues = getSegmentMappedValues(selectedSegment)

        setRequiredFields(segmentFields.requiredFields || [])
        setOptionalFields(segmentFields.optionalFields || [])
        setMappedValues(prev =>
          JSON.stringify(prev) !== JSON.stringify(newMappedValues)
            ? newMappedValues
            : prev
        )
        setToggleValidation(prev => ({
          ...prev, // Preserve toggleValidation from other segments
          ...segmentFields.toggleValidation // Add current segment's toggleValidation
        }))

        // Restore inputMode for the selected segment
        const restoredInputMode = Object.keys(
          segmentFields?.mappedValues || {}
        ).reduce((acc, fieldPath) => {
          acc[fieldPath] = segmentFields?.inputMode?.[fieldPath] || 'dropdown'
          return acc
        }, {})

        setInputMode(prev => ({
          ...prev,
          ...restoredInputMode
        }))
      }
    }
  }, [selectedSegment, data, segmentData, getSegmentMappedValues])

  // Use specific instance

  // const fieldsWithTextbox = [
  //   'Field Separator',
  //   'Encoding Characters',
  //   'Sending Application'
  // ]
  // const componentsWithTextbox = [
  //   'Namespace ID',
  //   'Universal ID',
  //   'Universal ID Type'
  // ]
  // const subcomponentsWithTextbox = ['Subcomponent1', 'Subcomponent2']

  const updateSegmentStatus = (segment, value) => {
    setSegmentStatus(prevStatus => ({
      ...prevStatus,
      [segment]:
        Object.entries(mappedValues).some(
          ([mappedKey, mappedValue]) =>
            mappedKey.startsWith(segment) && mappedValue.trim() !== ''
        ) || value.trim() !== ''
    }))
  }

  // const updateSegmentData = (fieldKey, value) => {
  //   // Update `mappedValues`
  //   setMappedValues(prev => ({
  //     ...prev,
  //     [fieldKey]: value
  //   }))

  //   // Sync `segmentData` with the updated `mappedValues`
  //   setSegmentData(prev => {
  //     const updatedSegmentData = {
  //       ...prev,
  //       [selectedSegment]: {
  //         ...prev[selectedSegment],
  //         mappedValues: {
  //           ...prev[selectedSegment]?.mappedValues,
  //           [fieldKey]: value
  //         },
  //         inputMode: {
  //           ...prev[selectedSegment]?.inputMode,
  //           [fieldKey]: inputMode[fieldKey] // Save the input mode
  //         }
  //       }
  //     }

  //     return updatedSegmentData
  //   })
  // }

  const sortFieldsByKey = fields => {
    return fields.sort((a, b) => parseInt(a.key, 10) - parseInt(b.key, 10))
  }

  const addOptionalField = (selectedField, segmentKey) => {
    const fieldPath = getFieldKey(segmentKey, selectedField.key)

    console.log('Adding field:', selectedField, 'to segmentKey:', segmentKey)

    setMappedValues(prevMappedValues => ({
      ...prevMappedValues,
      [fieldPath]: prevMappedValues[fieldPath] || '' // Add or retain value
    }))

    setToggleValidation(prevToggleValidation => ({
      ...prevToggleValidation,
      [fieldPath]: {
        value: '',
        isToggleOn: false
      }
    }))

    setAddedFromOptional(prevSet => {
      const newSet = new Set(prevSet)
      newSet.add(fieldPath) // Use unique identifier scoped to the segment instance

      return newSet
    })

    setRequiredFields(prevFields => {
      const updatedFields = [...prevFields, selectedField]
      console.log('updatedFields: OR', updatedFields)

      return updatedFields.sort(
        (a, b) => parseInt(a.key, 10) - parseInt(b.key, 10)
      ) // Sort by key (position)
    })

    console.log('updatedFields R: OO ', requiredFields)

    // Remove the field from the optional fields dropdown
    setOptionalFields(prevFields => {
      const updatedFields = prevFields.filter(field => {
        const keyGenerated = getFieldKey(segmentKey, field.key) // Generate the key
        // console.log('Generated Key:', keyGenerated) // Log the generated key
        // console.log('Field Path:', fieldPath) // Log the fieldPath for comparison
        return keyGenerated !== fieldPath // Filter out the matching field
      })

      console.log('Updated Optional Fields:', updatedFields) // Log the updated optional fields after filtering
      // return sortFieldsByKey(updatedFields) // Return sorted updated fields
    })

    console.log('updatedFields O: OO ', optionalFields)

    // setAddedFromOptional(prevSet => {
    //   const newSet = new Set(prevSet)
    //   newSet.add(`${selectedSegment}.${selectedField.key}`) // Use unique identifier
    //   console.log(
    //     'addedfromoptional: ',
    //     `${selectedSegment}.${selectedField.key}`
    //   )
    //   return newSet
    // })
    console.log('addedfromOpt: OO ', addedFromOptional)

    console.log('Adding optional field:', selectedField)

    // Update mappedValues for the specific segment instance
    setSegmentData(prevSegmentData => ({
      ...prevSegmentData,
      [segmentKey]: {
        ...prevSegmentData[segmentKey],
        requiredFields: [
          ...(prevSegmentData[segmentKey]?.requiredFields || []),
          selectedField
        ].sort((a, b) => parseInt(a.key, 10) - parseInt(b.key, 10)), // Sort by key
        optionalFields: (
          prevSegmentData[segmentKey]?.optionalFields || []
        ).filter(field => getFieldKey(segmentKey, field.key) !== fieldPath), // Remove from optional fields
        mappedValues: {
          ...prevSegmentData[segmentKey]?.mappedValues,
          [fieldPath]:
            prevSegmentData[segmentKey]?.mappedValues?.[fieldPath] || '' // Add or retain value
        },
        toggleValidation: {
          ...prevSegmentData[segmentKey]?.toggleValidation,
          [fieldPath]: {
            value: '',
            isToggleOn: false // Initialize toggle validation
          }
        }
      }
    }))

    // Update addedFromOptional tracking for this segment instance

    console.log('Optional field added:', selectedField, selectedSegment)
    console.log(
      `Optional field ${selectedField.key} added to ---------------- ${segmentKey}`
    )

    console.log(
      'Optional Fields in segmentData:',
      segmentData[segmentKey]?.optionalFields
    )
    console.log(
      'Required Fields in segmentData:',
      segmentData[segmentKey]?.requiredFields
    )

    // console.log('Rendering dropdown with fields:', dropdownFields)
  }

  // const addOptionalField = selectedField => {
  //   const fieldPath = `${selectedSegment}.${selectedField.key}`
  //   console.log('tog vali 0: ', toggleValidation)

  //   // Update mappedValues to include the new field
  // setMappedValues(prevMappedValues => ({
  //   ...prevMappedValues,
  //   [fieldPath]: prevMappedValues[fieldPath] || '' // Add or retain value
  // }))

  //   // Ensure toggleValidation is properly initialized for the new field
  // setToggleValidation(prevToggleValidation => ({
  //   ...prevToggleValidation,
  //   [fieldPath]: {
  //     value: '',
  //     isToggleOn: false
  //   }
  // }))

  //   // Add the optional field into the required fields array in the correct position
  // setRequiredFields(prevFields => {
  //   const updatedFields = [...prevFields, selectedField]
  //   console.log('updatedFields: OR', updatedFields)

  //   return updatedFields.sort(
  //     (a, b) => parseInt(a.key, 10) - parseInt(b.key, 10)
  //   ) // Sort by key (position)
  // })

  // // Remove the field from the optional fields dropdown
  // setOptionalFields(prevFields => {
  //   const updatedFields = prevFields.filter(
  //     field => field.key !== selectedField.key
  //   )
  //   console.log('updatedFields: OO ', updatedFields)
  //   return sortFieldsByKey(updatedFields) // Sort the updated optional fields
  // })

  // setAddedFromOptional(prevSet => {
  //   const newSet = new Set(prevSet)
  //   newSet.add(`${selectedSegment}.${selectedField.key}`) // Use unique identifier
  //   return newSet
  // })

  //   // Update segmentData to reflect the changes
  //   setSegmentData(prevSegmentData => ({
  //     ...prevSegmentData,
  //     [selectedSegment]: {
  //       ...prevSegmentData[selectedSegment],
  //       requiredFields: [
  //         ...(prevSegmentData[selectedSegment]?.requiredFields || []),
  //         selectedField
  //       ].sort((a, b) => parseInt(a.key, 10) - parseInt(b.key, 10)),
  //       optionalFields: (
  //         prevSegmentData[selectedSegment]?.optionalFields || []
  //       ).filter(field => field.key !== selectedField.key),
  //       mappedValues: {
  //         ...prevSegmentData[selectedSegment]?.mappedValues,
  //         [fieldPath]:
  //           prevSegmentData[selectedSegment]?.mappedValues?.[fieldPath] || ''
  //       },
  //       toggleValidation: {
  //         ...prevSegmentData[selectedSegment]?.toggleValidation,
  //         [fieldPath]: {
  //           value: '',
  //           isToggleOn: false
  //         }
  //       }
  //     }
  //   }))

  //   console.log('Optional field added:', selectedField)
  //   console.log('Updated toggleValidation:', toggleValidation)
  // }

  const deleteField = (fieldKey, segmentKey) => {
    const fieldPath = getFieldKey(segmentKey, fieldKey)

    const fieldToRemove = segmentData[segmentKey]?.requiredFields.find(
      field => getFieldKey(segmentKey, field.key) === fieldPath
    )

    console.log('DF seg Key: ---------------------------', segmentKey)
    console.log('DF reqF: ', requiredFields)
    console.log('fieldToRemove: ', fieldToRemove)

    if (!fieldToRemove) return // Ensure the field exists

    // Remove the field from requiredFields
    setRequiredFields(prevFields => {
      prevFields.filter(
        field => getFieldKey(segmentKey, field.key) !== fieldPath
      )
      console.log('updatedFields R: DR ', requiredFields)

      // console.log('updatedFields: DR ', fieldKey)
    })

    // console.log('updatedFields R: DR ', requiredFields)

    // Add the field back to optionalFields
    setOptionalFields(prevFields => {
      const updatedFields = [...prevFields, fieldToRemove]
      console.log('updatedFields: DO', updatedFields)
      return sortFieldsByKey(updatedFields)
    })

    // console.log('updatedFields O: DR ', optionalFields)

    // Remove field from mappedValues and toggleValidation
    setMappedValues(prev => {
      const updatedValues = { ...prev }
      delete updatedValues[fieldPath]
      return updatedValues
    })

    setToggleValidation(prev => {
      const updatedValidation = { ...prev }
      // console.log(
      //   'togglev 1 df: ',

      //   updatedValidation
      // )
      delete updatedValidation[fieldPath]
      // console.log(`After deletion, toggleValidation:`, updatedValidation)

      return updatedValidation
    })

    // console.log('toggleV: ', toggleValidation)

    // Remove from the tracking set
    setAddedFromOptional(prevSet => {
      const newSet = new Set(prevSet)
      newSet.delete(fieldPath) // Use unique identifier
      return newSet
    })

    console.log('addedfromOpt D: ', addedFromOptional)

    // Update segmentData to reflect changes
    setSegmentData(prevSegmentData => ({
      ...prevSegmentData,
      [segmentKey]: {
        ...prevSegmentData[segmentKey],
        requiredFields: prevSegmentData[segmentKey]?.requiredFields.filter(
          field => getFieldKey(segmentKey, field.key) !== fieldPath
        ),
        optionalFields: [
          ...(prevSegmentData[segmentKey]?.optionalFields || []),
          fieldToRemove
        ],
        mappedValues: {
          ...prevSegmentData[segmentKey]?.mappedValues,
          [fieldPath]: undefined
        },
        toggleValidation: {
          ...prevSegmentData[segmentKey]?.toggleValidation,
          [fieldPath]: undefined
        }
      }
    }))

    // console.log('toggleV2: ', toggleValidation)

    console.log(`Field ${fieldKey} moved back to optional fields.`)

    console.log(
      'Optional Fields in segmentData: D',
      segmentData[segmentKey]?.optionalFields
    )
    console.log(
      'Required Fields in segmentData: D',
      segmentData[segmentKey]?.requiredFields
    )
  }

  const navigate = useNavigate()
  // const user = JSON.parse(sessionStorage.getItem('user'))

  const handleSegmentClick = segmentName => {
    // const instanceCount = repeatedSegments[segmentName] || 1
    // const baseSegment = segmentName.split('.')[0]
    // const isRepeating = repeatedSegments[baseSegment] > 1

    // const segmentKey = isRepeating
    //   ? `${baseSegment}.${instanceCount - 1}`
    //   : segmentName
    const isRepeating = segmentName.includes('.')
    const baseSegment = segmentName.split('.')[0]
    const instanceKey = isRepeating ? segmentName : `${baseSegment}`

    // Save the current segment's toggleValidation and other data before switching
    if (selectedSegment) {
      setSegmentData(prevSegmentData => ({
        ...prevSegmentData,
        [selectedSegment]: {
          ...prevSegmentData[selectedSegment],
          requiredFields,
          optionalFields,
          mappedValues,
          toggleValidation // Save the current toggleValidation to the segment
        }
      }))
    }

    // Retrieve the selected segment's data or initialize it if not present
    const segmentFields = segmentData[instanceKey] || {}

    // Restore or initialize the global states for the selected segment
    setRequiredFields(segmentFields.requiredFields || [])
    setOptionalFields(segmentFields.optionalFields || [])
    setMappedValues(segmentFields.mappedValues || {})
    setToggleValidation(segmentFields.toggleValidation || {})
    setInputMode({})

    // Update the currently selected segment
    // setSelectedSegment(segmentName)
    setSelectedSegment(segmentName)

    // Collapse expanded fields and components for a clean start
    setExpandedFields({})
    setExpandedComponents({})
  }

  // const segments = Object.keys(data || {})

  // const handleSelectChange = async event => {
  //   // if (selectedType === 'select') {
  //   //   setData(null)
  //   //   return
  //   // }

  //   if (!selectedMessageType) {
  //     setError('Please select a message type.')
  //     return
  //   }

  //   try {
  //     const response = await api.fetchHL7Message(selectedMessageType)

  //     const initialMappedValues = {}
  //     Object.keys(response).forEach(segment => {
  //       Object.keys(response[segment]?.fields || {}).forEach(field => {
  //         const fieldPath = `${segment}.${field}`
  //         initialMappedValues[fieldPath] = ''(
  //           // Initialize components and subcomponents if they exist
  //           response[segment]?.fields[field]?.components || []
  //         ).forEach(component => {
  //           const componentPath = `${fieldPath}.${component.component_position}`
  //           initialMappedValues[componentPath] = ''(
  //             component.subcomponents || []
  //           ).forEach(subcomponent => {
  //             const subcomponentPath = `${componentPath}.${subcomponent.subcomponent_position}`
  //             initialMappedValues[subcomponentPath] = ''
  //           })
  //         })
  //       })
  //     })

  //     setData(response)
  //     setMappedValues({})
  //     setStep(2)
  //   } catch (err) {
  //     console.error('Error fetching HL7 message:', err)
  //     setError('Failed to fetch data.')
  //   }
  // }

  const handlePreviousStep = () => {
    if (step > 1) {
      setStep(step - 1)
    }
  }

  const handleNextStep = async () => {
    if (step === 1 && selectedMessageType) {
      setStep(2)
    } else if (step === 2) {
      setIsLoading(true)

      try {
        console.log('fetching...')
        // Validate or fetch data
        const response = await api.fetchHL7Message(selectedMessageType)
        const initialMappedValues = {}
        const initialToggleValidation = {}

        Object.keys(response).forEach(segment => {
          Object.keys(response[segment]?.fields || {}).forEach(field => {
            const fieldPath = `${segment}.${field}`
            initialMappedValues[fieldPath] = ''
            initialToggleValidation[fieldPath] = {
              value: '',
              isToggleOn: false
            }

            // Initialize components and subcomponents if they exist
            ;(response[segment]?.fields[field]?.components || []).forEach(
              component => {
                const componentPath = `${fieldPath}.${component.component_position}`
                initialMappedValues[componentPath] = ''
                initialToggleValidation[componentPath] = {
                  value: '',
                  isToggleOn: false
                }
                ;(component.subcomponents || []).forEach(subcomponent => {
                  const subcomponentPath = `${componentPath}.${subcomponent.subcomponent_position}`
                  initialMappedValues[subcomponentPath] = ''
                  initialToggleValidation[subcomponentPath] = {
                    value: '',
                    isToggleOn: false
                  }
                })
              }
            )
          })
        })

        setData(response)
        setMappedValues(initialMappedValues)
        setToggleValidation(initialToggleValidation)

        setStep(3)
        setError('')
      } catch (err) {
        console.error('Error fetching HL7 message:', err)
        setError('Failed to fetch mapping data. Please try again.')
      } finally {
        setIsLoading(false) // Hide spinner
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
        setJsonKeys([]) // Ensure it falls back to an empty array
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

  // const toggleSegment = segmentName => {
  //   setExpandedSegments(prev => ({
  //     ...prev,
  //     [segmentName]: !prev[segmentName]
  //   }))
  // }

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

  const handleAddSegment = segmentName => {
    if (!data[segmentName]?.repeating) return

    const instanceCount = repeatedSegments[segmentName] || 1
    const newSegmentKey = `${segmentName}.${instanceCount}`

    setRepeatedSegments(prev => ({
      ...prev,
      [segmentName]: instanceCount + 1
    }))

    console.log('repeatedSegments: ', repeatedSegments)
    console.log('segmentName: ', segmentName, 'instance+1: ', instanceCount + 1)

    setSegmentData(prev => ({
      ...prev,
      [newSegmentKey]: {
        requiredFields: prev[segmentName]?.requiredFields || [],
        optionalFields: [...(prev[segmentName]?.optionalFields || [])],
        mappedValues: JSON.parse(
          JSON.stringify(prev[segmentName]?.mappedValues || {})
        ),
        toggleValidation: JSON.parse(
          JSON.stringify(prev[segmentName]?.toggleValidation || {})
        )
      }
    }))

    console.log('HAS : ', `${newSegmentKey}`)

    setMappedValues(prev => ({
      ...prev,
      ...Object.fromEntries(
        Object.keys(prev[segmentName]?.mappedValues || {}).map(key => [
          `${newSegmentKey}.${key.split('.').pop()}`,
          ''
        ])
      )
    }))

    updateSegmentStatus(segmentName, 'default')
    console.log(`New segment added: ${newSegmentKey}`)

    // setSelectedSegment(newSegmentKey)
  }

  const handleDeleteSegment = segmentName => {
    if (!data[segmentName]?.repeating) return

    const instanceCount = repeatedSegments[segmentName]

    if (!instanceCount || instanceCount <= 1) return // Ensure original instance stays

    const lastSegmentKey = `${segmentName}.${instanceCount - 1}`

    setRepeatedSegments(prev => ({
      ...prev,
      [segmentName]: instanceCount - 1
    }))

    setSegmentData(prev => {
      const updatedData = { ...prev }
      delete updatedData[lastSegmentKey] // Remove last instance
      return updatedData
    })

    setMappedValues(prev => {
      const updatedValues = { ...prev }
      Object.keys(updatedValues).forEach(key => {
        if (key.startsWith(lastSegmentKey)) {
          delete updatedValues[key] // Remove mappings for deleted instance
        }
      })
      return updatedValues
    })

    setSegmentStatus(prevStatus => {
      const updatedStatus = { ...prevStatus }
      delete updatedStatus[lastSegmentKey] // Remove status entry
      return updatedStatus
    })

    console.log(`Deleted segment: ${lastSegmentKey}`)
  }

  // const handleValueChange = (path, value) => {
  //   const trimmedValue = value.trim()

  //   // Update mappedValues
  // setMappedValues(prev => ({
  //   ...prev,
  //   [path]: trimmedValue
  // }))

  //   // Preserve the input mode as 'textbox' and update segmentData
  //   setSegmentData(prevSegmentData => ({
  //     ...prevSegmentData,
  //     [selectedSegment]: {
  //       ...prevSegmentData[selectedSegment],
  //       mappedValues: {
  //         ...prevSegmentData[selectedSegment]?.mappedValues,
  //         [path]: trimmedValue
  //       },
  //       inputMode: {
  //         ...prevSegmentData[selectedSegment]?.inputMode,
  //         [path]: inputMode[path] // Preserve the current input mode
  //       }
  //     }
  //   }))

  //   // Optionally update the toggleValidation if required
  // setToggleValidation(prev => ({
  //   ...prev,
  //   [path]: {
  //     ...prev[path],
  //     value: trimmedValue // Sync with the updated value
  //   }
  // }))
  // }

  // const repeatingSegments = new Set(['NTE', 'OBR', 'OBX']) // Add all repeating segments here

  const getFieldKey = (segmentKey, fieldKey) => {
    const baseSegment = segmentKey.split('.')[0] // Base segment name
    // const isRepeatingSegment = repeatingSegments.has(baseSegment)
    const isRepeatingSegment = data[baseSegment]?.repeating

    const isOriginalSegment = !segmentKey.includes('.')

    // console.log('-------------------------------')
    // console.log('segmentKey: ', segmentKey)
    // console.log('baseSegment: ', baseSegment)
    // console.log('isRepeatingSegment: ', isRepeatingSegment)
    // console.log('isOriginalSegment: ', isOriginalSegment)
    // console.log('-------------------------------')

    // Always use consistent keys for both original and repeated segments
    return isRepeatingSegment && isOriginalSegment
      ? `${segmentKey}.0.${fieldKey}`
      : `${segmentKey}.${fieldKey}`
  }

  const handleValueChange = (segmentKey, fieldKey, value) => {
    console.log('value: ', value)

    const trimmedValue = value.trim()
    // const [segmentKey, ...fieldPathParts] = path.split('.')
    // const fieldPath = fieldPathParts.join('.')

    console.log('trimmed value: ', trimmedValue)
    // console.log('fieldPath: ', fieldPath)

    console.log('seg key: ', segmentKey)
    console.log('field key: ', fieldKey)

    // console.log('sd mv1: ', segmentData[segmentKey]?.mappedValues)

    const fieldPath = getFieldKey(segmentKey, fieldKey)

    console.log('fieldPath: ', fieldPath)
    // console.log('path: ', path)

    setMappedValues(prev => ({
      ...prev,
      [fieldPath]: trimmedValue
    }))

    setToggleValidation(prev => ({
      ...prev,
      [fieldPath]: {
        ...prev[fieldPath],
        value: trimmedValue // Sync with the updated value
      }
    }))

    setSegmentStatus(prevStatus => ({
      ...prevStatus,
      [segmentKey]: trimmedValue !== '' // If value exists, mark as having values
    }))

    // // Update mappedValues specific to the segment instance
    // setSegmentData(prevSegmentData => ({
    //   ...prevSegmentData,
    //   [path]: {
    //     ...prevSegmentData[path],
    //     mappedValues: {
    //       ...prevSegmentData[path]?.mappedValues,
    //       [path]: trimmedValue // Update the specific field
    //     },
    //     inputMode: {
    //       ...prevSegmentData[path]?.inputMode,
    //       [path]: 'textbox' // Ensure the input mode is preserved as 'textbox'
    //     }
    //   }
    // }))

    // // Optionally update the toggleValidation specific to the segment instance
    // setSegmentData(prevSegmentData => ({
    //   ...prevSegmentData,
    //   [path]: {
    //     ...prevSegmentData[path],
    //     toggleValidation: {
    //       ...prevSegmentData[path]?.toggleValidation,
    //       [path]: {
    //         ...prevSegmentData[path]?.toggleValidation?.[path],
    //         value: trimmedValue // Sync the value for toggle validation
    //       }
    //     }
    //   }
    // }))
  }

  const switchToTextbox = path => {
    const [segmentKey] = path.split('.')

    console.log('seg key: ', segmentKey)

    setInputMode(prev => ({
      ...prev,
      [path]: 'textbox'
    }))

    // Clear the mapped value when switching to the textbox
    setMappedValues(prev => ({
      ...prev,
      [path]: '' // Clear the value
    }))

    // Ensure segment data reflects the cleared value
    setSegmentData(prevSegmentData => ({
      ...prevSegmentData,
      [segmentKey]: {
        ...prevSegmentData[segmentKey],
        mappedValues: {
          ...prevSegmentData[segmentKey]?.mappedValues,
          [path]: '' // Clear the value in segment data
        },
        inputMode: {
          ...prevSegmentData[segmentKey]?.inputMode,
          [path]: 'textbox' // Explicitly set the input mode
        }
      }
    }))
  }

  // const handleValueChange = (
  //   segment,
  //   field,
  //   component,
  //   subcomponent,
  //   value
  // ) => {
  //   // const tmpPath = [
  //   //   `tmp['${segment}']`,
  //   //   `['${segment}.${field}']`,
  //   //   component ? `['${segment}.${field}.${component}']` : null,
  //   //   subcomponent
  //   //     ? `['${segment}.${field}.${component}.${subcomponent}']`
  //   //     : null
  //   // ]
  //   //   .filter(Boolean) // Remove null or undefined parts
  //   //   .join('')

  //   // const valueParts = value.split('.') // Example: ['0', 'appointment', 'date']
  //   // console.log(`Value Parts: ${valueParts}`)

  //   // // Dynamically construct the msg path
  //   // let msgPath

  //   // if (valueParts.length === 1) {
  //   //   // If there's only one part, use the part directly as msgPath
  //   //   msgPath = `${valueParts[0]}`
  //   // } else {
  //   //   // Otherwise, construct msgPath dynamically
  //   //   msgPath = 'msg' // Start with the root object
  //   //   valueParts.forEach(part => {
  //   //     if (!isNaN(part)) {
  //   //       msgPath += `[${part}]`
  //   //     } else {
  //   //       msgPath += `['${part}']`
  //   //     }
  //   //   })
  //   // }

  //   // Construct variable name
  //   const variableName = [segment, field, component, subcomponent]
  //     .filter(Boolean) // Remove null or undefined levels
  //     .join('_') // Concatenate levels with "_"

  //   console.log(`Variable Name: ${variableName}, Value: ${value}`)

  //   const newValue = value.trim()

  //   const key = [segment, field, component, subcomponent]
  //     .filter(Boolean)
  //     .join('.')

  //   // setMappedValues(prevValues => ({
  //   //   ...prevValues,
  //   //   [key]: newValue
  //   // }))

  //   updateSegmentData(key, newValue)

  //   setSegmentStatus(prevStatus => ({
  //     ...prevStatus,
  //     [segment]:
  //       Object.entries(mappedValues).some(
  //         ([mappedKey, mappedValue]) =>
  //           mappedKey.startsWith(segment) && mappedValue.trim() !== ''
  //       ) || newValue !== '' // Ensure current change is reflected
  //   }))

  //   console.log('mappedValues 0: ', mappedValues)

  //   // Update the mappedValues state
  //   // setMappedValues(prevValues => {
  //   //   const updatedValues = {
  //   //     ...prevValues,
  //   //     [tmpPath]: msgPath
  //   //   }

  //   //   console.log('Updated Mapped Values:', updatedValues) // Log updated state
  //   //   return updatedValues
  //   // })

  //   // Update validation state for the key
  //   setToggleValidation(prev => ({
  //     ...prev,
  //     [variableName]: {
  //       value,
  //       isToggleOn: prev[variableName]?.isToggleOn || false
  //     }
  //   }))
  // }

  const handleToggleChange = (segmentKey, fieldkey) => {
    // const [segmentKey, ...fieldPathParts] = path.split('.')
    // let fieldPath = fieldPathParts.join('.')
    const path = getFieldKey(segmentKey, fieldkey)

    const isCurrentlyOn = toggleValidation?.[path]?.isToggleOn

    // Extract base segment and check if it's a repeating segment
    // const baseSegment = segmentKey.split('.')[0]

    // Ensure correct path format for repeating segments
    // const normalizedPath =
    //   isRepeatingSegment && !segmentKey.includes('.')
    //     ? `${segmentKey}.0.${fieldPath}`
    //     : `${segmentKey}.${fieldPath}`

    const currentValue = mappedValues?.[path]?.trim()

    console.log('Original Path:', path)
    // console.log('Normalized Path:', normalizedPath)
    console.log('currentValue:', currentValue)

    if (isCurrentlyOn) {
      setToggleValidation(prev => ({
        ...prev,
        [path]: {
          ...prev[path],
          isToggleOn: false // Turn off the toggle
        }
      }))

      // Update segmentData
      setSegmentData(prevSegmentData => ({
        ...prevSegmentData,
        [segmentKey]: {
          ...prevSegmentData[segmentKey],
          toggleValidation: {
            ...prevSegmentData[segmentKey]?.toggleValidation,
            [path]: {
              ...prevSegmentData[segmentKey]?.toggleValidation?.[path],
              isToggleOn: false // Turn off the toggle
            }
          }
        }
      }))
      return
    }

    // Ensure value is present before enabling the toggle
    if (!currentValue || currentValue === '') {
      alert(`Please enter a value for ${path} before enabling the toggle.`)
      return
    }

    // Enable toggle and sync value
    setToggleValidation(prev => ({
      ...prev,
      [path]: {
        ...prev[path],
        isToggleOn: true,
        value: currentValue
      }
    }))

    // Update segmentData
    setSegmentData(prevSegmentData => ({
      ...prevSegmentData,
      [segmentKey]: {
        ...prevSegmentData[segmentKey],
        toggleValidation: {
          ...prevSegmentData[segmentKey]?.toggleValidation,
          [path]: {
            ...prevSegmentData[segmentKey]?.toggleValidation?.[path],
            isToggleOn: true,
            value: currentValue
          }
        }
      }
    }))
  }

  // const handleToggleChange = path => {
  //   const currentValue = mappedValues[path]?.trim()
  //   const isCurrentlyOn = toggleValidation[path]?.isToggleOn

  //   console.log('currentValue: ', currentValue)

  //   if (isCurrentlyOn) {
  //     // Update toggleValidation
  // setToggleValidation(prev => ({
  //   ...prev,
  //   [path]: {
  //     ...prev[path],
  //     isToggleOn: false // Turn off the toggle
  //   }
  // }))

  //     // Persist changes to segmentData
  //     setSegmentData(prevSegmentData => ({
  //       ...prevSegmentData,
  //       [selectedSegment]: {
  //         ...prevSegmentData[selectedSegment],
  //         toggleValidation: {
  //           ...prevSegmentData[selectedSegment]?.toggleValidation,
  //           [path]: {
  //             ...prevSegmentData[selectedSegment]?.toggleValidation?.[path],
  //             isToggleOn: false // Turn off the toggle
  //           }
  //         }
  //       }
  //     }))

  //     return
  //   }

  //   // Ensure value is present before enabling the toggle
  //   if (!currentValue || currentValue === '') {
  //     alert(`Please enter a value for ${path} before enabling the toggle.`)
  //     return
  //   }

  //   // Update toggleValidation
  // setToggleValidation(prev => ({
  //   ...prev,
  //   [path]: {
  //     ...prev[path],
  //     isToggleOn: !prev[path]?.isToggleOn, // Toggle state
  //     value: currentValue // Sync the value
  //   }
  // }))

  //   // Persist changes to segmentData
  //   setSegmentData(prevSegmentData => ({
  //     ...prevSegmentData,
  //     [selectedSegment]: {
  //       ...prevSegmentData[selectedSegment],
  //       toggleValidation: {
  //         ...prevSegmentData[selectedSegment]?.toggleValidation,
  //         [path]: {
  //           ...prevSegmentData[selectedSegment]?.toggleValidation?.[path],
  //           isToggleOn:
  //             !prevSegmentData[selectedSegment]?.toggleValidation?.[path]
  //               ?.isToggleOn,
  //           value: currentValue // Sync the value
  //         }
  //       }
  //     }
  //   }))
  // }

  // const handleToggleAutoEnable = (path, value) => {
  //   setToggleValidation(prev => ({
  //     ...prev,
  //     [path]: {
  //       ...prev[path],
  //       value: value.trim()
  //     }
  //   }))
  // }

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

  // const transformedToggleValidation = Object.entries(
  //   toggleValidation
  // ).reduce(
  //   (acc, [key, { value, isToggleOn }]) => {
  //     if (isToggleOn) {
  //       const valueParts = value.split('.')
  //       let transformedKey

  //       // Check if value is a JSON key (e.g., contains a dot `.` for nested JSON paths)
  //       if (valueParts.length > 1) {
  //         // Transform multi-part JSON keys
  //         transformedKey = valueParts
  //           .map(part => (isNaN(part) ? `['${part}']` : `[${part}]`))
  //           .join('')
  //         acc.push(transformedKey) // Add the transformed key to the array
  //       }
  //     }
  //     return acc
  //   },
  //   [] // Start with an empty array
  // )

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
      if (selectedSegment) {
        console.log('.......{{{{', selectedSegment)
        setSegmentData(prev => ({
          ...prev,
          [selectedSegment]: {
            requiredFields,
            optionalFields,
            mappedValues,
            toggleValidation
          }
        }))
      }

      const updatedSegmentData = {
        ...segmentData,
        [selectedSegment]: {
          requiredFields,
          optionalFields,
          mappedValues,
          toggleValidation
        }
      }

      // await new Promise(resolve => setTimeout(resolve, 100))

      // setTimeout(async () => {
      const selectedType = selectedMessageType

      if (!selectedType || selectedType === 'select') {
        alert('Please select a message type.')
        return
      }

      const validSegmentData = Object.values(updatedSegmentData).filter(
        segment => segment && typeof segment === 'object'
      )

      // Consolidate all toggleValidation and mappedValues
      const allToggleValidation = validSegmentData.reduce((acc, segment) => {
        if (!segment.toggleValidation) return acc
        return { ...acc, ...segment.toggleValidation }
      }, {})

      const allMappedValues = validSegmentData.reduce((acc, segment) => {
        if (!segment.mappedValues) return acc

        Object.entries(segment.mappedValues).forEach(([key, value]) => {
          if (!acc[key] || acc[key] === '') {
            acc[key] = value // Set value only if not already set
          }
        })

        return acc
      }, {})

      const validToggleValidation = Object.fromEntries(
        Object.entries(allToggleValidation).filter(
          ([key, value]) => value !== undefined
        )
      )

      console.log(
        'Consolidated Toggle Validation:',
        allToggleValidation,
        'validToggleValidation: ',
        validToggleValidation
      )

      console.log('Consolidated Mapped Values:', allMappedValues)

      console.log('toggleValidation:', toggleValidation)

      console.log('Mapped Values:', mappedValues)

      // Ensure all toggles are initialized and valid
      const invalidToggles = Object.entries(validToggleValidation).filter(
        ([key, { isToggleOn, value }]) => {
          const mappedValue = allMappedValues[key]

          return (
            isToggleOn &&
            (!mappedValue ||
              (typeof mappedValue === 'string' && mappedValue.trim() === ''))
          )
        }
      )

      console.log('invalidToggles: ', invalidToggles)

      if (invalidToggles?.length > 0) {
        const invalidKeys = invalidToggles.map(([key]) => key).join(', ')
        alert(
          `Some toggles are enabled without values. Please correct the following toggles: ${invalidKeys}`
        )
        return
      }

      setIsLoading(true)

      // Consolidate mapped values from segmentData

      const transformedMappedValues = Object.entries(allMappedValues).reduce(
        (acc, [key, value]) => {
          if (!key || !value || key.trim() === '' || value.trim() === '') {
            return acc // Skip empty values
          }

          // Construct the transformed path
          const keyParts = key.split('.')
          const baseSegment = keyParts[0] // Extract the base segment name
          const isRepeatingSegment = data[baseSegment]?.repeating

          let tmpPath

          if (isRepeatingSegment) {
            const instanceIndex = parseInt(keyParts[1]) // Extract repeating segment index
            tmpPath = `tmp['${baseSegment}'][${instanceIndex}]` // Base path for repeating segment

            // Start with the main field (e.g., OBX.16)
            let currentField = `${baseSegment}.${keyParts[2]}`
            tmpPath += `['${currentField}']`

            // Process additional hierarchy (components, subcomponents)
            for (let i = 3; i < keyParts.length; i++) {
              currentField += `.${keyParts[i]}`
              tmpPath += `['${currentField}']`
            }
          } else {
            tmpPath = `tmp['${keyParts[0]}']`
            keyParts.forEach((part, index) => {
              if (index > 0) {
                tmpPath += `['${keyParts.slice(0, index + 1).join('.')}']`
              }
            })
          }
          // const baseSegment = keyParts[0] // Extract the base segment name
          // const isRepeatingSegment = repeatingSegments.has(baseSegment)
          // // Check if the segment is in repeatingSegments
          // let tmpPath

          // if (
          //   isRepeatingSegment &&
          //   keyParts.length > 1 &&
          //   !isNaN(keyParts[1])
          // ) {
          //   // Format for repeating segments
          //   const instanceIndex = parseInt(keyParts[1]) // Extract the repeating segment index
          //   tmpPath = `tmp['${baseSegment}'][${instanceIndex}]`

          //   // Add the remaining parts of the path after the index
          //   keyParts.slice(2).forEach((part, index) => {
          //     const joinedPath = keyParts.slice(2, index + 3).join('.')
          //     tmpPath += `['${joinedPath}']`
          //   })
          // } else {
          //   // Format for non-repeating segments
          //   tmpPath = `tmp['${baseSegment}']`

          //   // Add the remaining parts of the path
          //   keyParts.slice(1).forEach((part, index) => {
          //     const joinedPath = keyParts.slice(1, index + 2).join('.')
          //     tmpPath += `['${joinedPath}']`
          //   })
          // }

          // Construct the value path
          const valueParts = value.split('.')
          let msgPath

          if (valueParts.length === 1) {
            // If there's only one part, use the part directly
            msgPath = valueParts[0]
          } else {
            // Otherwise, construct the full msgPath
            msgPath = 'msg'
            valueParts.forEach(part => {
              if (!isNaN(part)) {
                // Numeric part as array index
                msgPath += `[${part}]`
              } else {
                // String part as object property
                msgPath += `['${part}']`
              }
            })
          }

          acc[tmpPath] = msgPath
          return acc
        },
        {}
      )

      console.log('Transformed Mapped Values:', transformedMappedValues)

      const transformedToggleValidation = Object.entries(
        validToggleValidation
      ).reduce((acc, [key, { value, isToggleOn }]) => {
        if (isToggleOn) {
          const mappedValue = allMappedValues[key]
          const valueParts = mappedValue?.split('.')

          let transformedKey

          if (valueParts?.length > 1) {
            transformedKey = valueParts
              .map(part => (isNaN(part) ? `['${part}']` : `[${part}]`))
              .join('')
            acc.push(transformedKey)
          }
        }
        return acc
      }, [])

      console.log('Transformed Toggle Validation:', transformedToggleValidation)

      const payload = {
        user: JSON.parse(sessionStorage.getItem('user')),
        selectedType,
        mappings: transformedMappedValues,
        toggleValidation: transformedToggleValidation
      }

      console.log('Publishing Data:', payload)

      const response = await api.createMappingData(payload)

      console.log('response in handlenext: ', response)

      if (!response || response.error) {
        alert(response?.error || 'Failed to create channel')

        const timeoutId = setTimeout(() => {
          console.log('Navigating to homepage...')
          navigate('/homepage', { replace: true })
        }, 100)

        return () => clearTimeout(timeoutId)
      }

      alert('Channel created successfully!')
      navigate('/alerts', {
        state: {
          channelId: response.channelId,
          contextPath: response.contextPath
        }
      })
      // }, 100)
    } catch (error) {
      console.error('Error publishing data:', error.message)
      alert(`Failed to create channel. Error: ${error.message}`)
    } finally {
      setIsLoading(false)
    }
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
              <option value='ORM_O01'>ORM_O01</option>
              <option value='ADT_A01'>ADT_A01</option>
              <option value='ADT_A02'>ADT_A02</option>
            </select>
            <button className='next-button' onClick={handleNextStep}>
              Next
            </button>
            {error && <p className='error-message'>{error}</p>}
          </div>
        )}
        {isLoading ? (
          <div className='spinner-container'>
            <Rings color='#007bff' height={80} width={80} />
            <p>Loading data, please wait...</p>
          </div>
        ) : (
          step === 2 && (
            <div className='step-container hl7-container'>
              <h1>Upload JSON</h1>
              <input
                type='file'
                accept='.json'
                onChange={handleFileUpload}
                className='upload-json'
              />

              <div>
                <button
                  className='next-button nb2'
                  onClick={handlePreviousStep}
                >
                  Back
                </button>
                <button className='next-button nb2' onClick={handleNextStep}>
                  Next
                </button>
              </div>
              {error && <p className='error-message'>{error}</p>}
            </div>
          )
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
        <div className='mapping-container'>
          <div className='header-row'>
            <span className='message-type'>
              Message Type: {selectedMessageType}
            </span>
          </div>
          <div className='toggle-note'>
            <span className='toggle-description'>
              <span className='asterisk'>*</span>
              Switching toggle ON indicates mandatory
              fields/components/subcomponents
            </span>
          </div>

          {/* Sidebar and Main Content */}
          <div className='hl7-tool-container'>
            {/* Sidebar */}
            <div className='sidebar'>
              {Object.keys(data).map(segmentName => (
                <div
                  key={segmentName}
                  className={`sidebar-item ${
                    selectedSegment === segmentName ? 'active' : ''
                  } ${segmentStatus[segmentName] ? 'has-values' : ''}`}
                  onClick={() => handleSegmentClick(segmentName)}
                >
                  {segmentName}
                  {repeatedSegments[segmentName] > 1 && (
                    <span className='segment-count'>
                      {' '}
                      ({repeatedSegments[segmentName]})
                    </span>
                  )}
                </div>
              ))}
            </div>
            {/* Main Content */}
            <div className='main-content'>
              {Object.keys(segmentData)
                .filter(key => key.startsWith(selectedSegment))
                .map(segmentKey => {
                  const dropdownFields =
                    segmentData[segmentKey]?.optionalFields || []

                  return (
                    <div className='segment' key={segmentKey}>
                      {/* Segment Header */}
                      <div className='segment-header'>
                        <h2>{segmentKey}</h2>
                        <p>
                          {data[selectedSegment]?.description ||
                            'No description available.'}
                        </p>
                      </div>
                      {/* Optional Fields */}
                      <div className='optional-fields'>
                        <h4>Add Optional Fields:</h4>
                        <select
                          className='json-key-dropdown'
                          onChange={e => {
                            const selectedKey = e.target.value.trim()
                            if (selectedKey) {
                              const selectedField = dropdownFields.find(
                                f => f.key === selectedKey
                              )
                              console.log('Dropdown fields:', dropdownFields)

                              if (selectedField) {
                                addOptionalField(selectedField, segmentKey)

                                updateSegmentStatus(segmentKey, selectedKey)
                              }
                            }
                          }}
                        >
                          <option value=''>Select an optional field</option>
                          {dropdownFields && dropdownFields.length > 0 ? (
                            // Sort the optional fields dynamically before rendering
                            dropdownFields

                              .slice() // Create a copy to avoid mutating the original state
                              .sort(
                                (a, b) =>
                                  parseInt(a.key, 10) - parseInt(b.key, 10)
                              )
                              .map(field => (
                                <option key={field.key} value={field.key}>
                                  {field.key}. {field.field_name}
                                </option>
                              ))
                          ) : (
                            <option disabled>
                              No optional fields available
                            </option>
                          )}
                        </select>
                      </div>
                      {/* Required Fields */}
                      <div className='segment-content'>
                        {Array.isArray(
                          segmentData[segmentKey]?.requiredFields
                        ) &&
                        segmentData[segmentKey]?.requiredFields.length > 0 ? (
                          segmentData[segmentKey]?.requiredFields.map(field => {
                            const fieldPath = `${segmentKey}.${field.key}`

                            const isFieldExpanded = expandedFields[fieldPath]
                            const hasComponents =
                              Array.isArray(field?.components) &&
                              field.components.length > 0

                            return (
                              <div className='field' key={field.key}>
                                <div
                                  className='field-row'
                                  onClick={() =>
                                    hasComponents && toggleField(fieldPath)
                                  }
                                >
                                  <div className='field-header'>
                                    {field.key}. {field.field_name} (
                                    {field.data_type}){' '}
                                    {hasComponents && (
                                      <span className='chevron'>
                                        {isFieldExpanded ? '▲' : '▼'}
                                      </span>
                                    )}
                                  </div>

                                  {!hasComponents && (
                                    <div>
                                      {field.field_name ===
                                        'Encoding Characters' &&
                                      field.data_type === 'ST' ? (
                                        // Fixed Dropdown for Encoding Characters
                                        <select
                                          className='json-key-dropdown'
                                          value={
                                            mappedValues[fieldPath] || '^~\\&'
                                          } // Default to ^~\&
                                          onChange={e => {
                                            const value = e.target.value.trim()
                                            console.log(
                                              'value in dropdown: ',
                                              value
                                            )
                                            setMappedValues(prev => ({
                                              ...prev,
                                              [fieldPath]: value
                                            }))

                                            console.log(
                                              'mappedvalues : ',
                                              mappedValues
                                            )
                                            updateSegmentStatus(
                                              segmentKey,
                                              value
                                            ) // Update status for Encoding Characters
                                          }}
                                        >
                                          <option value='^~\\&'>^~\&</option>
                                          <option value='^~\\&#'>^~\&#</option>
                                        </select>
                                      ) : (
                                        // Regular Input Logic for Other Fields
                                        <>
                                          <div className='input-switcher'>
                                            <button
                                              className={`switch-button ${
                                                inputMode[fieldPath] ===
                                                'dropdown'
                                                  ? 'active'
                                                  : ''
                                              }`}
                                              onClick={() => {
                                                setInputMode(prev => ({
                                                  ...prev,
                                                  [fieldPath]: 'dropdown'
                                                }))
                                                setMappedValues(prev => ({
                                                  ...prev,
                                                  [fieldPath]: '' // Clear the value
                                                }))
                                                // setSegmentData(prevSegmentData => ({
                                                //   ...prevSegmentData,
                                                //   [selectedSegment]: {
                                                //     ...prevSegmentData[
                                                //       selectedSegment
                                                //     ],
                                                //     mappedValues: {
                                                //       ...prevSegmentData[
                                                //         selectedSegment
                                                //       ]?.mappedValues,
                                                //       [fieldPath]: '' // Clear the value in segment data
                                                //     },
                                                //     inputMode: {
                                                //       ...prevSegmentData[
                                                //         selectedSegment
                                                //       ]?.inputMode,
                                                //       [fieldPath]: 'dropdown' // Explicitly set the input mode
                                                //     }
                                                //   }
                                                // }))
                                              }}
                                            >
                                              Use Dropdown
                                            </button>
                                            {field.data_type === 'DT' ||
                                            field.data_type === 'DTM' ? (
                                              <button
                                                className={`switch-button ${
                                                  inputMode[fieldPath] ===
                                                  'serverTime'
                                                    ? 'active'
                                                    : ''
                                                }`}
                                                onClick={() => {
                                                  const serverTime =
                                                    'serverTime'
                                                  setMappedValues(prev => ({
                                                    ...prev,
                                                    [fieldPath]: serverTime
                                                  }))
                                                  setInputMode(prev => ({
                                                    ...prev,
                                                    [fieldPath]: 'serverTime'
                                                  }))
                                                  updateSegmentStatus(
                                                    segmentKey,
                                                    serverTime
                                                  ) // Update status for Server Time
                                                }}
                                              >
                                                Use Server Time
                                              </button>
                                            ) : (
                                              <button
                                                className={`switch-button ${
                                                  inputMode[fieldPath] ===
                                                  'textbox'
                                                    ? 'active'
                                                    : ''
                                                }`}
                                                onClick={() =>
                                                  switchToTextbox(fieldPath)
                                                }
                                              >
                                                Use Textbox
                                              </button>
                                            )}
                                          </div>
                                          {inputMode[fieldPath] ===
                                            'dropdown' && (
                                            <select
                                              className='json-key-dropdown'
                                              value={
                                                mappedValues[
                                                  getFieldKey(
                                                    segmentKey,
                                                    field.key
                                                  )
                                                ] || ''
                                              }
                                              onChange={e => {
                                                const value =
                                                  e.target.value.trim()
                                                console.log('svalue: ', value)

                                                console.log(
                                                  'segmentKey in dropdown: ',
                                                  segmentKey,
                                                  field.key
                                                )

                                                const fieldKey = getFieldKey(
                                                  segmentKey,
                                                  field.key
                                                )

                                                console.log(
                                                  'fieldKey in json-dropdown: ',
                                                  fieldKey
                                                )

                                                setMappedValues(prev => ({
                                                  ...prev,
                                                  [fieldKey]: value
                                                }))

                                                console.log(
                                                  'mappedvalues F: ',
                                                  mappedValues
                                                )

                                                updateSegmentStatus(
                                                  segmentKey,
                                                  value
                                                ) // Update status for dropdown change
                                              }}
                                              tabIndex={-1}
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
                                          {inputMode[fieldPath] ===
                                            'textbox' && (
                                            <input
                                              type='text'
                                              className='field-textbox'
                                              value={
                                                mappedValues[
                                                  getFieldKey(
                                                    segmentKey,
                                                    field.key
                                                  )
                                                ] || ''
                                              }
                                              onChange={e =>
                                                handleValueChange(
                                                  segmentKey,
                                                  field.key,
                                                  e.target.value
                                                )
                                              }
                                            />
                                          )}
                                          {inputMode[fieldPath] ===
                                            'serverTime' && (
                                            <input
                                              type='text'
                                              className='field-textbox'
                                              value={
                                                mappedValues[fieldPath] || ''
                                              }
                                              disabled
                                              placeholder='Server Time'
                                            />
                                          )}
                                          <label className='toggle-switch'>
                                            <input
                                              type='checkbox'
                                              onChange={() =>
                                                handleToggleChange(
                                                  segmentKey,
                                                  field.key
                                                )
                                              }
                                              checked={
                                                toggleValidation[
                                                  getFieldKey(
                                                    segmentKey,
                                                    field.key
                                                  )
                                                ]?.isToggleOn || false
                                              }
                                            />
                                            <span className='slider'></span>
                                          </label>
                                        </>
                                      )}
                                    </div>
                                  )}

                                  {addedFromOptional.has(
                                    getFieldKey(segmentKey, field.key)
                                  ) && (
                                    <div className='actions'>
                                      <FaTrash
                                        className='delete-icon'
                                        onClick={() =>
                                          deleteField(field.key, segmentKey)
                                        }
                                      />
                                    </div>
                                  )}
                                </div>

                                {/* Render Components */}
                                {isFieldExpanded && hasComponents && (
                                  <div className='component-list'>
                                    {field.components.map(component => {
                                      const componentPath = `${fieldPath}.${component.component_position}`
                                      const componentKey = `${field.key}.${component.component_position}`

                                      const isComponentExpanded =
                                        expandedComponents[componentPath]
                                      const hasSubcomponents =
                                        Array.isArray(
                                          component.subcomponents
                                        ) && component.subcomponents.length > 0

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
                                                {isComponentExpanded
                                                  ? '▲'
                                                  : '▼'}
                                              </span>
                                            )}
                                          </div>
                                          {!hasSubcomponents && (
                                            <div className='input-container'>
                                              {/* Input Switcher */}
                                              <div className='input-switcher'>
                                                <button
                                                  className={`switch-button ${
                                                    inputMode[componentPath] ===
                                                    'dropdown'
                                                      ? 'active'
                                                      : ''
                                                  }`}
                                                  onClick={() =>
                                                    setInputMode(prev => ({
                                                      ...prev,
                                                      [componentPath]:
                                                        'dropdown'
                                                    }))
                                                  }
                                                >
                                                  Use Dropdown
                                                </button>
                                                {component.data_type === 'DT' ||
                                                component.data_type ===
                                                  'DTM' ? (
                                                  <button
                                                    className={`switch-button ${
                                                      inputMode[
                                                        componentPath
                                                      ] === 'serverTime'
                                                        ? 'active'
                                                        : ''
                                                    }`}
                                                    onClick={() => {
                                                      const serverTime =
                                                        'serverTime'
                                                      setMappedValues(prev => ({
                                                        ...prev,
                                                        [componentPath]:
                                                          serverTime
                                                      }))
                                                      setInputMode(prev => ({
                                                        ...prev,
                                                        [componentPath]:
                                                          'serverTime'
                                                      }))
                                                      updateSegmentStatus(
                                                        segmentKey,
                                                        serverTime
                                                      ) // Update status for Server Time
                                                    }}
                                                  >
                                                    Use Server Time
                                                  </button>
                                                ) : (
                                                  <button
                                                    className={`switch-button ${
                                                      inputMode[
                                                        componentPath
                                                      ] === 'textbox'
                                                        ? 'active'
                                                        : ''
                                                    }`}
                                                    onClick={() =>
                                                      switchToTextbox(
                                                        componentPath
                                                      )
                                                    }
                                                  >
                                                    Use Textbox
                                                  </button>
                                                )}
                                              </div>

                                              {/* Conditional Input Rendering */}
                                              {inputMode[componentPath] ===
                                                'dropdown' && (
                                                <select
                                                  className='json-key-dropdown'
                                                  value={
                                                    mappedValues[
                                                      getFieldKey(
                                                        segmentKey,
                                                        componentKey
                                                      )
                                                    ] || ''
                                                  }
                                                  onChange={e => {
                                                    const value =
                                                      e.target.value.trim()
                                                    const fieldKey =
                                                      getFieldKey(
                                                        segmentKey,
                                                        componentKey
                                                      )
                                                    console.log(
                                                      'value in dropdown: ',
                                                      value
                                                    )

                                                    setMappedValues(prev => ({
                                                      ...prev,
                                                      [fieldKey]: value
                                                    }))
                                                    console.log(
                                                      'fieldKey: ',
                                                      fieldKey
                                                    )
                                                    console.log(
                                                      'mappedvalues C: ',
                                                      mappedValues
                                                    )

                                                    updateSegmentStatus(
                                                      segmentKey,
                                                      value
                                                    ) // Update status for dropdown change
                                                  }}
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

                                              {inputMode[componentPath] ===
                                                'textbox' &&
                                                component.data_type !== 'DT' &&
                                                component.data_type !==
                                                  'DTM' && (
                                                  <input
                                                    type='text'
                                                    className='component-textbox'
                                                    value={
                                                      mappedValues[
                                                        getFieldKey(
                                                          segmentKey,
                                                          componentKey
                                                        )
                                                      ] || ''
                                                    }
                                                    onChange={e =>
                                                      handleValueChange(
                                                        segmentKey,
                                                        componentKey,
                                                        e.target.value
                                                      )
                                                    }
                                                  />
                                                )}

                                              {inputMode[componentPath] ===
                                                'serverTime' && (
                                                <input
                                                  type='text'
                                                  className='component-textbox'
                                                  value={
                                                    mappedValues[
                                                      getFieldKey(
                                                        segmentKey,
                                                        componentKey
                                                      )
                                                    ] || ''
                                                  }
                                                  disabled
                                                  placeholder='Server Time'
                                                />
                                              )}

                                              {/* Toggle Switch */}
                                              <label className='toggle-switch'>
                                                <input
                                                  type='checkbox'
                                                  onChange={() =>
                                                    handleToggleChange(
                                                      segmentKey,
                                                      componentKey
                                                    )
                                                  }
                                                  checked={
                                                    toggleValidation[
                                                      getFieldKey(
                                                        segmentKey,
                                                        componentKey
                                                      )
                                                    ]?.isToggleOn || false
                                                  }
                                                />
                                                <span className='slider'></span>
                                              </label>
                                            </div>
                                          )}

                                          {/* Render Subcomponents */}
                                          {isComponentExpanded &&
                                            hasSubcomponents && (
                                              <div className='subcomponent-list'>
                                                {component.subcomponents.map(
                                                  subcomponent => {
                                                    const subcomponentPath = `${componentPath}.${subcomponent.subcomponent_position}`
                                                    const subcomponentKey = `${componentKey}.${subcomponent.subcomponent_position}`

                                                    return (
                                                      <div
                                                        className='subcomponent-row'
                                                        key={subcomponentPath}
                                                      >
                                                        <div className='subcomponent-header'>
                                                          {
                                                            subcomponent.subcomponent_position
                                                          }
                                                          .{' '}
                                                          {
                                                            subcomponent.subcomponent_name
                                                          }{' '}
                                                          (
                                                          {
                                                            subcomponent.data_type
                                                          }
                                                          )
                                                        </div>
                                                        <div className='input-container'>
                                                          {/* Input Switcher */}
                                                          <div className='input-switcher'>
                                                            <button
                                                              className={`switch-button ${
                                                                inputMode[
                                                                  subcomponentPath
                                                                ] === 'dropdown'
                                                                  ? 'active'
                                                                  : ''
                                                              }`}
                                                              onClick={() =>
                                                                setInputMode(
                                                                  prev => ({
                                                                    ...prev,
                                                                    [subcomponentPath]:
                                                                      'dropdown'
                                                                  })
                                                                )
                                                              }
                                                            >
                                                              Use Dropdown
                                                            </button>
                                                            {subcomponent.data_type ===
                                                              'DT' ||
                                                            subcomponent.data_type ===
                                                              'DTM' ? (
                                                              <button
                                                                className={`switch-button ${
                                                                  inputMode[
                                                                    subcomponentPath
                                                                  ] ===
                                                                  'serverTime'
                                                                    ? 'active'
                                                                    : ''
                                                                }`}
                                                                onClick={() => {
                                                                  const serverTime =
                                                                    'serverTime'

                                                                  setMappedValues(
                                                                    prev => ({
                                                                      ...prev,
                                                                      [subcomponentPath]:
                                                                        serverTime
                                                                    })
                                                                  )
                                                                  setInputMode(
                                                                    prev => ({
                                                                      ...prev,
                                                                      [subcomponentPath]:
                                                                        'serverTime'
                                                                    })
                                                                  )
                                                                  updateSegmentStatus(
                                                                    segmentKey,
                                                                    serverTime
                                                                  ) // Update status for Server Time
                                                                }}
                                                              >
                                                                Use Server Time
                                                              </button>
                                                            ) : (
                                                              <button
                                                                className={`switch-button ${
                                                                  inputMode[
                                                                    subcomponentPath
                                                                  ] ===
                                                                  'textbox'
                                                                    ? 'active'
                                                                    : ''
                                                                }`}
                                                                onClick={() =>
                                                                  switchToTextbox(
                                                                    subcomponentPath
                                                                  )
                                                                }
                                                              >
                                                                Use Textbox
                                                              </button>
                                                            )}
                                                          </div>

                                                          {/* Conditional Input Rendering */}
                                                          {inputMode[
                                                            subcomponentPath
                                                          ] === 'dropdown' && (
                                                            <select
                                                              className='json-key-dropdown'
                                                              value={
                                                                mappedValues[
                                                                  getFieldKey(
                                                                    segmentKey,
                                                                    subcomponentKey
                                                                  )
                                                                ] || ''
                                                              }
                                                              onChange={e => {
                                                                const value =
                                                                  e.target.value.trim()
                                                                const fieldKey =
                                                                  getFieldKey(
                                                                    segmentKey,
                                                                    subcomponentKey
                                                                  )

                                                                setMappedValues(
                                                                  prev => ({
                                                                    ...prev,
                                                                    [fieldKey]:
                                                                      value
                                                                  })
                                                                )

                                                                console.log(
                                                                  'fieldKey: ',
                                                                  fieldKey
                                                                )
                                                                console.log(
                                                                  'mappedvalues S: ',
                                                                  mappedValues
                                                                )

                                                                updateSegmentStatus(
                                                                  segmentKey,
                                                                  value
                                                                ) // Update status for dropdown change
                                                              }}
                                                            >
                                                              <option value=''>
                                                                Select JSON key
                                                              </option>
                                                              {jsonKeys.map(
                                                                (key, i) => (
                                                                  <option
                                                                    key={i}
                                                                    value={key}
                                                                  >
                                                                    {key}
                                                                  </option>
                                                                )
                                                              )}
                                                            </select>
                                                          )}

                                                          {inputMode[
                                                            subcomponentPath
                                                          ] === 'textbox' &&
                                                            subcomponent.data_type !==
                                                              'DT' &&
                                                            subcomponent.data_type !==
                                                              'DTM' && (
                                                              <input
                                                                type='text'
                                                                className='subcomponent-textbox'
                                                                value={
                                                                  mappedValues[
                                                                    getFieldKey(
                                                                      segmentKey,
                                                                      subcomponentKey
                                                                    )
                                                                  ] || ''
                                                                }
                                                                onChange={e =>
                                                                  handleValueChange(
                                                                    segmentKey,
                                                                    subcomponentKey,
                                                                    e.target
                                                                      .value
                                                                  )
                                                                }
                                                              />
                                                            )}

                                                          {inputMode[
                                                            subcomponentPath
                                                          ] ===
                                                            'serverTime' && (
                                                            <input
                                                              type='text'
                                                              className='subcomponent-textbox'
                                                              value={
                                                                mappedValues[
                                                                  getFieldKey(
                                                                    segmentKey,
                                                                    subcomponentKey
                                                                  )
                                                                ] || ''
                                                              }
                                                              disabled
                                                              placeholder='Server Time'
                                                            />
                                                          )}

                                                          {/* Toggle Switch */}
                                                          <label className='toggle-switch'>
                                                            <input
                                                              type='checkbox'
                                                              onChange={() =>
                                                                handleToggleChange(
                                                                  segmentKey,
                                                                  subcomponentKey
                                                                )
                                                              }
                                                              checked={
                                                                toggleValidation[
                                                                  getFieldKey(
                                                                    segmentKey,
                                                                    subcomponentKey
                                                                  )
                                                                ]?.isToggleOn ||
                                                                false
                                                              }
                                                            />
                                                            <span className='slider'></span>
                                                          </label>
                                                        </div>
                                                      </div>
                                                    )
                                                  }
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
                          })
                        ) : (
                          <p>No required fields available.</p>
                        )}
                      </div>
                    </div>
                  )
                })}
              {/* ) : (
                <p>Please select a segment from the sidebar.</p>
              )} */}

              {data[selectedSegment]?.repeating && (
                <div className='button-container'>
                  {repeatedSegments[selectedSegment] > 1 ? (
                    <>
                      <button
                        className='add-button'
                        onClick={() =>
                          handleAddSegment(selectedSegment.split('.')[0])
                        }
                      >
                        ADD
                      </button>
                      <button
                        className='delete-button'
                        onClick={() =>
                          handleDeleteSegment(selectedSegment.split('.')[0])
                        }
                      >
                        DELETE
                      </button>
                    </>
                  ) : (
                    <button
                      className='add-button'
                      onClick={() =>
                        handleAddSegment(selectedSegment.split('.')[0])
                      }
                    >
                      ADD
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>

          <div className='next-button-container'>
            <button className='next-button' onClick={handlePreviousStep}>
              Back
            </button>
            <button
              className='next-button'
              onClick={handleNext}
              disabled={isLoading}
            >
              {isLoading ? 'Creating...' : 'Create Channel'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default HL7MappingTool
