import { StrictMode, useRef } from 'react'
import { createRoot } from 'react-dom/client'
import { useState, useEffect } from 'react'
import { useTheme } from '@hooks/useTheme'
import { i18n } from '@utils/i18n'
import '@assets/styles/index.scss'

import ConfigManager from '@config/index.js'

import ChatHeader from './chat/components/ChatHeader.jsx'
import Welcome from '@components/Welcome.jsx'
import Chat from './chat/Chat.jsx'
import NoApiKey from '@components/NoApikey.jsx'
import TestPage from '../test/index.jsx'

const SidePanelPage = () => {
  const port = useRef(null)

  const [hasApiKey, setHasApiKey] = useState(false)
  const [messages, setMessages] = useState([])

  const { loadTheme } = useTheme()

  const checkApiKey = async () => {
    try {
      const config = await ConfigManager.get(['aiModel', 'openaiKey', 'qwenKey', 'deepseekKey'])
      const currentModel = config.aiModel || 'openai'
      const currentKey = config[`${currentModel}Key`]
      setHasApiKey(!!currentKey)
    } catch (error) {
      console.error('Failed to check API key:', error)
      setHasApiKey(false)
    }
  }
  // Check language settings
  const checkLanguage = async () => {
    try {
      const config = await ConfigManager.get(['language'])
      const currentLanguage = config.language || 'English'
      i18n.setLanguage(currentLanguage)
    } catch (error) {
      console.error('Failed to check language:', error)
    }
  }
  // Check API key when component mounts and receives messages
  useEffect(() => {
    checkApiKey()
    loadTheme()
    checkLanguage()
    // Listen for messages from options page
    const handleMessage = (message) => {
      if (message.type === 'settings_updated') {
        checkApiKey()
        loadTheme()
        checkLanguage()
      }
    }

    chrome.runtime.onMessage.addListener(handleMessage)
    port.current = chrome.runtime.connect({ name: 'sidepanel-connection' })
    return () => {
      chrome.runtime.onMessage.removeListener(handleMessage)
      if (port.current) {
        port.current.disconnect()
      }
    }
  }, [])

  return (
    <div className='sidepanel'>
      <ChatHeader />
      {/* <TestPage/> */}
      <div className='chat'>
        {messages.length === 0 && <Welcome />}
        {hasApiKey ? <Chat onMessagesChange={setMessages} /> : <NoApiKey />}
      </div>
    </div>
  )
}

const root = createRoot(document.getElementById('app'))
root.render(
  <StrictMode>
    <SidePanelPage />
  </StrictMode>,
)
