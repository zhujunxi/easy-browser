/**
 * Tools index - Registers all tools with the ToolRegistry
 * Each tool follows the standard: { call, tool } pattern
 */

import toolRegistry, { TOOL_CATEGORIES } from './registry.js'

import createTab from './tabs/create.js'
import getCurrentTab from './tabs/get-current.js'
import getAllTabs from './tabs/get-all.js'
import closeTabs from './tabs/close.js'
import reloadTab from './tabs/reload.js'
import updateTab from './tabs/update.js'

import scrollScreen from './page/scroll.js'
import getScreenStructure from './page/get-structure.js'
import getScreenContent from './page/get-content.js'
import getScreenShot from './page/get-screenshot.js'

import clickElement from './interaction/click.js'
import typeText from './interaction/type.js'
import hoverElement from './interaction/hover.js'

import wait from './utility/wait.js'
import userConfirm from './utility/user-confirm.js'

toolRegistry.register('createTab', createTab.call, createTab.tool, TOOL_CATEGORIES.NAVIGATION)
toolRegistry.register(
  'getCurrentTab',
  getCurrentTab.call,
  getCurrentTab.tool,
  TOOL_CATEGORIES.NAVIGATION,
)
toolRegistry.register('getAllTabs', getAllTabs.call, getAllTabs.tool, TOOL_CATEGORIES.NAVIGATION)
toolRegistry.register('closeTabs', closeTabs.call, closeTabs.tool, TOOL_CATEGORIES.NAVIGATION)
toolRegistry.register('reloadTab', reloadTab.call, reloadTab.tool, TOOL_CATEGORIES.NAVIGATION)
toolRegistry.register('updateTab', updateTab.call, updateTab.tool, TOOL_CATEGORIES.NAVIGATION)

toolRegistry.register(
  'scrollScreen',
  scrollScreen.call,
  scrollScreen.tool,
  TOOL_CATEGORIES.PAGE_INTERACTION,
)
toolRegistry.register(
  'getScreenStructure',
  getScreenStructure.call,
  getScreenStructure.tool,
  TOOL_CATEGORIES.PAGE_QUERY,
)
toolRegistry.register(
  'getScreenContent',
  getScreenContent.call,
  getScreenContent.tool,
  TOOL_CATEGORIES.PAGE_QUERY,
)
toolRegistry.register(
  'getScreenShot',
  getScreenShot.call,
  getScreenShot.tool,
  TOOL_CATEGORIES.PAGE_QUERY,
)

toolRegistry.register(
  'clickElement',
  clickElement.call,
  clickElement.tool,
  TOOL_CATEGORIES.PAGE_INTERACTION,
)
toolRegistry.register('typeText', typeText.call, typeText.tool, TOOL_CATEGORIES.PAGE_INTERACTION)
toolRegistry.register(
  'hoverElement',
  hoverElement.call,
  hoverElement.tool,
  TOOL_CATEGORIES.PAGE_INTERACTION,
)

toolRegistry.register('wait', wait.call, wait.tool, TOOL_CATEGORIES.UTILITY)
toolRegistry.register('userConfirm', userConfirm.call, userConfirm.tool, TOOL_CATEGORIES.UTILITY)

export { toolRegistry, TOOL_CATEGORIES }

// Convenience exports: flat Calls map + Tools definitions array
const Calls = toolRegistry.getCalls()
const Tools = toolRegistry.getTools()

export { Calls, Tools }
export default toolRegistry
