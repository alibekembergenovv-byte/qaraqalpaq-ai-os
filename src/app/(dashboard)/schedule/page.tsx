"use client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CalendarDays, Clock, Play } from "lucide-react";
import { toast } from "sonner";

export default function SchedulePage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Расписание (Cron Jobs)</h1>
          <p className="text-muted-foreground">
            Управляйте автоматическими задачами, которые работают в фоновом режиме.
          </p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Clock className="h-5 w-5 text-primary" /> Парсер Новостей (Scraper)</CardTitle>
            <CardDescription>Сканирует RSS источники и собирает новые статьи.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-sm flex justify-between border-b pb-2">
              <span className="text-muted-foreground">Интервал:</span>
              <span className="font-bold">Каждый 1 час</span>
            </div>
            <div className="text-sm flex justify-between border-b pb-2">
              <span className="text-muted-foreground">Следующий запуск:</span>
              <span className="font-medium text-green-600">Через 14 минут</span>
            </div>
            <Button className="w-full mt-4" variant="outline" onClick={() => toast.success("Запущено", { description: "Парсер начал работу в фоновом режиме." })}>
              <Play className="h-4 w-4 mr-2"/> Запустить принудительно
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><CalendarDays className="h-5 w-5 text-primary" /> Авто-Публикатор (Publisher)</CardTitle>
            <CardDescription>Отправляет одобренные посты в Telegram.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-sm flex justify-between border-b pb-2">
              <span className="text-muted-foreground">Интервал:</span>
              <span className="font-bold">Каждые 30 минут</span>
            </div>
            <div className="text-sm flex justify-between border-b pb-2">
              <span className="text-muted-foreground">Следующий запуск:</span>
              <span className="font-medium text-green-600">Через 5 минут</span>
            </div>
            <Button className="w-full mt-4" variant="outline" onClick={() => toast.success("Запущено", { description: "Поиск запланированных постов..." })}>
              <Play className="h-4 w-4 mr-2"/> Опубликовать сейчас
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
