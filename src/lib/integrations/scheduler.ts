import cron from "node-cron";
import { PrismaClient } from "@prisma/client";
import { publishToChannel } from "./telegram";

const prisma = new PrismaClient();

// This would run on a dedicated worker in production, 
// but for a monolithic Next.js app we can initialize it in a custom server or instrumentation hook.
export function initScheduler() {
  console.log("Initializing AI Content OS Scheduler...");

  // Every minute: check for scheduled posts
  cron.schedule("* * * * *", async () => {
    try {
      const now = new Date();
      
      const pendingPosts = await prisma.scheduledPost.findMany({
        where: {
          status: "PENDING",
          scheduledAt: {
            lte: now
          }
        },
        include: {
          content: true
        }
      });

      for (const post of pendingPosts) {
        console.log(`Publishing scheduled post: ${post.content.title}`);
        
        // Publish
        const result = await publishToChannel(post.content.body);
        
        if (result.success) {
          // Update status
          await prisma.scheduledPost.update({
            where: { id: post.id },
            data: { status: "PUBLISHED" }
          });
          
          await prisma.content.update({
            where: { id: post.contentId },
            data: { status: "PUBLISHED" }
          });
          
          // Create published post record
          await prisma.publishedPost.create({
            data: {
              contentId: post.contentId,
            }
          });
        }
      }
    } catch (error) {
      console.error("Scheduler error:", error);
    }
  });
}
