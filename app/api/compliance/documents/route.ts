import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getSessionUser } from '@/lib/auth'
import { writeFile, mkdir } from 'fs/promises'
import path from 'path'
import crypto from 'crypto'

const UPLOAD_DIR = path.join(process.cwd(), 'public', 'uploads', 'compliance')

export async function GET() {
  try {
    const docs = await prisma.complianceDocument.findMany()
    const map: Record<string, { filename: string; url: string }> = {}
    for (const doc of docs) {
      map[doc.docKey] = { filename: doc.filename, url: doc.path }
    }
    return NextResponse.json({ documents: map })
  } catch {
    // Public marketing route: never 500 when DB is unavailable (empty map = disabled downloads).
    return NextResponse.json({ documents: {} })
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getSessionUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const formData = await request.formData()
    const file = formData.get('file') as File | null
    const docKey = formData.get('docKey') as string | null

    if (!file || !docKey) {
      return NextResponse.json({ error: 'Missing file or docKey' }, { status: 400 })
    }

    if (file.type !== 'application/pdf') {
      return NextResponse.json({ error: 'Only PDF files are accepted' }, { status: 400 })
    }

    await mkdir(UPLOAD_DIR, { recursive: true })

    const filename = `${docKey}-${crypto.randomUUID()}.pdf`
    const filepath = path.join(UPLOAD_DIR, filename)

    const buffer = Buffer.from(await file.arrayBuffer())
    await writeFile(filepath, buffer)

    const url = `/uploads/compliance/${filename}`

    await prisma.complianceDocument.upsert({
      where: { docKey },
      update: { filename: file.name, path: url },
      create: { docKey, filename: file.name, path: url },
    })

    return NextResponse.json({ url, filename: file.name })
  } catch (error) {
    console.error('Compliance upload error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
