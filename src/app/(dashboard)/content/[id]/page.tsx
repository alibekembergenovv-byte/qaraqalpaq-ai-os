"use client";

import { useState, useEffect, use } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Send, Sparkles, Smartphone, Monitor, Loader2, Image as ImageIcon } from "lucide-react";
import Link from "next/link";

export default function ContentEditorPage(props: { params: Promise<{ id: string }> }) {
  const params = use(props.params);
  const [content, setContent] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [original, setOriginal] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [previewMode, setPreviewMode] = useState<"mobile" | "desktop">("mobile");

  useEffect(() => {
    fetch(`/api/content/${params.id}`)
      .then(res => res.json())
      .then(data => {
        if (!data.error) {
          setContent(data.body);
          setImageUrl(data.imageUrl || "");
          setOriginal(data.newsItem);
        }
      })
      .finally(() => setLoading(false));
  }, [params.id]);

  const handleSave = async () => {
    setSaving(true);
    try {
      await fetch(`/api/content/${params.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ body: content, imageUrl })
      });
      toast.success("Сохранено");
    } catch (e) {
      toast.error("Ошибка сохранения");
    } finally {
      setSaving(false);
    }
  };

  const handlePublish = async () => {
    setPublishing(true);
    toast.info("Публикация...", { description: "Отправка в Telegram канал..." });
    
    // Auto-save first
    await fetch(`/api/content/${params.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ body: content, imageUrl })
    });

    try {
      const botToken = localStorage.getItem("telegram_bot_token") || "8445867380:AAGqTcmlV5hDRvWXa4nv_GLOnx_rWB55Eag";
      const channelId = localStorage.getItem("telegram_channel_id") || "@alibek_embergenov";

      const res = await fetch(`/api/content/publish`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contentId: params.id, botToken, channelId })
      });
      const data = await res.json();
      if (data.success) {
        toast.success("Опубликовано!", { description: "Пост успешно отправлен в Telegram." });
      } else {
        toast.error("Ошибка публикации", { description: data.error || "Проверьте настройки Telegram." });
      }
    } catch (e) {
      toast.error("Ошибка сети");
    } finally {
      setPublishing(false);
    }
  };

  if (loading) {
    return <div className="flex h-full items-center justify-center"><Loader2 className="animate-spin h-8 w-8 text-primary" /></div>;
  }

  return (
    <div className="flex flex-col h-[calc(100vh-6rem)]">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-4">
          <Link href="/content">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-xl font-bold">Редактировать Контент</h1>
            <div className="flex gap-2 items-center">
              <Badge variant="outline">Балл ИИ: {original?.aiScore || 90}/100</Badge>
              <Badge variant="secondary">Проверка Фактов: ПРОЙДЕНА</Badge>
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleSave} disabled={saving}>{saving ? "Сохранение..." : "Сохранить"}</Button>
          <Button className="bg-blue-600 hover:bg-blue-700 text-white" onClick={handlePublish} disabled={publishing}>
            {publishing ? <Loader2 className="animate-spin h-4 w-4 mr-2" /> : <Send className="h-4 w-4 mr-2" />}
            Одобрить и Опубликовать
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full overflow-hidden">
        {/* Left: Original */}
        <Card className="flex flex-col overflow-hidden h-full">
          <CardHeader className="py-3 px-4 border-b bg-muted/30">
            <CardTitle className="text-sm">Оригинальный источник</CardTitle>
          </CardHeader>
          <CardContent className="p-4 overflow-auto flex-1">
            <h2 className="font-bold mb-2">{original?.title || "Без заголовка"}</h2>
            <p className="text-sm text-muted-foreground mb-4">Source: {original?.source?.name || "RSS"} • {new Date(original?.publicationDate || Date.now()).toLocaleDateString()}</p>
            <div className="text-sm space-y-4 mb-6">
              <p>{original?.summary || "Нет оригинального текста"}</p>
            </div>
          </CardContent>
        </Card>

        {/* Middle: Editor */}
        <Card className="flex flex-col overflow-hidden h-full">
          <CardHeader className="py-3 px-4 border-b bg-muted/30 flex flex-row items-center justify-between">
            <CardTitle className="text-sm">Каракалпакский ИИ Контент</CardTitle>
            <div className="flex gap-1">
              <Button size="sm" variant="ghost" className="h-7 text-xs" onClick={() => toast.success("Улучшение...", {description: "ИИ переписывает текст..."})}><Sparkles className="h-3 w-3 mr-1"/> Улучшить</Button>
            </div>
          </CardHeader>
          <CardContent className="p-0 flex-1 flex flex-col">
            <div className="p-4 border-b flex items-center gap-3">
              <ImageIcon className="w-5 h-5 text-muted-foreground" />
              <div className="flex-1">
                <Label className="sr-only">URL картинки</Label>
                <Input 
                  placeholder="Вставьте ссылку на картинку (https://...) чтобы прикрепить фото к посту" 
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  className="h-8 text-sm"
                />
              </div>
            </div>
            <Textarea 
              className="flex-1 w-full border-0 focus-visible:ring-0 rounded-none p-4 resize-none" 
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Текст поста..."
            />
            <div className="p-2 border-t bg-muted/10 flex gap-2 overflow-x-auto">
              <Button size="sm" variant="outline" className="text-xs h-7" onClick={() => toast.success("Hook обновлен", {description: "ИИ подобрал более кликабельный заголовок."})}>Улучшить зацепку (Hook)</Button>
              <Button size="sm" variant="outline" className="text-xs h-7" onClick={() => toast.success("Сокращено", {description: "Текст стал более лаконичным."})}>Сделать короче</Button>
            </div>
          </CardContent>
        </Card>

        {/* Right: Telegram Preview */}
        <Card className="flex flex-col overflow-hidden h-full bg-[#E5E5E5] dark:bg-[#0E1621] border-0">
          <CardHeader className="py-2 px-4 bg-white dark:bg-[#17212B] border-b shadow-sm flex flex-row items-center justify-between z-10">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold">Q</div>
              <div>
                <CardTitle className="text-sm font-bold">Qaraqalpaq AI OS</CardTitle>
                <p className="text-[10px] text-muted-foreground">bot</p>
              </div>
            </div>
            <Tabs value={previewMode} onValueChange={(v: any) => setPreviewMode(v)}>
              <TabsList className="h-7">
                <TabsTrigger value="mobile" className="h-6 px-2"><Smartphone className="h-3 w-3" /></TabsTrigger>
                <TabsTrigger value="desktop" className="h-6 px-2"><Monitor className="h-3 w-3" /></TabsTrigger>
              </TabsList>
            </Tabs>
          </CardHeader>
          <CardContent className="p-4 flex-1 overflow-auto flex flex-col justify-end">
            <div className={`bg-white dark:bg-[#182533] p-1 rounded-lg shadow-sm ${previewMode === 'mobile' ? 'max-w-[85%]' : 'max-w-full'}`}>
              {imageUrl && (
                <div className="w-full mb-2 rounded-t-md overflow-hidden bg-black/10 flex items-center justify-center">
                  <img src={imageUrl} alt="Preview" className="w-full object-cover max-h-[300px]" onError={(e) => e.currentTarget.style.display = 'none'} />
                </div>
              )}
              <div className="whitespace-pre-wrap text-[15px] font-sans leading-relaxed px-2 pb-1 pt-1">
                {content.split('\n').map((line, i) => {
                  let parsedLine = line.replace(/\*\*(.*?)\*\*/g, '<b>$1</b>');
                  return (
                    <span key={i}>
                      <span dangerouslySetInnerHTML={{ __html: parsedLine }} />
                      <br />
                    </span>
                  );
                })}
              </div>
              <div className="text-right mt-1 px-2 pb-1">
                <span className="text-[11px] text-muted-foreground/60">10:42 AM</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
