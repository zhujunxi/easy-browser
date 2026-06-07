/**
 * ChatOrchestrator - Core agent loop orchestration
 * Replaces the old monolithic ChatService
 * Handles: message construction → LLM call → tool execution → repeat
 */

import LlmService from '@services/llm/index.js'
import toolRegistry from '@tools/index.js'
import ToolExecutor from '@tools/executor.js'
import ContextManager from './context-manager.js'
import SystemPromptBuilder from './system-prompt.js'
import {
  AI_REQUEST_OPTIONS,
  MESSAGE_STATUS,
  MAX_TOOL_ROUNDS,
} from '@/sidepanel/chat/services/ChatConstants.js'

class ChatOrchestrator {
  constructor(chatActions) {
    this.actions = chatActions
    this.isProcessing = false
    this.abortController = new AbortController()

    this.contextManager = new ContextManager()
    this.toolExecutor = new ToolExecutor()
    this.systemPromptBuilder = new SystemPromptBuilder()

    this.currentAssistantId = null
    this.currentContent = ''
    this.currentToolMessageId = null
  }

  /**
   * Initialize the orchestrator (build system prompt)
   */
  async init() {
    const systemPrompt = await this.systemPromptBuilder.build()
    this.contextManager.setSystemPrompt(systemPrompt)
  }

  /**
   * Send user message and start the agent loop
   * @param {string} inputText
   */
  async sendMessage(inputText) {
    if (this.isProcessing) return

    this.isProcessing = true
    this.actions.setRequesting(true)
    this._resetRound()

    try {
      this.actions.addUserMessage(inputText)
      this.contextManager.addMessage({ role: 'user', content: inputText })

      // Infer tool categories for first round
      const categories = toolRegistry.inferCategories(inputText)

      await this._agentLoop(categories)
    } catch (error) {
      console.error('ChatOrchestrator error:', error)
      if (error.message !== 'signal is aborted without reason') {
        this.actions.addAssistantMessage(error.message, MESSAGE_STATUS.ERROR)
      }
    } finally {
      this.actions.setRequesting(false)
      this.isProcessing = false
    }
  }

  /**
   * Main agent loop: LLM → tool calls → LLM → ...
   * @param {string[]} initialCategories - Tool categories for the first round
   */
  async _agentLoop(initialCategories) {
    let categories = initialCategories

    for (let round = 0; round < MAX_TOOL_ROUNDS; round++) {
      const messages = this.contextManager.getContext()

      // Get tools filtered by category for first round, all tools for subsequent rounds
      const tools = round === 0 ? toolRegistry.getTools(categories) : toolRegistry.getTools()

      const response = await LlmService.fetchStream(
        messages,
        { ...AI_REQUEST_OPTIONS, tools },
        this._handleStreamChunk.bind(this),
        this._handleToolCalls.bind(this),
      )

      if (response.status === 'success') {
        // Final text response
        this.contextManager.addMessage({
          role: 'assistant',
          content: this.currentContent,
        })

        if (this.currentAssistantId) {
          this.actions.updateMessageStatus(this.currentAssistantId, MESSAGE_STATUS.SUCCESS)
        }
        return
      }

      if (response.status === 'error') {
        this.actions.addAssistantMessage(response.data, MESSAGE_STATUS.ERROR)
        return
      }

      // response.status === 'tool_calls' - loop continues
      categories = undefined
    }

    // Max rounds exceeded
    this.actions.addAssistantMessage(
      'Task stopped: maximum tool execution rounds reached. Please try a simpler task.',
      MESSAGE_STATUS.ERROR,
    )
  }

  /**
   * Handle streaming text chunks
   */
  _handleStreamChunk(chunk) {
    if (!chunk) return

    this.currentContent += chunk

    if (!this.currentAssistantId) {
      this.currentAssistantId = this.actions.addAssistantMessage(
        this.currentContent,
        MESSAGE_STATUS.LOADING,
      )
    } else {
      this.actions.updateAssistantContent(this.currentAssistantId, this.currentContent)
    }
  }

  /**
   * Handle tool calls from LLM
   */
  async _handleToolCalls(toolCalls) {
    // Finalize the current assistant message
    if (this.currentAssistantId) {
      this.actions.updateMessageStatus(this.currentAssistantId, MESSAGE_STATUS.SUCCESS)
      this.currentAssistantId = null
    }

    // Add assistant message with tool calls to context
    this.contextManager.addMessage({
      role: 'assistant',
      content: this.currentContent,
      tool_calls: toolCalls,
    })

    // Create tool message in UI
    this.currentToolMessageId = this.actions.addToolMessage()

    // Execute each tool call
    for (const toolCall of toolCalls) {
      try {
        const args = JSON.parse(toolCall.function.arguments)
        const name = toolCall.function.name

        const callFn = toolRegistry.getCall(name)
        if (!callFn) {
          throw new Error(`Unknown tool: ${name}`)
        }

        this.actions.addToolCall(this.currentToolMessageId, toolCall.id, name, args)

        const result = await this.toolExecutor.execute(name, callFn, args)

        if (!this.isProcessing) {
          this.contextManager.addMessage({
            role: 'tool',
            tool_call_id: toolCall.id,
            content: 'User canceled the task.',
          })
          return
        }

        this.actions.updateToolStatus(
          this.currentToolMessageId,
          toolCall.id,
          MESSAGE_STATUS.SUCCESS,
        )

        // Truncate tool result before adding to context
        const truncated = this.contextManager.truncateToolResult(result)

        this.contextManager.addMessage({
          role: 'tool',
          tool_call_id: toolCall.id,
          content: truncated,
        })
      } catch (error) {
        console.error(`Error executing tool ${toolCall.function.name}:`, error)

        this.actions.updateToolStatus(this.currentToolMessageId, toolCall.id, MESSAGE_STATUS.ERROR)

        this.contextManager.addMessage({
          role: 'tool',
          tool_call_id: toolCall.id,
          content: `Error: ${error.message}`,
        })
      }
    }

    this.currentContent = ''
    this.currentToolMessageId = null
  }

  /**
   * Reset per-round state
   */
  _resetRound() {
    this.currentAssistantId = null
    this.currentContent = ''
    this.currentToolMessageId = null
    this.toolExecutor.reset()
  }

  /**
   * Cancel the current request
   */
  async cancelRequest() {
    this.isProcessing = false
    const response = await LlmService.abortFetch()
    if (response.status === 'Canceled') {
      this.actions.setRequesting(false)
      this.actions.addAssistantMessage('Canceled', MESSAGE_STATUS.ERROR)
    }
  }

  /**
   * Reset the entire chat session
   */
  reset() {
    this.isProcessing = false
    this.actions.clearMessages()
    this.actions.setRequesting(false)
    this.contextManager.reset()
    this._resetRound()
  }
}

export default ChatOrchestrator
