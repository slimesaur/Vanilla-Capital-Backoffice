import { NextIntlClientProvider } from 'next-intl'
import { getMessages } from 'next-intl/server'
import LoginPageClient from './LoginPageClient'

export default async function LoginPage() {
  const messages = await getMessages()
  return (
    <NextIntlClientProvider messages={messages}>
      <LoginPageClient />
    </NextIntlClientProvider>
  )
}
