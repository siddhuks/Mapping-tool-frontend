import React from 'react'

const FileUpload = ({ onFileUpload }) => {
  return (
    <div className='file-upload'>
      <label htmlFor='fileUpload'>Upload JSON File:</label>
      <input
        type='file'
        id='fileUpload'
        accept='.json, .xml'
        onChange={onFileUpload}
      />
    </div>
  )
}

export default FileUpload
