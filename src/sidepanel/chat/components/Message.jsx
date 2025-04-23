import React, { useState, useEffect } from 'react'
import { MESSAGE_TYPES } from '../services/ChatConstants'
import ReactMarkdown from 'react-markdown'
import 'github-markdown-css/github-markdown-light.css'
import userConfirm from '@services/browser/userConfirm.js'
import { useI18n } from '@hooks/useI18n'

/**
 * MessageRenderer Component - renders the message
 */
export const MessageRenderer = ({ message, index }) => {
  switch (message.type) {
    case MESSAGE_TYPES.ASSISTANT:
      return <AssistantMessage key={index} message={message} />
    case MESSAGE_TYPES.USER:
      return (
        <div key={index} className='message user-message'>
          {message.content}
        </div>
      )
    case MESSAGE_TYPES.TOOL:
      return <ToolMessage key={index} tools={message.tools} />
    default:
      return null
  }
}

const AssistantMessage = ({ message }) => {
  return message.status === 'success' ? (
    <div className='message assistant-message markdown-body'>
      <ReactMarkdown>{message.content}</ReactMarkdown>
    </div>
  ) : (
    <div className='message assistant-message assistant-message-error'>
      <div className={`tool-status ${message.status}`}>
        <div className='status-background'>
          <div className='status-inner'>
            <div className='status-checkmark'></div>
          </div>
        </div>
      </div>
      <div className='tool-content'>{message.content}</div>
    </div>
  )
}

/**
 * ToolMessage Component - renders the tool message
 */
export const ToolMessage = ({ tools }) => {
  const { t } = useI18n()
  const renderToolContent = (tool) => {
    const toolsNameToText = {
      createTab: (args) => `${t('tool.create_tab')}：${args.url}`,
      getCurrentTab: () => `${t('tool.get_current_tab')}`,
      getAllTabs: () => `${t('tool.get_all_tabs')}`,
      closeTabs: () => `${t('tool.close_tabs')}`,
      reloadTab: () => `${t('tool.reload_tab')}`,
      updateTab: () => `${t('tool.update_tab')}`,
      typeText: (args) => `${t('tool.type_text')}：${args.text}`,
      clickElement: (args) => `${t('tool.click_element')}`,
      getScreenStructure: () => t('tool.get_screen_structure'),
      getScreenContent: () => t('tool.get_screen_content'),
      scrollScreen: () => t('tool.scroll_screen'),
    }

    switch (tool.call) {
      case 'userConfirm':
        return <UserComfirmTool reason={tool.args.reason}></UserComfirmTool>
      case 'wait':
        return <WaitTool seconds={tool.args.seconds}></WaitTool>
      default:
        return <div className='tool-content'>{toolsNameToText[tool.call]?.(tool.args)}</div>
    }
  }
  return (
    <div className='task-container'>
      {tools.map((tool, index) => (
        <div className='message tool-message' key={index}>
          <div className={`tool-status ${tool.status}`}>
            <div className='status-background'>
              <div className='status-inner'>
                <div className='status-checkmark'></div>
              </div>
            </div>
          </div>
          <div className='timeline'></div>
          <div className='tool-wrap'>
            <img
              className='tool-icon'
              src={`../../assets/tool/${tool.call}.png`}
              alt={`${tool.call} icon`}
            />
            {renderToolContent(tool)}
          </div>
        </div>
      ))}
    </div>
  )
}

const UserComfirmTool = ({ reason }) => {
  const { t } = useI18n()
  const [isConfirm, SetIsConfirm] = useState(true)
  const handleConfirm = () => {
    userConfirm.confirmComplete()
    SetIsConfirm(false)
  }
  const handleCancel = () => {
    userConfirm.confirmCancel()
    SetIsConfirm(false)
  }
  return (
    <div className='tool-content'>
      {reason}
      {isConfirm && (
        <div className='tool-content-ft'>
          <button className='tool-content-btn btn-cancel' onClick={handleCancel}>
            {' '}
            {t('tool.tool_cancel')}{' '}
          </button>
          <button className='tool-content-btn btn-confirm' onClick={handleConfirm}>
            {' '}
            {t('tool.tool_confirm')}{' '}
          </button>
        </div>
      )}
    </div>
  )
}

const WaitTool = ({ seconds }) => {
  const [count, setCount] = useState(seconds)
  useEffect(() => {
    if (count <= 0) return

    const timer = setTimeout(() => {
      setCount(count - 1)
    }, 1000)

    return () => clearTimeout(timer)
  }, [count])
  return <div className='tool-content'>{count > 0 ? `delay：${count}s` : 'ok'}</div>
}
