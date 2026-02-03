// Database client placeholder
// Prisma setup pending - currently using in-memory stores

// TODO: Once Prisma is properly set up in apps/web:
// 1. Add prisma schema to apps/web/prisma/schema.prisma
// 2. Run: pnpm prisma generate
// 3. Uncomment the code below

/*
import { PrismaClient } from '@prisma/client'

const globalForPrisma = global as unknown as { prisma: PrismaClient }

export const prisma = globalForPrisma.prisma || new PrismaClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

export default prisma
*/

// Placeholder export
export const prisma = null
export default prisma
