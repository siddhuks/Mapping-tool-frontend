import React, { useEffect, useState } from 'react'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom'
import Pages from './pages'
import './utils/appStyles.css'
import utils from './utils'
import './App.css'

function App () {
  const [isSession, setIsSession] = useState(true)
  // const [showHeader, setShowHeader] = useState(true)

  useEffect(() => {
    // localStorage.clear() // to clear all the localstorage items
    let token = sessionStorage.getItem('token')
    setIsSession(token !== null && token !== '')
    console.log('Path ', utils.constants.path.template)
    // setShowHeader(window.location.pathname !== utils.constants.path.storyBoard)
    console.log(':: TOKEN ', token)
    if (token && window.location.pathname === utils.constants.path.login) {
      window.open(utils.constants.path.homepage, '_self')
    }
  }, [])

  return (
    <Router>
      {/* {!isSession ? ( */}
      <Routes>
        <Route
          exact
          path={utils.constants.path.login}
          element={<Pages.Login />}
        />
        {
          console.log('Login part: ', isSession)

          /* <Route
            path={utils.constants.path.register}
            element={<Pages.Register />}
          /> */
        }
      </Routes>
      {/* ) : ( */}
      <>
        <div className={'container'}>
          <div className={'header'} />
          {
            /* <div className={'content-container'}> */
            console.log('Homepage part: ', isSession)
          }
          <Routes>
            <Route
              path={utils.constants.path.homepage}
              element={<Pages.Homepage />}
            />
            <Route
              path={utils.constants.path.template}
              element={<Pages.Template />}
            />
            <Route
              path={utils.constants.path.alerts}
              element={<Pages.Alerts />}
            />
            <Route
              path={utils.constants.path.deployed}
              element={<Pages.DeployedPage />}
            />
            <Route
              path={utils.constants.path.uploadAndSendPage}
              element={<Pages.UploadAndSendPage />}
            />
            <Route
              path={utils.constants.path.hl7message}
              element={<Pages.HL7Messages />}
            />
          </Routes>
        </div>
        {/* </div> */}
      </>
      {/* )} */}
    </Router>
  )
}

export default App
