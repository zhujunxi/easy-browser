/**
 * ContextManager - Message context window and token management
 * Handles token estimation, tool result truncation, and context compression
 */

// Rough token estimation: ~3.5 chars per token for mixed content
const CHARS_PER_TOKEN = 3.5
const MAX_TOOL_RESULT_TOKENS = 3000

class ContextManager {
  constructor(options = {}) {
    this.maxToolResultTokens = options.maxToolResultTokens || MAX_TOOL_RESULT_TOKENS
    this.messages = []
  }

  /**
   * Estimate token count for text content
   * @param {string} text
   * @returns {number}
   */
  estimateTokens(text) {
    if (!text) return 0
    // Count CJK characters (roughly 1 char = 1 token) separately
    const cjkCount = (text.match(/[\u4e00-\u9fff\u3400-\u4dbf]/g) || []).length
    const nonCjkLength = text.length - cjkCount
    return Math.ceil(cjkCount + nonCjkLength / CHARS_PER_TOKEN)
  }

  /**
   * Estimate tokens for a message array
   * @param {Object[]} messages
   * @returns {number}
   */
  estimateMessagesTokens(messages) {
    let total = 0
    for (const msg of messages) {
      let text = msg.content || ''
      if (msg.tool_calls) {
        text += JSON.stringify(msg.tool_calls)
      }
      total += this.estimateTokens(text)
    }
    return total
  }

  /**
   * Estimate total context tokens (messages + overhead)
   * @returns {number}
   */
  getTotalTokens() {
    return this.estimateMessagesTokens(this.messages)
  }

  /**
   * Truncate tool result to max tokens
   * @param {string} content
   * @param {number} [maxTokens]
   * @returns {string}
   */
  truncateToolResult(content, maxTokens = this.maxToolResultTokens) {
    if (!content) return ''

    const estimatedTokens = this.estimateTokens(content)
    if (estimatedTokens <= maxTokens) return content

    const targetChars = Math.floor(maxTokens * CHARS_PER_TOKEN)
    const halfChars = Math.floor(targetChars / 2)

    const head = content.slice(0, halfChars)
    const tail = content.slice(-halfChars)

    return `${head}\n\n... [${estimatedTokens - maxTokens} tokens truncated] ...\n\n${tail}`
  }

  /**
   * Set the system prompt (first message)
   * @param {string} systemPrompt
   */
  setSystemPrompt(systemPrompt) {
    if (this.messages.length > 0 && this.messages[0].role === 'system') {
      this.messages[0].content = systemPrompt
    } else {
      this.messages.unshift({ role: 'system', content: systemPrompt })
    }
  }

  /**
   * Add a message to the context
   * Keeps only the last 2 complete conversation rounds (user → final response)
   * @param {Object} message
   */
  addMessage(message) {
    this.messages.push(message)
    if (message.role === 'user') {
      this._keepLastTwoRounds()
    }
  }

  /**
   * Get full message context for LLM request
   * @returns {Object[]}
   */
  getContext() {
    return [...this.messages]
  }

  /**
   * Keep only the last 2 complete conversation rounds.
   * A round = user message → ... → final assistant response.
   * Triggered when a new user message is added and there are > 2 rounds.
   * @private
   */
  _keepLastTwoRounds() {
    const systemMessage = this.messages[0]?.role === 'system' ? [this.messages[0]] : []

    const userIndices = []
    for (let i = 0; i < this.messages.length; i++) {
      if (this.messages[i].role === 'user') {
        userIndices.push(i)
      }
    }

    if (userIndices.length > 2) {
      const keepFrom = userIndices[userIndices.length - 2]
      this.messages = [...systemMessage, ...this.messages.slice(keepFrom)]
      console.warn(
        `Context compressed: kept last 2 rounds (dropped ${userIndices.length - 2} round(s))`,
      )
    }
  }

  /**
   * Clear all messages (keep system prompt)
   */
  clear() {
    const systemMessage = this.messages[0]?.role === 'system' ? [this.messages[0]] : []
    this.messages = systemMessage
  }

  /**
   * Full reset (remove system prompt too)
   */
  reset() {
    this.messages = []
  }

  /**
   * Get current message count
   * @returns {number}
   */
  getMessageCount() {
    return this.messages.length
  }
}

export default ContextManager
