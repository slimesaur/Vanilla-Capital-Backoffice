'use client'

import { useLanguage } from '../contexts/LanguageContext'

export default function MainPage() {
  const { t } = useLanguage()
  return (
    <div className="h-full w-full overflow-hidden relative">
      <img
        src="/benchmark/002.png"
        alt={t('mainPage.altImage')}
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[110%] h-[110%] object-cover"
      />
    </div>
  )
}
