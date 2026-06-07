/**
 * ChatProvider - Centralized chat state management
 * Uses useReducer + Context to replace scattered state in Chat.jsx and ChatService
 */

import { createContext, useContext, useReducer, useCallback, useRef } from 'react'
import { v4 as uuidv4 } from 'uuid'
import { MESSAGE_TYPES, MESSAGE_STATUS } from '../services/ChatConstants.js'

// Action types
const ACTIONS = {
  ADD_MESSAGE: 'ADD_MESSAGE',
  UPDATE_MESSAGE: 'UPDATE_MESSAGE',
  UPDATE_MESSAGE_STATUS: 'UPDATE_MESSAGE_STATUS',
  UPDATE_ASSISTANT_CONTENT: 'UPDATE_ASSISTANT_CONTENT',
  ADD_TOOL_CALL: 'ADD_TOOL_CALL',
  ADD_TOOL_MESSAGE: 'ADD_TOOL_MESSAGE',
  UPDATE_TOOL_STATUS: 'UPDATE_TOOL_STATUS',
  CLEAR_MESSAGES: 'CLEAR_MESSAGES',
  SET_REQUESTING: 'SET_REQUESTING',
}

const ChatContext = createContext(null)
const ChatDispatchContext = createContext(null)

const initialState = {
  messages: [],
  isRequesting: false,
}

function chatReducer(state, action) {
  switch (action.type) {
    case ACTIONS.ADD_MESSAGE: {
      const message = {
        ...action.payload,
        id: action.payload.id || uuidv4(),
        timestamp: action.payload.timestamp || new Date().toISOString(),
      }
      return { ...state, messages: [...state.messages, message] }
    }

    case ACTIONS.UPDATE_MESSAGE: {
      return {
        ...state,
        messages: state.messages.map((msg) =>
          msg.id === action.payload.id ? { ...msg, ...action.payload.updates } : msg,
        ),
      }
    }

    case ACTIONS.UPDATE_MESSAGE_STATUS: {
      return {
        ...state,
        messages: state.messages.map((msg) =>
          msg.id === action.payload.id ? { ...msg, status: action.payload.status } : msg,
        ),
      }
    }

    case ACTIONS.UPDATE_ASSISTANT_CONTENT: {
      return {
        ...state,
        messages: state.messages.map((msg) =>
          msg.id === action.payload.id
            ? { ...msg, content: action.payload.content, status: MESSAGE_STATUS.LOADING }
            : msg,
        ),
      }
    }

    case ACTIONS.ADD_TOOL_MESSAGE: {
      const toolMsg = {
        id: uuidv4(),
        type: MESSAGE_TYPES.TOOL,
        content: '',
        tools: [],
        timestamp: new Date().toISOString(),
      }
      return { ...state, messages: [...state.messages, toolMsg] }
    }

    case ACTIONS.ADD_TOOL_CALL: {
      const toolCall = {
        id: action.payload.id,
        call: action.payload.name,
        text: action.payload.name,
        args: action.payload.args,
        status: MESSAGE_STATUS.LOADING,
      }
      return {
        ...state,
        messages: state.messages.map((msg) =>
          msg.id === action.payload.messageId && msg.type === MESSAGE_TYPES.TOOL
            ? { ...msg, tools: [...(msg.tools || []), toolCall] }
            : msg,
        ),
      }
    }

    case ACTIONS.UPDATE_TOOL_STATUS: {
      return {
        ...state,
        messages: state.messages.map((msg) =>
          msg.id === action.payload.messageId && msg.type === MESSAGE_TYPES.TOOL
            ? {
                ...msg,
                tools: msg.tools.map((t) =>
                  t.id === action.payload.toolId ? { ...t, status: action.payload.status } : t,
                ),
              }
            : msg,
        ),
      }
    }

    case ACTIONS.CLEAR_MESSAGES:
      return { ...state, messages: [], isRequesting: false }

    case ACTIONS.SET_REQUESTING:
      return { ...state, isRequesting: action.payload }

    default:
      return state
  }
}

export function ChatProvider({ children }) {
  const [state, dispatch] = useReducer(chatReducer, initialState)
  const stateRef = useRef(state)
  stateRef.current = state

  const addUserMessage = useCallback((content) => {
    dispatch({
      type: ACTIONS.ADD_MESSAGE,
      payload: { type: MESSAGE_TYPES.USER, content },
    })
  }, [])

  const addAssistantMessage = useCallback((content, status = MESSAGE_STATUS.SUCCESS) => {
    const id = uuidv4()
    dispatch({
      type: ACTIONS.ADD_MESSAGE,
      payload: { id, type: MESSAGE_TYPES.ASSISTANT, content, status },
    })
    return id
  }, [])

  const updateAssistantContent = useCallback((id, content) => {
    dispatch({
      type: ACTIONS.UPDATE_ASSISTANT_CONTENT,
      payload: { id, content },
    })
  }, [])

  const updateMessageStatus = useCallback((id, status) => {
    dispatch({
      type: ACTIONS.UPDATE_MESSAGE_STATUS,
      payload: { id, status },
    })
  }, [])

  const addToolMessage = useCallback(() => {
    dispatch({ type: ACTIONS.ADD_TOOL_MESSAGE })
    const newMessages = stateRef.current.messages
    const toolMsg = newMessages[newMessages.length - 1]
    return toolMsg?.id
  }, [])

  const addToolCall = useCallback((messageId, toolCallId, name, args) => {
    dispatch({
      type: ACTIONS.ADD_TOOL_CALL,
      payload: { messageId, id: toolCallId, name, args },
    })
  }, [])

  const updateToolStatus = useCallback((messageId, toolId, status) => {
    dispatch({
      type: ACTIONS.UPDATE_TOOL_STATUS,
      payload: { messageId, toolId, status },
    })
  }, [])

  const clearMessages = useCallback(() => {
    dispatch({ type: ACTIONS.CLEAR_MESSAGES })
  }, [])

  const setRequesting = useCallback((isRequesting) => {
    dispatch({ type: ACTIONS.SET_REQUESTING, payload: isRequesting })
  }, [])

  const value = {
    messages: state.messages,
    isRequesting: state.isRequesting,
    addUserMessage,
    addAssistantMessage,
    updateAssistantContent,
    updateMessageStatus,
    addToolMessage,
    addToolCall,
    updateToolStatus,
    clearMessages,
    setRequesting,
  }

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>
}

export function useChat() {
  const context = useContext(ChatContext)
  if (!context) {
    throw new Error('useChat must be used within a ChatProvider')
  }
  return context
}

export default ChatProvider
