import FormLayout from '@/components/FormLayout'
import SuitabilityFormFill from '@/views/SuitabilityFormFill'

interface Props {
  params: { formId: string }
}

export default function SuitabilityFillPage({ params }: Props) {
  return (
    <FormLayout>
      <SuitabilityFormFill formId={params.formId} />
    </FormLayout>
  )
}
