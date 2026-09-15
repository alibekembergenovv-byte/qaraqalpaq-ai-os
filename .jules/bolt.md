## 2026-09-15 - Prevent Prisma Query Waterfalls in Next.js Server Components
**Learning:** In Next.js Server Components, performing multiple independent `await prisma.*` queries sequentially creates a 'waterfall' effect, significantly delaying page load time. The total wait time becomes the sum of all queries.
**Action:** Use `Promise.all()` to execute independent database queries concurrently when data from one query is not dependent on the result of another.
