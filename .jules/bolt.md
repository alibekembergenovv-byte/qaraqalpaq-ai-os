## 2024-05-27 - [Prisma Bulk Insertion Pattern]
**Learning:** When fetching RSS items or looping data for insertion, performing `findUnique` followed by `create` leads to an N+1 query problem. Even with `createMany(skipDuplicates: true)`, the batch array cannot contain duplicates within itself, otherwise Prisma throws an error or silently fails depending on driver behavior.
**Action:** Always deduplicate elements at the application level (using a `Set` or `Map`) before submitting the array payload to `createMany` with `skipDuplicates: true`.
