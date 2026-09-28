## 2024-05-19 - [Prisma Client Instantiation]
**Learning:** Instantiating `new PrismaClient()` directly in services/lib files leads to database connection exhaustion in Next.js applications, especially during development with hot reloading.
**Action:** Always import the shared, cached Prisma client instance from `@/lib/db.ts` instead of creating a new instance.
