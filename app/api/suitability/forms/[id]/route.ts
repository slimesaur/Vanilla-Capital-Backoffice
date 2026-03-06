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

  const form = await prisma.suitabilityForm.findUnique({ where: { id: params.id } })
  if (!form) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  return NextResponse.json({
    id: form.id,
    questions: form.questions,
    createdAt: form.createdAt.toISOString(),
  })
}

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

    const form = await prisma.suitabilityForm.upsert({
      where: { id: params.id },
      update: { questions: body.questions },
      create: {
        id: params.id,
        questions: body.questions ?? [],
      },
    })

    return NextResponse.json({
      id: form.id,
      questions: form.questions,
      createdAt: form.createdAt.toISOString(),
    })
  } catch {
    return NextResponse.json({ error: 'Failed to update form' }, { status: 500 })
  }
}
