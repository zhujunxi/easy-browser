import scrollScreen from './scroll.js'

const getScreenContent = {
  call: async ({ screenIndex = 1 }) => {
    try {
      const tabs = await chrome.tabs.query({ active: true, currentWindow: true })
      if (!tabs || !tabs[0]) {
        throw new Error('cannot find the current tab')
      }
      await scrollScreen.call({ screenIndex })
      const sendMessagePromise = () => {
        return new Promise((resolve, reject) => {
          chrome.tabs.sendMessage(
            tabs[0].id,
            { action: 'GET_SCREEN_CONTENT', screenIndex },
            (response) => {
              if (chrome.runtime.lastError) {
                reject(new Error(chrome.runtime.lastError.message))
              } else {
                resolve(response)
              }
            },
          )
        })
      }
      const result = await sendMessagePromise()
      return result
    } catch (error) {
      return error.message
    }
  },

  tool: {
    type: 'function',
    function: {
      name: 'getScreenContent',
      description: 'Get text content of current viewport',
      parameters: {
        type: 'object',
        properties: {
          screenIndex: {
            type: 'integer',
            description: 'Screen page number, default is 1',
          },
        },
        required: ['screenIndex'],
      },
    },
  },
}

export default getScreenContent
