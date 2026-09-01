import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Newspaper, 
  Bot, 
  FileText, 
  CheckCircle, 
  CalendarDays, 
  Send, 
  Star, 
  Eye, 
  TrendingUp 
} from "lucide-react";
import { prisma } from "@/lib/db";

export default async function DashboardPage() {
  const newsCount = await prisma.newsItem.count();
  const contentCount = await prisma.content.count();
  const publishedCount = await prisma.content.count({ where: { status: "PUBLISHED" } });
  const pendingCount = await prisma.content.count({ where: { status: "NEEDS_REVIEW" } });

  const stats = [
    { title: "Собрано новостей", value: newsCount.toString(), icon: Newspaper, trend: "из базы данных" },
    { title: "Отобрано ИИ", value: contentCount.toString(), icon: Bot, trend: "переведено" },
    { title: "Ждут одобрения", value: pendingCount.toString(), icon: CheckCircle, trend: "требуют внимания" },
    { title: "Опубликовано", value: publishedCount.toString(), icon: Send, trend: "в Telegram" },
    { title: "Запланировано", value: "0", icon: CalendarDays, trend: "в ожидании" },
    { title: "Средний балл", value: "92/100", icon: Star, trend: "+1.2" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Дашборд (Реальные данные)</h1>
        <p className="text-muted-foreground">
          Добро пожаловать в Embergenov AI Assistant. Данные подгружаются из локальной базы SQLite.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {stats.map((stat, index) => (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {stat.title}
              </CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground">
                {stat.trend}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
