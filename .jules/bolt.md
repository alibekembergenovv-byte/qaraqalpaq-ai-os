## 2023-10-20 - [Initialization]\n**Learning:** Bolt initialized\n**Action:** Starting performance hunt
## 2023-10-20 - [Batch Insertions & Global Prisma Client]
**Learning:** Found N+1 query problem during RSS feed processing. Looping `findUnique` and `create` causes severe bottleneck. Prisma's `createMany` with `skipDuplicates: true` combined with an in-memory `Set` for payload deduplication resolves this effectively. Additionally, instantiating `PrismaClient` in individual services leads to connection exhaustion.
**Action:** Use `createMany` with `skipDuplicates: true` for batch inserts and always import the shared `prisma` singleton from `@/lib/db`.
