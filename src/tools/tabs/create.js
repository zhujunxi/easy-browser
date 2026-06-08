const createTab = {
  call: async ({ url }) => {
    try {
      new URL(url)
    } catch {
      throw new Error('Invalid URL format')
    }

    try {
      const tab = await chrome.tabs.create({ url })

      return new Promise((resolve, reject) => {
        const listener = (tabId, changeInfo) => {
          if (tabId === tab.id && changeInfo.status === 'complete') {
            chrome.tabs.onUpdated.removeListener(listener)
            resolve(`The tab[${tab.id}] of ${url} has been opened and loaded successfully.`)
          }
        }

        chrome.tabs.onUpdated.addListener(listener)

        setTimeout(() => {
          chrome.tabs.onUpdated.removeListener(listener)
          reject(new Error('Tab opening timeout, please check your network'))
        }, 30000)
      })
    } catch (error) {
      throw new Error(`Cannot open new tab: ${error.message}`)
    }
  },

  tool: {
    type: 'function',
    function: {
      name: 'createTab',
      description: 'Create and open new tab',
      parameters: {
        type: 'object',
        properties: {
          url: {
            type: 'string',
            description: 'URL to open',
          },
        },
        required: ['url'],
      },
    },
  },
}

export default createTab
