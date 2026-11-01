## 2026-11-01 - [N+1 query bottleneck optimization]
**Learning:** Using Prisma's `createMany` with `skipDuplicates: true` is an effective way to avoid N+1 query bottlenecks during batch insertions. However, one must deduplicate the batch payload itself in-memory (using a `Set`) prior to calling `createMany` to prevent insertion failures caused by duplicates within the payload.
**Action:** When performing batch data insertions, prefer `createMany` over a loop of `findUnique` and `create`. Deduplicate the data locally before attempting the database insertion.
