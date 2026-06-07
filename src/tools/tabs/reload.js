const reloadTab = {
  call: async ({ tabId, bypassCache = false }) => {
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

  tool: {
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
}

export default reloadTab
