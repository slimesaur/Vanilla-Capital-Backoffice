import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { requireAuth } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    await requireAuth()
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await request.json()
    const results = {
      clients: { imported: 0, skipped: 0 },
      suitabilityForms: { imported: 0, skipped: 0 },
      suitabilityResponses: { imported: 0, skipped: 0 },
      registrationResponses: { imported: 0, skipped: 0 },
    }

    // Import clients
    if (Array.isArray(body.clients)) {
      for (const client of body.clients) {
        const { id, clientType, status, ...data } = client
        try {
          await prisma.client.upsert({
            where: { id: id ?? 'nonexistent' },
            update: { clientType: clientType ?? 'individual', status: status ?? 'approved', data },
            create: { id, clientType: clientType ?? 'individual', status: status ?? 'approved', data },
          })
          results.clients.imported++
        } catch {
          results.clients.skipped++
        }
      }
    }

    // Import suitability forms
    if (Array.isArray(body.suitabilityForms)) {
      for (const form of body.suitabilityForms) {
        try {
          await prisma.suitabilityForm.upsert({
            where: { id: form.id ?? 'nonexistent' },
            update: { questions: form.questions ?? [] },
            create: {
              id: form.id,
              questions: form.questions ?? [],
              createdAt: form.createdAt ? new Date(form.createdAt) : new Date(),
            },
          })
          results.suitabilityForms.imported++
        } catch {
          results.suitabilityForms.skipped++
        }
      }
    }

    // Import suitability responses
    if (Array.isArray(body.suitabilityResponses)) {
      for (const response of body.suitabilityResponses) {
        try {
          await prisma.suitabilityResponse.upsert({
            where: { id: response.id ?? 'nonexistent' },
            update: { answers: response.answers ?? {} },
            create: {
              id: response.id,
              formId: response.formId,
              answers: response.answers ?? {},
              submittedAt: response.submittedAt ? new Date(response.submittedAt) : new Date(),
            },
          })
          results.suitabilityResponses.imported++
        } catch {
          results.suitabilityResponses.skipped++
        }
      }
    }

    // Import registration responses
    if (Array.isArray(body.registrationResponses)) {
      for (const response of body.registrationResponses) {
        try {
          await prisma.registrationResponse.upsert({
            where: { id: response.id ?? 'nonexistent' },
            update: { answers: response.answers ?? {} },
            create: {
              id: response.id,
              formType: response.formType,
              answers: response.answers ?? {},
              approvedClientId: response.approvedClientId ?? null,
              submittedAt: response.submittedAt ? new Date(response.submittedAt) : new Date(),
            },
          })
          results.registrationResponses.imported++
        } catch {
          results.registrationResponses.skipped++
        }
      }
    }

    return NextResponse.json({ ok: true, results })
  } catch {
    return NextResponse.json({ error: 'Migration failed' }, { status: 500 })
  }
}
