/**
 * ContextManager - Message context window and token management
 * Handles token estimation, tool result truncation, and context compression
 */

// Rough token estimation: ~3.5 chars per token for mixed content
const CHARS_PER_TOKEN = 3.5
const MAX_CONTEXT_TOKENS = 64000
const MAX_TOOL_RESULT_TOKENS = 3000
const SUMMARY_THRESHOLD_TOKENS = Math.floor(MAX_CONTEXT_TOKENS * 0.75)

class ContextManager {
  constructor(options = {}) {
    this.maxContextTokens = options.maxContextTokens || MAX_CONTEXT_TOKENS
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
   * @param {Object} message
   */
  addMessage(message) {
    this.messages.push(message)
    this._maybeCompress()
  }

  /**
   * Get full message context for LLM request
   * @returns {Object[]}
   */
  getContext() {
    return [...this.messages]
  }

  /**
   * Check if context is approaching limits
   * @returns {boolean}
   */
  isNearLimit() {
    return this.getTotalTokens() >= SUMMARY_THRESHOLD_TOKENS
  }

  /**
   * Check if context has exceeded the hard limit
   * @returns {boolean}
   */
  isOverLimit() {
    return this.getTotalTokens() >= this.maxContextTokens
  }

  /**
   * Compress older messages when context is too large
   * Uses a simple rolling window: keep system prompt + last N messages
   * @private
   */
  _maybeCompress() {
    if (!this.isNearLimit()) return

    const systemMessage = this.messages[0]?.role === 'system' ? [this.messages[0]] : []

    // Keep last 20 messages, drop older ones
    const recentMessages = this.messages.slice(-20)

    // If still over limit after keeping 20, drop to 10
    if (
      this.estimateMessagesTokens([...systemMessage, ...recentMessages]) >= this.maxContextTokens
    ) {
      const minimal = this.messages.slice(-10)
      this.messages = [...systemMessage, ...minimal]
      console.warn('Context compressed: kept last 10 messages')
    } else {
      this.messages = [...systemMessage, ...recentMessages]
      console.warn('Context compressed: kept last 20 messages')
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
