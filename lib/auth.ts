import { cookies } from 'next/headers'
import { prisma } from './db'
import bcrypt from 'bcryptjs'
import crypto from 'crypto'

const SESSION_COOKIE = 'vanilla-session'
const SESSION_TTL_MS = 7 * 24 * 60 * 60 * 1000 // 7 days

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12)
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash)
}

export async function createSession(userId: string): Promise<string> {
  const token = crypto.randomUUID()
  const expiresAt = new Date(Date.now() + SESSION_TTL_MS)

  await prisma.session.create({
    data: { userId, token, expiresAt },
  })

  const cookieStore = await cookies()
  cookieStore.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NEXTAUTH_URL?.startsWith('https://') ?? false,
    sameSite: 'lax',
    path: '/',
    maxAge: SESSION_TTL_MS / 1000,
  })

  return token
}

export async function getSessionUser() {
  const cookieStore = await cookies()
  const token = cookieStore.get(SESSION_COOKIE)?.value
  if (!token) return null

  const session = await prisma.session.findUnique({
    where: { token },
    include: { user: true },
  })

  if (!session || session.expiresAt < new Date()) {
    if (session) {
      await prisma.session.delete({ where: { id: session.id } })
    }
    return null
  }

  // Slide the expiry
  await prisma.session.update({
    where: { id: session.id },
    data: { expiresAt: new Date(Date.now() + SESSION_TTL_MS) },
  })

  return { id: session.user.id, email: session.user.email, name: session.user.name }
}

export async function destroySession() {
  const cookieStore = await cookies()
  const token = cookieStore.get(SESSION_COOKIE)?.value
  if (token) {
    await prisma.session.deleteMany({ where: { token } })
    cookieStore.delete(SESSION_COOKIE)
  }
}

export async function requireAuth() {
  const user = await getSessionUser()
  if (!user) {
    throw new Error('Unauthorized')
  }
  return user
}
