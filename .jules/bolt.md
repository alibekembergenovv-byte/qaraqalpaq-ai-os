## 2026-09-19 - Batching RSS Feed Insertion
**Learning:** During RSS feed insertions, looping with `findUnique` and `create` causes significant N+1 queries. Batching operations are critical to maintain efficiency as feed items grow.
**Action:** Always use Prisma's `createMany` with `skipDuplicates: true` for inserting multiple records, such as scraped feed items, to bypass N+1 constraints.
