const closeTabs = {
  call: async ({ tabIds }) => {
    try {
      await chrome.tabs.remove(tabIds)
      return `tab[${tabIds}] closed.`
    } catch (error) {
      throw new Error(`Failed to close tabs: ${error.message}`)
    }
  },

  tool: {
    type: 'function',
    function: {
      name: 'closeTabs',
      description: 'Close one or multiple tabs',
      parameters: {
        type: 'object',
        properties: {
          tabIds: {
            oneOf: [{ type: 'number' }, { type: 'array', items: { type: 'number' } }],
            description: 'Tab ID(s) to close',
          },
        },
        required: ['tabIds'],
      },
    },
  },
}

export default closeTabs
