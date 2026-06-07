import { StrictMode, useRef } from 'react'
import { createRoot } from 'react-dom/client'
import { useState, useEffect } from 'react'
import { useTheme } from '@hooks/useTheme'
import { i18n } from '@i18n/index'
import '@styles/index.scss'

import ConfigManager from '@services/storage.js'

import ChatHeader from './chat/components/ChatHeader.jsx'
import Chat from './chat/Chat.jsx'
import NoApiKey from '@sidepanel/components/NoApiKey.jsx'
import TestPage from '../test/index.jsx'
import { ChatProvider } from './stores/ChatStore.jsx'

const SidePanelPage = () => {
  const port = useRef(null)

  const [hasApiKey, setHasApiKey] = useState(false)
  const [showTest, setShowTest] = useState(false)

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
  const checkLanguage = async () => {
    try {
      const config = await ConfigManager.get(['language'])
      const currentLanguage = config.language || 'English'
      i18n.setLanguage(currentLanguage)
    } catch (error) {
      console.error('Failed to check language:', error)
    }
  }
  useEffect(() => {
    checkApiKey()
    loadTheme()
    checkLanguage()
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
      <ChatHeader showTest={showTest} onToggleTest={() => setShowTest(!showTest)} />
      {typeof __TEST_MODE__ !== 'undefined' && __TEST_MODE__ && showTest ? (
        <TestPage />
      ) : (
        <div className='chat'>
          {hasApiKey ? (
            <ChatProvider>
              <Chat />
            </ChatProvider>
          ) : (
            <NoApiKey />
          )}
        </div>
      )}
    </div>
  )
}

const root = createRoot(document.getElementById('app'))
root.render(
  <StrictMode>
    <SidePanelPage />
  </StrictMode>,
)
