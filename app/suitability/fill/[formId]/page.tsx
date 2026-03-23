import FormLayout from '@/components/FormLayout'
import SuitabilityFormFill from '@/views/SuitabilityFormFill'
import { getCompanySettings } from '@/lib/settings'

export const dynamic = 'force-dynamic'

interface Props {
  params: Promise<{ formId: string }>
}

export default async function SuitabilityFillPage({ params }: Props) {
  const { formId } = await params
  const settings = await getCompanySettings()
  return (
    <FormLayout settings={settings}>
      <SuitabilityFormFill formId={formId} />
    </FormLayout>
  )
}
