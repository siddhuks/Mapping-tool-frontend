import React from 'react'
import '../pages/template/template.css' // Ensure Header-specific CSS is included

const Header = ({ heading }) => {
  return (
    <header className='header-container'>
      <h1>{heading}</h1>
    </header>
  )
}

export default Header
