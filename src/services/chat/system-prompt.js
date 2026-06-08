/**
 * SystemPrompt - Static system prompt builder
 * Returns only the base system prompt with no dynamic content,
 * allowing LLM prompt caching to work effectively.
 */

import { BASE_SYSTEM_PROMPT } from './constants.js'

class SystemPromptBuilder {
  constructor() {
    this.basePrompt = BASE_SYSTEM_PROMPT
  }

  async build() {
    return this.basePrompt
  }

  getBasePrompt() {
    return this.basePrompt
  }
}

export default SystemPromptBuilder
