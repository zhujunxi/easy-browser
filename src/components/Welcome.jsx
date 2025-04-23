import { useI18n } from '@hooks/useI18n'
const Welcome = () => {
  const { t } = useI18n()
  return (
    <div class='welcome'>
      <div class='welcome-page'>
        <div class='welcome-title'>
          <span>{t('welcome.title')}</span>👋
        </div>
        <div class='welcome-desc'>{t('welcome.subtitle')}</div>
      </div>
    </div>
  )
}

export default Welcome
