"use client";
import { toast } from "sonner";
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Bot, CheckCircle, Clock, CalendarDays, Edit, Loader2 } from "lucide-react";
import Link from "next/link";

const columns = [
  { id: "NEEDS_REVIEW", title: "Требует проверки" },
  { id: "PUBLISHED", title: "Опубликовано" },
];

export default function ContentKanbanPage() {
  const [contents, setContents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchContent = async () => {
    try {
      const res = await fetch("/api/content");
      if (res.ok) {
        const data = await res.json();
        setContents(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContent();
  }, []);

  return (
    <div className="flex flex-col h-[calc(100vh-6rem)]">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Воронка Контента</h1>
          <p className="text-muted-foreground">
            Управляйте сгенерированным ИИ контентом на всех этапах публикации.
          </p>
        </div>
      </div>
      <ScrollArea className="flex-1 w-full whitespace-nowrap rounded-md border bg-muted/20">
        <div className="flex h-full w-max p-4 gap-4">
          {columns.map((column) => {
            const columnItems = contents.filter(c => c.status === column.id);
            return (
            <div key={column.id} className="flex flex-col w-80 flex-shrink-0 bg-muted/30 rounded-lg">
              <div className="p-3 font-semibold flex items-center justify-between border-b">
                <span>{column.title}</span>
                <Badge variant="secondary">{columnItems.length}</Badge>
              </div>
              <ScrollArea className="flex-1 p-3">
                <div className="space-y-3">
                  {loading && <div className="flex justify-center p-4"><Loader2 className="animate-spin h-4 w-4" /></div>}
                  {columnItems.map((content) => (
                    <Card key={content.id} className="cursor-pointer hover:border-primary/50 transition-colors">
                      <CardHeader className="p-3 pb-0">
                        <CardTitle className="text-sm line-clamp-2 leading-tight">{content.title}</CardTitle>
                      </CardHeader>
                      <CardContent className="p-3">
                        <div className="flex justify-between items-center mb-2">
                          <Badge variant="outline" className="text-[10px]">{content.format}</Badge>
                          <span className="text-[10px] text-muted-foreground">{new Date(content.createdAt).toLocaleDateString()}</span>
                        </div>
                        <div className="flex items-center justify-between mt-3">
                          <Link href={`/content/${content.id}`}>
                            <Button size="icon" variant="ghost" className="h-6 w-6"><Edit className="h-3 w-3" /></Button>
                          </Link>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                  {!loading && columnItems.length === 0 && (
                    <div className="text-center p-4 text-sm text-muted-foreground border-2 border-dashed rounded-md">
                      Нет контента
                    </div>
                  )}
                </div>
              </ScrollArea>
            </div>
          )})}
        </div>
      </ScrollArea>
    </div>
  );
}
