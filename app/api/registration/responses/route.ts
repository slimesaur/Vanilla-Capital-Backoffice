import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { requireAuth, getSessionUser } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    await requireAuth()
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const formType = searchParams.get('formType')

  const where = formType ? { formType } : {}
  const responses = await prisma.registrationResponse.findMany({
    where,
    orderBy: { submittedAt: 'desc' },
  })

  const result = responses.map((r) => ({
    id: r.id,
    formType: r.formType,
    answers: r.answers,
    submittedAt: r.submittedAt.toISOString(),
    approvedClientId: r.approvedClientId,
  }))

  return NextResponse.json(result)
}

// Public endpoint: clients submit registration responses without auth
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Allow unauthenticated if this is a public form submission
    const user = await getSessionUser()
    if (!user && body._requireAuth) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const response = await prisma.registrationResponse.create({
      data: {
        id: body.id ?? undefined,
        formType: body.formType,
        answers: body.answers ?? {},
        submittedAt: body.submittedAt ? new Date(body.submittedAt) : undefined,
      },
    })

    return NextResponse.json({
      id: response.id,
      formType: response.formType,
      answers: response.answers,
      submittedAt: response.submittedAt.toISOString(),
      approvedClientId: response.approvedClientId,
    }, { status: 201 })
  } catch {
    return NextResponse.json({ error: 'Failed to submit response' }, { status: 500 })
  }
}
