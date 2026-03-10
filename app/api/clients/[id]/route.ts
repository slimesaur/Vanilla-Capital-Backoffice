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

  const client = await prisma.client.findUnique({ where: { id: params.id } })
  if (!client) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  return NextResponse.json({
    id: client.id,
    clientType: client.clientType,
    status: client.status,
    ...(client.data as object),
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
    const { clientType, status, ...updates } = body

    const existing = await prisma.client.findUnique({ where: { id: params.id } })
    if (!existing) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }

    const existingData = existing.data as Record<string, unknown>
    const mergedData = { ...existingData, ...updates }

    const client = await prisma.client.update({
      where: { id: params.id },
      data: {
        ...(clientType && { clientType }),
        ...(status && { status }),
        data: mergedData,
      },
    })

    return NextResponse.json({
      id: client.id,
      clientType: client.clientType,
      status: client.status,
      ...(client.data as object),
    })
  } catch {
    return NextResponse.json({ error: 'Failed to update client' }, { status: 500 })
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await requireAuth()
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    await prisma.client.delete({ where: { id: params.id } })
    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ error: 'Failed to delete client' }, { status: 500 })
  }
}
