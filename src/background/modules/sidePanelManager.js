let isSidePanelOpen = false

const openSidePanel = async (windowId) => {
  if (!chrome.sidePanel || !chrome.sidePanel.setOptions) {
    throw new Error('Side panel API not available')
  }
  try {
    await chrome.sidePanel.open({ windowId })
    return true
  } catch (e) {
    throw e
  }
}

const closeSidePanel = async () => {
  if (!chrome.sidePanel || !chrome.sidePanel.setOptions) {
    throw new Error('Side panel API not available')
  }
  try {
    await chrome.sidePanel.setOptions({ enabled: false })
    await chrome.sidePanel.setOptions({ enabled: true })
    return true
  } catch (e) {
    throw e
  }
}

export const toggleSidePanelHandler = async (sender, sendResponse) => {
  const windowId = sender.tab?.windowId

  if (isSidePanelOpen) {
    await closeSidePanel()
    sendResponse({ success: true, isOpen: false })
  } else {
    await openSidePanel(windowId)
    sendResponse({ success: true, isOpen: true })
  }
}

chrome.runtime.onConnect.addListener((port) => {
  if (port.name === 'sidepanel-connection') {
    isSidePanelOpen = true
    port.onDisconnect.addListener(() => {
      isSidePanelOpen = false
    })
  }
})
