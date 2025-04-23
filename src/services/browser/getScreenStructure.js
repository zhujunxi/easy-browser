/**
 * Get page structure Function and Tool Definition
 */

import pageDataStore from './Store/index.js'
import arrayToHtmlString from '../../content/utils/arrayToHtmlString.js'
import scrollScreen from '@services/browser/scrollScreen.js'
const getScreenStructure = {
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
            {
              action: 'GET_SCREEN_STRUCTURE',
              screenIndex,
            },
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
      pageDataStore.setData(result)

      return arrayToHtmlString(result)
    } catch (error) {
      return error.message
    }
  },
  // Tool definition// Tool definition
  tool: {
    type: 'function',
    function: {
      name: 'getScreenStructure',
      description:
        'Gets the interactive elements in the current screen visible area, which is used to identify page tags for input, click and other interactions. Does not include page content',
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

export default getScreenStructure
