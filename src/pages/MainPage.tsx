import { useLanguage } from '../contexts/LanguageContext'

export default function MainPage() {
  const { t } = useLanguage()
  return (
    <div className="h-full w-full overflow-hidden">
      <img
        src="/benchmark/002.png"
        alt={t('mainPage.altImage')}
        className="w-full h-full object-cover"
      />
    </div>
  )
}
