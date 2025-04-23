import ConfigManager from '@config/index.js'

const LlmService = {
  controller: new AbortController(),

  async abortFetch() {
    this.controller.abort() // Cancel all requests
    this.controller = new AbortController() // Create a new controller to prevent subsequent requests from being unusable
    return { status: 'Canceled' }
  },

  /**
   * Get API configuration
   * @private
   */
  async _getApiConfig() {
    const models = await ConfigManager.get('aiModel')
    const model = models.aiModel
    const config = await ConfigManager.get([`${model}Key`, `${model}Host`, `${model}Model`])

    const apiKey = config[`${model}Key`]
    const apiHost = config[`${model}Host`]
    const apiModel = config[`${model}Model`]

    if (!apiKey) {
      throw new Error(`API key not set`)
    }

    let endpoint
    switch (model) {
      case 'openai':
      case 'qwen':
      case 'deepseek':
        endpoint = apiHost + '/chat/completions'
        break
      default:
        throw new Error(`Unsupported AI model: ${model}`)
    }

    return { model, apiKey, apiModel, endpoint }
  },

  /**
   * Stream API call
   * @param {Array} messages - Message array
   * @param {Object} options - Request options
   * @param {Function} onStreamChunk - Callback for handling streaming content
   * @param {Function} onCall - Callback for handling tool calls
   * @returns {Promise<Object>} - Returns request status
   */
  async fetchStream(messages, options, onStreamChunk, onCall) {
    try {
      const { apiKey, apiModel, endpoint } = await this._getApiConfig()

      // Pass global signal
      const signal = this.controller.signal

      return await this._processStreamResponse(
        messages,
        endpoint,
        apiKey,
        apiModel,
        options,
        signal,
        onStreamChunk,
        onCall,
      )
    } catch (error) {
      return { status: 'error', message: error.message }
    }
  },

  /**
   * Non-streaming API call
   * @param {Array} messages - Message array
   * @param {Object} options - Request options
   * @returns {Promise<Object>} - Returns complete response
   */
  async fetch(messages, options = {}) {
    try {
      const { apiKey, apiModel, endpoint } = await this._getApiConfig()

      // Pass global signal
      const signal = this.controller.signal

      return await this._processResponse(messages, endpoint, apiKey, apiModel, options, signal)
    } catch (error) {
      return { status: 'error', message: error.message }
    }
  },

  /**
   * Process streaming response
   * @private
   */
  async _processStreamResponse(
    messages,
    apiHost,
    apiKey,
    model,
    options,
    signal,
    onStreamChunk,
    onCall,
  ) {
    try {
      const response = await fetch(apiHost, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          messages: messages,
          model: model,
          stream: true, // Ensure streaming output is enabled
          ...options,
        }),
        signal,
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error?.message || `HTTP error! status: ${response.status}`)
      }

      const reader = response.body.getReader()
      const decoder = new TextDecoder()

      // For collecting partial tool_calls
      const toolCallsCollection = new Map()

      while (true) {
        const { done, value } = await reader.read()

        if (done) break

        const chunk = decoder.decode(value)
        const lines = chunk.split('\n').filter((line) => line.trim() !== '')

        for (const line of lines) {
          if (!line.startsWith('data: ')) continue
          const data = line.slice(6)

          if (data === '[DONE]') return { status: 'success' }

          try {
            const parsed = JSON.parse(data)
            const choice = parsed.choices[0]
            const delta = choice.delta

            // Handle tool calls
            if (delta && delta.tool_calls) {
              for (const toolCall of delta.tool_calls) {
                const index = toolCall.index

                if (!toolCallsCollection.has(index)) {
                  // First time receiving tool_call with this index
                  toolCallsCollection.set(index, {
                    id: toolCall.id || '',
                    type: toolCall.type || 'function',
                    function: {
                      name: toolCall.function?.name || '',
                      arguments: toolCall.function?.arguments || '',
                    },
                  })
                } else {
                  // Subsequent parts received
                  const current = toolCallsCollection.get(index)

                  // Update ID (if any)
                  if (toolCall.id && toolCall.id !== '') {
                    current.id = toolCall.id
                  }

                  // Update type (if any)
                  if (toolCall.type) {
                    current.type = toolCall.type
                  }

                  // Update function.name (if any)
                  if (toolCall.function && toolCall.function.name) {
                    current.function.name = current.function.name || ''
                    current.function.name += toolCall.function.name
                  }

                  // Update function.arguments (if any)
                  if (
                    toolCall.function &&
                    toolCall.function.arguments !== null &&
                    toolCall.function.arguments !== undefined
                  ) {
                    current.function.arguments = current.function.arguments || ''
                    current.function.arguments += toolCall.function.arguments
                  }
                }
              }
            }
            // Check if tool call is completed
            if (choice.finish_reason === 'tool_calls') {
              const finalToolCalls = Array.from(toolCallsCollection.values())

              if (onCall && finalToolCalls.length > 0) onCall(finalToolCalls)
              return { status: 'tool_calls' }
            }
            // Handle regular messages
            else if (delta && delta.content && delta.content !== 'tools') {
              onStreamChunk && onStreamChunk(delta.content)
            }
          } catch (e) {
            console.error('Error parsing stream data:', e, 'Raw data:', data)
          }
        }
      }

      return { status: 'success' }
    } catch (error) {
      return { status: 'error', data: error.message }
    }
  },

  /**
   * Process non-streaming response
   * @private
   */
  async _processResponse(messages, apiHost, apiKey, model, options, signal) {
    try {
      const response = await fetch(apiHost, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          messages: messages,
          model: model,
          stream: false, // Ensure streaming output is disabled
          ...options,
        }),
        signal,
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error?.message || `HTTP error! status: ${response.status}`)
      }

      const result = await response.json()

      // Handle tool call response
      if (
        result.choices &&
        result.choices[0] &&
        result.choices[0].finish_reason === 'tool_calls' &&
        result.choices[0].message &&
        result.choices[0].message.tool_calls
      ) {
        return {
          status: 'tool_calls',
          data: result.choices[0].message.tool_calls,
        }
      }

      // Handle regular response
      if (
        result.choices &&
        result.choices[0] &&
        result.choices[0].message &&
        result.choices[0].message.content
      ) {
        return {
          status: 'success',
          data: result.choices[0].message.content,
        }
      }

      return {
        status: 'success',
        data: result,
      }
    } catch (error) {
      return { status: 'error', message: error.message }
    }
  },
}

export default LlmService
