import { useEffect, useRef, useCallback } from 'react'
import loadingIcon from '@assets/icon/loading.svg'
import ChatInput from './components/ChatInput.jsx'
import { MessageRenderer } from './components/Message.jsx'
import { useChat } from './providers/ChatProvider.jsx'
import ChatOrchestrator from '@services/chat/orchestrator.js'
import Welcome from '@components/Welcome.jsx'
import '@assets/styles/components.scss'
import './Chat.scss'

/**
 * Chat Component - Main chat interface
 * Uses ChatProvider for state and ChatOrchestrator for logic
 */
const Chat = () => {
  const { messages, isRequesting, ...actions } = useChat()
  const chatContainerRef = useRef(null)
  const orchestratorRef = useRef(null)

  useEffect(() => {
    orchestratorRef.current = new ChatOrchestrator(actions)
    orchestratorRef.current.init()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight
    }
  }, [messages])

  const sendMessage = useCallback(async (inputText) => {
    if (orchestratorRef.current) {
      await orchestratorRef.current.sendMessage(inputText)
    }
  }, [])

  const cancelRequest = useCallback(() => {
    if (orchestratorRef.current) {
      orchestratorRef.current.cancelRequest()
    }
  }, [])

  const resetChat = useCallback(() => {
    if (orchestratorRef.current) {
      orchestratorRef.current.reset()
    }
  }, [])

  return (
    <div className='chat-container'>
      <div className='message-container' id='chatContainer' ref={chatContainerRef}>
        {messages.length === 0 && <Welcome />}

        {messages.map((message, index) => (
          <MessageRenderer key={`msg-${index}`} message={message} index={index} />
        ))}

        {isRequesting && (
          <div className='loading-container'>
            <img src={loadingIcon} alt='loading' className='loading-icon' />
          </div>
        )}
      </div>

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
