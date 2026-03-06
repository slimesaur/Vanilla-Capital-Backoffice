import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { requireAuth } from '@/lib/auth'

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await requireAuth()
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await request.json()
    const { clientId } = body

    if (!clientId) {
      return NextResponse.json({ error: 'clientId required' }, { status: 400 })
    }

    const response = await prisma.registrationResponse.update({
      where: { id: params.id },
      data: { approvedClientId: clientId },
    })

    return NextResponse.json({
      id: response.id,
      formType: response.formType,
      answers: response.answers,
      submittedAt: response.submittedAt.toISOString(),
      approvedClientId: response.approvedClientId,
    })
  } catch {
    return NextResponse.json({ error: 'Failed to approve response' }, { status: 500 })
  }
}
