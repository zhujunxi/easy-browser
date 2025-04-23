import { useState, useEffect, useRef, useCallback } from 'react'
import loadingIcon from '@assets/icon/loading.svg'
import ChatInput from './components/ChatInput.jsx'
import { MessageRenderer } from './components/Message.jsx'
import ChatService from './services/ChatService.js'
import '@assets/styles/components.scss'
import './Chat.scss'
/**
 * Chat Component - Main chat component
 */
const Chat = ({ onMessagesChange }) => {
  const [messages, setMessages] = useState([])
  const [isRequesting, setIsRequesting] = useState(false)

  const chatContainerRef = useRef(null)

  const chatServiceRef = useRef(null)

  useEffect(() => {
    chatServiceRef.current = new ChatService(messages, setMessages, setIsRequesting)
  }, [])

  useEffect(() => {
    if (onMessagesChange) {
      onMessagesChange(messages)
    }
  }, [messages, onMessagesChange])

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight
    }
  }, [messages])

  // Send user message
  const sendMessage = useCallback(async (inputText) => {
    if (chatServiceRef.current) {
      await chatServiceRef.current.sendMessage(inputText)
    }
  }, [])

  // Cancel request
  const cancelRequest = useCallback(() => {
    if (chatServiceRef.current) {
      chatServiceRef.current.cancelRequest()
    }
  }, [])

  // Reset chat
  const resetChat = useCallback(() => {
    if (chatServiceRef.current) {
      chatServiceRef.current.reset()
    }
  }, [])

  return (
    <div className='chat-container'>
      {/* Message container */}
      <div className='message-container' id='chatContainer' ref={chatContainerRef}>
        {messages.map((message, index) => (
          <MessageRenderer key={`msg-${index}`} message={message} index={index} />
        ))}

        {/* Loading indicator */}
        {isRequesting && (
          <div className='loading-container'>
            <img src={loadingIcon} alt='loading' className='loading-icon' />
          </div>
        )}
      </div>

      {/* Chat input */}
      <ChatInput
        onInputChange={sendMessage}
        messages={messages}
        isRequesting={isRequesting}
        onCancel={isRequesting ? cancelRequest : null}
        onReset={resetChat}
      />
    </div>
  )
}

export default Chat
