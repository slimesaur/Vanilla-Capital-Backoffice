import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  const name = process.env.ADMIN_NAME ?? 'Guilherme Silva'
  const email = process.env.ADMIN_EMAIL ?? 'guilherme@vanillacapital.com.br'
  const password = process.env.ADMIN_PASSWORD ?? '#Vanilla01'

  const passwordHash = await bcrypt.hash(password, 12)

  await prisma.user.upsert({
    where: { email },
    update: { name, passwordHash },
    create: { name, email, passwordHash },
  })

  console.log(`Upserted admin user: ${name} <${email}>`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
