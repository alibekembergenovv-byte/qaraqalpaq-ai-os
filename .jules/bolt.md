## 2024-10-24 - Prisma createMany Batch Duplicates Edge Case
**Learning:** When using Prisma's `createMany` with `skipDuplicates: true` to fix N+1 query bottlenecks in feed scraping, the operation can fail or act unpredictably if the batch payload itself contains duplicate unique keys (like URLs from an RSS feed).
**Action:** Always deduplicate the array payload at the application level (using a Set or Map) prior to passing it to Prisma's `createMany`.

## 2024-10-24 - Database Connection Exhaustion
**Learning:** Instantiating `new PrismaClient()` in background services (like `news-collector.ts`) bypasses the Next.js global singleton and can lead to database connection exhaustion during high-frequency scraping.
**Action:** All backend services must import the shared `prisma` instance from `@/lib/db` instead of creating their own.
