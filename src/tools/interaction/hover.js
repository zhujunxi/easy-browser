import pageDataStore from '../store/page-data.js'

const hoverElement = {
  call: async ({ tagIndex }) => {
    try {
      const numericIndex = Number(tagIndex)
      const xpath = pageDataStore.getItem(numericIndex).xpath

      const tabs = await chrome.tabs.query({ active: true, currentWindow: true })
      if (!tabs || !tabs[0]) {
        throw new Error('cannot find the current tab')
      }

      const tabId = tabs[0].id

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
            throw new Error('cannot find the element')
          }

          element.dispatchEvent(new MouseEvent('mouseover', { bubbles: true }))
          element.dispatchEvent(new MouseEvent('mouseenter', { bubbles: true }))

          const tooltip =
            element.getAttribute('title') || element.getAttribute('data-tooltip') || ''
          return tooltip
        },
        args: [xpath],
      })

      return `hover element successfully.`
    } catch (error) {
      return error.message
    }
  },

  tool: {
    type: 'function',
    function: {
      name: 'hoverElement',
      description: 'Hover element by index',
      parameters: {
        type: 'object',
        properties: {
          tagIndex: {
            type: 'integer',
            description: 'Element index from getScreenStructure',
          },
        },
        required: ['tagIndex'],
      },
    },
  },
}

export default hoverElement
