import { useState, useEffect } from 'react'
import { i18n } from '@utils/i18n'

export function useI18n() {
  const [language, setLanguage] = useState(i18n.currentLanguage)

  useEffect(() => {
    const update = () => setLanguage(i18n.currentLanguage)
    i18n.subscribe({ forceUpdate: update })
    return () => i18n.subscribe({ forceUpdate: update })()
  }, [])

  return {
    t: i18n.t.bind(i18n),
    setLanguage: (lang) => {
      i18n.setLanguage(lang)
      setLanguage(lang)
    },
    currentLanguage: language,
  }
}
