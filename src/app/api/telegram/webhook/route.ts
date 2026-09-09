import { NextResponse } from "next/server";
import { Telegraf, Markup } from "telegraf";
import { getOpenAI } from "@/lib/ai/openai";

function cleanQaraqalpaq(text: string) {
    if (!text) return "";
    return text
        .replace(/ý/g, 'y')
        .replace(/Ý/g, 'Y')
        .replace(/ñ/g, 'ń')
        .replace(/Ñ/g, 'Ń')
        .replace(/ў/g, 'w')
        .replace(/Ў/g, 'W')
        .replace(/ğ/g, 'ǵ')
        .replace(/Ğ/g, 'Ǵ')
        .replace(/kompýuter/gi, 'kompyuter')
        .replace(/\bAqıw\b/gi, 'Biyapul')
        .replace(/\b(Iya|Iye|Iá)\b/gi, 'Awa')
        .replace(/(\w+)etin\b/g, '$1etuǵın')
        .replace(/(\w+)atın\b/g, '$1atuǵın')
        .replace(/(\w+)ytin\b/g, '$1ytuǵın')
        .replace(/(\w+)ýtin\b/g, '$1ytuǵın')
        .replace(/(\w+)ytın\b/g, '$1ytuǵın')
        .replace(/\bosı\b/gi, 'usı');
}

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
                 { role: "system", content: "Siz eń sapalı Qaraqalpaq tiliniń jasalma intellekt hám kopirayting ekspertisiz. Tómendegi tekstti Qaraqalpaq tiline eń joqarı dárejede, qızıqlı etip awdarıń yamasa qayta jazıń. ESKERTIW (QATAŃ QAǴIYDALAR): 1. Qazaq hám Ózbek sózlerin qatań qadaǵan etemen! QAZAQSHA: 'osı', 'jańaǵı', 'tüsinbeý', 'isteýtinin', 'ý', 'ñ' háribi qollanılmasın. QARAQALPAQSHA: 'usı', 'isleytuǵının', 'túsinbew', 'w', 'ń' dep qollanıń. 2. '-etin' / '-atın' / '-ýtin' dep emes, '-etuǵın' / '-atuǵın' dep jazıń (mısalı: 'isleýtin' emes 'isleytuǵın', 'bolatın' emes 'bolatuǵın'). 3. 'Iya' emes 'Awa' dep jazıń. 'Awtomatik' emes 'Avtomatik' dep jazıń. 4. IT terminlerin hám modal sózlerdi (mısalı: vibe coding, skill, agent) awdarmań, orıssha/inglisshe qalay bolsa solay qaldırıń. 5. Tómengine avtor atın jazbań. Grammatikaǵa tolıq boysınıń." },
                 { role: "user", content: messageText }
              ],
              temperature: 0.7
           });
           
           let translated = response.choices[0].message.content || "";
           translated = cleanQaraqalpaq(translated);
           translated = translated.replace(/\*\*(.*?)\*\*/g, '<b>$1</b>').replace(/\*(.*?)\*/g, '<i>$1</i>');
                      try {
                await ctx.telegram.deleteMessage(ctx.chat.id, loadingMsg.message_id);
            } catch (_) {}

            const buttons = Markup.inlineKeyboard([
                Markup.button.callback("🚀 Kanalǵa taslaw", "publish_post"),
                Markup.button.callback("❌ Biykar etiw", "cancel_post")
            ]);
            
            if (ctx.message.photo) {
                const fileId = ctx.message.photo[ctx.message.photo.length - 1].file_id;
                if (translated.length <= 1024) {
                    try {
                        await ctx.replyWithPhoto(fileId, {
                            caption: translated,
                            parse_mode: "HTML",
                            ...buttons
                        });
                    } catch (photoHtmlErr) {
                        await ctx.replyWithPhoto(fileId, {
                            caption: translated.replace(/<[^>]*>/g, ''),
                            ...buttons
                        });
                    }
                } else {
                    await ctx.replyWithPhoto(fileId);
                    try {
                        await ctx.reply(translated, {
                            parse_mode: "HTML",
                            ...buttons
                        });
                    } catch (textHtmlErr) {
                        await ctx.reply(translated.replace(/<[^>]*>/g, ''), {
                            ...buttons
                        });
                    }
                }
            } else if (ctx.message.video) {
                const fileId = ctx.message.video.file_id;
                if (translated.length <= 1024) {
                    try {
                        await ctx.replyWithVideo(fileId, {
                            caption: translated,
                            parse_mode: "HTML",
                            ...buttons
                        });
                    } catch (videoHtmlErr) {
                        await ctx.replyWithVideo(fileId, {
                            caption: translated.replace(/<[^>]*>/g, ''),
                            ...buttons
                        });
                    }
                } else {
                    await ctx.replyWithVideo(fileId);
                    try {
                        await ctx.reply(translated, {
                            parse_mode: "HTML",
                            ...buttons
                        });
                    } catch (textHtmlErr) {
                        await ctx.reply(translated.replace(/<[^>]*>/g, ''), {
                            ...buttons
                        });
                    }
                }
            } else {
                try {
                    await ctx.reply(translated, {
                        parse_mode: "HTML",
                        ...buttons
                    });
                } catch (textHtmlErr) {
                    await ctx.reply(translated.replace(/<[^>]*>/g, ''), {
                        ...buttons
                    });
                }
            }
        } catch(e: any) {
            console.error("Message handling error:", e);
            try {
                await ctx.telegram.deleteMessage(ctx.chat.id, loadingMsg.message_id);
            } catch (_) {}
            await ctx.reply("❌ Qátelik júz berdi: " + (e?.message || "Námálim qátelik"));
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
            translated = cleanQaraqalpaq(translated);
            translated = translated.replace(/\*\*(.*?)\*\*/g, '<b>$1</b>').replace(/\*(.*?)\*/g, '<i>$1</i>');
            
            try {
                await ctx.telegram.deleteMessage(ctx.chat.id, loadingMsg.message_id);
            } catch (_) {}
            
            try {
                await ctx.reply(translated, {
                   parse_mode: "HTML",
                   ...Markup.inlineKeyboard([
                       Markup.button.callback("🚀 Kanalǵa taslaw", "publish_post"),
                       Markup.button.callback("❌ Biykar etiw", "cancel_post")
                   ])
                });
            } catch (err) {
                await ctx.reply(translated.replace(/<[^>]*>/g, ''), {
                   ...Markup.inlineKeyboard([
                       Markup.button.callback("🚀 Kanalǵa taslaw", "publish_post"),
                       Markup.button.callback("❌ Biykar etiw", "cancel_post")
                   ])
                });
            }
        } catch(e: any) {
            try {
                await ctx.telegram.deleteMessage(ctx.chat.id, loadingMsg.message_id);
            } catch (_) {}
            await ctx.reply("❌ Qátelik: " + (e?.message || "Námálim qátelik"));
        }
    });

    bot.action("publish_post", async (ctx) => {
       const channelId = process.env.TELEGRAM_CHANNEL_ID;
       if (!channelId) return ctx.answerCbQuery("Kanal ID tappadım");
       
       const cbMsg = ctx.callbackQuery.message as any;
       const text = cbMsg?.text || cbMsg?.caption;
       
       if (text || cbMsg?.photo || cbMsg?.video) {
           const finalCaption = text ? `${text}\n\n🤖 @alibek_embergenov` : '';

           try {
               if (cbMsg?.photo) {
                   const fileId = cbMsg.photo[cbMsg.photo.length - 1].file_id;
                   if (finalCaption.length <= 1024) {
                       try {
                           await ctx.telegram.sendPhoto(channelId, fileId, { caption: finalCaption, parse_mode: "HTML" });
                       } catch (e) {
                           await ctx.telegram.sendPhoto(channelId, fileId, { caption: finalCaption.replace(/<[^>]*>/g, '') });
                       }
                   } else {
                       await ctx.telegram.sendPhoto(channelId, fileId);
                       try {
                           await ctx.telegram.sendMessage(channelId, finalCaption, { parse_mode: "HTML" });
                       } catch (e) {
                           await ctx.telegram.sendMessage(channelId, finalCaption.replace(/<[^>]*>/g, ''));
                       }
                   }
                   try {
                       await ctx.editMessageCaption((text || "") + "\n\n✅ KANALǴA JIBERILDI!");
                   } catch (_) {}
               } else if (cbMsg?.video) {
                   const fileId = cbMsg.video.file_id;
                   if (finalCaption.length <= 1024) {
                       try {
                           await ctx.telegram.sendVideo(channelId, fileId, { caption: finalCaption, parse_mode: "HTML" });
                       } catch (e) {
                           await ctx.telegram.sendVideo(channelId, fileId, { caption: finalCaption.replace(/<[^>]*>/g, '') });
                       }
                   } else {
                       await ctx.telegram.sendVideo(channelId, fileId);
                       try {
                           await ctx.telegram.sendMessage(channelId, finalCaption, { parse_mode: "HTML" });
                       } catch (e) {
                           await ctx.telegram.sendMessage(channelId, finalCaption.replace(/<[^>]*>/g, ''));
                       }
                   }
                   try {
                       await ctx.editMessageCaption((text || "") + "\n\n✅ KANALǴA JIBERILDI!");
                   } catch (_) {}
               } else if (text) {
                   try {
                       await ctx.telegram.sendMessage(channelId, finalCaption, { parse_mode: "HTML" });
                   } catch (e) {
                       await ctx.telegram.sendMessage(channelId, finalCaption.replace(/<[^>]*>/g, ''));
                   }
                   try {
                       await ctx.editMessageText((text || "") + "\n\n✅ KANALǴA JIBERILDI!");
                   } catch (_) {}
               }
               await ctx.answerCbQuery("Kanalǵa tabıslı jiberildi!");
           } catch (pubErr: any) {
               console.error("Publish error:", pubErr);
               await ctx.answerCbQuery("Qátelik: " + (pubErr?.message || ""));
           }
       }
    });
    
    bot.action("cancel_post", async (ctx) => {
       try {
           const cbMsg = ctx.callbackQuery.message as any;
           if (cbMsg?.photo || cbMsg?.video) {
               await ctx.editMessageCaption("❌ Biykar etildi.");
           } else {
               await ctx.editMessageText("❌ Biykar etildi.");
           }
       } catch (_) {}
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



