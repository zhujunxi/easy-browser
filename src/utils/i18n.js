import ConfigManager from '@config/index'
import { LANGUAGES } from '@config/types'
import en from '@config/locales/en'
import zh from '@config/locales/zh'

const locales = {
  [LANGUAGES.ENGLISH]: en,
  [LANGUAGES.CHINESE]: zh,
}

class I18n {
  constructor() {
    this.currentLanguage = LANGUAGES.ENGLISH
    this.subscribers = new Set()
    this.init()
  }

  subscribe(component) {
    this.subscribers.add(component)
    return () => this.subscribers.delete(component)
  }

  notify() {
    this.subscribers.forEach((component) => component.forceUpdate())
  }

  async init() {
    try {
      const config = await ConfigManager.get(['language'])
      this.setLanguage(config.language || LANGUAGES.ENGLISH)
    } catch (error) {
      console.error('Failed to load language settings:', error)
      this.setLanguage(LANGUAGES.ENGLISH)
    }
  }

  setLanguage(language) {
    if (language === LANGUAGES.SYSTEM) {
      const systemLanguage = navigator.language.startsWith('zh')
        ? LANGUAGES.CHINESE
        : LANGUAGES.ENGLISH
      this.currentLanguage = systemLanguage
    } else {
      this.currentLanguage = language
    }
    this.notify()
  }

  t(key) {
    const keys = key.split('.')
    let value = locales[this.currentLanguage]

    for (const k of keys) {
      if (value && value[k]) {
        value = value[k]
      } else {
        return key
      }
    }

    return value
  }
}

export const i18n = new I18n()
