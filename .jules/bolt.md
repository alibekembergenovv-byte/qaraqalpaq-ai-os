## 2025-09-27 - [Batch Insert Duplication Handling]
**Learning:** When using Prisma's `createMany` with `skipDuplicates: true`, ensure application-level uniqueness first (e.g., using a Map) to prevent insertion failures caused by duplicates within the batch payload itself.
**Action:** Always deduplicate payloads in memory before passing them to `createMany` with `skipDuplicates: true`.
