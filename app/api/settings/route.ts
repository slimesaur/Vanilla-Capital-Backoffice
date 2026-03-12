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

export async function PUT(request: NextRequest) {
  try {
    const user = await getSessionUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { phone, email, address, whatsapp, mission, teamMembers } = body

    const existing = await prisma.companySettings.findFirst()

    const settings = await prisma.companySettings.upsert({
      where: { id: existing?.id ?? '00000000-0000-0000-0000-000000000000' },
      update: {
        phone: phone ?? null,
        email: email ?? null,
        address: address ?? null,
        whatsapp: whatsapp ?? null,
        mission: mission ?? null,
      },
      create: {
        phone: phone ?? null,
        email: email ?? null,
        address: address ?? null,
        whatsapp: whatsapp ?? null,
        mission: mission ?? null,
      },
      include: { teamMembers: { orderBy: { order: 'asc' } } },
    })

    if (Array.isArray(teamMembers)) {
      const existingMemberIds = settings.teamMembers.map((m) => m.id)
      const incomingIds = teamMembers.filter((m: any) => m.id).map((m: any) => m.id)

      const toDelete = existingMemberIds.filter((id) => !incomingIds.includes(id))
      if (toDelete.length > 0) {
        await prisma.teamMember.deleteMany({ where: { id: { in: toDelete } } })
      }

      for (let i = 0; i < teamMembers.length; i++) {
        const member = teamMembers[i]
        if (member.id && existingMemberIds.includes(member.id)) {
          await prisma.teamMember.update({
            where: { id: member.id },
            data: {
              photo: member.photo ?? null,
              position: member.position ?? null,
              order: i,
            },
          })
        } else {
          await prisma.teamMember.create({
            data: {
              photo: member.photo ?? null,
              position: member.position ?? null,
              order: i,
              settingsId: settings.id,
            },
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
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
