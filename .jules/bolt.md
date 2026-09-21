## 2024-05-18 - Next.js Prisma Connection Exhaustion and N+1 Inserts
**Learning:** Instantiating `new PrismaClient()` across different service files causes database connection exhaustion in a Next.js application, especially during hot reloads or frequent invocations. Additionally, looping `findUnique` and `create` operations for batch insertions creates severe N+1 query bottlenecks.
**Action:** Always import the global Prisma singleton instance from `src/lib/db.ts`. Use Prisma's `createMany` with `skipDuplicates: true` for batch insertions to reduce query roundtrips from O(N) to O(1).
