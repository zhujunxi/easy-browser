const getCurrentTab = {
  call: async () => {
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

  tool: {
    type: 'function',
    function: {
      name: 'getCurrentTab',
      description: 'Get current active tab information, including id and title',
    },
  },
}

export default getCurrentTab
