import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { useState, useEffect } from 'react'
import '@styles/index.scss'
import './options.scss'
import '@styles/shared.scss'

import ConfigManager from '@services/storage'
import { MODEL_PROVIDERS, THEMES, LANGUAGES } from '@services/constants'
import { useTheme } from '@hooks/useTheme'
import { useNotification } from '@hooks/useNotification'
import { useI18n } from '@hooks/useI18n'
import SelectBox from '@components/SelectBox'
import ToggleSwitch from '@components/ToggleSwitch'
import ModelCard from './ModelCard'

// Inject floating button on the options page
import '@/content/components/FloatButton'
import '@/content/style.scss'

const SECTIONS = [
  { key: 'general', icon: '⚙️', labelKey: 'settings.general' },
  { key: 'model', icon: '🤖', labelKey: 'ai.model' },
]

const OptionsPage = () => {
  const [activeSection, setActiveSection] = useState('general')
  const [loaded, setLoaded] = useState(false)
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
        setLoaded(true)
      } catch {
        showNotification(t('common.settingsLoadFailed'), 'error')
        setLoaded(true)
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
    ConfigManager.set({ theme: value })
  }

  const handleLanguageChange = (e) => {
    const value = e.target.value

    setSettings((prevSettings) => ({
      ...prevSettings,
      language: value,
    }))
    setLanguage(value)
    ConfigManager.set({ language: value })
  }

  const handleChange = (e) => {
    const { id, value, type, checked } = e.target
    const newValue = type === 'checkbox' ? checked : value

    setSettings((prev) => ({
      ...prev,
      [id]: newValue,
    }))

    if (id === 'floatBtn') {
      ConfigManager.set({ floatBtn: newValue })
      chrome.runtime.sendMessage({ type: 'settings_updated', floatBtn: newValue })
    }
  }

  const handleSave = async () => {
    try {
      await ConfigManager.set(settings)
      chrome.runtime.sendMessage({ type: 'settings_updated', floatBtn: settings.floatBtn })
      showNotification(t('common.settingsSaved'), 'success')
    } catch (error) {
      showNotification(`${t('common.saveFailed')}: ${error.message}`, 'error')
    }
  }

  return (
    <div className='options-page'>
      <div className='options-layout'>
        <nav className='options-sidebar'>
          <div className='sidebar-title'>
            <img src='../../assets/logo/icon-128.png' alt='logo' />
            <span>Easy Browser</span>
          </div>
          {SECTIONS.map(({ key, icon, labelKey }) => (
            <button
              key={key}
              className={`sidebar-item${activeSection === key ? ' active' : ''}`}
              onClick={() => setActiveSection(key)}
            >
              <span className='sidebar-item-icon'>{icon}</span>
              <span>{t(labelKey)}</span>
            </button>
          ))}
        </nav>

        <main className='options-content'>
          {!loaded ? null : (
            <>
              {activeSection === 'general' && (
                <>
                  <div className='section-header'>
                    <h2>{t('settings.general')}</h2>
                    <p>{t('settings.generalDesc')}</p>
                  </div>
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
                      <ToggleSwitch
                        id='floatBtn'
                        checked={settings.floatBtn}
                        onChange={handleChange}
                      />
                    </div>
                  </section>
                </>
              )}

              {activeSection === 'model' && (
                <>
                  <div className='section-header'>
                    <h2>{t('ai.model')}</h2>
                    <p>{t('ai.modelDesc')}</p>
                  </div>
                  <section className='settings-section'>
                    <div className='form-group form-group-inline'>
                      <label htmlFor='aiModel'>{t('ai.serviceProvider')}</label>
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
                      active={settings.aiModel === MODEL_PROVIDERS.OPENAI}
                      settings={settings}
                      onChange={handleChange}
                      fields={[
                        { id: 'openaiModel', label: t('ai.modelName'), placeholder: 'gpt-4o' },
                        {
                          id: 'openaiHost',
                          label: t('ai.apiHost'),
                          placeholder: 'https://api.openai.com',
                        },
                        {
                          id: 'openaiKey',
                          label: t('ai.apiKey'),
                          placeholder: t('ai.enterApiKey'),
                          type: 'password',
                        },
                      ]}
                    />
                    <ModelCard
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
                      active={settings.aiModel === MODEL_PROVIDERS.DEEPSEEK}
                      settings={settings}
                      onChange={handleChange}
                      fields={[
                        {
                          id: 'deepseekModel',
                          label: t('ai.modelName'),
                          placeholder: 'deepseek-chat',
                        },
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
                    <button className='save-btn' onClick={handleSave}>
                      {t('common.save')}
                    </button>
                  </div>
                </>
              )}
            </>
          )}
        </main>
      </div>

      <div className={`notification ${notification.visible ? 'show' : ''} ${notification.type}`}>
        {notification.message}
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
