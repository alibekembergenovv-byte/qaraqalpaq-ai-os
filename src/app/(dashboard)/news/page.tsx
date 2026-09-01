"use client";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Loader2, Bot, ExternalLink, RefreshCw } from "lucide-react";
import { useRouter } from "next/navigation";

export default function NewsPage() {
  const [news, setNews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [scraping, setScraping] = useState(false);
  const [generating, setGenerating] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    fetchNews();
  }, []);

  const fetchNews = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/news");
      if (res.ok) {
        const data = await res.json();
        setNews(data);
      }
    } catch (e) {
      toast.error("Ошибка загрузки новостей");
    } finally {
      setLoading(false);
    }
  };

  const handleScrape = async () => {
    setScraping(true);
    toast.info("Сканирование RSS...", { description: "Ищем новые статьи из источников." });
    try {
      const res = await fetch("/api/news/scrape", { method: "POST" });
      const data = await res.json();
      if (data.success) {
        toast.success(`Найдено ${data.added} новых статей`);
        fetchNews();
      } else {
        toast.error("Ошибка сканирования");
      }
    } catch (e) {
      toast.error("Ошибка сети");
    } finally {
      setScraping(false);
    }
  };

  const handleGenerate = async (id: string) => {
    setGenerating(id);
    toast.info("Генерация поста...", { description: "AI переводит и адаптирует текст..." });
    try {
      const res = await fetch("/api/content/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ newsItemId: id })
      });
      const data = await res.json();
      if (data.success) {
        toast.success("Готово!", { description: "Контент успешно сгенерирован." });
        router.push(`/content/${data.contentId}`);
      } else {
        toast.error("Ошибка генерации", { description: data.error });
      }
    } catch (e) {
      toast.error("Ошибка сети");
    } finally {
      setGenerating(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Собранные новости</h1>
          <p className="text-muted-foreground">
            Просматривайте и выбирайте лучшие ИИ-новости для перевода и публикации.
          </p>
        </div>
        <Button variant="secondary" onClick={handleScrape} disabled={scraping}>
          {scraping ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <RefreshCw className="mr-2 h-4 w-4" />}
          Авто-отбор RSS
        </Button>
      </div>

      <div className="border rounded-lg bg-card">
        {loading ? (
          <div className="flex justify-center items-center p-12"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[50%]">Заголовок</TableHead>
                <TableHead>Источник</TableHead>
                <TableHead>Балл ИИ</TableHead>
                <TableHead>Статус</TableHead>
                <TableHead className="text-right">Действия</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {news.map((item, i) => (
                <TableRow key={i}>
                  <TableCell className="font-medium">
                    <div className="flex flex-col">
                      <span>{item.title}</span>
                      <span className="text-xs text-muted-foreground mt-1">{new Date(item.publicationDate).toLocaleDateString()} • {item.author}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-sm">{item.source?.name || "RSS"}</TableCell>
                  <TableCell>
                    <Badge variant={item.aiScore > 85 ? "default" : item.aiScore > 70 ? "secondary" : "outline"}>
                      {item.aiScore} / 100
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{item.status}</Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <a href={item.url} target="_blank" rel="noreferrer">
                        <Button variant="ghost" size="icon">
                          <ExternalLink className="h-4 w-4 text-muted-foreground" />
                        </Button>
                      </a>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => handleGenerate(item.id)}
                        disabled={generating === item.id || item.status !== "NEW"}
                      >
                        {generating === item.id ? <Loader2 className="h-4 w-4 animate-spin text-blue-500" /> : <Bot className="h-4 w-4 text-blue-500" />}
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>
    </div>
  );
}
