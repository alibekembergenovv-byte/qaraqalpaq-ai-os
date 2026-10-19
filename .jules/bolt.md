## 2023-11-20 - [Prisma N+1 and connection limits]
**Learning:** Using new PrismaClient instances per file depletes connection limits, and looping over findUnique/create causes N+1 DB calls bottleneck. When optimizing with createMany skipDuplicates: true, deduplicate the payload via a Set in memory to prevent insertion failures from within-batch duplicates without fetching existing DB records (which would cause OOM risks).
**Action:** Use global PrismaClient from @/lib/db, use createMany with skipDuplicates, and deduplicate payloads on the application level before batch insertions.
