import '../../pages/homepage/homepage.css'
import classNames from 'classnames'

function AppModal ({ heading, bodyText, onYesClick, onNoClick, redBtn }) {
  return (
    <div className={'app-modal-backdrop'}>
      <div className={'app-modal'}>
        <div className={'app-modal-heading'}>{heading}</div>
        <div className={'app-modal-body'}>
          {bodyText.split(/\n+/).map((line, index) => (
            <div key={index}>{line}</div>
          ))}
          {/*{bodyText}*/}
        </div>
        <div className={'app-modal-footer'}>
          <button
            onClick={() => {
              onYesClick()
            }}
            className={classNames(
              'app-modal-btn',
              redBtn ? 'app-modal-danger-btn' : 'app-modal-primary-btn'
            )}
          >
            Yes
          </button>
          <button
            onClick={() => {
              onNoClick()
            }}
            className={'app-modal-btn app-modal-secondary-btn'}
          >
            No
          </button>
        </div>
      </div>
    </div>
  )
}

export default AppModal
