## 2023-10-26 - Batch Insertion Duplicate Constraint in Prisma
**Learning:** When using Prisma's `createMany` with `skipDuplicates: true`, Prisma throws an error if the batch payload itself contains duplicate items on a unique constraint (like URLs). The `skipDuplicates` only guards against duplicates *already in the database*, not duplicates *within the provided data array*.
**Action:** Always ensure application-level uniqueness first (e.g., using a Map or Set) before executing a batch insert to prevent insertion failures.
