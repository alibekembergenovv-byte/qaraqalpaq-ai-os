import { Telegraf, Markup } from "telegraf";

const bot = new Telegraf(process.env.TELEGRAM_BOT_TOKEN || "");
const CHANNEL_ID = process.env.TELEGRAM_CHANNEL_ID || "";
const ADMIN_CHAT_ID = process.env.TELEGRAM_ADMIN_CHAT_ID || ""; // Add this to env for approval mode

export async function publishToChannel(text: string, photoUrl?: string) {
  try {
    if (photoUrl) {
      await bot.telegram.sendPhoto(CHANNEL_ID, photoUrl, {
        caption: text,
        parse_mode: "Markdown",
      });
    } else {
      await bot.telegram.sendMessage(CHANNEL_ID, text, {
        parse_mode: "Markdown",
      });
    }
    return { success: true };
  } catch (error) {
    console.error("Telegram publish error:", error);
    return { success: false, error };
  }
}

export async function sendApprovalRequestToAdmin(contentId: string, title: string, previewText: string, score: number) {
  try {
    if (!ADMIN_CHAT_ID) return;

    const message = `🔔 *New AI Post is Ready*\n\n*Title:* ${title}\n*Score:* ${score}/100\n\n*Preview:*\n${previewText.substring(0, 200)}...`;

    await bot.telegram.sendMessage(
      ADMIN_CHAT_ID,
      message,
      {
        parse_mode: "Markdown",
        ...Markup.inlineKeyboard([
          [
            Markup.button.callback("✅ Approve & Publish", `approve_${contentId}`),
            Markup.button.callback("❌ Reject", `reject_${contentId}`)
          ],
          [
            Markup.button.callback("✏️ Edit in Dashboard", `edit_${contentId}`)
          ]
        ])
      }
    );
    return { success: true };
  } catch (error) {
    console.error("Telegram approval request error:", error);
    return { success: false, error };
  }
}
