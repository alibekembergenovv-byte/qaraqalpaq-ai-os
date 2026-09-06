import { NextResponse } from "next/server";
import { Telegraf, Markup } from "telegraf";
import { getOpenAI } from "@/lib/ai/openai";
export async function POST(req: Request) {
  try {
    const botToken = process.env.TELEGRAM_BOT_TOKEN;
    if (!botToken) return new NextResponse("Missing bot token", { status: 500 });
    
    const bot = new Telegraf(botToken);
    
    bot.start((ctx) => {
       ctx.reply(`Salawmatasiz ba! Siziń ID'ińiz: ${ctx.from.id}\nProekt admini ekenligińizdi tastıyıqlaw ushın usı ID'di Vercel'ge TELEGRAM_ADMIN_ID dep qosıń.`);
    });

    bot.on("message", async (ctx: any) => {
       // Ignore documents here since we handle them below
       if (ctx.message.document) return;

       if (process.env.TELEGRAM_ADMIN_ID && ctx.from.id.toString() !== process.env.TELEGRAM_ADMIN_ID) {
           return ctx.reply("Sizge ruqsat joq.");
       }
       
       const messageText = ctx.message.text || ctx.message.caption;
       if (!messageText) return ctx.reply("Tekst yamasa PDF jiberiń.");

       const loadingMsg = await ctx.reply("⏳ Awdarılıp atır...");
       
       try {
           const response = await getOpenAI().chat.completions.create({
              model: "gpt-4o",
              messages: [
                 { role: "system", content: "Siz eń sapalı Qaraqalpaq tiliniń jasalma intellekt hám kopirayting ekspertisiz. Tómendegi tekstti Qaraqalpaq tiline eń joqarı dárejede, qızıqlı etip awdarıń yamasa qayta jazıń. ESKERTIW: 1. Ózbek yáki Qazaq tillerindegi sózlerdi aralastırmań! Tek ǵana taza Qaraqalpaq tilinde jazıń. 2. Mısal ushın: 'uchun' emes 'ushın', 'bilan' emes 'menen', 'va' emes 'hám', 'yoki' emes 'yamasa', 'qiling' emes 'qılıń'. 3. Grammatika hám jalǵawlardı durıs qollanıń (-nıń, -niń, -ǵa, -ge). 4. Tábiyiy adam jazǵanday bolsın. 5. Tómengine avtor atın jazbań." },
                 { role: "user", content: messageText }
              ],
              temperature: 0.7
           });
           
           let translated = response.choices[0].message.content || "";
           translated = translated.replace(/\*\*(.*?)\*\*/g, '<b>$1</b>').replace(/\*(.*?)\*/g, '<i>$1</i>');
           
           await ctx.telegram.deleteMessage(ctx.chat.id, loadingMsg.message_id);
           
           await ctx.reply(translated, {
               parse_mode: "HTML",
               ...Markup.inlineKeyboard([
                   Markup.button.callback("🚀 Kanalǵa taslaw", "publish_post"),
                   Markup.button.callback("❌ Biykar etiw", "cancel_post")
               ])
           });
       } catch(e) {
           await ctx.reply("❌ Qátelik júz berdi.");
       }
    });
    
    bot.on("document", async (ctx) => {
        if (process.env.TELEGRAM_ADMIN_ID && ctx.from.id.toString() !== process.env.TELEGRAM_ADMIN_ID) {
           return ctx.reply("Sizge ruqsat joq.");
        }
        
        const doc = ctx.message.document;
        if (doc.mime_type !== "application/pdf") {
            return ctx.reply("Keshirin, tek PDF fayllar qab?l etiledi.");
        }
        
        const loadingMsg = await ctx.reply("? PDF juklenip ham oq?l?p at?r...");
        try {
            const fileLink = await ctx.telegram.getFileLink(doc.file_id);
            const response = await fetch(fileLink.toString());
            const arrayBuffer = await response.arrayBuffer();
            const pdfParse = require("pdf-parse");
            const data = await pdfParse(Buffer.from(arrayBuffer));
            const textContent = data.text.substring(0, 10000); 
            
            const aiResponse = await getOpenAI().chat.completions.create({
              model: "gpt-4o",
              messages: [
                 { role: "system", content: "Siz eń sapalı Qaraqalpaq tiliniń jasalma intellekt hám kopirayting ekspertisiz. Tómendegi PDF tekstinen eń tiykarǵı maǵlıwmatlardı ajıratıp alıp, telegram kanal ushın qızıqlı post jazıń. ESKERTIW: 1. Ózbek yáki Qazaq tillerindegi sózlerdi aralastırmań! Tek ǵana taza Qaraqalpaq tilinde jazıń. 2. Mısal ushın: 'uchun' emes 'ushın', 'bilan' emes 'menen', 'va' emes 'hám', 'yoki' emes 'yamasa', 'qiling' emes 'qılıń'. 3. Grammatika hám jalǵawlardı durıs qollanıń (-nıń, -niń, -ǵa, -ge). 4. Tábiyiy adam jazǵanday bolsın. 5. Tómengine avtor atın jazbań." },
                 { role: "user", content: textContent }
              ],
              temperature: 0.7
            });
            
            let translated = aiResponse.choices[0].message.content || "";
            translated = translated.replace(/\*\*(.*?)\*\*/g, '<b>$1</b>').replace(/\*(.*?)\*/g, '<i>$1</i>');
            
            await ctx.telegram.deleteMessage(ctx.chat.id, loadingMsg.message_id);
            
            await ctx.reply(translated, {
               parse_mode: "HTML",
               ...Markup.inlineKeyboard([
                   Markup.button.callback("?? Kanal?a taslaw", "publish_post"),
                   Markup.button.callback("? Biykar etiw", "cancel_post")
               ])
            });
        } catch(e: any) {
            await ctx.reply("? Qatelik: " + e.message);
        }
    });

    bot.action("publish_post", async (ctx) => {
       const channelId = process.env.TELEGRAM_CHANNEL_ID;
       if (!channelId) return ctx.answerCbQuery("Kanal ID tappad?m");
       
       const cbMsg = ctx.callbackQuery.message as any;
       const text = cbMsg?.text;
       
       if (text) {
           const finalCaption = `${text}\n\n🤖 @alibek_embergenov`;
           await ctx.telegram.sendMessage(channelId, finalCaption, { parse_mode: "HTML" });
           await ctx.editMessageText(text + "\n\n? KANAL?A JIBERILDI!", { parse_mode: "HTML" });
           await ctx.answerCbQuery("Kanal?a tab?sl? jiberildi!");
       }
    });
    
    bot.action("cancel_post", async (ctx) => {
       await ctx.editMessageText("? Biykar etildi.");
       await ctx.answerCbQuery("Biykar etildi");
    });
    
    const body = await req.json();
    await bot.handleUpdate(body);

    return NextResponse.json({ ok: true });
  } catch (error: any) {
    console.error("Webhook error:", error);
    return new NextResponse("Error", { status: 500 });
  }
}

