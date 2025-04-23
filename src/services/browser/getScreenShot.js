/**
 * Get page screen shot Function and Tool Definition
 */

import { trimHtml } from '@utils/trim_html.js'

const getScreenShot = {
  call: async () => {
    try {
      const tabs = await chrome.tabs.query({ active: true, currentWindow: true })
      if (!tabs || !tabs[0]) {
        throw new Error('cannot find the current tab')
      }
      const sendMessagePromise = () => {
        return new Promise((resolve, reject) => {
          chrome.runtime.sendMessage({ action: 'GET_SCREEN_SHOT' }, (response) => {
            if (chrome.runtime.lastError) {
              reject(new Error(chrome.runtime.lastError.message))
            } else {
              resolve(response)
            }
          })
        })
      }
      const result = await sendMessagePromise()

      return result
    } catch (error) {
      return error.message
    }
  },
  // Tool definition
  tool: {
    type: 'function',
    function: {
      name: 'getScreenShot',
      description:
        'Get a screenshot of the current screen visible area to identify complex page structures',
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

export default getScreenShot
