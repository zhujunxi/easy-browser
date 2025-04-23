import { useState, useRef } from 'react'
import newChatIcon from '@assets/icon/new-chat.svg'
import { useI18n } from '@hooks/useI18n'
import TaskExample from './TaskExample'

const ChatInput = ({ onInputChange, messages, isRequesting, onCancel, onReset }) => {
  const { t } = useI18n()

  const inputRef = useRef(null)
  const [inputValue, setInputValue] = useState('')

  const handleInputChange = (e) => {
    setInputValue(e.target.value)
  }

  const [isComposing, setIsComposing] = useState(false)

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey && !isComposing) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const handleCompositionStart = () => {
    setIsComposing(true)
  }

  const handleCompositionEnd = () => {
    setIsComposing(false)
  }

  const handleSendMessage = () => {
    if (isRequesting) {
      // If currently requesting, call cancel method
      if (onCancel) onCancel()
    } else if (inputValue) {
      // Otherwise send message
      onInputChange(inputValue)
      setInputValue('')
    }
  }
  return (
    <div className='input-wrap'>
      {messages.length === 0 && <TaskExample onTaskClick={onInputChange} />}
      <div className='input-container'>
        <textarea
          id='userInput'
          placeholder={t('chat.inputPlaceholder')}
          ref={inputRef}
          value={inputValue}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onCompositionStart={handleCompositionStart}
          onCompositionEnd={handleCompositionEnd}
          onFocus={(e) => e.target.closest('.input-container').classList.add('focus')}
          onBlur={(e) => e.target.closest('.input-container').classList.remove('focus')}
        ></textarea>
        <div className='input-tools'>
          {messages.length > 0 && (
            <div className='new-chat' onClick={onReset}>
              <img src={newChatIcon} alt='settings' />
            </div>
          )}
          <button
            className={`send ${isRequesting ? 'stop' : ''}`}
            disabled={!inputValue && !isRequesting}
            onClick={handleSendMessage}
          ></button>
        </div>
      </div>
    </div>
  )
}

export default ChatInput
