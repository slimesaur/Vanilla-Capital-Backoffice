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

  const responses = await prisma.suitabilityResponse.findMany({
    where: { formId: params.id },
    orderBy: { submittedAt: 'desc' },
  })

  const result = responses.map((r) => ({
    id: r.id,
    formId: r.formId,
    answers: r.answers,
    submittedAt: r.submittedAt.toISOString(),
  }))

  return NextResponse.json(result)
}

// Public endpoint: clients submit suitability responses without auth
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()

    const response = await prisma.suitabilityResponse.create({
      data: {
        id: body.id ?? undefined,
        formId: params.id,
        answers: body.answers ?? {},
        submittedAt: body.submittedAt ? new Date(body.submittedAt) : undefined,
      },
    })

    return NextResponse.json({
      id: response.id,
      formId: response.formId,
      answers: response.answers,
      submittedAt: response.submittedAt.toISOString(),
    }, { status: 201 })
  } catch {
    return NextResponse.json({ error: 'Failed to submit response' }, { status: 500 })
  }
}
