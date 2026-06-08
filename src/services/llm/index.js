import ConfigManager from '@services/storage.js'
import RequestLogger from './request-logger.js'

const LlmService = {
  controller: new AbortController(),

  async abortFetch() {
    this.controller.abort()
    this.controller = new AbortController()
    return { status: 'Canceled' }
  },

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

  async fetchStream(messages, options, onStreamChunk, onCall) {
    try {
      const { model: provider, apiKey, apiModel, endpoint } = await this._getApiConfig()
      const signal = this.controller.signal
      const startTime = Date.now()

      const result = await this._processStreamResponse(
        messages,
        endpoint,
        apiKey,
        apiModel,
        options,
        signal,
        onStreamChunk,
        onCall,
      )

      if (result._log) {
        const requestBody = { messages, model: apiModel, stream: true, ...options }
        await RequestLogger.log({
          timestamp: new Date().toISOString(),
          apiName: `ai.${provider}`,
          method: 'POST',
          url: endpoint,
          request: {
            headers: {
              Authorization: `Bearer ${apiKey}`,
              'content-type': 'application/json',
            },
            body: requestBody,
          },
          response: {
            status: 200,
            body: result._log,
          },
          durationMs: Date.now() - startTime,
        })
      }

      return result
    } catch (error) {
      return { status: 'error', message: error.message }
    }
  },

  async fetch(messages, options = {}) {
    try {
      const { model: provider, apiKey, apiModel, endpoint } = await this._getApiConfig()
      const signal = this.controller.signal
      const startTime = Date.now()

      const result = await this._processResponse(
        messages,
        endpoint,
        apiKey,
        apiModel,
        options,
        signal,
      )

      if (result._log) {
        const requestBody = { messages, model: apiModel, stream: false, ...options }
        await RequestLogger.log({
          timestamp: new Date().toISOString(),
          apiName: `ai.${provider}`,
          method: 'POST',
          url: endpoint,
          request: {
            headers: {
              Authorization: `Bearer ${apiKey}`,
              'content-type': 'application/json',
            },
            body: requestBody,
          },
          response: {
            status: 200,
            body: result._log,
          },
          durationMs: Date.now() - startTime,
        })
      }

      return result
    } catch (error) {
      return { status: 'error', message: error.message }
    }
  },

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
          stream: true,
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
      const toolCallsCollection = new Map()

      let responseId = ''
      let responseCreated = 0
      let responseModel = ''
      let fullContent = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        const chunk = decoder.decode(value)
        const lines = chunk.split('\n').filter((line) => line.trim() !== '')

        for (const line of lines) {
          if (!line.startsWith('data: ')) continue
          const data = line.slice(6)

          if (data === '[DONE]') {
            const responseBody = {
              id: responseId || undefined,
              object: 'chat.completion',
              created: responseCreated || undefined,
              model: responseModel || undefined,
              choices: [
                {
                  index: 0,
                  message: {
                    role: 'assistant',
                    content: fullContent || null,
                  },
                  logprobs: null,
                  finish_reason: 'stop',
                },
              ],
            }
            return { status: 'success', _log: responseBody }
          }

          try {
            const parsed = JSON.parse(data)
            if (parsed.id) responseId = parsed.id
            if (parsed.created) responseCreated = parsed.created
            if (parsed.model) responseModel = parsed.model

            const choice = parsed.choices[0]
            const delta = choice.delta

            if (delta && delta.tool_calls) {
              for (const toolCall of delta.tool_calls) {
                const index = toolCall.index
                if (!toolCallsCollection.has(index)) {
                  toolCallsCollection.set(index, {
                    id: toolCall.id || '',
                    type: toolCall.type || 'function',
                    function: {
                      name: toolCall.function?.name || '',
                      arguments: toolCall.function?.arguments || '',
                    },
                  })
                } else {
                  const current = toolCallsCollection.get(index)
                  if (toolCall.id && toolCall.id !== '') {
                    current.id = toolCall.id
                  }
                  if (toolCall.type) {
                    current.type = toolCall.type
                  }
                  if (toolCall.function && toolCall.function.name) {
                    current.function.name = current.function.name || ''
                    current.function.name += toolCall.function.name
                  }
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

            if (choice.finish_reason === 'tool_calls') {
              const finalToolCalls = Array.from(toolCallsCollection.values())
              if (onCall && finalToolCalls.length > 0) await onCall(finalToolCalls)

              const responseBody = {
                id: responseId || undefined,
                object: 'chat.completion',
                created: responseCreated || undefined,
                model: responseModel || undefined,
                choices: [
                  {
                    index: 0,
                    message: {
                      role: 'assistant',
                      content: fullContent || null,
                      tool_calls: finalToolCalls,
                    },
                    logprobs: null,
                    finish_reason: 'tool_calls',
                  },
                ],
              }
              return { status: 'tool_calls', _log: responseBody }
            } else if (delta && delta.content && delta.content !== 'tools') {
              fullContent += delta.content
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
          stream: false,
          ...options,
        }),
        signal,
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error?.message || `HTTP error! status: ${response.status}`)
      }

      const result = await response.json()

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
          _log: result,
        }
      }

      if (
        result.choices &&
        result.choices[0] &&
        result.choices[0].message &&
        result.choices[0].message.content
      ) {
        return {
          status: 'success',
          data: result.choices[0].message.content,
          _log: result,
        }
      }

      return {
        status: 'success',
        data: result,
        _log: result,
      }
    } catch (error) {
      return { status: 'error', message: error.message }
    }
  },
}

export default LlmService
