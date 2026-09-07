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
    
    // Middleware for force subscription check
    const checkSubscription = async (ctx: any, next: () => Promise<void>) => {
        const channelId = process.env.TELEGRAM_CHANNEL_ID;
        if (!channelId) return next();

        // Skip check for admin
        if (process.env.TELEGRAM_ADMIN_ID && ctx.from?.id.toString() === process.env.TELEGRAM_ADMIN_ID) {
            return next();
        }

        try {
            const member = await ctx.telegram.getChatMember(channelId, ctx.from.id);
            if (['creator', 'administrator', 'member'].includes(member.status)) {
                return next();
            } else {
                await ctx.reply(
                    "Botttan tolıq paydalanıw ushın kanalımızǵa aǵza bolıwıńız kerek! 👇",
                    Markup.inlineKeyboard([
                        [Markup.button.url("Kanalǵa aǵza bolıw", "https://t.me/alibek_embergenov")],
                        [Markup.button.callback("✅ Aǵza boldım", "check_sub")]
                    ])
                );
            }
        } catch (error) {
            console.error("Subscription check error:", error);
            // If bot can't check (e.g. not an admin in channel), allow to pass
            return next();
        }
    };

    bot.action("check_sub", async (ctx: any) => {
        const channelId = process.env.TELEGRAM_CHANNEL_ID;
        if (!channelId) return ctx.answerCbQuery("Kanal sazlanbaǵan.");

        try {
            const member = await ctx.telegram.getChatMember(channelId, ctx.from.id);
            if (['creator', 'administrator', 'member'].includes(member.status)) {
                await ctx.deleteMessage();
                await ctx.reply("Raxmet! Endi bottan tolıq paydalana alasız. \n\nBuyrıqlar:\n/suret <tekst> - AI arqalı suret jasaw\n/soraw <tekst> - AI-den soraw soraw");
                await ctx.answerCbQuery("Aǵzalıq tastıyıqlandı!");
            } else {
                await ctx.answerCbQuery("Siz ele kanalǵa aǵza bolmadıńız!", { show_alert: true });
            }
        } catch (error) {
            await ctx.answerCbQuery("Qátelik júz berdi.");
        }
    });

    bot.start(checkSubscription, (ctx) => {
       if (process.env.TELEGRAM_ADMIN_ID && ctx.from.id.toString() === process.env.TELEGRAM_ADMIN_ID) {
           ctx.reply(`Salawmatasiz ba! Siziń ID'ińiz: ${ctx.from.id}\nProekt adminisiz. Post jaratıw ushın tekst yamasa PDF jiberiń.`);
       } else {
           ctx.reply(`👋 Salawmatasiz ba!\n\nBul bot AI (Jasalma Intellekt) múmkinshiliklerinen paydalanıwǵa járdem beredi.\n\n🎁 **Sizge arnawlı sıylıq: AI tarawındaǵı eń kerekli 5 keńes:**\n1. AI - bul tek sayt emes, ol siziń jeke járdemshińiz. Úyreniwge erinbeń.\n2. Prompt (buyrıq) beriwdi úyreniń: Qansha anıq jazsańız, sonsha jaqsı juwap alasız.\n3. ChatGPT, Claude, hám Gemini-di salıstırıp paydalanıń.\n4. AI arqalı suret yamasa video jaratıw (Kreativlik) keleshektiń eń kerekli kásibi boladı.\n5. @alibek_embergenov kanalın oqıp, jańalıqlardan xabardar bolıń.\n\n🤖 **Bot buyrıqları:**\n/suret <tekst> - AI arqalı suret jasaw\n/soraw <tekst> - AI-ge soraw beriw`);
       }
    });

    bot.command('suret', checkSubscription, async (ctx) => {
        const prompt = ctx.message.text.replace('/suret', '').trim();
        if (!prompt) {
            return ctx.reply("Iltimas, suret qanday bolıwı kerekligin jazıń.\nMısalı: /suret Qaraqalpaqstan tábiyatı, aqshom waqtı");
        }
        const loadingMsg = await ctx.reply("🎨 Suret jaratılmaqta, kútip turıń...");
        try {
            const response = await getOpenAI().chat.completions.create({
                model: "gpt-4o",
                messages: [
                    { role: "system", content: "You are an expert prompt engineer. Translate the user's description (written in Karakalpak or Russian/Uzbek) into a highly detailed English image generation prompt for a text-to-image AI. Make it photorealistic, 8k, detailed." },
                    { role: "user", content: prompt }
                ],
                temperature: 0.7
            });
            const englishPrompt = response.choices[0].message.content || prompt;
            const encodedPrompt = encodeURIComponent(englishPrompt);
            const imageUrl = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=1024&height=1024&nologo=true`;

            await ctx.telegram.deleteMessage(ctx.chat.id, loadingMsg.message_id);
            await ctx.replyWithPhoto(imageUrl, {
                caption: `✨ Jaratılǵan suret\n\n📌 <b>Kanalımız:</b> @alibek_embergenov`,
                parse_mode: 'HTML'
            });
        } catch (error) {
            await ctx.telegram.deleteMessage(ctx.chat.id, loadingMsg.message_id);
            await ctx.reply("❌ Suret jaratıwda qátelik júz berdi.");
        }
    });

    bot.command('soraw', checkSubscription, async (ctx) => {
        const prompt = ctx.message.text.replace('/soraw', '').trim();
        if (!prompt) {
            return ctx.reply("Iltimas, sorawıńızdı jazıń.\nMısalı: /soraw Jasalma intellekt degen ne?");
        }
        const loadingMsg = await ctx.reply("🤔 Oylanıp atırman...");
        try {
            const response = await getOpenAI().chat.completions.create({
                model: "gpt-4o",
                messages: [
                    { role: "system", content: "Siz eń sapalı Qaraqalpaq tilinde juwap beretuǵın aqıllı AI járdemshisiz. Paydalanıwshınıń sorawına tolıq, túsinikli hám paydalı juwap beriń. Qazaq yamasa Ózbek sózlerin qollanbań. Taza Qaraqalpaq tilinde jazıń (usı, -etuǵın, Awa)." },
                    { role: "user", content: prompt }
                ],
                temperature: 0.7
            });
            let replyText = response.choices[0].message.content || "";
            replyText = cleanQaraqalpaq(replyText);

            await ctx.telegram.deleteMessage(ctx.chat.id, loadingMsg.message_id);
            await ctx.reply(replyText + "\n\n🤖 @alibek_embergenov");
        } catch (error) {
            await ctx.telegram.deleteMessage(ctx.chat.id, loadingMsg.message_id);
            await ctx.reply("❌ Juwap tabıwda qátelik júz berdi.");
        }
    });

    bot.on("message", async (ctx: any) => {
       // Ignore documents here since we handle them below
       if (ctx.message.document) return;
       // Ignore explicit bot commands as they are handled above
       if (ctx.message.text?.startsWith('/')) return;

       if (process.env.TELEGRAM_ADMIN_ID && ctx.from.id.toString() !== process.env.TELEGRAM_ADMIN_ID) {
           return ctx.reply("Sizge botqa tuwrıdan-tuwrı xat jazıwǵa ruqsat joq. /soraw yamasa /suret buyrıqlarınan paydalanıń.");
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
            translated = cleanQaraqalpaq(translated);
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



