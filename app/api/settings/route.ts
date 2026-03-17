import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getSessionUser } from '@/lib/auth'

export async function GET() {
  try {
    const settings = await prisma.companySettings.findFirst({
      include: { teamMembers: { orderBy: { order: 'asc' } } },
    })
    return NextResponse.json({ settings })
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

function toNullableString(v: unknown): string | null {
  if (v === null || v === undefined) return null
  if (typeof v === 'string') return v.trim() || null
  return String(v).trim() || null
}

export async function PUT(request: NextRequest) {
  try {
    const user = await getSessionUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized', code: 'NO_SESSION' }, { status: 401 })
    }

    let body: unknown
    try {
      body = await request.json()
    } catch {
      return NextResponse.json({ error: 'Invalid JSON body', code: 'BAD_JSON' }, { status: 400 })
    }

    const raw = body && typeof body === 'object' ? body as Record<string, unknown> : {}
    const { teamMembers } = raw

    const settingsData = {
      phone: toNullableString(raw.phone),
      email: toNullableString(raw.email),
      address: toNullableString(raw.address),
      whatsapp: toNullableString(raw.whatsapp),
      mission: toNullableString(raw.mission),
    }

    const existing = await prisma.companySettings.findFirst()

    let settings
    if (existing) {
      settings = await prisma.companySettings.update({
        where: { id: existing.id },
        data: settingsData,
        include: { teamMembers: { orderBy: { order: 'asc' } } },
      })
    } else {
      settings = await prisma.companySettings.create({
        data: settingsData,
        include: { teamMembers: { orderBy: { order: 'asc' } } },
      })
    }

    if (Array.isArray(teamMembers)) {
      const existingMemberIds = settings.teamMembers.map((m) => m.id)
      const incomingIds = teamMembers
        .filter((m): m is { id: string } => m && typeof m === 'object' && typeof (m as { id?: unknown }).id === 'string')
        .map((m) => m.id)

      const toDelete = existingMemberIds.filter((id) => !incomingIds.includes(id))
      if (toDelete.length > 0) {
        await prisma.teamMember.deleteMany({ where: { id: { in: toDelete } } })
      }

      for (let i = 0; i < teamMembers.length; i++) {
        const m = teamMembers[i]
        const member = m && typeof m === 'object' ? m as Record<string, unknown> : {}
        const id = typeof member.id === 'string' ? member.id : null
        const photo = typeof member.photo === 'string' ? member.photo : null
        const position = typeof member.position === 'string' ? member.position : null

        if (id && existingMemberIds.includes(id)) {
          await prisma.teamMember.update({
            where: { id },
            data: { photo, position, order: i },
          })
        } else {
          await prisma.teamMember.create({
            data: { photo, position, order: i, settingsId: settings.id },
          })
        }
      }
    }

    const updated = await prisma.companySettings.findFirst({
      include: { teamMembers: { orderBy: { order: 'asc' } } },
    })

    return NextResponse.json({ settings: updated })
  } catch (error) {
    console.error('Settings update error:', error)
    const err = error instanceof Error ? error : new Error('Unknown error')
    const message = process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
    const errCode = 'code' in err ? String((err as { code?: string }).code) : 'UNKNOWN'
    return NextResponse.json({ error: message, code: errCode }, { status: 500 })
  }
}
