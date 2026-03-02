import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import { Pool } from 'pg'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
  prismaConnectionString: string | undefined
}

function createPrismaClient() {
  const connectionString = process.env.DATABASE_URL!

  // For Prisma Postgres URLs (prisma+postgres://), extract the actual connection params
  // or use the Pool directly with the connection string
  const pool = new Pool({ connectionString })
  const adapter = new PrismaPg(pool)

  return new PrismaClient({ adapter })
}

// Check if we need to recreate the Prisma client (env changed or not exists)
const currentConnectionString = process.env.DATABASE_URL
const shouldRecreate =
  !globalForPrisma.prisma ||
  globalForPrisma.prismaConnectionString !== currentConnectionString

if (shouldRecreate) {
  globalForPrisma.prisma = createPrismaClient()
  globalForPrisma.prismaConnectionString = currentConnectionString
}

export const prisma = globalForPrisma.prisma!

export default prisma
