## 2026-10-02 - [N+1 Query Bottleneck Resolved]
**Learning:** In batch scraping jobs, individual findUnique/create operations for duplicates check severely degrade performance due to N+1 database queries.
**Action:** Use Prisma's `createMany` with `skipDuplicates: true` combined with an application-level `Set` to filter duplicates within the batch before insertion to achieve O(1) database write operations.
