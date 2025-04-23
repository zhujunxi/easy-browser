import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { useState, useEffect } from 'react'
import '@assets/styles/index.scss'
import './options.scss'
import '@assets/styles/components.scss'

import ConfigManager from '@config/index'
import { MODEL_PROVIDERS, THEMES, LANGUAGES } from '@config/types'
import { useTheme } from '@hooks/useTheme'
import { useNotification } from '@hooks/useNotification'
import { useI18n } from '@hooks/useI18n'
import SelectBox from '@components/SelectBox'
import ToggleSwitch from '@components/ToggleSwitch'
import ModelCard from './ModelCard'
import FloatButton from '../content/components/FloatButton.js'

const OptionsPage = () => {
  const { notification, showNotification } = useNotification()
  const { setTheme } = useTheme()
  const { t, setLanguage } = useI18n()
  const [settings, setSettings] = useState({
    openaiKey: '',
    openaiHost: ConfigManager.defaults.openaiHost,
    openaiModel: ConfigManager.defaults.openaiModel,
    qwenKey: '',
    qwenHost: ConfigManager.defaults.qwenHost,
    qwenModel: ConfigManager.defaults.qwenModel,
    deepseekKey: '',
    deepseekHost: ConfigManager.defaults.deepseekHost,
    deepseekModel: ConfigManager.defaults.deepseekModel,
    aiModel: ConfigManager.defaults.aiModel,
    theme: ConfigManager.defaults.theme,
    language: ConfigManager.defaults.language,
    floatBtn: ConfigManager.defaults.floatBtn,
  })

  // load settings
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const config = await ConfigManager.get(Object.keys(settings))

        setSettings((prevSettings) => ({
          ...prevSettings,
          ...config,
        }))
      } catch (error) {
        showNotification(t('common.settingsLoadFailed'), 'error')
      }
    }

    loadSettings()
  }, [])

  const handleThemeChange = (e) => {
    const value = e.target.value
    setSettings((prevSettings) => ({
      ...prevSettings,
      theme: value,
    }))
    setTheme(value)
  }

  const handleLanguageChange = (e) => {
    const value = e.target.value

    setSettings((prevSettings) => ({
      ...prevSettings,
      language: value,
    }))
    setLanguage(value)
  }

  const handleChange = (e) => {
    const { id, value, type, checked } = e.target
    setSettings((prev) => ({
      ...prev,
      [id]: type === 'checkbox' ? checked : value,
    }))
  }

  const handleSave = async () => {
    try {
      await ConfigManager.set(settings)
      chrome.runtime.sendMessage({ type: 'settings_updated' })
      showNotification(t('common.settingsSaved'), 'success')
    } catch (error) {
      showNotification(`${t('common.saveFailed')}: ${error.message}`, 'error')
    }
  }

  return (
    <div className='options-page'>
      <div className='options-header-wrap'>
        <div className='options-header'>
          <div className='title'>
            <img src='../../assets/logo/icon-128.png' alt='logo' />
            <h1>Easy Browser</h1>
          </div>
        </div>
      </div>
      <div className='options-container'>
        <section className='settings-section'>
          <div className='form-group form-group-inline'>
            <label htmlFor='theme'>{t('settings.theme')}</label>
            <SelectBox
              id='theme'
              value={settings.theme}
              onChange={handleThemeChange}
              options={[
                { value: THEMES.SYSTEM, label: t('settings.followSystem') },
                { value: THEMES.LIGHT, label: t('settings.light') },
                { value: THEMES.DARK, label: t('settings.dark') },
              ]}
            />
          </div>

          <div className='form-group form-group-inline'>
            <label htmlFor='language'>{t('settings.language')}</label>
            <SelectBox
              id='language'
              value={settings.language}
              onChange={handleLanguageChange}
              options={[
                { value: LANGUAGES.SYSTEM, label: t('settings.followSystem') },
                { value: LANGUAGES.ENGLISH, label: t('settings.english') },
                { value: LANGUAGES.CHINESE, label: t('settings.chinese') },
              ]}
            />
          </div>

          <div className='form-group form-group-inline'>
            <label htmlFor='floatBtn'>{t('settings.floatButton')}</label>
            <ToggleSwitch id='floatBtn' checked={settings.floatBtn} onChange={handleChange} />
          </div>
        </section>

        <h2>{t('ai.model')}</h2>
        <section className='settings-section'>
          <div className='form-group form-group-inline'>
            <label htmlFor='aiModel'>{t('ai.serviceProvider')}：</label>
            <SelectBox
              id='aiModel'
              value={settings.aiModel}
              onChange={handleChange}
              options={[
                { value: MODEL_PROVIDERS.OPENAI, label: 'OpenAI' },
                { value: MODEL_PROVIDERS.QWEN, label: t('ai.qwen') },
                { value: MODEL_PROVIDERS.DEEPSEEK, label: 'DeepSeek' },
              ]}
            />
          </div>

          <ModelCard
            id='openai'
            title='OpenAI'
            active={settings.aiModel === MODEL_PROVIDERS.OPENAI}
            settings={settings}
            onChange={handleChange}
            fields={[
              { id: 'openaiModel', label: t('ai.modelName'), placeholder: 'gpt-4o' },
              { id: 'openaiHost', label: t('ai.apiHost'), placeholder: 'https://api.openai.com' },
              {
                id: 'openaiKey',
                label: t('ai.apiKey'),
                placeholder: t('ai.enterApiKey'),
                type: 'password',
              },
            ]}
          />

          <ModelCard
            id='qwen'
            title='qwen'
            active={settings.aiModel === MODEL_PROVIDERS.QWEN}
            settings={settings}
            onChange={handleChange}
            fields={[
              { id: 'qwenModel', label: t('ai.modelName'), placeholder: 'qwen-max' },
              {
                id: 'qwenHost',
                label: t('ai.apiHost'),
                placeholder: 'https://dashscope.aliyuncs.com/compatible-mode/v1',
              },
              {
                id: 'qwenKey',
                label: t('ai.apiKey'),
                placeholder: t('ai.enterApiKey'),
                type: 'password',
              },
            ]}
          />

          <ModelCard
            id='deepseek'
            title='DeepSeek'
            active={settings.aiModel === MODEL_PROVIDERS.DEEPSEEK}
            settings={settings}
            onChange={handleChange}
            fields={[
              { id: 'deepseekModel', label: t('ai.modelName'), placeholder: 'deepseek-chat' },
              {
                id: 'deepseekHost',
                label: t('ai.apiHost'),
                placeholder: 'https://api.deepseek.com',
              },
              {
                id: 'deepseekKey',
                label: t('ai.apiKey'),
                placeholder: t('ai.enterApiKey'),
                type: 'password',
              },
            ]}
          />
        </section>

        <div className='action-buttons'>
          <button id='saveBtn' className='primary-btn block' onClick={handleSave}>
            {t('common.save')}
          </button>
        </div>

        <div className={`notification ${notification.visible ? 'show' : ''} ${notification.type}`}>
          {notification.message}
        </div>
      </div>
    </div>
  )
}

const root = createRoot(document.getElementById('app'))
root.render(
  <StrictMode>
    <OptionsPage />
  </StrictMode>,
)
