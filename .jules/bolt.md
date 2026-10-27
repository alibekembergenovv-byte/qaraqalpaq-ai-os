
## 2026-10-26 - [Database N+1 Batch Insertion Optimization]
**Learning:** In Prisma backend routes that process RSS feeds, using `findUnique` and `create` inside a loop leads to severe N+1 database roundtrips. When switching to batch insertion (`createMany` with `skipDuplicates`), it is essential to also deduplicate the array payload in-memory (using a `Set`) prior to insertion, as duplicate entries within the batch itself can trigger Prisma constraint errors.
**Action:** Always utilize `createMany` with `skipDuplicates: true` and an accompanying in-memory payload deduplication `Set` when inserting batches of scraped data. Also ensure the shared `PrismaClient` singleton from `src/lib/db.ts` is used across all files to prevent connection exhaustion.
