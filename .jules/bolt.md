
## 2023-10-30 - [N+1 Bottleneck in RSS News Collection]
**Learning:** Initializing new PrismaClient instances per service risks DB connection pool exhaustion. Using an N+1 loop of `findUnique` and `create` for RSS feed processing creates severe database bottlenecks during scrapes.
**Action:** Always import the global Prisma singleton from `src/lib/db.ts`. When processing large item lists (like RSS feeds), use `Map` or `Set` for in-memory deduplication and `Prisma.createMany({ skipDuplicates: true })` for a single bulk insertion query.
