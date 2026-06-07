import { useI18n } from '@hooks/useI18n'
const Welcome = () => {
  const { t } = useI18n()
  return (
    <div className='welcome'>
      <div className='welcome-page'>
        <div className='welcome-title'>
          <span>{t('welcome.title')}</span>👋
        </div>
        <div className='welcome-desc'>{t('welcome.subtitle')}</div>
      </div>
    </div>
  )
}

export default Welcome
