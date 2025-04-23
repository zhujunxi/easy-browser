import { toggleSidePanelHandler } from './modules/sidePanelManager.js'

chrome.sidePanel
  .setPanelBehavior({ openPanelOnActionClick: true })
  .catch((error) => console.error(error))

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'TOGGLE_SIDEPANEL') {
    toggleSidePanelHandler(sender, sendResponse)
    return true
  } else if (message.action === 'GET_SCREEN_SHOT') {
    chrome.tabs.captureVisibleTab(null, { format: 'png' }, (dataUrl) => {
      sendResponse({ screenshotUrl: dataUrl })
    })
    return true
  }
})
