## 2024-05-19 - [Parallelize DB queries in Server Components]
**Learning:** Sequential database queries in Server Components can create a significant "waterfall" effect, increasing Total Blocking Time and slowing down rendering. In `src/app/(dashboard)/page.tsx`, four count queries were executed back-to-back.
**Action:** Always group independent, non-dependent database queries (especially `count` or lightweight lookups) inside `Promise.all` in Server Components. This parallelizes the data fetching and bounds the network wait time to the slowest query rather than the sum of all queries.
