const updateTab = {
  call: async ({ tabId, updateProperties }) => {
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

  tool: {
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
              url: { type: 'string', description: 'New URL' },
              active: { type: 'boolean', description: 'Activate tab' },
              muted: { type: 'boolean', description: 'Mute tab' },
              pinned: { type: 'boolean', description: 'Pin tab' },
            },
          },
        },
        required: ['tabId', 'updateProperties'],
      },
    },
  },
}

export default updateTab
