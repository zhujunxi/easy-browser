// ConfigManager.js - Configuration Manager
import { MODEL_PROVIDERS, THEMES, LANGUAGES } from '@config/types'
/**
 * Configuration Manager
 * Handling extension configuration storage and retrieval
 */
class ConfigManager {
  // Default configuration
  static defaults = {
    openaiKey: '',
    openaiHost: 'https://api.openai.com/v1',
    openaiModel: 'gpt-4o',
    qwenKey: '',
    qwenHost: 'https://dashscope.aliyuncs.com/compatible-mode/v1',
    qwenModel: 'qwen-plus',
    deepseekKey: '',
    deepseekHost: 'https://api.deepseek.com/v1',
    deepseekModel: 'deepseek-chat',
    aiModel: MODEL_PROVIDERS.OPENAI,
    theme: THEMES.SYSTEM,
    language: LANGUAGES.SYSTEM,
    floatBtn: true,
  }

  /**
   * get configuration
   * @param {string|string[]} keys
   * @returns {Promise<Object>}
   */
  static async get(keys) {
    try {
      return new Promise((resolve) => {
        chrome.storage.sync.get(keys, (result) => {
          const finalResult = { ...result }

          // Fill in default values
          if (typeof keys === 'string') {
            if (result[keys] === undefined && this.defaults[keys] !== undefined) {
              finalResult[keys] = this.defaults[keys]
            }
          } else if (Array.isArray(keys)) {
            keys.forEach((key) => {
              if (finalResult[key] === undefined && this.defaults[key] !== undefined) {
                finalResult[key] = this.defaults[key]
              }
            })
          }

          resolve(finalResult)
        })
      })
    } catch (error) {
      throw new Error(`Get Config Error: ${error.message}`)
    }
  }

  /**
   * set configuration
   * @param {Object} items
   * @returns {Promise<void>}
   */
  static async set(items) {
    try {
      return new Promise((resolve, reject) => {
        chrome.storage.sync.set(items, () => {
          if (chrome.runtime.lastError) {
            reject(new Error(chrome.runtime.lastError.message))
          } else {
            resolve()
          }
        })
      })
    } catch (error) {
      throw new Error(`Config Save Error: ${error.message}`)
    }
  }

  /**
   * remove configuration
   * @param {string|string[]} keys
   * @returns {Promise<void>}
   */
  static async remove(keys) {
    try {
      return new Promise((resolve, reject) => {
        chrome.storage.sync.remove(keys, () => {
          if (chrome.runtime.lastError) {
            reject(new Error(chrome.runtime.lastError.message))
          } else {
            resolve()
          }
        })
      })
    } catch (error) {
      throw new Error(`Remove Config Error: ${error.message}`)
    }
  }

  /**
   * reset configuration to defaults
   * @returns {Promise<void>}
   */
  static async resetToDefaults() {
    try {
      return this.set(this.defaults)
    } catch (error) {
      throw new Error(`Reset Config Error: ${error.message}`)
    }
  }
}

export default ConfigManager
