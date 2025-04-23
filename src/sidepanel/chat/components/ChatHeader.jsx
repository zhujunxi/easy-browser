import settingsIcon from '@assets/icon/settings.svg'
import newChatIcon from '@assets/icon/new-chat.svg'

const ChatHeader = () => {
  const handleSettingsClick = () => {
    chrome.runtime.openOptionsPage()
  }
  return (
    <div className='chat-header'>
      <div className='title'></div>
      <div className='tool'>
        <div className='tool-item' onClick={handleSettingsClick}>
          <img src={settingsIcon} alt='settings' />
        </div>
      </div>
    </div>
  )
}

export default ChatHeader
