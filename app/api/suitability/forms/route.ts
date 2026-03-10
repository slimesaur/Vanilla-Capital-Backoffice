import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { requireAuth } from '@/lib/auth'

export async function GET() {
  try {
    await requireAuth()
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const forms = await prisma.suitabilityForm.findMany({ orderBy: { createdAt: 'desc' } })
  const result = forms.map((f) => ({
    id: f.id,
    questions: f.questions,
    createdAt: f.createdAt.toISOString(),
  }))

  return NextResponse.json(result)
}

export async function POST(request: NextRequest) {
  try {
    await requireAuth()
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await request.json()
    const form = await prisma.suitabilityForm.create({
      data: {
        id: body.id ?? undefined,
        questions: body.questions ?? [],
        createdAt: body.createdAt ? new Date(body.createdAt) : undefined,
      },
    })

    return NextResponse.json({
      id: form.id,
      questions: form.questions,
      createdAt: form.createdAt.toISOString(),
    }, { status: 201 })
  } catch {
    return NextResponse.json({ error: 'Failed to create form' }, { status: 500 })
  }
}
