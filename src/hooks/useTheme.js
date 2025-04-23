// useTheme.js - Theme Management Hook
import { useEffect } from 'react'
import ConfigManager from '@config/index'
import { THEMES } from '@config/types'

/**
 * Theme Management Hook - Handles theme application and change monitoring
 * @param {string} theme - Current theme setting
 */
export const useTheme = () => {
  const setTheme = (themeSetting) => {
    const isDark =
      themeSetting === THEMES.DARK ||
      (themeSetting === THEMES.SYSTEM && window.matchMedia('(prefers-color-scheme: dark)').matches)

    document.documentElement.classList.toggle('dark', isDark)
  }
  const loadTheme = async () => {
    try {
      const config = await ConfigManager.get(['theme'])
      setTheme(config.theme || THEMES.SYSTEM)
    } catch (error) {
      console.error('Failed to load theme settings:', error)
      setTheme(THEMES.SYSTEM)
    }
  }
  // Initialize theme
  useEffect(() => {
    // Monitor system theme changes
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    const handleThemeChange = async () => {
      const config = await ConfigManager.get('theme')
      if (config.theme === THEMES.SYSTEM) {
        setTheme(THEMES.SYSTEM)
      }
    }

    mediaQuery.addEventListener('change', handleThemeChange)

    loadTheme()
  }, [])

  return { setTheme, loadTheme }
}
