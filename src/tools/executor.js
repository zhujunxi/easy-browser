/**
 * ToolExecutor - Tool execution with retry, timeout, and error handling
 */

const DEFAULT_OPTIONS = {
  timeout: 30000,
  maxRetries: 1,
  retryDelay: 1000,
  shouldRetry: (error) => {
    const retryablePatterns = [
      /timeout/i,
      /network/i,
      /ECONNREFUSED/i,
      /ETIMEDOUT/i,
      /Could not establish connection/i,
    ]
    return retryablePatterns.some((pattern) => pattern.test(error.message))
  },
}

class ToolExecutor {
  constructor(options = {}) {
    this.config = { ...DEFAULT_OPTIONS, ...options }
    this.globalErrorCount = 0
    this.maxGlobalErrors = 5
  }

  /**
   * Execute a tool with retry and timeout protection
   * @param {string} name - Tool name
   * @param {Function} callFn - Tool function
   * @param {Object} args - Tool arguments
   * @param {Object} [options] - Per-execution overrides
   * @returns {Promise<string>} Tool result
   */
  async execute(name, callFn, args, options = {}) {
    const config = { ...this.config, ...options }
    let lastError = null

    for (let attempt = 0; attempt <= config.maxRetries; attempt++) {
      try {
        const result = await this._executeWithTimeout(name, callFn, args, config.timeout)
        this.globalErrorCount = 0
        return result
      } catch (error) {
        lastError = error

        if (attempt < config.maxRetries && config.shouldRetry(error)) {
          console.warn(
            `Tool "${name}" failed (attempt ${attempt + 1}/${config.maxRetries + 1}), retrying in ${config.retryDelay}ms...`,
            error.message,
          )
          await this._delay(config.retryDelay * Math.pow(2, attempt))
        } else {
          break
        }
      }
    }

    this.globalErrorCount++

    if (this.globalErrorCount >= this.maxGlobalErrors) {
      this.globalErrorCount = 0
      throw new Error(`Too many consecutive tool errors. Last error: ${lastError.message}`)
    }

    return `Error: ${lastError.message}`
  }

  /**
   * Execute with timeout wrapper
   * @private
   */
  async _executeWithTimeout(name, callFn, args, timeout) {
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error(`Tool "${name}" timed out after ${timeout}ms`)), timeout)
    })

    const executePromise = (async () => {
      const result = await callFn(args)
      if (result === undefined || result === null) {
        return 'Operation completed.'
      }
      return typeof result === 'string' ? result : JSON.stringify(result)
    })()

    return Promise.race([executePromise, timeoutPromise])
  }

  /**
   * Delay helper
   * @private
   */
  _delay(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms))
  }

  /**
   * Reset error counters
   */
  reset() {
    this.globalErrorCount = 0
  }
}

export default ToolExecutor
