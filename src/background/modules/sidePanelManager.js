let isSidePanelOpen = false
let toggling = false

const openSidePanel = async (windowId) => {
  if (!chrome.sidePanel || !chrome.sidePanel.setOptions) {
    throw new Error('Side panel API not available')
  }
  await chrome.sidePanel.open({ windowId })
  return true
}

const closeSidePanel = async () => {
  if (!chrome.sidePanel || !chrome.sidePanel.setOptions) {
    throw new Error('Side panel API not available')
  }
  await chrome.sidePanel.setOptions({ enabled: false })
  await chrome.sidePanel.setOptions({ enabled: true })
  return true
}

export const toggleSidePanelHandler = async (sender, sendResponse) => {
  if (toggling) {
    sendResponse({ success: false, isOpen: isSidePanelOpen })
    return
  }
  toggling = true

  const windowId = sender.tab?.windowId

  try {
    if (isSidePanelOpen) {
      await closeSidePanel()
      isSidePanelOpen = false
      sendResponse({ success: true, isOpen: false })
    } else {
      await openSidePanel(windowId)
      isSidePanelOpen = true
      sendResponse({ success: true, isOpen: true })
    }
  } catch (err) {
    console.error('toggleSidePanel error:', err)
    sendResponse({ success: false, isOpen: isSidePanelOpen })
  } finally {
    toggling = false
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
