import settingsIcon from '@assets/icon/settings.svg'

const ChatHeader = ({ showTest, onToggleTest }) => {
  const handleSettingsClick = () => {
    chrome.runtime.openOptionsPage()
  }
  return (
    <div className='chat-header'>
      <div className='title'>
        <div className='tool-item' onClick={onToggleTest} title={showTest ? 'Back to Chat' : 'Test'}>
          <span className='test-icon'>{showTest ? '←' : '🧪'}</span>
        </div>
      </div>
      <div className='tool'>
        <div className='tool-item' onClick={handleSettingsClick}>
          <img src={settingsIcon} alt='settings' />
        </div>
      </div>
    </div>
  )
}

export default ChatHeader
