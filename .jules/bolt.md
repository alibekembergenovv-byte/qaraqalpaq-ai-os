## 2024-05-14 - Concurrent Database Queries
**Learning:** Found sequential independent database queries in Next.js Server Components. Next.js does not automatically parallelize `await` calls if they are sequential.
**Action:** Always look for multiple independent `await prisma...` queries in Next.js components and combine them with `Promise.all()` to prevent waterfalls and reduce Time to First Byte (TTFB).
