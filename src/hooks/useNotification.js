import { useState, useCallback } from 'react'

/**
 * Notification Management Hook
 * Handle notification display and auto-hide
 * @param {number} duration
 * @returns {Object}
 */
export function useNotification(duration = 5000) {
  const [notification, setNotification] = useState({
    visible: false,
    message: '',
    type: 'info', // 'info', 'success', 'error'
  })

  // show
  const showNotification = useCallback(
    (message, type = 'info') => {
      setNotification({ visible: true, message, type })

      // auto hide
      const timer = setTimeout(() => {
        setNotification((prev) => ({ ...prev, visible: false }))
      }, duration)

      // clear timer
      return () => clearTimeout(timer)
    },
    [duration],
  )

  // hide
  const hideNotification = useCallback(() => {
    setNotification((prev) => ({ ...prev, visible: false }))
  }, [])

  return {
    notification,
    showNotification,
    hideNotification,
  }
}
