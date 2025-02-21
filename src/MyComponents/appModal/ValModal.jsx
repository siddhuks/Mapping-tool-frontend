import React, { useEffect } from 'react'
import './valModal.css' // Adjust path accordingly

const ValModal = ({
  isOpen,
  onClose,
  validationType,
  setValidationType,
  availableValidationTypes,
  operator,
  setOperator,
  validationValue,
  setValidationValue,
  onSave,
  fieldValidations,
  selectedFieldPath,
  handleDeleteValidation,
  trimWhitespace,
  setTrimWhitespace
}) => {
  useEffect(() => {
    if (selectedFieldPath && fieldValidations[selectedFieldPath]) {
      const hasTrim = fieldValidations[selectedFieldPath].some(
        rule => rule.trim === true
      )
      setTrimWhitespace(prev => ({
        ...prev,
        [selectedFieldPath]: hasTrim // Ensure it's retained
      }))
    }
  }, [selectedFieldPath, fieldValidations, setTrimWhitespace])

  if (!isOpen) return null

  return (
    <div className='val-modal-backdrop'>
      <div className='val-modal'>
        <h2>Add Validation Rule</h2>
        {/* Validation Type Dropdown */}
        <label>Validation Type</label>
        <select
          value={validationType}
          onChange={e => setValidationType(e.target.value)}
        >
          {availableValidationTypes.length > 0 ? (
            availableValidationTypes.map((type, index) => (
              <option key={index} value={type}>
                {type}
              </option>
            ))
          ) : (
            <option disabled>No options available</option>
          )}
        </select>
        {/* Operator Dropdown */}
        <label>Operator</label>
        <select value={operator} onChange={e => setOperator(e.target.value)}>
          <option value='<'>{'<'}</option>
          <option value='='>{'='}</option>
        </select>
        {/* Validation Value Input */}
        <label>Value</label>
        <input
          type='text'
          value={validationValue}
          onChange={e => setValidationValue(e.target.value)}
        />

        <div className='checkbox-container'>
          <input
            type='checkbox'
            id='trimCheckbox'
            checked={trimWhitespace[selectedFieldPath] || false} // Use per-field state
            onChange={e =>
              setTrimWhitespace(prev => ({
                ...prev,
                [selectedFieldPath]: e.target.checked
              }))
            }
          />
          <label htmlFor='trimCheckbox'>Trim Whitespace</label>
        </div>
        {/* Display saved validation rules inside the modal */}
        {fieldValidations[selectedFieldPath] &&
          fieldValidations[selectedFieldPath].some(
            rule => rule.validationType && rule.value
          ) && (
            <div className='validation-rules'>
              <h4>Existing Rules for {selectedFieldPath}:</h4>
              {fieldValidations[selectedFieldPath].map((rule, index) =>
                rule.validationType && rule.value ? ( // Only render non-empty rules
                  <div key={index} className='validation-item'>
                    <span>{rule.validationType}</span>
                    <span>{rule.operator}</span>
                    <span>{rule.value}</span>
                    <button
                      className='delete-validation'
                      onClick={() =>
                        handleDeleteValidation(
                          selectedFieldPath,
                          rule.validationType
                        )
                      }
                    >
                      ❌
                    </button>
                  </div>
                ) : null
              )}
            </div>
          )}

        {/* Modal Footer Buttons */}
        <div className='val-modal-footer'>
          <button className='val-modal-save' onClick={onSave}>
            Save
          </button>
          <button className='val-modal-cancel' onClick={onClose}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  )
}

export default ValModal
