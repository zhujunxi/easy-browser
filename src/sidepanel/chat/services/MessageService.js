/**
 * MessageService.js
 */
import { v4 as uuidv4 } from 'uuid'
import { MESSAGE_TYPES, MESSAGE_STATUS } from './ChatConstants.js'

class MessageService {
  constructor(messages, setMessages) {
    this.messages = messages
    this.setMessages = setMessages
  }

  /**
   * add message
   * @param {Object} newMessage
   */
  addMessage(message) {
    const messageWithId = {
      ...message,
      id: message.id || uuidv4(),
      timestamp: message.timestamp || new Date().toISOString(),
    }

    this.setMessages((prevMessages) => [...prevMessages, messageWithId])

    return messageWithId
  }

  /**
   * add user message
   * @param {string} text
   */
  addUserMessage(content) {
    return this.addMessage({
      type: MESSAGE_TYPES.USER,
      content,
    })
  }

  /**
   * add assistant message
   * @param {string} text
   * @param {string} status
   */
  addAssistantMessage(content, status = MESSAGE_STATUS.SUCCESS) {
    return this.addMessage({
      type: MESSAGE_TYPES.ASSISTANT,
      content,
      status,
    })
  }
  /**
   * update assistant message
   * @param {string} messageId
   * @param {string} newContent
   */
  updateAssistantMessage(messageId, content, status = MESSAGE_STATUS.SUCCESS) {
    this.setMessages((prevMessages) => {
      return prevMessages.map((message) => {
        if (message.id === messageId && message.type === MESSAGE_TYPES.ASSISTANT) {
          return {
            ...message,
            content,
            status,
          }
        }
        return message
      })
    })
  }
  /**
   * add tool message
   */
  addToolCallMessage(content = '') {
    return this.addMessage({
      type: MESSAGE_TYPES.TOOL,
      content,
      tools: [],
    })
  }
  /**
   * add tool call message
   * @param {string} messageId
   * @param {string} newContent
   */
  addCall(messageID, toolCall) {
    const newToolCall = {
      id: toolCall.id,
      call: toolCall.function.name,
      text: toolCall.function.name,
      args: JSON.parse(toolCall.function.arguments),
      status: MESSAGE_STATUS.LOADING,
    }

    this.setMessages((prevMessages) => {
      return prevMessages.map((message) => {
        if (message.id === messageID && message.type === 'tool') {
          return {
            ...message,
            tools: message.tools ? [...message.tools, newToolCall] : [newToolCall], // 如果已有tools，追加新的toolCall
          }
        }

        return message
      })
    })
  }
  /**
   * update tool message status
   * @param {string} toolId
   * @param {string} status
   */
  updateToolStatus(messageID, toolID, status) {
    return new Promise((resolve) => {
      this.setMessages((prevMessages) => {
        const newMessages = prevMessages.map((message) => {
          if (message.id === messageID && message.type === MESSAGE_TYPES.TOOL) {
            return {
              ...message,
              tools: message.tools.map((tool) => {
                if (tool.id === toolID) {
                  return {
                    ...tool,
                    status,
                  }
                }
                return tool
              }),
            }
          }
          return message
        })
        resolve()
        return newMessages
      })
    })
  }
  /**
   * get message by id
   * @param {string} id
   * @returns {Object|null}
   */
  getMessageById(id) {
    const message = this.messages.find((msg) => msg.id === id)
    return message || null
  }

  /**
   * update message status
   * @param {string} id
   * @param {string} status
   */
  updateMessageStatus(id, status) {
    const message = this.getMessageById(id)
    if (message) {
      message.status = status
      this.setMessages([...this.messages])
    }
  }

  /**
   * clear messages
   */
  clearMessages() {
    this.setMessages([])
  }
}

export default MessageService
