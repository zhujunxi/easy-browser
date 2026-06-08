const getAllTabs = {
  call: async ({ currentWindow = true } = {}) => {
    try {
      const tabs = await chrome.tabs.query({ currentWindow })
      return tabs.map((tab) => `id: ${tab.id}, title: ${tab.title}`).join('; ')
    } catch (error) {
      throw new Error(`Failed to get tabs list: ${error.message}`)
    }
  },

  tool: {
    type: 'function',
    function: {
      name: 'getAllTabs',
      description: 'Get all tabs info',
    },
  },
}

export default getAllTabs
