/**
 * HTML processing utility functions
 */

/**
 * Trim HTML content, remove unnecessary tags and content
 * @param {string} html - Original HTML content
 * @param {int} page - Page number
 * @param {int} offset - Character limit per page
 * @returns {string} - Trimmed HTML content
 */
const trimHtml = (html, page = 1, offset = 600) => {
  let decodedHtml = decodeEscapedHTML(html)
  // Create a DOM parser
  let doc = new DOMParser().parseFromString(decodedHtml, 'text/html')

  let output = []
  // Select tags to keep
  let tagsToKeep = ['div', 'input', 'button', 'a', 'textarea']

  tagsToKeep.forEach((tag) => {
    doc.querySelectorAll(tag).forEach((el) => {
      // Get all attributes
      const attributes = Array.from(el.attributes)

      // Traverse and remove unnecessary attributes
      attributes.forEach((attr) => {
        const name = attr.name.toLowerCase()

        // Keep id, class, href and event binding attributes (starting with on)
        const keepAttribute =
          name === 'id' || name === 'class' || name === 'href' || name.startsWith('on')

        if (!keepAttribute) {
          el.removeAttribute(attr.name)
        }
      })

      // Clean element text content
      el.textContent = el.textContent.trim().replace(/\s*/g, '')

      // Check if it's an empty element (no attribute value and no text content)
      const hasAttributes = el.attributes.length > 0
      const hasTextContent = el.textContent.trim().length > 0

      if (hasAttributes || hasTextContent) {
        output.push(el.outerHTML)
      }
    })
  })

  // Pagination logic
  let pages = []
  let currentPage = []
  let currentLength = 0

  output.forEach((item) => {
    let itemLength = item.length

    // If the current page cannot accommodate new items, start a new page
    if (currentLength + itemLength > offset) {
      pages.push(currentPage.join('')) // Store current page data
      currentPage = [] // Start a new page
      currentLength = 0
    }

    currentPage.push(item)
    currentLength += itemLength
  })

  // Add the last page
  if (currentPage.length > 0) {
    pages.push(currentPage.join(''))
  }

  let totalPages = pages.length

  return JSON.stringify({ data: pages[page - 1], page, totalPages })
}

const decodeEscapedHTML = (html) => {
  return html
    .replace(/\\x3C/g, '<') // \x3C -> <
    .replace(/\\x3E/g, '>') // \x3E -> >
    .replace(/&lt;/g, '<') // &lt; -> <
    .replace(/&gt;/g, '>') // &gt; -> >
    .replace(/&quot;/g, '"') // &quot; -> "
    .replace(/&amp;/g, '&') // &amp; -> &
}

const trimText = (text, page = 1, offset = 600) => {
  if (typeof text !== 'string') {
    throw new Error('Input text must be a string')
  }

  // Remove leading and trailing spaces
  text = text.trim().replace(/\s+/g, '')

  // Calculate total pages
  const totalPages = Math.ceil(text.length / offset)

  // Ensure page number is within a reasonable range
  page = Math.max(1, Math.min(page, totalPages))

  // Calculate start and end indices
  const start = (page - 1) * offset
  const end = start + offset

  // Extract data for the current page
  const data = text.substring(start, end)

  return JSON.stringify({ data, page, totalPages })
}

export { trimHtml, trimText }
