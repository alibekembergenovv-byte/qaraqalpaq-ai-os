## 2024-05-24 - Initial Bolt Journal Entry
**Learning:** Starting performance optimizations.
**Action:** Will read this file before future tasks.

## 2024-05-24 - N+1 and Serial Awaits
**Learning:** Found serial awaits in `src/app/(dashboard)/page.tsx`. `prisma.newsItem.count()`, `prisma.content.count()`, and two more calls run sequentially.
**Action:** Use `Promise.all` to run independent database queries concurrently to reduce page load time.
