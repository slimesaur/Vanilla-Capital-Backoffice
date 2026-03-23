import { NextResponse } from 'next/server'
import { getSessionUser } from '@/lib/auth'

export async function GET() {
  try {
    const user = await getSessionUser()
    // 200 + user: null for guests — avoids 401 "failed" in DevTools and client fetch noise
    if (!user) {
      return NextResponse.json({ user: null })
    }
    return NextResponse.json({ user })
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
