## 2024-03-24 - [Avoid N+1 with Batch Inserts]
**Learning:** Performing `findUnique` followed by `create` in a loop for database insertions causes severe N+1 query performance bottlenecks. Fetching existing database records into memory to deduplicate is an anti-pattern that risks OOM errors.
**Action:** Always batch database inserts using Prisma's `createMany({ skipDuplicates: true })`. To prevent duplicate key errors from within the batch itself, ensure application-level uniqueness using a `Set` on the current batch payload before inserting.
