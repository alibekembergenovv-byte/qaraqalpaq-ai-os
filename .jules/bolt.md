## 2024-05-24 - PrismaClient Singleton & Batch Insertion
**Learning:** Found multiple instances of `new PrismaClient()` in `src/lib/services/news-collector.ts` and `src/lib/integrations/scheduler.ts` which could lead to connection exhaustion. Also found an O(N) query pattern in `news-collector.ts` that loops `findUnique` and `create`.
**Action:** Always check if a global singleton exists (like in `src/lib/db.ts`) and use it instead of local instantiations. Use `createMany` with `skipDuplicates: true` and application-level `Set` deduplication for batch insertions to avoid N+1 queries.
