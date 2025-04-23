import scanPageEffect from './utils/scanPageEffect.js'
import markElements from './utils/markElements.js'
import getInteractiveElements from './utils/getInteractiveElements'
import getElementsDetail from './utils/getElementsDetail.js'
import getVisibleTextInViewport from './utils/getVisibleTextInViewport.js'
import FloatButton from './components/FloatButton.js'

chrome.runtime.onMessage.addListener(async (request, sender, sendResponse) => {
  if (request.action === 'GET_SCREEN_STRUCTURE') {
    const elements = await getInteractiveElements(document)
    const response = elements.map((el) => getElementsDetail(el))
    scanPageEffect()
    // markElements(elements)
    sendResponse(response)
  } else if (request.action === 'GET_SCREEN_CONTENT') {
    const response = await getVisibleTextInViewport(document)
    scanPageEffect()
    sendResponse(response)
  }
})
