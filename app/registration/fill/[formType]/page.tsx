import FormLayout from '@/components/FormLayout'
import RegistrationFormFill from '@/views/RegistrationFormFill'

interface Props {
  params: { formType: string }
}

export default function RegistrationFillPage({ params }: Props) {
  return (
    <FormLayout>
      <RegistrationFormFill formType={params.formType} />
    </FormLayout>
  )
}
