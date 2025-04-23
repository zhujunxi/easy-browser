/**
 * ChatService.js
 */

import { MESSAGE_STATUS, SYSTEM_PROMPT } from './ChatConstants.js'
import MessageService from './MessageService.js'
import { AI_REQUEST_OPTIONS } from './ChatConstants.js'
import LlmService from '@services/llm/index.js'
import { Calls } from '@services/browser/index.js'

class ChatService {
  constructor(messages, setMessages, setIsRequesting) {
    this.messageService = new MessageService(messages, setMessages)
    this.setIsRequesting = setIsRequesting
    this.isRequestingRef = { current: false }
    this.requestMessage = [{ role: 'system', content: SYSTEM_PROMPT }]

    this.currentSequence = {
      assistantMessageId: null,
      toolMessageId: null,
      isProcessingToolCall: false,
      currentContent: '',
    }
  }

  /**
   * set request status
   * @param {Function} setIsRequesting
   * @param {boolean} status
   */
  setRequestStatus(setIsRequesting, status) {
    setIsRequesting(status)
    this.isRequestingRef.current = status
  }

  /**
   * send message function
   * @param {string} inputText
   */
  async sendMessage(inputText) {
    // reset sequence
    this.resetSequence()

    // add user message
    this.messageService.addUserMessage(inputText)

    // prepare request message
    this.requestMessage.push({ role: 'user', content: inputText })

    // fetching data
    await this.fetchData()
  }

  /**
   * reset sequence state
   */
  resetSequence() {
    this.currentSequence = {
      assistantMessageId: null,
      toolMessageId: null,
      isProcessingToolCall: false,
      currentContent: '', // 重置当前内容
    }
  }

  /**
   * handle stream chunk function
   * @param {Object} chunk
   */
  handleStreamChunk = (chunk) => {
    if (!chunk) return

    // If previously processing tool call, now switch to handling assistant message
    if (this.currentSequence.isProcessingToolCall) {
      this.currentSequence.toolMessageId = null
      this.currentSequence.isProcessingToolCall = false
      this.currentSequence.assistantMessageId = null
      this.currentSequence.currentContent = ''
    }

    this.currentSequence.currentContent += chunk

    if (!this.currentSequence.assistantMessageId) {
      const message = this.messageService.addAssistantMessage(
        this.currentSequence.currentContent,
        MESSAGE_STATUS.LOADING,
      )
      this.currentSequence.assistantMessageId = message.id
    }

    this.messageService.updateAssistantMessage(
      this.currentSequence.assistantMessageId,
      this.currentSequence.currentContent,
    )
  }

  /**
   * handle call tools function
   * @param {Array} finalToolCalls
   */
  handleCallTools = async (finalToolCalls) => {
    if (this.currentSequence.assistantMessageId) {
      this.messageService.updateMessageStatus(
        this.currentSequence.assistantMessageId,
        MESSAGE_STATUS.SUCCESS,
      )
    }

    this.currentSequence.isProcessingToolCall = true

    if (!this.currentSequence.toolMessageId) {
      const toolMessage = this.messageService.addToolCallMessage()
      this.currentSequence.toolMessageId = toolMessage.id
    }

    await this.processToolCalls(finalToolCalls)

    if (this.isRequestingRef.current) {
      this.currentSequence.assistantMessageId = null
      this.currentSequence.currentContent = ''
      await this.fetchData()
    }
  }

  /**
   * handle tool calls function
   * @param {Array} toolCalls
   */
  async processToolCalls(toolCalls) {
    this.requestMessage.push({
      role: 'assistant',
      content: this.currentSequence.currentContent,
      tool_calls: toolCalls,
    })

    for (const toolCall of toolCalls) {
      try {
        const args = JSON.parse(toolCall.function.arguments)

        this.messageService.addCall(this.currentSequence.toolMessageId, toolCall)

        const result = await Calls[toolCall.function.name](args)

        if (!this.isRequestingRef.current) {
          throw new Error('User canceled the task.')
        }

        this.messageService.updateToolStatus(
          this.currentSequence.toolMessageId,
          toolCall.id,
          MESSAGE_STATUS.SUCCESS,
        )

        this.requestMessage.push({
          role: 'tool',
          tool_call_id: toolCall.id,
          content: result,
        })
      } catch (error) {
        console.error(`Error executing tool ${toolCall.function.name}:`, error)
        this.messageService.updateToolStatus(
          this.currentSequence.toolMessageId,
          toolCall.id,
          MESSAGE_STATUS.ERROR,
        )
        this.requestMessage.push({
          role: 'tool',
          tool_call_id: toolCall.id,
          content: `${error}`,
        })
      }
    }
  }

  /**
   * main fetch data function
   */
  async fetchData() {
    try {
      this.setRequestStatus(this.setIsRequesting, true)

      const response = await LlmService.fetchStream(
        this.requestMessage,
        AI_REQUEST_OPTIONS,
        this.handleStreamChunk,
        this.handleCallTools,
      )

      if (response.status === 'success') {
        this.requestMessage.push({
          role: 'assistant',
          content: this.currentSequence.currentContent,
        })

        this.setRequestStatus(this.setIsRequesting, false)

        if (this.currentSequence.assistantMessageId) {
          this.messageService.updateMessageStatus(
            this.currentSequence.assistantMessageId,
            MESSAGE_STATUS.SUCCESS,
          )
        }
      } else if (response.status === 'error') {
        this.messageService.addAssistantMessage(response.data, MESSAGE_STATUS.ERROR)
        this.setRequestStatus(this.setIsRequesting, false)
      }
    } catch (error) {
      console.error('Error in fetchData:', error)
      if (error.message !== 'signal is aborted without reason') {
        this.messageService.addAssistantMessage(error.message, MESSAGE_STATUS.ERROR)
      }

      this.setRequestStatus(this.setIsRequesting, false)
    }
  }

  /**
   * cancel request function
   */
  async cancelRequest() {
    const response = await LlmService.abortFetch()
    if (response.status === 'Canceled') {
      this.setRequestStatus(this.setIsRequesting, false)
      this.messageService.addAssistantMessage('Canceled', MESSAGE_STATUS.ERROR)
    }
  }

  /**
   * reset chat service
   */
  reset() {
    this.messageService.clearMessages()
    this.setRequestStatus(this.setIsRequesting, false)
    this.requestMessage = [{ role: 'system', content: SYSTEM_PROMPT }]
    this.resetSequence()
  }
}

export default ChatService
