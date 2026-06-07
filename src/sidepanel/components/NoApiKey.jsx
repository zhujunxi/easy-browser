import { useI18n } from '@hooks/useI18n'
const NoApiKey = () => {
  const { t } = useI18n()
  // Open options page
  const openOptionsPage = () => {
    chrome.runtime.openOptionsPage()
  }

  return (
    <div className='info'>
      <div className='info-content'>
        <span className='info-content-text'>{t('welcome.noApiKey')}</span>
      </div>
      <button className='info-settings-btn' onClick={openOptionsPage}>
        {t('common.settings')}
      </button>
    </div>
  )
}

export default NoApiKey
