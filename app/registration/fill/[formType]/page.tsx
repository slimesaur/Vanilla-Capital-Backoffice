import FormLayout from '@/components/FormLayout'
import RegistrationFormFill from '@/views/RegistrationFormFill'
import { getCompanySettings } from '@/lib/settings'

interface Props {
  params: Promise<{ formType: string }>
}

export default async function RegistrationFillPage({ params }: Props) {
  const { formType } = await params
  const settings = await getCompanySettings()
  return (
    <FormLayout settings={settings}>
      <RegistrationFormFill formType={formType} />
    </FormLayout>
  )
}
