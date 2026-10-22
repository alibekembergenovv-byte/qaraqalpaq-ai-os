## 2025-02-23 - [Prisma Singleton Pattern]
**Learning:** Instantiating `new PrismaClient()` in individual services (`src/lib/services/news-collector.ts`, `src/lib/integrations/scheduler.ts`) creates multiple DB connections, leading to exhaustion bottlenecks.
**Action:** Always import the shared instance `import { prisma } from "@/lib/db";` rather than instantiating a local PrismaClient.

## 2025-02-23 - [N+1 Query Optimization for Scraping]
**Learning:** Checking for duplicate database entries and inserting items one-by-one via `findUnique` + `create` inside loops (in scrapers like `src/app/api/news/scrape/route.ts` and `src/lib/services/news-collector.ts`) causes severe N+1 query bottlenecks and slows down data insertion.
**Action:** When batching inserts, deduplicate entries first at the application level (e.g. using a `Set` for uniqueness), and then use Prisma's `createMany({ skipDuplicates: true })` to vastly speed up DB operations.