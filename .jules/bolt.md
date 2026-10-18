## 2024-05-18 - First Journal Entry\n**Learning:** Need a journal.\n**Action:** Created.

## 2024-10-18 - Batch Prisma Operations & Global Singleton
**Learning:** Found N+1 queries in batch operations (`findUnique` + `create` inside a loop) and instances creating their own `new PrismaClient()` which risks connection exhaustion. Also learned that `createMany` with `skipDuplicates: true` should rely on application-level deduplication of the current payload with a `Set`, but avoid fetching existing DB records into memory.
**Action:** Use `prisma.createMany({ skipDuplicates: true })` after filtering out duplicates from the payload using a `Set`. Always import `prisma` from `src/lib/db.ts` instead of instantiating `new PrismaClient()`.
