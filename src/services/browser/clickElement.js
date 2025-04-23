/**
 * Click Element Function and Tool Definition
 */
import pageDataStore from './Store/index.js'

const clickElement = {
  call: async ({ tagIndex }) => {
    try {
      const numericIndex = Number(tagIndex)

      const xpath = pageDataStore.getItem(numericIndex).xpath

      const tabs = await chrome.tabs.query({ active: true, currentWindow: true })
      if (!tabs || !tabs[0]) {
        throw new Error('cannot find the current tab')
      }

      const tabId = tabs[0].id
      const originalUrl = tabs[0].url

      const waitForUrlChange = (tabId, originalUrl, timeout = 1000) => {
        return new Promise((resolve) => {
          const listener = (updatedTabId, changeInfo) => {
            if (updatedTabId === tabId && changeInfo.url && changeInfo.url !== originalUrl) {
              chrome.tabs.onUpdated.removeListener(listener)
              resolve(true)
            }
          }

          chrome.tabs.onUpdated.addListener(listener)

          setTimeout(() => {
            chrome.tabs.onUpdated.removeListener(listener)
            resolve(false)
          }, timeout)
        })
      }

      await chrome.scripting.executeScript({
        target: { tabId },
        function: (xpath) => {
          const result = document.evaluate(
            xpath,
            document,
            null,
            XPathResult.FIRST_ORDERED_NODE_TYPE,
            null,
          )
          const element = result.singleNodeValue
          if (!element) {
            throw new Error('Cannot find the element')
          }

          if (element.type === 'submit' || element.getAttribute('role') === 'button') {
            const form = element.closest('form')
            if (form) {
              form.submit()
              return
            }
          }

          element.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }))
          element.dispatchEvent(new MouseEvent('mouseup', { bubbles: true }))
          element.dispatchEvent(new MouseEvent('click', { bubbles: true }))
        },
        args: [xpath],
      })

      const didNavigate = await waitForUrlChange(tabId, originalUrl)

      return `The element has been clicked successfully. ${didNavigate ? 'The page has been redirected' : ''}`
    } catch (error) {
      return error.message
    }
  },
  // Tool definition
  tool: {
    type: 'function',
    function: {
      name: 'clickElement',
      description: 'Click the element by index in the page screen',
      parameters: {
        type: 'object',
        properties: {
          tagIndex: {
            type: 'integer',
            description:
              'To click the index of the element, need to get the element index from getScreenStructure',
          },
        },
        required: ['tagIndex'],
      },
    },
  },
}

export default clickElement
