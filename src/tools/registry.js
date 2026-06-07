/**
 * ToolRegistry - Centralized tool registration and management
 * Provides tool filtering by category and dynamic tool selection
 */

const TOOL_CATEGORIES = {
  NAVIGATION: 'navigation',
  PAGE_QUERY: 'page_query',
  PAGE_INTERACTION: 'page_interaction',
  UTILITY: 'utility',
}

class ToolRegistry {
  constructor() {
    this._tools = new Map()
    this._categories = new Map()
  }

  /**
   * Register a single tool
   * @param {string} name - Tool name
   * @param {Function} callFn - The function to execute
   * @param {Object} definition - OpenAI tool definition
   * @param {string} category - Tool category
   */
  register(name, callFn, definition, category = TOOL_CATEGORIES.UTILITY) {
    if (this._tools.has(name)) {
      console.warn(`Tool "${name}" is being overwritten`)
    }
    this._tools.set(name, { call: callFn, definition })
    this._categories.set(name, category)
  }

  /**
   * Register multiple tools from a batch
   * @param {Object} toolMap - { name: { call, definition, category? } }
   */
  registerBatch(toolMap) {
    for (const [name, { call, definition, category }] of Object.entries(toolMap)) {
      this.register(name, call, definition, category)
    }
  }

  /**
   * Get a tool's execute function by name
   * @param {string} name
   * @returns {Function|null}
   */
  getCall(name) {
    const tool = this._tools.get(name)
    return tool ? tool.call : null
  }

  /**
   * Get all tool definitions, optionally filtered by category
   * @param {string[]} [categories] - Categories to include
   * @returns {Object[]}
   */
  getTools(categories) {
    const tools = []
    for (const [name, { definition }] of this._tools) {
      if (!categories || categories.includes(this._categories.get(name))) {
        tools.push(definition)
      }
    }
    return tools
  }

  /**
   * Get all tool names
   * @returns {string[]}
   */
  getToolNames() {
    return Array.from(this._tools.keys())
  }

  /**
   * Get all Calls map (backward compatible)
   * @returns {Object}
   */
  getCalls() {
    const calls = {}
    for (const [name, { call }] of this._tools) {
      calls[name] = call
    }
    return calls
  }

  /**
   * Infer recommended tool categories based on task description
   * @param {string} userInput
   * @returns {string[]}
   */
  inferCategories(userInput) {
    const lowerInput = userInput.toLowerCase()
    const categories = [TOOL_CATEGORIES.UTILITY]

    const navigationKeywords = [
      'open',
      'navigate',
      'go to',
      'visit',
      'close tab',
      'reload',
      'refresh',
    ]
    if (navigationKeywords.some((kw) => lowerInput.includes(kw))) {
      categories.push(TOOL_CATEGORIES.NAVIGATION)
    }

    const queryKeywords = [
      'find',
      'search',
      'read',
      'look',
      'show',
      'what',
      'get',
      'check',
      'see',
      'content',
    ]
    if (queryKeywords.some((kw) => lowerInput.includes(kw))) {
      categories.push(TOOL_CATEGORIES.PAGE_QUERY)
    }

    const interactionKeywords = [
      'click',
      'type',
      'input',
      'fill',
      'hover',
      'scroll',
      'press',
      'submit',
      'login',
      'form',
    ]
    if (interactionKeywords.some((kw) => lowerInput.includes(kw))) {
      categories.push(TOOL_CATEGORIES.PAGE_INTERACTION)
    }

    if (categories.length === 1) {
      return [
        TOOL_CATEGORIES.NAVIGATION,
        TOOL_CATEGORIES.PAGE_QUERY,
        TOOL_CATEGORIES.PAGE_INTERACTION,
        TOOL_CATEGORIES.UTILITY,
      ]
    }

    return categories
  }
}

const toolRegistry = new ToolRegistry()

export { toolRegistry, TOOL_CATEGORIES }
export default toolRegistry
