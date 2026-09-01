"use client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TerminalSquare, AlertCircle, Info, CheckCircle2 } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";

export default function LogsPage() {
  const logs = [
    { time: "2026-08-21 00:45:12", type: "INFO", source: "Telegram", message: "Тестовое сообщение успешно отправлено." },
    { time: "2026-08-21 00:44:05", type: "SUCCESS", source: "Database", message: "SQLite база успешно инициализирована." },
    { time: "2026-08-21 00:39:10", type: "WARNING", source: "Scraper", message: "Не удалось подключиться к одному из RSS источников." },
    { time: "2026-08-21 00:35:22", type: "INFO", source: "Gemini", message: "Сгенерирован новый пост. ID: c1a2b3" },
    { time: "2026-08-21 00:29:10", type: "ERROR", source: "System", message: "Ошибка кодировки в файлах UI (Исправлено)." },
  ];

  return (
    <div className="space-y-6 h-[calc(100vh-6rem)] flex flex-col">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Системные Логи</h1>
        <p className="text-muted-foreground">
          Отслеживайте все фоновые процессы, ошибки и операции.
        </p>
      </div>

      <Card className="flex-1 flex flex-col overflow-hidden">
        <CardHeader className="py-4 border-b bg-muted/20">
          <CardTitle className="flex items-center gap-2 text-sm"><TerminalSquare className="h-5 w-5 text-primary" /> Журнал событий</CardTitle>
        </CardHeader>
        <CardContent className="p-0 flex-1 overflow-hidden">
          <ScrollArea className="h-full">
            <div className="p-4 space-y-3 font-mono text-sm">
              {logs.map((log, i) => (
                <div key={i} className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 pb-3 border-b last:border-0 text-muted-foreground">
                  <span className="shrink-0">{log.time}</span>
                  <div className="shrink-0 w-24">
                    {log.type === "INFO" && <Badge variant="outline" className="text-blue-500 border-blue-500/30 bg-blue-500/10">INFO</Badge>}
                    {log.type === "SUCCESS" && <Badge variant="outline" className="text-green-500 border-green-500/30 bg-green-500/10">SUCCESS</Badge>}
                    {log.type === "WARNING" && <Badge variant="outline" className="text-yellow-500 border-yellow-500/30 bg-yellow-500/10">WARNING</Badge>}
                    {log.type === "ERROR" && <Badge variant="outline" className="text-red-500 border-red-500/30 bg-red-500/10">ERROR</Badge>}
                  </div>
                  <span className="shrink-0 font-bold w-24">{log.source}</span>
                  <span className="text-foreground">{log.message}</span>
                </div>
              ))}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}
