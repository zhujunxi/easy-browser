const tabs_manager = {
  /**
   * Create a new tab
   * @param {Object} params - Parameter object
   * @param {string} params.url - URL to open
   * @param {boolean} [params.active=true] - Whether to activate the new tab
   * @returns {Promise<Object>} - Returns a Promise containing tab information and status
   */
  createTab: async ({ url }) => {
    // Validate URL format
    try {
      new URL(url)
    } catch (error) {
      throw new Error('Invalid URL format')
    }

    try {
      const tab = await chrome.tabs.create({ url })

      return new Promise((resolve, reject) => {
        const listener = (tabId, changeInfo, updatedTab) => {
          if (tabId === tab.id && changeInfo.status === 'complete') {
            chrome.tabs.onUpdated.removeListener(listener)
            resolve(`The tab[${tab.id}] of ${url} has been opened and loaded successfully.`)
          }
        }

        chrome.tabs.onUpdated.addListener(listener)

        // Set timeout handler
        setTimeout(() => {
          chrome.tabs.onUpdated.removeListener(listener)
          reject(new Error('Tab opening timeout, please check your network'))
        }, 30000) // 30 seconds timeout
      })
    } catch (error) {
      throw new Error(`Cannot open new tab: ${error.message}`)
    }
  },

  /**
   * Get current active tab information
   * @returns {Promise<Object>} - Current tab information
   */
  getCurrentTab: async () => {
    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true })
      if (!tab) {
        throw new Error('Current tab not found')
      }
      return `current tab info:id: ${tab.id}, title: ${tab.title.slice(0, 20)}`
    } catch (error) {
      throw new Error(`Failed to get current tab: ${error.message}`)
    }
  },

  /**
   * Get all tabs information
   * @param {Object} [params] - Query parameters
   * @param {boolean} [params.currentWindow=true] - Whether to query only current window
   * @returns {Promise<Array>} - All matching tabs
   */
  getAllTabs: async ({ currentWindow = true } = {}) => {
    try {
      const tabs = await chrome.tabs.query({ currentWindow })

      return tabs.map((tab) => `id: ${tab.id}, title: ${tab.title}`).join('; ')
    } catch (error) {
      throw new Error(`Failed to get tabs list: ${error.message}`)
    }
  },

  /**
   * Close specified tabs
   * @param {Object} params - Parameter object
   * @param {number|number[]} params.tabIds - Tab ID or array of tab IDs to close
   * @returns {Promise<Object>} - Close operation result
   */
  closeTabs: async ({ tabIds }) => {
    try {
      chrome.tabs.remove(tabIds)
      return `tab[${tabIds}] closed.`
    } catch (error) {
      throw new Error(`Failed to close tabs: ${error.message}`)
    }
  },

  /**
   * Reload tab
   * @param {Object} params - Parameter object
   * @param {number} params.tabId - Tab ID to reload
   * @param {boolean} [params.bypassCache=false] - Whether to bypass cache
   * @returns {Promise<Object>} - Operation result
   */
  reloadTab: async ({ tabId, bypassCache = false }) => {
    if (!tabId) {
      throw new Error('Tab ID not specified')
    }

    try {
      await chrome.tabs.reload(tabId, { bypassCache })
      return `tab[${tabId}] has refreshed.`
    } catch (error) {
      throw new Error(`Failed to reload tab: ${error.message}`)
    }
  },

  /**
   * Update tab
   * @param {Object} params - Parameter object
   * @param {number} params.tabId - Tab ID
   * @param {Object} params.updateProperties - Properties to update
   * @returns {Promise<Object>} - Updated tab information
   */
  updateTab: async ({ tabId, updateProperties }) => {
    if (!tabId) {
      throw new Error('Tab ID not specified')
    }

    try {
      const updatedTab = await chrome.tabs.update(tabId, updateProperties)
      return `updated successfully. tab info:id: ${updatedTab.id}, title: ${updatedTab.title}`
    } catch (error) {
      throw new Error(`Failed to update tab: ${error.message}`)
    }
  },

  // Tools definition
  tools: {
    createTab: {
      type: 'function',
      function: {
        name: 'createTab',
        description: 'Create and open new tab',
        parameters: {
          type: 'object',
          properties: {
            url: {
              type: 'string',
              description: 'URL of the webpage to open',
            },
          },
          required: ['url'],
        },
      },
    },

    getCurrentTab: {
      type: 'function',
      function: {
        name: 'getCurrentTab',
        description: 'Get current active tab information, including id and title',
      },
    },

    getAllTabs: {
      type: 'function',
      function: {
        name: 'getAllTabs',
        description: 'Get all tabs information, including id and title',
      },
    },

    closeTabs: {
      type: 'function',
      function: {
        name: 'closeTabs',
        description: 'Close one or multiple tabs',
        parameters: {
          type: 'object',
          properties: {
            tabIds: {
              oneOf: [{ type: 'number' }, { type: 'array', items: { type: 'number' } }],
              description: 'Tab ID or array of tab IDs to close',
            },
          },
          required: ['tabIds'],
        },
      },
    },

    reloadTab: {
      type: 'function',
      function: {
        name: 'reloadTab',
        description: 'Reload specified tab',
        parameters: {
          type: 'object',
          properties: {
            tabId: {
              type: 'number',
              description: 'Tab ID to reload',
            },
          },
          required: ['tabId'],
        },
      },
    },

    updateTab: {
      type: 'function',
      function: {
        name: 'updateTab',
        description: 'Update tab properties',
        parameters: {
          type: 'object',
          properties: {
            tabId: {
              type: 'integer',
              description: 'Tab ID to update',
            },
            updateProperties: {
              type: 'object',
              description: 'Properties to update',
              properties: {
                url: {
                  type: 'string',
                  description: 'URL to navigate to',
                },
                active: {
                  type: 'boolean',
                  description: 'Whether to activate the tab',
                },
                muted: {
                  type: 'boolean',
                  description: 'Whether to mute the tab',
                },
                pinned: {
                  type: 'boolean',
                  description: 'Whether to pin the tab',
                },
              },
            },
          },
          required: ['tabId', 'updateProperties'],
        },
      },
    },
  },
}

export default tabs_manager
