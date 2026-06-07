import scanPageEffect from './utils/scanPageEffect.js'
import getInteractiveElements, { getElementsDetail } from './utils/page-scanner.js'
import getVisibleTextInViewport from './utils/text-extractor.js'
import FloatButton from './components/FloatButton.js'

chrome.runtime.onMessage.addListener(async (request, sender, sendResponse) => {
  if (request.action === 'GET_SCREEN_STRUCTURE') {
    const elements = await getInteractiveElements(document)
    const response = elements.map((el) => getElementsDetail(el))
    scanPageEffect()
    // markElements(elements)
    sendResponse(response)
    return true
  } else if (request.action === 'GET_SCREEN_CONTENT') {
    const response = await getVisibleTextInViewport(document)
    scanPageEffect()
    sendResponse(response)
    return true
  }
})
