## 2026-10-10 - [Prisma N+1 and connection pool exhaustion]
**Learning:** Instantiating `new PrismaClient()` in backend services leads to connection leaks during concurrent scraping, and looping over RSS feed results using `findUnique`/`create` creates significant N+1 latency bottlenecks.
**Action:** Always import the shared instance (`import { prisma } from "@/lib/db"`) and convert repeated Prisma inserts to batched `createMany` with a `skipDuplicates` flag, while validating application-level uniqueness first.
