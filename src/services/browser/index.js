import tabsManager from './tabsManager.js'
import scrollScreen from './scrollScreen.js'
import getScreenStructure from './getScreenStructure.js'
import getScreenContent from './getScreenContent.js'
import typeText from './typeText.js'
import clickElement from './clickElement.js'
import hoverElement from './hoverElement.js'
import wait from './wait.js'
import userConfirm from './userConfirm.js'

const Calls = {
  createTab: tabsManager.createTab,
  getCurrentTab: tabsManager.getCurrentTab,
  getAllTabs: tabsManager.getAllTabs,
  closeTabs: tabsManager.closeTabs,
  reloadTab: tabsManager.reloadTab,
  updateTab: tabsManager.updateTab,
  scrollScreen: scrollScreen.call,
  getScreenStructure: getScreenStructure.call,
  getScreenContent: getScreenContent.call,
  typeText: typeText.call,
  clickElement: clickElement.call,
  hoverElement: hoverElement.call,
  wait: wait.call,
  userConfirm: userConfirm.call,
}

const Tools = [
  tabsManager.tools.createTab,
  tabsManager.tools.getCurrentTab,
  tabsManager.tools.getAllTabs,
  tabsManager.tools.closeTabs,
  tabsManager.tools.reloadTab,
  tabsManager.tools.updateTab,
  scrollScreen.tool,
  getScreenStructure.tool,
  getScreenContent.tool,
  typeText.tool,
  clickElement.tool,
  hoverElement.tool,
  wait.tool,
  userConfirm.tool,
]

export { Calls, Tools }
