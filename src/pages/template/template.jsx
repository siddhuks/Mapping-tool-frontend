import React from 'react'
import Header from '../../MyComponents/Header'
import FileUpload from '../../MyComponents/FileUpload'
import HL7MappingTool from '../../MyComponents/HL7MappingTool'
import utils from '../../utils'
import Arrrowback from '../../assets/arrow_back.png'
import { useNavigate } from 'react-router-dom'

import './template.css'

const Template = () => {
  const navigate = useNavigate()

  const handleBack = () => {
    navigate('/homepage')
  }

  return (
    <div className='container'>
      <div className='back-button-container'>
        <button className='back-button' onClick={handleBack}>
          <img src={Arrrowback} alt='Arrowback' className='back-logo' />
        </button>
      </div>

      <Header heading={'JSON to HL7 Mapping'} />
      {/* <FileUpload /> */}
      <HL7MappingTool />
    </div>
  )
}

export default Template
