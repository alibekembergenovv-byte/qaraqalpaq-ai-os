## 2024-05-24 - Parallelize Database Queries in Server Components
**Learning:** Next.js Server Components that perform multiple independent database reads sequentially will cause unnecessary waterfall delays, increasing the overall TTFB (Time to First Byte).
**Action:** Always group independent Prisma queries inside `Promise.all()` to execute them concurrently when fetching data for a Server Component.
