import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { requireAuth } from '@/lib/auth'

export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await requireAuth()
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const response = await prisma.registrationResponse.findUnique({
    where: { id: params.id },
  })

  if (!response) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  return NextResponse.json({
    id: response.id,
    formType: response.formType,
    answers: response.answers,
    submittedAt: response.submittedAt.toISOString(),
    approvedClientId: response.approvedClientId,
  })
}
