const scrollScreen = {
  call: async ({ screenIndex = 1 }) => {
    try {
      const tabs = await chrome.tabs.query({ active: true, currentWindow: true })
      if (!tabs || !tabs[0]) {
        throw new Error('cannot find the current tab')
      }

      const result = await chrome.scripting.executeScript({
        target: { tabId: tabs[0].id },
        function: (screenIndex) => {
          const viewportHeight = window.innerHeight
          const targetScrollTop = (screenIndex - 1) * viewportHeight
          const currentScrollTop = window.scrollY
          const tolerance = 10
          if (Math.abs(currentScrollTop - targetScrollTop) <= tolerance) {
            return {
              scrolled: false,
              message: `Already on screen ${screenIndex}, no need to scroll.`,
            }
          }
          window.scrollTo({ top: targetScrollTop, behavior: 'smooth' })
          return { scrolled: true, message: `Already scroll on screen ${screenIndex}` }
        },
        args: [screenIndex],
      })

      const scrollResult = result[0].result
      if (scrollResult.scrolled) {
        await new Promise((resolve) => setTimeout(resolve, 1500))
      }
      return scrollResult.message
    } catch (error) {
      return error.message
    }
  },

  tool: {
    type: 'function',
    function: {
      name: 'scrollScreen',
      description: 'scroll screen',
      parameters: {
        type: 'object',
        properties: {
          screenIndex: {
            type: 'integer',
            description: 'Page to scroll to (1 viewport height per page). Default: 1',
          },
        },
        required: ['screenIndex'],
      },
    },
  },
}

export default scrollScreen
