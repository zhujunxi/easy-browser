/**
 * SystemPrompt - Dynamic system prompt builder
 * Injects environment context into the base system prompt
 */

import { BASE_SYSTEM_PROMPT } from './constants.js'

class SystemPromptBuilder {
  constructor() {
    this.basePrompt = BASE_SYSTEM_PROMPT
  }

  /**
   * Build the full system prompt with dynamic context
   * @returns {Promise<string>}
   */
  async build() {
    const envInfo = await this._getEnvironmentInfo()
    return `${this.basePrompt}\n\n${envInfo}`
  }

  /**
   * Gather dynamic environment information
   * @returns {Promise<string>}
   * @private
   */
  async _getEnvironmentInfo() {
    const parts = []

    // Date and time
    const now = new Date()
    parts.push(`## Current Environment`)
    parts.push(`- Date: ${now.toISOString()}`)
    parts.push(`- Timezone: ${Intl.DateTimeFormat().resolvedOptions().timeZone}`)

    // Browser info
    try {
      const tabs = await chrome.tabs.query({ active: true, currentWindow: true })
      if (tabs.length > 0) {
        const tab = tabs[0]
        parts.push(`- Current Tab: "${tab.title}" (id: ${tab.id})`)
        parts.push(`- Current URL: ${tab.url}`)
      }
    } catch {
      // Silently fail - browser info is nice-to-have
    }

    // All open tabs
    try {
      const allTabs = await chrome.tabs.query({ currentWindow: true })
      parts.push(`- Open Tabs: ${allTabs.length}`)
      const tabList = allTabs
        .map((t) => `  [${t.id}] ${t.title.slice(0, 50)}${t.title.length > 50 ? '...' : ''}`)
        .join('\n')
      parts.push(tabList)
    } catch {
      // Silently fail
    }

    return parts.join('\n')
  }

  /**
   * Get the static base prompt (without dynamic context)
   * @returns {string}
   */
  getBasePrompt() {
    return this.basePrompt
  }
}

export default SystemPromptBuilder
