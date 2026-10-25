## 2024-10-25 - [Batch DB Inserts]
**Learning:** Using `createMany` with `skipDuplicates: true` and application-level payload deduplication is critical for performance when inserting RSS feed items, otherwise OOM or connection exhaustion can occur from fetching existing records or performing N+1 queries.
**Action:** Always batch inserts using `createMany` and a `Set` for deduplicating the payload URLs instead of executing `findUnique` and `create` inside loops.
