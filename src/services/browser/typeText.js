/**
 * Type Text Function and Tool Definition
 */
import pageDataStore from './Store/index.js'

const typeText = {
  call: async ({ tagIndex, text }) => {
    try {
      const numericIndex = Number(tagIndex)

      const xpath = pageDataStore.getItem(numericIndex).xpath

      const tabs = await chrome.tabs.query({ active: true, currentWindow: true })
      const tabId = tabs[0].id

      const result = await chrome.scripting.executeScript({
        target: { tabId },
        function: async (xpath, text) => {
          return new Promise((resolve) => {
            let structureChanged = false

            const observer = new MutationObserver((mutations) => {
              for (const mutation of mutations) {
                if (
                  mutation.target === inputElement &&
                  mutation.type === 'attributes' &&
                  mutation.attributeName === 'value'
                ) {
                  continue
                }
                structureChanged = true
                break
              }
            })

            const config = {
              childList: true,
              attributes: true,
              characterData: true,
              subtree: true,
            }

            observer.observe(document.body, config)

            const inputElement = document.evaluate(
              xpath,
              document,
              null,
              XPathResult.FIRST_ORDERED_NODE_TYPE,
              null,
            ).singleNodeValue

            if (!inputElement) {
              observer.disconnect()
              resolve({ success: false, message: 'can not find the element' })
              return
            }

            inputElement.focus()
            inputElement.click()
            inputElement.value = text
            inputElement.dispatchEvent(new Event('input', { bubbles: true }))
            inputElement.dispatchEvent(new Event('change', { bubbles: true }))

            setTimeout(() => {
              observer.disconnect()

              if (structureChanged) {
                resolve({ success: true, structureChanged: true })
              } else {
                resolve({ success: true, structureChanged: false })
              }
            }, 1000)
          })
        },
        args: [xpath, text],
      })

      const operationResult = result[0].result

      if (!operationResult.success) {
        throw new Error(operationResult.message)
      }

      return operationResult.structureChanged
        ? 'input text successfully. Page Structure has changed'
        : 'input text successfully.'
    } catch (error) {
      return error.message
    }
  },
  // Tool Definition
  tool: {
    type: 'function',
    function: {
      name: 'typeText',
      description: 'type text in input or textarea by index in the page screen',
      parameters: {
        type: 'object',
        properties: {
          tagIndex: {
            type: 'integer',
            description:
              'Index of the input or textarea，need to get the element index from getScreenStructure',
          },
          text: {
            type: 'string',
            description: 'Text to be typed',
          },
        },
        required: ['tagIndex', 'text'],
      },
    },
  },
}

export default typeText
