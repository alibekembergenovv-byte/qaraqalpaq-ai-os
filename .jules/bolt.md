## 2025-02-23 - [Database Connection Pool Exhaustion from Local Prisma Clients]
**Learning:** Found an anti-pattern in the codebase where services instantiating their own `PrismaClient` locally lead to database connection limits being reached and exhausted.
**Action:** Always import the global Prisma singleton instance from `@/lib/db` to guarantee connection pooling constraints.

## 2025-02-23 - [Prisma N+1 Insertion Bottleneck in Services]
**Learning:** Iterating to `findUnique` and `create` individual records causes N+1 queries.
**Action:** Use batched `prisma.model.createMany({ skipDuplicates: true })` while maintaining a Set/Map of records to avoid payload duplicate errors before issuing the insert query.
