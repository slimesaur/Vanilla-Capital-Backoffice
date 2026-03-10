import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { requireAuth } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    await requireAuth()
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const cpf = searchParams.get('cpf')
  const cnpj = searchParams.get('cnpj')

  let clients = await prisma.client.findMany({ orderBy: { createdAt: 'desc' } })

  if (cpf) {
    const digits = cpf.replace(/\D/g, '')
    clients = clients.filter((c) => {
      const data = c.data as Record<string, unknown>
      const clientCpf = String(data.cpf ?? '').replace(/\D/g, '')
      return clientCpf === digits
    })
  }

  if (cnpj) {
    const digits = cnpj.replace(/\D/g, '')
    clients = clients.filter((c) => {
      const data = c.data as Record<string, unknown>
      const clientCnpj = String(data.cnpj ?? '').replace(/\D/g, '')
      return clientCnpj === digits
    })
  }

  const result = clients.map((c) => ({
    id: c.id,
    clientType: c.clientType,
    status: c.status,
    ...(c.data as object),
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
    const { id, clientType, status, ...data } = body

    const client = await prisma.client.create({
      data: {
        id: id ?? undefined,
        clientType: clientType ?? 'individual',
        status: status ?? 'pending_suitability',
        data: data,
      },
    })

    return NextResponse.json({
      id: client.id,
      clientType: client.clientType,
      status: client.status,
      ...(client.data as object),
    }, { status: 201 })
  } catch {
    return NextResponse.json({ error: 'Failed to create client' }, { status: 500 })
  }
}
