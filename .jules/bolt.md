## 2026-10-12 - N+1 Query in News Collector
**Learning:** The RSS feed ingestion was using a loop to iterate through feed items, calling `findUnique` followed by `create` for every single news item. This is an N+1 query problem that significantly slows down batch jobs. Replacing this with a Map-based application-level deduplication approach combined with a single `prisma.newsItem.createMany({ skipDuplicates: true })` call massively reduces database roundtrips.
**Action:** Always prefer `createMany` with `skipDuplicates: true` and application-level deduplication (via Maps/Sets) for batch database insertions in this project.

## 2026-10-12 - Prisma Connection Exhaustion
**Learning:** Some files (`src/lib/services/news-collector.ts` and `src/lib/integrations/scheduler.ts`) were incorrectly instantiating their own `new PrismaClient()` instead of importing the singleton instance from `src/lib/db.ts`. In a Next.js environment, this pattern leads to rapid connection pool exhaustion.
**Action:** Never instantiate `new PrismaClient()` outside of the designated `src/lib/db.ts` file. Always import the shared `prisma` instance.
