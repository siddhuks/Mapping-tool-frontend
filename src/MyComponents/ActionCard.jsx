import React from 'react'
import '../pages/homepage/homepage.css'
import { useNavigate } from 'react-router-dom'

const ActionCard = ({ icon, label, navigateTo }) => {
  const navigate = useNavigate()

  const handleClick = () => {
    if (navigateTo) {
      navigate(navigateTo)
    }
  }

  return (
    <div className='action-card' onClick={handleClick}>
      <div className={`icon-hp icon-${icon}`}> </div> <p> {label} </p>{' '}
    </div>
  )
}

export default ActionCard
