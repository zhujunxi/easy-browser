import { toggleSidePanelHandler } from './modules/sidePanelManager.js'

chrome.sidePanel
  .setPanelBehavior({ openPanelOnActionClick: true })
  .catch((error) => console.error(error))

const broadcastToAllTabs = (msg) => {
  chrome.tabs.query({}, (tabs) => {
    for (const tab of tabs) {
      chrome.tabs.sendMessage(tab.id, msg).catch(() => {})
    }
  })
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'settings_updated') {
    broadcastToAllTabs({ type: 'floatBtnChanged', value: message.floatBtn })
    return
  }

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
